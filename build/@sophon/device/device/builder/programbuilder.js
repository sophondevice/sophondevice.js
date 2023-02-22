/** sophon base library */
import { ShaderType } from '../base_types.js';
import { MAX_BINDING_GROUPS, getVertexAttribByName } from '../gpuobject.js';
import { PBReflection } from './reflection.js';
import { setCurrentProgramBuilder, PBShaderExp, getCurrentProgramBuilder, makeConstructor } from './base.js';
import { ASTAddressOf, ASTReferenceOf, ASTStructDefine, ASTShaderExpConstructor, getBuiltinInputStructName, getBuiltinOutputStructName, getBuiltinInputStructInstanceName, getBuiltinOutputStructInstanceName, builtinVariables, ASTDeclareVar, ASTScalar, ASTDiscard, DeclareType, ASTPrimitive, ASTAssignment, ASTLValueScalar, genSamplerName, ASTCallFunction, ASTTouch, ASTLValueDeclare, ASTHash, ASTGlobalScope, ASTFunctionParameter, ASTFunction, ASTScope, ASTReturn, ASTNakedScope, ASTIf, ASTBreak, ASTContinue, ASTRange, ASTDoWhile, ASTWhile } from './ast.js';
import { PBDeviceNotSupport, PBReferenceValueRequired, PBPointerValueRequired, PBParamValueError, PBInternalError, PBParamLengthError, PBParamTypeError, PBTypeCastError, PBValueOutOfRange, PBError, PBNonScopedFunctionCall, PBASTError } from './errors.js';
import { setBuiltinFuncs } from './builtinfunc.js';
import { setConstructors } from './constructors.js';
import { PBStructTypeInfo, typeFrexpResult, typeFrexpResultVec2, typeFrexpResultVec3, typeFrexpResultVec4, PBPrimitiveType, typeBool, typeI32, typeU32, typeF32, PBArrayTypeInfo, typeTex2D, typeTexCube, PBSamplerAccessMode, typeVoid } from './types.js';

const COMPUTE_UNIFORM_NAME = 'ch_compute_block';
const VERTEX_UNIFORM_NAME = 'ch_vertex_block';
const FRAGMENT_UNIFORM_NAME = 'ch_fragment_block';
const SHARED_UNIFORM_NAME = 'ch_shared_block';
const input_prefix = 'ch_input_';
const output_prefix = 'ch_output_';
class ProgramBuilder {
    _device;
    _workgroupSize;
    _scopeStack = [];
    _shaderType = ShaderType.Vertex | ShaderType.Fragment | ShaderType.Compute;
    _deviceType;
    _structInfo;
    _uniforms;
    _globalScope;
    _builtinScope;
    _inputScope;
    _outputScope;
    _inputs;
    _outputs;
    _vertexAttributes;
    _depthRangeCorrection;
    _emulateDepthClamp;
    _lastError;
    _reflection;
    _autoStructureTypeIndex;
    _nameMap;
    constructor(device) {
        this._device = typeof device === 'string' ? null : device;
        this._deviceType = typeof device === 'string' ? device : device.getDeviceType();
        this._workgroupSize = null;
        this._structInfo = {};
        this._uniforms = [];
        this._scopeStack = [];
        this._globalScope = null;
        this._builtinScope = null;
        this._inputScope = null;
        this._outputScope = null;
        this._inputs = [];
        this._outputs = [];
        this._vertexAttributes = [];
        this._depthRangeCorrection = this._deviceType === 'webgpu';
        this._emulateDepthClamp = false;
        this._lastError = null;
        this._reflection = new PBReflection(this);
        this._autoStructureTypeIndex = 0;
        this._nameMap = [];
    }
    get lastError() {
        return this._lastError;
    }
    get shaderType() {
        return this._shaderType;
    }
    get globalScope() {
        return this._globalScope;
    }
    get builtinScope() {
        return this._builtinScope;
    }
    get inputScope() {
        return this._inputScope;
    }
    get outputScope() {
        return this._outputScope;
    }
    get depthRangeCorrection() {
        return this._depthRangeCorrection;
    }
    set depthRangeCorrection(val) {
        this._depthRangeCorrection = !!val;
    }
    get emulateDepthClamp() {
        return this._emulateDepthClamp;
    }
    set emulateDepthClamp(val) {
        if (val && !this.device?.getShaderCaps().supportFragmentDepth) {
            console.error('can not enable depth clamp emulation');
        }
        else {
            this._emulateDepthClamp = !!val;
        }
    }
    get reflection() {
        return this._reflection;
    }
    get device() {
        return this._device;
    }
    reset() {
        this._workgroupSize = null;
        this._structInfo = {};
        this._uniforms = [];
        this._scopeStack = [];
        this._globalScope = null;
        this._builtinScope = null;
        this._inputScope = null;
        this._outputScope = null;
        this._inputs = [];
        this._outputs = [];
        this._vertexAttributes = [];
        this._depthRangeCorrection = this._deviceType === 'webgpu';
        this._reflection = new PBReflection(this);
        this._autoStructureTypeIndex = 0;
        this._nameMap = [];
    }
    queryGlobal(name) {
        return this.reflection.tag(name);
    }
    isVertexShader() {
        return this._shaderType === ShaderType.Vertex;
    }
    isFragmentShader() {
        return this._shaderType === ShaderType.Fragment;
    }
    isComputeShader() {
        return this._shaderType === ShaderType.Compute;
    }
    pushScope(scope) {
        this._scopeStack.unshift(scope);
    }
    popScope() {
        return this._scopeStack.shift();
    }
    currentScope() {
        return this._scopeStack[0];
    }
    buildRender(options) {
        setCurrentProgramBuilder(this);
        this._lastError = null;
        this.defineInternalStructs();
        const ret = this.buildRenderSource(options);
        setCurrentProgramBuilder(null);
        this.reset();
        return ret;
    }
    buildCompute(options) {
        setCurrentProgramBuilder(this);
        this._lastError = null;
        this._workgroupSize = options.workgroupSize;
        this.defineInternalStructs();
        const ret = this.buildComputeSource(options);
        setCurrentProgramBuilder(null);
        this.reset();
        return ret;
    }
    buildRenderProgram(options) {
        const ret = this.buildRender(options);
        return ret ? this._device.createGPUProgram({
            type: 'render',
            label: options.label,
            params: {
                vs: ret[0],
                fs: ret[1],
                bindGroupLayouts: ret[2],
                vertexAttributes: ret[3]
            }
        }) : null;
    }
    buildComputeProgram(options) {
        const ret = this.buildCompute(options);
        return ret ? this._device.createGPUProgram({
            type: 'compute',
            params: {
                source: ret[0],
                bindGroupLayouts: ret[1],
            },
        }) : null;
    }
    getDeviceType() {
        return this._deviceType;
    }
    addressOf(ref) {
        if (this.getDeviceType() !== 'webgpu') {
            throw new PBDeviceNotSupport('pointer shader type');
        }
        if (!ref.$ast.isReference()) {
            throw new PBReferenceValueRequired(ref);
        }
        const exp = new PBShaderExp('', ref.$ast.getType());
        exp.$ast = new ASTAddressOf(ref.$ast);
        return exp;
    }
    referenceOf(ptr) {
        if (this.getDeviceType() !== 'webgpu') {
            throw new PBDeviceNotSupport('pointer shader type');
        }
        if (!ptr.$ast.getType().isPointerType()) {
            throw new PBPointerValueRequired(ptr);
        }
        const ast = new ASTReferenceOf(ptr.$ast);
        const exp = new PBShaderExp('', ast.getType());
        exp.$ast = ast;
        return exp;
    }
    struct(structName, instanceName) {
        let ctor = null;
        for (const st of [ShaderType.Vertex, ShaderType.Fragment, ShaderType.Compute]) {
            if (st & this._shaderType) {
                const structInfo = this._structInfo[st];
                ctor = structInfo?.structs[structName];
                if (ctor) {
                    break;
                }
            }
        }
        if (!ctor) {
            throw new PBParamValueError('struct', 'structName', `Struct type ${structName} not exists`);
        }
        return ctor.call(this, instanceName);
    }
    isIdenticalStruct(a, b) {
        if (a.structName && b.structName && a.structName !== b.structName) {
            return false;
        }
        if (a.structMembers.length !== b.structMembers.length) {
            return false;
        }
        for (let index = 0; index < a.structMembers.length; index++) {
            const val = a.structMembers[index];
            const other = b.structMembers[index];
            if (val.name !== other.name) {
                return false;
            }
            if (val.type.isStructType()) {
                if (!other.type.isStructType()) {
                    return false;
                }
                if (!this.isIdenticalStruct(val.type, other.type)) {
                    return false;
                }
            }
            else if (val.type.typeId !== other.type.typeId) {
                return false;
            }
        }
        return true;
    }
    generateStructureName() {
        return `ch_generated_struct_name${this._autoStructureTypeIndex++}`;
    }
    getVertexAttributes() {
        return this._vertexAttributes;
    }
    defineHiddenStruct(type) {
        for (const shaderType of [ShaderType.Vertex, ShaderType.Fragment, ShaderType.Compute]) {
            let structInfo = this._structInfo[shaderType];
            if (!structInfo) {
                structInfo = { structs: {}, types: [] };
                this._structInfo[shaderType] = structInfo;
            }
            if (structInfo.structs[type.structName]) {
                throw new PBParamValueError('defineStruct', 'structName', `cannot re-define struct '${type.structName}'`);
            }
            structInfo.types.push(new ASTStructDefine(type, true));
        }
    }
    defineStruct(structName, layout, ...args) {
        layout = layout || 'default';
        const structType = new PBStructTypeInfo(structName || '', layout, args.map(arg => {
            if (!arg.$typeinfo.isPrimitiveType() && !arg.$typeinfo.isArrayType() && !arg.$typeinfo.isStructType()) {
                throw new Error(`invalid struct member type: '${arg.$str}'`);
            }
            return {
                name: arg.$str,
                type: arg.$typeinfo
            };
        }));
        for (const shaderType of [ShaderType.Vertex, ShaderType.Fragment, ShaderType.Compute]) {
            let structDef = null;
            let ctor = null;
            const structInfo = this._structInfo[shaderType];
            if (structInfo) {
                if (getCurrentProgramBuilder().shaderType === shaderType && structInfo.structs[structType.structName]) {
                    throw new PBParamValueError('defineStruct', 'structName', `cannot re-define struct '${structType.structName}'`);
                }
                for (const type of structInfo.types) {
                    if (!type.builtin && this.isIdenticalStruct(type.getType(), structType)) {
                        structDef = type;
                        ctor = structInfo.structs[type.getType().structName];
                        break;
                    }
                }
            }
            if (structDef) {
                if (structDef.type.layout !== layout) {
                    throw new Error(`Can not redefine struct ${structDef.type.structName} with different layout`);
                }
                if (shaderType !== getCurrentProgramBuilder().shaderType) {
                    if (!this._structInfo[getCurrentProgramBuilder().shaderType]) {
                        this._structInfo[getCurrentProgramBuilder().shaderType] = { structs: {}, types: [] };
                    }
                    this._structInfo[getCurrentProgramBuilder().shaderType].types.push(structDef);
                    this._structInfo[getCurrentProgramBuilder().shaderType].structs[structDef.getType().structName] = ctor;
                }
                return ctor;
            }
        }
        return this.internalDefineStruct(structName || this.generateStructureName(), layout, this._shaderType, false, ...args);
    }
    defineStructByType(structType) {
        const typeCopy = structType.extends(structType.structName || this.generateStructureName(), []);
        for (const shaderType of [ShaderType.Vertex, ShaderType.Fragment, ShaderType.Compute]) {
            let structDef = null;
            let ctor = null;
            const structInfo = this._structInfo[shaderType];
            if (structInfo) {
                if (getCurrentProgramBuilder().shaderType === shaderType && structInfo.structs[typeCopy.structName]) {
                    throw new PBParamValueError('defineStruct', 'structName', `cannot re-define struct '${typeCopy.structName}'`);
                }
                for (const type of structInfo.types) {
                    if (!type.builtin && this.isIdenticalStruct(type.getType(), typeCopy)) {
                        structDef = type;
                        ctor = structInfo.structs[type.getType().structName];
                        break;
                    }
                }
            }
            if (structDef) {
                if (structDef.type.layout !== typeCopy.layout) {
                    throw new Error(`Can not redefine struct ${structDef.type.structName} with different layout`);
                }
                if (shaderType !== getCurrentProgramBuilder().shaderType) {
                    if (!this._structInfo[getCurrentProgramBuilder().shaderType]) {
                        this._structInfo[getCurrentProgramBuilder().shaderType] = { structs: {}, types: [] };
                    }
                    this._structInfo[getCurrentProgramBuilder().shaderType].types.push(structDef);
                    this._structInfo[getCurrentProgramBuilder().shaderType].structs[structDef.getType().structName] = ctor;
                }
                return ctor;
            }
        }
        return this.internalDefineStructByType(this._shaderType, false, typeCopy);
    }
    internalDefineStruct(structName, layout, shaderTypeMask, builtin, ...args) {
        const structType = new PBStructTypeInfo(structName, layout, args.map(arg => {
            if (!arg.$typeinfo.isPrimitiveType() && !arg.$typeinfo.isArrayType() && !arg.$typeinfo.isStructType()) {
                throw new Error(`invalid struct member type: '${arg.$str}'`);
            }
            return {
                name: arg.$str,
                type: arg.$typeinfo
            };
        }));
        return this.internalDefineStructByType(shaderTypeMask, builtin, structType);
    }
    internalDefineStructByType(shaderTypeMask, builtin, structType) {
        const struct = makeConstructor(function structConstructor(...blockArgs) {
            let e;
            if (blockArgs.length === 1 && typeof blockArgs[0] === 'string') {
                e = new PBShaderExp(blockArgs[0], structType);
            }
            else {
                e = new PBShaderExp('', structType);
                e.$ast = new ASTShaderExpConstructor(e.$typeinfo, blockArgs.map(arg => arg instanceof PBShaderExp ? arg.$ast : arg));
            }
            return e;
        }, structType);
        for (const shaderType of [ShaderType.Vertex, ShaderType.Fragment, ShaderType.Compute]) {
            if (shaderTypeMask & shaderType) {
                let structInfo = this._structInfo[shaderType];
                if (!structInfo) {
                    structInfo = { structs: {}, types: [] };
                    this._structInfo[shaderType] = structInfo;
                }
                if (structInfo.structs[structType.structName]) {
                    throw new PBParamValueError('defineStruct', 'structName', `cannot re-define struct '${structType.structName}'`);
                }
                structInfo.types.push(new ASTStructDefine(structType, builtin));
                structInfo.structs[structType.structName] = struct;
            }
        }
        return struct;
    }
    getFunction(name) {
        return this._globalScope ? this._globalScope.$getFunction(name) : null;
    }
    get structInfo() {
        return this._structInfo[this._shaderType];
    }
    getBlockName(instanceName) {
        return `ch_block_name_${instanceName}`;
    }
    defineBuiltinStruct(shaderType, inOrOut) {
        const structName = inOrOut === 'in' ? getBuiltinInputStructName(shaderType) : getBuiltinOutputStructName(shaderType);
        const instanceName = inOrOut === 'in' ? getBuiltinInputStructInstanceName(shaderType) : getBuiltinOutputStructInstanceName(shaderType);
        const stage = shaderType === ShaderType.Vertex
            ? 'vertex'
            : shaderType === ShaderType.Fragment
                ? 'fragment'
                : 'compute';
        const builtinVars = builtinVariables['webgpu'];
        const args = [];
        const prefix = [];
        for (const k in builtinVars) {
            if (builtinVars[k].stage === stage && builtinVars[k].inOrOut === inOrOut) {
                args.push({ name: builtinVars[k].name, type: builtinVars[k].type });
                prefix.push(`@builtin(${builtinVars[k].semantic}) `);
            }
        }
        const inoutList = inOrOut === 'in' ? this._inputs : this._outputs;
        for (const k of inoutList) {
            if (!(k[1] instanceof ASTDeclareVar)) {
                throw new PBInternalError('defineBuiltinStruct() failed: input/output is not declare var ast node');
            }
            const type = k[1].value.getType();
            if (!type.isPrimitiveType() && !type.isArrayType() && !type.isStructType()) {
                throw new Error(`invalid in/out variable type: '${k[1].value.name}'`);
            }
            args.push({ name: k[1].value.name, type: type });
            prefix.push(`@location(${k[1].value.value.$location}) `);
        }
        if (args.length > 0) {
            const st = this.findStructType(structName, shaderType);
            if (st) {
                st.getType().reset(structName, 'default', args);
                st.prefix = prefix;
                return null;
            }
            else {
                const structType = this.internalDefineStructByType(this._shaderType, false, new PBStructTypeInfo(structName, 'default', args));
                this.findStructType(structName, shaderType).prefix = prefix;
                const structInstance = this.struct(structName, instanceName);
                const structInstanceIN = inOrOut === 'in' ? this.struct(structName, 'ch_app_input') : structInstance;
                return [structType, structInstance, structName, structInstanceIN];
            }
        }
        else {
            return null;
        }
    }
    defineInternalStructs() {
        this.defineHiddenStruct(typeFrexpResult);
        this.defineHiddenStruct(typeFrexpResultVec2);
        this.defineHiddenStruct(typeFrexpResultVec3);
        this.defineHiddenStruct(typeFrexpResultVec4);
    }
    array(...args) {
        if (args.length === 0) {
            throw new PBParamLengthError('array');
        }
        args = args.map(arg => this.normalizeExpValue(arg));
        let typeok = true;
        let type = null;
        let isBool = true;
        let isFloat = true;
        let isInt = true;
        let isUint = true;
        let isComposite = false;
        for (const arg of args) {
            if (arg instanceof PBShaderExp) {
                const argType = arg.$ast.getType();
                if (!argType.isConstructible()) {
                    typeok = false;
                    break;
                }
                if (!type) {
                    type = argType;
                }
                else if (argType.typeId !== type.typeId) {
                    typeok = false;
                }
            }
        }
        if (typeok) {
            if (type && type.isPrimitiveType() && type.isScalarType()) {
                isBool = type.primitiveType === PBPrimitiveType.BOOL;
                isFloat = type.primitiveType === PBPrimitiveType.F32;
                isUint = type.primitiveType === PBPrimitiveType.U32;
                isInt = type.primitiveType === PBPrimitiveType.I32;
            }
            else if (type) {
                isBool = false;
                isFloat = false;
                isUint = false;
                isInt = false;
                isComposite = true;
            }
            for (const arg of args) {
                if (!(arg instanceof PBShaderExp) && isComposite) {
                    typeok = false;
                    break;
                }
                if (typeof arg === 'number') {
                    isBool = false;
                    if ((arg | 0) === arg) {
                        if (arg < 0) {
                            isUint = false;
                            isInt = isInt && (arg >= (0x80000000 >> 0));
                        }
                        else {
                            isUint = isUint && (arg <= 0xFFFFFFFF);
                            isInt = isInt && (arg <= 0x7FFFFFFF);
                        }
                    }
                }
                else if (typeof arg === 'boolean') {
                    isFloat = false;
                    isInt = false;
                    isUint = false;
                }
            }
        }
        if (typeok && !isComposite) {
            if (isBool) {
                type = typeBool;
            }
            else if (isInt) {
                type = typeI32;
            }
            else if (isUint) {
                type = typeU32;
            }
            else if (isFloat) {
                type = typeF32;
            }
            typeok = !!type;
        }
        if (!typeok) {
            throw new PBParamTypeError('array');
        }
        if (!type.isPrimitiveType() && !type.isArrayType() && !type.isStructType()) {
            throw new PBParamTypeError('array');
        }
        const arrayType = new PBArrayTypeInfo(type, args.length);
        const exp = new PBShaderExp('', arrayType);
        exp.$ast = new ASTShaderExpConstructor(arrayType, args.map(arg => {
            if (arg instanceof PBShaderExp) {
                return arg.$ast;
            }
            if (!type.isPrimitiveType() || !type.isScalarType()) {
                throw new PBTypeCastError(arg, typeof arg, type);
            }
            return new ASTScalar(arg, type);
        }));
        return exp;
    }
    discard() {
        this.currentScope().$ast.statements.push(new ASTDiscard());
    }
    tagShaderExp(getter, tagValue) {
        if (typeof tagValue === 'string') {
            this._reflection.tag(tagValue, getter);
        }
        else if (Array.isArray(tagValue)) {
            tagValue.forEach(tag => this.tagShaderExp(getter, tag));
        }
        else {
            for (const k of Object.keys(tagValue)) {
                this.tagShaderExp((scope) => {
                    const value = getter(scope);
                    return value[k];
                }, tagValue[k]);
            }
        }
    }
    in(location, name, variable) {
        if (this._inputs[location]) {
            throw new Error(`input location ${location} already declared`);
        }
        variable.$location = location;
        variable.$declareType = DeclareType.DECLARE_TYPE_IN;
        variable.$inout = 'in';
        this._inputs[location] = [name, new ASTDeclareVar(new ASTPrimitive(variable))];
        Object.defineProperty(this._inputScope, name, {
            get: function () {
                return variable;
            },
            set: function () {
                throw new Error(`cannot assign to readonly variable: ${name}`);
            }
        });
        variable.$tags.forEach(val => this.tagShaderExp(() => variable, val));
    }
    out(location, name, variable) {
        if (this._outputs[location]) {
            throw new Error(`output location ${location} has already been used`);
        }
        variable.$location = location;
        variable.$declareType = DeclareType.DECLARE_TYPE_OUT;
        variable.$inout = 'out';
        this._outputs[location] = [name, new ASTDeclareVar(new ASTPrimitive(variable))];
        Object.defineProperty(this._outputScope, name, {
            get: function () {
                return variable;
            },
            set: function (v) {
                getCurrentProgramBuilder().currentScope().$ast.statements.push(new ASTAssignment(new ASTLValueScalar(variable.$ast), v instanceof PBShaderExp ? v.$ast : v));
            }
        });
    }
    getDefaultSampler(t, comparison) {
        const u = this._uniforms.findIndex(val => val.texture?.exp === t);
        if (u < 0) {
            throw new Error('invalid texture uniform object');
        }
        const samplerType = comparison ? 'comparison' : 'sample';
        if (this._uniforms[u].texture.autoBindSampler && this._uniforms[u].texture.autoBindSampler !== samplerType) {
            throw new Error('multiple sampler not supported');
        }
        this._uniforms[u].texture.autoBindSampler = samplerType;
        if (this._deviceType === 'webgpu') {
            const samplerName = genSamplerName(t.$str, comparison);
            if (!this.globalScope[samplerName]) {
                throw new Error(`failed to find sampler name ${samplerName}`);
            }
            return this.globalScope[samplerName];
        }
        else {
            return null;
        }
    }
    normalizeExpValue(value) {
        if (Array.isArray(value)) {
            const converted = value.map(val => Array.isArray(val) ? this.normalizeExpValue(val) : val);
            return this.array(...converted);
        }
        else {
            return value;
        }
    }
    guessExpValueType(value) {
        const val = this.normalizeExpValue(value);
        if (typeof val === 'boolean') {
            return typeBool;
        }
        else if (typeof val === 'number') {
            if (!Number.isInteger(val)) {
                return typeF32;
            }
            else if (val >= (0x80000000 >> 1) && val <= 0x7FFFFFFF) {
                return typeI32;
            }
            else if (val >= 0 && val <= 0xFFFFFFFF) {
                return typeU32;
            }
            else {
                throw new PBValueOutOfRange(val);
            }
        }
        else if (val instanceof PBShaderExp) {
            return val.$ast?.getType() || val.$typeinfo;
        }
    }
    findStructType(name, shaderType) {
        for (const st of [ShaderType.Vertex, ShaderType.Fragment, ShaderType.Compute]) {
            if (st & shaderType) {
                const structInfo = this._structInfo[st];
                if (structInfo) {
                    for (const t of structInfo.types) {
                        if (t.type.structName === name) {
                            return t;
                        }
                    }
                }
            }
        }
        return null;
    }
    findStructConstructor(name, shaderType) {
        for (const st of [ShaderType.Vertex, ShaderType.Fragment, ShaderType.Compute]) {
            if (st & shaderType) {
                const structInfo = this._structInfo[st];
                if (structInfo && structInfo.structs?.[name]) {
                    return structInfo.structs[name];
                }
            }
        }
        return null;
    }
    buildComputeSource(options) {
        try {
            this._lastError = null;
            this._shaderType = ShaderType.Compute;
            this._scopeStack = [];
            this._globalScope = new PBGlobalScope();
            this._builtinScope = new PBBuiltinScope();
            this._inputs = [];
            this._outputs = [];
            this._inputScope = new PBInputScope();
            this._outputScope = new PBOutputScope();
            this._reflection.clear();
            this.generate(options.compute);
            this.mergeUniformsCompute(this._globalScope);
            this.updateUniformBindings([this._globalScope], [ShaderType.Compute]);
            return [
                this.generateComputeSource(this._globalScope, this._builtinScope),
                this.createBindGroupLayouts(options.label),
            ];
        }
        catch (err) {
            if (err instanceof PBError) {
                this._lastError = err.getMessage(this.getDeviceType());
                console.error(this._lastError);
                return null;
            }
            else if (err instanceof Error) {
                this._lastError = err.toString();
                console.error(this._lastError);
                return null;
            }
            else {
                this._lastError = Object.prototype.toString.call(err);
                console.log(`Error: ${this._lastError}`);
                return null;
            }
        }
    }
    buildRenderSource(options) {
        try {
            this._lastError = null;
            this._shaderType = ShaderType.Vertex;
            this._scopeStack = [];
            this._globalScope = new PBGlobalScope();
            this._builtinScope = new PBBuiltinScope();
            this._inputs = [];
            this._outputs = [];
            this._inputScope = new PBInputScope();
            this._outputScope = new PBOutputScope();
            this._reflection.clear();
            this.generate(options.vertex);
            const vertexScope = this._globalScope;
            const vertexBuiltinScope = this._builtinScope;
            const vertexInputs = this._inputs;
            const vertexOutputs = this._outputs;
            if (this._deviceType === 'webgpu') {
            }
            this._shaderType = ShaderType.Fragment;
            this._scopeStack = [];
            this._globalScope = new PBGlobalScope();
            this._builtinScope = new PBBuiltinScope();
            this._inputs = [];
            this._outputs = [];
            this._inputScope = new PBInputScope();
            this._outputScope = new PBOutputScope();
            this._reflection.clear();
            vertexOutputs.forEach((val, index) => {
                this.in(index, val[0], new PBShaderExp(val[1].value.name, val[1].value.getType()).tag(...val[1].value.value.$tags));
            });
            this.generate(options.fragment);
            const fragScope = this._globalScope;
            const fragBuiltinScope = this._builtinScope;
            const fragInputs = this._inputs;
            const fragOutputs = this._outputs;
            if (this._deviceType === 'webgpu') {
            }
            this.mergeUniforms(vertexScope, fragScope);
            this.updateUniformBindings([vertexScope, fragScope], [ShaderType.Vertex, ShaderType.Fragment]);
            return [
                this.generateRenderSource(ShaderType.Vertex, vertexScope, vertexBuiltinScope, vertexInputs.map(val => val[1]), vertexOutputs.map(val => val[1])),
                this.generateRenderSource(ShaderType.Fragment, fragScope, fragBuiltinScope, fragInputs.map(val => val[1]), fragOutputs.map(val => val[1])),
                this.createBindGroupLayouts(options.label),
                this._vertexAttributes,
            ];
        }
        catch (err) {
            if (err instanceof PBError) {
                this._lastError = err.getMessage(this.getDeviceType());
                console.error(this._lastError);
                return null;
            }
            else if (err instanceof Error) {
                this._lastError = err.toString();
                console.error(this._lastError);
                return null;
            }
            else {
                this._lastError = Object.prototype.toString.call(err);
                console.log(`Error: ${this._lastError}`);
                return null;
            }
        }
    }
    generate(body) {
        this.pushScope(this._globalScope);
        if (this._emulateDepthClamp && this._shaderType === ShaderType.Vertex) {
            this._globalScope.$outputs.clamppedDepth = this.float().tag('CLAMPPED_DEPTH');
        }
        body && body.call(this._globalScope);
        this.popScope();
    }
    generateRenderSource(shaderType, scope, builtinScope, inputs, outputs) {
        const context = {
            type: shaderType,
            mrt: shaderType === ShaderType.Fragment && outputs.length > 1,
            defines: [],
            extensions: new Set(),
            builtins: [...builtinScope.$_usedBuiltins],
            types: this._structInfo[shaderType]?.types || [],
            typeReplacement: new Map(),
            inputs: inputs,
            outputs: outputs,
            global: scope,
            vertexAttributes: this._vertexAttributes,
            workgroupSize: null,
        };
        switch (this._deviceType) {
            case 'webgl':
                for (const u of this._uniforms) {
                    if (u.texture) {
                        const type = u.texture.exp.$ast.getType();
                        if (type.isTextureType() && type.isDepthTexture()) {
                            if (u.texture.autoBindSampler === 'comparison') {
                                throw new PBDeviceNotSupport('depth texture comparison');
                            }
                            if (u.texture.autoBindSampler === 'sample') {
                                if (type.is2DTexture()) {
                                    context.typeReplacement.set(u.texture.exp, typeTex2D);
                                }
                                else if (type.isCubeTexture()) {
                                    context.typeReplacement.set(u.texture.exp, typeTexCube);
                                }
                            }
                        }
                    }
                }
                return scope.$ast.toWebGL('', context);
            case 'webgl2':
                for (const u of this._uniforms) {
                    if (u.texture) {
                        const type = u.texture.exp.$ast.getType();
                        if (type.isTextureType() && type.isDepthTexture() && u.texture.autoBindSampler === 'sample') {
                            if (type.is2DTexture()) {
                                context.typeReplacement.set(u.texture.exp, typeTex2D);
                            }
                            else if (type.isCubeTexture()) {
                                context.typeReplacement.set(u.texture.exp, typeTexCube);
                            }
                        }
                    }
                }
                return scope.$ast.toWebGL2('', context);
            case 'webgpu':
                return scope.$ast.toWGSL('', context);
            default:
                return null;
        }
    }
    generateComputeSource(scope, builtinScope) {
        const context = {
            type: ShaderType.Compute,
            mrt: false,
            defines: [],
            extensions: new Set(),
            builtins: [...builtinScope.$_usedBuiltins],
            types: this._structInfo[ShaderType.Compute]?.types || [],
            typeReplacement: null,
            inputs: [],
            outputs: [],
            global: scope,
            vertexAttributes: [],
            workgroupSize: this._workgroupSize,
        };
        return scope.$ast.toWGSL('', context);
    }
    mergeUniformsCompute(globalScope) {
        const uniformList = [];
        for (let i = 0; i < this._uniforms.length; i++) {
            const u = this._uniforms[i];
            if (u.block && u.block.exp.$declareType === DeclareType.DECLARE_TYPE_UNIFORM) {
                const type = u.block.exp.$ast.getType();
                if (type.isStructType() && type.detail.layout === 'std140') {
                    continue;
                }
                if (!uniformList[u.group]) {
                    uniformList[u.group] = { members: [], uniforms: [] };
                }
                uniformList[u.group].members.push(new PBShaderExp(u.block.exp.$str, u.block.exp.$ast.getType()));
                uniformList[u.group].uniforms.push(i);
            }
        }
        const uniformLists = [uniformList];
        const nameList = [COMPUTE_UNIFORM_NAME];
        const maskList = [ShaderType.Compute];
        for (let i = 0; i < 1; i++) {
            for (const k in uniformLists[i]) {
                if (uniformLists[i][k]?.members.length > 0) {
                    const uname = `${nameList[i]}_${k}`;
                    const t = getCurrentProgramBuilder().internalDefineStruct(this.generateStructureName(), 'std140', maskList[i], false, ...uniformLists[i][k].members);
                    globalScope[uname] = t().uniform(Number(k));
                    const index = this._uniforms.findIndex(val => val.block?.name === uname);
                    this._uniforms[index].mask = maskList[i];
                    let nameMap = this._nameMap[Number(k)];
                    if (!nameMap) {
                        nameMap = {};
                        this._nameMap[Number(k)] = nameMap;
                    }
                    for (let j = uniformLists[i][k].uniforms.length - 1; j >= 0; j--) {
                        const u = uniformLists[i][k].uniforms[j];
                        const exp = this._uniforms[u].block.exp;
                        nameMap[exp.$str] = uname;
                        exp.$str = `${uname}.${exp.$str}`;
                    }
                }
            }
        }
        this._uniforms = this._uniforms.filter(val => {
            if (!val.block || val.block.exp.$declareType !== DeclareType.DECLARE_TYPE_UNIFORM) {
                return true;
            }
            const type = val.block.exp.$ast.getType();
            return type.isTextureType() || type.isSamplerType() || (type.isStructType() && type.detail.layout === 'std140');
        });
    }
    mergeUniforms(globalScopeVertex, globalScopeFragmet) {
        const vertexUniformList = [];
        const fragUniformList = [];
        const sharedUniformList = [];
        for (let i = 0; i < this._uniforms.length; i++) {
            const u = this._uniforms[i];
            if (u.block && u.block.exp.$declareType === DeclareType.DECLARE_TYPE_UNIFORM) {
                const type = u.block.exp.$ast.getType();
                if (type.isStructType() && type.detail.layout === 'std140') {
                    continue;
                }
                const v = !!(u.mask & ShaderType.Vertex);
                const f = !!(u.mask & ShaderType.Fragment);
                if (v && f) {
                    if (!sharedUniformList[u.group]) {
                        sharedUniformList[u.group] = { members: [], uniforms: [] };
                    }
                    sharedUniformList[u.group].members.push(new PBShaderExp(u.block.exp.$str, u.block.exp.$ast.getType()));
                    sharedUniformList[u.group].uniforms.push(i);
                }
                else if (v) {
                    if (!vertexUniformList[u.group]) {
                        vertexUniformList[u.group] = { members: [], uniforms: [] };
                    }
                    vertexUniformList[u.group].members.push(new PBShaderExp(u.block.exp.$str, u.block.exp.$ast.getType()));
                    vertexUniformList[u.group].uniforms.push(i);
                }
                else if (f) {
                    if (!fragUniformList[u.group]) {
                        fragUniformList[u.group] = { members: [], uniforms: [] };
                    }
                    fragUniformList[u.group].members.push(new PBShaderExp(u.block.exp.$str, u.block.exp.$ast.getType()));
                    fragUniformList[u.group].uniforms.push(i);
                }
            }
        }
        const uniformLists = [vertexUniformList, fragUniformList, sharedUniformList];
        const nameList = [VERTEX_UNIFORM_NAME, FRAGMENT_UNIFORM_NAME, SHARED_UNIFORM_NAME];
        const maskList = [ShaderType.Vertex, ShaderType.Fragment, ShaderType.Vertex | ShaderType.Fragment];
        for (let i = 0; i < 3; i++) {
            for (const k in uniformLists[i]) {
                if (uniformLists[i][k]?.members.length > 0) {
                    const uname = `${nameList[i]}_${k}`;
                    const structName = this.generateStructureName();
                    const t = getCurrentProgramBuilder().internalDefineStruct(structName, 'std140', maskList[i], false, ...uniformLists[i][k].members);
                    if (maskList[i] & ShaderType.Vertex) {
                        globalScopeVertex[uname] = t().uniform(Number(k));
                    }
                    if (maskList[i] & ShaderType.Fragment) {
                        globalScopeFragmet[uname] = t().uniform(Number(k));
                    }
                    const index = this._uniforms.findIndex(val => val.block?.name === uname);
                    this._uniforms[index].mask = maskList[i];
                    let nameMap = this._nameMap[Number(k)];
                    if (!nameMap) {
                        nameMap = {};
                        this._nameMap[Number(k)] = nameMap;
                    }
                    for (let j = uniformLists[i][k].uniforms.length - 1; j >= 0; j--) {
                        const u = uniformLists[i][k].uniforms[j];
                        const exp = this._uniforms[u].block.exp;
                        nameMap[exp.$str] = uname;
                        exp.$str = `${uname}.${exp.$str}`;
                    }
                }
            }
        }
        this._uniforms = this._uniforms.filter(val => {
            if (!val.block || val.block.exp.$declareType !== DeclareType.DECLARE_TYPE_UNIFORM) {
                return true;
            }
            const type = val.block.exp.$ast.getType();
            return type.isTextureType() || type.isSamplerType() || (type.isStructType() && type.detail.layout === 'std140');
        });
    }
    updateUniformBindings(scopes, shaderTypes) {
        this._uniforms = this._uniforms.filter(val => !!val.mask);
        const bindings = Array.from({ length: MAX_BINDING_GROUPS }).fill(0);
        for (const u of this._uniforms) {
            u.binding = bindings[u.group]++;
        }
        for (let i = 0; i < scopes.length; i++) {
            const scope = scopes[i];
            const type = shaderTypes[i];
            for (const u of this._uniforms) {
                if (u.mask & type) {
                    const uniforms = scope.$ast.uniforms;
                    const name = u.block ? u.block.name : u.texture ? u.texture.exp.$str : u.sampler.$str;
                    const index = uniforms.findIndex(val => val.value.name === name);
                    if (index < 0) {
                        throw new Error(`updateUniformBindings() failed: unable to find uniform ${name}`);
                    }
                    uniforms[index].binding = u.binding;
                }
            }
        }
    }
    createBindGroupLayouts(label) {
        const layouts = [];
        for (const uniformInfo of this._uniforms) {
            let layout = layouts[uniformInfo.group];
            if (!layout) {
                layout = {
                    label: `${label || 'unknown'}[${uniformInfo.group}]`,
                    entries: []
                };
                if (this._nameMap[uniformInfo.group]) {
                    layout.nameMap = this._nameMap[uniformInfo.group];
                }
                layouts[uniformInfo.group] = layout;
            }
            const entry = {
                binding: uniformInfo.binding,
                visibility: uniformInfo.mask,
                type: null,
                name: '',
            };
            if (uniformInfo.block) {
                entry.type = uniformInfo.block.exp.$typeinfo.clone(this.getBlockName(uniformInfo.block.name));
                entry.buffer = {
                    type: uniformInfo.block.exp.$declareType === DeclareType.DECLARE_TYPE_UNIFORM
                        ? 'uniform'
                        : uniformInfo.block.exp.$ast.writable ? 'storage' : 'read-only-storage',
                    hasDynamicOffset: uniformInfo.block.dynamicOffset,
                    uniformLayout: entry.type.toBufferLayout(0, entry.type.layout),
                };
                entry.name = uniformInfo.block.name;
            }
            else if (uniformInfo.texture) {
                entry.type = uniformInfo.texture.exp.$typeinfo;
                if (!entry.type.isTextureType()) {
                    throw new Error('internal error');
                }
                if (entry.type.isStorageTexture()) {
                    entry.storageTexture = {
                        access: 'write-only',
                        viewDimension: entry.type.is1DTexture() ? '1d' : '2d',
                        format: entry.type.storageTexelFormat,
                    };
                }
                else if (entry.type.isExternalTexture()) {
                    entry.externalTexture = {
                        autoBindSampler: uniformInfo.texture.autoBindSampler ? genSamplerName(uniformInfo.texture.exp.$str, false) : null,
                    };
                }
                else {
                    const sampleType = this._deviceType === 'webgpu' ? uniformInfo.texture.exp.$sampleType : (uniformInfo.texture.autoBindSampler && entry.type.isDepthTexture()) ? 'float' : uniformInfo.texture.exp.$sampleType;
                    let viewDimension;
                    if (entry.type.isArrayTexture()) {
                        viewDimension = entry.type.isCubeTexture() ? 'cube-array' : '2d-array';
                    }
                    else if (entry.type.is3DTexture()) {
                        viewDimension = '3d';
                    }
                    else if (entry.type.isCubeTexture()) {
                        viewDimension = 'cube';
                    }
                    else if (entry.type.is1DTexture()) {
                        viewDimension = '1d';
                    }
                    else {
                        viewDimension = '2d';
                    }
                    entry.texture = {
                        sampleType: sampleType,
                        viewDimension: viewDimension,
                        multisampled: false,
                        autoBindSampler: null,
                        autoBindSamplerComparison: null,
                    };
                    if (this.getDeviceType() === 'webgpu' || uniformInfo.texture.autoBindSampler === 'sample') {
                        entry.texture.autoBindSampler = genSamplerName(uniformInfo.texture.exp.$str, false);
                    }
                    if ((this.getDeviceType() === 'webgpu' && entry.type.isDepthTexture()) || uniformInfo.texture.autoBindSampler === 'comparison') {
                        entry.texture.autoBindSamplerComparison = genSamplerName(uniformInfo.texture.exp.$str, true);
                    }
                }
                entry.name = uniformInfo.texture.exp.$str;
            }
            else if (uniformInfo.sampler) {
                entry.type = uniformInfo.sampler.$typeinfo;
                if (!entry.type.isSamplerType()) {
                    throw new Error('internal error');
                }
                entry.sampler = {
                    type: (entry.type.accessMode === PBSamplerAccessMode.SAMPLE)
                        ? uniformInfo.sampler.$sampleType === 'float' ? 'filtering' : 'non-filtering'
                        : 'comparison'
                };
                entry.name = uniformInfo.sampler.$str;
            }
            else {
                throw new PBInternalError('invalid uniform entry type');
            }
            layout.entries.push(entry);
        }
        for (let i = 0; i < layouts.length; i++) {
            if (!layouts[i]) {
                layouts[i] = {
                    label: `${label || 'unknown'}[${i}]`,
                    entries: []
                };
            }
        }
        return layouts;
    }
    _getFunctionOverload(funcName, args) {
        const thisArgs = args.filter(val => {
            if (val instanceof PBShaderExp) {
                const type = val.$ast.getType();
                if (type.isStructType()
                    && (this._structInfo[this._shaderType]?.types.findIndex(t => t.type.structName === type.structName) < 0)) {
                    return false;
                }
            }
            return true;
        });
        const fn = this.globalScope.$getFunction(funcName);
        return fn ? this._matchFunctionOverloading(fn.overloads, thisArgs) : null;
    }
    _matchFunctionOverloading(overloadings, args) {
        for (const overload of overloadings) {
            if (args.length !== overload.argTypes.length) {
                continue;
            }
            const result = [];
            let matches = true;
            for (let i = 0; i < args.length; i++) {
                const argType = overload.argTypes[i].type;
                const arg = args[i];
                if (typeof arg === 'boolean') {
                    if (!argType.isPrimitiveType() || argType.primitiveType !== PBPrimitiveType.BOOL) {
                        matches = false;
                        break;
                    }
                    result.push(new ASTScalar(arg, typeBool));
                }
                else if (typeof arg === 'number') {
                    if (!argType.isPrimitiveType() || !argType.isScalarType() || argType.scalarType === PBPrimitiveType.BOOL) {
                        matches = false;
                        break;
                    }
                    if (argType.scalarType === PBPrimitiveType.I32) {
                        if (!Number.isInteger(arg) || arg < (0x80000000 >> 0) || arg > 0x7FFFFFFF) {
                            matches = false;
                            break;
                        }
                        result.push(new ASTScalar(arg, typeI32));
                    }
                    else if (argType.scalarType === PBPrimitiveType.U32) {
                        if (!Number.isInteger(arg) || arg < 0 || arg > 0xFFFFFFFF) {
                            matches = false;
                            break;
                        }
                        result.push(new ASTScalar(arg, typeU32));
                    }
                    else {
                        result.push(new ASTScalar(arg, argType));
                    }
                }
                else {
                    if (argType.typeId !== arg.$ast.getType().typeId) {
                        matches = false;
                        break;
                    }
                    result.push(arg.$ast);
                }
            }
            if (matches) {
                return [overload, result];
            }
        }
        return null;
    }
    $callFunction(funcName, args, returnType) {
        if (this.currentScope() === this.globalScope) {
            throw new PBNonScopedFunctionCall(funcName);
        }
        const func = this.getFunction(funcName) || null;
        const exp = new PBShaderExp('', returnType);
        exp.$ast = new ASTCallFunction(funcName, args, returnType, func, getCurrentProgramBuilder().getDeviceType());
        this.currentScope().$ast.statements.push(exp.$ast);
        return exp;
    }
}
class Proxiable {
    proxy;
    constructor() {
        this.proxy = new Proxy(this, {
            get: function (target, prop) {
                return typeof prop === 'string' ? target.$get(prop) : undefined;
            },
            set: function (target, prop, value) {
                return typeof prop === 'string' ? target.$set(prop, value) : false;
            }
        });
        return this.proxy;
    }
    get $thisProxy() {
        return this.proxy;
    }
}
class PBScope extends Proxiable {
    $_variables;
    $_parentScope;
    $_AST;
    $_localScope;
    constructor(astScope, parent) {
        super();
        this.$_parentScope = parent || null;
        this.$_variables = {};
        this.$_AST = astScope;
        this.$_localScope = null;
    }
    get $builder() {
        return getCurrentProgramBuilder();
    }
    get $builtins() {
        return getCurrentProgramBuilder().builtinScope;
    }
    get $inputs() {
        return getCurrentProgramBuilder().inputScope;
    }
    get $outputs() {
        return getCurrentProgramBuilder().outputScope;
    }
    get $parent() {
        return this.$_parentScope;
    }
    get $ast() {
        return this.$_AST;
    }
    set $ast(ast) {
        this.$_AST = ast;
    }
    $getVertexAttrib(loc) {
        return getCurrentProgramBuilder().reflection.attribute(loc);
    }
    get $l() {
        return this.$_getLocalScope();
    }
    get $g() {
        return this.$_getGlobalScope();
    }
    $local(variable, init) {
        const initNonArray = getCurrentProgramBuilder().normalizeExpValue(init);
        variable.$global = this instanceof PBGlobalScope;
        this.$_declare(variable, initNonArray);
    }
    $touch(exp) {
        this.$ast.statements.push(new ASTTouch(exp.$ast));
    }
    $query(name) {
        return getCurrentProgramBuilder().queryGlobal(name);
    }
    $_declareInternal(variable, init) {
        const key = variable.$str;
        if (this.$_variables[key]) {
            throw new Error(`cannot re-declare variable '${key}'`);
        }
        if (!(variable.$ast instanceof ASTPrimitive)) {
            throw new Error(`invalid variable declaration: '${variable.$ast.toString(getCurrentProgramBuilder().getDeviceType())}'`);
        }
        const varType = variable.$typeinfo;
        if (varType.isPointerType()) {
            if (!init) {
                throw new Error(`cannot declare pointer type variable without initialization: '${variable.$str}'`);
            }
            if (!(init instanceof PBShaderExp)) {
                throw new Error(`invalid initialization for pointer type declaration: '${variable.$str}`);
            }
            const initType = init.$ast.getType();
            if (!initType.isPointerType() || varType.pointerType.typeId !== initType.pointerType.typeId) {
                throw new Error(`incompatible pointer type assignment: '${variable.$str}'`);
            }
            variable.$typeinfo = initType;
        }
        this.$_registerVar(variable, key);
        if (init === undefined || init === null) {
            return new ASTDeclareVar(variable.$ast);
        }
        else {
            if (init instanceof PBShaderExp && init.$ast instanceof ASTShaderExpConstructor && init.$ast.args.length === 0) {
                if (init.$ast.getType().typeId !== variable.$ast.getType().typeId) {
                    throw new PBTypeCastError(init, init.$ast.getType(), variable.$ast.getType());
                }
                return new ASTDeclareVar(variable.$ast);
            }
            else {
                return new ASTAssignment(new ASTLValueDeclare(variable.$ast), init instanceof PBShaderExp ? init.$ast : init);
            }
        }
    }
    $_findOrSetUniform(variable) {
        const name = variable.$str;
        const uniformInfo = {
            group: variable.$group,
            binding: 0,
            mask: 0,
        };
        if (variable.$typeinfo.isTextureType()) {
            uniformInfo.texture = {
                autoBindSampler: null,
                exp: variable,
            };
        }
        else if (variable.$typeinfo.isSamplerType()) {
            uniformInfo.sampler = variable;
        }
        else {
            uniformInfo.block = {
                name: name,
                dynamicOffset: false,
                exp: variable,
            };
        }
        let found = false;
        for (const u of getCurrentProgramBuilder()._uniforms) {
            if (u.group !== uniformInfo.group) {
                continue;
            }
            if (uniformInfo.block && u.block && u.block.name === uniformInfo.block.name && u.block.exp.$typeinfo.typeId === uniformInfo.block.exp.$typeinfo.typeId) {
                u.mask |= getCurrentProgramBuilder().shaderType;
                variable = u.block.exp;
                found = true;
                break;
            }
            if (uniformInfo.texture && u.texture && uniformInfo.texture.exp.$str === u.texture.exp.$str && uniformInfo.texture.exp.$typeinfo.typeId === u.texture.exp.$typeinfo.typeId) {
                u.mask |= getCurrentProgramBuilder().shaderType;
                variable = u.texture.exp;
                found = true;
                break;
            }
            if (uniformInfo.sampler && u.sampler && uniformInfo.sampler.$str === u.sampler.$str && uniformInfo.sampler.$typeinfo.typeId === u.sampler.$typeinfo.typeId) {
                u.mask |= getCurrentProgramBuilder().shaderType;
                variable = u.sampler;
                found = true;
                break;
            }
        }
        if (!found) {
            uniformInfo.mask = getCurrentProgramBuilder().shaderType;
            getCurrentProgramBuilder()._uniforms.push(uniformInfo);
        }
        if (uniformInfo.texture
            && !uniformInfo.texture.exp.$typeinfo.isStorageTexture()
            && !uniformInfo.texture.exp.$typeinfo.isExternalTexture()
            && getCurrentProgramBuilder().getDeviceType() === 'webgpu') {
            const isDepth = variable.$typeinfo.isTextureType() && variable.$typeinfo.isDepthTexture();
            const samplerName = genSamplerName(variable.$str, false);
            const samplerExp = getCurrentProgramBuilder().sampler(samplerName).uniform(uniformInfo.group).sampleType(variable.$sampleType);
            samplerExp.$sampleType = variable.$sampleType;
            this.$local(samplerExp);
            if (isDepth) {
                const samplerNameComp = genSamplerName(variable.$str, true);
                const samplerExpComp = getCurrentProgramBuilder().samplerComparison(samplerNameComp).uniform(uniformInfo.group).sampleType(variable.$sampleType);
                this.$local(samplerExpComp);
            }
        }
        return variable;
    }
    $_declare(variable, init) {
        if (this.$_variables[variable.$str]) {
            throw new PBASTError(variable.$ast, 'cannot re-declare variable');
        }
        if (variable.$declareType === DeclareType.DECLARE_TYPE_UNIFORM || variable.$declareType === DeclareType.DECLARE_TYPE_STORAGE) {
            const name = variable.$ast.name;
            if (!(this instanceof PBGlobalScope)) {
                throw new Error(`uniform or storage variables can only be declared within global scope: ${name}`);
            }
            if (variable.$declareType === DeclareType.DECLARE_TYPE_UNIFORM
                && !variable.$typeinfo.isTextureType()
                && !variable.$typeinfo.isSamplerType()
                && (!variable.$typeinfo.isConstructible() || !variable.$typeinfo.isHostSharable())) {
                throw new PBASTError(variable.$ast, `type '${variable.$typeinfo.toTypeName(getCurrentProgramBuilder().getDeviceType())}' cannot be declared in uniform address space`);
            }
            if (variable.$declareType === DeclareType.DECLARE_TYPE_STORAGE) {
                if (getCurrentProgramBuilder().getDeviceType() !== 'webgpu') {
                    throw new PBDeviceNotSupport('storage buffer binding');
                }
                else if (!variable.$typeinfo.isHostSharable()) {
                    throw new PBASTError(variable.$ast, `type '${variable.$typeinfo.toTypeName(getCurrentProgramBuilder().getDeviceType())}' cannot be declared in storage address space`);
                }
            }
            let originalType = null;
            if (variable.$declareType === DeclareType.DECLARE_TYPE_STORAGE && (variable.$typeinfo.isPrimitiveType() || variable.$typeinfo.isArrayType())) {
                originalType = variable.$typeinfo;
                const wrappedStruct = getCurrentProgramBuilder().defineStruct(null, 'default', new PBShaderExp('value', originalType));
                variable.$typeinfo = wrappedStruct().$typeinfo;
            }
            variable = this.$_findOrSetUniform(variable);
            const ast = this.$_declareInternal(variable);
            if (originalType) {
                variable.$ast = new ASTHash(variable.$ast, 'value', originalType);
            }
            ast.group = variable.$group;
            ast.binding = 0;
            ast.blockName = getCurrentProgramBuilder().getBlockName(name);
            const type = variable.$typeinfo;
            if (type.isTextureType() || type.isSamplerType() || variable.$declareType === DeclareType.DECLARE_TYPE_STORAGE || (type.isStructType() && type.detail.layout === 'std140')) {
                this.$ast.uniforms.push(ast);
            }
            variable.$tags.forEach(val => {
                getCurrentProgramBuilder().tagShaderExp(() => variable, val);
            });
        }
        else {
            const ast = this.$_declareInternal(variable, init);
            this.$ast.statements.push(ast);
        }
    }
    $_registerVar(variable, name) {
        const key = name || variable.$str;
        const options = {
            configurable: true,
            get: function () {
                return variable;
            },
            set: function (val) {
                getCurrentProgramBuilder().currentScope().$ast.statements.push(new ASTAssignment(new ASTLValueScalar(variable.$ast), val instanceof PBShaderExp ? val.$ast : val));
            },
        };
        Object.defineProperty(this, key, options);
        this.$_variables[key] = variable;
    }
    $localGet(prop) {
        if (typeof prop === 'string' && (prop[0] === '$' || prop in this)) {
            return this[prop];
        }
        return undefined;
    }
    $localSet(prop, value) {
        if (prop[0] === '$' || prop in this) {
            this[prop] = value;
            return true;
        }
        return false;
    }
    $get(prop) {
        const ret = this.$localGet(prop);
        return ret === undefined && this.$_parentScope ? this.$_parentScope.$thisProxy.$get(prop) : ret;
    }
    $set(prop, value) {
        if (prop[0] === '$') {
            this[prop] = value;
            return true;
        }
        else {
            let scope = this;
            while (scope && !(prop in scope)) {
                scope = scope.$_parentScope;
            }
            if (scope) {
                scope[prop] = value;
                return true;
            }
            else {
                if (this.$l) {
                    this.$l[prop] = value;
                    return true;
                }
            }
        }
        return false;
    }
    $_getLocalScope() {
        if (!this.$_localScope) {
            this.$_localScope = new PBLocalScope(this);
        }
        return this.$_localScope;
    }
    $_getGlobalScope() {
        return this.$builder.globalScope;
    }
}
class PBLocalScope extends PBScope {
    $_scope;
    constructor(scope) {
        super(null, null);
        this.$_scope = scope;
    }
    $get(prop) {
        return prop[0] === '$' ? this[prop] : this.$_scope.$localGet(prop);
    }
    $set(prop, value) {
        if (prop[0] === '$') {
            this[prop] = value;
            return true;
        }
        const val = this.$_scope.$localGet(prop);
        if (val === undefined) {
            const type = getCurrentProgramBuilder().guessExpValueType(value);
            const exp = new PBShaderExp(prop, type);
            if (value instanceof PBShaderExp && !this.$_scope.$parent) {
                exp.$declareType = value.$declareType;
                exp.$group = value.$group;
                exp.$attrib = value.$attrib;
                exp.$sampleType = value.$sampleType;
                exp.$precision = value.$precision;
                exp.tag(...value.$tags);
            }
            this.$_scope.$local(exp, value);
            return true;
        }
        else {
            return this.$_scope.$localSet(prop, value);
        }
    }
    $_getLocalScope() {
        return this;
    }
}
class PBBuiltinScope extends PBScope {
    $_usedBuiltins;
    $_builtinVars;
    constructor() {
        super(null);
        this.$_usedBuiltins = new Set();
        const isWebGPU = getCurrentProgramBuilder().getDeviceType() === 'webgpu';
        if (!isWebGPU) {
            this.$_builtinVars = {};
            const v = builtinVariables[getCurrentProgramBuilder().getDeviceType()];
            for (const k in v) {
                const info = v[k];
                this.$_builtinVars[k] = new PBShaderExp(info.name, info.type);
            }
        }
        const v = builtinVariables[getCurrentProgramBuilder().getDeviceType()];
        const that = this;
        for (const k of Object.keys(v)) {
            Object.defineProperty(this, k, {
                get: function () {
                    return that.$getBuiltinVar(k);
                },
                set: function (v) {
                    if ((typeof v !== 'number') && !(v instanceof PBShaderExp)) {
                        throw new Error(`Invalid output value assignment`);
                    }
                    const exp = that.$getBuiltinVar(k);
                    getCurrentProgramBuilder().currentScope().$ast.statements.push(new ASTAssignment(new ASTLValueScalar(exp.$ast), v instanceof PBShaderExp ? v.$ast : v));
                },
            });
        }
    }
    $_getLocalScope() {
        return null;
    }
    $getBuiltinVar(name) {
        this.$_usedBuiltins.add(name);
        const isWebGPU = getCurrentProgramBuilder().getDeviceType() === 'webgpu';
        if (isWebGPU) {
            const v = builtinVariables[getCurrentProgramBuilder().getDeviceType()];
            const info = v[name];
            const inout = info.inOrOut;
            const structName = inout === 'in' ? getBuiltinInputStructInstanceName(getCurrentProgramBuilder().shaderType) : getBuiltinOutputStructInstanceName(getCurrentProgramBuilder().shaderType);
            const scope = getCurrentProgramBuilder().currentScope();
            if (!scope[structName] || !scope[structName][info.name]) {
                throw new Error(`invalid use of builtin variable ${name}`);
            }
            return scope[structName][info.name];
        }
        else {
            return this.$_builtinVars[name];
        }
    }
}
class PBInputScope extends PBScope {
    constructor() {
        super(null);
    }
    $_getLocalScope() {
        return null;
    }
    $set(prop, value) {
        if (prop[0] === '$') {
            this[prop] = value;
        }
        else if (prop in this) {
            throw new Error(`Can not assign to shader input variable: "${prop}"`);
        }
        else {
            const st = getCurrentProgramBuilder().shaderType;
            if (st !== ShaderType.Vertex) {
                throw new Error(`shader input variables can only be declared in vertex shader: "${prop}"`);
            }
            const attrib = getVertexAttribByName(value.$attrib);
            if (attrib === undefined) {
                throw new Error(`can not declare shader input variable: invalid vertex attribute: "${prop}"`);
            }
            if (getCurrentProgramBuilder()._vertexAttributes.indexOf(attrib) >= 0) {
                throw new Error(`can not declare shader input variable: attribute already declared: "${prop}"`);
            }
            if (!(value instanceof PBShaderExp) || !(value.$ast instanceof ASTShaderExpConstructor)) {
                throw new Error(`invalid shader input variable declaration: "${prop}"`);
            }
            const type = value.$ast.getType();
            if (!type.isPrimitiveType() || type.isMatrixType() || type.primitiveType === PBPrimitiveType.BOOL) {
                throw new Error(`type cannot be used as pipeline input/output: ${prop}`);
            }
            const location = getCurrentProgramBuilder()._inputs.length;
            const exp = new PBShaderExp(`${input_prefix}${prop}`, type).tag(...value.$tags);
            getCurrentProgramBuilder().in(location, prop, exp);
            getCurrentProgramBuilder()._vertexAttributes.push(attrib);
            getCurrentProgramBuilder().reflection.setAttrib(attrib, exp);
            if (getCurrentProgramBuilder().getDeviceType() === 'webgpu') {
                if (getCurrentProgramBuilder().findStructType(getBuiltinInputStructName(st), st)) {
                    getCurrentProgramBuilder().defineBuiltinStruct(st, 'in');
                }
            }
        }
        return true;
    }
}
class PBOutputScope extends PBScope {
    constructor() {
        super(null);
    }
    $_getLocalScope() {
        return null;
    }
    $set(prop, value) {
        if (prop[0] === '$') {
            this[prop] = value;
        }
        else {
            if (!(prop in this)) {
                if (getCurrentProgramBuilder().currentScope() === getCurrentProgramBuilder().globalScope
                    && (!(value instanceof PBShaderExp) || !(value.$ast instanceof ASTShaderExpConstructor))) {
                    throw new Error(`invalid shader output variable declaration: ${prop}`);
                }
                const type = value.$ast.getType();
                if (!type.isPrimitiveType() || type.isMatrixType() || type.primitiveType === PBPrimitiveType.BOOL) {
                    throw new Error(`type cannot be used as pipeline input/output: ${prop}`);
                }
                const location = getCurrentProgramBuilder()._outputs.length;
                getCurrentProgramBuilder().out(location, prop, new PBShaderExp(`${output_prefix}${prop}`, type).tag(...value.$tags));
                if (getCurrentProgramBuilder().getDeviceType() === 'webgpu') {
                    const st = getCurrentProgramBuilder().shaderType;
                    if (getCurrentProgramBuilder().findStructType(getBuiltinInputStructName(st), st)) {
                        getCurrentProgramBuilder().defineBuiltinStruct(st, 'out');
                    }
                }
            }
            if (getCurrentProgramBuilder().currentScope() !== getCurrentProgramBuilder().globalScope) {
                this[prop] = value;
            }
        }
        return true;
    }
}
class PBGlobalScope extends PBScope {
    constructor() {
        super(new ASTGlobalScope());
    }
    $mainFunc(body) {
        const builder = getCurrentProgramBuilder();
        if (builder.getDeviceType() === 'webgpu') {
            const inputStruct = builder.defineBuiltinStruct(builder.shaderType, 'in');
            this.$local(inputStruct[1]);
            const isCompute = builder.shaderType === ShaderType.Compute;
            const outputStruct = isCompute ? null : builder.defineBuiltinStruct(builder.shaderType, 'out');
            if (!isCompute) {
                this.$local(outputStruct[1]);
            }
            this.$internalFunction('chMainStub', [], false, body);
            this.$internalFunction('main', inputStruct ? [inputStruct[3]] : [], true, function () {
                if (inputStruct) {
                    this[inputStruct[1].$str] = this[inputStruct[3].$str];
                }
                if (builder.shaderType === ShaderType.Fragment && builder.emulateDepthClamp) {
                    this.$builtins.fragDepth = builder.clamp(this.$inputs.clamppedDepth, 0, 1);
                }
                this.chMainStub();
                if (builder.shaderType === ShaderType.Vertex) {
                    if (builder.depthRangeCorrection) {
                        this.$builtins.position.z = builder.mul(builder.add(this.$builtins.position.z, this.$builtins.position.w), 0.5);
                    }
                    if (builder.emulateDepthClamp) {
                        this.$outputs.clamppedDepth = builder.div(this.$builtins.position.z, this.$builtins.position.w);
                        this.$builtins.position.z = 0;
                    }
                }
                if (!isCompute) {
                    this.$return(outputStruct[1]);
                }
            });
        }
        else {
            this.$internalFunction('main', [], true, function () {
                if (builder.shaderType === ShaderType.Fragment && builder.emulateDepthClamp) {
                    this.$builtins.fragDepth = builder.clamp(this.$inputs.clamppedDepth, 0, 1);
                }
                body?.call(this);
                if (builder.shaderType === ShaderType.Vertex && builder.emulateDepthClamp) {
                    this.$outputs.clamppedDepth = builder.div(builder.add(builder.div(this.$builtins.position.z, this.$builtins.position.w), 1), 2);
                    this.$builtins.position.z = 0;
                }
            });
        }
    }
    $function(name, params, body) {
        this.$internalFunction(name, params, false, body);
    }
    $getFunction(name) {
        return this.$ast.findFunction(name);
    }
    $getCurrentFunctionScope() {
        let scope = getCurrentProgramBuilder().currentScope();
        while (scope && !(scope instanceof PBFunctionScope)) {
            scope = scope.$parent;
        }
        return scope;
    }
    $internalFunction(name, params, isMain, body) {
        const numArgs = params.length;
        const pb = getCurrentProgramBuilder();
        params.forEach(param => {
            if (!(param.$ast instanceof ASTPrimitive)) {
                throw new Error(`${name}(): invalid function definition`);
            }
            param.$ast = new ASTFunctionParameter(param.$ast, getCurrentProgramBuilder().getDeviceType());
        });
        Object.defineProperty(this, name, {
            get: function () {
                const func = this.$getFunction(name);
                if (!func) {
                    throw new Error(`function ${name} not found`);
                }
                return (...args) => {
                    if (args.length !== numArgs) {
                        throw new Error(`ERROR: incorrect argument count for ${name}`);
                    }
                    const argsNonArray = args.map(val => pb.normalizeExpValue(val));
                    const funcType = pb._getFunctionOverload(name, argsNonArray);
                    if (!funcType) {
                        throw new Error(`ERROR: no matching overloads for function ${name}`);
                    }
                    return getCurrentProgramBuilder().$callFunction(name, funcType[1], funcType[0].returnType);
                };
            },
        });
        const currentFunctionScope = this.$getCurrentFunctionScope();
        const astFunc = new ASTFunction(name, params.map(param => param.$ast), isMain);
        if (currentFunctionScope) {
            const curIndex = this.$ast.statements.indexOf(currentFunctionScope.$ast);
            if (curIndex < 0) {
                throw new Error('Internal error');
            }
            this.$ast.statements.splice(curIndex, 0, astFunc);
        }
        else {
            this.$ast.statements.push(astFunc);
        }
        new PBFunctionScope(this, params, astFunc, body);
    }
}
class PBInsideFunctionScope extends PBScope {
    constructor(parent) {
        super(new ASTScope(), parent);
    }
    $return(retval) {
        const functionScope = this.findOwnerFunction();
        const astFunc = functionScope.$ast;
        let returnType = null;
        const retValNonArray = getCurrentProgramBuilder().normalizeExpValue(retval);
        if (retValNonArray !== undefined && retValNonArray !== null) {
            if (typeof retValNonArray === 'number') {
                if (Number.isInteger(retValNonArray)) {
                    if (retValNonArray < 0) {
                        if (retValNonArray < (0x80000000 >> 0)) {
                            throw new Error(`function ${astFunc.name}: invalid return value: ${retValNonArray}`);
                        }
                        returnType = typeI32;
                    }
                    else {
                        if (retValNonArray > 0xFFFFFFFF) {
                            throw new Error(`function ${astFunc.name}: invalid return value: ${retValNonArray}`);
                        }
                        returnType = retValNonArray <= 0x7FFFFFFF ? typeI32 : typeU32;
                    }
                }
                else {
                    returnType = typeF32;
                }
            }
            else if (typeof retValNonArray === 'boolean') {
                returnType = typeBool;
            }
            else {
                returnType = retValNonArray.$ast.getType();
            }
        }
        else {
            returnType = typeVoid;
        }
        if (returnType.isPointerType()) {
            throw new Error('function can not return pointer type');
        }
        if (!astFunc.returnType) {
            astFunc.returnType = returnType;
        }
        else if (astFunc.returnType.typeId !== returnType.typeId) {
            throw new Error(`function ${astFunc.name}: return type must be ${astFunc.returnType?.toTypeName(getCurrentProgramBuilder().getDeviceType()) || 'void'}`);
        }
        let returnValue = null;
        if (retValNonArray !== undefined && retValNonArray !== null) {
            if (retValNonArray instanceof PBShaderExp) {
                returnValue = retValNonArray.$ast;
            }
            else {
                if (!returnType.isPrimitiveType() || !returnType.isScalarType()) {
                    throw new PBTypeCastError(retValNonArray, typeof retValNonArray, returnType);
                }
                returnValue = new ASTScalar(retValNonArray, returnType);
            }
        }
        this.$ast.statements.push(new ASTReturn(returnValue));
    }
    $scope(body) {
        const astScope = new ASTNakedScope();
        this.$ast.statements.push(astScope);
        return new PBNakedScope(this, astScope, body);
    }
    $if(condition, body) {
        const astIf = new ASTIf('if', condition instanceof PBShaderExp ? condition.$ast : new ASTScalar(condition, typeof condition === 'number' ? typeF32 : typeBool));
        this.$ast.statements.push(astIf);
        return new PBIfScope(this, astIf, body);
    }
    $break() {
        this.$ast.statements.push(new ASTBreak());
    }
    $continue() {
        this.$ast.statements.push(new ASTContinue());
    }
    $for(counter, init, count, body) {
        const initializerType = counter.$ast.getType();
        if (!initializerType.isPrimitiveType() || !initializerType.isScalarType()) {
            throw new PBASTError(counter.$ast, 'invalid for range initializer type');
        }
        const initval = init instanceof PBShaderExp ? init.$ast : new ASTScalar(init, initializerType);
        const astFor = new ASTRange(counter.$ast, initval, count instanceof PBShaderExp ? count.$ast : new ASTScalar(count, initializerType), true);
        this.$ast.statements.push(astFor);
        new PBForScope(this, counter, count, astFor, body);
    }
    $do(body) {
        const astDoWhile = new ASTDoWhile(null);
        this.$ast.statements.push(astDoWhile);
        return new PBDoWhileScope(this, astDoWhile, body);
    }
    $while(condition, body) {
        const astWhile = new ASTWhile(condition instanceof PBShaderExp ? condition.$ast : new ASTScalar(condition, typeof condition === 'number' ? typeF32 : typeBool));
        this.$ast.statements.push(astWhile);
        new PBWhileScope(this, astWhile, body);
    }
    findOwnerFunction() {
        for (let scope = this; scope; scope = scope.$parent) {
            if (scope instanceof PBFunctionScope) {
                return scope;
            }
        }
        return null;
    }
}
class PBFunctionScope extends PBInsideFunctionScope {
    constructor(parent, params, ast, body) {
        super(parent);
        this.$ast = ast;
        for (const param of params) {
            if (this.$_variables[param.$str]) {
                throw new Error('Duplicate function parameter name is not allowed');
            }
            this.$_registerVar(param);
        }
        getCurrentProgramBuilder().pushScope(this);
        body && body.call(this);
        getCurrentProgramBuilder().popScope();
        const astFunc = this.$ast;
        if (!astFunc.returnType) {
            astFunc.returnType = typeVoid;
        }
    }
}
class PBWhileScope extends PBInsideFunctionScope {
    constructor(parent, ast, body) {
        super(parent);
        this.$ast = ast;
        getCurrentProgramBuilder().pushScope(this);
        body && body.call(this);
        getCurrentProgramBuilder().popScope();
    }
}
class PBDoWhileScope extends PBInsideFunctionScope {
    constructor(parent, ast, body) {
        super(parent);
        this.$ast = ast;
        getCurrentProgramBuilder().pushScope(this);
        body && body.call(this);
        getCurrentProgramBuilder().popScope();
    }
    $while(condition) {
        this.$ast.condition = condition instanceof PBShaderExp ? condition.$ast : new ASTScalar(condition, typeof condition === 'number' ? typeF32 : typeBool);
    }
}
class PBForScope extends PBInsideFunctionScope {
    constructor(parent, counter, count, ast, body) {
        super(parent);
        this.$ast = ast;
        this.$_registerVar(counter);
        getCurrentProgramBuilder().pushScope(this);
        body && body.call(this);
        getCurrentProgramBuilder().popScope();
    }
}
class PBNakedScope extends PBInsideFunctionScope {
    constructor(parent, ast, body) {
        super(parent);
        this.$ast = ast;
        getCurrentProgramBuilder().pushScope(this);
        body && body.call(this);
        getCurrentProgramBuilder().popScope();
    }
}
class PBIfScope extends PBInsideFunctionScope {
    constructor(parent, ast, body) {
        super(parent);
        this.$ast = ast;
        getCurrentProgramBuilder().pushScope(this);
        body && body.call(this);
        getCurrentProgramBuilder().popScope();
    }
    $elseif(condition, body) {
        const astElseIf = new ASTIf('else if', condition instanceof PBShaderExp ? condition.$ast : new ASTScalar(condition, typeof condition === 'number' ? typeF32 : typeBool));
        this.$ast.nextElse = astElseIf;
        return new PBIfScope(this.$_parentScope, astElseIf, body);
    }
    $else(body) {
        const astElse = new ASTIf('else', null);
        this.$ast.nextElse = astElse;
        new PBIfScope(this.$_parentScope, astElse, body);
    }
}
setBuiltinFuncs(ProgramBuilder);
setConstructors(ProgramBuilder);

export { PBBuiltinScope, PBDoWhileScope, PBForScope, PBFunctionScope, PBGlobalScope, PBIfScope, PBInputScope, PBInsideFunctionScope, PBLocalScope, PBNakedScope, PBOutputScope, PBScope, PBWhileScope, ProgramBuilder };
//# sourceMappingURL=programbuilder.js.map
