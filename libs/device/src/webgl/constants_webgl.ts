import { CubeFace } from '@sophon/base';
import { PrimitiveType } from '../base_types';
import { PBPrimitiveType } from '../builder/types';
import { WebGLEnum } from './webgl_enum';
import { FaceMode, FaceWinding, StencilOp } from '../render_states';
import type { TextureTarget, CompareFunc, TextureWrapping, TextureFilter } from '../base_types';
import type { BlendEquation, BlendFunc } from '../render_states';

export const blendEquationMap: Record<BlendEquation, number> = {
  add: WebGLEnum.FUNC_ADD,
  subtract: WebGLEnum.FUNC_SUBTRACT,
  'reverse-subtract': WebGLEnum.FUNC_REVERSE_SUBTRACT,
  max: WebGLEnum.FUNC_MAX,
  min: WebGLEnum.FUNC_MIN
};

export const blendEquationInvMap: Record<number, BlendEquation> = {
  [WebGLEnum.FUNC_ADD]: 'add',
  [WebGLEnum.FUNC_SUBTRACT]: 'subtract',
  [WebGLEnum.FUNC_REVERSE_SUBTRACT]: 'reverse-subtract',
  [WebGLEnum.FUNC_MAX]: 'max',
  [WebGLEnum.FUNC_MIN]: 'min'
};

export const blendFuncMap: Record<BlendFunc, number> = {
  zero: WebGLEnum.ZERO,
  one: WebGLEnum.ONE,
  'src-alpha': WebGLEnum.SRC_ALPHA,
  'inv-src-alpha': WebGLEnum.ONE_MINUS_SRC_ALPHA,
  'src-alpha-saturate': WebGLEnum.BLEND,
  'dst-alpha': WebGLEnum.DST_ALPHA,
  'inv-dst-alpha': WebGLEnum.ONE_MINUS_DST_ALPHA,
  'src-color': WebGLEnum.SRC_COLOR,
  'inv-src-color': WebGLEnum.ONE_MINUS_SRC_COLOR,
  'dst-color': WebGLEnum.DST_COLOR,
  'inv-dst-color': WebGLEnum.ONE_MINUS_DST_COLOR,
  'const-color': WebGLEnum.CONSTANT_COLOR,
  'inv-const-color': WebGLEnum.ONE_MINUS_CONSTANT_COLOR,
  'const-alpha': WebGLEnum.CONSTANT_ALPHA,
  'inv-const-alpha': WebGLEnum.ONE_MINUS_CONSTANT_ALPHA
};

export const blendFuncInvMap: Record<number, BlendFunc> = {
  [WebGLEnum.ZERO]: 'zero',
  [WebGLEnum.ONE]: 'one',
  [WebGLEnum.SRC_ALPHA]: 'src-alpha',
  [WebGLEnum.ONE_MINUS_SRC_ALPHA]: 'inv-src-alpha',
  [WebGLEnum.SRC_ALPHA_SATURATE]: 'src-alpha-saturate',
  [WebGLEnum.DST_ALPHA]: 'dst-alpha',
  [WebGLEnum.ONE_MINUS_DST_ALPHA]: 'inv-dst-alpha',
  [WebGLEnum.SRC_COLOR]: 'src-color',
  [WebGLEnum.ONE_MINUS_SRC_COLOR]: 'inv-src-color',
  [WebGLEnum.DST_COLOR]: 'dst-color',
  [WebGLEnum.ONE_MINUS_DST_COLOR]: 'inv-dst-color',
  [WebGLEnum.CONSTANT_COLOR]: 'const-color',
  [WebGLEnum.ONE_MINUS_CONSTANT_COLOR]: 'inv-const-color',
  [WebGLEnum.CONSTANT_ALPHA]: 'const-alpha',
  [WebGLEnum.ONE_MINUS_CONSTANT_ALPHA]: 'inv-const-alpha'
};

export const faceModeMap = {
  [FaceMode.NONE]: WebGLEnum.NONE,
  [FaceMode.FRONT]: WebGLEnum.FRONT,
  [FaceMode.BACK]: WebGLEnum.BACK
};

export const faceModeInvMap = {
  [WebGLEnum.NONE]: [FaceMode.NONE],
  [WebGLEnum.FRONT]: [FaceMode.FRONT],
  [WebGLEnum.BACK]: [FaceMode.BACK]
};

export const faceWindingMap = {
  [FaceWinding.CW]: WebGLEnum.CW,
  [FaceWinding.CCW]: WebGLEnum.CCW
};

export const faceWindingInvMap = {
  [WebGLEnum.CW]: [FaceWinding.CW],
  [WebGLEnum.CCW]: [FaceWinding.CCW]
};

export const stencilOpMap = {
  [StencilOp.KEEP]: WebGLEnum.KEEP,
  [StencilOp.ZERO]: WebGLEnum.ZERO,
  [StencilOp.REPLACE]: WebGLEnum.REPLACE,
  [StencilOp.INCR]: WebGLEnum.INCR,
  [StencilOp.INCR_WRAP]: WebGLEnum.INCR_WRAP,
  [StencilOp.DECR]: WebGLEnum.DECR,
  [StencilOp.DECR_WRAP]: WebGLEnum.DECR_WRAP,
  [StencilOp.INVERT]: WebGLEnum.INVERT
};

export const stencilOpInvMap = {
  [WebGLEnum.KEEP]: StencilOp.KEEP,
  [WebGLEnum.ZERO]: StencilOp.ZERO,
  [WebGLEnum.REPLACE]: StencilOp.REPLACE,
  [WebGLEnum.INCR]: StencilOp.INCR,
  [WebGLEnum.INCR_WRAP]: StencilOp.INCR_WRAP,
  [WebGLEnum.DECR]: StencilOp.DECR,
  [WebGLEnum.DECR_WRAP]: StencilOp.DECR_WRAP,
  [WebGLEnum.INVERT]: StencilOp.INVERT
};

export const compareFuncMap: Record<CompareFunc, number> = {
  always: WebGLEnum.ALWAYS,
  le: WebGLEnum.LEQUAL,
  ge: WebGLEnum.GEQUAL,
  lt: WebGLEnum.LESS,
  gt: WebGLEnum.GREATER,
  eq: WebGLEnum.EQUAL,
  ne: WebGLEnum.NOTEQUAL,
  never: WebGLEnum.NEVER
};

export const compareFuncInvMap: Record<number, CompareFunc> = {
  [WebGLEnum.NONE]: null,
  [WebGLEnum.ALWAYS]: 'always',
  [WebGLEnum.LEQUAL]: 'le',
  [WebGLEnum.GEQUAL]: 'ge',
  [WebGLEnum.LESS]: 'lt',
  [WebGLEnum.GREATER]: 'gt',
  [WebGLEnum.EQUAL]: 'eq',
  [WebGLEnum.NOTEQUAL]: 'ne',
  [WebGLEnum.NEVER]: 'never'
};

export const textureWrappingMap: Record<TextureWrapping, number> = {
  repeat: WebGLEnum.REPEAT,
  'mirrored-repeat': WebGLEnum.MIRRORED_REPEAT,
  clamp: WebGLEnum.CLAMP_TO_EDGE
};

export const typeMap = {
  [PBPrimitiveType.BOOL]: WebGLEnum.BOOL,
  [PBPrimitiveType.BVEC2]: WebGLEnum.BOOL_VEC2,
  [PBPrimitiveType.BVEC3]: WebGLEnum.BOOL_VEC3,
  [PBPrimitiveType.BVEC4]: WebGLEnum.BOOL_VEC4,
  [PBPrimitiveType.F32]: WebGLEnum.FLOAT,
  [PBPrimitiveType.F32VEC2]: WebGLEnum.FLOAT_VEC2,
  [PBPrimitiveType.F32VEC3]: WebGLEnum.FLOAT_VEC3,
  [PBPrimitiveType.F32VEC4]: WebGLEnum.FLOAT_VEC4,
  [PBPrimitiveType.I8]: WebGLEnum.BYTE,
  [PBPrimitiveType.I16]: WebGLEnum.SHORT,
  [PBPrimitiveType.I32]: WebGLEnum.INT,
  [PBPrimitiveType.I32VEC2]: WebGLEnum.INT_VEC2,
  [PBPrimitiveType.I32VEC3]: WebGLEnum.INT_VEC3,
  [PBPrimitiveType.I32VEC4]: WebGLEnum.INT_VEC4,
  [PBPrimitiveType.U8]: WebGLEnum.UNSIGNED_BYTE,
  [PBPrimitiveType.U16]: WebGLEnum.UNSIGNED_SHORT,
  [PBPrimitiveType.U32]: WebGLEnum.UNSIGNED_INT,
  [PBPrimitiveType.U32VEC2]: WebGLEnum.UNSIGNED_INT_VEC2,
  [PBPrimitiveType.U32VEC3]: WebGLEnum.UNSIGNED_INT_VEC3,
  [PBPrimitiveType.U32VEC4]: WebGLEnum.UNSIGNED_INT_VEC4
};

export const primitiveTypeMap = {
  [PrimitiveType.TriangleList]: WebGLEnum.TRIANGLES,
  [PrimitiveType.TriangleStrip]: WebGLEnum.TRIANGLE_STRIP,
  [PrimitiveType.TriangleFan]: WebGLEnum.TRIANGLE_FAN,
  [PrimitiveType.LineList]: WebGLEnum.LINES,
  [PrimitiveType.LineStrip]: WebGLEnum.LINE_STRIP,
  [PrimitiveType.PointList]: WebGLEnum.POINTS
};

export const textureTargetMap: Record<TextureTarget, number> = {
  '2d': WebGLEnum.TEXTURE_2D,
  '3d': WebGLEnum.TEXTURE_3D,
  cube: WebGLEnum.TEXTURE_CUBE_MAP,
  '2darray': WebGLEnum.TEXTURE_2D_ARRAY
};

export const cubeMapFaceMap = {
  [CubeFace.PX]: WebGLEnum.TEXTURE_CUBE_MAP_POSITIVE_X,
  [CubeFace.NX]: WebGLEnum.TEXTURE_CUBE_MAP_NEGATIVE_X,
  [CubeFace.PY]: WebGLEnum.TEXTURE_CUBE_MAP_POSITIVE_Y,
  [CubeFace.NY]: WebGLEnum.TEXTURE_CUBE_MAP_NEGATIVE_Y,
  [CubeFace.PZ]: WebGLEnum.TEXTURE_CUBE_MAP_POSITIVE_Z,
  [CubeFace.NZ]: WebGLEnum.TEXTURE_CUBE_MAP_NEGATIVE_Z
};

export function textureMagFilterToWebGL(magFilter: TextureFilter) {
  switch (magFilter) {
    case 'nearest':
      return WebGLEnum.NEAREST;
    case 'linear':
      return WebGLEnum.LINEAR;
    default:
      return WebGLEnum.NONE;
  }
}

export function textureMinFilterToWebGL(minFilter: TextureFilter, mipFilter: TextureFilter) {
  switch (minFilter) {
    case 'nearest':
      switch (mipFilter) {
        case 'none':
          return WebGLEnum.NEAREST;
        case 'nearest':
          return WebGLEnum.NEAREST_MIPMAP_NEAREST;
        case 'linear':
          return WebGLEnum.NEAREST_MIPMAP_LINEAR;
      }
      break;
    case 'linear':
      switch (mipFilter) {
        case 'none':
          return WebGLEnum.LINEAR;
        case 'nearest':
          return WebGLEnum.LINEAR_MIPMAP_NEAREST;
        case 'linear':
          return WebGLEnum.LINEAR_MIPMAP_LINEAR;
      }
      break;
  }
  return WebGLEnum.NONE;
}
