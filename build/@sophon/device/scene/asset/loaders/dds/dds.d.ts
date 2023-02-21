import { TextureMipmapData } from '../../../../device/gpuobject';
declare enum DX10ResourceDimension {
    DDS_DIMENSION_TEXTURE1D = 2,
    DDS_DIMENSION_TEXTURE2D = 3,
    DDS_DIMENSION_TEXTURE3D = 4
}
declare enum DXGIFormat {
    DXGI_FORMAT_RGBA32F = 2,
    DXGI_FORMAT_RGBA32UI = 3,
    DXGI_FORMAT_RGBA32I = 4,
    DXGI_FORMAT_RGB32F = 6,
    DXGI_FORMAT_RGB32UI = 7,
    DXGI_FORMAT_RGB32I = 8,
    DXGI_FORMAT_RGBA16F = 10,
    DXGI_FORMAT_RGBA16UI = 12,
    DXGI_FORMAT_RGBA16I = 14,
    DXGI_FORMAT_RG32F = 16,
    DXGI_FORMAT_RG32UI = 17,
    DXGI_FORMAT_RG32I = 18,
    DXGI_FORMAT_RGBA8 = 28,
    DXGI_FORMAT_RGBA8_SRGB = 29,
    DXGI_FORMAT_RGBA8UI = 30,
    DXGI_FORMAT_RGBA8I = 32,
    DXGI_FORMAT_RG16F = 34,
    DXGI_FORMAT_RG16UI = 36,
    DXGI_FORMAT_RG16I = 38,
    DXGI_FORMAT_R32F = 41,
    DXGI_FORMAT_R32UI = 42,
    DXGI_FORMAT_R32I = 43,
    DXGI_FORMAT_R16F = 54,
    DXGI_FORMAT_R16UI = 57,
    DXGI_FORMAT_R16I = 59,
    DXGI_FORMAT_BGR565 = 85,
    DXGI_FORMAT_BGRA5551 = 86,
    DXGI_FORMAT_BGRA8 = 87,
    DXGI_FORMAT_BGRX8 = 88,
    DXGI_FORMAT_BGRA8_SRGB = 91,
    DXGI_FORMAT_BGRX8_SRGB = 93
}
interface DDSPixelFormat {
    dwFlags: number;
    dwFourCC?: number;
    dwRGBBitCount?: number;
    dwRBitMask?: number;
    dwGBitMask?: number;
    dwBBitMask?: number;
    dwABitMask?: number;
}
interface DDSHeader {
    dwSize: number;
    dwFlags: number;
    dwHeight: number;
    dwWidth: number;
    dwPitchOrLinearSize: number;
    dwDepth: number;
    dwMipmapCount: number;
    ddsPixelFormat: DDSPixelFormat;
    dwCaps: number;
    dwCaps2: number;
    dwCaps3: number;
    dwCaps4: number;
    ddsHeaderDX10: DDSHeaderDX10;
    dataOffset: number;
}
interface DDSHeaderDX10 {
    dxgiFormat: DXGIFormat;
    dimension: DX10ResourceDimension;
    miscFlag: number;
    arraySize: number;
}
export declare function loadDDSHeader(dds: ArrayBuffer): DDSHeader;
interface DDSMetaData extends TextureMipmapData {
    dataOffset: number;
}
export declare function getDDSMipLevelsInfo(dds: ArrayBuffer): DDSMetaData;
export {};
