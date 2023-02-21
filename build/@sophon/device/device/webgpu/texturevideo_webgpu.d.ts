/// <reference types="dist" />
import { WebGPUBaseTexture } from './basetexture_webgpu';
import { TextureVideo } from '../gpuobject';
import type { WebGPUDevice } from './device';
export declare class WebGPUTextureVideo extends WebGPUBaseTexture<GPUExternalTexture> implements TextureVideo<GPUExternalTexture> {
    private _source;
    constructor(device: WebGPUDevice, element: HTMLVideoElement);
    isTextureVideo(): this is TextureVideo;
    get width(): number;
    get height(): number;
    get source(): HTMLVideoElement;
    restore(): Promise<void>;
    updateVideoFrame(): boolean;
    createView(level?: number, face?: number, mipCount?: number): GPUTextureView;
    init(): void;
}
