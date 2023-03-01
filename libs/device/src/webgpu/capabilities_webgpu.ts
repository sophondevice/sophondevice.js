import type { TextureFormat } from '../base_types';
import type { FramebufferCaps, TextureFormatInfo, MiscCaps, ShaderCaps, TextureCaps } from '../device';
import type { WebGPUDevice } from './device';

export interface TextureParams {
  gpuFormat: GPUTextureFormat;
  stride: number;
  filterable: boolean;
  renderable: boolean;
  repeatable: boolean;
  compressed: boolean;
  writable: boolean;
  generateMipmap: boolean;
}

export interface TextureFormatInfoWebGPU extends TextureFormatInfo {
  gpuSampleType: GPUTextureSampleType;
  filterable: boolean;
  renderable: boolean;
  compressed: boolean;
  writable: boolean;
  size: number;
  blockWidth?: number;
  blockHeight?: number;
}

export class WebGPUFramebufferCap implements FramebufferCaps {
  maxDrawBuffers: number;
  supportDrawBuffers: boolean;
  supportRenderMipmap: boolean;
  supportMultisampledFramebuffer: boolean;
  constructor(device: WebGPUDevice) {
    this.maxDrawBuffers = 8;
    this.supportDrawBuffers = true;
    this.supportRenderMipmap = true;
    this.supportMultisampledFramebuffer = true;
  }
}

export class WebGPUMiscCap implements MiscCaps {
  supportBlendMinMax: boolean;
  support32BitIndex: boolean;
  supportLoseContext: boolean;
  supportDebugRendererInfo: boolean;
  supportSharedUniforms: boolean;
  constructor(device: WebGPUDevice) {
    this.supportBlendMinMax = true;
    this.support32BitIndex = true;
    // TODO:
    this.supportLoseContext = false;
    this.supportDebugRendererInfo = false;
    this.supportSharedUniforms = true;
  }
}
export class WebGPUShaderCap implements ShaderCaps {
  supportFragmentDepth: boolean;
  supportStandardDerivatives: boolean;
  supportShaderTextureLod: boolean;
  supportHighPrecisionFloat: boolean;
  supportHighPrecisionInt: boolean;
  maxUniformBufferSize: number;
  uniformBufferOffsetAlignment: number;
  constructor(device: WebGPUDevice) {
    this.supportFragmentDepth = true;
    this.supportStandardDerivatives = true;
    this.supportShaderTextureLod = true;
    this.supportHighPrecisionFloat = true;
    this.maxUniformBufferSize = device.device.limits.maxUniformBufferBindingSize || 65536;
    this.uniformBufferOffsetAlignment = device.device.limits.minUniformBufferOffsetAlignment || 256;
  }
}
export class WebGPUTextureCap implements TextureCaps {
  private _textureFormatInfos: Record<TextureFormat, TextureFormatInfoWebGPU>;
  maxTextureSize: number;
  maxCubeTextureSize: number;
  npo2Mipmapping: boolean;
  npo2Repeating: boolean;
  supportS3TC: boolean;
  supportS3TCSRGB: boolean;
  supportDepthTexture: boolean;
  support3DTexture: boolean;
  supportSRGBTexture: boolean;
  supportFloatTexture: boolean;
  supportLinearFloatTexture: boolean;
  supportHalfFloatTexture: boolean;
  supportLinearHalfFloatTexture: boolean;
  supportAnisotropicFiltering: boolean;
  supportFloatColorBuffer: boolean;
  supportHalfFloatColorBuffer: boolean;
  supportFloatBlending: boolean;
  constructor(device: WebGPUDevice) {
    this._textureFormatInfos = {
      ['rgba8unorm']: {
        gpuSampleType: 'float',
        filterable: true,
        renderable: true,
        compressed: false,
        writable: true,
        size: 4
      },
      ['rgba8snorm']: {
        gpuSampleType: 'float',
        filterable: true,
        renderable: false,
        compressed: false,
        writable: true,
        size: 4
      },
      ['bgra8unorm']: {
        gpuSampleType: 'float',
        filterable: true,
        renderable: true,
        compressed: false,
        writable: false, // TODO: require "bgra8unorm-storage" feature
        size: 4
      }
    } as Record<TextureFormat, TextureFormatInfoWebGPU>;
    if (this.supportS3TC) {
      this._textureFormatInfos['dxt1'] = {
        gpuSampleType: 'float',
        filterable: true,
        renderable: false,
        compressed: true,
        size: 8,
        writable: false,
        blockWidth: 4,
        blockHeight: 4
      };
      this._textureFormatInfos['dxt3'] = {
        gpuSampleType: 'float',
        filterable: true,
        renderable: false,
        compressed: true,
        size: 16,
        writable: false,
        blockWidth: 4,
        blockHeight: 4
      };
      this._textureFormatInfos['dxt5'] = {
        gpuSampleType: 'float',
        filterable: true,
        renderable: false,
        compressed: true,
        size: 16,
        writable: false,
        blockWidth: 4,
        blockHeight: 4
      };
    }
    if (this.supportS3TCSRGB) {
      this._textureFormatInfos['dxt1-srgb'] = {
        gpuSampleType: 'float',
        filterable: true,
        renderable: false,
        compressed: true,
        size: 8,
        writable: false,
        blockWidth: 4,
        blockHeight: 4
      };
      this._textureFormatInfos['dxt3-srgb'] = {
        gpuSampleType: 'float',
        filterable: true,
        renderable: false,
        compressed: true,
        size: 16,
        writable: false,
        blockWidth: 4,
        blockHeight: 4
      };
      this._textureFormatInfos['dxt5-srgb'] = {
        gpuSampleType: 'float',
        filterable: true,
        renderable: false,
        compressed: true,
        size: 16,
        writable: false,
        blockWidth: 4,
        blockHeight: 4
      };
    }
    this._textureFormatInfos['r8unorm'] = {
      gpuSampleType: 'float',
      filterable: true,
      renderable: true,
      compressed: false,
      writable: false,
      size: 1
    };
    (this._textureFormatInfos['r8snorm'] = {
      gpuSampleType: 'float',
      filterable: true,
      renderable: false,
      compressed: false,
      writable: false,
      size: 1
    }),
      (this._textureFormatInfos['r16f'] = {
        gpuSampleType: 'float',
        filterable: true,
        renderable: true,
        compressed: false,
        writable: false,
        size: 2
      });
    this._textureFormatInfos['r32f'] = {
      gpuSampleType: 'unfilterable-float',
      filterable: false,
      renderable: true,
      compressed: false,
      writable: true,
      size: 4
    };
    this._textureFormatInfos['r8ui'] = {
      gpuSampleType: 'uint',
      filterable: false,
      renderable: true,
      compressed: false,
      writable: false,
      size: 1
    };
    this._textureFormatInfos['r8i'] = {
      gpuSampleType: 'sint',
      filterable: false,
      renderable: true,
      compressed: false,
      writable: false,
      size: 1
    };
    this._textureFormatInfos['r16ui'] = {
      gpuSampleType: 'uint',
      filterable: false,
      renderable: true,
      compressed: false,
      writable: false,
      size: 2
    };
    this._textureFormatInfos['r16i'] = {
      gpuSampleType: 'sint',
      filterable: false,
      renderable: true,
      compressed: false,
      writable: false,
      size: 2
    };
    this._textureFormatInfos['r32ui'] = {
      gpuSampleType: 'uint',
      filterable: false,
      renderable: true,
      compressed: false,
      writable: true,
      size: 4
    };
    this._textureFormatInfos['r32i'] = {
      gpuSampleType: 'sint',
      filterable: false,
      renderable: true,
      compressed: false,
      writable: true,
      size: 4
    };
    this._textureFormatInfos['rg8unorm'] = {
      gpuSampleType: 'float',
      filterable: true,
      renderable: true,
      compressed: false,
      writable: false,
      size: 2
    };
    this._textureFormatInfos['rg8snorm'] = {
      gpuSampleType: 'float',
      filterable: true,
      renderable: false,
      compressed: false,
      writable: false,
      size: 2
    };
    this._textureFormatInfos['rg16f'] = {
      gpuSampleType: 'float',
      filterable: true,
      renderable: true,
      compressed: false,
      writable: false,
      size: 4
    };
    this._textureFormatInfos['rg32f'] = {
      gpuSampleType: 'unfilterable-float',
      filterable: false,
      renderable: true,
      compressed: false,
      writable: true,
      size: 8
    };
    this._textureFormatInfos['rg8ui'] = {
      gpuSampleType: 'uint',
      filterable: false,
      renderable: true,
      compressed: false,
      writable: false,
      size: 2
    };
    this._textureFormatInfos['rg8i'] = {
      gpuSampleType: 'sint',
      filterable: false,
      renderable: true,
      compressed: false,
      writable: false,
      size: 2
    };
    this._textureFormatInfos['rg16ui'] = {
      gpuSampleType: 'uint',
      filterable: false,
      renderable: true,
      compressed: false,
      writable: false,
      size: 4
    };
    this._textureFormatInfos['rg16i'] = {
      gpuSampleType: 'sint',
      filterable: false,
      renderable: true,
      compressed: false,
      writable: false,
      size: 4
    };
    this._textureFormatInfos['rg32ui'] = {
      gpuSampleType: 'uint',
      filterable: false,
      renderable: true,
      compressed: false,
      writable: true,
      size: 8
    };
    this._textureFormatInfos['rg32i'] = {
      gpuSampleType: 'sint',
      filterable: false,
      renderable: true,
      compressed: false,
      writable: true,
      size: 8
    };
    this._textureFormatInfos['rgba8unorm-srgb'] = {
      gpuSampleType: 'float',
      filterable: true,
      renderable: true,
      compressed: false,
      writable: false,
      size: 4
    };
    this._textureFormatInfos['bgra8unorm-srgb'] = {
      gpuSampleType: 'float',
      filterable: true,
      renderable: true,
      compressed: false,
      writable: false,
      size: 4
    };
    this._textureFormatInfos['rgba16f'] = {
      gpuSampleType: 'float',
      filterable: true,
      renderable: true,
      compressed: false,
      writable: true,
      size: 8
    };
    this._textureFormatInfos['rgba32f'] = {
      gpuSampleType: 'unfilterable-float',
      filterable: false,
      renderable: true,
      compressed: false,
      writable: true,
      size: 16
    };
    this._textureFormatInfos['rgba8ui'] = {
      gpuSampleType: 'uint',
      filterable: false,
      renderable: true,
      compressed: false,
      writable: true,
      size: 4
    };
    this._textureFormatInfos['rgba8i'] = {
      gpuSampleType: 'sint',
      filterable: false,
      renderable: true,
      compressed: false,
      writable: true,
      size: 4
    };
    this._textureFormatInfos['rgba16ui'] = {
      gpuSampleType: 'uint',
      filterable: false,
      renderable: true,
      compressed: false,
      writable: true,
      size: 8
    };
    this._textureFormatInfos['rgba16i'] = {
      gpuSampleType: 'sint',
      filterable: false,
      renderable: true,
      compressed: false,
      writable: true,
      size: 8
    };
    this._textureFormatInfos['rgba32ui'] = {
      gpuSampleType: 'uint',
      filterable: false,
      renderable: true,
      compressed: false,
      writable: true,
      size: 16
    };
    this._textureFormatInfos['rgba32i'] = {
      gpuSampleType: 'sint',
      filterable: false,
      renderable: true,
      compressed: false,
      writable: true,
      size: 16
    };
    this._textureFormatInfos['d16'] = {
      gpuSampleType: 'depth',
      filterable: false,
      renderable: true,
      compressed: false,
      writable: false,
      size: 2
    };
    this._textureFormatInfos['d24'] = {
      gpuSampleType: 'depth',
      filterable: false,
      renderable: true,
      compressed: false,
      writable: false,
      size: 4
    };
    this._textureFormatInfos['d32f'] = {
      gpuSampleType: 'depth',
      filterable: false,
      renderable: true,
      compressed: false,
      writable: false,
      size: 4
    };
    this._textureFormatInfos['d32fs8'] = {
      gpuSampleType: 'depth',
      filterable: false,
      renderable: true,
      compressed: false,
      writable: false,
      size: 8
    };
    this._textureFormatInfos['d24s8'] = {
      gpuSampleType: 'depth',
      filterable: false,
      renderable: true,
      compressed: false,
      writable: false,
      size: 4
    };
    this.supportAnisotropicFiltering = true;
    this.supportDepthTexture = true;
    this.support3DTexture = true;
    this.supportSRGBTexture = true;
    this.supportFloatTexture = true;
    this.supportLinearFloatTexture =
      this._textureFormatInfos['r32f'].filterable &&
      this._textureFormatInfos['rg32f'].filterable &&
      this._textureFormatInfos['rgba32f'].filterable;
    this.supportHalfFloatTexture = true;
    this.supportLinearHalfFloatTexture =
      this._textureFormatInfos['r16f'].filterable &&
      this._textureFormatInfos['rg16f'].filterable &&
      this._textureFormatInfos['rgba16f'].filterable;
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
  calcMemoryUsage(format: TextureFormat, numPixels): number {
    return this._textureFormatInfos[format] ? this._textureFormatInfos[format].size * numPixels : 0;
  }
  getTextureFormatInfo(format: TextureFormat): TextureFormatInfoWebGPU {
    return this._textureFormatInfos[format];
  }
}
