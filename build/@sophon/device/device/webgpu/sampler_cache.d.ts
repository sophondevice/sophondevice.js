import { WebGPUTextureSampler } from './sampler_webgpu';
import type { SamplerOptions } from '../gpuobject';
import type { WebGPUDevice } from './device';
export declare class SamplerCache {
    private _device;
    private _samplers;
    constructor(device: WebGPUDevice);
    fetchSampler(options: SamplerOptions): WebGPUTextureSampler;
    private hash;
    private createSampler;
}
