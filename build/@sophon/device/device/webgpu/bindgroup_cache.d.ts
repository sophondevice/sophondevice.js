/// <reference types="dist" />
import type { WebGPUDevice } from './device';
import type { BindGroupLayout } from '../gpuobject';
export declare class BindGroupCache {
    private _device;
    private _bindGroupLayoutCache;
    constructor(device: WebGPUDevice);
    fetchBindGroupLayout(desc: BindGroupLayout): GPUBindGroupLayout;
    private getLayoutHash;
    private createBindGroupLayout;
}
