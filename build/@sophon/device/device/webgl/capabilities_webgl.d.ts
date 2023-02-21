import { WebGLContext, TextureFormat } from '../base_types';
import type { FramebufferCaps, MiscCaps, ShaderCaps, TextureCaps, ITextureFormatInfo } from '../device';
export interface ITextureParams {
    target: number;
    format: number;
    internalFormat: number;
    type: number;
    filterable: boolean;
    renderable: boolean;
    repeatable: boolean;
    compressed: boolean;
    generateMipmap: boolean;
}
export interface ITextureFormatInfoWebGL extends ITextureFormatInfo {
    glFormat: number;
    glInternalFormat: number;
    glType: number[];
    filterable: boolean;
    renderable: boolean;
    compressed: boolean;
}
export declare class WebGLFramebufferCap implements FramebufferCaps {
    private _isWebGL2;
    private _extDrawBuffers;
    private _extRenderMipmap;
    maxDrawBuffers: number;
    supportDrawBuffers: boolean;
    supportRenderMipmap: boolean;
    constructor(gl: WebGLContext);
}
export declare class WebGLMiscCap implements MiscCaps {
    private _isWebGL2;
    private _extIndexUint32;
    private _extBlendMinMax;
    private _extLoseContext;
    private _extDebugRendererInfo;
    supportBlendMinMax: boolean;
    support32BitIndex: boolean;
    supportLoseContext: boolean;
    supportDebugRendererInfo: boolean;
    supportSharedUniforms: boolean;
    constructor(gl: WebGLContext);
}
export declare class WebGLShaderCap implements ShaderCaps {
    private _extFragDepth;
    private _extStandardDerivatives;
    private _extShaderTextureLod;
    supportFragmentDepth: boolean;
    supportStandardDerivatives: boolean;
    supportShaderTextureLod: boolean;
    supportHighPrecisionFloat: boolean;
    supportHighPrecisionInt: boolean;
    maxUniformBufferSize: number;
    uniformBufferOffsetAlignment: number;
    constructor(gl: WebGLContext);
}
export declare class WebGLTextureCap implements TextureCaps {
    private _isWebGL2;
    private _extS3TC;
    private _extS3TCSRGB;
    private _extTextureFilterAnisotropic;
    private _extDepthTexture;
    private _extSRGB;
    private _extTextureFloat;
    private _extTextureFloatLinear;
    private _extTextureHalfFloat;
    private _extTextureHalfFloatLinear;
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
    constructor(gl: WebGLContext);
    calcMemoryUsage(format: TextureFormat, type: number, numPixels: any): number;
    getTextureFormatInfo(format: TextureFormat): ITextureFormatInfoWebGL;
}
