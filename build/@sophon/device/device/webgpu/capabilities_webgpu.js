/** sophon base library */
import { TextureFormat } from '../base_types.js';

class WebGPUFramebufferCap {
    maxDrawBuffers;
    supportDrawBuffers;
    supportRenderMipmap;
    constructor(device) {
        this.maxDrawBuffers = 8;
        this.supportDrawBuffers = true;
        this.supportRenderMipmap = true;
    }
}
class WebGPUMiscCap {
    supportBlendMinMax;
    support32BitIndex;
    supportLoseContext;
    supportDebugRendererInfo;
    supportSharedUniforms;
    constructor(device) {
        this.supportBlendMinMax = true;
        this.support32BitIndex = true;
        this.supportLoseContext = false;
        this.supportDebugRendererInfo = false;
        this.supportSharedUniforms = true;
    }
}
class WebGPUShaderCap {
    supportFragmentDepth;
    supportStandardDerivatives;
    supportShaderTextureLod;
    supportHighPrecisionFloat;
    supportHighPrecisionInt;
    maxUniformBufferSize;
    uniformBufferOffsetAlignment;
    constructor(device) {
        this.supportFragmentDepth = true;
        this.supportStandardDerivatives = true;
        this.supportShaderTextureLod = true;
        this.supportHighPrecisionFloat = true;
        this.maxUniformBufferSize = device.device.limits.maxUniformBufferBindingSize || 65536;
        this.uniformBufferOffsetAlignment = device.device.limits.minUniformBufferOffsetAlignment || 256;
    }
}
class WebGPUTextureCap {
    _textureFormatInfos;
    maxTextureSize;
    maxCubeTextureSize;
    npo2Mipmapping;
    npo2Repeating;
    supportS3TC;
    supportS3TCSRGB;
    supportDepthTexture;
    support3DTexture;
    supportSRGBTexture;
    supportFloatTexture;
    supportLinearFloatTexture;
    supportHalfFloatTexture;
    supportLinearHalfFloatTexture;
    supportAnisotropicFiltering;
    supportFloatColorBuffer;
    supportHalfFloatColorBuffer;
    supportFloatBlending;
    constructor(device) {
        this._textureFormatInfos = {
            [TextureFormat.RGBA8UNORM]: {
                gpuSampleType: 'float',
                filterable: true,
                renderable: true,
                compressed: false,
                writable: true,
                size: 4,
            },
            [TextureFormat.RGBA8SNORM]: {
                gpuSampleType: 'float',
                filterable: true,
                renderable: false,
                compressed: false,
                writable: true,
                size: 4,
            },
            [TextureFormat.BGRA8UNORM]: {
                gpuSampleType: 'float',
                filterable: true,
                renderable: true,
                compressed: false,
                writable: false,
                size: 4,
            },
        };
        if (this.supportS3TC) {
            this._textureFormatInfos[TextureFormat.DXT1] = {
                gpuSampleType: 'float',
                filterable: true,
                renderable: false,
                compressed: true,
                size: 8,
                writable: false,
                blockWidth: 4,
                blockHeight: 4,
            };
            this._textureFormatInfos[TextureFormat.DXT3] = {
                gpuSampleType: 'float',
                filterable: true,
                renderable: false,
                compressed: true,
                size: 16,
                writable: false,
                blockWidth: 4,
                blockHeight: 4,
            };
            this._textureFormatInfos[TextureFormat.DXT5] = {
                gpuSampleType: 'float',
                filterable: true,
                renderable: false,
                compressed: true,
                size: 16,
                writable: false,
                blockWidth: 4,
                blockHeight: 4,
            };
        }
        if (this.supportS3TCSRGB) {
            this._textureFormatInfos[TextureFormat.DXT1_SRGB] = {
                gpuSampleType: 'float',
                filterable: true,
                renderable: false,
                compressed: true,
                size: 8,
                writable: false,
                blockWidth: 4,
                blockHeight: 4,
            };
            this._textureFormatInfos[TextureFormat.DXT3_SRGB] = {
                gpuSampleType: 'float',
                filterable: true,
                renderable: false,
                compressed: true,
                size: 16,
                writable: false,
                blockWidth: 4,
                blockHeight: 4,
            };
            this._textureFormatInfos[TextureFormat.DXT5_SRGB] = {
                gpuSampleType: 'float',
                filterable: true,
                renderable: false,
                compressed: true,
                size: 16,
                writable: false,
                blockWidth: 4,
                blockHeight: 4,
            };
        }
        this._textureFormatInfos[TextureFormat.R8UNORM] = {
            gpuSampleType: 'float',
            filterable: true,
            renderable: true,
            compressed: false,
            writable: false,
            size: 1,
        };
        this._textureFormatInfos[TextureFormat.R8SNORM] = {
            gpuSampleType: 'float',
            filterable: true,
            renderable: false,
            compressed: false,
            writable: false,
            size: 1,
        },
            this._textureFormatInfos[TextureFormat.R16F] = {
                gpuSampleType: 'float',
                filterable: true,
                renderable: true,
                compressed: false,
                writable: false,
                size: 2,
            };
        this._textureFormatInfos[TextureFormat.R32F] = {
            gpuSampleType: 'unfilterable-float',
            filterable: false,
            renderable: true,
            compressed: false,
            writable: true,
            size: 4,
        };
        this._textureFormatInfos[TextureFormat.R8UI] = {
            gpuSampleType: 'uint',
            filterable: false,
            renderable: true,
            compressed: false,
            writable: false,
            size: 1,
        };
        this._textureFormatInfos[TextureFormat.R8I] = {
            gpuSampleType: 'sint',
            filterable: false,
            renderable: true,
            compressed: false,
            writable: false,
            size: 1,
        };
        this._textureFormatInfos[TextureFormat.R16UI] = {
            gpuSampleType: 'uint',
            filterable: false,
            renderable: true,
            compressed: false,
            writable: false,
            size: 2,
        };
        this._textureFormatInfos[TextureFormat.R16I] = {
            gpuSampleType: 'sint',
            filterable: false,
            renderable: true,
            compressed: false,
            writable: false,
            size: 2,
        };
        this._textureFormatInfos[TextureFormat.R32UI] = {
            gpuSampleType: 'uint',
            filterable: false,
            renderable: true,
            compressed: false,
            writable: true,
            size: 4,
        };
        this._textureFormatInfos[TextureFormat.R32I] = {
            gpuSampleType: 'sint',
            filterable: false,
            renderable: true,
            compressed: false,
            writable: true,
            size: 4,
        };
        this._textureFormatInfos[TextureFormat.RG8UNORM] = {
            gpuSampleType: 'float',
            filterable: true,
            renderable: true,
            compressed: false,
            writable: false,
            size: 2,
        };
        this._textureFormatInfos[TextureFormat.RG8SNORM] = {
            gpuSampleType: 'float',
            filterable: true,
            renderable: false,
            compressed: false,
            writable: false,
            size: 2,
        };
        this._textureFormatInfos[TextureFormat.RG16F] = {
            gpuSampleType: 'float',
            filterable: true,
            renderable: true,
            compressed: false,
            writable: false,
            size: 4,
        };
        this._textureFormatInfos[TextureFormat.RG32F] = {
            gpuSampleType: 'unfilterable-float',
            filterable: false,
            renderable: true,
            compressed: false,
            writable: true,
            size: 8,
        };
        this._textureFormatInfos[TextureFormat.RG8UI] = {
            gpuSampleType: 'uint',
            filterable: false,
            renderable: true,
            compressed: false,
            writable: false,
            size: 2,
        };
        this._textureFormatInfos[TextureFormat.RG8I] = {
            gpuSampleType: 'sint',
            filterable: false,
            renderable: true,
            compressed: false,
            writable: false,
            size: 2,
        };
        this._textureFormatInfos[TextureFormat.RG16UI] = {
            gpuSampleType: 'uint',
            filterable: false,
            renderable: true,
            compressed: false,
            writable: false,
            size: 4,
        };
        this._textureFormatInfos[TextureFormat.RG16I] = {
            gpuSampleType: 'sint',
            filterable: false,
            renderable: true,
            compressed: false,
            writable: false,
            size: 4,
        };
        this._textureFormatInfos[TextureFormat.RG32UI] = {
            gpuSampleType: 'uint',
            filterable: false,
            renderable: true,
            compressed: false,
            writable: true,
            size: 8,
        };
        this._textureFormatInfos[TextureFormat.RG32I] = {
            gpuSampleType: 'sint',
            filterable: false,
            renderable: true,
            compressed: false,
            writable: true,
            size: 8,
        };
        this._textureFormatInfos[TextureFormat.RGBA8UNORM_SRGB] = {
            gpuSampleType: 'float',
            filterable: true,
            renderable: true,
            compressed: false,
            writable: false,
            size: 4,
        };
        this._textureFormatInfos[TextureFormat.BGRA8UNORM_SRGB] = {
            gpuSampleType: 'float',
            filterable: true,
            renderable: true,
            compressed: false,
            writable: false,
            size: 4,
        };
        this._textureFormatInfos[TextureFormat.RGBA16F] = {
            gpuSampleType: 'float',
            filterable: true,
            renderable: true,
            compressed: false,
            writable: true,
            size: 8,
        };
        this._textureFormatInfos[TextureFormat.RGBA32F] = {
            gpuSampleType: 'unfilterable-float',
            filterable: false,
            renderable: true,
            compressed: false,
            writable: true,
            size: 16,
        };
        this._textureFormatInfos[TextureFormat.RGBA8UI] = {
            gpuSampleType: 'uint',
            filterable: false,
            renderable: true,
            compressed: false,
            writable: true,
            size: 4,
        };
        this._textureFormatInfos[TextureFormat.RGBA8I] = {
            gpuSampleType: 'sint',
            filterable: false,
            renderable: true,
            compressed: false,
            writable: true,
            size: 4,
        };
        this._textureFormatInfos[TextureFormat.RGBA16UI] = {
            gpuSampleType: 'uint',
            filterable: false,
            renderable: true,
            compressed: false,
            writable: true,
            size: 8,
        };
        this._textureFormatInfos[TextureFormat.RGBA16I] = {
            gpuSampleType: 'sint',
            filterable: false,
            renderable: true,
            compressed: false,
            writable: true,
            size: 8,
        };
        this._textureFormatInfos[TextureFormat.RGBA32UI] = {
            gpuSampleType: 'uint',
            filterable: false,
            renderable: true,
            compressed: false,
            writable: true,
            size: 16,
        };
        this._textureFormatInfos[TextureFormat.RGBA32I] = {
            gpuSampleType: 'sint',
            filterable: false,
            renderable: true,
            compressed: false,
            writable: true,
            size: 16,
        };
        this._textureFormatInfos[TextureFormat.D16] = {
            gpuSampleType: 'depth',
            filterable: false,
            renderable: true,
            compressed: false,
            writable: false,
            size: 2,
        };
        this._textureFormatInfos[TextureFormat.D24] = {
            gpuSampleType: 'depth',
            filterable: false,
            renderable: true,
            compressed: false,
            writable: false,
            size: 4,
        };
        this._textureFormatInfos[TextureFormat.D32F] = {
            gpuSampleType: 'depth',
            filterable: false,
            renderable: true,
            compressed: false,
            writable: false,
            size: 4,
        };
        this._textureFormatInfos[TextureFormat.D32FS8] = {
            gpuSampleType: 'depth',
            filterable: false,
            renderable: true,
            compressed: false,
            writable: false,
            size: 8,
        };
        this._textureFormatInfos[TextureFormat.D24S8] = {
            gpuSampleType: 'depth',
            filterable: false,
            renderable: true,
            compressed: false,
            writable: false,
            size: 4,
        };
        this.supportAnisotropicFiltering = true;
        this.supportDepthTexture = true;
        this.support3DTexture = true;
        this.supportSRGBTexture = true;
        this.supportFloatTexture = true;
        this.supportLinearFloatTexture = this._textureFormatInfos[TextureFormat.R32F].filterable && this._textureFormatInfos[TextureFormat.RG32F].filterable && this._textureFormatInfos[TextureFormat.RGBA32F].filterable;
        this.supportHalfFloatTexture = true;
        this.supportLinearHalfFloatTexture = this._textureFormatInfos[TextureFormat.R16F].filterable && this._textureFormatInfos[TextureFormat.RG16F].filterable && this._textureFormatInfos[TextureFormat.RGBA16F].filterable;
        this.supportFloatColorBuffer = true;
        this.supportHalfFloatColorBuffer = true;
        this.supportFloatBlending = true;
        this.supportS3TC = device.device.features.has('texture-compression-bc');
        this.supportS3TCSRGB = this.supportS3TC;
        this.maxTextureSize = device.device.limits.maxTextureDimension2D;
        this.maxCubeTextureSize = device.device.limits.maxTextureDimension2D;
        this.npo2Mipmapping = true;
        this.npo2Repeating = true;
    }
    calcMemoryUsage(format, numPixels) {
        return this._textureFormatInfos[format] ? this._textureFormatInfos[format].size * numPixels : 0;
    }
    getTextureFormatInfo(format) {
        return this._textureFormatInfos[format];
    }
}

export { WebGPUFramebufferCap, WebGPUMiscCap, WebGPUShaderCap, WebGPUTextureCap };
//# sourceMappingURL=capabilities_webgpu.js.map
