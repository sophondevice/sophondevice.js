/// <reference types="dist" />
import { TextureFormat } from '../base_types';
import type { FramebufferCaps, ITextureFormatInfo, MiscCaps, ShaderCaps, TextureCaps } from '../device';
import type { WebGPUDevice } from './device';
export interface ITextureParams {
    gpuFormat: GPUTextureFormat;
    stride: number;
    filterable: boolean;
    renderable: boolean;
    repeatable: boolean;
    compressed: boolean;
    writable: boolean;
    generateMipmap: boolean;
}
export interface ITextureFormatInfoWebGPU extends ITextureFormatInfo {
    gpuSampleType: GPUTextureSampleType;
    filterable: boolean;
    renderable: boolean;
    compressed: boolean;
    writable: boolean;
    size: number;
    blockWidth?: number;
    blockHeight?: number;
}
export declare class WebGPUFramebufferCap implements FramebufferCaps {
    maxDrawBuffers: number;
    supportDrawBuffers: boolean;
    supportRenderMipmap: boolean;
    constructor(device: WebGPUDevice);
}
export declare class WebGPUMiscCap implements MiscCaps {
    supportBlendMinMax: boolean;
    support32BitIndex: boolean;
    supportLoseContext: boolean;
    supportDebugRendererInfo: boolean;
    supportSharedUniforms: boolean;
    constructor(device: WebGPUDevice);
}
export declare class WebGPUShaderCap implements ShaderCaps {
    supportFragmentDepth: boolean;
    supportStandardDerivatives: boolean;
    supportShaderTextureLod: boolean;
    supportHighPrecisionFloat: boolean;
    supportHighPrecisionInt: boolean;
    maxUniformBufferSize: number;
    uniformBufferOffsetAlignment: number;
    constructor(device: WebGPUDevice);
}
export declare class WebGPUTextureCap implements TextureCaps {
    private _textureFormatInfos;
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
    constructor(device: WebGPUDevice);
    calcMemoryUsage(format: TextureFormat, numPixels: any): number;
    getTextureFormatInfo(format: TextureFormat): ITextureFormatInfoWebGPU;
}
