import { TextureFormat } from '../base_types';
import { PBShaderExp, ShaderTypeFunc, makeConstructor } from './base';
import * as typeinfo from './types';
import * as AST from './ast';
import * as errors from './errors';
import type { ProgramBuilder } from './programbuilder';

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
  rgba32sint: TextureFormat.RGBA32I
};

export type StorageTextureConstructor = {
  [k in keyof typeof StorageTextureFormatMap]: (s?: string) => PBShaderExp;
};

function vec_n(
  this: ProgramBuilder,
  vecType: typeinfo.PBPrimitiveTypeInfo,
  ...args: (number | boolean | string | PBShaderExp)[]
): PBShaderExp {
  if (this.getDeviceType() === 'webgl') {
    if (vecType.scalarType === typeinfo.PBPrimitiveType.U32) {
      throw new errors.PBDeviceNotSupport('unsigned integer type');
    }
    if (vecType.isMatrixType() && vecType.cols !== vecType.rows) {
      throw new errors.PBDeviceNotSupport('non-square matrix type');
    }
  }

  if (args.length === 1 && typeof args[0] === 'string') {
    return new PBShaderExp(args[0], vecType);
  } else {
    const exp = new PBShaderExp('', vecType);
    exp.$ast = new AST.ASTShaderExpConstructor(
      exp.$typeinfo,
      args.map((arg) => {
        if (typeof arg === 'string') {
          throw new errors.PBParamTypeError('vec_n');
        }
        return arg instanceof PBShaderExp ? arg.$ast : arg;
      })
    );
    return exp;
  }
}

const primitiveCtors = {
  float: typeinfo.typeF32,
  int: typeinfo.typeI32,
  uint: typeinfo.typeU32,
  bool: typeinfo.typeBool,
  vec2: typeinfo.typeF32Vec2,
  ivec2: typeinfo.typeI32Vec2,
  uvec2: typeinfo.typeU32Vec2,
  bvec2: typeinfo.typeBVec2,
  vec3: typeinfo.typeF32Vec3,
  ivec3: typeinfo.typeI32Vec3,
  uvec3: typeinfo.typeU32Vec3,
  bvec3: typeinfo.typeBVec3,
  vec4: typeinfo.typeF32Vec4,
  ivec4: typeinfo.typeI32Vec4,
  uvec4: typeinfo.typeU32Vec4,
  bvec4: typeinfo.typeBVec4,
  mat2: typeinfo.typeMat2,
  mat2x3: typeinfo.typeMat2x3,
  mat2x4: typeinfo.typeMat2x4,
  mat3x2: typeinfo.typeMat3x2,
  mat3: typeinfo.typeMat3,
  mat3x4: typeinfo.typeMat3x4,
  mat4x2: typeinfo.typeMat4x2,
  mat4x3: typeinfo.typeMat4x3,
  mat4: typeinfo.typeMat4
};

const simpleCtors = {
  tex1D: typeinfo.typeTex1D,
  tex2D: typeinfo.typeTex2D,
  tex3D: typeinfo.typeTex3D,
  texCube: typeinfo.typeTexCube,
  tex2DShadow: typeinfo.typeTexDepth2D,
  texCubeShadow: typeinfo.typeTexDepthCube,
  tex2DArray: typeinfo.typeTex2DArray,
  tex2DArrayShadow: typeinfo.typeTexDepth2DArray,
  texExternal: typeinfo.typeTexExternal,
  itex1D: typeinfo.typeITex1D,
  itex2D: typeinfo.typeITex2D,
  itex3D: typeinfo.typeITex3D,
  itexCube: typeinfo.typeITexCube,
  itex2DArray: typeinfo.typeITex2DArray,
  utex1D: typeinfo.typeUTex1D,
  utex2D: typeinfo.typeUTex2D,
  utex3D: typeinfo.typeUTex3D,
  utexCube: typeinfo.typeUTexCube,
  utex2DArray: typeinfo.typeUTex2DArray,
  sampler: typeinfo.typeSampler,
  samplerComparison: typeinfo.typeSamplerComparison
};

function makeStorageTextureCtor(type: typeinfo.PBTextureType): StorageTextureConstructor {
  const ctor = {} as StorageTextureConstructor;
  for (const k of Object.keys(StorageTextureFormatMap)) {
    ctor[k] = function (rhs: string): PBShaderExp {
      return new PBShaderExp(rhs, new typeinfo.PBTextureTypeInfo(type, StorageTextureFormatMap[k]));
    };
  }
  return ctor;
}

const texStorageCtors = {
  texStorage1D: typeinfo.PBTextureType.TEX_STORAGE_1D,
  texStorage2D: typeinfo.PBTextureType.TEX_STORAGE_2D,
  texStorage2DArray: typeinfo.PBTextureType.TEX_STORAGE_2D_ARRAY,
  texStorage3D: typeinfo.PBTextureType.TEX_STORAGE_3D
};

/** @internal */
export function setConstructors(cls: typeof ProgramBuilder) {
  Object.keys(primitiveCtors).forEach((k) => {
    cls.prototype[k] = makeConstructor(
      function (this: ProgramBuilder, ...args: any[]): PBShaderExp {
        return vec_n.call(this, primitiveCtors[k], ...args);
      } as ShaderTypeFunc,
      primitiveCtors[k]
    );
  });
  Object.keys(simpleCtors).forEach((k) => {
    cls.prototype[k] = function (this: ProgramBuilder, rhs: string): PBShaderExp {
      return new PBShaderExp(rhs, simpleCtors[k]);
    };
  });
  Object.keys(texStorageCtors).forEach((k) => {
    cls.prototype[k] = makeStorageTextureCtor(texStorageCtors[k]);
  });
}

/*
ProgramBuilder.prototype.texStorage1D = makeStorageTextureCtor(typeinfo.PBTextureType.TEX_STORAGE_1D);
ProgramBuilder.prototype.texStorage2D = makeStorageTextureCtor(typeinfo.PBTextureType.TEX_STORAGE_2D);
ProgramBuilder.prototype.texStorage2DArray = makeStorageTextureCtor(typeinfo.PBTextureType.TEX_STORAGE_2D_ARRAY);
ProgramBuilder.prototype.texStorage3D = makeStorageTextureCtor(typeinfo.PBTextureType.TEX_STORAGE_3D);
*/
