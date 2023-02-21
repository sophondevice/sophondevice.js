import { WebGLGPUObject } from './gpuobject_webgl';
import { TextureWrapping, TextureFilter } from '../base_types';
import type { SamplerOptions, TextureSampler } from '../gpuobject';
import type { WebGLBaseTexture } from './basetexture_webgl';
import type { WebGLDevice } from './device_webgl';
export declare class WebGLTextureSampler extends WebGLGPUObject<WebGLSampler> implements TextureSampler<WebGLSampler> {
    private _options;
    constructor(device: WebGLDevice, options: SamplerOptions);
    get addressModeU(): TextureWrapping;
    get addressModeV(): TextureWrapping;
    get addressModeW(): TextureWrapping;
    get magFilter(): TextureFilter;
    get minFilter(): TextureFilter;
    get mipFilter(): TextureFilter;
    get lodMin(): number;
    get lodMax(): number;
    get compare(): import("../base_types").CompareFunc;
    get maxAnisotropy(): number;
    destroy(): void;
    restore(): Promise<void>;
    apply(texture: WebGLBaseTexture): void;
    private _load;
    isSampler(): boolean;
}
