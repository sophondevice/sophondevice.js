/// <reference types="dist" />
import { TextureFormat } from '../base_types';
import { WebGPUBaseTexture } from './basetexture_webgpu';
import { TextureImageElement, Texture3D, GPUDataBuffer } from '../gpuobject';
import type { WebGPUDevice } from './device';
import type { TypedArray } from '../../misc';
export declare class WebGPUTexture3D extends WebGPUBaseTexture implements Texture3D<GPUTexture> {
    constructor(device: WebGPUDevice);
    isTexture3D(): this is Texture3D;
    init(): void;
    update(data: TypedArray, xOffset: number, yOffset: number, zOffset: number, width: number, height: number, depth: number): void;
    updateFromElement(data: TextureImageElement, xOffset: number, yOffset: number, zOffset: number, width: number, height: number): void;
    createEmpty(format: TextureFormat, width: number, height: number, depth: number, creationFlags?: number): void;
    createView(level?: number, face?: number, mipCount?: number): GPUTextureView;
    readPixels(layer: number, x: number, y: number, w: number, h: number, buffer: TypedArray): Promise<void>;
    readPixelsToBuffer(layer: number, x: number, y: number, w: number, h: number, buffer: GPUDataBuffer): void;
    private loadEmpty;
}
