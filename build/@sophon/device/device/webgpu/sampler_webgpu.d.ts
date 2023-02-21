/// <reference types="dist" />
import { WebGPUObject } from './gpuobject_webgpu';
import { TextureWrapping, TextureFilter } from '../base_types';
import type { SamplerOptions, TextureSampler } from '../gpuobject';
import type { WebGPUDevice } from './device';
export declare class WebGPUTextureSampler extends WebGPUObject<GPUSampler> implements TextureSampler<GPUSampler> {
    private _options;
    constructor(device: WebGPUDevice, options: SamplerOptions);
    get hash(): number;
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
    private _load;
    isSampler(): boolean;
}
