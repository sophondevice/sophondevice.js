import { CubeFace } from '@sophon/base';
import { TextureFormat } from '../base_types';
import { WebGLBaseTexture } from './basetexture_webgl';
import { TextureMipmapData, TextureCube, TextureImageElement, GPUDataBuffer } from '../gpuobject';
import type { WebGLDevice } from './device_webgl';
import type { TypedArray } from '../../misc';
export declare class WebGLTextureCube extends WebGLBaseTexture implements TextureCube<WebGLTexture> {
    constructor(device: WebGLDevice);
    init(): void;
    update(data: TypedArray, xOffset: number, yOffset: number, width: number, height: number, face: CubeFace): void;
    updateFromElement(data: TextureImageElement, xOffset: number, yOffset: number, face: number, x: number, y: number, width: number, height: number): void;
    createEmpty(format: TextureFormat, size: number, creationFlags?: number): void;
    readPixels(face: number, x: number, y: number, w: number, h: number, buffer: TypedArray): Promise<void>;
    readPixelsToBuffer(face: number, x: number, y: number, w: number, h: number, buffer: GPUDataBuffer): void;
    isTextureCube(): this is TextureCube;
    generateMipmaps(): void;
    createWithMipmapData(data: TextureMipmapData, creationFlags?: number): void;
    private loadImages;
    private loadLevels;
}
