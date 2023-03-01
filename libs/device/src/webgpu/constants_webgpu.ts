import { TextureFormat, PrimitiveType } from '../base_types';
import { StencilOp, FaceWinding, FaceMode } from '../render_states';
import type { CompareFunc, TextureWrapping, TextureFilter } from '../base_types';
import type { BlendEquation, BlendFunc } from '../render_states';

export const textureWrappingMap: Record<TextureWrapping, GPUAddressMode> = {
  repeat: 'repeat',
  'mirrored-repeat': 'mirror-repeat',
  clamp: 'clamp-to-edge'
};

export const textureFilterMap: Record<TextureFilter, GPUFilterMode> = {
  nearest: 'nearest',
  linear: 'linear',
  none: null
};

export const compareFuncMap: Record<CompareFunc, GPUCompareFunction> = {
  always: 'always',
  le: 'less-equal',
  ge: 'greater-equal',
  lt: 'less',
  gt: 'greater',
  eq: 'equal',
  ne: 'not-equal',
  never: 'never'
};

export const stencilOpMap: { [k: number]: GPUStencilOperation } = {
  [StencilOp.KEEP]: 'keep',
  [StencilOp.REPLACE]: 'replace',
  [StencilOp.ZERO]: 'zero',
  [StencilOp.INVERT]: 'invert',
  [StencilOp.INCR]: 'increment-clamp',
  [StencilOp.DECR]: 'decrement-clamp',
  [StencilOp.INCR_WRAP]: 'increment-wrap',
  [StencilOp.DECR_WRAP]: 'decrement-wrap'
};

export const primitiveTypeMap: { [k: number]: GPUPrimitiveTopology } = {
  [PrimitiveType.TriangleList]: 'triangle-list',
  [PrimitiveType.TriangleStrip]: 'triangle-strip',
  [PrimitiveType.LineList]: 'line-list',
  [PrimitiveType.LineStrip]: 'line-strip',
  [PrimitiveType.PointList]: 'point-list'
};

export const faceWindingMap: { [k: number]: GPUFrontFace } = {
  [FaceWinding.CCW]: 'ccw',
  [FaceWinding.CW]: 'cw'
};

export const faceModeMap: { [k: number]: GPUCullMode } = {
  [FaceMode.BACK]: 'back',
  [FaceMode.FRONT]: 'front',
  [FaceMode.NONE]: 'none'
};

export const blendEquationMap: Record<BlendEquation, GPUBlendOperation> = {
  add: 'add',
  subtract: 'subtract',
  'reverse-subtract': 'reverse-subtract',
  min: 'min',
  max: 'max'
};

export const blendFuncMap: Record<BlendFunc, GPUBlendFactor> = {
  'const-color': 'constant',
  'const-alpha': 'constant',
  'dst-color': 'dst',
  'dst-alpha': 'dst-alpha',
  'inv-const-color': 'one-minus-constant',
  'inv-const-alpha': 'one-minus-constant',
  'inv-dst-color': 'one-minus-dst',
  'inv-dst-alpha': 'one-minus-dst-alpha',
  'src-color': 'src',
  'src-alpha': 'src-alpha',
  'inv-src-color': 'one-minus-src',
  'inv-src-alpha': 'one-minus-src-alpha',
  'src-alpha-saturate': 'src-alpha-saturated',
  one: 'one',
  zero: 'zero'
};

export const vertexFormatToHash: { [fmt: string]: string } = {
  float32: '0',
  float32x2: '1',
  float32x3: '2',
  float32x4: '3',
  uint32: '4',
  uint32x2: '5',
  uint32x3: '6',
  uint32x4: '7',
  sint32: '8',
  sint32x2: '9',
  sint32x3: 'a',
  sint32x4: 'b',
  uint16x2: 'c',
  uint16x4: 'd',
  unorm16x2: 'e',
  unorm16x4: 'f',
  sint16x2: 'g',
  sint16x4: 'h',
  snorm16x2: 'i',
  snorm16x4: 'j',
  uint8x2: 'k',
  uint8x4: 'l',
  unorm8x2: 'm',
  unorm8x4: 'n',
  sint8x2: 'o',
  sint8x4: 'p',
  snorm8x2: 'q',
  snorm8x4: 'r'
};

export const textureFormatMap: { [fmt: number]: GPUTextureFormat } = {
  [TextureFormat.RGBA8UNORM]: 'rgba8unorm',
  [TextureFormat.RGBA8SNORM]: 'rgba8snorm',
  [TextureFormat.BGRA8UNORM]: 'bgra8unorm',
  [TextureFormat.DXT1]: 'bc1-rgba-unorm',
  [TextureFormat.DXT3]: 'bc2-rgba-unorm',
  [TextureFormat.DXT5]: 'bc3-rgba-unorm',
  [TextureFormat.DXT1_SRGB]: 'bc1-rgba-unorm-srgb',
  [TextureFormat.DXT3_SRGB]: 'bc2-rgba-unorm-srgb',
  [TextureFormat.DXT5_SRGB]: 'bc3-rgba-unorm-srgb',
  [TextureFormat.R8UNORM]: 'r8unorm',
  [TextureFormat.R8SNORM]: 'r8snorm',
  [TextureFormat.R16F]: 'r16float',
  [TextureFormat.R32F]: 'r32float',
  [TextureFormat.R8UI]: 'r8uint',
  [TextureFormat.R8I]: 'r8sint',
  [TextureFormat.R16UI]: 'r16uint',
  [TextureFormat.R16I]: 'r16sint',
  [TextureFormat.R32UI]: 'r32uint',
  [TextureFormat.R32I]: 'r32sint',
  [TextureFormat.RG8UNORM]: 'rg8unorm',
  [TextureFormat.RG8SNORM]: 'rg8snorm',
  [TextureFormat.RG16F]: 'rg16float',
  [TextureFormat.RG32F]: 'rg32float',
  [TextureFormat.RG8UI]: 'rg8uint',
  [TextureFormat.RG8I]: 'rg8sint',
  [TextureFormat.RG16UI]: 'rg16uint',
  [TextureFormat.RG16I]: 'rg16sint',
  [TextureFormat.RG32UI]: 'rg32uint',
  [TextureFormat.RG32I]: 'rg32sint',
  [TextureFormat.RGBA8UNORM_SRGB]: 'rgba8unorm-srgb',
  [TextureFormat.BGRA8UNORM_SRGB]: 'bgra8unorm-srgb',
  [TextureFormat.RGBA16F]: 'rgba16float',
  [TextureFormat.RGBA32F]: 'rgba32float',
  [TextureFormat.RGBA8UI]: 'rgba8uint',
  [TextureFormat.RGBA8I]: 'rgba8sint',
  [TextureFormat.RGBA16UI]: 'rgba16uint',
  [TextureFormat.RGBA16I]: 'rgba16sint',
  [TextureFormat.RGBA32UI]: 'rgba32uint',
  [TextureFormat.RGBA32I]: 'rgba32sint',
  [TextureFormat.D16]: 'depth16unorm',
  [TextureFormat.D24]: 'depth24plus',
  [TextureFormat.D32F]: 'depth32float',
  [TextureFormat.D32FS8]: 'depth32float-stencil8',
  [TextureFormat.D24S8]: 'depth24plus-stencil8'
};

function zip<K = string>(keys: string[], values: K[]): { [k: string]: K } {
  const ret: { [k: string]: K } = {};
  const len = keys.length;
  for (let i = 0; i < len; i++) {
    ret[keys[i]] = values[i];
  }
  return ret;
}

export const textureFormatInvMap = zip<TextureFormat>(
  Object.values(textureFormatMap),
  Object.keys(textureFormatMap).map((val) => Number(val))
);

export const hashToVertexFormat: { [hash: string]: string } = zip(
  Object.values(vertexFormatToHash),
  Object.keys(vertexFormatToHash)
);
