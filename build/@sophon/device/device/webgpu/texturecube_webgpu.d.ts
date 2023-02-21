/// <reference types="dist" />
import { CubeFace } from '@sophon/base';
import { TextureFormat } from '../base_types';
import { WebGPUBaseTexture } from './basetexture_webgpu';
import { TextureMipmapData, TextureCube, TextureImageElement, GPUDataBuffer } from '../gpuobject';
import type { WebGPUDevice } from './device';
import type { TypedArray } from '../../misc';
export declare class WebGPUTextureCube extends WebGPUBaseTexture implements TextureCube<GPUTexture> {
    constructor(device: WebGPUDevice);
    init(): void;
    update(data: TypedArray, xOffset: number, yOffset: number, width: number, height: number, face: CubeFace): void;
    updateFromElement(data: TextureImageElement, xOffset: number, yOffset: number, face: number, x: number, y: number, width: number, height: number): void;
    createEmpty(format: TextureFormat, size: number, creationFlags?: number): void;
    isTextureCube(): this is TextureCube;
    createView(level?: number, face?: number, mipCount?: number): GPUTextureView;
    readPixels(face: number, x: number, y: number, w: number, h: number, buffer: TypedArray): Promise<void>;
    readPixelsToBuffer(face: number, x: number, y: number, w: number, h: number, buffer: GPUDataBuffer): void;
    createWithMipmapData(data: TextureMipmapData, creationFlags?: number): void;
}
