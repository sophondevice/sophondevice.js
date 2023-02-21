import { TypedArray } from '../misc';
export type WebGLContext = WebGLRenderingContext | WebGL2RenderingContext;
export declare enum TextureTarget {
    Unknown = 0,
    Texture2D = 1,
    Texture3D = 2,
    TextureCubemap = 3,
    Texture2DArray = 4
}
export declare enum TextureOption {
    GENERATE_MIPMAP = 1,
    RENDERABLE = 2,
    MAGFILTER_LINEAR = 4,
    MINFILTER_LINEAR = 8,
    MIPFILTER_LINEAR = 16,
    REPEATABLE_U = 8,
    REPEATABLE_V = 16
}
export declare enum CompareFunc {
    Unknown = 0,
    Always = 1,
    LessEqual = 2,
    GreaterEqual = 3,
    Less = 4,
    Greater = 5,
    Equal = 6,
    NotEqual = 7,
    Never = 8
}
export declare enum CompareMode {
    None = 0,
    RefToTexture = 1
}
export declare enum TextureWrapping {
    Unknown = 0,
    Repeat = 1,
    MirroredRepeat = 2,
    ClampToEdge = 3
}
export declare enum TextureFilter {
    Unknown = 0,
    None = 1,
    Nearest = 2,
    Linear = 3
}
export declare function makeTextureFormat(compression: number, r: boolean, g: boolean, b: boolean, a: boolean, depth: boolean, stencil: boolean, float: boolean, integer: boolean, signed: boolean, srgb: boolean, bgr: boolean, blockWidth: number, blockHeight: number, blockSize: number): TextureFormat;
export declare enum TextureFormat {
    Unknown = 0,
    R8UNORM,
    R8SNORM,
    R16F,
    R32F,
    R8UI,
    R8I,
    R16UI,
    R16I,
    R32UI,
    R32I,
    RG8UNORM,
    RG8SNORM,
    RG16F,
    RG32F,
    RG8UI,
    RG8I,
    RG16UI,
    RG16I,
    RG32UI,
    RG32I,
    RGBA8UNORM,
    RGBA8UNORM_SRGB,
    RGBA8SNORM,
    BGRA8UNORM,
    BGRA8UNORM_SRGB,
    RGBA16F,
    RGBA32F,
    RGBA8UI,
    RGBA8I,
    RGBA16UI,
    RGBA16I,
    RGBA32UI,
    RGBA32I,
    D16,
    D24,
    D32F,
    D24S8,
    D32FS8,
    DXT1,
    DXT1_SRGB,
    DXT3,
    DXT3_SRGB,
    DXT5,
    DXT5_SRGB
}
export declare function linearTextureFormatToSRGB(format: TextureFormat): TextureFormat;
export declare function hasAlphaChannel(format: TextureFormat): boolean;
export declare function hasRedChannel(format: TextureFormat): boolean;
export declare function hasGreenChannel(format: TextureFormat): boolean;
export declare function hasBlueChannel(format: TextureFormat): boolean;
export declare function hasDepthChannel(format: TextureFormat): boolean;
export declare function hasStencilChannel(format: TextureFormat): boolean;
export declare function isFloatTextureFormat(format: TextureFormat): boolean;
export declare function isIntegerTextureFormat(format: TextureFormat): boolean;
export declare function isSignedTextureFormat(format: TextureFormat): boolean;
export declare function isCompressedTextureFormat(format: TextureFormat): boolean;
export declare function isDepthTextureFormat(format: TextureFormat): boolean;
export declare function isSRGBTextureFormat(format: TextureFormat): boolean;
export declare function getTextureFormatBlockSize(format: TextureFormat): number;
export declare function getTextureFormatBlockWidth(format: TextureFormat): number;
export declare function getTextureFormatBlockHeight(format: TextureFormat): number;
export declare function getCompressedTextureFormat(format: TextureFormat): number;
export declare function floatToHalf(val: number): number;
export declare function halfToFloat(val: number): number;
export declare function encodePixel(format: TextureFormat, r: number, g: number, b: number, a: number): TypedArray;
export declare function encodePixelToArray(format: TextureFormat, r: number, g: number, b: number, a: number, arr: Array<number>): void;
export declare enum PrimitiveType {
    Unknown = -1,
    TriangleList = 0,
    TriangleStrip = 1,
    TriangleFan = 2,
    LineList = 3,
    LineStrip = 4,
    PointList = 5
}
export declare enum ShaderType {
    Vertex = 1,
    Fragment = 2,
    Compute = 4
}
