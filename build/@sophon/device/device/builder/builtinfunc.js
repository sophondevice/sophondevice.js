/** sophon base library */
import { PBPrimitiveType, typeU32, typeF32, PBFunctionTypeInfo, typeF32Vec2, typeF32Vec3, typeF32Vec4, typeI32, typeI32Vec2, typeI32Vec3, typeI32Vec4, typeU32Vec2, typeU32Vec3, typeU32Vec4, typeMat2, typeMat3x2, typeMat4x2, typeMat2x3, typeMat3, typeMat4x3, typeMat2x4, typeMat3x4, typeMat4, typeFrexpResult, typeFrexpResultVec2, typeFrexpResultVec3, typeFrexpResultVec4, typeBool, typeTex1D, typeITex1D, typeUTex1D, typeTex2D, typeITex2D, typeUTex2D, typeTex2DArray, typeITex2DArray, typeUTex2DArray, typeTex3D, typeITex3D, typeUTex3D, typeTexCube, typeITexCube, typeUTexCube, typeTexCubeArray, typeITexCubeArray, typeUTexCubeArray, typeTexMultisampled2D, typeITexMultisampled2D, typeUTexMultisampled2D, typeTexDepth2D, typeTexDepth2DArray, typeTexDepthCube, typeTexDepthCubeArray, typeTexDepthMultisampled2D, typeTexStorage1D_rgba8unorm, typeTexStorage1D_rgba8snorm, typeTexStorage1D_rgba8uint, typeTexStorage1D_rgba8sint, typeTexStorage1D_rgba16uint, typeTexStorage1D_rgba16sint, typeTexStorage1D_rgba16float, typeTexStorage1D_rgba32uint, typeTexStorage1D_rgba32sint, typeTexStorage1D_rgba32float, typeTexStorage1D_rg32uint, typeTexStorage1D_rg32sint, typeTexStorage1D_rg32float, typeTexStorage1D_r32uint, typeTexStorage1D_r32sint, typeTexStorage1D_r32float, typeTexStorage2D_rgba8unorm, typeTexStorage2D_rgba8snorm, typeTexStorage2D_rgba8uint, typeTexStorage2D_rgba8sint, typeTexStorage2D_rgba16uint, typeTexStorage2D_rgba16sint, typeTexStorage2D_rgba16float, typeTexStorage2D_rgba32uint, typeTexStorage2D_rgba32sint, typeTexStorage2D_rgba32float, typeTexStorage2D_rg32uint, typeTexStorage2D_rg32sint, typeTexStorage2D_rg32float, typeTexStorage2D_r32uint, typeTexStorage2D_r32sint, typeTexStorage2D_r32float, typeTexStorage2DArray_rgba8unorm, typeTexStorage2DArray_rgba8snorm, typeTexStorage2DArray_rgba8uint, typeTexStorage2DArray_rgba8sint, typeTexStorage2DArray_rgba16uint, typeTexStorage2DArray_rgba16sint, typeTexStorage2DArray_rgba16float, typeTexStorage2DArray_rgba32uint, typeTexStorage2DArray_rgba32sint, typeTexStorage2DArray_rgba32float, typeTexStorage2DArray_rg32uint, typeTexStorage2DArray_rg32sint, typeTexStorage2DArray_rg32float, typeTexStorage2DArray_r32uint, typeTexStorage2DArray_r32sint, typeTexStorage2DArray_r32float, typeTexStorage3D_rgba8unorm, typeTexStorage3D_rgba8snorm, typeTexStorage3D_rgba8uint, typeTexStorage3D_rgba8sint, typeTexStorage3D_rgba16uint, typeTexStorage3D_rgba16sint, typeTexStorage3D_rgba16float, typeTexStorage3D_rgba32uint, typeTexStorage3D_rgba32sint, typeTexStorage3D_rgba32float, typeTexStorage3D_rg32uint, typeTexStorage3D_rg32sint, typeTexStorage3D_rg32float, typeTexStorage3D_r32uint, typeTexStorage3D_r32sint, typeTexStorage3D_r32float, typeSampler, typeSamplerComparison, typeTexExternal, typeVoid, typeBVec2, typeBVec3, typeBVec4 } from './types.js';
import { ASTUnaryFunc, ASTBinaryFunc } from './ast.js';
import { PBShaderExp } from './base.js';
import { PBParamLengthError, PBDeviceNotSupport, PBParamTypeError, PBParamValueError, PBOverloadingMatchError } from './errors.js';

const genTypeList = [
    [typeF32, typeF32Vec2, typeF32Vec3, typeF32Vec4],
    [typeI32, typeI32Vec2, typeI32Vec3, typeI32Vec4],
    [typeU32, typeU32Vec2, typeU32Vec3, typeU32Vec4],
    [typeBool, typeBVec2, typeBVec3, typeBVec4],
];
const genMatrixTypeList = [
    typeMat2, typeMat2x3, typeMat2x4,
    typeMat3x2, typeMat3, typeMat3x4,
    typeMat4x2, typeMat4x3, typeMat4
];
function matchFunctionOverloadings(pb, name, ...args) {
    const bit = pb.getDeviceType() === 'webgl' ? MASK_WEBGL1 : (pb.getDeviceType() === 'webgl2' ? MASK_WEBGL2 : MASK_WEBGPU);
    const overloadings = builtinFunctionsAll?.[name].overloads.filter(val => !!(val[1] & bit)).map(val => val[0]);
    if (!overloadings || overloadings.length === 0) {
        throw new PBDeviceNotSupport(`builtin shader function '${name}'`);
    }
    const argsNonArray = args.map(val => pb.normalizeExpValue(val));
    const matchResult = pb._matchFunctionOverloading(overloadings, argsNonArray);
    if (!matchResult) {
        throw new PBOverloadingMatchError(name);
    }
    return matchResult;
}
function callBuiltinChecked(pb, matchResult) {
    return pb.$callFunction(matchResult[0].name, matchResult[1], matchResult[0].returnType);
}
function callBuiltin(pb, name, ...args) {
    return callBuiltinChecked(pb, matchFunctionOverloadings(pb, name, ...args));
}
function genMatrixType(name, shaderTypeMask, r, args) {
    const result = [];
    for (let i = 0; i < genMatrixTypeList.length; i++) {
        const returnType = r || genMatrixTypeList[i];
        const argTypes = args.map(arg => {
            return { type: arg || genMatrixTypeList[i] };
        });
        result.push([new PBFunctionTypeInfo(name, returnType, argTypes), shaderTypeMask]);
    }
    return result;
}
function genType(name, shaderTypeMask, r, args, vecOnly) {
    if (args.findIndex(val => (typeof val === 'number')) < 0) {
        return [[new PBFunctionTypeInfo(name, r, args.map(arg => ({ type: arg }))), shaderTypeMask]];
    }
    else {
        const result = [];
        let i = vecOnly ? 1 : 0;
        for (; i < 4; i++) {
            const returnType = typeof r === 'number' ? genTypeList[r][i] : r;
            const argTypes = args.map(arg => {
                if (typeof arg === 'number') {
                    return { type: genTypeList[arg][i] };
                }
                else {
                    return { type: arg };
                }
            });
            result.push([new PBFunctionTypeInfo(name, returnType, argTypes), shaderTypeMask]);
        }
        return result;
    }
}
function unaryFunc(a, op, type) {
    const exp = new PBShaderExp('', type);
    exp.$ast = new ASTUnaryFunc(a, op, type);
    return exp;
}
function binaryFunc(a, b, op, type) {
    const exp = new PBShaderExp('', type);
    exp.$ast = new ASTBinaryFunc(a, b, op, type);
    return exp;
}
const MASK_WEBGL1 = 1 << 0;
const MASK_WEBGL2 = 1 << 1;
const MASK_WEBGPU = 1 << 2;
const MASK_WEBGL = MASK_WEBGL1 | MASK_WEBGL2;
const MASK_ALL = MASK_WEBGL | MASK_WEBGPU;
const builtinFunctionsAll = {
    add_2: {
        overloads: [
            ...genType('', MASK_ALL, 0, [0, 0]),
            ...genType('', MASK_ALL, 1, [1, 1]),
            ...genType('', MASK_ALL, 2, [2, 2]),
            ...genType('', MASK_ALL, 3, [3, 3]),
            ...genType('', MASK_ALL, typeF32Vec2, [typeF32, typeF32Vec2]),
            ...genType('', MASK_ALL, typeF32Vec2, [typeF32Vec2, typeF32]),
            ...genType('', MASK_ALL, typeF32Vec3, [typeF32, typeF32Vec3]),
            ...genType('', MASK_ALL, typeF32Vec3, [typeF32Vec3, typeF32]),
            ...genType('', MASK_ALL, typeF32Vec4, [typeF32, typeF32Vec4]),
            ...genType('', MASK_ALL, typeF32Vec4, [typeF32Vec4, typeF32]),
            ...genType('', MASK_ALL, typeI32Vec2, [typeI32, typeI32Vec2]),
            ...genType('', MASK_ALL, typeI32Vec2, [typeI32Vec2, typeI32]),
            ...genType('', MASK_ALL, typeI32Vec3, [typeI32, typeI32Vec3]),
            ...genType('', MASK_ALL, typeI32Vec3, [typeI32Vec3, typeI32]),
            ...genType('', MASK_ALL, typeI32Vec4, [typeI32, typeI32Vec4]),
            ...genType('', MASK_ALL, typeI32Vec4, [typeI32Vec4, typeI32]),
            ...genType('', MASK_ALL, typeU32Vec2, [typeU32, typeU32Vec2]),
            ...genType('', MASK_ALL, typeU32Vec2, [typeU32Vec2, typeU32]),
            ...genType('', MASK_ALL, typeU32Vec3, [typeU32, typeU32Vec3]),
            ...genType('', MASK_ALL, typeU32Vec3, [typeU32Vec3, typeU32]),
            ...genType('', MASK_ALL, typeU32Vec4, [typeU32, typeU32Vec4]),
            ...genType('', MASK_ALL, typeU32Vec4, [typeU32Vec4, typeU32]),
            ...genMatrixType('', MASK_ALL, null, [null, null]),
        ],
        normalizeFunc(pb, name, ...args) {
            const matchResult = matchFunctionOverloadings(pb, name, ...args);
            return binaryFunc(matchResult[1][0], matchResult[1][1], '+', matchResult[0].returnType);
        }
    },
    add: {
        overloads: [],
        normalizeFunc(pb, name, ...args) {
            if (args.length < 2) {
                throw new PBParamLengthError('add');
            }
            let result = args[0];
            for (let i = 1; i < args.length; i++) {
                result = pb.add_2(result, args[i]);
            }
            return result;
        }
    },
    sub: {
        overloads: [
            ...genType('', MASK_ALL, 0, [0, 0]),
            ...genType('', MASK_ALL, 1, [1, 1]),
            ...genType('', MASK_ALL, 2, [2, 2]),
            ...genType('', MASK_ALL, 3, [3, 3]),
            ...genType('', MASK_ALL, typeF32Vec2, [typeF32, typeF32Vec2]),
            ...genType('', MASK_ALL, typeF32Vec2, [typeF32Vec2, typeF32]),
            ...genType('', MASK_ALL, typeF32Vec3, [typeF32, typeF32Vec3]),
            ...genType('', MASK_ALL, typeF32Vec3, [typeF32Vec3, typeF32]),
            ...genType('', MASK_ALL, typeF32Vec4, [typeF32, typeF32Vec4]),
            ...genType('', MASK_ALL, typeF32Vec4, [typeF32Vec4, typeF32]),
            ...genType('', MASK_ALL, typeI32Vec2, [typeI32, typeI32Vec2]),
            ...genType('', MASK_ALL, typeI32Vec2, [typeI32Vec2, typeI32]),
            ...genType('', MASK_ALL, typeI32Vec3, [typeI32, typeI32Vec3]),
            ...genType('', MASK_ALL, typeI32Vec3, [typeI32Vec3, typeI32]),
            ...genType('', MASK_ALL, typeI32Vec4, [typeI32, typeI32Vec4]),
            ...genType('', MASK_ALL, typeI32Vec4, [typeI32Vec4, typeI32]),
            ...genType('', MASK_ALL, typeU32Vec2, [typeU32, typeU32Vec2]),
            ...genType('', MASK_ALL, typeU32Vec2, [typeU32Vec2, typeU32]),
            ...genType('', MASK_ALL, typeU32Vec3, [typeU32, typeU32Vec3]),
            ...genType('', MASK_ALL, typeU32Vec3, [typeU32Vec3, typeU32]),
            ...genType('', MASK_ALL, typeU32Vec4, [typeU32, typeU32Vec4]),
            ...genType('', MASK_ALL, typeU32Vec4, [typeU32Vec4, typeU32]),
            ...genMatrixType('', MASK_ALL, null, [null, null]),
        ],
        normalizeFunc(pb, name, ...args) {
            const matchResult = matchFunctionOverloadings(pb, name, ...args);
            return binaryFunc(matchResult[1][0], matchResult[1][1], '-', matchResult[0].returnType);
        }
    },
    div: {
        overloads: [
            ...genType('', MASK_ALL, 0, [0, 0]),
            ...genType('', MASK_ALL, 1, [1, 1]),
            ...genType('', MASK_ALL, 2, [2, 2]),
            ...genType('', MASK_ALL, 3, [3, 3]),
            ...genType('', MASK_ALL, typeF32Vec2, [typeF32, typeF32Vec2]),
            ...genType('', MASK_ALL, typeF32Vec2, [typeF32Vec2, typeF32]),
            ...genType('', MASK_ALL, typeF32Vec3, [typeF32, typeF32Vec3]),
            ...genType('', MASK_ALL, typeF32Vec3, [typeF32Vec3, typeF32]),
            ...genType('', MASK_ALL, typeF32Vec4, [typeF32, typeF32Vec4]),
            ...genType('', MASK_ALL, typeF32Vec4, [typeF32Vec4, typeF32]),
            ...genType('', MASK_ALL, typeI32Vec2, [typeI32, typeI32Vec2]),
            ...genType('', MASK_ALL, typeI32Vec2, [typeI32Vec2, typeI32]),
            ...genType('', MASK_ALL, typeI32Vec3, [typeI32, typeI32Vec3]),
            ...genType('', MASK_ALL, typeI32Vec3, [typeI32Vec3, typeI32]),
            ...genType('', MASK_ALL, typeI32Vec4, [typeI32, typeI32Vec4]),
            ...genType('', MASK_ALL, typeI32Vec4, [typeI32Vec4, typeI32]),
            ...genType('', MASK_ALL, typeU32Vec2, [typeU32, typeU32Vec2]),
            ...genType('', MASK_ALL, typeU32Vec2, [typeU32Vec2, typeU32]),
            ...genType('', MASK_ALL, typeU32Vec3, [typeU32, typeU32Vec3]),
            ...genType('', MASK_ALL, typeU32Vec3, [typeU32Vec3, typeU32]),
            ...genType('', MASK_ALL, typeU32Vec4, [typeU32, typeU32Vec4]),
            ...genType('', MASK_ALL, typeU32Vec4, [typeU32Vec4, typeU32]),
        ],
        normalizeFunc(pb, name, ...args) {
            const matchResult = matchFunctionOverloadings(pb, name, ...args);
            return binaryFunc(matchResult[1][0], matchResult[1][1], '/', matchResult[0].returnType);
        }
    },
    mul_2: {
        overloads: [
            ...genType('', MASK_ALL, 0, [0, 0]),
            ...genType('', MASK_ALL, 1, [1, 1]),
            ...genType('', MASK_ALL, 2, [2, 2]),
            ...genType('', MASK_ALL, 3, [3, 3]),
            ...genType('', MASK_ALL, typeF32Vec2, [typeF32, typeF32Vec2]),
            ...genType('', MASK_ALL, typeF32Vec2, [typeF32Vec2, typeF32]),
            ...genType('', MASK_ALL, typeF32Vec3, [typeF32, typeF32Vec3]),
            ...genType('', MASK_ALL, typeF32Vec3, [typeF32Vec3, typeF32]),
            ...genType('', MASK_ALL, typeF32Vec4, [typeF32, typeF32Vec4]),
            ...genType('', MASK_ALL, typeF32Vec4, [typeF32Vec4, typeF32]),
            ...genType('', MASK_ALL, typeI32Vec2, [typeI32, typeI32Vec2]),
            ...genType('', MASK_ALL, typeI32Vec2, [typeI32Vec2, typeI32]),
            ...genType('', MASK_ALL, typeI32Vec3, [typeI32, typeI32Vec3]),
            ...genType('', MASK_ALL, typeI32Vec3, [typeI32Vec3, typeI32]),
            ...genType('', MASK_ALL, typeI32Vec4, [typeI32, typeI32Vec4]),
            ...genType('', MASK_ALL, typeI32Vec4, [typeI32Vec4, typeI32]),
            ...genType('', MASK_ALL, typeU32Vec2, [typeU32, typeU32Vec2]),
            ...genType('', MASK_ALL, typeU32Vec2, [typeU32Vec2, typeU32]),
            ...genType('', MASK_ALL, typeU32Vec3, [typeU32, typeU32Vec3]),
            ...genType('', MASK_ALL, typeU32Vec3, [typeU32Vec3, typeU32]),
            ...genType('', MASK_ALL, typeU32Vec4, [typeU32, typeU32Vec4]),
            ...genType('', MASK_ALL, typeU32Vec4, [typeU32Vec4, typeU32]),
            ...genMatrixType('', MASK_ALL, null, [typeF32, null]),
            ...genMatrixType('', MASK_ALL, null, [null, typeF32]),
            ...genType('', MASK_ALL, typeMat2, [typeMat2, typeMat2]),
            ...genType('', MASK_ALL, typeMat3x2, [typeMat2, typeMat3x2]),
            ...genType('', MASK_ALL, typeMat4x2, [typeMat2, typeMat4x2]),
            ...genType('', MASK_ALL, typeF32Vec2, [typeMat2, typeF32Vec2]),
            ...genType('', MASK_ALL, typeF32Vec2, [typeF32Vec2, typeMat2]),
            ...genType('', MASK_ALL, typeMat2x3, [typeMat2x3, typeMat2]),
            ...genType('', MASK_ALL, typeMat3, [typeMat2x3, typeMat3x2]),
            ...genType('', MASK_ALL, typeMat4x3, [typeMat2x3, typeMat4x2]),
            ...genType('', MASK_ALL, typeF32Vec3, [typeMat2x3, typeF32Vec2]),
            ...genType('', MASK_ALL, typeF32Vec2, [typeF32Vec3, typeMat2x3]),
            ...genType('', MASK_ALL, typeMat2x4, [typeMat2x4, typeMat2]),
            ...genType('', MASK_ALL, typeMat3x4, [typeMat2x4, typeMat3x2]),
            ...genType('', MASK_ALL, typeMat4, [typeMat2x4, typeMat4x2]),
            ...genType('', MASK_ALL, typeF32Vec4, [typeMat2x4, typeF32Vec2]),
            ...genType('', MASK_ALL, typeF32Vec2, [typeF32Vec4, typeMat2x4]),
            ...genType('', MASK_ALL, typeMat2, [typeMat3x2, typeMat2x3]),
            ...genType('', MASK_ALL, typeMat3x2, [typeMat3x2, typeMat3]),
            ...genType('', MASK_ALL, typeMat4x2, [typeMat3x2, typeMat4x3]),
            ...genType('', MASK_ALL, typeF32Vec2, [typeMat3x2, typeF32Vec3]),
            ...genType('', MASK_ALL, typeF32Vec3, [typeF32Vec2, typeMat3x2]),
            ...genType('', MASK_ALL, typeMat2x3, [typeMat3, typeMat2x3]),
            ...genType('', MASK_ALL, typeMat3, [typeMat3, typeMat3]),
            ...genType('', MASK_ALL, typeMat4x3, [typeMat3, typeMat4x3]),
            ...genType('', MASK_ALL, typeF32Vec3, [typeMat3, typeF32Vec3]),
            ...genType('', MASK_ALL, typeF32Vec3, [typeF32Vec3, typeMat3]),
            ...genType('', MASK_ALL, typeMat2x4, [typeMat3x4, typeMat2x3]),
            ...genType('', MASK_ALL, typeMat3x4, [typeMat3x4, typeMat3]),
            ...genType('', MASK_ALL, typeMat4, [typeMat3x4, typeMat4x3]),
            ...genType('', MASK_ALL, typeF32Vec4, [typeMat3x4, typeF32Vec3]),
            ...genType('', MASK_ALL, typeF32Vec3, [typeF32Vec4, typeMat3x4]),
            ...genType('', MASK_ALL, typeMat2, [typeMat4x2, typeMat2x4]),
            ...genType('', MASK_ALL, typeMat3x2, [typeMat4x2, typeMat3x4]),
            ...genType('', MASK_ALL, typeMat4x2, [typeMat4x2, typeMat4]),
            ...genType('', MASK_ALL, typeF32Vec2, [typeMat4x2, typeF32Vec4]),
            ...genType('', MASK_ALL, typeF32Vec4, [typeF32Vec2, typeMat4x2]),
            ...genType('', MASK_ALL, typeMat2x3, [typeMat4x3, typeMat2x4]),
            ...genType('', MASK_ALL, typeMat3, [typeMat4x3, typeMat3x4]),
            ...genType('', MASK_ALL, typeMat4x3, [typeMat4x3, typeMat4]),
            ...genType('', MASK_ALL, typeF32Vec3, [typeMat4x3, typeF32Vec4]),
            ...genType('', MASK_ALL, typeF32Vec4, [typeF32Vec3, typeMat4x3]),
            ...genType('', MASK_ALL, typeMat2x4, [typeMat4, typeMat2x4]),
            ...genType('', MASK_ALL, typeMat3x4, [typeMat4, typeMat3x4]),
            ...genType('', MASK_ALL, typeMat4, [typeMat4, typeMat4]),
            ...genType('', MASK_ALL, typeF32Vec4, [typeMat4, typeF32Vec4]),
            ...genType('', MASK_ALL, typeF32Vec4, [typeF32Vec4, typeMat4]),
        ],
        normalizeFunc(pb, name, ...args) {
            const matchResult = matchFunctionOverloadings(pb, name, ...args);
            return binaryFunc(matchResult[1][0], matchResult[1][1], '*', matchResult[0].returnType);
        }
    },
    mul: {
        overloads: [],
        normalizeFunc(pb, name, ...args) {
            if (args.length < 2) {
                throw new PBParamLengthError('mul');
            }
            let result = args[0];
            for (let i = 1; i < args.length; i++) {
                result = pb.mul_2(result, args[i]);
            }
            return result;
        }
    },
    mod: {
        overloads: [
            ...genType('mod', MASK_ALL, 0, [0, 0]),
            ...genType('mod', MASK_ALL, 1, [1, 1]),
            ...genType('mod', MASK_ALL, 2, [2, 2]),
            ...genType('mod', MASK_ALL, 3, [3, 3]),
        ],
        normalizeFunc(pb, name, ...args) {
            const matchResult = matchFunctionOverloadings(pb, name, ...args);
            const argType = matchResult[1][0].getType();
            const isIntegerType = argType.isPrimitiveType() && (argType.scalarType === PBPrimitiveType.I32 || argType.scalarType === PBPrimitiveType.U32);
            if (pb.getDeviceType() === 'webgl' && isIntegerType) {
                throw new PBDeviceNotSupport('integer modulus');
            }
            if (pb.getDeviceType() === 'webgpu' || isIntegerType) {
                return binaryFunc(matchResult[1][0], matchResult[1][1], '%', matchResult[0].returnType);
            }
            else {
                return callBuiltinChecked(pb, matchResult);
            }
        }
    },
    radians: { overloads: genType('radians', MASK_ALL, 0, [0]) },
    degrees: { overloads: genType('degrees', MASK_ALL, 0, [0]) },
    sin: { overloads: genType('sin', MASK_ALL, 0, [0]) },
    cos: { overloads: genType('cos', MASK_ALL, 0, [0]) },
    tan: { overloads: genType('tan', MASK_ALL, 0, [0]) },
    asin: { overloads: genType('asin', MASK_ALL, 0, [0]) },
    acos: { overloads: genType('acos', MASK_ALL, 0, [0]) },
    atan: { overloads: genType('atan', MASK_ALL, 0, [0]) },
    atan2: {
        overloads: [
            ...genType('atan', MASK_WEBGL, 0, [0, 0]),
            ...genType('atan2', MASK_WEBGPU, 0, [0, 0]),
        ]
    },
    sinh: { overloads: genType('sinh', MASK_WEBGL2 | MASK_WEBGPU, 0, [0]) },
    cosh: { overloads: genType('cosh', MASK_WEBGL2 | MASK_WEBGPU, 0, [0]) },
    tanh: { overloads: genType('tanh', MASK_WEBGL2 | MASK_WEBGPU, 0, [0]) },
    asinh: { overloads: genType('asinh', MASK_WEBGL2, 0, [0]) },
    acosh: { overloads: genType('acosh', MASK_WEBGL2, 0, [0]) },
    atanh: { overloads: genType('atanh', MASK_WEBGL2, 0, [0]) },
    pow: { overloads: genType('pow', MASK_ALL, 0, [0, 0]) },
    exp: { overloads: genType('exp', MASK_ALL, 0, [0]) },
    exp2: { overloads: genType('exp2', MASK_ALL, 0, [0]) },
    log: { overloads: genType('log', MASK_ALL, 0, [0]) },
    log2: { overloads: genType('log2', MASK_ALL, 0, [0]) },
    sqrt: { overloads: genType('sqrt', MASK_ALL, 0, [0]) },
    inverseSqrt: {
        overloads: [
            ...genType('inversesqrt', MASK_WEBGL, 0, [0]),
            ...genType('inverseSqrt', MASK_WEBGPU, 0, [0])
        ]
    },
    abs: {
        overloads: [
            ...genType('abs', MASK_ALL, 0, [0]),
            ...genType('abs', MASK_WEBGL2 | MASK_WEBGPU, 1, [1]),
            ...genType('abs', MASK_WEBGPU, 2, [2])
        ]
    },
    sign: {
        overloads: [
            ...genType('sign', MASK_ALL, 0, [0]),
            ...genType('sign', MASK_WEBGL2, 1, [1])
        ]
    },
    floor: { overloads: genType('floor', MASK_ALL, 0, [0]) },
    ceil: { overloads: genType('ceil', MASK_ALL, 0, [0]) },
    fract: { overloads: genType('fract', MASK_ALL, 0, [0]) },
    fma: { overloads: genType('fma', MASK_WEBGPU, 0, [0, 0, 0]) },
    round: { overloads: genType('round', MASK_WEBGPU, 0, [0]) },
    trunc: { overloads: genType('trunc', MASK_WEBGPU, 0, [0]) },
    min: {
        overloads: [
            ...genType('min', MASK_ALL, 0, [0, 0]),
            ...genType('min', MASK_WEBGL2 | MASK_WEBGPU, 1, [1, 1]),
            ...genType('min', MASK_WEBGL2 | MASK_WEBGPU, 2, [2, 2]),
        ]
    },
    max: {
        overloads: [
            ...genType('max', MASK_ALL, 0, [0, 0]),
            ...genType('max', MASK_WEBGL2 | MASK_WEBGPU, 1, [1, 1]),
            ...genType('max', MASK_WEBGL2 | MASK_WEBGPU, 2, [2, 2]),
        ]
    },
    clamp: {
        overloads: [
            ...genType('clamp', MASK_ALL, 0, [0, 0, 0]),
            ...genType('clamp', MASK_WEBGL2 | MASK_WEBGPU, 1, [1, 1, 1]),
            ...genType('clamp', MASK_WEBGL2 | MASK_WEBGPU, 2, [2, 2, 2]),
        ]
    },
    mix: {
        overloads: [
            ...genType('mix', MASK_ALL, 0, [0, 0, 0]),
            ...genType('mix', MASK_ALL, 0, [0, 0, typeF32]),
        ]
    },
    step: { overloads: genType('step', MASK_ALL, 0, [0, 0]) },
    smoothStep: { overloads: genType('smoothstep', MASK_ALL, 0, [0, 0, 0]) },
    isnan: { overloads: genType('isnan', MASK_WEBGL2, 3, [0]) },
    isinf: { overloads: genType('isinf', MASK_WEBGL2, 3, [0]) },
    length: { overloads: genType('length', MASK_ALL, typeF32, [0]) },
    distance: { overloads: genType('distance', MASK_ALL, typeF32, [0, 0]) },
    dot: {
        overloads: [
            ...genType('dot', MASK_ALL, typeF32, [0, 0], true),
            ...genType('dot', MASK_WEBGPU, typeI32, [1, 1], true),
            ...genType('dot', MASK_WEBGPU, typeU32, [2, 2], true),
        ]
    },
    cross: { overloads: genType('cross', MASK_ALL, typeF32Vec3, [typeF32Vec3, typeF32Vec3]) },
    normalize: { overloads: genType('normalize', MASK_ALL, 0, [0], true) },
    faceForward: {
        overloads: [
            ...genType('faceforward', MASK_WEBGL, 0, [0, 0, 0], true),
            ...genType('faceForward', MASK_WEBGPU, 0, [0, 0, 0], true),
        ]
    },
    reflect: { overloads: genType('reflect', MASK_ALL, 0, [0, 0], true) },
    refract: { overloads: genType('refract', MASK_ALL, 0, [0, 0, typeF32], true) },
    frexp: {
        overloads: [
            ...genType('frexp', MASK_WEBGPU, typeFrexpResult, [typeF32]),
            ...genType('frexp', MASK_WEBGPU, typeFrexpResultVec2, [typeF32Vec2]),
            ...genType('frexp', MASK_WEBGPU, typeFrexpResultVec3, [typeF32Vec3]),
            ...genType('frexp', MASK_WEBGPU, typeFrexpResultVec4, [typeF32Vec4]),
        ]
    },
    outerProduct: {
        overloads: [
            ...genType('outerProduct', MASK_WEBGL2, typeMat2, [typeF32Vec2, typeF32Vec2]),
            ...genType('outerProduct', MASK_WEBGL2, typeMat3, [typeF32Vec3, typeF32Vec3]),
            ...genType('outerProduct', MASK_WEBGL2, typeMat4, [typeF32Vec4, typeF32Vec4]),
            ...genType('outerProduct', MASK_WEBGL2, typeMat2x3, [typeF32Vec3, typeF32Vec2]),
            ...genType('outerProduct', MASK_WEBGL2, typeMat3x2, [typeF32Vec2, typeF32Vec3]),
            ...genType('outerProduct', MASK_WEBGL2, typeMat2x4, [typeF32Vec4, typeF32Vec2]),
            ...genType('outerProduct', MASK_WEBGL2, typeMat4x2, [typeF32Vec2, typeF32Vec4]),
            ...genType('outerProduct', MASK_WEBGL2, typeMat3x4, [typeF32Vec4, typeF32Vec3]),
            ...genType('outerProduct', MASK_WEBGL2, typeMat4x3, [typeF32Vec3, typeF32Vec4]),
        ]
    },
    transpose: {
        overloads: [
            ...genType('transpose', MASK_WEBGL2 | MASK_WEBGPU, typeMat2, [typeMat2]),
            ...genType('transpose', MASK_WEBGL2 | MASK_WEBGPU, typeMat3, [typeMat3]),
            ...genType('transpose', MASK_WEBGL2 | MASK_WEBGPU, typeMat4, [typeMat4]),
            ...genType('transpose', MASK_WEBGL2 | MASK_WEBGPU, typeMat2x3, [typeMat3x2]),
            ...genType('transpose', MASK_WEBGL2 | MASK_WEBGPU, typeMat3x2, [typeMat2x3]),
            ...genType('transpose', MASK_WEBGL2 | MASK_WEBGPU, typeMat2x4, [typeMat4x2]),
            ...genType('transpose', MASK_WEBGL2 | MASK_WEBGPU, typeMat4x2, [typeMat2x4]),
            ...genType('transpose', MASK_WEBGL2 | MASK_WEBGPU, typeMat3x4, [typeMat4x3]),
            ...genType('transpose', MASK_WEBGL2 | MASK_WEBGPU, typeMat4x3, [typeMat3x4]),
        ]
    },
    determinant: {
        overloads: [
            ...genType('determinant', MASK_WEBGL2 | MASK_WEBGPU, typeF32, [typeMat2]),
            ...genType('determinant', MASK_WEBGL2 | MASK_WEBGPU, typeF32, [typeMat3]),
            ...genType('determinant', MASK_WEBGL2 | MASK_WEBGPU, typeF32, [typeMat4]),
        ]
    },
    inverse: {
        overloads: [
            ...genType('inverse', MASK_WEBGL2, typeMat2, [typeMat2]),
            ...genType('inverse', MASK_WEBGL2, typeMat3, [typeMat3]),
            ...genType('inverse', MASK_WEBGL2, typeMat4, [typeMat4]),
        ]
    },
    lessThan: {
        overloads: [
            ...genType('lessThan', MASK_ALL, 3, [0, 0]),
            ...genType('lessThan', MASK_ALL, 3, [1, 1]),
            ...genType('lessThan', MASK_ALL, 3, [2, 2]),
        ],
        normalizeFunc(pb, name, ...args) {
            const matchResult = matchFunctionOverloadings(pb, name, ...args);
            const argType = matchResult[1][0].getType();
            if (pb.getDeviceType() === 'webgpu' || (argType.isPrimitiveType() && argType.isScalarType())) {
                return binaryFunc(matchResult[1][0], matchResult[1][1], '<', matchResult[0].returnType);
            }
            else {
                return callBuiltinChecked(pb, matchResult);
            }
        }
    },
    lessThanEqual: {
        overloads: [
            ...genType('lessThanEqual', MASK_ALL, 3, [0, 0]),
            ...genType('lessThanEqual', MASK_ALL, 3, [1, 1]),
            ...genType('lessThanEqual', MASK_ALL, 3, [2, 2]),
        ],
        normalizeFunc(pb, name, ...args) {
            const matchResult = matchFunctionOverloadings(pb, name, ...args);
            const argType = matchResult[1][0].getType();
            if (pb.getDeviceType() === 'webgpu' || (argType.isPrimitiveType() && argType.isScalarType())) {
                return binaryFunc(matchResult[1][0], matchResult[1][1], '<=', matchResult[0].returnType);
            }
            else {
                return callBuiltinChecked(pb, matchResult);
            }
        }
    },
    greaterThan: {
        overloads: [
            ...genType('greaterThan', MASK_ALL, 3, [0, 0]),
            ...genType('greaterThan', MASK_ALL, 3, [1, 1]),
            ...genType('greaterThan', MASK_ALL, 3, [2, 2]),
        ],
        normalizeFunc(pb, name, ...args) {
            const matchResult = matchFunctionOverloadings(pb, name, ...args);
            const argType = matchResult[1][0].getType();
            if (pb.getDeviceType() === 'webgpu' || (argType.isPrimitiveType() && argType.isScalarType())) {
                return binaryFunc(matchResult[1][0], matchResult[1][1], '>', matchResult[0].returnType);
            }
            else {
                return callBuiltinChecked(pb, matchResult);
            }
        }
    },
    greaterThanEqual: {
        overloads: [
            ...genType('greaterThanEqual', MASK_ALL, 3, [0, 0]),
            ...genType('greaterThanEqual', MASK_ALL, 3, [1, 1]),
            ...genType('greaterThanEqual', MASK_ALL, 3, [2, 2]),
        ],
        normalizeFunc(pb, name, ...args) {
            const matchResult = matchFunctionOverloadings(pb, name, ...args);
            const argType = matchResult[1][0].getType();
            if (pb.getDeviceType() === 'webgpu' || (argType.isPrimitiveType() && argType.isScalarType())) {
                return binaryFunc(matchResult[1][0], matchResult[1][1], '>=', matchResult[0].returnType);
            }
            else {
                return callBuiltinChecked(pb, matchResult);
            }
        }
    },
    compEqual: {
        overloads: [
            ...genType('equal', MASK_ALL, 3, [0, 0]),
            ...genType('equal', MASK_ALL, 3, [1, 1]),
            ...genType('equal', MASK_ALL, 3, [2, 2]),
            ...genType('equal', MASK_ALL, 3, [3, 3]),
        ],
        normalizeFunc(pb, name, ...args) {
            const matchResult = matchFunctionOverloadings(pb, name, ...args);
            const argType = matchResult[1][0].getType();
            if (pb.getDeviceType() === 'webgpu' || (argType.isPrimitiveType() && argType.isScalarType())) {
                return binaryFunc(matchResult[1][0], matchResult[1][1], '==', matchResult[0].returnType);
            }
            else {
                return callBuiltinChecked(pb, matchResult);
            }
        }
    },
    compNotEqual: {
        overloads: [
            ...genType('notEqual', MASK_ALL, 3, [0, 0]),
            ...genType('notEqual', MASK_ALL, 3, [1, 1]),
            ...genType('notEqual', MASK_ALL, 3, [2, 2]),
            ...genType('notEqual', MASK_ALL, 3, [3, 3]),
        ],
        normalizeFunc(pb, name, ...args) {
            const matchResult = matchFunctionOverloadings(pb, name, ...args);
            const argType = matchResult[1][0].getType();
            if (pb.getDeviceType() === 'webgpu' || (argType.isPrimitiveType() && argType.isScalarType())) {
                return binaryFunc(matchResult[1][0], matchResult[1][1], '!=', matchResult[0].returnType);
            }
            else {
                return callBuiltinChecked(pb, matchResult);
            }
        }
    },
    equal: {
        overloads: [
            ...genType('equal', MASK_ALL, typeBool, [0, 0]),
            ...genType('equal', MASK_ALL, typeBool, [1, 1]),
            ...genType('equal', MASK_ALL, typeBool, [2, 2]),
            ...genType('equal', MASK_ALL, typeBool, [3, 3]),
        ],
        normalizeFunc(pb, name, ...args) {
            const matchResult = matchFunctionOverloadings(pb, name, ...args);
            const argType = matchResult[1][0].getType();
            if (pb.getDeviceType() === 'webgpu' && argType.isPrimitiveType() && !argType.isScalarType()) {
                return pb.all(pb.compEqual(args[0], args[1]));
            }
            else {
                return binaryFunc(matchResult[1][0], matchResult[1][1], '==', matchResult[0].returnType);
            }
        }
    },
    notEqual: {
        overloads: [
            ...genType('notEqual', MASK_ALL, typeBool, [0, 0]),
            ...genType('notEqual', MASK_ALL, typeBool, [1, 1]),
            ...genType('notEqual', MASK_ALL, typeBool, [2, 2]),
            ...genType('notEqual', MASK_ALL, typeBool, [3, 3]),
        ],
        normalizeFunc(pb, name, ...args) {
            const matchResult = matchFunctionOverloadings(pb, name, ...args);
            const argType = matchResult[1][0].getType();
            if (pb.getDeviceType() === 'webgpu' && argType.isPrimitiveType() && !argType.isScalarType()) {
                return pb.any(pb.compNotEqual(args[0], args[1]));
            }
            else {
                return binaryFunc(matchResult[1][0], matchResult[1][1], '!=', matchResult[0].returnType);
            }
        }
    },
    any: { overloads: genType('any', MASK_ALL, typeBool, [3], true) },
    all: { overloads: genType('all', MASK_ALL, typeBool, [3], true) },
    not: {
        overloads: genType('not', MASK_ALL, 3, [3]),
        normalizeFunc(pb, name, ...args) {
            const matchResult = matchFunctionOverloadings(pb, name, ...args);
            const argType = matchResult[1][0].getType();
            if (pb.getDeviceType() === 'webgpu' || (argType.isPrimitiveType() && argType.isScalarType())) {
                return unaryFunc(matchResult[1][0], '!', matchResult[0].returnType);
            }
            else {
                return callBuiltinChecked(pb, matchResult);
            }
        }
    },
    neg: {
        overloads: [
            ...genType('neg', MASK_ALL, 0, [0]),
            ...genType('neg', MASK_ALL, 1, [1]),
        ],
        normalizeFunc(pb, name, ...args) {
            const matchResult = matchFunctionOverloadings(pb, name, ...args);
            return unaryFunc(matchResult[1][0], '-', matchResult[0].returnType);
        }
    },
    or: {
        overloads: genType('or', MASK_ALL, typeBool, [3, 3]),
        normalizeFunc(pb, name, ...args) {
            const matchResult = matchFunctionOverloadings(pb, name, ...args);
            return binaryFunc(matchResult[1][0], matchResult[1][1], '||', matchResult[0].returnType);
        }
    },
    compOr: {
        overloads: genType('compOr', MASK_WEBGL2 | MASK_WEBGPU, 3, [3, 3]),
        normalizeFunc(pb, name, ...args) {
            const matchResult = matchFunctionOverloadings(pb, name, ...args);
            return binaryFunc(matchResult[1][0], matchResult[1][1], '|', matchResult[0].returnType);
        }
    },
    and_2: {
        overloads: genType('and', MASK_ALL, typeBool, [3, 3]),
        normalizeFunc(pb, name, ...args) {
            const matchResult = matchFunctionOverloadings(pb, name, ...args);
            return binaryFunc(matchResult[1][0], matchResult[1][1], '&&', matchResult[0].returnType);
        }
    },
    and: {
        overloads: [],
        normalizeFunc(pb, name, ...args) {
            if (args.length < 2) {
                throw new PBParamLengthError('and');
            }
            let result = args[0];
            for (let i = 1; i < args.length; i++) {
                result = pb.and_2(result, args[i]);
            }
            return result;
        }
    },
    compAnd: {
        overloads: genType('compAnd', MASK_WEBGL2 | MASK_WEBGPU, 3, [3, 3]),
        normalizeFunc(pb, name, ...args) {
            const matchResult = matchFunctionOverloadings(pb, name, ...args);
            return binaryFunc(matchResult[1][0], matchResult[1][1], '&', matchResult[0].returnType);
        }
    },
    arrayLength: {
        normalizeFunc(pb, name, ...args) {
            if (pb.getDeviceType() !== 'webgpu') {
                throw new PBDeviceNotSupport('arrayLength builtin function');
            }
            if (args.length !== 1
                || !(args[0] instanceof PBShaderExp)
                || !args[0].$ast.getType().isPointerType()
                || !(args[0].$ast.getType().pointerType.isArrayType())) {
                throw new PBParamTypeError('arrayLength');
            }
            return pb.$callFunction(name, [args[0].$ast], typeU32);
        }
    },
    select: {
        overloads: [
            ...genType('select', MASK_WEBGPU, 0, [0, 0, typeBool]),
            ...genType('select', MASK_WEBGPU, 1, [1, 1, typeBool]),
            ...genType('select', MASK_WEBGPU, 2, [2, 2, typeBool]),
            ...genType('select', MASK_WEBGPU, 3, [3, 3, typeBool]),
            ...genType('select', MASK_WEBGPU, 0, [0, 0, 3], true),
            ...genType('select', MASK_WEBGPU, 1, [1, 1, 3], true),
            ...genType('select', MASK_WEBGPU, 2, [2, 2, 3], true),
            ...genType('select', MASK_WEBGPU, 3, [3, 3, 3], true),
            ...genType('mix', MASK_WEBGL2, 0, [0, 0, 3]),
            ...genType('mix', MASK_WEBGL2, 1, [1, 1, 3]),
            ...genType('mix', MASK_WEBGL2, 2, [2, 2, 3]),
        ]
    },
    floatBitsToInt: { overloads: genType('floatBitsToInt', MASK_WEBGL2, 1, [0]) },
    floatBitsToUint: { overloads: genType('floatBitsToUint', MASK_WEBGL2, 2, [0]) },
    intBitsToFloat: { overloads: genType('intBitsToFloat', MASK_WEBGL2, 0, [1]) },
    uintBitsToFloat: { overloads: genType('uintBitsToFloat', MASK_WEBGL2, 0, [2]) },
    pack4x8snorm: { overloads: genType('pack4x8snorm', MASK_WEBGPU, typeU32, [typeF32Vec4]) },
    unpack4x8snorm: { overloads: genType('unpack4x8snorm', MASK_WEBGPU, typeF32Vec4, [typeU32]) },
    pack4x8unorm: { overloads: genType('pack4x8unorm', MASK_WEBGPU, typeU32, [typeF32Vec4]) },
    unpack4x8unorm: { overloads: genType('unpack4x8unorm', MASK_WEBGPU, typeF32Vec4, [typeU32]) },
    pack2x16snorm: {
        overloads: [
            ...genType('pack2x16snorm', MASK_WEBGPU, typeU32, [typeF32Vec2]),
            ...genType('packSnorm2x16', MASK_WEBGL2, typeU32, [typeF32Vec2]),
        ]
    },
    unpack2x16snorm: {
        overloads: [
            ...genType('unpack2x16snorm', MASK_WEBGPU, typeF32Vec2, [typeU32]),
            ...genType('unpackSnorm2x16', MASK_WEBGL2, typeF32Vec2, [typeU32])
        ]
    },
    pack2x16unorm: {
        overloads: [
            ...genType('pack2x16unorm', MASK_WEBGPU, typeU32, [typeF32Vec2]),
            ...genType('packUnorm2x16', MASK_WEBGL2, typeU32, [typeF32Vec2]),
        ]
    },
    unpack2x16unorm: {
        overloads: [
            ...genType('unpack2x16unorm', MASK_WEBGPU, typeF32Vec2, [typeU32]),
            ...genType('unpackUnorm2x16', MASK_WEBGL2, typeF32Vec2, [typeU32]),
        ]
    },
    pack2x16float: {
        overloads: [
            ...genType('pack2x16float', MASK_WEBGPU, typeU32, [typeF32Vec2]),
            ...genType('packHalf2x16', MASK_WEBGL2, typeU32, [typeF32Vec2]),
        ]
    },
    unpack2x16float: {
        overloads: [
            ...genType('unpack2x16float', MASK_WEBGPU, typeF32Vec2, [typeU32]),
            ...genType('unpackHalf2x16', MASK_WEBGL2, typeF32Vec2, [typeU32]),
        ]
    },
    matrixCompMult: { overloads: genMatrixType('matrixCompMult', MASK_WEBGL, null, [null, null]) },
    dpdx: {
        overloads: [
            ...genType('dFdx', MASK_WEBGL, 0, [0]),
            ...genType('dpdx', MASK_WEBGPU, 0, [0]),
        ]
    },
    dpdy: {
        overloads: [
            ...genType('dFdy', MASK_WEBGL, 0, [0]),
            ...genType('dpdy', MASK_WEBGPU, 0, [0]),
        ]
    },
    fwidth: { overloads: genType('fwidth', MASK_ALL, 0, [0]) },
    dpdxCoarse: {
        overloads: [
            ...genType('dpdxCoarse', MASK_WEBGPU, 0, [0]),
            ...genType('dFdx', MASK_WEBGL, 0, [0]),
        ]
    },
    dpdxFine: {
        overloads: [
            ...genType('dpdxFine', MASK_WEBGPU, 0, [0]),
            ...genType('dFdx', MASK_WEBGL, 0, [0]),
        ]
    },
    dpdyCoarse: {
        overloads: [
            ...genType('dpdyCoarse', MASK_WEBGPU, 0, [0]),
            ...genType('dFdy', MASK_WEBGL, 0, [0]),
        ]
    },
    dpdyFine: {
        overloads: [
            ...genType('dpdyFine', MASK_WEBGPU, 0, [0]),
            ...genType('dFdy', MASK_WEBGL, 0, [0]),
        ]
    },
    textureDimensions: {
        overloads: [
            ...genType('textureDimensions', MASK_WEBGPU, typeU32, [typeTex1D, typeI32]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32, [typeITex1D, typeI32]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32, [typeUTex1D, typeI32]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTex2D, typeI32]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeITex2D, typeI32]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeUTex2D, typeI32]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTex2DArray, typeI32]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeITex2DArray, typeI32]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeUTex2DArray, typeI32]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec3, [typeTex3D, typeI32]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec3, [typeITex3D, typeI32]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec3, [typeUTex3D, typeI32]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexCube, typeI32]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeITexCube, typeI32]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeUTexCube, typeI32]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexCubeArray, typeI32]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeITexCubeArray, typeI32]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeUTexCubeArray, typeI32]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexMultisampled2D]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeITexMultisampled2D]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeUTexMultisampled2D]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexDepth2D, typeI32]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexDepth2DArray, typeI32]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexDepthCube, typeI32]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexDepthCubeArray, typeI32]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexDepthMultisampled2D]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32, [typeTexStorage1D_rgba8unorm]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32, [typeTexStorage1D_rgba8snorm]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32, [typeTexStorage1D_rgba8uint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32, [typeTexStorage1D_rgba8sint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32, [typeTexStorage1D_rgba16uint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32, [typeTexStorage1D_rgba16sint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32, [typeTexStorage1D_rgba16float]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32, [typeTexStorage1D_rgba32uint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32, [typeTexStorage1D_rgba32sint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32, [typeTexStorage1D_rgba32float]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32, [typeTexStorage1D_rg32uint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32, [typeTexStorage1D_rg32sint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32, [typeTexStorage1D_rg32float]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32, [typeTexStorage1D_r32uint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32, [typeTexStorage1D_r32sint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32, [typeTexStorage1D_r32float]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexStorage2D_rgba8unorm]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexStorage2D_rgba8snorm]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexStorage2D_rgba8uint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexStorage2D_rgba8sint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexStorage2D_rgba16uint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexStorage2D_rgba16sint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexStorage2D_rgba16float]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexStorage2D_rgba32uint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexStorage2D_rgba32sint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexStorage2D_rgba32float]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexStorage2D_rg32uint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexStorage2D_rg32sint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexStorage2D_rg32float]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexStorage2D_r32uint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexStorage2D_r32sint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexStorage2D_r32float]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexStorage2DArray_rgba8unorm]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexStorage2DArray_rgba8snorm]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexStorage2DArray_rgba8uint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexStorage2DArray_rgba8sint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexStorage2DArray_rgba16uint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexStorage2DArray_rgba16sint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexStorage2DArray_rgba16float]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexStorage2DArray_rgba32uint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexStorage2DArray_rgba32sint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexStorage2DArray_rgba32float]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexStorage2DArray_rg32uint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexStorage2DArray_rg32sint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexStorage2DArray_rg32float]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexStorage2DArray_r32uint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexStorage2DArray_r32sint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec2, [typeTexStorage2DArray_r32float]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec3, [typeTexStorage3D_rgba8unorm]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec3, [typeTexStorage3D_rgba8snorm]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec3, [typeTexStorage3D_rgba8uint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec3, [typeTexStorage3D_rgba8sint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec3, [typeTexStorage3D_rgba16uint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec3, [typeTexStorage3D_rgba16sint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec3, [typeTexStorage3D_rgba16float]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec3, [typeTexStorage3D_rgba32uint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec3, [typeTexStorage3D_rgba32sint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec3, [typeTexStorage3D_rgba32float]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec3, [typeTexStorage3D_rg32uint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec3, [typeTexStorage3D_rg32sint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec3, [typeTexStorage3D_rg32float]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec3, [typeTexStorage3D_r32uint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec3, [typeTexStorage3D_r32sint]),
            ...genType('textureDimensions', MASK_WEBGPU, typeU32Vec3, [typeTexStorage3D_r32float]),
            ...genType('textureSize', MASK_WEBGL2, typeI32Vec2, [typeTex1D, typeI32]),
            ...genType('textureSize', MASK_WEBGL2, typeI32Vec2, [typeTex2D, typeI32]),
            ...genType('textureSize', MASK_WEBGL2, typeI32Vec2, [typeITex1D, typeI32]),
            ...genType('textureSize', MASK_WEBGL2, typeI32Vec2, [typeITex2D, typeI32]),
            ...genType('textureSize', MASK_WEBGL2, typeI32Vec2, [typeUTex1D, typeI32]),
            ...genType('textureSize', MASK_WEBGL2, typeI32Vec2, [typeUTex2D, typeI32]),
            ...genType('textureSize', MASK_WEBGL2, typeI32Vec2, [typeTex2DArray, typeI32]),
            ...genType('textureSize', MASK_WEBGL2, typeI32Vec2, [typeITex2DArray, typeI32]),
            ...genType('textureSize', MASK_WEBGL2, typeI32Vec2, [typeUTex2DArray, typeI32]),
            ...genType('textureSize', MASK_WEBGL2, typeI32Vec2, [typeTexCube, typeI32]),
            ...genType('textureSize', MASK_WEBGL2, typeI32Vec2, [typeITexCube, typeI32]),
            ...genType('textureSize', MASK_WEBGL2, typeI32Vec2, [typeUTexCube, typeI32]),
            ...genType('textureSize', MASK_WEBGL2, typeI32Vec3, [typeTex3D, typeI32]),
            ...genType('textureSize', MASK_WEBGL2, typeI32Vec3, [typeITex3D, typeI32]),
            ...genType('textureSize', MASK_WEBGL2, typeI32Vec3, [typeUTex3D, typeI32]),
            ...genType('textureSize', MASK_WEBGL2, typeI32Vec2, [typeTexDepth2D, typeI32]),
            ...genType('textureSize', MASK_WEBGL2, typeI32Vec2, [typeTexDepthCube, typeI32]),
            ...genType('textureSize', MASK_WEBGL2, typeI32Vec2, [typeTexDepth2DArray, typeI32]),
        ],
        normalizeFunc(pb, name, ...args) {
            if (args.length < 1 || args.length > 2) {
                throw new PBParamLengthError('textureDimensions');
            }
            if (!(args[0] instanceof PBShaderExp)) {
                throw new PBParamValueError('textureDimensions', 'tex');
            }
            const texType = args[0].$ast.getType();
            if (!texType.isTextureType()) {
                throw new PBParamTypeError('textureDimensions', 'tex');
            }
            if (pb.getDeviceType() === 'webgpu') {
                if (texType.isMultisampledTexture() || texType.isStorageTexture()) {
                    if (args[1] !== undefined) {
                        throw new PBParamValueError('textureDimensions', 'level');
                    }
                }
                return callBuiltin(pb, name, ...args);
            }
            else if (pb.getDeviceType() === 'webgl2') {
                const tex = args[0];
                const level = args[1] || 0;
                return texType.is1DTexture() ? callBuiltin(pb, name, tex, level).x : callBuiltin(pb, name, tex, level);
            }
        }
    },
    textureGather: {
        overloads: [
            ...genType('textureGather', MASK_WEBGPU, typeF32Vec4, [typeI32, typeTex2D, typeSampler, typeF32Vec2]),
            ...genType('textureGather', MASK_WEBGPU, typeI32Vec4, [typeI32, typeITex2D, typeSampler, typeF32Vec2]),
            ...genType('textureGather', MASK_WEBGPU, typeU32Vec4, [typeI32, typeUTex2D, typeSampler, typeF32Vec2]),
            ...genType('textureGather', MASK_WEBGPU, typeF32Vec4, [typeI32, typeTexCube, typeSampler, typeF32Vec3]),
            ...genType('textureGather', MASK_WEBGPU, typeI32Vec4, [typeI32, typeITexCube, typeSampler, typeF32Vec3]),
            ...genType('textureGather', MASK_WEBGPU, typeU32Vec4, [typeI32, typeUTexCube, typeSampler, typeF32Vec3]),
            ...genType('textureGather', MASK_WEBGPU, typeF32Vec4, [typeTexDepth2D, typeSampler, typeF32Vec2]),
            ...genType('textureGather', MASK_WEBGPU, typeF32Vec4, [typeTexDepthCube, typeSampler, typeF32Vec3]),
        ]
    },
    textureArrayGather: {
        overloads: [
            ...genType('textureGather', MASK_WEBGPU, typeF32Vec4, [typeI32, typeTex2DArray, typeSampler, typeF32Vec2, typeI32]),
            ...genType('textureGather', MASK_WEBGPU, typeI32Vec4, [typeI32, typeITex2DArray, typeSampler, typeF32Vec2, typeI32]),
            ...genType('textureGather', MASK_WEBGPU, typeU32Vec4, [typeI32, typeUTex2DArray, typeSampler, typeF32Vec2, typeI32]),
            ...genType('textureGather', MASK_WEBGPU, typeF32Vec4, [typeI32, typeTexCubeArray, typeSampler, typeF32Vec3, typeI32]),
            ...genType('textureGather', MASK_WEBGPU, typeI32Vec4, [typeI32, typeITexCubeArray, typeSampler, typeF32Vec3, typeI32]),
            ...genType('textureGather', MASK_WEBGPU, typeU32Vec4, [typeI32, typeUTexCubeArray, typeSampler, typeF32Vec3, typeI32]),
            ...genType('textureGather', MASK_WEBGPU, typeF32Vec4, [typeTexDepth2DArray, typeSampler, typeF32Vec2, typeI32]),
            ...genType('textureGather', MASK_WEBGPU, typeF32Vec4, [typeTexDepthCubeArray, typeSampler, typeF32Vec3, typeI32]),
        ]
    },
    textureGatherCompare: {
        overloads: [
            ...genType('textureGatherCompare', MASK_WEBGPU, typeF32Vec4, [typeTexDepth2D, typeSamplerComparison, typeF32Vec2, typeF32]),
            ...genType('textureGatherCompare', MASK_WEBGPU, typeF32Vec4, [typeTexDepthCube, typeSamplerComparison, typeF32Vec3, typeF32]),
        ]
    },
    textureArrayGatherCompare: {
        overloads: [
            ...genType('textureGatherCompare', MASK_WEBGPU, typeF32Vec4, [typeTexDepth2DArray, typeSamplerComparison, typeF32Vec2, typeI32, typeF32]),
            ...genType('textureGatherCompare', MASK_WEBGPU, typeF32Vec4, [typeTexDepthCubeArray, typeSamplerComparison, typeF32Vec3, typeI32, typeF32]),
        ]
    },
    textureLoad: {
        overloads: [
            ...genType('textureLoad', MASK_WEBGPU, typeF32Vec4, [typeTex1D, typeI32, typeI32]),
            ...genType('textureLoad', MASK_WEBGPU, typeI32Vec4, [typeITex1D, typeI32, typeI32]),
            ...genType('textureLoad', MASK_WEBGPU, typeU32Vec4, [typeUTex1D, typeI32, typeI32]),
            ...genType('textureLoad', MASK_WEBGPU, typeF32Vec4, [typeTex2D, typeI32Vec2, typeI32]),
            ...genType('textureLoad', MASK_WEBGPU, typeI32Vec4, [typeITex2D, typeI32Vec2, typeI32]),
            ...genType('textureLoad', MASK_WEBGPU, typeU32Vec4, [typeUTex2D, typeI32Vec2, typeI32]),
            ...genType('textureLoad', MASK_WEBGPU, typeF32Vec4, [typeTex3D, typeI32Vec3, typeI32]),
            ...genType('textureLoad', MASK_WEBGPU, typeI32Vec4, [typeITex3D, typeI32Vec3, typeI32]),
            ...genType('textureLoad', MASK_WEBGPU, typeU32Vec4, [typeUTex3D, typeI32Vec3, typeI32]),
            ...genType('textureLoad', MASK_WEBGPU, typeF32Vec4, [typeTexMultisampled2D, typeI32Vec2, typeI32]),
            ...genType('textureLoad', MASK_WEBGPU, typeI32Vec4, [typeITexMultisampled2D, typeI32Vec2, typeI32]),
            ...genType('textureLoad', MASK_WEBGPU, typeU32Vec4, [typeUTexMultisampled2D, typeI32Vec2, typeI32]),
            ...genType('textureLoad', MASK_WEBGPU, typeF32Vec4, [typeTexExternal, typeI32Vec2]),
            ...genType('textureLoad', MASK_WEBGPU, typeF32, [typeTexDepth2D, typeI32Vec2, typeI32]),
            ...genType('textureLoad', MASK_WEBGPU, typeF32, [typeTexDepthMultisampled2D, typeI32Vec2, typeI32]),
            ...genType('texelFetch', MASK_WEBGL2, typeF32Vec4, [typeTex1D, typeI32Vec2, typeI32]),
            ...genType('texelFetch', MASK_WEBGL2, typeF32Vec4, [typeTex2D, typeI32Vec2, typeI32]),
            ...genType('texelFetch', MASK_WEBGL2, typeF32Vec4, [typeTex3D, typeI32Vec3, typeI32]),
            ...genType('texelFetch', MASK_WEBGL2, typeU32Vec4, [typeTexExternal, typeI32Vec2, typeI32]),
            ...genType('texelFetch', MASK_WEBGL2, typeF32Vec4, [typeITex1D, typeI32Vec2, typeI32]),
            ...genType('texelFetch', MASK_WEBGL2, typeI32Vec4, [typeITex2D, typeI32Vec2, typeI32]),
            ...genType('texelFetch', MASK_WEBGL2, typeI32Vec4, [typeITex3D, typeI32Vec3, typeI32]),
            ...genType('texelFetch', MASK_WEBGL2, typeF32Vec4, [typeUTex1D, typeI32Vec2, typeI32]),
            ...genType('texelFetch', MASK_WEBGL2, typeU32Vec4, [typeUTex2D, typeI32Vec2, typeI32]),
            ...genType('texelFetch', MASK_WEBGL2, typeU32Vec4, [typeUTex3D, typeI32Vec3, typeI32]),
        ],
        normalizeFunc(pb, name, ...args) {
            if (args.length === 0) {
                throw new PBParamLengthError('textureLoad');
            }
            if (!(args[0] instanceof PBShaderExp)) {
                throw new PBParamValueError('textureLoad', 'tex');
            }
            const texType = args[0].$ast.getType();
            if (!texType.isTextureType()) {
                throw new PBParamTypeError('textureLoad', 'tex');
            }
            if (pb.getDeviceType() === 'webgl2') {
                if (args.length !== 3) {
                    throw new PBParamLengthError('textureLoad');
                }
                if (texType.is1DTexture()) {
                    if (typeof args[1] === 'number') {
                        if (!Number.isInteger(args[1])) {
                            throw new PBParamTypeError('textureLoad', 'coord');
                        }
                    }
                    else if (args[1] instanceof PBShaderExp) {
                        const coordType = args[1].$ast.getType();
                        if (!coordType.isPrimitiveType() || !coordType.isScalarType() || coordType.scalarType !== PBPrimitiveType.I32) {
                            throw new PBParamTypeError('textureLoad', 'coord');
                        }
                    }
                    else {
                        throw new PBParamTypeError('textureLoad', 'coord');
                    }
                    args[1] = pb.ivec2(args[1], 0);
                }
            }
            else if (pb.getDeviceType() === 'webgpu' && texType.isExternalTexture()) {
                args = args.slice(0, 2);
            }
            return callBuiltin(pb, name, ...args);
        }
    },
    textureArrayLoad: {
        overloads: [
            ...genType('textureLoad', MASK_WEBGPU, typeF32Vec4, [typeTex2DArray, typeI32Vec2, typeI32, typeI32]),
            ...genType('textureLoad', MASK_WEBGPU, typeI32Vec4, [typeITex2DArray, typeI32Vec2, typeI32, typeI32]),
            ...genType('textureLoad', MASK_WEBGPU, typeU32Vec4, [typeUTex2DArray, typeI32Vec2, typeI32, typeI32]),
            ...genType('textureLoad', MASK_WEBGPU, typeF32, [typeTexDepth2DArray, typeI32Vec2, typeI32, typeI32]),
            ...genType('texelFetch', MASK_WEBGL2, typeF32Vec4, [typeTex2DArray, typeI32Vec3, typeI32]),
            ...genType('texelFetch', MASK_WEBGL2, typeI32Vec4, [typeITex2DArray, typeI32Vec3, typeI32]),
            ...genType('texelFetch', MASK_WEBGL2, typeU32Vec4, [typeUTex2DArray, typeI32Vec3, typeI32]),
        ],
        normalizeFunc(pb, name, ...args) {
            if (pb.getDeviceType() === 'webgl2') {
                if (args.length !== 4) {
                    throw new PBParamLengthError('textureArrayLoad');
                }
                const tex = args[0];
                const coords = pb.ivec3(args[1], args[2]);
                const level = args[3];
                return callBuiltin(pb, name, tex, coords, level);
            }
            else {
                return callBuiltin(pb, name, ...args);
            }
        },
    },
    textureStore: {
        overloads: [
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage1D_rgba8unorm, typeU32, typeF32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage1D_rgba8snorm, typeU32, typeF32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage1D_rgba8uint, typeU32, typeU32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage1D_rgba8sint, typeU32, typeI32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage1D_rgba16uint, typeU32, typeU32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage1D_rgba16sint, typeU32, typeI32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage1D_rgba16float, typeU32, typeF32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage1D_rgba32uint, typeU32, typeU32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage1D_rgba32sint, typeU32, typeI32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage1D_rgba32float, typeU32, typeF32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage1D_rg32uint, typeU32, typeU32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage1D_rg32sint, typeU32, typeI32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage1D_rg32float, typeU32, typeF32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage1D_r32uint, typeU32, typeU32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage1D_r32sint, typeU32, typeI32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage1D_r32float, typeU32, typeF32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage2D_rgba8unorm, typeU32Vec2, typeF32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage2D_rgba8snorm, typeU32Vec2, typeF32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage2D_rgba8uint, typeU32Vec2, typeU32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage2D_rgba8sint, typeU32Vec2, typeI32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage2D_rgba16uint, typeU32Vec2, typeU32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage2D_rgba16sint, typeU32Vec2, typeI32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage2D_rgba16float, typeU32Vec2, typeF32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage2D_rgba32uint, typeU32Vec2, typeU32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage2D_rgba32sint, typeU32Vec2, typeI32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage2D_rgba32float, typeU32Vec2, typeF32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage2D_rg32uint, typeU32Vec2, typeU32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage2D_rg32sint, typeU32Vec2, typeI32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage2D_rg32float, typeU32Vec2, typeF32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage2D_r32uint, typeU32Vec2, typeU32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage2D_r32sint, typeU32Vec2, typeI32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage2D_r32float, typeU32Vec2, typeF32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage3D_rgba8unorm, typeU32Vec3, typeF32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage3D_rgba8snorm, typeU32Vec3, typeF32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage3D_rgba8uint, typeU32Vec3, typeU32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage3D_rgba8sint, typeU32Vec3, typeI32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage3D_rgba16uint, typeU32Vec3, typeU32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage3D_rgba16sint, typeU32Vec3, typeI32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage3D_rgba16float, typeU32Vec3, typeF32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage3D_rgba32uint, typeU32Vec3, typeU32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage3D_rgba32sint, typeU32Vec3, typeI32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage3D_rgba32float, typeU32Vec3, typeF32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage3D_rg32uint, typeU32Vec3, typeU32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage3D_rg32sint, typeU32Vec3, typeI32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage3D_rg32float, typeU32Vec3, typeF32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage3D_r32uint, typeU32Vec3, typeU32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage3D_r32sint, typeU32Vec3, typeI32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage3D_r32float, typeU32Vec3, typeF32Vec4]),
        ]
    },
    textureArrayStore: {
        overloads: [
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage2DArray_rgba8unorm, typeI32Vec2, typeI32, typeF32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage2DArray_rgba8snorm, typeI32Vec2, typeI32, typeF32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage2DArray_rgba8uint, typeI32Vec2, typeI32, typeU32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage2DArray_rgba8sint, typeI32Vec2, typeI32, typeI32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage2DArray_rgba16uint, typeI32Vec2, typeI32, typeU32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage2DArray_rgba16sint, typeI32Vec2, typeI32, typeI32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage2DArray_rgba16float, typeI32Vec2, typeI32, typeF32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage2DArray_rgba32uint, typeI32Vec2, typeI32, typeU32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage2DArray_rgba32sint, typeI32Vec2, typeI32, typeI32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage2DArray_rgba32float, typeI32Vec2, typeI32, typeF32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage2DArray_rg32uint, typeI32Vec2, typeI32, typeU32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage2DArray_rg32sint, typeI32Vec2, typeI32, typeI32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage2DArray_rg32float, typeI32Vec2, typeI32, typeF32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage2DArray_r32uint, typeI32Vec2, typeI32, typeU32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage2DArray_r32sint, typeI32Vec2, typeI32, typeI32Vec4]),
            ...genType('textureStore', MASK_WEBGPU, typeVoid, [typeTexStorage2DArray_r32float, typeI32Vec2, typeI32, typeF32Vec4]),
        ]
    },
    textureNumLayers: {
        overloads: [
            ...genType('textureNumLayers', MASK_WEBGPU, typeI32, [typeTex2DArray]),
            ...genType('textureNumLayers', MASK_WEBGPU, typeI32, [typeITex2DArray]),
            ...genType('textureNumLayers', MASK_WEBGPU, typeI32, [typeUTex2DArray]),
            ...genType('textureNumLayers', MASK_WEBGPU, typeI32, [typeTexCubeArray]),
            ...genType('textureNumLayers', MASK_WEBGPU, typeI32, [typeITexCubeArray]),
            ...genType('textureNumLayers', MASK_WEBGPU, typeI32, [typeUTexCubeArray]),
            ...genType('textureNumLayers', MASK_WEBGPU, typeI32, [typeTexDepth2DArray]),
            ...genType('textureNumLayers', MASK_WEBGPU, typeI32, [typeTexDepthCubeArray]),
            ...genType('textureNumLayers', MASK_WEBGPU, typeI32, [typeTexStorage2DArray_r32float]),
            ...genType('textureNumLayers', MASK_WEBGPU, typeI32, [typeTexStorage2DArray_r32sint]),
            ...genType('textureNumLayers', MASK_WEBGPU, typeI32, [typeTexStorage2DArray_r32uint]),
            ...genType('textureNumLayers', MASK_WEBGPU, typeI32, [typeTexStorage2DArray_rg32float]),
            ...genType('textureNumLayers', MASK_WEBGPU, typeI32, [typeTexStorage2DArray_rg32sint]),
            ...genType('textureNumLayers', MASK_WEBGPU, typeI32, [typeTexStorage2DArray_rg32uint]),
            ...genType('textureNumLayers', MASK_WEBGPU, typeI32, [typeTexStorage2DArray_rgba16float]),
            ...genType('textureNumLayers', MASK_WEBGPU, typeI32, [typeTexStorage2DArray_rgba16sint]),
            ...genType('textureNumLayers', MASK_WEBGPU, typeI32, [typeTexStorage2DArray_rgba16uint]),
            ...genType('textureNumLayers', MASK_WEBGPU, typeI32, [typeTexStorage2DArray_rgba32float]),
            ...genType('textureNumLayers', MASK_WEBGPU, typeI32, [typeTexStorage2DArray_rgba32sint]),
            ...genType('textureNumLayers', MASK_WEBGPU, typeI32, [typeTexStorage2DArray_rgba32uint]),
            ...genType('textureNumLayers', MASK_WEBGPU, typeI32, [typeTexStorage2DArray_rgba8sint]),
            ...genType('textureNumLayers', MASK_WEBGPU, typeI32, [typeTexStorage2DArray_rgba8snorm]),
            ...genType('textureNumLayers', MASK_WEBGPU, typeI32, [typeTexStorage2DArray_rgba8uint]),
            ...genType('textureNumLayers', MASK_WEBGPU, typeI32, [typeTexStorage2DArray_rgba8unorm]),
        ]
    },
    textureNumLevels: {
        overloads: [
            ...genType('textureNumLevels', MASK_WEBGPU, typeI32, [typeTex1D]),
            ...genType('textureNumLevels', MASK_WEBGPU, typeI32, [typeITex1D]),
            ...genType('textureNumLevels', MASK_WEBGPU, typeI32, [typeUTex1D]),
            ...genType('textureNumLevels', MASK_WEBGPU, typeI32, [typeTex2D]),
            ...genType('textureNumLevels', MASK_WEBGPU, typeI32, [typeITex2D]),
            ...genType('textureNumLevels', MASK_WEBGPU, typeI32, [typeUTex2D]),
            ...genType('textureNumLevels', MASK_WEBGPU, typeI32, [typeTex2DArray]),
            ...genType('textureNumLevels', MASK_WEBGPU, typeI32, [typeITex2DArray]),
            ...genType('textureNumLevels', MASK_WEBGPU, typeI32, [typeUTex2DArray]),
            ...genType('textureNumLevels', MASK_WEBGPU, typeI32, [typeTex3D]),
            ...genType('textureNumLevels', MASK_WEBGPU, typeI32, [typeITex3D]),
            ...genType('textureNumLevels', MASK_WEBGPU, typeI32, [typeUTex3D]),
            ...genType('textureNumLevels', MASK_WEBGPU, typeI32, [typeTexCube]),
            ...genType('textureNumLevels', MASK_WEBGPU, typeI32, [typeITexCube]),
            ...genType('textureNumLevels', MASK_WEBGPU, typeI32, [typeUTexCube]),
            ...genType('textureNumLevels', MASK_WEBGPU, typeI32, [typeTexCubeArray]),
            ...genType('textureNumLevels', MASK_WEBGPU, typeI32, [typeITexCubeArray]),
            ...genType('textureNumLevels', MASK_WEBGPU, typeI32, [typeUTexCubeArray]),
            ...genType('textureNumLevels', MASK_WEBGPU, typeI32, [typeTexDepth2D]),
            ...genType('textureNumLevels', MASK_WEBGPU, typeI32, [typeTexDepth2DArray]),
            ...genType('textureNumLevels', MASK_WEBGPU, typeI32, [typeTexDepthCube]),
            ...genType('textureNumLevels', MASK_WEBGPU, typeI32, [typeTexDepthCubeArray]),
        ]
    },
    textureNumSamples: {
        overloads: [
            ...genType('textureNumSamples', MASK_WEBGPU, typeI32, [typeTexMultisampled2D]),
            ...genType('textureNumSamples', MASK_WEBGPU, typeI32, [typeITexMultisampled2D]),
            ...genType('textureNumSamples', MASK_WEBGPU, typeI32, [typeUTexMultisampled2D]),
            ...genType('textureNumSamples', MASK_WEBGPU, typeI32, [typeTexDepthMultisampled2D]),
        ]
    },
    textureSample: {
        overloads: [
            ...genType('textureSample', MASK_WEBGPU, typeF32Vec4, [typeTex1D, typeSampler, typeF32]),
            ...genType('textureSample', MASK_WEBGPU, typeF32Vec4, [typeTex2D, typeSampler, typeF32Vec2]),
            ...genType('textureSample', MASK_WEBGPU, typeF32Vec4, [typeTex3D, typeSampler, typeF32Vec3]),
            ...genType('textureSample', MASK_WEBGPU, typeF32Vec4, [typeTexCube, typeSampler, typeF32Vec3]),
            ...genType('textureSample', MASK_WEBGPU, typeF32, [typeTexDepth2D, typeSampler, typeF32Vec2]),
            ...genType('textureSample', MASK_WEBGPU, typeF32, [typeTexDepthCube, typeSampler, typeF32Vec3]),
            ...genType('texture', MASK_WEBGL2, typeF32Vec4, [typeTex1D, typeF32Vec2]),
            ...genType('texture', MASK_WEBGL2, typeF32Vec4, [typeTex2D, typeF32Vec2]),
            ...genType('texture', MASK_WEBGL2, typeF32Vec4, [typeTexExternal, typeF32Vec2]),
            ...genType('texture', MASK_WEBGL2, typeF32Vec4, [typeTexDepth2D, typeF32Vec2]),
            ...genType('texture', MASK_WEBGL2, typeF32Vec4, [typeTex3D, typeF32Vec3]),
            ...genType('texture', MASK_WEBGL2, typeF32Vec4, [typeTexCube, typeF32Vec3]),
            ...genType('texture', MASK_WEBGL2, typeF32Vec4, [typeTexDepthCube, typeF32Vec3]),
            ...genType('texture2D', MASK_WEBGL1, typeF32Vec4, [typeTex1D, typeF32Vec2]),
            ...genType('texture2D', MASK_WEBGL1, typeF32Vec4, [typeTex2D, typeF32Vec2]),
            ...genType('texture2D', MASK_WEBGL1, typeF32Vec4, [typeTexExternal, typeF32Vec2]),
            ...genType('texture2D', MASK_WEBGL1, typeF32Vec4, [typeTexDepth2D, typeF32Vec2]),
            ...genType('textureCube', MASK_WEBGL1, typeF32Vec4, [typeTexCube, typeF32Vec3]),
            ...genType('textureCube', MASK_WEBGL1, typeF32Vec4, [typeTexDepthCube, typeF32Vec3]),
        ],
        normalizeFunc(pb, name, ...args) {
            if (args.length !== 2) {
                throw new PBParamLengthError('textureSample');
            }
            const tex = args[0];
            if (!(tex instanceof PBShaderExp)) {
                throw new PBParamTypeError('textureSample', 'texture');
            }
            const texType = tex.$ast.getType();
            if (!texType.isTextureType()) {
                throw new PBParamTypeError('textureSample', 'texture');
            }
            if (pb.getDeviceType() === 'webgpu') {
                if (texType.isExternalTexture()) {
                    return pb.textureLoad(tex, pb.ivec2(args[1]), 0);
                }
                else {
                    const sampler = pb.getDefaultSampler(tex, false);
                    const coords = args[1];
                    const ret = callBuiltin(pb, name, tex, sampler, coords);
                    if (ret.$ast.getType().typeId === typeF32.typeId) {
                        return pb.vec4(ret, 0, 0, 1);
                    }
                    else {
                        return ret;
                    }
                }
            }
            else {
                pb.getDefaultSampler(tex, false);
                if (texType.is1DTexture()) {
                    if (args[1] instanceof PBShaderExp) {
                        const coordType = args[1].$ast.getType();
                        if (!coordType.isPrimitiveType() || !coordType.isScalarType() || coordType.scalarType !== PBPrimitiveType.F32) {
                            throw new PBParamTypeError('textureSample', 'coord');
                        }
                    }
                    else if (typeof args[1] !== 'number') {
                        throw new PBParamTypeError('textureSample', 'coord');
                    }
                    args[1] = pb.vec2(args[1], 0);
                }
                return callBuiltin(pb, name, ...args);
            }
        }
    },
    textureArraySample: {
        overloads: [
            ...genType('textureSample', MASK_WEBGPU, typeF32Vec4, [typeTex2DArray, typeSampler, typeF32Vec2, typeI32]),
            ...genType('textureSample', MASK_WEBGPU, typeF32Vec4, [typeTexCubeArray, typeSampler, typeF32Vec3, typeI32]),
            ...genType('textureSample', MASK_WEBGPU, typeF32, [typeTexDepth2DArray, typeSampler, typeF32Vec2, typeI32]),
            ...genType('textureSample', MASK_WEBGPU, typeF32, [typeTexDepthCubeArray, typeSampler, typeF32Vec3, typeI32]),
            ...genType('texture', MASK_WEBGL2, typeF32Vec4, [typeTex2DArray, typeF32Vec3]),
        ],
        normalizeFunc(pb, name, ...args) {
            if (args.length !== 3) {
                throw new PBParamLengthError('textureArraySample');
            }
            const tex = args[0];
            if (!(tex instanceof PBShaderExp)) {
                throw new PBParamTypeError('textureArraySample', 'texture');
            }
            const texType = tex.$ast.getType();
            if (!texType.isTextureType()) {
                throw new PBParamTypeError('textureArraySample', 'texture');
            }
            if (pb.getDeviceType() === 'webgpu') {
                const sampler = pb.getDefaultSampler(tex, false);
                const coords = args[1];
                const arrayIndex = args[2];
                const ret = callBuiltin(pb, name, tex, sampler, coords, arrayIndex);
                if (ret.$ast.getType().typeId === typeF32.typeId) {
                    return pb.vec4(ret, 0, 0, 1);
                }
                else {
                    return ret;
                }
            }
            else if (pb.getDeviceType() === 'webgl2') {
                pb.getDefaultSampler(tex, false);
                const coords = args[1];
                const arrayIndex = args[2];
                const coordsComposit = pb.vec3(coords, pb.float(arrayIndex));
                return callBuiltin(pb, name, tex, coordsComposit);
            }
        }
    },
    textureSampleBias: {
        overloads: [
            ...genType('textureSampleBias', MASK_WEBGPU, typeF32Vec4, [typeTex2D, typeSampler, typeF32Vec2, typeF32]),
            ...genType('textureSampleBias', MASK_WEBGPU, typeF32Vec4, [typeTex3D, typeSampler, typeF32Vec3, typeF32]),
            ...genType('textureSampleBias', MASK_WEBGPU, typeF32Vec4, [typeTexCube, typeSampler, typeF32Vec3, typeF32]),
            ...genType('texture', MASK_WEBGL2, typeF32Vec4, [typeTex2D, typeF32Vec2, typeF32]),
            ...genType('texture', MASK_WEBGL2, typeF32Vec4, [typeTex3D, typeF32Vec3, typeF32]),
            ...genType('texture', MASK_WEBGL2, typeF32Vec4, [typeTexCube, typeF32Vec3, typeF32]),
            ...genType('texture2D', MASK_WEBGL1, typeF32Vec4, [typeTex2D, typeF32Vec2, typeF32]),
            ...genType('textureCube', MASK_WEBGL1, typeF32Vec4, [typeTexCube, typeF32Vec3, typeF32]),
        ],
        normalizeFunc(pb, name, ...args) {
            if (args.length !== 3) {
                throw new PBParamLengthError('textureSampleBias');
            }
            const tex = args[0];
            if (!(tex instanceof PBShaderExp)) {
                throw new PBParamTypeError('textureSampleBias', 'texture');
            }
            const texType = tex.$ast.getType();
            if (!texType.isTextureType()) {
                throw new PBParamTypeError('textureSampleBias', 'texture');
            }
            if (pb.getDeviceType() === 'webgpu') {
                const sampler = pb.getDefaultSampler(tex, false);
                return callBuiltin(pb, name, tex, sampler, args[1], args[2]);
            }
            else {
                pb.getDefaultSampler(tex, false);
                return callBuiltin(pb, name, ...args);
            }
        }
    },
    textureArraySampleBias: {
        overloads: [
            ...genType('textureSampleBias', MASK_WEBGPU, typeF32Vec4, [typeTex2DArray, typeSampler, typeF32Vec2, typeI32, typeF32]),
            ...genType('textureSampleBias', MASK_WEBGPU, typeF32Vec4, [typeTexCubeArray, typeSampler, typeF32Vec3, typeI32, typeF32]),
            ...genType('texture', MASK_WEBGL2, typeF32Vec4, [typeTex2DArray, typeF32Vec3, typeF32]),
        ],
        normalizeFunc(pb, name, ...args) {
            if (args.length !== 4) {
                throw new PBParamLengthError('textureArraySampleBias');
            }
            const tex = args[0];
            if (!(tex instanceof PBShaderExp)) {
                throw new PBParamTypeError('textureArraySampleBias', 'texture');
            }
            const texType = tex.$ast.getType();
            if (!texType.isTextureType()) {
                throw new PBParamTypeError('textureArraySampleBias', 'texture');
            }
            if (pb.getDeviceType() === 'webgpu') {
                const sampler = pb.getDefaultSampler(tex, false);
                return callBuiltin(pb, name, tex, sampler, args[1], args[2], args[3]);
            }
            else if (pb.getDeviceType() === 'webgl2') {
                pb.getDefaultSampler(tex, false);
                const coords = args[1];
                const arrayIndex = args[2];
                const coordsComposit = pb.vec3(coords, pb.float(arrayIndex));
                return callBuiltin(pb, name, tex, coordsComposit, args[3]);
            }
        }
    },
    textureSampleCompare: {
        overloads: [
            ...genType('textureSampleCompare', MASK_WEBGPU, typeF32, [typeTexDepth2D, typeSamplerComparison, typeF32Vec2, typeF32]),
            ...genType('textureSampleCompare', MASK_WEBGPU, typeF32, [typeTexDepthCube, typeSamplerComparison, typeF32Vec3, typeF32]),
            ...genType('texture', MASK_WEBGL2, typeF32, [typeTexDepth2D, typeF32Vec3]),
            ...genType('texture', MASK_WEBGL2, typeF32, [typeTexDepthCube, typeF32Vec4]),
        ],
        normalizeFunc(pb, name, ...args) {
            if (args.length !== 3) {
                throw new PBParamLengthError('textureSampleCompare');
            }
            const tex = args[0];
            if (!(tex instanceof PBShaderExp)) {
                throw new PBParamTypeError('textureSampleCompare', 'texture');
            }
            const texType = tex.$ast.getType();
            if (!texType.isTextureType() || !texType.isDepthTexture()) {
                throw new PBParamTypeError('textureSampleCompare', 'texture');
            }
            if (pb.getDeviceType() === 'webgpu') {
                const sampler = pb.getDefaultSampler(args[0], true);
                return callBuiltin(pb, name, tex, sampler, args[1], args[2]);
            }
            else {
                pb.getDefaultSampler(args[0], true);
                let coordsComposite;
                if (texType.isCubeTexture() || texType.isArrayTexture()) {
                    coordsComposite = pb.vec4(args[1], args[2]);
                }
                else {
                    coordsComposite = pb.vec3(args[1], args[2]);
                }
                return callBuiltin(pb, name, tex, coordsComposite);
            }
        }
    },
    textureArraySampleCompare: {
        overloads: [
            ...genType('textureSampleCompare', MASK_WEBGPU, typeF32, [typeTexDepth2DArray, typeSamplerComparison, typeF32Vec2, typeI32, typeF32]),
            ...genType('textureSampleCompare', MASK_WEBGPU, typeF32, [typeTexDepthCubeArray, typeSamplerComparison, typeF32Vec3, typeI32, typeF32]),
            ...genType('texture', MASK_WEBGL2, typeF32, [typeTexDepth2DArray, typeF32Vec4]),
        ],
        normalizeFunc(pb, name, ...args) {
            if (args.length !== 4) {
                throw new PBParamLengthError('textureArraySampleCompare');
            }
            const tex = args[0];
            if (!(tex instanceof PBShaderExp)) {
                throw new PBParamTypeError('textureArraySampleCompare', 'texture');
            }
            const texType = tex.$ast.getType();
            if (!texType.isTextureType() || !texType.isDepthTexture()) {
                throw new PBParamTypeError('textureArraySampleCompare', 'texture');
            }
            if (pb.getDeviceType() === 'webgpu') {
                const sampler = pb.getDefaultSampler(args[0], true);
                return callBuiltin(pb, name, tex, sampler, args[1], args[2], args[3]);
            }
            else {
                pb.getDefaultSampler(args[0], true);
                const coordsComposite = pb.vec4(args[1], pb.float(args[2]), args[3]);
                return callBuiltin(pb, name, tex, coordsComposite);
            }
        }
    },
    textureSampleLevel: {
        overloads: [
            ...genType('textureSampleLevel', MASK_WEBGPU, typeF32Vec4, [typeTex2D, typeSampler, typeF32Vec2, typeF32]),
            ...genType('textureSampleLevel', MASK_WEBGPU, typeF32Vec4, [typeTex3D, typeSampler, typeF32Vec3, typeF32]),
            ...genType('textureSampleLevel', MASK_WEBGPU, typeF32Vec4, [typeTexCube, typeSampler, typeF32Vec3, typeF32]),
            ...genType('textureSampleLevel', MASK_WEBGPU, typeF32Vec4, [typeTexExternal, typeSampler, typeF32Vec2]),
            ...genType('textureSampleLevel', MASK_WEBGPU, typeF32, [typeTexDepth2D, typeSampler, typeF32Vec2, typeI32]),
            ...genType('textureSampleLevel', MASK_WEBGPU, typeF32, [typeTexDepthCube, typeSampler, typeF32Vec3, typeI32]),
            ...genType('textureLod', MASK_WEBGL2, typeF32Vec4, [typeTex2D, typeF32Vec2, typeF32]),
            ...genType('textureLod', MASK_WEBGL2, typeF32Vec4, [typeTexDepth2D, typeF32Vec2, typeF32]),
            ...genType('textureLod', MASK_WEBGL2, typeF32Vec4, [typeTexExternal, typeF32Vec2, typeF32]),
            ...genType('textureLod', MASK_WEBGL2, typeF32Vec4, [typeTex3D, typeF32Vec3, typeF32]),
            ...genType('textureLod', MASK_WEBGL2, typeF32Vec4, [typeTexCube, typeF32Vec3, typeF32]),
            ...genType('textureLod', MASK_WEBGL2, typeF32Vec4, [typeTexDepthCube, typeF32Vec3, typeF32]),
            ...genType('texture2DLodEXT', MASK_WEBGL1, typeF32Vec4, [typeTex2D, typeF32Vec2, typeF32]),
            ...genType('texture2DLodEXT', MASK_WEBGL1, typeF32Vec4, [typeTexDepth2D, typeF32Vec2, typeF32]),
            ...genType('texture2DLodEXT', MASK_WEBGL1, typeF32Vec4, [typeTexExternal, typeF32Vec2, typeF32]),
            ...genType('textureCubeLodEXT', MASK_WEBGL1, typeF32Vec4, [typeTexCube, typeF32Vec3, typeF32]),
            ...genType('textureCubeLodEXT', MASK_WEBGL1, typeF32Vec4, [typeTexDepthCube, typeF32Vec3, typeF32]),
        ],
        normalizeFunc(pb, name, ...args) {
            const tex = args[0];
            if (!(tex instanceof PBShaderExp)) {
                throw new PBParamTypeError('textureSampleLevel', 'texture');
            }
            const texType = tex.$ast.getType();
            if (!texType.isTextureType()) {
                throw new PBParamTypeError('textureSampleLevel', 'texture');
            }
            if (pb.getDeviceType() === 'webgpu') {
                if (texType.isExternalTexture()) {
                    return pb.textureLoad(tex, pb.ivec2(args[1]), 0);
                }
                else {
                    const sampler = pb.getDefaultSampler(tex, false);
                    const level = texType.isDepthTexture() && (typeof args[2] === 'number' || (args[2] instanceof PBShaderExp && args[2].$ast.getType().typeId === typeF32.typeId)) ? pb.int(args[2]) : args[2];
                    const ret = texType.isExternalTexture() ? callBuiltin(pb, name, tex, sampler, args[1]) : callBuiltin(pb, name, tex, sampler, args[1], level);
                    if (ret.$ast.getType().typeId === typeF32.typeId) {
                        return pb.vec4(ret, 0, 0, 1);
                    }
                    else {
                        return ret;
                    }
                }
            }
            else {
                pb.getDefaultSampler(tex, false);
                return texType.isExternalTexture() ? callBuiltin(pb, name, args[0], args[1], 0) : callBuiltin(pb, name, args[0], args[1], args[2]);
            }
        }
    },
    textureArraySampleLevel: {
        overloads: [
            ...genType('textureSampleLevel', MASK_WEBGPU, typeF32Vec4, [typeTex2DArray, typeSampler, typeF32Vec2, typeI32, typeF32]),
            ...genType('textureSampleLevel', MASK_WEBGPU, typeF32Vec4, [typeTexCubeArray, typeSampler, typeF32Vec3, typeI32, typeF32]),
            ...genType('textureSampleLevel', MASK_WEBGPU, typeF32, [typeTexDepth2DArray, typeSampler, typeF32Vec2, typeI32, typeI32]),
            ...genType('textureSampleLevel', MASK_WEBGPU, typeF32, [typeTexDepthCubeArray, typeSampler, typeF32Vec3, typeI32, typeI32]),
            ...genType('textureLod', MASK_WEBGL2, typeF32Vec4, [typeTex2DArray, typeF32Vec3, typeF32]),
        ],
        normalizeFunc(pb, name, ...args) {
            if (args.length !== 4) {
                throw new PBParamLengthError('textureArraySampleLevel');
            }
            const tex = args[0];
            if (!(tex instanceof PBShaderExp)) {
                throw new PBParamTypeError('textureArraySampleLevel', 'texture');
            }
            const texType = tex.$ast.getType();
            if (!texType.isTextureType()) {
                throw new PBParamTypeError('textureArraySampleLevel', 'texture');
            }
            if (pb.getDeviceType() === 'webgpu') {
                const sampler = pb.getDefaultSampler(tex, false);
                const level = texType.isDepthTexture() && (typeof args[3] === 'number' || (args[3] instanceof PBShaderExp && args[3].$ast.getType().typeId === typeF32.typeId)) ? pb.int(args[3]) : args[3];
                const ret = callBuiltin(pb, name, tex, sampler, args[1], args[2], level);
                if (ret.$ast.getType().typeId === typeF32.typeId) {
                    return pb.vec4(ret, 0, 0, 1);
                }
                else {
                    return ret;
                }
            }
            else {
                pb.getDefaultSampler(tex, false);
                const coordsComposite = pb.vec3(args[1], pb.float(args[2]));
                return callBuiltin(pb, name, tex, coordsComposite, args[3]);
            }
        }
    },
    textureSampleCompareLevel: {
        overloads: [
            ...genType('textureSampleCompareLevel', MASK_WEBGPU, typeF32, [typeTexDepth2D, typeSamplerComparison, typeF32Vec2, typeF32]),
            ...genType('textureSampleCompareLevel', MASK_WEBGPU, typeF32, [typeTexDepthCube, typeSamplerComparison, typeF32Vec3, typeF32]),
            ...genType('textureLod', MASK_WEBGL2, typeF32, [typeTexDepth2D, typeF32Vec3, typeF32]),
            ...genType('texture', MASK_WEBGL2, typeF32, [typeTexDepthCube, typeF32Vec4]),
        ],
        normalizeFunc(pb, name, ...args) {
            if (args.length !== 3) {
                throw new PBParamLengthError('textureSampleCompareLevel');
            }
            const tex = args[0];
            if (!(tex instanceof PBShaderExp)) {
                throw new PBParamTypeError('textureSampleCompareLevel', 'texture');
            }
            const texType = tex.$ast.getType();
            if (!texType.isTextureType() || !texType.isDepthTexture()) {
                throw new PBParamTypeError('textureSampleCompareLevel', 'texture');
            }
            if (pb.getDeviceType() === 'webgpu') {
                const sampler = pb.getDefaultSampler(tex, true);
                return callBuiltin(pb, name, tex, sampler, args[1], args[2]);
            }
            else {
                pb.getDefaultSampler(args[0], true);
                let coordsComposite;
                if (texType.isCubeTexture() || texType.isArrayTexture()) {
                    coordsComposite = pb.vec4(args[1], args[2]);
                }
                else {
                    coordsComposite = pb.vec3(args[1], args[2]);
                }
                return texType.isCubeTexture() ? callBuiltin(pb, name, tex, coordsComposite) : callBuiltin(pb, name, tex, coordsComposite, 0);
            }
        }
    },
    textureArraySampleCompareLevel: {
        overloads: [
            ...genType('textureSampleCompareLevel', MASK_WEBGPU, typeF32, [typeTexDepth2DArray, typeSamplerComparison, typeF32Vec2, typeI32, typeF32]),
            ...genType('textureSampleCompareLevel', MASK_WEBGPU, typeF32, [typeTexDepthCubeArray, typeSamplerComparison, typeF32Vec3, typeI32, typeF32]),
            ...genType('texture', MASK_WEBGL2, typeF32, [typeTexDepth2DArray, typeF32Vec4]),
        ],
        normalizeFunc(pb, name, ...args) {
            if (args.length !== 4) {
                throw new PBParamLengthError('textureArraySampleCompareLevel');
            }
            const tex = args[0];
            if (!(tex instanceof PBShaderExp)) {
                throw new PBParamTypeError('textureArraySampleCompareLevel', 'texture');
            }
            const texType = tex.$ast.getType();
            if (!texType.isTextureType() || !texType.isDepthTexture()) {
                throw new PBParamTypeError('textureArraySampleCompareLevel', 'texture');
            }
            if (pb.getDeviceType() === 'webgpu') {
                const sampler = pb.getDefaultSampler(tex, true);
                return callBuiltin(pb, name, tex, sampler, args[1], args[2], args[3]);
            }
            else {
                pb.getDefaultSampler(args[0], true);
                const coordsComposite = pb.vec4(args[1], pb.float(args[2]), args[3]);
                return callBuiltin(pb, name, tex, coordsComposite);
            }
        }
    },
    textureSampleGrad: {
        overloads: [
            ...genType('textureSampleGrad', MASK_WEBGPU, typeF32Vec4, [typeTex2D, typeSampler, typeF32Vec2, typeF32Vec2, typeF32Vec2]),
            ...genType('textureSampleGrad', MASK_WEBGPU, typeF32Vec4, [typeTex3D, typeSampler, typeF32Vec3, typeF32Vec3, typeF32Vec3]),
            ...genType('textureSampleGrad', MASK_WEBGPU, typeF32Vec4, [typeTexCube, typeSampler, typeF32Vec3, typeF32Vec3, typeF32Vec3]),
            ...genType('textureGrad', MASK_WEBGL2, typeF32Vec4, [typeTex2D, typeF32Vec2, typeF32Vec2, typeF32Vec2]),
            ...genType('textureGrad', MASK_WEBGL2, typeF32Vec4, [typeTex3D, typeF32Vec3, typeF32Vec3, typeF32Vec3]),
            ...genType('textureGrad', MASK_WEBGL2, typeF32Vec4, [typeTexCube, typeF32Vec3, typeF32Vec3, typeF32Vec3]),
            ...genType('texture2DGradEXT', MASK_WEBGL1, typeF32Vec4, [typeTex2D, typeF32Vec2, typeF32Vec2, typeF32Vec2]),
            ...genType('textureCubeGradEXT', MASK_WEBGL1, typeF32Vec4, [typeTexCube, typeF32Vec3, typeF32Vec3, typeF32Vec3]),
        ],
        normalizeFunc(pb, name, ...args) {
            if (args.length !== 4) {
                throw new PBParamLengthError('textureSampleGrad');
            }
            const tex = args[0];
            if (!(tex instanceof PBShaderExp)) {
                throw new PBParamTypeError('textureSampleGrad', 'texture');
            }
            const texType = tex.$ast.getType();
            if (!texType.isTextureType()) {
                throw new PBParamTypeError('textureSampleGrad', 'texture');
            }
            if (pb.getDeviceType() === 'webgpu') {
                const sampler = pb.getDefaultSampler(tex, false);
                return callBuiltin(pb, name, tex, sampler, args[1], args[2], args[3]);
            }
            else {
                pb.getDefaultSampler(tex, false);
                return callBuiltin(pb, name, ...args);
            }
        }
    },
    textureArraySampleGrad: {
        overloads: [
            ...genType('textureSampleGrad', MASK_WEBGPU, typeF32Vec4, [typeTex2DArray, typeSampler, typeF32Vec2, typeI32, typeF32Vec2, typeF32Vec2]),
            ...genType('textureSampleGrad', MASK_WEBGPU, typeF32Vec4, [typeTexCubeArray, typeSampler, typeF32Vec3, typeI32, typeF32Vec3, typeF32Vec3]),
            ...genType('textureGrad', MASK_WEBGL2, typeF32Vec4, [typeTex2DArray, typeF32Vec3, typeF32Vec2, typeF32Vec2]),
        ],
        normalizeFunc(pb, name, ...args) {
            if (args.length !== 5) {
                throw new PBParamLengthError('textureArraySampleGrad');
            }
            const tex = args[0];
            if (!(tex instanceof PBShaderExp)) {
                throw new PBParamTypeError('textureArraySampleGrad', 'texture');
            }
            const texType = tex.$ast.getType();
            if (!texType.isTextureType() || !texType.isArrayTexture()) {
                throw new PBParamTypeError('textureArraySampleGrad', 'texture');
            }
            if (pb.getDeviceType() === 'webgpu') {
                const sampler = pb.getDefaultSampler(tex, false);
                return callBuiltin(pb, name, tex, sampler, args[1], args[2], args[3], args[4]);
            }
            else {
                pb.getDefaultSampler(tex, false);
                const coordsComposite = pb.vec3(args[1], pb.float(args[2]));
                return callBuiltin(pb, name, tex, coordsComposite, args[3], args[4]);
            }
        }
    },
    storageBarrier: { overloads: genType('storageBarrier', MASK_WEBGPU, typeVoid, []) },
    workgroupBarrier: { overloads: genType('workgroupBarrier', MASK_WEBGPU, typeVoid, []) },
};
function setBuiltinFuncs(cls) {
    for (const k of Object.keys(builtinFunctionsAll)) {
        cls.prototype[k] = function (...args) {
            const normalizeFunc = builtinFunctionsAll?.[k]?.normalizeFunc || callBuiltin;
            return normalizeFunc(this, k, ...args);
        };
    }
}

export { setBuiltinFuncs };
//# sourceMappingURL=builtinfunc.js.map
