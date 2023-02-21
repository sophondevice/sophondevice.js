/** sophon base library */
var TextureTarget;
(function (TextureTarget) {
    TextureTarget[TextureTarget["Unknown"] = 0] = "Unknown";
    TextureTarget[TextureTarget["Texture2D"] = 1] = "Texture2D";
    TextureTarget[TextureTarget["Texture3D"] = 2] = "Texture3D";
    TextureTarget[TextureTarget["TextureCubemap"] = 3] = "TextureCubemap";
    TextureTarget[TextureTarget["Texture2DArray"] = 4] = "Texture2DArray";
})(TextureTarget || (TextureTarget = {}));
var TextureOption;
(function (TextureOption) {
    TextureOption[TextureOption["GENERATE_MIPMAP"] = 1] = "GENERATE_MIPMAP";
    TextureOption[TextureOption["RENDERABLE"] = 2] = "RENDERABLE";
    TextureOption[TextureOption["MAGFILTER_LINEAR"] = 4] = "MAGFILTER_LINEAR";
    TextureOption[TextureOption["MINFILTER_LINEAR"] = 8] = "MINFILTER_LINEAR";
    TextureOption[TextureOption["MIPFILTER_LINEAR"] = 16] = "MIPFILTER_LINEAR";
    TextureOption[TextureOption["REPEATABLE_U"] = 8] = "REPEATABLE_U";
    TextureOption[TextureOption["REPEATABLE_V"] = 16] = "REPEATABLE_V";
})(TextureOption || (TextureOption = {}));
var CompareFunc;
(function (CompareFunc) {
    CompareFunc[CompareFunc["Unknown"] = 0] = "Unknown";
    CompareFunc[CompareFunc["Always"] = 1] = "Always";
    CompareFunc[CompareFunc["LessEqual"] = 2] = "LessEqual";
    CompareFunc[CompareFunc["GreaterEqual"] = 3] = "GreaterEqual";
    CompareFunc[CompareFunc["Less"] = 4] = "Less";
    CompareFunc[CompareFunc["Greater"] = 5] = "Greater";
    CompareFunc[CompareFunc["Equal"] = 6] = "Equal";
    CompareFunc[CompareFunc["NotEqual"] = 7] = "NotEqual";
    CompareFunc[CompareFunc["Never"] = 8] = "Never";
})(CompareFunc || (CompareFunc = {}));
var CompareMode;
(function (CompareMode) {
    CompareMode[CompareMode["None"] = 0] = "None";
    CompareMode[CompareMode["RefToTexture"] = 1] = "RefToTexture";
})(CompareMode || (CompareMode = {}));
var TextureWrapping;
(function (TextureWrapping) {
    TextureWrapping[TextureWrapping["Unknown"] = 0] = "Unknown";
    TextureWrapping[TextureWrapping["Repeat"] = 1] = "Repeat";
    TextureWrapping[TextureWrapping["MirroredRepeat"] = 2] = "MirroredRepeat";
    TextureWrapping[TextureWrapping["ClampToEdge"] = 3] = "ClampToEdge";
})(TextureWrapping || (TextureWrapping = {}));
var TextureFilter;
(function (TextureFilter) {
    TextureFilter[TextureFilter["Unknown"] = 0] = "Unknown";
    TextureFilter[TextureFilter["None"] = 1] = "None";
    TextureFilter[TextureFilter["Nearest"] = 2] = "Nearest";
    TextureFilter[TextureFilter["Linear"] = 3] = "Linear";
})(TextureFilter || (TextureFilter = {}));
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
function makeTextureFormat(compression, r, g, b, a, depth, stencil, float, integer, signed, srgb, bgr, blockWidth, blockHeight, blockSize) {
    const compressionBits = compression << COMPRESSED_FORMAT_SHIFT;
    const colorBits = (r ? RED_BITMASK : 0) | (g ? GREEN_BITMASK : 0) | (b ? BLUE_BITMASK : 0) | (a ? ALPHA_BITMASK : 0);
    const depthStencilBits = (depth ? DEPTH_BITMASK : 0) | (stencil ? STENCIL_BITMASK : 0);
    const floatBits = float ? FLOAT_BITMASK : 0;
    const integerBits = integer ? INTEGER_BITMASK : 0;
    const signedBits = signed ? SIGNED_BITMASK : 0;
    const srgbBits = srgb ? SRGB_BITMASK : 0;
    const bgrBits = bgr ? BGR_BITMASK : 0;
    const blockBits = (blockWidth << BLOCK_WIDTH_SHIFT) | (blockHeight << BLOCK_HEIGHT_SHIFT) | (blockSize << BLOCK_SIZE_SHIFT);
    return compressionBits | colorBits | depthStencilBits | floatBits | integerBits | signedBits | srgbBits | bgrBits | blockBits;
}
var TextureFormat;
(function (TextureFormat) {
    TextureFormat[TextureFormat["Unknown"] = 0] = "Unknown";
    TextureFormat[TextureFormat["R8UNORM"] = makeTextureFormat(0, true, false, false, false, false, false, false, false, false, false, false, 1, 1, 1)] = "R8UNORM";
    TextureFormat[TextureFormat["R8SNORM"] = makeTextureFormat(0, true, false, false, false, false, false, false, false, true, false, false, 1, 1, 1)] = "R8SNORM";
    TextureFormat[TextureFormat["R16F"] = makeTextureFormat(0, true, false, false, false, false, false, true, false, true, false, false, 1, 1, 2)] = "R16F";
    TextureFormat[TextureFormat["R32F"] = makeTextureFormat(0, true, false, false, false, false, false, true, false, true, false, false, 1, 1, 4)] = "R32F";
    TextureFormat[TextureFormat["R8UI"] = makeTextureFormat(0, true, false, false, false, false, false, false, true, false, false, false, 1, 1, 1)] = "R8UI";
    TextureFormat[TextureFormat["R8I"] = makeTextureFormat(0, true, false, false, false, false, false, false, true, true, false, false, 1, 1, 1)] = "R8I";
    TextureFormat[TextureFormat["R16UI"] = makeTextureFormat(0, true, false, false, false, false, false, false, true, false, false, false, 1, 1, 2)] = "R16UI";
    TextureFormat[TextureFormat["R16I"] = makeTextureFormat(0, true, false, false, false, false, false, false, true, true, false, false, 1, 1, 2)] = "R16I";
    TextureFormat[TextureFormat["R32UI"] = makeTextureFormat(0, true, false, false, false, false, false, false, true, false, false, false, 1, 1, 4)] = "R32UI";
    TextureFormat[TextureFormat["R32I"] = makeTextureFormat(0, true, false, false, false, false, false, false, true, true, false, false, 1, 1, 4)] = "R32I";
    TextureFormat[TextureFormat["RG8UNORM"] = makeTextureFormat(0, true, true, false, false, false, false, false, false, false, false, false, 1, 1, 2)] = "RG8UNORM";
    TextureFormat[TextureFormat["RG8SNORM"] = makeTextureFormat(0, true, true, false, false, false, false, false, false, true, false, false, 1, 1, 2)] = "RG8SNORM";
    TextureFormat[TextureFormat["RG16F"] = makeTextureFormat(0, true, true, false, false, false, false, true, false, true, false, false, 1, 1, 4)] = "RG16F";
    TextureFormat[TextureFormat["RG32F"] = makeTextureFormat(0, true, true, false, false, false, false, true, false, true, false, false, 1, 1, 8)] = "RG32F";
    TextureFormat[TextureFormat["RG8UI"] = makeTextureFormat(0, true, true, false, false, false, false, false, true, false, false, false, 1, 1, 2)] = "RG8UI";
    TextureFormat[TextureFormat["RG8I"] = makeTextureFormat(0, true, true, false, false, false, false, false, true, true, false, false, 1, 1, 2)] = "RG8I";
    TextureFormat[TextureFormat["RG16UI"] = makeTextureFormat(0, true, true, false, false, false, false, false, true, false, false, false, 1, 1, 4)] = "RG16UI";
    TextureFormat[TextureFormat["RG16I"] = makeTextureFormat(0, true, true, false, false, false, false, false, true, true, false, false, 1, 1, 4)] = "RG16I";
    TextureFormat[TextureFormat["RG32UI"] = makeTextureFormat(0, true, true, false, false, false, false, false, true, false, false, false, 1, 1, 8)] = "RG32UI";
    TextureFormat[TextureFormat["RG32I"] = makeTextureFormat(0, true, true, false, false, false, false, false, true, true, false, false, 1, 1, 8)] = "RG32I";
    TextureFormat[TextureFormat["RGBA8UNORM"] = makeTextureFormat(0, true, true, true, true, false, false, false, false, false, false, false, 1, 1, 4)] = "RGBA8UNORM";
    TextureFormat[TextureFormat["RGBA8UNORM_SRGB"] = makeTextureFormat(0, true, true, true, true, false, false, false, false, false, true, false, 1, 1, 4)] = "RGBA8UNORM_SRGB";
    TextureFormat[TextureFormat["RGBA8SNORM"] = makeTextureFormat(0, true, true, true, true, false, false, false, false, true, false, false, 1, 1, 4)] = "RGBA8SNORM";
    TextureFormat[TextureFormat["BGRA8UNORM"] = makeTextureFormat(0, true, true, true, true, false, false, false, false, false, false, true, 1, 1, 4)] = "BGRA8UNORM";
    TextureFormat[TextureFormat["BGRA8UNORM_SRGB"] = makeTextureFormat(0, true, true, true, true, false, false, false, false, false, true, true, 1, 1, 4)] = "BGRA8UNORM_SRGB";
    TextureFormat[TextureFormat["RGBA16F"] = makeTextureFormat(0, true, true, true, true, false, false, true, false, true, false, false, 1, 1, 8)] = "RGBA16F";
    TextureFormat[TextureFormat["RGBA32F"] = makeTextureFormat(0, true, true, true, true, false, false, true, false, true, false, false, 1, 1, 16)] = "RGBA32F";
    TextureFormat[TextureFormat["RGBA8UI"] = makeTextureFormat(0, true, true, true, true, false, false, false, true, false, false, false, 1, 1, 4)] = "RGBA8UI";
    TextureFormat[TextureFormat["RGBA8I"] = makeTextureFormat(0, true, true, true, true, false, false, false, true, true, false, false, 1, 1, 4)] = "RGBA8I";
    TextureFormat[TextureFormat["RGBA16UI"] = makeTextureFormat(0, true, true, true, true, false, false, false, true, false, false, false, 1, 1, 8)] = "RGBA16UI";
    TextureFormat[TextureFormat["RGBA16I"] = makeTextureFormat(0, true, true, true, true, false, false, false, true, true, false, false, 1, 1, 8)] = "RGBA16I";
    TextureFormat[TextureFormat["RGBA32UI"] = makeTextureFormat(0, true, true, true, true, false, false, false, true, false, false, false, 1, 1, 16)] = "RGBA32UI";
    TextureFormat[TextureFormat["RGBA32I"] = makeTextureFormat(0, true, true, true, true, false, false, false, true, true, false, false, 1, 1, 16)] = "RGBA32I";
    TextureFormat[TextureFormat["D16"] = makeTextureFormat(0, false, false, false, false, true, false, false, false, false, false, false, 1, 1, 2)] = "D16";
    TextureFormat[TextureFormat["D24"] = makeTextureFormat(0, false, false, false, false, true, false, false, false, false, false, false, 0, 0, 0)] = "D24";
    TextureFormat[TextureFormat["D32F"] = makeTextureFormat(0, false, false, false, false, true, false, true, false, true, false, false, 1, 1, 4)] = "D32F";
    TextureFormat[TextureFormat["D24S8"] = makeTextureFormat(0, false, false, false, false, true, true, false, false, false, false, false, 1, 1, 4)] = "D24S8";
    TextureFormat[TextureFormat["D32FS8"] = makeTextureFormat(0, false, false, false, false, true, true, true, false, true, false, false, 1, 1, 5)] = "D32FS8";
    TextureFormat[TextureFormat["DXT1"] = makeTextureFormat(COMPRESSION_FORMAT_BC1, true, true, true, true, false, false, false, false, false, false, false, 4, 4, 8)] = "DXT1";
    TextureFormat[TextureFormat["DXT1_SRGB"] = makeTextureFormat(COMPRESSION_FORMAT_BC1, true, true, true, true, false, false, false, false, false, true, false, 4, 4, 8)] = "DXT1_SRGB";
    TextureFormat[TextureFormat["DXT3"] = makeTextureFormat(COMPRESSION_FORMAT_BC2, true, true, true, true, false, false, false, false, false, false, false, 4, 4, 16)] = "DXT3";
    TextureFormat[TextureFormat["DXT3_SRGB"] = makeTextureFormat(COMPRESSION_FORMAT_BC2, true, true, true, true, false, false, false, false, false, true, false, 4, 4, 16)] = "DXT3_SRGB";
    TextureFormat[TextureFormat["DXT5"] = makeTextureFormat(COMPRESSION_FORMAT_BC3, true, true, true, true, false, false, false, false, false, false, false, 4, 4, 16)] = "DXT5";
    TextureFormat[TextureFormat["DXT5_SRGB"] = makeTextureFormat(COMPRESSION_FORMAT_BC3, true, true, true, true, false, false, false, false, false, true, false, 4, 4, 16)] = "DXT5_SRGB";
})(TextureFormat || (TextureFormat = {}));
function linearTextureFormatToSRGB(format) {
    switch (format) {
        case TextureFormat.RGBA8UNORM: return TextureFormat.RGBA8UNORM_SRGB;
        case TextureFormat.BGRA8UNORM: return TextureFormat.BGRA8UNORM_SRGB;
        case TextureFormat.DXT1: return TextureFormat.DXT1_SRGB;
        case TextureFormat.DXT3: return TextureFormat.DXT3_SRGB;
        case TextureFormat.DXT5: return TextureFormat.DXT5_SRGB;
        default: return format;
    }
}
function hasAlphaChannel(format) {
    return !!(format & ALPHA_BITMASK);
}
function hasRedChannel(format) {
    return !!(format & RED_BITMASK);
}
function hasGreenChannel(format) {
    return !!(format & GREEN_BITMASK);
}
function hasBlueChannel(format) {
    return !!(format & BLUE_BITMASK);
}
function hasDepthChannel(format) {
    return !!(format & DEPTH_BITMASK);
}
function hasStencilChannel(format) {
    return !!(format & STENCIL_BITMASK);
}
function isFloatTextureFormat(format) {
    return !!(format & FLOAT_BITMASK);
}
function isIntegerTextureFormat(format) {
    return !!(format & INTEGER_BITMASK);
}
function isSignedTextureFormat(format) {
    return !!(format & SIGNED_BITMASK);
}
function isCompressedTextureFormat(format) {
    return !!(format & COMPRESSION_FORMAT_BITMASK);
}
function isDepthTextureFormat(format) {
    return !!(format & DEPTH_BITMASK);
}
function isSRGBTextureFormat(format) {
    return !!(format & SRGB_BITMASK);
}
function getTextureFormatBlockSize(format) {
    return (format & BLOCK_SIZE_MASK) >> BLOCK_SIZE_SHIFT;
}
function getTextureFormatBlockWidth(format) {
    return (format & BLOCK_WIDTH_MASK) >> BLOCK_WIDTH_SHIFT;
}
function getTextureFormatBlockHeight(format) {
    return (format & BLOCK_HEIGHT_MASK) >> BLOCK_HEIGHT_SHIFT;
}
function getCompressedTextureFormat(format) {
    return (format & COMPRESSED_FORMAT_MASK) >> COMPRESSED_FORMAT_SHIFT;
}
function normalizeColorComponent(val, maxval) {
    return Math.min(maxval, Math.max(Math.floor(val * maxval), 0));
}
function normalizeColorComponentSigned(val, maxval) {
    return normalizeColorComponent(val * 0.5 + 0.5, maxval) - (maxval + 1) / 2;
}
const _floatView = new Float32Array(1);
const _int32View = new Int32Array(_floatView.buffer);
function floatToHalf(val) {
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
function halfToFloat(val) {
    const s = (val & 0x8000) >> 15;
    const e = (val & 0x7c00) >> 10;
    const f = val & 0x03ff;
    if (e === 0) {
        return (s ? -1 : 1) * Math.pow(2, -14) * (f / Math.pow(2, 10));
    }
    else if (e === 0x1f) {
        return f ? NaN : (s ? -1 : 1) * Infinity;
    }
    return (s ? -1 : 1) * Math.pow(2, e - 15) * (1 + f / Math.pow(2, 10));
}
function encodePixel(format, r, g, b, a) {
    switch (format) {
        case TextureFormat.R8UNORM:
            return new Uint8Array([normalizeColorComponent(r, 255)]);
        case TextureFormat.R8SNORM:
            return new Int8Array([normalizeColorComponentSigned(r, 255)]);
        case TextureFormat.R16F:
            return new Uint16Array([floatToHalf(r)]);
        case TextureFormat.R32F:
            return new Float32Array([r]);
        case TextureFormat.R8UI:
            return new Uint8Array([r | 0]);
        case TextureFormat.R8I:
            return new Int8Array([r | 0]);
        case TextureFormat.R16UI:
            return new Uint16Array([r | 0]);
        case TextureFormat.R16I:
            return new Int16Array([r | 0]);
        case TextureFormat.R32UI:
            return new Uint32Array([r | 0]);
        case TextureFormat.R32I:
            return new Int32Array([r | 0]);
        case TextureFormat.RG8UNORM:
            return new Uint8Array([normalizeColorComponent(r, 255), normalizeColorComponent(g, 255)]);
        case TextureFormat.RG8SNORM:
            return new Int8Array([normalizeColorComponentSigned(r, 255), normalizeColorComponentSigned(g, 255)]);
        case TextureFormat.RG16F:
            return new Uint16Array([floatToHalf(r), floatToHalf(g)]);
        case TextureFormat.RG32F:
            return new Float32Array([r, g]);
        case TextureFormat.RG8UI:
            return new Uint8Array([r | 0, g | 0]);
        case TextureFormat.RG8I:
            return new Int8Array([r | 0, g | 0]);
        case TextureFormat.RG16UI:
            return new Uint16Array([r | 0, g | 0]);
        case TextureFormat.RG16I:
            return new Int16Array([r | 0, g | 0]);
        case TextureFormat.RG32UI:
            return new Uint32Array([r | 0, g | 0]);
        case TextureFormat.RG32I:
            return new Int32Array([r | 0, g | 0]);
        case TextureFormat.RGBA8UNORM:
        case TextureFormat.RGBA8UNORM_SRGB:
            return new Uint8Array([
                normalizeColorComponent(r, 255),
                normalizeColorComponent(g, 255),
                normalizeColorComponent(b, 255),
                normalizeColorComponent(a, 255),
            ]);
        case TextureFormat.BGRA8UNORM:
        case TextureFormat.BGRA8UNORM_SRGB:
            return new Uint8Array([
                normalizeColorComponent(b, 255),
                normalizeColorComponent(g, 255),
                normalizeColorComponent(r, 255),
                normalizeColorComponent(a, 255),
            ]);
        case TextureFormat.RGBA8SNORM:
            return new Int8Array([
                normalizeColorComponentSigned(r, 255),
                normalizeColorComponentSigned(g, 255),
                normalizeColorComponentSigned(b, 255),
                normalizeColorComponentSigned(a, 255),
            ]);
        case TextureFormat.RGBA16F:
            return new Uint16Array([floatToHalf(r), floatToHalf(g), floatToHalf(b), floatToHalf(a)]);
        case TextureFormat.RGBA32F:
            return new Float32Array([r, g, b, a]);
        case TextureFormat.RGBA8UI:
            return new Uint8Array([r | 0, g | 0, b | 0, a | 0]);
        case TextureFormat.RGBA8I:
            return new Int8Array([r | 0, g | 0, b | 0, a | 0]);
        case TextureFormat.RGBA16UI:
            return new Uint16Array([r | 0, g | 0, b | 0, a | 0]);
        case TextureFormat.RGBA16I:
            return new Int16Array([r | 0, g | 0, b | 0, a | 0]);
        case TextureFormat.RGBA32UI:
            return new Uint32Array([r | 0, g | 0, b | 0, a | 0]);
        case TextureFormat.RGBA32I:
            return new Int32Array([r | 0, g | 0, b | 0, a | 0]);
        default:
            return null;
    }
}
function encodePixelToArray(format, r, g, b, a, arr) {
    switch (format) {
        case TextureFormat.R8UNORM:
            arr.push(normalizeColorComponent(r, 255));
            break;
        case TextureFormat.R8SNORM:
            arr.push(normalizeColorComponentSigned(r, 255));
            break;
        case TextureFormat.R16F:
            arr.push(floatToHalf(r));
            break;
        case TextureFormat.R32F:
            arr.push(r);
            break;
        case TextureFormat.R8UI:
            arr.push(r | 0);
            break;
        case TextureFormat.R8I:
            arr.push(r | 0);
            break;
        case TextureFormat.R16UI:
            arr.push(r | 0);
            break;
        case TextureFormat.R16I:
            arr.push(r | 0);
            break;
        case TextureFormat.R32UI:
            arr.push(r | 0);
            break;
        case TextureFormat.R32I:
            arr.push(r | 0);
            break;
        case TextureFormat.RG8UNORM:
            arr.push(normalizeColorComponent(r, 255), normalizeColorComponent(g, 255));
            break;
        case TextureFormat.RG8SNORM:
            arr.push(normalizeColorComponentSigned(r, 255), normalizeColorComponentSigned(g, 255));
            break;
        case TextureFormat.RG16F:
            arr.push(floatToHalf(r), floatToHalf(g));
            break;
        case TextureFormat.RG32F:
            arr.push(r, g);
            break;
        case TextureFormat.RG8UI:
            arr.push(r | 0, g | 0);
            break;
        case TextureFormat.RG8I:
            arr.push(r | 0, g | 0);
            break;
        case TextureFormat.RG16UI:
            arr.push(r | 0, g | 0);
            break;
        case TextureFormat.RG16I:
            arr.push(r | 0, g | 0);
            break;
        case TextureFormat.RG32UI:
            arr.push(r | 0, g | 0);
            break;
        case TextureFormat.RG32I:
            arr.push(r | 0, g | 0);
            break;
        case TextureFormat.RGBA8UNORM:
        case TextureFormat.RGBA8UNORM_SRGB:
            arr.push(normalizeColorComponent(r, 255), normalizeColorComponent(g, 255), normalizeColorComponent(b, 255), normalizeColorComponent(a, 255));
            break;
        case TextureFormat.BGRA8UNORM:
        case TextureFormat.BGRA8UNORM_SRGB:
            arr.push(normalizeColorComponent(b, 255), normalizeColorComponent(g, 255), normalizeColorComponent(r, 255), normalizeColorComponent(a, 255));
            break;
        case TextureFormat.RGBA8SNORM:
            arr.push(normalizeColorComponentSigned(r, 255), normalizeColorComponentSigned(g, 255), normalizeColorComponentSigned(b, 255), normalizeColorComponentSigned(a, 255));
            break;
        case TextureFormat.RGBA16F:
            arr.push(floatToHalf(r), floatToHalf(g), floatToHalf(b), floatToHalf(a));
            break;
        case TextureFormat.RGBA32F:
            arr.push(r, g, b, a);
            break;
        case TextureFormat.RGBA8UI:
            arr.push(r | 0, g | 0, b | 0, a | 0);
            break;
        case TextureFormat.RGBA8I:
            arr.push(r | 0, g | 0, b | 0, a | 0);
            break;
        case TextureFormat.RGBA16UI:
            arr.push(r | 0, g | 0, b | 0, a | 0);
            break;
        case TextureFormat.RGBA16I:
            arr.push(r | 0, g | 0, b | 0, a | 0);
            break;
        case TextureFormat.RGBA32UI:
            arr.push(r | 0, g | 0, b | 0, a | 0);
            break;
        case TextureFormat.RGBA32I:
            arr.push(r | 0, g | 0, b | 0, a | 0);
            break;
    }
}
var PrimitiveType;
(function (PrimitiveType) {
    PrimitiveType[PrimitiveType["Unknown"] = -1] = "Unknown";
    PrimitiveType[PrimitiveType["TriangleList"] = 0] = "TriangleList";
    PrimitiveType[PrimitiveType["TriangleStrip"] = 1] = "TriangleStrip";
    PrimitiveType[PrimitiveType["TriangleFan"] = 2] = "TriangleFan";
    PrimitiveType[PrimitiveType["LineList"] = 3] = "LineList";
    PrimitiveType[PrimitiveType["LineStrip"] = 4] = "LineStrip";
    PrimitiveType[PrimitiveType["PointList"] = 5] = "PointList";
})(PrimitiveType || (PrimitiveType = {}));
var ShaderType;
(function (ShaderType) {
    ShaderType[ShaderType["Vertex"] = 1] = "Vertex";
    ShaderType[ShaderType["Fragment"] = 2] = "Fragment";
    ShaderType[ShaderType["Compute"] = 4] = "Compute";
})(ShaderType || (ShaderType = {}));

export { CompareFunc, CompareMode, PrimitiveType, ShaderType, TextureFilter, TextureFormat, TextureOption, TextureTarget, TextureWrapping, encodePixel, encodePixelToArray, floatToHalf, getCompressedTextureFormat, getTextureFormatBlockHeight, getTextureFormatBlockSize, getTextureFormatBlockWidth, halfToFloat, hasAlphaChannel, hasBlueChannel, hasDepthChannel, hasGreenChannel, hasRedChannel, hasStencilChannel, isCompressedTextureFormat, isDepthTextureFormat, isFloatTextureFormat, isIntegerTextureFormat, isSRGBTextureFormat, isSignedTextureFormat, linearTextureFormatToSRGB, makeTextureFormat };
//# sourceMappingURL=base_types.js.map
