/** sophon base library */
import { ShaderPrecisionType, ASTPrimitive, DeclareType, getTextureSampleType, ASTArrayIndex, ASTScalar, ASTAssignment, ASTLValueArray, ASTLValueScalar, ASTHash, ASTLValueHash, ASTShaderExpConstructor } from './ast.js';
import { PBPointerTypeInfo, PBAddressSpace, PBArrayTypeInfo, PBPrimitiveType, typeI32, PBPrimitiveTypeInfo } from './types.js';
import { PBASTError } from './errors.js';

let currentProgramBuilder = null;
const constructorCache = new Map();
function setCurrentProgramBuilder(pb) {
    currentProgramBuilder = pb;
}
function getCurrentProgramBuilder() {
    return currentProgramBuilder;
}
function makeConstructor(typeFunc, elementType) {
    const wrappedTypeFunc = new Proxy(typeFunc, {
        get: function (target, prop) {
            if (typeof prop === 'symbol' || prop in target) {
                return target[prop];
            }
            let entries = constructorCache.get(typeFunc);
            if (!entries) {
                entries = {};
                constructorCache.set(typeFunc, entries);
            }
            let ctor = entries[prop];
            if (!ctor) {
                if (elementType.isPrimitiveType() || elementType.isStructType() || elementType.isArrayType()) {
                    if (prop === 'ptr') {
                        const pointerType = new PBPointerTypeInfo(elementType, PBAddressSpace.FUNCTION);
                        ctor = function pointerCtor(...args) {
                            if (args.length === 1 && typeof args[0] === 'string') {
                                return new PBShaderExp(args[0], pointerType);
                            }
                            else {
                                throw new Error(`Invalid pointer type constructor`);
                            }
                        };
                    }
                    else {
                        const dim = Number(prop);
                        if (Number.isInteger(dim) && dim >= 0) {
                            const arrayType = new PBArrayTypeInfo(elementType, dim);
                            const arrayTypeFunc = function arrayCtor(...args) {
                                if (args.length === 1 && typeof args[0] === 'string') {
                                    return new PBShaderExp(args[0], arrayType);
                                }
                                else {
                                    const exp = new PBShaderExp('', arrayType);
                                    exp.$ast = new ASTShaderExpConstructor(exp.$typeinfo, args.map(arg => arg instanceof PBShaderExp ? arg.$ast : arg));
                                    return exp;
                                }
                            };
                            ctor = makeConstructor(arrayTypeFunc, arrayType);
                        }
                    }
                }
            }
            if (ctor) {
                entries[prop] = ctor;
            }
            return ctor;
        },
    });
    return wrappedTypeFunc;
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
let uidExp = 0;
class PBShaderExp extends Proxiable {
    $uid;
    $str;
    $location;
    $typeinfo;
    $global;
    $sampleType;
    $precision;
    $ast;
    $inout;
    $memberCache;
    $attrib;
    $tags;
    $group;
    $declareType;
    constructor(str, typeInfo) {
        super();
        if (!str && typeInfo.isPointerType()) {
            throw new Error('no default constructor for pointer type');
        }
        this.$uid = uidExp++;
        this.$str = str || '';
        this.$location = 0;
        this.$global = false;
        this.$typeinfo = typeInfo;
        this.$qualifier = null;
        this.$precision = ShaderPrecisionType.NONE;
        this.$ast = new ASTPrimitive(this);
        this.$inout = null;
        this.$memberCache = {};
        this.$attrib = null;
        this.$tags = [];
        this.$group = null;
        this.$declareType = DeclareType.DECLARE_TYPE_NONE;
        if (typeInfo.isTextureType()) {
            if (typeInfo.isDepthTexture()) {
                this.$sampleType = 'depth';
            }
            else {
                const t = getTextureSampleType(typeInfo);
                if (t.primitiveType === PBPrimitiveType.I32) {
                    this.$sampleType = 'sint';
                }
                else if (t.primitiveType === PBPrimitiveType.U32) {
                    this.$sampleType = 'uint';
                }
                else {
                    this.$sampleType = 'float';
                }
            }
        }
    }
    uniform(group) {
        this.$declareType = DeclareType.DECLARE_TYPE_UNIFORM;
        this.$group = group;
        return this;
    }
    workgroup() {
        this.$declareType = DeclareType.DECLARE_TYPE_WORKGROUP;
        return this;
    }
    storage(group) {
        if (!this.$typeinfo.isHostSharable()) {
            throw new PBASTError(this.$ast, 'type cannot be declared in storage address space');
        }
        this.$declareType = DeclareType.DECLARE_TYPE_STORAGE;
        this.$group = group;
        return this;
    }
    attrib(attr) {
        this.$declareType = DeclareType.DECLARE_TYPE_IN;
        this.$attrib = attr;
        return this;
    }
    tag(...args) {
        args.forEach(val => {
            if (this.$tags.indexOf(val) < 0) {
                this.$tags.push(val);
            }
        });
        return this;
    }
    sampleType(type) {
        if (type) {
            this.$sampleType = type;
        }
        return this;
    }
    at(index) {
        const varType = this.$ast.getType();
        if (!varType.isArrayType()) {
            throw new Error('at() function must be used with array types');
        }
        if (typeof index === 'number') {
            if (!Number.isInteger(index)) {
                throw new Error('at() array index must be integer type');
            }
            if (index < 0 || (varType.dimension > 0 && index >= varType.dimension)) {
                throw new Error('at() array index out of bounds');
            }
        }
        const result = new PBShaderExp('', varType.elementType);
        result.$ast = new ASTArrayIndex(this.$ast, typeof index === 'number' ? new ASTScalar(index, typeI32) : index.$ast, varType.elementType);
        return result;
    }
    setAt(index, val) {
        const varType = this.$ast.getType();
        if (!varType.isArrayType()) {
            throw new Error('setAt() function must be used with array types');
        }
        if (typeof index === 'number') {
            if (!Number.isInteger(index)) {
                throw new Error('setAt() array index must be integer type');
            }
            if (index < 0 || (varType.dimension > 0 && index >= varType.dimension)) {
                throw new Error('setAt() array index out of bounds');
            }
        }
        currentProgramBuilder.currentScope().$ast.statements.push(new ASTAssignment(new ASTLValueArray(new ASTLValueScalar(this.$ast), typeof index === 'number' ? new ASTScalar(index, typeI32) : index.$ast, varType.elementType), val instanceof PBShaderExp ? val.$ast : val));
    }
    highp() {
        this.$precision = ShaderPrecisionType.HIGH;
        return this;
    }
    mediump() {
        this.$precision = ShaderPrecisionType.MEDIUM;
        return this;
    }
    lowp() {
        this.$precision = ShaderPrecisionType.LOW;
        return this;
    }
    isVector() {
        const varType = this.$ast.getType();
        return varType.isPrimitiveType() && varType.isVectorType();
    }
    numComponents() {
        const varType = this.$ast.getType();
        return varType.isPrimitiveType() ? varType.cols : 0;
    }
    getTypeName() {
        return this.$ast.getType().toTypeName(currentProgramBuilder.getDeviceType());
    }
    $get(prop) {
        if (typeof prop === 'string') {
            if (prop[0] === '$' || prop in this) {
                return this[prop];
            }
            else {
                let exp = this.$memberCache[prop];
                if (!exp) {
                    const varType = this.$ast?.getType() || this.$typeinfo;
                    const num = Number(prop);
                    if (Number.isNaN(num)) {
                        if (varType.isStructType()) {
                            const elementIndex = varType.structMembers.findIndex(val => val.name === prop);
                            if (elementIndex < 0) {
                                throw new Error(`unknown struct member '${prop}'`);
                            }
                            const element = varType.structMembers[elementIndex];
                            if (element.type.isStructType()) {
                                const ctor = currentProgramBuilder.structInfo.structs[element.type.structName];
                                exp = ctor.call(currentProgramBuilder, `${this.$str}.${prop}`);
                            }
                            else {
                                exp = new PBShaderExp(`${this.$str}.${prop}`, element.type);
                            }
                            exp.$ast = new ASTHash(this.$ast, prop, element.type);
                        }
                        else {
                            if (!varType.isPrimitiveType() || !varType.isVectorType()) {
                                throw new Error(`invalid index operation: ${this.$ast.toString(currentProgramBuilder.getDeviceType())}[${prop}]`);
                            }
                            if (prop.length === 0
                                || prop.length > varType.cols
                                || ([...prop].some(val => 'xyzw'.slice(0, varType.cols).indexOf(val) < 0)
                                    && [...prop].some(val => 'rgba'.slice(0, varType.cols).indexOf(val) < 0))) {
                                throw new Error(`unknown swizzle target: ${this.$ast.toString(currentProgramBuilder.getDeviceType())}[${prop}]`);
                            }
                            const type = PBPrimitiveTypeInfo.getCachedTypeInfo(varType.resizeType(1, prop.length));
                            exp = new PBShaderExp('', type);
                            exp.$ast = new ASTHash(this.$ast, prop, type);
                        }
                    }
                    else {
                        if (varType.isArrayType()) {
                            exp = this.at(num);
                        }
                        else if (varType.isPrimitiveType() && varType.isVectorType()) {
                            if (num >= varType.cols) {
                                throw new Error(`component index out of bounds: ${this.$str}[${num}]`);
                            }
                            exp = this.$get('xyzw'[num]);
                        }
                        else if (varType.isPrimitiveType() && varType.isMatrixType()) {
                            const type = PBPrimitiveTypeInfo.getCachedTypeInfo(varType.resizeType(1, varType.cols));
                            exp = new PBShaderExp('', type);
                            exp.$ast = new ASTArrayIndex(this.$ast, new ASTScalar(num, typeI32), type);
                        }
                        else {
                            throw new Error(`invalid index operation: ${this.$str}[${num}]`);
                        }
                    }
                    this.$memberCache[prop] = exp;
                }
                return exp;
            }
        }
        else {
            return undefined;
        }
    }
    $set(prop, value) {
        if (typeof prop === 'string') {
            if (prop[0] === '$' || prop in this) {
                this[prop] = value;
            }
            else {
                if ((typeof value !== 'number') && (typeof value !== 'boolean') && !(value instanceof PBShaderExp)) {
                    throw new Error(`Invalid output value assignment`);
                }
                const varType = this.$ast?.getType() || this.$typeinfo;
                const num = Number(prop);
                if (Number.isNaN(num)) {
                    if (varType.isStructType()) {
                        const elementIndex = varType.structMembers.findIndex(val => val.name === prop);
                        if (elementIndex < 0) {
                            throw new Error(`unknown struct member '${prop}`);
                        }
                        const element = varType.structMembers[elementIndex];
                        let dstAST;
                        if (typeof value === 'number' || typeof value === 'boolean') {
                            if (!element.type.isPrimitiveType() || !element.type.isScalarType()) {
                                throw new Error(`can not set struct member '${prop}: invalid value type`);
                            }
                            dstAST = new ASTScalar(value, element.type);
                        }
                        else if (value instanceof PBShaderExp) {
                            dstAST = value.$ast;
                        }
                        if (!dstAST) {
                            throw new Error(`can not set struct member '${prop}: invalid value type`);
                        }
                        currentProgramBuilder.currentScope().$ast.statements.push(new ASTAssignment(new ASTLValueHash(new ASTLValueScalar(this.$ast), prop, element.type), dstAST));
                    }
                    else {
                        if (prop.length > 1 || ('xyzw'.indexOf(prop) < 0 && 'rgba'.indexOf(prop) < 0)) {
                            throw new Error(`invalid index operation: ${this.$str}[${num}]`);
                        }
                        if (!varType.isPrimitiveType() || !varType.isVectorType()) {
                            throw new Error(`invalid index operation: ${this.$str}[${num}]`);
                        }
                        const type = PBPrimitiveTypeInfo.getCachedTypeInfo(varType.scalarType);
                        currentProgramBuilder.currentScope().$ast.statements.push(new ASTAssignment(new ASTLValueHash(new ASTLValueScalar(this.$ast), prop, type), value instanceof PBShaderExp ? value.$ast : value));
                    }
                }
                else {
                    if (varType.isArrayType()) {
                        this.setAt(num, value);
                    }
                    else if (varType.isPrimitiveType() && varType.isVectorType()) {
                        if (num >= varType.cols) {
                            throw new Error(`component index out of bounds: ${this.$str}[${num}]`);
                        }
                        this.$set('xyzw'[num], value);
                    }
                    else if (varType.isPrimitiveType() && varType.isMatrixType()) {
                        if (!(value instanceof PBShaderExp)) {
                            throw new Error(`invalid matrix column vector assignment: ${this.$str}[${num}]`);
                        }
                        const type = PBPrimitiveTypeInfo.getCachedTypeInfo(varType.resizeType(1, varType.cols));
                        currentProgramBuilder.currentScope().$ast.statements.push(new ASTAssignment(new ASTLValueArray(new ASTLValueScalar(this.$ast), new ASTScalar(num, typeI32), type), value.$ast));
                    }
                    else {
                        throw new Error(`invalid index operation: ${this.$str}[${num}]`);
                    }
                }
            }
            return true;
        }
        return false;
    }
}

export { PBShaderExp, Proxiable, getCurrentProgramBuilder, makeConstructor, setCurrentProgramBuilder };
//# sourceMappingURL=base.js.map
