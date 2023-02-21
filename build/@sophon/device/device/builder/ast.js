/** sophon base library */
import { ShaderType } from '../base_types.js';
import { semanticToAttrib } from '../gpuobject.js';
import { PBPrimitiveTypeInfo, PBPrimitiveType, PBTextureType, PBPointerTypeInfo, PBAddressSpace, typeBool, typeI32, typeF32, typeU32, PBFunctionTypeInfo } from './types.js';
import { PBASTError, PBTypeCastError, PBInternalError, PBParamTypeError } from './errors.js';

const BuiltinInputStructNameVS = 'ch_VertexInput';
const BuiltinOutputStructNameVS = 'ch_VertexOutput';
const BuiltinInputStructNameFS = 'ch_FragInput';
const BuiltinOutputStructNameFS = 'ch_FragOutput';
const BuiltinInputStructNameCS = 'ch_ComputeInput';
const BuiltinOutputStructNameCS = 'ch_ComputeOutput';
const BuiltinInputStructInstanceNameVS = 'ch_VertexInputCpy';
const BuiltinOutputStructInstanceNameVS = 'ch_VertexOutputCpy';
const BuiltinInputStructInstanceNameFS = 'ch_FragInputCpy';
const BuiltinOutputStructInstanceNameFS = 'ch_FragOutputCpy';
const BuiltinInputStructInstanceNameCS = 'ch_ComputeInputCpy';
const BuiltinOutputStructInstanceNameCS = 'ch_ComputeOutputCpy';
var DeclareType;
(function (DeclareType) {
    DeclareType[DeclareType["DECLARE_TYPE_NONE"] = 0] = "DECLARE_TYPE_NONE";
    DeclareType[DeclareType["DECLARE_TYPE_IN"] = 1] = "DECLARE_TYPE_IN";
    DeclareType[DeclareType["DECLARE_TYPE_OUT"] = 2] = "DECLARE_TYPE_OUT";
    DeclareType[DeclareType["DECLARE_TYPE_WORKGROUP"] = 3] = "DECLARE_TYPE_WORKGROUP";
    DeclareType[DeclareType["DECLARE_TYPE_UNIFORM"] = 4] = "DECLARE_TYPE_UNIFORM";
    DeclareType[DeclareType["DECLARE_TYPE_STORAGE"] = 5] = "DECLARE_TYPE_STORAGE";
})(DeclareType || (DeclareType = {}));
var ShaderPrecisionType;
(function (ShaderPrecisionType) {
    ShaderPrecisionType[ShaderPrecisionType["NONE"] = 0] = "NONE";
    ShaderPrecisionType[ShaderPrecisionType["HIGH"] = 1] = "HIGH";
    ShaderPrecisionType[ShaderPrecisionType["MEDIUM"] = 2] = "MEDIUM";
    ShaderPrecisionType[ShaderPrecisionType["LOW"] = 3] = "LOW";
})(ShaderPrecisionType || (ShaderPrecisionType = {}));
function getBuiltinInputStructInstanceName(shaderType) {
    switch (shaderType) {
        case ShaderType.Vertex: return BuiltinInputStructInstanceNameVS;
        case ShaderType.Fragment: return BuiltinInputStructInstanceNameFS;
        case ShaderType.Compute: return BuiltinInputStructInstanceNameCS;
        default: return null;
    }
}
function getBuiltinOutputStructInstanceName(shaderType) {
    switch (shaderType) {
        case ShaderType.Vertex: return BuiltinOutputStructInstanceNameVS;
        case ShaderType.Fragment: return BuiltinOutputStructInstanceNameFS;
        case ShaderType.Compute: return BuiltinOutputStructInstanceNameCS;
        default: return null;
    }
}
function getBuiltinInputStructName(shaderType) {
    switch (shaderType) {
        case ShaderType.Vertex: return BuiltinInputStructNameVS;
        case ShaderType.Fragment: return BuiltinInputStructNameFS;
        case ShaderType.Compute: return BuiltinInputStructNameCS;
        default: return null;
    }
}
function getBuiltinOutputStructName(shaderType) {
    switch (shaderType) {
        case ShaderType.Vertex: return BuiltinOutputStructNameVS;
        case ShaderType.Fragment: return BuiltinOutputStructNameFS;
        case ShaderType.Compute: return BuiltinOutputStructNameCS;
        default: return null;
    }
}
function getTextureSampleType(type) {
    switch (type.textureType) {
        case PBTextureType.TEX_1D:
        case PBTextureType.TEX_STORAGE_1D:
        case PBTextureType.TEX_2D:
        case PBTextureType.TEX_STORAGE_2D:
        case PBTextureType.TEX_2D_ARRAY:
        case PBTextureType.TEX_STORAGE_2D_ARRAY:
        case PBTextureType.TEX_3D:
        case PBTextureType.TEX_STORAGE_3D:
        case PBTextureType.TEX_CUBE:
        case PBTextureType.TEX_EXTERNAL:
            return new PBPrimitiveTypeInfo(PBPrimitiveType.F32VEC4);
        case PBTextureType.TEX_DEPTH_2D_ARRAY:
        case PBTextureType.TEX_DEPTH_2D:
        case PBTextureType.TEX_DEPTH_CUBE:
            return new PBPrimitiveTypeInfo(PBPrimitiveType.F32);
        case PBTextureType.ITEX_2D_ARRAY:
        case PBTextureType.ITEX_1D:
        case PBTextureType.ITEX_2D:
        case PBTextureType.ITEX_3D:
        case PBTextureType.ITEX_CUBE:
            return new PBPrimitiveTypeInfo(PBPrimitiveType.I32);
        case PBTextureType.UTEX_2D_ARRAY:
        case PBTextureType.UTEX_1D:
        case PBTextureType.UTEX_2D:
        case PBTextureType.UTEX_3D:
        case PBTextureType.UTEX_CUBE:
            return new PBPrimitiveTypeInfo(PBPrimitiveType.U32);
        default:
            return null;
    }
}
function genSamplerName(textureName, comparison) {
    return `ch_auto_sampler_${textureName}${comparison ? '_comparison' : ''}`;
}
const builtinVariables = {
    'webgl': {
        position: {
            name: 'gl_Position',
            type: new PBPrimitiveTypeInfo(PBPrimitiveType.F32VEC4),
            stage: 'vertex',
        },
        pointSize: {
            name: 'gl_PointSize',
            type: new PBPrimitiveTypeInfo(PBPrimitiveType.F32),
            stage: 'vertex',
        },
        fragCoord: {
            name: 'gl_FragCoord',
            type: new PBPrimitiveTypeInfo(PBPrimitiveType.F32VEC4),
            stage: 'fragment',
        },
        frontFacing: {
            name: 'gl_FrontFacing',
            type: new PBPrimitiveTypeInfo(PBPrimitiveType.BOOL),
            stage: 'fragment',
        },
        fragDepth: {
            name: 'gl_FragDepthEXT',
            type: new PBPrimitiveTypeInfo(PBPrimitiveType.F32),
            inOrOut: 'out',
            extension: 'GL_EXT_frag_depth',
            stage: 'fragment',
        },
    },
    webgl2: {
        vertexIndex: {
            name: 'gl_VertexID',
            semantic: 'vertex_index',
            type: new PBPrimitiveTypeInfo(PBPrimitiveType.U32),
            inOrOut: 'in',
            stage: 'vertex',
        },
        instanceIndex: {
            name: 'gl_InstanceID',
            semantic: 'instance_index',
            type: new PBPrimitiveTypeInfo(PBPrimitiveType.U32),
            inOrOut: 'in',
            stage: 'vertex',
        },
        position: {
            name: 'gl_Position',
            type: new PBPrimitiveTypeInfo(PBPrimitiveType.F32VEC4),
            stage: 'vertex',
        },
        pointSize: {
            name: 'gl_PointSize',
            type: new PBPrimitiveTypeInfo(PBPrimitiveType.F32),
            stage: 'vertex',
        },
        fragCoord: {
            name: 'gl_FragCoord',
            type: new PBPrimitiveTypeInfo(PBPrimitiveType.F32VEC4),
            stage: 'fragment',
        },
        frontFacing: {
            name: 'gl_FrontFacing',
            type: new PBPrimitiveTypeInfo(PBPrimitiveType.BOOL),
            stage: 'fragment',
        },
        fragDepth: {
            name: 'gl_FragDepth',
            type: new PBPrimitiveTypeInfo(PBPrimitiveType.F32),
            stage: 'fragment',
        },
    },
    webgpu: {
        vertexIndex: {
            name: 'ch_builtin_vertexIndex',
            semantic: 'vertex_index',
            type: new PBPrimitiveTypeInfo(PBPrimitiveType.U32),
            inOrOut: 'in',
            stage: 'vertex',
        },
        instanceIndex: {
            name: 'ch_builtin_instanceIndex',
            semantic: 'instance_index',
            type: new PBPrimitiveTypeInfo(PBPrimitiveType.U32),
            inOrOut: 'in',
            stage: 'vertex',
        },
        position: {
            name: 'ch_builtin_position',
            semantic: 'position',
            type: new PBPrimitiveTypeInfo(PBPrimitiveType.F32VEC4),
            inOrOut: 'out',
            stage: 'vertex',
        },
        fragCoord: {
            name: 'ch_builtin_fragCoord',
            semantic: 'position',
            type: new PBPrimitiveTypeInfo(PBPrimitiveType.F32VEC4),
            inOrOut: 'in',
            stage: 'fragment',
        },
        frontFacing: {
            name: 'ch_builtin_frontFacing',
            semantic: 'front_facing',
            type: new PBPrimitiveTypeInfo(PBPrimitiveType.BOOL),
            inOrOut: 'in',
            stage: 'fragment',
        },
        fragDepth: {
            name: 'ch_builtin_fragDepth',
            semantic: 'frag_depth',
            type: new PBPrimitiveTypeInfo(PBPrimitiveType.F32),
            inOrOut: 'out',
            stage: 'fragment',
        },
        localInvocationId: {
            name: 'ch_builtin_localInvocationId',
            semantic: 'local_invocation_id',
            type: new PBPrimitiveTypeInfo(PBPrimitiveType.U32VEC3),
            inOrOut: 'in',
            stage: 'compute',
        },
        globalInvocationId: {
            name: 'ch_builtin_globalInvocationId',
            semantic: 'global_invocation_id',
            type: new PBPrimitiveTypeInfo(PBPrimitiveType.U32VEC3),
            inOrOut: 'in',
            stage: 'compute',
        },
        workGroupId: {
            name: 'ch_builtin_workGroupId',
            semantic: 'workgroup_id',
            type: new PBPrimitiveTypeInfo(PBPrimitiveType.U32VEC3),
            inOrOut: 'in',
            stage: 'compute',
        },
        numWorkGroups: {
            name: 'ch_builtin_numWorkGroups',
            semantic: 'num_workgroups',
            type: new PBPrimitiveTypeInfo(PBPrimitiveType.U32VEC3),
            inOrOut: 'in',
            stage: 'compute',
        },
        sampleMaskIn: {
            name: 'ch_builtin_sampleMaskIn',
            semantic: 'sample_mask_in',
            type: new PBPrimitiveTypeInfo(PBPrimitiveType.U32),
            inOrOut: 'in',
            stage: 'fragment'
        },
        sampleMaskOut: {
            name: 'ch_builtin_sampleMaskOut',
            semantic: 'sample_mask_out',
            type: new PBPrimitiveTypeInfo(PBPrimitiveType.U32),
            inOrOut: 'out',
            stage: 'fragment'
        },
        sampleIndex: {
            name: 'ch_builtin_sampleIndex',
            semantic: 'sample_index',
            type: new PBPrimitiveTypeInfo(PBPrimitiveType.U32),
            inOrOut: 'in',
            stage: 'fragment',
        }
    }
};
function toFixed(n) {
    return n % 1 === 0 ? n.toFixed(1) : String(n);
}
function toInt(n) {
    return String(n | 0);
}
function toUint(n) {
    return String(n >>> 0);
}
function unbracket(e) {
    e = e.trim();
    if (e[0] === '(' && e[e.length - 1] === ')') {
        return e.substring(1, e.length - 1);
    }
    else {
        return e;
    }
}
class ShaderAST {
    constructor() {
    }
    isReference() {
        return false;
    }
    isPointer() {
        return !!this.getType()?.isPointerType();
    }
    getType() {
        return null;
    }
    toWebGL(indent, ctx) {
        return '';
    }
    toWebGL2(indent, ctx) {
        return '';
    }
    toWGSL(indent, ctx) {
        return '';
    }
    toString(deviceType) {
        return this.constructor.name;
    }
}
class ASTExpression extends ShaderAST {
}
class ASTFunctionParameter extends ASTExpression {
    paramAST;
    deviceType;
    writable;
    constructor(init, deviceType) {
        super();
        this.paramAST = init;
        this.deviceType = deviceType;
        this.writable = false;
    }
    getType() {
        return this.paramAST.getType();
    }
    markWritable() {
        if (this.paramAST instanceof ASTPrimitive) {
            if (this.deviceType === 'webgpu') {
                this.paramAST.value.$typeinfo = new PBPointerTypeInfo(this.paramAST.value.$typeinfo, PBAddressSpace.UNKNOWN);
            }
            this.paramAST = new ASTReferenceOf(this.paramAST);
        }
        this.writable = true;
    }
    isWritable() {
        return this.writable;
    }
    getAddressSpace() {
        return this.paramAST.getAddressSpace();
    }
    isConstExp() {
        return this.paramAST.isConstExp();
    }
    isReference() {
        return this.paramAST.isReference();
    }
    toWebGL(indent, ctx) {
        return this.paramAST.toWebGL(indent, ctx);
    }
    toWebGL2(indent, ctx) {
        return this.paramAST.toWebGL2(indent, ctx);
    }
    toWGSL(indent, ctx) {
        return this.paramAST.toWGSL(indent, ctx);
    }
}
class ASTScope extends ShaderAST {
    statements;
    constructor() {
        super();
        this.statements = [];
    }
    toWebGL(indent, ctx) {
        return this.statements.filter(stmt => !(stmt instanceof ASTCallFunction) || stmt.isStatement).map(stmt => stmt.toWebGL(indent, ctx)).join('');
    }
    toWebGL2(indent, ctx) {
        return this.statements.filter(stmt => !(stmt instanceof ASTCallFunction) || stmt.isStatement).map(stmt => stmt.toWebGL2(indent, ctx)).join('');
    }
    toWGSL(indent, ctx) {
        return this.statements.filter(stmt => !(stmt instanceof ASTCallFunction) || stmt.isStatement).map(stmt => {
            if (stmt instanceof ASTCallFunction) {
                if (!stmt.getType().isVoidType()) {
                    return `${indent}_ = ${stmt.toWGSL('', ctx)}`;
                }
            }
            return stmt.toWGSL(indent, ctx);
        }).join('');
    }
}
class ASTNakedScope extends ASTScope {
    toWebGL(indent, ctx) {
        return `${indent}{\n${super.toWebGL(indent + ' ', ctx)}${indent}}\n`;
    }
    toWebGL2(indent, ctx) {
        return `${indent}{\n${super.toWebGL2(indent + ' ', ctx)}${indent}}\n`;
    }
    toWGSL(indent, ctx) {
        return `${indent}{\n${super.toWGSL(indent + ' ', ctx)}${indent}}\n`;
    }
}
class ASTGlobalScope extends ASTScope {
    uniforms;
    constructor() {
        super();
        this.uniforms = [];
    }
    findFunction(name) {
        for (const stmt of this.statements) {
            if (stmt instanceof ASTFunction && stmt.name === name) {
                return stmt;
            }
        }
        return null;
    }
    toWebGL(indent, ctx) {
        const precisions = `${indent}precision highp float;\n${indent}precision highp int;\n`;
        const version = `${indent}#version 100\n`;
        const body = ctx.types.map(val => val.toWebGL(indent, ctx)).join('')
            + this.uniforms.map(uniform => uniform.toWebGL(indent, ctx)).join('')
            + ctx.inputs.map(input => input.toWebGL(indent, ctx)).join('')
            + ctx.outputs.map(output => output.toWebGL(indent, ctx)).join('')
            + super.toWebGL(indent, ctx);
        for (const k of ctx.builtins) {
            const info = builtinVariables.webgl[k];
            if (info.extension) {
                ctx.extensions.add(info.extension);
            }
        }
        const extensions = [...ctx.extensions].map(s => `${indent}#extension ${s}: enable\n`).join('');
        const defines = ctx.defines.join('');
        return version + extensions + precisions + defines + body;
    }
    toWebGL2(indent, ctx) {
        const precisions = `${indent}precision highp float;\n${indent}precision highp int;\n`;
        const version = `${indent}#version 300 es\n`;
        const body = ctx.types.map(val => val.toWebGL2(indent, ctx)).join('')
            + this.uniforms.map(uniform => uniform.toWebGL2(indent, ctx)).join('')
            + ctx.inputs.map(input => input.toWebGL2(indent, ctx)).join('')
            + ctx.outputs.map(output => output.toWebGL2(indent, ctx)).join('')
            + super.toWebGL2(indent, ctx);
        for (const k of ctx.builtins) {
            const info = builtinVariables.webgl2[k];
            if (info.extension) {
                ctx.extensions.add(info.extension);
            }
        }
        const extensions = [...ctx.extensions].map(s => `${indent}#extension ${s}: enable\n`).join('');
        const defines = ctx.defines.join('');
        return version + extensions + precisions + defines + body;
    }
    toWGSL(indent, ctx) {
        const structNames = ctx.type === ShaderType.Vertex
            ? [BuiltinInputStructNameVS, BuiltinOutputStructNameVS]
            : ctx.type === ShaderType.Fragment
                ? [BuiltinInputStructNameFS, BuiltinOutputStructNameFS]
                : [BuiltinInputStructNameCS];
        const usedBuiltins = [];
        for (const k of ctx.builtins) {
            usedBuiltins.push(builtinVariables.webgpu[k].name);
        }
        const allBuiltins = Object.keys(builtinVariables.webgpu).map(val => builtinVariables.webgpu[val].name);
        for (const type of ctx.types) {
            if (type instanceof ASTStructDefine && structNames.indexOf(type.type.structName) >= 0) {
                for (let i = type.type.structMembers.length - 1; i >= 0; i--) {
                    const member = type.type.structMembers[i];
                    if (allBuiltins.indexOf(member.name) >= 0 && usedBuiltins.indexOf(member.name) < 0) {
                        type.type.structMembers.splice(i, 1);
                        type.prefix.splice(i, 1);
                    }
                }
            }
        }
        ctx.types = ctx.types.filter(val => !(val instanceof ASTStructDefine) || val.type.structMembers.length > 0);
        return ctx.types.map(val => val.toWGSL(indent, ctx)).join('')
            + this.uniforms.map(uniform => uniform.toWGSL(indent, ctx)).join('')
            + super.toWGSL(indent, ctx);
    }
}
class ASTPrimitive extends ASTExpression {
    value;
    ref;
    writable;
    constExp;
    constructor(value) {
        super();
        this.value = value;
        this.ref = null;
        this.writable = false;
        this.constExp = false;
    }
    get name() {
        return this.value.$str;
    }
    isReference() {
        return true;
    }
    isConstExp() {
        return this.constExp;
    }
    markWritable() {
        this.writable = true;
        this.constExp = false;
        if (this.ref) {
            this.ref.markWritable();
        }
    }
    isWritable() {
        return this.writable;
    }
    getAddressSpace() {
        switch (this.value.$declareType) {
            case DeclareType.DECLARE_TYPE_UNIFORM:
                return PBAddressSpace.UNIFORM;
            case DeclareType.DECLARE_TYPE_STORAGE:
                return PBAddressSpace.STORAGE;
            case DeclareType.DECLARE_TYPE_IN:
            case DeclareType.DECLARE_TYPE_OUT:
                return null;
            default:
                return this.value.$global ? PBAddressSpace.PRIVATE : PBAddressSpace.FUNCTION;
        }
    }
    getType() {
        return this.value.$typeinfo;
    }
    toWebGL(indent, ctx) {
        return this.name;
    }
    toWebGL2(indent, ctx) {
        return this.name;
    }
    toWGSL(indent, ctx) {
        if (this.value.$declareType === DeclareType.DECLARE_TYPE_IN) {
            const structName = getBuiltinInputStructInstanceName(ctx.type);
            return ctx.global[structName][this.name].$ast.toWGSL(indent, ctx);
        }
        else if (this.value.$declareType === DeclareType.DECLARE_TYPE_OUT) {
            const structName = getBuiltinOutputStructInstanceName(ctx.type);
            return ctx.global[structName][this.name].$ast.toWGSL(indent, ctx);
        }
        else {
            return this.name;
        }
    }
    toString(deviceType) {
        return this.name;
    }
}
class ASTLValue extends ShaderAST {
}
class ASTLValueScalar extends ASTLValue {
    value;
    constructor(value) {
        super();
        if (value.getAddressSpace() === PBAddressSpace.UNIFORM) {
            throw new PBASTError(value, 'cannot assign to uniform variable');
        }
        this.value = value;
        if (this.value instanceof ASTCallFunction) {
            this.value.isStatement = false;
        }
    }
    getType() {
        return this.value.getType();
    }
    markWritable() {
        this.value.markWritable();
    }
    isWritable() {
        return this.value.isWritable();
    }
    isReference() {
        return this.value.isReference();
    }
    toWebGL(indent, ctx) {
        return this.value.toWebGL(indent, ctx);
    }
    toWebGL2(indent, ctx) {
        return this.value.toWebGL2(indent, ctx);
    }
    toWGSL(indent, ctx) {
        return this.value.toWGSL(indent, ctx);
    }
    toString(deviceType) {
        return this.value.toString(deviceType);
    }
}
class ASTLValueHash extends ASTLValue {
    scope;
    field;
    type;
    constructor(scope, field, type) {
        super();
        this.scope = scope;
        this.field = field;
        this.type = type;
    }
    getType() {
        return this.type;
    }
    markWritable() {
        this.scope.markWritable();
    }
    isWritable() {
        return this.scope.isWritable();
    }
    isReference() {
        return this.scope.isReference();
    }
    toWebGL(indent, ctx) {
        return `${this.scope.toWebGL(indent, ctx)}.${this.field}`;
    }
    toWebGL2(indent, ctx) {
        return `${this.scope.toWebGL2(indent, ctx)}.${this.field}`;
    }
    toWGSL(indent, ctx) {
        const scope = this.scope.isPointer() ? new ASTReferenceOf(this.scope) : this.scope;
        return `${scope.toWGSL(indent, ctx)}.${this.field}`;
    }
    toString(deviceType) {
        const scope = this.scope.isPointer() ? new ASTReferenceOf(this.scope) : this.scope;
        return `${scope.toString(deviceType)}.${this.field}`;
    }
}
class ASTLValueArray extends ASTLValue {
    value;
    index;
    type;
    constructor(value, index, type) {
        super();
        this.value = value;
        this.index = index;
        this.type = type;
        if (this.index instanceof ASTCallFunction) {
            this.index.isStatement = false;
        }
    }
    getType() {
        return this.type;
    }
    markWritable() {
        this.value.markWritable();
    }
    isWritable() {
        return this.value.isWritable();
    }
    isReference() {
        return this.value.isReference();
    }
    toWebGL(indent, ctx) {
        return `${this.value.toWebGL(indent, ctx)}[${this.index.toWebGL(indent, ctx)}]`;
    }
    toWebGL2(indent, ctx) {
        return `${this.value.toWebGL2(indent, ctx)}[${this.index.toWebGL2(indent, ctx)}]`;
    }
    toWGSL(indent, ctx) {
        const value = this.value.isPointer() ? new ASTReferenceOf(this.value) : this.value;
        return `${value.toWGSL(indent, ctx)}[${this.index.toWGSL(indent, ctx)}]`;
    }
    toString(deviceType) {
        const value = this.value.isPointer() ? new ASTReferenceOf(this.value) : this.value;
        return `${value.toString(deviceType)}[${this.index.toString(deviceType)}]`;
    }
}
class ASTLValueDeclare extends ASTLValue {
    value;
    constructor(value) {
        super();
        this.value = value;
        this.value.constExp = true;
    }
    getType() {
        return this.value.getType();
    }
    markWritable() {
    }
    isWritable() {
        return false;
    }
    isReference() {
        return true;
    }
    toWebGL(indent, ctx) {
        let prefix = '';
        switch (this.value.value.$declareType) {
            case DeclareType.DECLARE_TYPE_IN:
            case DeclareType.DECLARE_TYPE_OUT:
            case DeclareType.DECLARE_TYPE_UNIFORM:
            case DeclareType.DECLARE_TYPE_STORAGE:
                throw new Error('invalid declare type');
            default:
                prefix = this.value.constExp && !this.value.writable && !this.getType().isStructType() ? 'const ' : '';
                break;
        }
        {
            return `${prefix}${this.getType().toTypeName('webgl', this.value.name)}`;
        }
    }
    toWebGL2(indent, ctx) {
        let prefix = '';
        switch (this.value.value.$declareType) {
            case DeclareType.DECLARE_TYPE_IN:
            case DeclareType.DECLARE_TYPE_OUT:
            case DeclareType.DECLARE_TYPE_UNIFORM:
            case DeclareType.DECLARE_TYPE_STORAGE:
                throw new Error('invalid declare type');
            default:
                prefix = this.value.constExp && !this.value.writable && !this.getType().isStructType() ? 'const ' : '';
                break;
        }
        {
            return `${prefix}${this.getType().toTypeName('webgl2', this.value.name)}`;
        }
    }
    toWGSL(indent, ctx) {
        let prefix;
        switch (this.value.value.$declareType) {
            case DeclareType.DECLARE_TYPE_IN:
            case DeclareType.DECLARE_TYPE_OUT:
            case DeclareType.DECLARE_TYPE_UNIFORM:
            case DeclareType.DECLARE_TYPE_STORAGE:
                throw new Error('invalid declare type');
            default: {
                const addressSpace = this.value.getAddressSpace();
                const readonly = this.getType().isPointerType()
                    || (!this.value.writable
                        && (addressSpace === PBAddressSpace.PRIVATE || addressSpace === PBAddressSpace.FUNCTION));
                const moduleScope = addressSpace === PBAddressSpace.PRIVATE;
                const storageAccessMode = addressSpace === PBAddressSpace.STORAGE && this.value.writable ? ', read_write' : '';
                const decorator = addressSpace !== PBAddressSpace.FUNCTION ? `<${addressSpace}${storageAccessMode}>` : '';
                prefix = readonly ? moduleScope ? 'const ' : 'let ' : `var${decorator} `;
                break;
            }
        }
        {
            const type = this.getType();
            if (type.isPointerType() && (this.value.writable || this.value.ref.isWritable())) {
                type.writable = true;
            }
            const decl = type.toTypeName('webgpu', this.value.name);
            return `${prefix}${decl}`;
        }
    }
    toString(deviceType) {
        return this.value.toString(deviceType);
    }
}
class ASTShaderExpConstructor extends ASTExpression {
    type;
    args;
    constExp;
    constructor(type, args) {
        super();
        this.type = type;
        this.args = args;
        this.constExp = true;
        for (const arg of args) {
            if (arg === null || arg === undefined) {
                throw new Error('invalid constructor argument');
            }
            if (arg instanceof ASTCallFunction) {
                arg.isStatement = false;
            }
            this.constExp &&= !(arg instanceof ASTExpression) || arg.isConstExp();
        }
    }
    getType() {
        return this.type;
    }
    markWritable() {
    }
    isWritable() {
        return false;
    }
    isConstExp() {
        return this.constExp;
    }
    getAddressSpace() {
        return null;
    }
    toWebGL(indent, ctx) {
        console.assert(!this.type.isArrayType(), 'array constructor not supported in webgl1 device');
        console.assert(this.type.isConstructible(), `type '${this.type.toTypeName('webgl')}' is not constructible`);
        const overloads = this.type.getConstructorOverloads('webgl');
        for (const overload of overloads) {
            const convertedArgs = convertArgs(this.args, overload);
            if (convertedArgs) {
                const c = convertedArgs.args.map(arg => unbracket(arg.toWebGL(indent, ctx))).join(',');
                return `${convertedArgs.name}(${c})`;
            }
        }
        throw new Error(`no matching overload function found for type ${this.type.toTypeName('webgl')}`);
    }
    toWebGL2(indent, ctx) {
        console.assert(this.type.isConstructible(), `type '${this.type.toTypeName('webgl2')}' is not constructible`, true);
        const overloads = this.type.getConstructorOverloads('webgl2');
        for (const overload of overloads) {
            const convertedArgs = convertArgs(this.args, overload);
            if (convertedArgs) {
                const c = convertedArgs.args.map(arg => unbracket(arg.toWebGL2(indent, ctx))).join(',');
                return `${convertedArgs.name}(${c})`;
            }
        }
        throw new Error(`no matching overload function found for type ${this.type.toTypeName('webgl2')}`);
    }
    toWGSL(indent, ctx) {
        console.assert(this.type.isConstructible(), `type '${this.type.toTypeName('webgpu')}' is not constructible`, true);
        const overloads = this.type.getConstructorOverloads('webgpu');
        for (const overload of overloads) {
            const convertedArgs = convertArgs(this.args, overload);
            if (convertedArgs) {
                const c = convertedArgs.args.map(arg => unbracket(arg.toWGSL(indent, ctx))).join(',');
                return `${convertedArgs.name}(${c})`;
            }
        }
        throw new Error(`no matching overload function found for type ${this.type.toTypeName('webgpu')}`);
    }
    toString(deviceType) {
        return 'constructor';
    }
}
class ASTScalar extends ASTExpression {
    value;
    type;
    constructor(value, type) {
        super();
        this.value = value;
        this.type = type;
        const valueType = typeof value;
        if (valueType === 'number') {
            if (type.primitiveType === PBPrimitiveType.BOOL) {
                throw new PBTypeCastError(value, valueType, type);
            }
            if (type.primitiveType === PBPrimitiveType.I32 && (!Number.isInteger(value) || value < (0x80000000 >> 0) || value > 0xFFFFFFFF)) {
                throw new PBTypeCastError(value, valueType, type);
            }
            if (value < 0 && type.primitiveType === PBPrimitiveType.U32 && (!Number.isInteger(value) || value < 0 || value > 0xFFFFFFFF)) {
                throw new PBTypeCastError(value, valueType, type);
            }
        }
        else if (type.primitiveType !== PBPrimitiveType.BOOL) {
            throw new PBTypeCastError(value, valueType, type);
        }
    }
    getType() {
        return this.type;
    }
    markWritable() {
    }
    isWritable() {
        return false;
    }
    isConstExp() {
        return true;
    }
    getAddressSpace() {
        return null;
    }
    toWebGL(indent, ctx) {
        switch (this.type.primitiveType) {
            case PBPrimitiveType.F32:
                return toFixed(this.value);
            case PBPrimitiveType.I32:
                return toInt(this.value);
            case PBPrimitiveType.U32:
                return toUint(this.value);
            case PBPrimitiveType.BOOL:
                return String(!!this.value);
            default:
                throw new Error('Invalid scalar type');
        }
    }
    toWebGL2(indent, ctx) {
        switch (this.type.primitiveType) {
            case PBPrimitiveType.F32:
                return toFixed(this.value);
            case PBPrimitiveType.I32:
                return toInt(this.value);
            case PBPrimitiveType.U32:
                return toUint(this.value);
            case PBPrimitiveType.BOOL:
                return String(!!this.value);
            default:
                throw new Error('Invalid scalar type');
        }
    }
    toWGSL(indent, ctx) {
        switch (this.type.primitiveType) {
            case PBPrimitiveType.F32:
                return toFixed(this.value);
            case PBPrimitiveType.I32:
                return toInt(this.value);
            case PBPrimitiveType.U32:
                return `${toUint(this.value)}u`;
            case PBPrimitiveType.BOOL:
                return String(!!this.value);
            default:
                throw new Error('Invalid scalar type');
        }
    }
    toString(deviceType) {
        return `${this.value}`;
    }
}
class ASTHash extends ASTExpression {
    source;
    field;
    type;
    constructor(source, field, type) {
        super();
        this.source = source;
        this.field = field;
        this.type = type;
        if (this.source instanceof ASTCallFunction) {
            this.source.isStatement = false;
        }
    }
    getType() {
        return this.type;
    }
    isReference() {
        return this.source.isReference();
    }
    isConstExp() {
        return this.source.isConstExp();
    }
    markWritable() {
        this.source.markWritable();
    }
    isWritable() {
        return this.source.isWritable();
    }
    getAddressSpace() {
        return this.source.getAddressSpace();
    }
    toWebGL(indent, ctx) {
        return `${this.source.toWebGL(indent, ctx)}.${this.field}`;
    }
    toWebGL2(indent, ctx) {
        return `${this.source.toWebGL2(indent, ctx)}.${this.field}`;
    }
    toWGSL(indent, ctx) {
        const source = this.source.isPointer() ? new ASTReferenceOf(this.source) : this.source;
        return `${source.toWGSL(indent, ctx)}.${this.field}`;
    }
    toString(deviceType) {
        const source = this.source.isPointer() ? new ASTReferenceOf(this.source) : this.source;
        return `${source.toString(deviceType)}.${this.field}`;
    }
}
class ASTCast extends ASTExpression {
    sourceValue;
    castType;
    constructor(source, type) {
        super();
        this.sourceValue = source;
        this.castType = type;
        if (this.sourceValue instanceof ASTCallFunction) {
            this.sourceValue.isStatement = false;
        }
    }
    getType() {
        return this.castType;
    }
    markWritable() {
    }
    isWritable() {
        return false;
    }
    isConstExp() {
        return this.sourceValue.isConstExp();
    }
    getAddressSpace() {
        return null;
    }
    toWebGL(indent, ctx) {
        if (this.castType.typeId !== this.sourceValue.getType().typeId) {
            return `${this.castType.toTypeName('webgl')}(${unbracket(this.sourceValue.toWebGL(indent, ctx))})`;
        }
        else {
            return this.sourceValue.toWebGL(indent, ctx);
        }
    }
    toWebGL2(indent, ctx) {
        if (this.castType.typeId !== this.sourceValue.getType().typeId) {
            return `${this.castType.toTypeName('webgl2')}(${unbracket(this.sourceValue.toWebGL2(indent, ctx))})`;
        }
        else {
            return this.sourceValue.toWebGL2(indent, ctx);
        }
    }
    toWGSL(indent, ctx) {
        if (this.castType.typeId !== this.sourceValue.getType().typeId) {
            return `${this.castType.toTypeName('webgpu')}(${unbracket(this.sourceValue.toWGSL(indent, ctx))})`;
        }
        else {
            return this.sourceValue.toWGSL(indent, ctx);
        }
    }
    toString(deviceType) {
        return `${this.castType.toTypeName(deviceType)}(${unbracket(this.sourceValue.toString(deviceType))})`;
    }
}
class ASTAddressOf extends ASTExpression {
    value;
    type;
    constructor(value) {
        super();
        console.assert(value.isReference(), 'no pointer type for non-reference values', true);
        this.value = value;
        this.type = new PBPointerTypeInfo(value.getType(), value.getAddressSpace());
    }
    getType() {
        return this.type;
    }
    isConstExp() {
        return false;
    }
    markWritable() {
        const addressSpace = this.value.getAddressSpace();
        if (addressSpace === PBAddressSpace.UNIFORM) {
            throw new PBASTError(this.value, 'uniforms are not writable');
        }
        this.value.markWritable();
    }
    isWritable() {
        return this.value.isWritable();
    }
    getAddressSpace() {
        return this.value.getAddressSpace();
    }
    toWebGL(indent, ctx) {
        throw new Error('GLSL does not support pointer type');
    }
    toWebGL2(indent, ctx) {
        throw new Error('GLSL does not support pointer type');
    }
    toWGSL(indent, ctx) {
        const ast = this.value instanceof ASTFunctionParameter ? this.value.paramAST : this.value;
        return ast instanceof ASTReferenceOf ? ast.value.toWGSL(indent, ctx) : `(&${ast.toWGSL(indent, ctx)})`;
    }
    toString(deviceType) {
        const ast = this.value instanceof ASTFunctionParameter ? this.value.paramAST : this.value;
        return ast instanceof ASTReferenceOf ? ast.value.toString(deviceType) : `(&${ast.toString(deviceType)})`;
    }
}
class ASTReferenceOf extends ASTExpression {
    value;
    constructor(value) {
        super();
        this.value = value;
        if (this.value instanceof ASTCallFunction) {
            this.value.isStatement = false;
        }
    }
    getType() {
        const type = this.value.getType();
        return type.isPointerType() ? type.pointerType : type;
    }
    isReference() {
        return true;
    }
    markWritable() {
        this.value.markWritable();
    }
    isWritable() {
        return this.value.isWritable();
    }
    isConstExp() {
        return false;
    }
    getAddressSpace() {
        return this.value instanceof ASTExpression ? this.value.getAddressSpace() : null;
    }
    toWebGL(indent, ctx) {
        return this.value.toWebGL(indent, ctx);
    }
    toWebGL2(indent, ctx) {
        return this.value.toWebGL2(indent, ctx);
    }
    toWGSL(indent, ctx) {
        return this.value.getType().isPointerType() ? `(*${this.value.toWGSL(indent, ctx)})` : this.value.toWGSL(indent, ctx);
    }
    toString(deviceType) {
        return `*${this.value.toString(deviceType)}`;
    }
}
class ASTUnaryFunc extends ASTExpression {
    value;
    op;
    type;
    constructor(value, op, type) {
        super();
        this.value = value;
        this.op = op;
        this.type = type;
        if (this.value instanceof ASTCallFunction) {
            this.value.isStatement = false;
        }
    }
    getType() {
        return this.type;
    }
    markWritable() {
    }
    isWritable() {
        return false;
    }
    isConstExp() {
        return this.value.isConstExp();
    }
    getAddressSpace() {
        return null;
    }
    toWebGL(indent, ctx) {
        return `${this.op}${this.value.toWebGL(indent, ctx)}`;
    }
    toWebGL2(indent, ctx) {
        return `${this.op}${this.value.toWebGL2(indent, ctx)}`;
    }
    toWGSL(indent, ctx) {
        const value = this.value.isPointer() ? new ASTReferenceOf(this.value) : this.value;
        return `${this.op}${value.toWGSL(indent, ctx)}`;
    }
    toString(deviceType) {
        const value = this.value.isPointer() ? new ASTReferenceOf(this.value) : this.value;
        return `${this.op}${value.toString(deviceType)}`;
    }
}
class ASTBinaryFunc extends ASTExpression {
    left;
    right;
    type;
    op;
    constructor(left, right, op, type) {
        super();
        this.left = left;
        this.right = right;
        this.op = op;
        this.type = type;
        if (this.left instanceof ASTCallFunction) {
            this.left.isStatement = false;
        }
        if (this.right instanceof ASTCallFunction) {
            this.right.isStatement = false;
        }
    }
    getType() {
        return this.type;
    }
    markWritable() {
    }
    isWritable() {
        return false;
    }
    isConstExp() {
        return this.left.isConstExp() && this.right.isConstExp();
    }
    getAddressSpace() {
        return null;
    }
    toWebGL(indent, ctx) {
        return `(${this.left.toWebGL(indent, ctx)} ${this.op} ${this.right.toWebGL(indent, ctx)})`;
    }
    toWebGL2(indent, ctx) {
        return `(${this.left.toWebGL2(indent, ctx)} ${this.op} ${this.right.toWebGL2(indent, ctx)})`;
    }
    toWGSL(indent, ctx) {
        const left = this.left.isPointer() ? new ASTReferenceOf(this.left) : this.left;
        const right = this.right.isPointer() ? new ASTReferenceOf(this.right) : this.right;
        return `(${left.toWGSL(indent, ctx)} ${this.op} ${right.toWGSL(indent, ctx)})`;
    }
    toString(deviceType) {
        const left = this.left.isPointer() ? new ASTReferenceOf(this.left) : this.left;
        const right = this.right.isPointer() ? new ASTReferenceOf(this.right) : this.right;
        return `(${left.toString(deviceType)} ${this.op} ${right.toString(deviceType)})`;
    }
}
class ASTArrayIndex extends ASTExpression {
    source;
    index;
    type;
    constructor(source, index, type) {
        super();
        this.source = source;
        this.index = index;
        this.type = type;
        if (this.source instanceof ASTCallFunction) {
            this.source.isStatement = false;
        }
        if (this.index instanceof ASTCallFunction) {
            this.index.isStatement = false;
        }
    }
    getType() {
        return this.type;
    }
    isReference() {
        return this.source.isReference();
    }
    markWritable() {
        this.source.markWritable();
    }
    isWritable() {
        return this.source.isWritable();
    }
    isConstExp() {
        return this.source.isConstExp() && this.index.isConstExp();
    }
    getAddressSpace() {
        return this.source.getAddressSpace();
    }
    toWebGL(indent, ctx) {
        return `${this.source.toWebGL(indent, ctx)}[${unbracket(this.index.toWebGL(indent, ctx))}]`;
    }
    toWebGL2(indent, ctx) {
        return `${this.source.toWebGL2(indent, ctx)}[${unbracket(this.index.toWebGL2(indent, ctx))}]`;
    }
    toWGSL(indent, ctx) {
        return `${this.source.toWGSL(indent, ctx)}[${unbracket(this.index.toWGSL(indent, ctx))}]`;
    }
    toString(deviceType) {
        return `${this.source.toString(deviceType)}[${unbracket(this.index.toString(deviceType))}]`;
    }
}
class ASTTouch extends ShaderAST {
    value;
    constructor(value) {
        super();
        if (value.getType().isVoidType()) {
            throw new Error('can not touch void type');
        }
        if (value instanceof ASTCallFunction) {
            value.isStatement = false;
        }
        this.value = value;
    }
    toWebGL(indent, ctx) {
        return `${indent}${this.value.toWebGL('', ctx)};\n`;
    }
    toWebGL2(indent, ctx) {
        return `${indent}${this.value.toWebGL2('', ctx)};\n`;
    }
    toWGSL(indent, ctx) {
        if (!this.value.getType().isVoidType()) {
            return `${indent}_ = ${this.value.toWGSL('', ctx)};\n`;
        }
        else {
            return `${indent}${this.value.toWGSL('', ctx)};\n`;
        }
    }
}
class ASTAssignment extends ShaderAST {
    lvalue;
    rvalue;
    constructor(lvalue, rvalue) {
        super();
        if (!lvalue.isReference()) {
            throw new Error('assignment: l-value required');
        }
        this.lvalue = lvalue;
        this.rvalue = rvalue;
        if (!(this.lvalue instanceof ASTLValueDeclare)) {
            if (this.lvalue.getType().isPointerType()) {
                throw new PBASTError(this.lvalue, 'cannot assign to read-only variable');
            }
            this.lvalue.markWritable();
        }
        else if (this.lvalue.getType().isPointerType()) {
            if (this.rvalue instanceof ASTPrimitive) {
                this.lvalue.value.ref = this.rvalue.ref;
            }
            else if (this.rvalue instanceof ASTAddressOf) {
                this.lvalue.value.ref = this.rvalue.value;
            }
            else {
                throw new PBASTError(this.lvalue, 'invalid pointer assignment');
            }
        }
        else if (this.rvalue instanceof ASTExpression) {
            this.lvalue.value.constExp = this.rvalue.isConstExp();
        }
        if (this.rvalue instanceof ASTCallFunction) {
            this.rvalue.isStatement = false;
        }
    }
    getType() {
        return null;
    }
    toWebGL(indent, ctx) {
        let rhs = null;
        const ltype = this.lvalue.getType();
        const rtype = this.checkScalarType(this.rvalue, ltype);
        if (ltype.typeId !== rtype.typeId) {
            throw new PBTypeCastError(this.rvalue instanceof ASTExpression ? this.rvalue.toString('webgl') : `${this.rvalue}`, rtype, ltype);
        }
        if (typeof this.rvalue === 'number' || typeof this.rvalue === 'boolean') {
            rhs = rtype.primitiveType === PBPrimitiveType.F32 ? toFixed(this.rvalue) : String(this.rvalue);
        }
        else {
            rhs = unbracket(this.rvalue.toWebGL(indent, ctx));
        }
        if (this.lvalue instanceof ASTLValueDeclare) {
            this.lvalue.value.constExp &&= !(this.rvalue instanceof ASTExpression) || this.rvalue.isConstExp();
        }
        return `${indent}${this.lvalue.toWebGL(indent, ctx)} = ${rhs};\n`;
    }
    toWebGL2(indent, ctx) {
        let rhs = null;
        const ltype = this.lvalue.getType();
        const rtype = this.checkScalarType(this.rvalue, ltype);
        if (ltype.typeId !== rtype.typeId) {
            throw new PBTypeCastError(this.rvalue instanceof ASTExpression ? this.rvalue.toString('webgl2') : `${this.rvalue}`, rtype, ltype);
        }
        if (typeof this.rvalue === 'number' || typeof this.rvalue === 'boolean') {
            rhs = rtype.primitiveType === PBPrimitiveType.F32 ? toFixed(this.rvalue) : String(this.rvalue);
        }
        else {
            rhs = unbracket(this.rvalue.toWebGL2(indent, ctx));
        }
        if (this.lvalue instanceof ASTLValueDeclare) {
            this.lvalue.value.constExp &&= !(this.rvalue instanceof ASTExpression) || this.rvalue.isConstExp();
        }
        return `${indent}${this.lvalue.toWebGL2(indent, ctx)} = ${rhs};\n`;
    }
    toWGSL(indent, ctx) {
        const ltype = this.lvalue.getType();
        const [valueTypeLeft, lvalueIsPtr] = ltype.isPointerType() ? [ltype.pointerType, true] : [ltype, false];
        const rtype = this.checkScalarType(this.rvalue, valueTypeLeft);
        const rvalueIsPtr = rtype && rtype.isPointerType();
        const valueTypeRight = rvalueIsPtr ? rtype.pointerType : rtype;
        if (valueTypeLeft.typeId !== valueTypeRight.typeId) {
            throw new PBTypeCastError(this.rvalue instanceof ASTExpression ? this.rvalue.toString('webgpu') : `${this.rvalue}`, rtype, ltype);
        }
        if (this.lvalue instanceof ASTLValueScalar || this.lvalue instanceof ASTLValueDeclare) {
            const structName = valueTypeLeft.isStructType() ? valueTypeLeft.structName : null;
            if (structName && ctx.types.findIndex(val => val instanceof ASTStructDefine && val.type.structName === structName) < 0) {
                return '';
            }
        }
        let rhs;
        if (typeof this.rvalue === 'number' || typeof this.rvalue === 'boolean') {
            rhs = rtype.primitiveType === PBPrimitiveType.F32 ? toFixed(this.rvalue) : String(this.rvalue);
        }
        else {
            rhs = unbracket(this.rvalue.toWGSL(indent, ctx));
        }
        const name = this.lvalue.toWGSL(indent, ctx);
        if (lvalueIsPtr && !rvalueIsPtr) {
            if (this.lvalue instanceof ASTLValueDeclare) {
                throw new Error(`rvalue must be pointer type: ${rhs}`);
            }
            else {
                return `${indent}*(${name}) = ${rhs};\n`;
            }
        }
        else if (rvalueIsPtr && !lvalueIsPtr) {
            return `${indent}${name} = *(${rhs});\n`;
        }
        else {
            return `${indent}${name} = ${rhs};\n`;
        }
    }
    checkScalarType(value, targetType) {
        if (value instanceof ASTExpression) {
            return value.getType();
        }
        const isBool = typeof value === 'boolean';
        const isInt = typeof value === 'number' && Number.isInteger(value) && value >= (0x80000000 >> 0) && value <= 0x7fffffff;
        const isUint = typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 0xffffffff;
        const isFloat = typeof value === 'number';
        if (targetType.isPrimitiveType()) {
            switch (targetType.primitiveType) {
                case PBPrimitiveType.BOOL:
                    return isBool ? targetType : isInt ? typeI32 : isUint ? typeU32 : typeF32;
                case PBPrimitiveType.F32:
                    return isFloat ? targetType : typeBool;
                case PBPrimitiveType.I32:
                    return isInt ? targetType : isBool ? typeBool : isUint ? typeU32 : typeF32;
                case PBPrimitiveType.U32:
                    return isUint ? targetType : isBool ? typeBool : isInt ? typeI32 : typeF32;
                default:
                    return null;
            }
        }
        else {
            return isBool ? typeBool : isInt ? typeI32 : isUint ? typeU32 : typeF32;
        }
    }
}
class ASTDiscard extends ShaderAST {
    toWebGL(indent, ctx) {
        return `${indent}discard;\n`;
    }
    toWebGL2(indent, ctx) {
        return `${indent}discard;\n`;
    }
    toWGSL(indent, ctx) {
        return `${indent}discard;\n`;
    }
}
class ASTBreak extends ShaderAST {
    toWebGL(indent, ctx) {
        return `${indent}break;\n`;
    }
    toWebGL2(indent, ctx) {
        return `${indent}break;\n`;
    }
    toWGSL(indent, ctx) {
        return `${indent}break;\n`;
    }
}
class ASTContinue extends ShaderAST {
    toWebGL(indent, ctx) {
        return `${indent}continue;\n`;
    }
    toWebGL2(indent, ctx) {
        return `${indent}continue;\n`;
    }
    toWGSL(indent, ctx) {
        return `${indent}continue;\n`;
    }
}
class ASTReturn extends ShaderAST {
    value;
    constructor(value) {
        super();
        this.value = value;
        if (this.value instanceof ASTCallFunction) {
            this.value.isStatement = false;
        }
    }
    toWebGL(indent, ctx) {
        return this.value ? `${indent}return ${unbracket(this.value.toWebGL(indent, ctx))};\n` : `${indent}return;\n`;
    }
    toWebGL2(indent, ctx) {
        return this.value ? `${indent}return ${unbracket(this.value.toWebGL2(indent, ctx))};\n` : `${indent}return;\n`;
    }
    toWGSL(indent, ctx) {
        return this.value ? `${indent}return ${unbracket(this.value.toWGSL(indent, ctx))};\n` : `${indent}return;\n`;
    }
}
class ASTCallFunction extends ASTExpression {
    name;
    args;
    retType;
    func;
    isStatement;
    constructor(name, args, retType, func, deviceType) {
        super();
        this.name = name;
        this.args = args;
        this.retType = retType;
        this.func = func;
        this.isStatement = true;
        if (func) {
            if (func.args.length !== this.args.length) {
                throw new PBInternalError(`ASTCallFunction(): number of parameters mismatch`);
            }
            for (let i = 0; i < this.args.length; i++) {
                const funcArg = func.args[i];
                if (funcArg.paramAST instanceof ASTReferenceOf) {
                    if (deviceType === 'webgpu') {
                        const argAddressSpace = args[i].getAddressSpace();
                        if (argAddressSpace !== PBAddressSpace.FUNCTION && argAddressSpace !== PBAddressSpace.PRIVATE) {
                            throw new PBParamTypeError(name, 'pointer type of function parameter must be function or private');
                        }
                        const argType = funcArg.paramAST.value.getType();
                        if (!argType.isPointerType()) {
                            throw new PBInternalError(`ASTCallFunction(): invalid reference type`);
                        }
                        if (argType.addressSpace === PBAddressSpace.UNKNOWN) {
                            argType.addressSpace = argAddressSpace;
                        }
                        else if (argType.addressSpace !== argAddressSpace) {
                            throw new PBParamTypeError(name, `invalid pointer parameter address space '${argAddressSpace}', should be '${argType.addressSpace}`);
                        }
                    }
                    this.args[i].markWritable();
                }
            }
        }
        for (const arg of this.args) {
            if (arg instanceof ASTCallFunction) {
                arg.isStatement = false;
            }
        }
    }
    getType() {
        return this.retType;
    }
    isConstExp() {
        return false;
    }
    markWritable() {
    }
    isWritable() {
        return false;
    }
    getAddressSpace() {
        return null;
    }
    toWebGL(indent, ctx) {
        if (this.name === 'dFdx' || this.name === 'dFdy' || this.name === 'fwidth') {
            ctx.extensions.add('GL_OES_standard_derivatives');
        }
        else if (this.name === 'texture2DLodEXT' || this.name === 'texture2DProjLodEXT' || this.name === 'textureCubeLodEXT' || this.name === 'texture2DGradEXT' || this.name === 'texture2DProjGradEXT' || this.name === 'textureCubeGradEXT') {
            ctx.extensions.add('GL_EXT_shader_texture_lod');
        }
        const args = this.args.map(arg => unbracket(arg.toWebGL(indent, ctx)));
        return `${this.isStatement ? indent : ''}${this.name}(${args.join(',')})${this.isStatement ? ';\n' : ''}`;
    }
    toWebGL2(indent, ctx) {
        const args = this.args.map(arg => unbracket(arg.toWebGL2(indent, ctx)));
        return `${this.isStatement ? indent : ''}${this.name}(${args.join(',')})${this.isStatement ? ';\n' : ''}`;
    }
    toWGSL(indent, ctx) {
        let thisArgs = this.args.filter(val => {
            const type = val.getType();
            if ((val instanceof ASTPrimitive)
                && type.isStructType()
                && ctx.types.findIndex(t => (t instanceof ASTStructDefine) && t.type.structName === type.structName) < 0) {
                return false;
            }
            return true;
        });
        const overloads = ctx.global.$getFunction(this.name)?.overloads;
        if (overloads) {
            let argsNew;
            for (const overload of overloads) {
                const convertedArgs = convertArgs(thisArgs, overload);
                if (convertedArgs) {
                    argsNew = convertedArgs.args;
                    break;
                }
            }
            if (!argsNew) {
                throw new Error(`no matching overloading found for function '${this.name}'`);
            }
            thisArgs = argsNew;
        }
        const args = thisArgs.map(arg => unbracket(arg.toWGSL(indent, ctx)));
        return `${this.isStatement ? indent : ''}${this.name}(${args.join(',')})${this.isStatement ? ';\n' : ''}`;
    }
    toString(deviceType) {
        return `${this.name}(...)`;
    }
}
class ASTDeclareVar extends ShaderAST {
    value;
    group;
    binding;
    blockName;
    constructor(exp) {
        super();
        this.value = exp;
        this.group = 0;
        this.binding = 0;
    }
    isReference() {
        return true;
    }
    isPointer() {
        return this.value.getType().isPointerType();
    }
    toWebGL(indent, ctx) {
        let prefix = '';
        let builtin = false;
        let valueType = this.value.getType();
        switch (this.value.value.$declareType) {
            case DeclareType.DECLARE_TYPE_IN:
                if (ctx.type === ShaderType.Vertex) {
                    prefix = 'attribute ';
                    ctx.defines.push(`#define ${this.value.name} ${semanticToAttrib(ctx.vertexAttributes[this.value.value.$location])}\n`);
                }
                else {
                    prefix = 'varying ';
                }
                break;
            case DeclareType.DECLARE_TYPE_OUT:
                if (ctx.type === ShaderType.Vertex) {
                    prefix = 'varying ';
                }
                else {
                    builtin = true;
                    if (ctx.mrt) {
                        ctx.defines.push(`#define ${this.value.name} gl_FragData[${this.value.value.$location}]\n`);
                        ctx.extensions.add('GL_EXT_draw_buffers');
                    }
                    else {
                        ctx.defines.push(`#define ${this.value.name} gl_FragColor\n`);
                    }
                }
                break;
            case DeclareType.DECLARE_TYPE_UNIFORM:
                prefix = 'uniform ';
                valueType = ctx.typeReplacement?.get(this.value.value) || valueType;
                break;
            case DeclareType.DECLARE_TYPE_STORAGE:
                throw new Error(`invalid variable declare type: ${this.value.name}`);
        }
        if (!builtin) {
            return `${indent}${prefix}${valueType.toTypeName('webgl', this.value.name)};\n`;
        }
    }
    toWebGL2(indent, ctx) {
        let prefix = '';
        let valueType = this.value.getType();
        switch (this.value.value.$declareType) {
            case DeclareType.DECLARE_TYPE_IN:
                prefix = 'in ';
                if (ctx.type === ShaderType.Vertex) {
                    ctx.defines.push(`#define ${this.value.name} ${semanticToAttrib(ctx.vertexAttributes[this.value.value.$location])}\n`);
                }
                break;
            case DeclareType.DECLARE_TYPE_OUT:
                prefix = 'out ';
                if (ctx.type === ShaderType.Vertex) ;
                else {
                    prefix = `layout(location = ${this.value.value.$location}) out `;
                }
                break;
            case DeclareType.DECLARE_TYPE_UNIFORM:
                if (valueType.isStructType()) {
                    if (valueType.layout !== 'std140') {
                        throw new PBASTError(this, 'uniform buffer layout must be std140');
                    }
                    return `${indent}layout(std140) uniform ${this.blockName} { ${valueType.structName} ${this.value.name}; };\n`;
                }
                else {
                    valueType = ctx.typeReplacement?.get(this.value.value) || valueType;
                    return `${indent}uniform ${valueType.toTypeName('webgl2', this.value.name)};\n`;
                }
            case DeclareType.DECLARE_TYPE_STORAGE:
                throw new Error(`invalid variable declare type: ${this.value.name}`);
        }
        {
            return `${indent}${prefix}${this.value.getType().toTypeName('webgl2', this.value.name)};\n`;
        }
    }
    toWGSL(indent, ctx) {
        let prefix;
        const isBlock = this.value.getType().isPrimitiveType() || this.value.getType().isStructType() || this.value.getType().isArrayType();
        switch (this.value.value.$declareType) {
            case DeclareType.DECLARE_TYPE_IN:
            case DeclareType.DECLARE_TYPE_OUT:
                throw new Error(`Internal error`);
            case DeclareType.DECLARE_TYPE_UNIFORM:
                prefix = `@group(${this.group}) @binding(${this.binding}) var${isBlock ? '<uniform>' : ''} `;
                break;
            case DeclareType.DECLARE_TYPE_STORAGE:
                prefix = `@group(${this.group}) @binding(${this.binding}) var<storage, ${this.value.writable ? 'read_write' : 'read'}> `;
                break;
            case DeclareType.DECLARE_TYPE_WORKGROUP:
                prefix = `var<workgroup> `;
                break;
            default:
                prefix = `${this.value.getType().isPointerType() ? 'let' : 'var'}${this.value.value.$global && !this.value.getType().isPointerType() ? '<private>' : ''} `;
        }
        {
            const type = this.value.getType();
            const structName = type.isStructType() ? type.structName : null;
            if (structName && ctx.types.findIndex(val => val instanceof ASTStructDefine && val.type.structName === structName) < 0) {
                return '';
            }
            else {
                return `${indent}${prefix}${type.toTypeName('webgpu', this.value.name)};\n`;
            }
        }
    }
    toString(deviceType) {
        return this.value.toString(deviceType);
    }
}
class ASTFunction extends ASTScope {
    isBuiltin;
    isMainFunc;
    name;
    returnType;
    args;
    funcOverloads;
    builtins;
    constructor(name, args, isMainFunc, isBuiltin = false, overloads = null) {
        super();
        this.name = name;
        this.returnType = undefined;
        this.args = args;
        this.args.forEach(arg => {
            if (!(arg instanceof ASTFunctionParameter)) {
                throw new Error('invalid function argument type');
            }
        });
        this.builtins = [];
        this.isBuiltin = isBuiltin;
        this.isMainFunc = isMainFunc;
        this.funcOverloads = null;
    }
    get overloads() {
        return this.getOverloads();
    }
    toWebGL(indent, ctx) {
        if (!this.isBuiltin) {
            let str = '';
            const p = [];
            for (const param of this.args) {
                let name;
                let qualifier;
                if (param.paramAST instanceof ASTPrimitive) {
                    param.paramAST.value;
                    name = param.paramAST.name;
                    qualifier = '';
                }
                else {
                    param.paramAST.value.value;
                    name = param.paramAST.value.name;
                    qualifier = 'inout ';
                }
                p.push(`${qualifier}${param.getType().toTypeName('webgl', name)}`);
            }
            str += `${indent}${this.returnType.toTypeName('webgl')} ${this.name}(${p.join(',')}) {\n`;
            str += super.toWebGL(indent + '  ', ctx);
            str += `${indent}}\n`;
            return str;
        }
        else {
            return '';
        }
    }
    toWebGL2(indent, ctx) {
        if (!this.isBuiltin) {
            let str = '';
            const p = [];
            for (const param of this.args) {
                let name;
                let qualifier;
                if (param.paramAST instanceof ASTPrimitive) {
                    param.paramAST.value;
                    name = param.paramAST.name;
                    qualifier = '';
                }
                else {
                    param.paramAST.value.value;
                    name = param.paramAST.value.name;
                    qualifier = 'inout ';
                }
                p.push(`${qualifier}${param.getType().toTypeName('webgl2', name)}`);
            }
            str += `${indent}${this.returnType.toTypeName('webgl2')} ${this.name}(${p.join(',')}) {\n`;
            str += super.toWebGL2(indent + '  ', ctx);
            str += `${indent}}\n`;
            return str;
        }
        else {
            return '';
        }
    }
    toWGSL(indent, ctx) {
        if (!this.isBuiltin) {
            let str = '';
            const p = [...this.builtins];
            for (const param of this.args) {
                const name = param.paramAST instanceof ASTPrimitive ? param.paramAST.name : param.paramAST.value.name;
                const paramType = param.paramAST instanceof ASTPrimitive ? param.paramAST.getType() : param.paramAST.value.getType();
                const dataType = paramType.isPointerType() ? paramType.pointerType : paramType;
                if (dataType.isStructType() && ctx.types.findIndex(t => (t instanceof ASTStructDefine) && t.type.structName === dataType.structName) < 0) {
                    continue;
                }
                p.push(`${paramType.toTypeName('webgpu', name)}`);
            }
            let t = '';
            if (this.isMainFunc) {
                switch (ctx.type) {
                    case ShaderType.Vertex:
                        t = '@vertex ';
                        break;
                    case ShaderType.Fragment:
                        t = '@fragment ';
                        break;
                    case ShaderType.Compute:
                        t = `@compute @workgroup_size(${ctx.workgroupSize[0]}, ${ctx.workgroupSize[1]}, ${ctx.workgroupSize[2]}) `;
                        break;
                }
            }
            const retName = this.returnType.isVoidType() ? null : this.returnType.toTypeName('webgpu');
            const retStr = retName ? ` -> ${retName}` : '';
            str += `${indent}${t}fn ${this.name}(${p.join(',')})${retStr} {\n`;
            str += super.toWGSL(indent + '  ', ctx);
            str += `${indent}}\n`;
            return str;
        }
        else {
            return '';
        }
    }
    getOverloads() {
        if (!this.funcOverloads && this.args) {
            this.funcOverloads = this.args ? [new PBFunctionTypeInfo(this.name, this.returnType, this.args.map(arg => {
                    return {
                        type: arg.paramAST.getType(),
                        byRef: arg.paramAST instanceof ASTReferenceOf
                    };
                }))] : [];
        }
        return this.funcOverloads;
    }
}
class ASTIf extends ASTScope {
    keyword;
    condition;
    nextElse;
    constructor(keyword, condition) {
        super();
        this.keyword = keyword;
        this.condition = condition;
        this.nextElse = null;
        if (this.condition instanceof ASTCallFunction) {
            this.condition.isStatement = false;
        }
    }
    toWebGL(indent, ctx) {
        let str = `${indent}${this.keyword} ${this.condition ? '(' + unbracket(this.condition.toWebGL(indent, ctx)) + ')' : ''} {\n`;
        str += super.toWebGL(indent + '  ', ctx);
        str += `${indent}}\n`;
        if (this.nextElse) {
            str += this.nextElse.toWebGL(indent, ctx);
        }
        return str;
    }
    toWebGL2(indent, ctx) {
        let str = `${indent}${this.keyword} ${this.condition ? '(' + unbracket(this.condition.toWebGL2(indent, ctx)) + ')' : ''} {\n`;
        str += super.toWebGL2(indent + '  ', ctx);
        str += `${indent}}\n`;
        if (this.nextElse) {
            str += this.nextElse.toWebGL2(indent, ctx);
        }
        return str;
    }
    toWGSL(indent, ctx) {
        let str = `${indent}${this.keyword} ${this.condition ? '(' + unbracket(this.condition.toWGSL(indent, ctx)) + ')' : ''} {\n`;
        str += super.toWGSL(indent + '  ', ctx);
        str += `${indent}}\n`;
        if (this.nextElse) {
            str += this.nextElse.toWGSL(indent, ctx);
        }
        return str;
    }
}
class ASTRange extends ASTScope {
    init;
    start;
    end;
    open;
    constructor(init, start, end, open) {
        super();
        this.init = init;
        this.start = start;
        this.end = end;
        this.open = open;
        this.statements = [];
        if (this.start instanceof ASTCallFunction) {
            this.start.isStatement = false;
        }
        if (this.end instanceof ASTCallFunction) {
            this.end.isStatement = false;
        }
    }
    toWebGL(indent, ctx) {
        const init = this.init.getType().toTypeName('webgl', this.init.name);
        const start = unbracket(this.start.toWebGL(indent, ctx));
        const end = unbracket(this.end.toWebGL(indent, ctx));
        const comp = this.open ? '<' : '<=';
        let str = `${indent}for (${init} = ${start}; ${this.init.name} ${comp} ${end}; ${this.init.name}++) {\n`;
        str += super.toWebGL(indent + '  ', ctx);
        str += `${indent}}\n`;
        return str;
    }
    toWebGL2(indent, ctx) {
        const init = this.init.getType().toTypeName('webgl2', this.init.name);
        const start = unbracket(this.start.toWebGL2(indent, ctx));
        const end = unbracket(this.end.toWebGL2(indent, ctx));
        const comp = this.open ? '<' : '<=';
        let str = `${indent}for (${init} = ${start}; ${this.init.name} ${comp} ${end}; ${this.init.name}++) {\n`;
        str += super.toWebGL2(indent + '  ', ctx);
        str += `${indent}}\n`;
        return str;
    }
    toWGSL(indent, ctx) {
        const init = `var ${this.init.getType().toTypeName('webgpu', this.init.name)}`;
        const start = unbracket(this.start.toWGSL(indent, ctx));
        const end = unbracket(this.end.toWGSL(indent, ctx));
        const incr = new ASTScalar(1, this.init.getType()).toWGSL(indent, ctx);
        const comp = this.open ? '<' : '<=';
        let str = `${indent}for (${init} = ${start}; ${this.init.name} ${comp} ${end}; ${this.init.name} = ${this.init.name} + ${incr}) {\n`;
        str += super.toWGSL(indent + '  ', ctx);
        str += `${indent}}\n`;
        return str;
    }
}
class ASTDoWhile extends ASTScope {
    condition;
    constructor(condition) {
        super();
        this.condition = condition;
        if (this.condition instanceof ASTCallFunction) {
            this.condition.isStatement = false;
        }
    }
    toWebGL(indent, ctx) {
        let str = `${indent}do {\n`;
        str += super.toWebGL(indent + ' ', ctx);
        str += `${indent}} while(${unbracket(this.condition.toWebGL(indent, ctx))});\n`;
        return str;
    }
    toWebGL2(indent, ctx) {
        let str = `${indent}do {\n`;
        str += super.toWebGL2(indent + ' ', ctx);
        str += `${indent}} while(${unbracket(this.condition.toWebGL2(indent, ctx))});\n`;
        return str;
    }
    toWGSL(indent, ctx) {
        let str = `${indent}loop {\n`;
        str += super.toWGSL(indent + ' ', ctx);
        str += `${indent}  if (!(${unbracket(this.condition.toWGSL(indent, ctx))})) { break; }\n`;
        str += `${indent}}\n`;
        return str;
    }
}
class ASTWhile extends ASTScope {
    condition;
    constructor(condition) {
        super();
        this.condition = condition;
        if (this.condition instanceof ASTCallFunction) {
            this.condition.isStatement = false;
        }
    }
    toWebGL(indent, ctx) {
        let str = `${indent}while(${unbracket(this.condition.toWebGL(indent, ctx))}) {\n`;
        str += super.toWebGL(indent + '  ', ctx);
        str += `${indent}}\n`;
        return str;
    }
    toWebGL2(indent, ctx) {
        let str = `${indent}while(${unbracket(this.condition.toWebGL2(indent, ctx))}) {\n`;
        str += super.toWebGL2(indent + '  ', ctx);
        str += `${indent}}\n`;
        return str;
    }
    toWGSL(indent, ctx) {
        let str = `${indent}loop {\n`;
        str += `${indent}  if (!(${unbracket(this.condition.toWGSL(indent, ctx))})) { break; }\n`;
        str += super.toWGSL(indent + ' ', ctx);
        str += `${indent}}\n`;
        return str;
    }
}
class ASTStructDefine extends ShaderAST {
    type;
    prefix;
    builtin;
    constructor(type, builtin) {
        super();
        this.prefix = null;
        this.builtin = builtin;
        this.type = type;
    }
    getType() {
        return this.type;
    }
    toWebGL(indent, ctx) {
        if (!this.builtin) {
            let str = `${indent}struct ${this.type.structName} {\n`;
            for (const arg of this.type.structMembers) {
                str += `${indent}  ${arg.type.toTypeName('webgl', arg.name)};\n`;
            }
            str += `${indent}};\n`;
            return str;
        }
        else {
            return '';
        }
    }
    toWebGL2(indent, ctx) {
        if (!this.builtin) {
            let str = `${indent}struct ${this.type.structName} {\n`;
            for (const arg of this.type.structMembers) {
                str += `${indent}  ${arg.type.toTypeName('webgl2', arg.name)};\n`;
            }
            str += `${indent}};\n`;
            return str;
        }
        else {
            return '';
        }
    }
    toWGSL(indent, ctx) {
        if (!this.builtin) {
            let str = `${indent}struct ${this.type.structName} {\n`;
            str += this.type.structMembers.map((arg, i) => {
                const prefix = this.prefix ? this.prefix[i] : '';
                const sizePrefix = arg.type.getLayoutSize(this.type.layout) !== arg.type.getLayoutSize('default') ? `@size(${arg.type.getLayoutSize(this.type.layout)}) ` : '';
                const alignPrefix = i > 0 && arg.type.getLayoutAlignment(this.type.layout) !== arg.type.getLayoutAlignment('default') ? `@align(${arg.type.getLayoutAlignment(this.type.layout)}) ` : '';
                return `${indent}  ${prefix}${alignPrefix}${sizePrefix}${arg.type.toTypeName('webgpu', arg.name)}`;
            }).join(',\n');
            str += `\n${indent}};\n`;
            return str;
        }
        else {
            return '';
        }
    }
}
function convertArgs(args, overload) {
    if (args.length !== overload.argTypes.length) {
        return null;
    }
    const result = [];
    for (let i = 0; i < args.length; i++) {
        const isRef = !!overload.argTypes[i].byRef;
        const argType = overload.argTypes[i].type;
        const arg = args[i];
        if (typeof arg === 'number') {
            if (!isRef && argType.isPrimitiveType() && argType.isScalarType() && argType.primitiveType !== PBPrimitiveType.BOOL) {
                result.push(new ASTScalar(arg, argType));
            }
            else {
                return null;
            }
        }
        else if (typeof arg === 'boolean') {
            if (!isRef && argType.isPrimitiveType() && argType.primitiveType === PBPrimitiveType.BOOL) {
                result.push(new ASTScalar(arg, argType));
            }
            else {
                return null;
            }
        }
        else if (argType.typeId === arg.getType().typeId) {
            if (isRef) {
                arg.markWritable();
                result.push(new ASTAddressOf(arg));
            }
            else {
                result.push(arg);
            }
        }
        else {
            return null;
        }
    }
    return { name: overload.name, args: result };
}

export { ASTAddressOf, ASTArrayIndex, ASTAssignment, ASTBinaryFunc, ASTBreak, ASTCallFunction, ASTCast, ASTContinue, ASTDeclareVar, ASTDiscard, ASTDoWhile, ASTExpression, ASTFunction, ASTFunctionParameter, ASTGlobalScope, ASTHash, ASTIf, ASTLValue, ASTLValueArray, ASTLValueDeclare, ASTLValueHash, ASTLValueScalar, ASTNakedScope, ASTPrimitive, ASTRange, ASTReferenceOf, ASTReturn, ASTScalar, ASTScope, ASTShaderExpConstructor, ASTStructDefine, ASTTouch, ASTUnaryFunc, ASTWhile, BuiltinInputStructInstanceNameCS, BuiltinInputStructInstanceNameFS, BuiltinInputStructInstanceNameVS, BuiltinInputStructNameCS, BuiltinInputStructNameFS, BuiltinInputStructNameVS, BuiltinOutputStructInstanceNameCS, BuiltinOutputStructInstanceNameFS, BuiltinOutputStructInstanceNameVS, BuiltinOutputStructNameCS, BuiltinOutputStructNameFS, BuiltinOutputStructNameVS, DeclareType, ShaderAST, ShaderPrecisionType, builtinVariables, genSamplerName, getBuiltinInputStructInstanceName, getBuiltinInputStructName, getBuiltinOutputStructInstanceName, getBuiltinOutputStructName, getTextureSampleType };
//# sourceMappingURL=ast.js.map
