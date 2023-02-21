/// <reference types="dist" />
import { TextureFormat } from '../base_types';
import { WebGPUBaseTexture } from './basetexture_webgpu';
import { TextureImageElement, TextureMipmapData, Texture2D, GPUDataBuffer } from '../gpuobject';
import type { WebGPUDevice } from './device';
import type { TypedArray } from '../../misc';
export declare class WebGPUTexture2D extends WebGPUBaseTexture implements Texture2D<GPUTexture> {
    constructor(device: WebGPUDevice);
    isTexture2D(): this is Texture2D;
    init(): void;
    update(data: TypedArray, xOffset: number, yOffset: number, width: number, height: number): void;
    updateFromElement(data: TextureImageElement, xOffset: number, yOffset: number, x: number, y: number, width: number, height: number): void;
    readPixels(x: number, y: number, w: number, h: number, buffer: TypedArray): Promise<void>;
    readPixelsToBuffer(x: number, y: number, w: number, h: number, buffer: GPUDataBuffer): void;
    loadFromElement(element: TextureImageElement, creationFlags?: number): void;
    createEmpty(format: TextureFormat, width: number, height: number, creationFlags?: number): void;
    createView(level?: number, face?: number, mipCount?: number): GPUTextureView;
    createWithMipmapData(data: TextureMipmapData, creationFlags?: number): void;
}
