/** sophon base library */
import { TextureFormat } from '../base_types.js';
import { makeConstructor, PBShaderExp } from './base.js';
import { PBTextureType, PBPrimitiveType, typeF32, typeI32, typeU32, typeBool, typeF32Vec2, typeI32Vec2, typeU32Vec2, typeBVec2, typeF32Vec3, typeI32Vec3, typeU32Vec3, typeBVec3, typeF32Vec4, typeI32Vec4, typeU32Vec4, typeBVec4, typeMat2, typeMat2x3, typeMat2x4, typeMat3x2, typeMat3, typeMat3x4, typeMat4x2, typeMat4x3, typeMat4, typeTex1D, typeTex2D, typeTex3D, typeTexCube, typeTexDepth2D, typeTexDepthCube, typeTex2DArray, typeTexDepth2DArray, typeTexExternal, typeITex1D, typeITex2D, typeITex3D, typeITexCube, typeITex2DArray, typeUTex1D, typeUTex2D, typeUTex3D, typeUTexCube, typeUTex2DArray, typeSampler, typeSamplerComparison, PBTextureTypeInfo } from './types.js';
import { ASTShaderExpConstructor } from './ast.js';
import { PBDeviceNotSupport, PBParamTypeError } from './errors.js';

const StorageTextureFormatMap = {
    rgba8unorm: TextureFormat.RGBA8UNORM,
    rgba8snorm: TextureFormat.RGBA8SNORM,
    rgba8uint: TextureFormat.RGBA8UI,
    rgba8sint: TextureFormat.RGBA8I,
    rgba16uint: TextureFormat.RGBA16UI,
    rgba16sint: TextureFormat.RGBA16I,
    rgba16float: TextureFormat.RGBA16F,
    r32float: TextureFormat.R32F,
    r32uint: TextureFormat.R32UI,
    r32sint: TextureFormat.R32I,
    rg32float: TextureFormat.RG32F,
    rg32uint: TextureFormat.RG32UI,
    rg32sint: TextureFormat.RG32I,
    rgba32float: TextureFormat.RGBA32F,
    rgba32uint: TextureFormat.RGBA32UI,
    rgba32sint: TextureFormat.RGBA32I,
};
function vec_n(vecType, ...args) {
    if (this.getDeviceType() === 'webgl') {
        if (vecType.scalarType === PBPrimitiveType.U32) {
            throw new PBDeviceNotSupport('unsigned integer type');
        }
        if (vecType.isMatrixType() && vecType.cols !== vecType.rows) {
            throw new PBDeviceNotSupport('non-square matrix type');
        }
    }
    if (args.length === 1 && typeof args[0] === 'string') {
        return new PBShaderExp(args[0], vecType);
    }
    else {
        const exp = new PBShaderExp('', vecType);
        exp.$ast = new ASTShaderExpConstructor(exp.$typeinfo, args.map(arg => {
            if (typeof arg === 'string') {
                throw new PBParamTypeError('vec_n');
            }
            return arg instanceof PBShaderExp ? arg.$ast : arg;
        }));
        return exp;
    }
}
const primitiveCtors = {
    float: typeF32,
    int: typeI32,
    uint: typeU32,
    bool: typeBool,
    vec2: typeF32Vec2,
    ivec2: typeI32Vec2,
    uvec2: typeU32Vec2,
    bvec2: typeBVec2,
    vec3: typeF32Vec3,
    ivec3: typeI32Vec3,
    uvec3: typeU32Vec3,
    bvec3: typeBVec3,
    vec4: typeF32Vec4,
    ivec4: typeI32Vec4,
    uvec4: typeU32Vec4,
    bvec4: typeBVec4,
    mat2: typeMat2,
    mat2x3: typeMat2x3,
    mat2x4: typeMat2x4,
    mat3x2: typeMat3x2,
    mat3: typeMat3,
    mat3x4: typeMat3x4,
    mat4x2: typeMat4x2,
    mat4x3: typeMat4x3,
    mat4: typeMat4
};
const simpleCtors = {
    tex1D: typeTex1D,
    tex2D: typeTex2D,
    tex3D: typeTex3D,
    texCube: typeTexCube,
    tex2DShadow: typeTexDepth2D,
    texCubeShadow: typeTexDepthCube,
    tex2DArray: typeTex2DArray,
    tex2DArrayShadow: typeTexDepth2DArray,
    texExternal: typeTexExternal,
    itex1D: typeITex1D,
    itex2D: typeITex2D,
    itex3D: typeITex3D,
    itexCube: typeITexCube,
    itex2DArray: typeITex2DArray,
    utex1D: typeUTex1D,
    utex2D: typeUTex2D,
    utex3D: typeUTex3D,
    utexCube: typeUTexCube,
    utex2DArray: typeUTex2DArray,
    sampler: typeSampler,
    samplerComparison: typeSamplerComparison,
};
function makeStorageTextureCtor(type) {
    const ctor = {};
    for (const k of Object.keys(StorageTextureFormatMap)) {
        ctor[k] = function (rhs) {
            return new PBShaderExp(rhs, new PBTextureTypeInfo(type, StorageTextureFormatMap[k]));
        };
    }
    return ctor;
}
const texStorageCtors = {
    texStorage1D: PBTextureType.TEX_STORAGE_1D,
    texStorage2D: PBTextureType.TEX_STORAGE_2D,
    texStorage2DArray: PBTextureType.TEX_STORAGE_2D_ARRAY,
    texStorage3D: PBTextureType.TEX_STORAGE_3D
};
function setConstructors(cls) {
    Object.keys(primitiveCtors).forEach(k => {
        cls.prototype[k] = makeConstructor(function (...args) {
            return vec_n.call(this, primitiveCtors[k], ...args);
        }, primitiveCtors[k]);
    });
    Object.keys(simpleCtors).forEach(k => {
        cls.prototype[k] = function (rhs) {
            return new PBShaderExp(rhs, simpleCtors[k]);
        };
    });
    Object.keys(texStorageCtors).forEach(k => {
        cls.prototype[k] = makeStorageTextureCtor(texStorageCtors[k]);
    });
}

export { setConstructors };
//# sourceMappingURL=constructors.js.map
