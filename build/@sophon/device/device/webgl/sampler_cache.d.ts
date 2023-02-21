import { WebGLTextureSampler } from './sampler_webgl';
import type { SamplerOptions } from '../gpuobject';
import type { WebGLDevice } from './device_webgl';
export declare class SamplerCache {
    private _device;
    private _samplers;
    constructor(device: WebGLDevice);
    fetchSampler(options: SamplerOptions): WebGLTextureSampler;
    private hash;
    private createSampler;
}
