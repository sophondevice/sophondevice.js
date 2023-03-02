import type { TypedArray } from '@sophon/base';

/** @internal */
export type WebGLContext = WebGLRenderingContext | WebGL2RenderingContext;

export type TextureTarget = '2d' | '3d' | 'cube' | '2darray';
export type CompareFunc = 'always' | 'le' | 'ge' | 'lt' | 'gt' | 'eq' | 'ne' | 'never';
export type TextureWrapping = 'repeat' | 'mirrored-repeat' | 'clamp';
export type TextureFilter = 'none' | 'nearest' | 'linear';
export type DataType =
  | 'u8'
  | 'u8norm'
  | 'i8'
  | 'i8norm'
  | 'u16'
  | 'u16norm'
  | 'i16'
  | 'i16norm'
  | 'u32'
  | 'i32'
  | 'f16'
  | 'f32';

const RED_SHIFT = 0;
const GREEN_SHIFT = 1;
const BLUE_SHIFT = 2;
const ALPHA_SHIFT = 3;
const DEPTH_SHIFT = 4;
const STENCIL_SHIFT = 5;
const FLOAT_SHIFT = 6;
const INTEGER_SHIFT = 7;
const SIGNED_SHIFT = 8;
const SRGB_SHIFT = 9;
const BGR_SHIFT = 10;
const BLOCK_SIZE_SHIFT = 11;
const BLOCK_SIZE_MASK = 0x1f << BLOCK_SIZE_SHIFT;
const BLOCK_WIDTH_SHIFT = 16;
const BLOCK_WIDTH_MASK = 0xf << BLOCK_WIDTH_SHIFT;
const BLOCK_HEIGHT_SHIFT = 20;
const BLOCK_HEIGHT_MASK = 0xf << BLOCK_HEIGHT_SHIFT;
const COMPRESSED_FORMAT_SHIFT = 24;
const COMPRESSED_FORMAT_MASK = 0x1f << COMPRESSED_FORMAT_SHIFT;

const COMPRESSION_FORMAT_BC1 = 1 << COMPRESSED_FORMAT_SHIFT;
const COMPRESSION_FORMAT_BC2 = 2 << COMPRESSED_FORMAT_SHIFT;
const COMPRESSION_FORMAT_BC3 = 3 << COMPRESSED_FORMAT_SHIFT;
const COMPRESSION_FORMAT_BC4 = 4 << COMPRESSED_FORMAT_SHIFT;
const COMPRESSION_FORMAT_BC5 = 5 << COMPRESSED_FORMAT_SHIFT;
const COMPRESSION_FORMAT_BC6 = 6 << COMPRESSED_FORMAT_SHIFT;
const COMPRESSION_FORMAT_BC7 = 7 << COMPRESSED_FORMAT_SHIFT;
const COMPRESSION_FORMAT_ETC2_RGB8 = 8 << COMPRESSED_FORMAT_SHIFT;
const COMPRESSION_FORMAT_ETC2_RGB8_A1 = 9 << COMPRESSED_FORMAT_SHIFT;
const COMPRESSION_FORMAT_ETC2_RGBA8 = 10 << COMPRESSED_FORMAT_SHIFT;
const COMPRESSION_FORMAT_ASTC_4x4 = 11 << COMPRESSED_FORMAT_SHIFT;
const COMPRESSION_FORMAT_ASTC_5x4 = 12 << COMPRESSED_FORMAT_SHIFT;
const COMPRESSION_FORMAT_ASTC_5x5 = 13 << COMPRESSED_FORMAT_SHIFT;
const COMPRESSION_FORMAT_ASTC_6x5 = 14 << COMPRESSED_FORMAT_SHIFT;
const COMPRESSION_FORMAT_ASTC_6x6 = 15 << COMPRESSED_FORMAT_SHIFT;
const COMPRESSION_FORMAT_ASTC_8x5 = 16 << COMPRESSED_FORMAT_SHIFT;
const COMPRESSION_FORMAT_ASTC_8x6 = 17 << COMPRESSED_FORMAT_SHIFT;
const COMPRESSION_FORMAT_ASTC_8x8 = 18 << COMPRESSED_FORMAT_SHIFT;
const COMPRESSION_FORMAT_ASTC_10x5 = 19 << COMPRESSED_FORMAT_SHIFT;
const COMPRESSION_FORMAT_ASTC_10x6 = 20 << COMPRESSED_FORMAT_SHIFT;
const COMPRESSION_FORMAT_ASTC_10x8 = 21 << COMPRESSED_FORMAT_SHIFT;
const COMPRESSION_FORMAT_ASTC_10x10 = 22 << COMPRESSED_FORMAT_SHIFT;
const COMPRESSION_FORMAT_ASTC_12x10 = 23 << COMPRESSED_FORMAT_SHIFT;
const COMPRESSION_FORMAT_ASTC_12x12 = 24 << COMPRESSED_FORMAT_SHIFT;

const COMPRESSION_FORMAT_BITMASK = 0x1f << COMPRESSED_FORMAT_SHIFT;
const RED_BITMASK = 1 << RED_SHIFT;
const GREEN_BITMASK = 1 << GREEN_SHIFT;
const BLUE_BITMASK = 1 << BLUE_SHIFT;
const ALPHA_BITMASK = 1 << ALPHA_SHIFT;
const DEPTH_BITMASK = 1 << DEPTH_SHIFT;
const STENCIL_BITMASK = 1 << STENCIL_SHIFT;
const FLOAT_BITMASK = 1 << FLOAT_SHIFT;
const INTEGER_BITMASK = 1 << INTEGER_SHIFT;
const SIGNED_BITMASK = 1 << SIGNED_SHIFT;
const SRGB_BITMASK = 1 << SRGB_SHIFT;
const BGR_BITMASK = 1 << BGR_SHIFT;

export function makeTextureFormat(
  compression: number,
  r: boolean,
  g: boolean,
  b: boolean,
  a: boolean,
  depth: boolean,
  stencil: boolean,
  float: boolean,
  integer: boolean,
  signed: boolean,
  srgb: boolean,
  bgr: boolean,
  blockWidth: number,
  blockHeight: number,
  blockSize: number
): number {
  const compressionBits = compression << COMPRESSED_FORMAT_SHIFT;
  const colorBits =
    (r ? RED_BITMASK : 0) | (g ? GREEN_BITMASK : 0) | (b ? BLUE_BITMASK : 0) | (a ? ALPHA_BITMASK : 0);
  const depthStencilBits = (depth ? DEPTH_BITMASK : 0) | (stencil ? STENCIL_BITMASK : 0);
  const floatBits = float ? FLOAT_BITMASK : 0;
  const integerBits = integer ? INTEGER_BITMASK : 0;
  const signedBits = signed ? SIGNED_BITMASK : 0;
  const srgbBits = srgb ? SRGB_BITMASK : 0;
  const bgrBits = bgr ? BGR_BITMASK : 0;
  const blockBits =
    (blockWidth << BLOCK_WIDTH_SHIFT) | (blockHeight << BLOCK_HEIGHT_SHIFT) | (blockSize << BLOCK_SIZE_SHIFT);
  return (
    compressionBits |
    colorBits |
    depthStencilBits |
    floatBits |
    integerBits |
    signedBits |
    srgbBits |
    bgrBits |
    blockBits
  );
}

export type TextureFormat = 'unknown'|'r8unorm'|'r8snorm'|'r16f'|'r32f'|'r8ui'|'r8i'|'r16ui'|'r16i'|'r32ui'|'r32i'|'rg8unorm'|'rg8snorm'|'rg16f'|'rg32f'|'rg8ui'|'rg8i'|'rg16ui'|'rg16i'|'rg32ui'|'rg32i'|'rgba8unorm'|'rgba8unorm-srgb'|'rgba8snorm'|'bgra8unorm'|'bgra8unorm-srgb'|'rgba16f'|'rgba32f'|'rgba8ui'|'rgba8i'|'rgba16ui'|'rgba16i'|'rgba32ui'|'rgba32i'|'d16'|'d24'|'d32f'|'d24s8'|'d32fs8'|'dxt1'|'dxt1-srgb'|'dxt3'|'dxt3-srgb'|'dxt5'|'dxt5-srgb';

const textureFormatMap: Record<TextureFormat, number> = {
  'unknown': 0,
  'r8unorm': makeTextureFormat(
    0,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    1,
    1,
    1
  ),
  'r8snorm': makeTextureFormat(
    0,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    true,
    false,
    false,
    1,
    1,
    1
  ),
  'r16f': makeTextureFormat(
    0,
    true,
    false,
    false,
    false,
    false,
    false,
    true,
    false,
    true,
    false,
    false,
    1,
    1,
    2
  ),
  'r32f': makeTextureFormat(
    0,
    true,
    false,
    false,
    false,
    false,
    false,
    true,
    false,
    true,
    false,
    false,
    1,
    1,
    4
  ),
  'r8ui': makeTextureFormat(
    0,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    true,
    false,
    false,
    false,
    1,
    1,
    1
  ),
  'r8i': makeTextureFormat(
    0,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    true,
    true,
    false,
    false,
    1,
    1,
    1
  ),
  'r16ui': makeTextureFormat(
    0,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    true,
    false,
    false,
    false,
    1,
    1,
    2
  ),
  'r16i': makeTextureFormat(
    0,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    true,
    true,
    false,
    false,
    1,
    1,
    2
  ),
  'r32ui': makeTextureFormat(
    0,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    true,
    false,
    false,
    false,
    1,
    1,
    4
  ),
  'r32i': makeTextureFormat(
    0,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    true,
    true,
    false,
    false,
    1,
    1,
    4
  ),
  'rg8unorm': makeTextureFormat(
    0,
    true,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    1,
    1,
    2
  ),
  'rg8snorm': makeTextureFormat(
    0,
    true,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    true,
    false,
    false,
    1,
    1,
    2
  ),
  'rg16f': makeTextureFormat(
    0,
    true,
    true,
    false,
    false,
    false,
    false,
    true,
    false,
    true,
    false,
    false,
    1,
    1,
    4
  ),
  'rg32f': makeTextureFormat(
    0,
    true,
    true,
    false,
    false,
    false,
    false,
    true,
    false,
    true,
    false,
    false,
    1,
    1,
    8
  ),
  'rg8ui': makeTextureFormat(
    0,
    true,
    true,
    false,
    false,
    false,
    false,
    false,
    true,
    false,
    false,
    false,
    1,
    1,
    2
  ),
  'rg8i': makeTextureFormat(
    0,
    true,
    true,
    false,
    false,
    false,
    false,
    false,
    true,
    true,
    false,
    false,
    1,
    1,
    2
  ),
  'rg16ui': makeTextureFormat(
    0,
    true,
    true,
    false,
    false,
    false,
    false,
    false,
    true,
    false,
    false,
    false,
    1,
    1,
    4
  ),
  'rg16i': makeTextureFormat(
    0,
    true,
    true,
    false,
    false,
    false,
    false,
    false,
    true,
    true,
    false,
    false,
    1,
    1,
    4
  ),
  'rg32ui': makeTextureFormat(
    0,
    true,
    true,
    false,
    false,
    false,
    false,
    false,
    true,
    false,
    false,
    false,
    1,
    1,
    8
  ),
  'rg32i': makeTextureFormat(
    0,
    true,
    true,
    false,
    false,
    false,
    false,
    false,
    true,
    true,
    false,
    false,
    1,
    1,
    8
  ),
  'rgba8unorm': makeTextureFormat(
    0,
    true,
    true,
    true,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    1,
    1,
    4
  ),
  'rgba8unorm-srgb': makeTextureFormat(
    0,
    true,
    true,
    true,
    true,
    false,
    false,
    false,
    false,
    false,
    true,
    false,
    1,
    1,
    4
  ),
  'rgba8snorm': makeTextureFormat(
    0,
    true,
    true,
    true,
    true,
    false,
    false,
    false,
    false,
    true,
    false,
    false,
    1,
    1,
    4
  ),
  'bgra8unorm': makeTextureFormat(
    0,
    true,
    true,
    true,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    true,
    1,
    1,
    4
  ),
  'bgra8unorm-srgb': makeTextureFormat(
    0,
    true,
    true,
    true,
    true,
    false,
    false,
    false,
    false,
    false,
    true,
    true,
    1,
    1,
    4
  ),
  'rgba16f': makeTextureFormat(
    0,
    true,
    true,
    true,
    true,
    false,
    false,
    true,
    false,
    true,
    false,
    false,
    1,
    1,
    8
  ),
  'rgba32f': makeTextureFormat(
    0,
    true,
    true,
    true,
    true,
    false,
    false,
    true,
    false,
    true,
    false,
    false,
    1,
    1,
    16
  ),
  'rgba8ui': makeTextureFormat(
    0,
    true,
    true,
    true,
    true,
    false,
    false,
    false,
    true,
    false,
    false,
    false,
    1,
    1,
    4
  ),
  'rgba8i': makeTextureFormat(
    0,
    true,
    true,
    true,
    true,
    false,
    false,
    false,
    true,
    true,
    false,
    false,
    1,
    1,
    4
  ),
  'rgba16ui': makeTextureFormat(
    0,
    true,
    true,
    true,
    true,
    false,
    false,
    false,
    true,
    false,
    false,
    false,
    1,
    1,
    8
  ),
  'rgba16i': makeTextureFormat(
    0,
    true,
    true,
    true,
    true,
    false,
    false,
    false,
    true,
    true,
    false,
    false,
    1,
    1,
    8
  ),
  'rgba32ui': makeTextureFormat(
    0,
    true,
    true,
    true,
    true,
    false,
    false,
    false,
    true,
    false,
    false,
    false,
    1,
    1,
    16
  ),
  'rgba32i': makeTextureFormat(
    0,
    true,
    true,
    true,
    true,
    false,
    false,
    false,
    true,
    true,
    false,
    false,
    1,
    1,
    16
  ),
  'd16': makeTextureFormat(
    0,
    false,
    false,
    false,
    false,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    1,
    1,
    2
  ),
  'd24': makeTextureFormat(
    0,
    false,
    false,
    false,
    false,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    0,
    0,
    0
  ),
  'd32f': makeTextureFormat(
    0,
    false,
    false,
    false,
    false,
    true,
    false,
    true,
    false,
    true,
    false,
    false,
    1,
    1,
    4
  ),
  'd24s8': makeTextureFormat(
    0,
    false,
    false,
    false,
    false,
    true,
    true,
    false,
    false,
    false,
    false,
    false,
    1,
    1,
    4
  ),
  'd32fs8': makeTextureFormat(
    0,
    false,
    false,
    false,
    false,
    true,
    true,
    true,
    false,
    true,
    false,
    false,
    1,
    1,
    5
  ),
  // compressed texture formats
  'dxt1': makeTextureFormat(
    COMPRESSION_FORMAT_BC1,
    true,
    true,
    true,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    4,
    4,
    8
  ),
  'dxt1-srgb': makeTextureFormat(
    COMPRESSION_FORMAT_BC1,
    true,
    true,
    true,
    true,
    false,
    false,
    false,
    false,
    false,
    true,
    false,
    4,
    4,
    8
  ),
  'dxt3': makeTextureFormat(
    COMPRESSION_FORMAT_BC2,
    true,
    true,
    true,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    4,
    4,
    16
  ),
  'dxt3-srgb': makeTextureFormat(
    COMPRESSION_FORMAT_BC2,
    true,
    true,
    true,
    true,
    false,
    false,
    false,
    false,
    false,
    true,
    false,
    4,
    4,
    16
  ),
  'dxt5': makeTextureFormat(
    COMPRESSION_FORMAT_BC3,
    true,
    true,
    true,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    4,
    4,
    16
  ),
  'dxt5-srgb': makeTextureFormat(
    COMPRESSION_FORMAT_BC3,
    true,
    true,
    true,
    true,
    false,
    false,
    false,
    false,
    false,
    true,
    false,
    4,
    4,
    16
  )
}

export function linearTextureFormatToSRGB(format: TextureFormat): TextureFormat {
  switch (format) {
    case 'rgba8unorm':
      return 'rgba8unorm-srgb';
    case 'bgra8unorm':
      return 'bgra8unorm-srgb';
    case 'dxt1':
      return 'dxt1-srgb';
    case 'dxt3':
      return 'dxt3-srgb';
    case 'dxt5':
      return 'dxt5-srgb';
    default:
      return format;
  }
}
export function hasAlphaChannel(format: TextureFormat): boolean {
  return !!(textureFormatMap[format] & ALPHA_BITMASK);
}
export function hasRedChannel(format: TextureFormat): boolean {
  return !!(textureFormatMap[format] & RED_BITMASK);
}
export function hasGreenChannel(format: TextureFormat): boolean {
  return !!(textureFormatMap[format] & GREEN_BITMASK);
}
export function hasBlueChannel(format: TextureFormat): boolean {
  return !!(textureFormatMap[format] & BLUE_BITMASK);
}
export function hasDepthChannel(format: TextureFormat): boolean {
  return !!(textureFormatMap[format] & DEPTH_BITMASK);
}
export function hasStencilChannel(format: TextureFormat): boolean {
  return !!(textureFormatMap[format] & STENCIL_BITMASK);
}
export function isFloatTextureFormat(format: TextureFormat): boolean {
  return !!(textureFormatMap[format] & FLOAT_BITMASK);
}
export function isIntegerTextureFormat(format: TextureFormat): boolean {
  return !!(textureFormatMap[format] & INTEGER_BITMASK);
}
export function isSignedTextureFormat(format: TextureFormat): boolean {
  return !!(textureFormatMap[format] & SIGNED_BITMASK);
}
export function isCompressedTextureFormat(format: TextureFormat): boolean {
  return !!(textureFormatMap[format] & COMPRESSION_FORMAT_BITMASK);
}
export function isDepthTextureFormat(format: TextureFormat): boolean {
  return !!(textureFormatMap[format] & DEPTH_BITMASK);
}
export function isSRGBTextureFormat(format: TextureFormat): boolean {
  return !!(textureFormatMap[format] & SRGB_BITMASK);
}
export function getTextureFormatBlockSize(format: TextureFormat): number {
  return (textureFormatMap[format] & BLOCK_SIZE_MASK) >> BLOCK_SIZE_SHIFT;
}
export function getTextureFormatBlockWidth(format: TextureFormat): number {
  return (textureFormatMap[format] & BLOCK_WIDTH_MASK) >> BLOCK_WIDTH_SHIFT;
}
export function getTextureFormatBlockHeight(format: TextureFormat): number {
  return (textureFormatMap[format] & BLOCK_HEIGHT_MASK) >> BLOCK_HEIGHT_SHIFT;
}
export function getCompressedTextureFormat(format: TextureFormat): number {
  return (textureFormatMap[format] & COMPRESSED_FORMAT_MASK) >> COMPRESSED_FORMAT_SHIFT;
}

function normalizeColorComponent(val: number, maxval: number) {
  return Math.min(maxval, Math.max(Math.floor(val * maxval), 0));
}

function normalizeColorComponentSigned(val: number, maxval: number) {
  return normalizeColorComponent(val * 0.5 + 0.5, maxval) - (maxval + 1) / 2;
}

const _floatView = new Float32Array(1);
const _int32View = new Int32Array(_floatView.buffer);
export function floatToHalf(val: number): number {
  _floatView[0] = val;
  const x = _int32View[0];
  let bits = (x >> 16) & 0x8000;
  let m = (x >> 12) & 0x07ff;
  const e = (x >> 23) & 0xff;
  if (e < 103) {
    return bits;
  }
  if (e > 142) {
    bits |= 0x7c00;
    bits |= (e === 255 ? 0 : 1) && x & 0x007fffff;
    return bits;
  }
  if (e < 113) {
    m |= 0x0800;
    bits |= (m >> (114 - e)) + ((m >> (113 - e)) & 1);
    return bits;
  }
  bits |= ((e - 112) << 10) | (m >> 1);
  bits += m & 1;
  return bits;
}

export function halfToFloat(val: number): number {
  const s = (val & 0x8000) >> 15;
  const e = (val & 0x7c00) >> 10;
  const f = val & 0x03ff;
  if (e === 0) {
    return (s ? -1 : 1) * Math.pow(2, -14) * (f / Math.pow(2, 10));
  } else if (e === 0x1f) {
    return f ? NaN : (s ? -1 : 1) * Infinity;
  }
  return (s ? -1 : 1) * Math.pow(2, e - 15) * (1 + f / Math.pow(2, 10));
}

function encode565(r: number, g: number, b: number): number {
  r = normalizeColorComponent(r, 255) >> 3;
  g = normalizeColorComponent(g, 255) >> 2;
  b = normalizeColorComponent(b, 255) >> 3;
  return (b & 0x1f) | ((g & 0x3f) << 5) | ((r & 0x1f) << 11);
}

function encode4444(r: number, g: number, b: number, a: number) {
  r = normalizeColorComponent(r, 255) >> 4;
  g = normalizeColorComponent(g, 255) >> 4;
  b = normalizeColorComponent(b, 255) >> 4;
  a = normalizeColorComponent(a, 255) >> 4;
  return (a & 0x0f) | ((b & 0x0f) << 4) | ((g & 0x0f) << 8) | ((r & 0x0f) << 12);
}

function encode5551(r: number, g: number, b: number, a: number) {
  r = normalizeColorComponent(r, 255) >> 3;
  g = normalizeColorComponent(g, 255) >> 3;
  b = normalizeColorComponent(b, 255) >> 3;
  return ((b & 0x1f) << 1) | ((g & 0x1f) << 6) | ((r & 0x1f) << 11) | (a >= 0.5 ? 1 : 0);
}

export function encodePixel(format: TextureFormat, r: number, g: number, b: number, a: number): TypedArray {
  switch (format) {
    case 'r8unorm':
      return new Uint8Array([normalizeColorComponent(r, 255)]);
    case 'r8snorm':
      return new Int8Array([normalizeColorComponentSigned(r, 255)]);
    case 'r16f':
      return new Uint16Array([floatToHalf(r)]);
    case 'r32f':
      return new Float32Array([r]);
    case 'r8ui':
      return new Uint8Array([r | 0]);
    case 'r8i':
      return new Int8Array([r | 0]);
    case 'r16ui':
      return new Uint16Array([r | 0]);
    case 'r16i':
      return new Int16Array([r | 0]);
    case 'r32ui':
      return new Uint32Array([r | 0]);
    case 'r32i':
      return new Int32Array([r | 0]);
    case 'rg8unorm':
      return new Uint8Array([normalizeColorComponent(r, 255), normalizeColorComponent(g, 255)]);
    case 'rg8snorm':
      return new Int8Array([normalizeColorComponentSigned(r, 255), normalizeColorComponentSigned(g, 255)]);
    case 'rg16f':
      return new Uint16Array([floatToHalf(r), floatToHalf(g)]);
    case 'rg32f':
      return new Float32Array([r, g]);
    case 'rg8ui':
      return new Uint8Array([r | 0, g | 0]);
    case 'rg8i':
      return new Int8Array([r | 0, g | 0]);
    case 'rg16ui':
      return new Uint16Array([r | 0, g | 0]);
    case 'rg16i':
      return new Int16Array([r | 0, g | 0]);
    case 'rg32ui':
      return new Uint32Array([r | 0, g | 0]);
    case 'rg32i':
      return new Int32Array([r | 0, g | 0]);
    case 'rgba8unorm':
    case 'rgba8unorm-srgb':
      return new Uint8Array([
        normalizeColorComponent(r, 255),
        normalizeColorComponent(g, 255),
        normalizeColorComponent(b, 255),
        normalizeColorComponent(a, 255)
      ]);
    case 'bgra8unorm':
    case 'bgra8unorm-srgb':
      return new Uint8Array([
        normalizeColorComponent(b, 255),
        normalizeColorComponent(g, 255),
        normalizeColorComponent(r, 255),
        normalizeColorComponent(a, 255)
      ]);
    case 'rgba8snorm':
      return new Int8Array([
        normalizeColorComponentSigned(r, 255),
        normalizeColorComponentSigned(g, 255),
        normalizeColorComponentSigned(b, 255),
        normalizeColorComponentSigned(a, 255)
      ]);
    case 'rgba16f':
      return new Uint16Array([floatToHalf(r), floatToHalf(g), floatToHalf(b), floatToHalf(a)]);
    case 'rgba32f':
      return new Float32Array([r, g, b, a]);
    case 'rgba8ui':
      return new Uint8Array([r | 0, g | 0, b | 0, a | 0]);
    case 'rgba8i':
      return new Int8Array([r | 0, g | 0, b | 0, a | 0]);
    case 'rgba16ui':
      return new Uint16Array([r | 0, g | 0, b | 0, a | 0]);
    case 'rgba16i':
      return new Int16Array([r | 0, g | 0, b | 0, a | 0]);
    case 'rgba32ui':
      return new Uint32Array([r | 0, g | 0, b | 0, a | 0]);
    case 'rgba32i':
      return new Int32Array([r | 0, g | 0, b | 0, a | 0]);
    default:
      return null;
  }
}

export function encodePixelToArray(
  format: TextureFormat,
  r: number,
  g: number,
  b: number,
  a: number,
  arr: Array<number>
): void {
  switch (format) {
    case 'r8unorm':
      arr.push(normalizeColorComponent(r, 255));
      break;
    case 'r8snorm':
      arr.push(normalizeColorComponentSigned(r, 255));
      break;
    case 'r16f':
      arr.push(floatToHalf(r));
      break;
    case 'r32f':
      arr.push(r);
      break;
    case 'r8ui':
      arr.push(r | 0);
      break;
    case 'r8i':
      arr.push(r | 0);
      break;
    case 'r16ui':
      arr.push(r | 0);
      break;
    case 'r16i':
      arr.push(r | 0);
      break;
    case 'r32ui':
      arr.push(r | 0);
      break;
    case 'r32i':
      arr.push(r | 0);
      break;
    case 'rg8unorm':
      arr.push(normalizeColorComponent(r, 255), normalizeColorComponent(g, 255));
      break;
    case 'rg8snorm':
      arr.push(normalizeColorComponentSigned(r, 255), normalizeColorComponentSigned(g, 255));
      break;
    case 'rg16f':
      arr.push(floatToHalf(r), floatToHalf(g));
      break;
    case 'rg32f':
      arr.push(r, g);
      break;
    case 'rg8ui':
      arr.push(r | 0, g | 0);
      break;
    case 'rg8i':
      arr.push(r | 0, g | 0);
      break;
    case 'rg16ui':
      arr.push(r | 0, g | 0);
      break;
    case 'rg16i':
      arr.push(r | 0, g | 0);
      break;
    case 'rg32ui':
      arr.push(r | 0, g | 0);
      break;
    case 'rg32i':
      arr.push(r | 0, g | 0);
      break;
    case 'rgba8unorm':
    case 'rgba8unorm-srgb':
      arr.push(
        normalizeColorComponent(r, 255),
        normalizeColorComponent(g, 255),
        normalizeColorComponent(b, 255),
        normalizeColorComponent(a, 255)
      );
      break;
    case 'bgra8unorm':
    case 'bgra8unorm-srgb':
      arr.push(
        normalizeColorComponent(b, 255),
        normalizeColorComponent(g, 255),
        normalizeColorComponent(r, 255),
        normalizeColorComponent(a, 255)
      );
      break;
    case 'rgba8snorm':
      arr.push(
        normalizeColorComponentSigned(r, 255),
        normalizeColorComponentSigned(g, 255),
        normalizeColorComponentSigned(b, 255),
        normalizeColorComponentSigned(a, 255)
      );
      break;
    case 'rgba16f':
      arr.push(floatToHalf(r), floatToHalf(g), floatToHalf(b), floatToHalf(a));
      break;
    case 'rgba32f':
      arr.push(r, g, b, a);
      break;
    case 'rgba8ui':
      arr.push(r | 0, g | 0, b | 0, a | 0);
      break;
    case 'rgba8i':
      arr.push(r | 0, g | 0, b | 0, a | 0);
      break;
    case 'rgba16ui':
      arr.push(r | 0, g | 0, b | 0, a | 0);
      break;
    case 'rgba16i':
      arr.push(r | 0, g | 0, b | 0, a | 0);
      break;
    case 'rgba32ui':
      arr.push(r | 0, g | 0, b | 0, a | 0);
      break;
    case 'rgba32i':
      arr.push(r | 0, g | 0, b | 0, a | 0);
      break;
  }
}

export type PrimitiveType = 'triangle-list'|'triangle-strip'|'triangle-fan'|'line-list'|'line-strip'|'point-list';

export enum ShaderType {
  Vertex = 1 << 0,
  Fragment = 1 << 1,
  Compute = 1 << 2
}
