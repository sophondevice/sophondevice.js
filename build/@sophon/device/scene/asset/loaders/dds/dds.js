/** sophon base library */
import { TextureFormat } from '../../../../device/base_types.js';

const DDSHeaderSize = 31;
const DDSHeaderSizeExtended = 31 + 5;
const DDS_MAGIC = 0x20534444;
const DDPF_ALPHAPIXELS = 0x1;
const DDPF_ALPHA = 0x2;
const DDPF_FOURCC = 0x4;
const DDPF_RGB = 0x40;
const DDPF_LUMINANCE = 0x20000;
const DDSCAPS2_CUBEMAP = 0x200;
const DDSCAPS2_CUBEMAP_POSITIVEX = 0x400;
const DDSCAPS2_CUBEMAP_NEGATIVEX = 0x800;
const DDSCAPS2_CUBEMAP_POSITIVEY = 0x1000;
const DDSCAPS2_CUBEMAP_NEGATIVEY = 0x2000;
const DDSCAPS2_CUBEMAP_POSITIVEZ = 0x4000;
const DDSCAPS2_CUBEMAP_NEGATIVEZ = 0x8000;
const DDS_CUBEMAP_ALLFACES = DDSCAPS2_CUBEMAP |
    DDSCAPS2_CUBEMAP_POSITIVEX |
    DDSCAPS2_CUBEMAP_NEGATIVEX |
    DDSCAPS2_CUBEMAP_POSITIVEY |
    DDSCAPS2_CUBEMAP_NEGATIVEY |
    DDSCAPS2_CUBEMAP_POSITIVEZ |
    DDSCAPS2_CUBEMAP_NEGATIVEZ;
const DDSCAPS2_VOLUME = 0x200000;
var DX10ResourceDimension;
(function (DX10ResourceDimension) {
    DX10ResourceDimension[DX10ResourceDimension["DDS_DIMENSION_TEXTURE1D"] = 2] = "DDS_DIMENSION_TEXTURE1D";
    DX10ResourceDimension[DX10ResourceDimension["DDS_DIMENSION_TEXTURE2D"] = 3] = "DDS_DIMENSION_TEXTURE2D";
    DX10ResourceDimension[DX10ResourceDimension["DDS_DIMENSION_TEXTURE3D"] = 4] = "DDS_DIMENSION_TEXTURE3D";
})(DX10ResourceDimension || (DX10ResourceDimension = {}));
var DXGIFormat;
(function (DXGIFormat) {
    DXGIFormat[DXGIFormat["DXGI_FORMAT_RGBA32F"] = 2] = "DXGI_FORMAT_RGBA32F";
    DXGIFormat[DXGIFormat["DXGI_FORMAT_RGBA32UI"] = 3] = "DXGI_FORMAT_RGBA32UI";
    DXGIFormat[DXGIFormat["DXGI_FORMAT_RGBA32I"] = 4] = "DXGI_FORMAT_RGBA32I";
    DXGIFormat[DXGIFormat["DXGI_FORMAT_RGB32F"] = 6] = "DXGI_FORMAT_RGB32F";
    DXGIFormat[DXGIFormat["DXGI_FORMAT_RGB32UI"] = 7] = "DXGI_FORMAT_RGB32UI";
    DXGIFormat[DXGIFormat["DXGI_FORMAT_RGB32I"] = 8] = "DXGI_FORMAT_RGB32I";
    DXGIFormat[DXGIFormat["DXGI_FORMAT_RGBA16F"] = 10] = "DXGI_FORMAT_RGBA16F";
    DXGIFormat[DXGIFormat["DXGI_FORMAT_RGBA16UI"] = 12] = "DXGI_FORMAT_RGBA16UI";
    DXGIFormat[DXGIFormat["DXGI_FORMAT_RGBA16I"] = 14] = "DXGI_FORMAT_RGBA16I";
    DXGIFormat[DXGIFormat["DXGI_FORMAT_RG32F"] = 16] = "DXGI_FORMAT_RG32F";
    DXGIFormat[DXGIFormat["DXGI_FORMAT_RG32UI"] = 17] = "DXGI_FORMAT_RG32UI";
    DXGIFormat[DXGIFormat["DXGI_FORMAT_RG32I"] = 18] = "DXGI_FORMAT_RG32I";
    DXGIFormat[DXGIFormat["DXGI_FORMAT_RGBA8"] = 28] = "DXGI_FORMAT_RGBA8";
    DXGIFormat[DXGIFormat["DXGI_FORMAT_RGBA8_SRGB"] = 29] = "DXGI_FORMAT_RGBA8_SRGB";
    DXGIFormat[DXGIFormat["DXGI_FORMAT_RGBA8UI"] = 30] = "DXGI_FORMAT_RGBA8UI";
    DXGIFormat[DXGIFormat["DXGI_FORMAT_RGBA8I"] = 32] = "DXGI_FORMAT_RGBA8I";
    DXGIFormat[DXGIFormat["DXGI_FORMAT_RG16F"] = 34] = "DXGI_FORMAT_RG16F";
    DXGIFormat[DXGIFormat["DXGI_FORMAT_RG16UI"] = 36] = "DXGI_FORMAT_RG16UI";
    DXGIFormat[DXGIFormat["DXGI_FORMAT_RG16I"] = 38] = "DXGI_FORMAT_RG16I";
    DXGIFormat[DXGIFormat["DXGI_FORMAT_R32F"] = 41] = "DXGI_FORMAT_R32F";
    DXGIFormat[DXGIFormat["DXGI_FORMAT_R32UI"] = 42] = "DXGI_FORMAT_R32UI";
    DXGIFormat[DXGIFormat["DXGI_FORMAT_R32I"] = 43] = "DXGI_FORMAT_R32I";
    DXGIFormat[DXGIFormat["DXGI_FORMAT_R16F"] = 54] = "DXGI_FORMAT_R16F";
    DXGIFormat[DXGIFormat["DXGI_FORMAT_R16UI"] = 57] = "DXGI_FORMAT_R16UI";
    DXGIFormat[DXGIFormat["DXGI_FORMAT_R16I"] = 59] = "DXGI_FORMAT_R16I";
    DXGIFormat[DXGIFormat["DXGI_FORMAT_BGR565"] = 85] = "DXGI_FORMAT_BGR565";
    DXGIFormat[DXGIFormat["DXGI_FORMAT_BGRA5551"] = 86] = "DXGI_FORMAT_BGRA5551";
    DXGIFormat[DXGIFormat["DXGI_FORMAT_BGRA8"] = 87] = "DXGI_FORMAT_BGRA8";
    DXGIFormat[DXGIFormat["DXGI_FORMAT_BGRX8"] = 88] = "DXGI_FORMAT_BGRX8";
    DXGIFormat[DXGIFormat["DXGI_FORMAT_BGRA8_SRGB"] = 91] = "DXGI_FORMAT_BGRA8_SRGB";
    DXGIFormat[DXGIFormat["DXGI_FORMAT_BGRX8_SRGB"] = 93] = "DXGI_FORMAT_BGRX8_SRGB";
})(DXGIFormat || (DXGIFormat = {}));
var D3DFormat;
(function (D3DFormat) {
    D3DFormat[D3DFormat["D3DFMT_RGB8"] = 20] = "D3DFMT_RGB8";
    D3DFormat[D3DFormat["D3DFMT_ARGB8"] = 21] = "D3DFMT_ARGB8";
    D3DFormat[D3DFormat["D3DFMT_XRGB8"] = 22] = "D3DFMT_XRGB8";
    D3DFormat[D3DFormat["D3DFMT_RGB565"] = 23] = "D3DFMT_RGB565";
    D3DFormat[D3DFormat["D3DFMT_XRGB1555"] = 24] = "D3DFMT_XRGB1555";
    D3DFormat[D3DFormat["D3DFMT_ARGB1555"] = 25] = "D3DFMT_ARGB1555";
    D3DFormat[D3DFormat["D3DFMT_ARGB4"] = 26] = "D3DFMT_ARGB4";
    D3DFormat[D3DFormat["D3DFMT_A8"] = 28] = "D3DFMT_A8";
    D3DFormat[D3DFormat["D3DFMT_XRGB4"] = 30] = "D3DFMT_XRGB4";
    D3DFormat[D3DFormat["D3DFMT_ABGR8"] = 32] = "D3DFMT_ABGR8";
    D3DFormat[D3DFormat["D3DFMT_XBGR8"] = 33] = "D3DFMT_XBGR8";
    D3DFormat[D3DFormat["D3DFMT_A8P8"] = 40] = "D3DFMT_A8P8";
    D3DFormat[D3DFormat["D3DFMT_P8"] = 41] = "D3DFMT_P8";
    D3DFormat[D3DFormat["D3DFMT_L8"] = 50] = "D3DFMT_L8";
    D3DFormat[D3DFormat["D3DFMT_A8L8"] = 51] = "D3DFMT_A8L8";
    D3DFormat[D3DFormat["D3DFMT_DXT1"] = FourCCToInt32('DXT1')] = "D3DFMT_DXT1";
    D3DFormat[D3DFormat["D3DFMT_DXT2"] = FourCCToInt32('DXT2')] = "D3DFMT_DXT2";
    D3DFormat[D3DFormat["D3DFMT_DXT3"] = FourCCToInt32('DXT3')] = "D3DFMT_DXT3";
    D3DFormat[D3DFormat["D3DFMT_DXT4"] = FourCCToInt32('DXT4')] = "D3DFMT_DXT4";
    D3DFormat[D3DFormat["D3DFMT_DXT5"] = FourCCToInt32('DXT5')] = "D3DFMT_DXT5";
    D3DFormat[D3DFormat["D3DFMT_R16F"] = 111] = "D3DFMT_R16F";
    D3DFormat[D3DFormat["D3DFMT_RG16F"] = 112] = "D3DFMT_RG16F";
    D3DFormat[D3DFormat["D3DFMT_RGBA16F"] = 113] = "D3DFMT_RGBA16F";
    D3DFormat[D3DFormat["D3DFMT_R32F"] = 114] = "D3DFMT_R32F";
    D3DFormat[D3DFormat["D3DFMT_RG32F"] = 115] = "D3DFMT_RG32F";
    D3DFormat[D3DFormat["D3DFMT_RGBA32F"] = 116] = "D3DFMT_RGBA32F";
})(D3DFormat || (D3DFormat = {}));
function FourCCToInt32(value) {
    return (value.charCodeAt(0) +
        (value.charCodeAt(1) << 8) +
        (value.charCodeAt(2) << 16) +
        (value.charCodeAt(3) << 24));
}
function Int32ToFourCC(value) {
    return String.fromCharCode(value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff, (value >> 24) & 0xff);
}
function loadDDSHeader(dds) {
    const ddsHeader = {};
    const header = new Uint32Array(dds, 0, DDSHeaderSize + 1);
    const magic = header[0];
    if (magic !== DDS_MAGIC) {
        console.log('Invalid DDS magic');
        return null;
    }
    ddsHeader.dwSize = header[1];
    if (ddsHeader.dwSize !== 124) {
        console.log('Invalid DDS header size');
        return null;
    }
    ddsHeader.dataOffset = ddsHeader.dwSize + 4;
    ddsHeader.dwFlags = header[2];
    ddsHeader.dwHeight = header[3];
    ddsHeader.dwWidth = header[4];
    ddsHeader.dwPitchOrLinearSize = header[5];
    ddsHeader.dwDepth = header[6];
    ddsHeader.dwMipmapCount = header[7];
    ddsHeader.ddsPixelFormat = {};
    ddsHeader.ddsPixelFormat.dwFlags = header[20];
    ddsHeader.ddsPixelFormat.dwFourCC = header[21];
    ddsHeader.ddsPixelFormat.dwRGBBitCount = header[22];
    ddsHeader.ddsPixelFormat.dwRBitMask = header[23];
    ddsHeader.ddsPixelFormat.dwGBitMask = header[24];
    ddsHeader.ddsPixelFormat.dwBBitMask = header[25];
    ddsHeader.ddsPixelFormat.dwABitMask = header[26];
    ddsHeader.dwCaps = header[27];
    ddsHeader.dwCaps2 = header[28];
    ddsHeader.dwCaps3 = header[29];
    ddsHeader.dwCaps4 = header[30];
    if (Int32ToFourCC(ddsHeader.ddsPixelFormat.dwFourCC) === 'DX10') {
        const headerEx = new Uint32Array(dds, 0, DDSHeaderSizeExtended + 1);
        ddsHeader.ddsHeaderDX10 = {};
        ddsHeader.ddsHeaderDX10.dxgiFormat = headerEx[32];
        ddsHeader.ddsPixelFormat.dwFourCC = ddsHeader.ddsHeaderDX10.dxgiFormat;
        ddsHeader.ddsHeaderDX10.dimension = headerEx[33];
        ddsHeader.ddsHeaderDX10.miscFlag = headerEx[34];
        ddsHeader.ddsHeaderDX10.arraySize = headerEx[35];
        ddsHeader.dataOffset += 5 * 4;
    }
    return ddsHeader;
}
const legacyDDSMap = [
    {
        format: TextureFormat.DXT1,
        convertFlags: 0,
        pf: {
            dwFlags: DDPF_FOURCC,
            dwFourCC: FourCCToInt32('DXT1'),
        },
    },
    {
        format: TextureFormat.DXT3,
        convertFlags: 0,
        pf: {
            dwFlags: DDPF_FOURCC,
            dwFourCC: FourCCToInt32('DXT3'),
        },
    },
    {
        format: TextureFormat.DXT5,
        convertFlags: 0,
        pf: {
            dwFlags: DDPF_FOURCC,
            dwFourCC: FourCCToInt32('DXT5'),
        },
    },
    {
        format: TextureFormat.BGRA8UNORM,
        convertFlags: 1,
        pf: {
            dwFlags: DDPF_RGB | DDPF_ALPHAPIXELS,
            dwRGBBitCount: 32,
            dwRBitMask: 0x00ff0000,
            dwGBitMask: 0x0000ff00,
            dwBBitMask: 0x000000ff,
            dwABitMask: 0xff000000,
        },
    },
    {
        format: TextureFormat.BGRA8UNORM,
        convertFlags: 1 | 22,
        pf: {
            dwFlags: DDPF_RGB,
            dwRGBBitCount: 32,
            dwRBitMask: 0x00ff0000,
            dwGBitMask: 0x0000ff00,
            dwBBitMask: 0x000000ff,
        },
    },
    {
        format: TextureFormat.RGBA8UNORM,
        convertFlags: 0,
        pf: {
            dwFlags: DDPF_RGB | DDPF_ALPHAPIXELS,
            dwRGBBitCount: 32,
            dwRBitMask: 0x000000ff,
            dwGBitMask: 0x0000ff00,
            dwBBitMask: 0x00ff0000,
            dwABitMask: 0xff000000,
        },
    },
    {
        format: TextureFormat.RGBA8UNORM,
        convertFlags: 22,
        pf: {
            dwFlags: DDPF_RGB,
            dwRGBBitCount: 32,
            dwRBitMask: 0x000000ff,
            dwGBitMask: 0x0000ff00,
            dwBBitMask: 0x00ff0000,
        },
    },
    {
        format: TextureFormat.R16F,
        convertFlags: 0,
        pf: {
            dwFlags: DDPF_FOURCC,
            dwFourCC: 111,
        },
    },
    {
        format: TextureFormat.R16F,
        convertFlags: 0,
        pf: {
            dwFlags: DDPF_FOURCC,
            dwFourCC: DXGIFormat.DXGI_FORMAT_R16F,
        },
    },
    {
        format: TextureFormat.RG16F,
        convertFlags: 0,
        pf: {
            dwFlags: DDPF_FOURCC,
            dwFourCC: 112,
        },
    },
    {
        format: TextureFormat.RG16F,
        convertFlags: 0,
        pf: {
            dwFlags: DDPF_FOURCC,
            dwFourCC: DXGIFormat.DXGI_FORMAT_RG16F,
        },
    },
    {
        format: TextureFormat.RGBA16F,
        convertFlags: 0,
        pf: {
            dwFlags: DDPF_FOURCC,
            dwFourCC: 113,
        },
    },
    {
        format: TextureFormat.RGBA16F,
        convertFlags: 0,
        pf: {
            dwFlags: DDPF_FOURCC,
            dwFourCC: DXGIFormat.DXGI_FORMAT_RGBA16F,
        },
    },
    {
        format: TextureFormat.R32F,
        convertFlags: 0,
        pf: {
            dwFlags: DDPF_FOURCC,
            dwFourCC: 114,
        },
    },
    {
        format: TextureFormat.R32F,
        convertFlags: 0,
        pf: {
            dwFlags: DDPF_FOURCC,
            dwFourCC: DXGIFormat.DXGI_FORMAT_R32F,
        },
    },
    {
        format: TextureFormat.RG32F,
        convertFlags: 0,
        pf: {
            dwFlags: DDPF_FOURCC,
            dwFourCC: 115,
        },
    },
    {
        format: TextureFormat.RG32F,
        convertFlags: 0,
        pf: {
            dwFlags: DDPF_FOURCC,
            dwFourCC: DXGIFormat.DXGI_FORMAT_RG32F,
        },
    },
    {
        format: TextureFormat.RGBA32F,
        convertFlags: 0,
        pf: {
            dwFlags: DDPF_FOURCC,
            dwFourCC: 116,
        },
    },
    {
        format: TextureFormat.RGBA32F,
        convertFlags: 0,
        pf: {
            dwFlags: DDPF_FOURCC,
            dwFourCC: DXGIFormat.DXGI_FORMAT_RGBA32F,
        },
    },
];
function getTextureFormat(pf) {
    const flags = pf.dwFlags;
    let index;
    for (index = 0; index < legacyDDSMap.length; index++) {
        const entry = legacyDDSMap[index];
        if (flags & DDPF_FOURCC && entry.pf.dwFlags & DDPF_FOURCC) {
            if (pf.dwFourCC === entry.pf.dwFourCC) {
                break;
            }
        }
        else if (flags === entry.pf.dwFlags) {
            if (flags & DDPF_ALPHA) {
                if (pf.dwRGBBitCount === entry.pf.dwRGBBitCount && pf.dwABitMask === entry.pf.dwABitMask) {
                    break;
                }
            }
            else if (flags & DDPF_LUMINANCE) {
                if (pf.dwRGBBitCount === entry.pf.dwRGBBitCount && pf.dwRBitMask === entry.pf.dwRBitMask) {
                    if (pf.dwABitMask === entry.pf.dwABitMask || !(flags & DDPF_ALPHAPIXELS)) {
                        break;
                    }
                }
            }
            else if (pf.dwRGBBitCount === entry.pf.dwRGBBitCount) {
                if (pf.dwRBitMask === entry.pf.dwRBitMask &&
                    pf.dwGBitMask === entry.pf.dwGBitMask &&
                    pf.dwBBitMask === entry.pf.dwBBitMask) {
                    if (pf.dwABitMask === entry.pf.dwABitMask || !(flags & DDPF_ALPHAPIXELS)) {
                        break;
                    }
                }
            }
        }
    }
    if (index === legacyDDSMap.length) {
        return null;
    }
    return legacyDDSMap[index].format;
}
function getMetaDataFromHeader(header, metaData) {
    metaData = metaData || {};
    metaData.format = getTextureFormat(header.ddsPixelFormat);
    if (metaData.format === null) {
        return null;
    }
    metaData.isCompressed =
        metaData.format === TextureFormat.DXT1 ||
            metaData.format === TextureFormat.DXT3 ||
            metaData.format === TextureFormat.DXT5;
    metaData.dataOffset = header.ddsHeaderDX10 ? 37 * 4 : 32 * 4;
    metaData.width = header.dwWidth;
    metaData.height = header.dwHeight;
    metaData.depth = 1;
    metaData.mipLevels = header.dwMipmapCount || 1;
    metaData.arraySize = header.ddsHeaderDX10 ? header.ddsHeaderDX10.arraySize : 1;
    metaData.isCubemap = metaData.isVolume = false;
    if (header.dwCaps2 & DDS_CUBEMAP_ALLFACES) {
        metaData.isCubemap = true;
        metaData.arraySize *= 6;
    }
    else if (header.dwCaps2 & DDSCAPS2_VOLUME) {
        metaData.isVolume = true;
        metaData.depth = header.dwDepth;
    }
    return metaData;
}
function getMipmapData(dds, width, height, format, dataOffset) {
    switch (format) {
        case TextureFormat.R16F:
            return new Uint16Array(dds, dataOffset, width * height);
        case TextureFormat.RG16F:
            return new Uint16Array(dds, dataOffset, width * height * 2);
        case TextureFormat.R32F:
            return new Float32Array(dds, dataOffset, width * height);
        case TextureFormat.RGBA8UNORM:
        case TextureFormat.BGRA8UNORM:
            return new Uint8Array(dds, dataOffset, width * height * 4);
        case TextureFormat.RGBA16F:
            return new Uint16Array(dds, dataOffset, width * height * 4);
        case TextureFormat.RG32F:
            return new Float32Array(dds, dataOffset, width * height * 2);
        case TextureFormat.RGBA32F:
            return new Float32Array(dds, dataOffset, width * height * 4);
        case TextureFormat.DXT1:
            return new Uint8Array(dds, dataOffset, (((Math.max(4, width) / 4) * Math.max(4, height)) / 4) * 8);
        case TextureFormat.DXT3:
        case TextureFormat.DXT5:
            return new Uint8Array(dds, dataOffset, (((Math.max(4, width) / 4) * Math.max(4, height)) / 4) * 16);
        default:
            return null;
    }
}
function getDDSMipLevelsInfo(dds) {
    const ddsHeader = loadDDSHeader(dds);
    if (!ddsHeader) {
        return null;
    }
    const ddsLevelsInfo = {};
    getMetaDataFromHeader(ddsHeader, ddsLevelsInfo);
    ddsLevelsInfo.mipDatas = [];
    let dataOffset = ddsLevelsInfo.dataOffset;
    for (let i = 0; i < ddsLevelsInfo.arraySize; i++) {
        const mipDatas = [];
        let width = ddsLevelsInfo.width;
        let height = ddsLevelsInfo.height;
        for (let mip = 0; mip < ddsLevelsInfo.mipLevels; mip++) {
            const mipData = getMipmapData(dds, width, height, ddsLevelsInfo.format, dataOffset);
            mipDatas.push({ data: mipData, width: width, height: height });
            dataOffset += mipData.byteLength;
            width = Math.max(1, width >> 1);
            height = Math.max(1, height >> 1);
        }
        ddsLevelsInfo.mipDatas.push(mipDatas);
    }
    return ddsLevelsInfo;
}

export { getDDSMipLevelsInfo, loadDDSHeader };
//# sourceMappingURL=dds.js.map
