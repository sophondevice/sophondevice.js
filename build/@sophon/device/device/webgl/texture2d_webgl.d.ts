import { TextureFormat } from '../base_types';
import { WebGLBaseTexture } from './basetexture_webgl';
import { TextureImageElement, TextureMipmapData, Texture2D, GPUDataBuffer } from '../gpuobject';
import type { WebGLDevice } from './device_webgl';
import type { TypedArray } from '../../misc';
export declare class WebGLTexture2D extends WebGLBaseTexture implements Texture2D<WebGLTexture> {
    constructor(device: WebGLDevice);
    isTexture2D(): this is Texture2D;
    init(): void;
    update(data: TypedArray, xOffset: number, yOffset: number, width: number, height: number): void;
    updateFromElement(data: TextureImageElement, xOffset: number, yOffset: number, x: number, y: number, width: number, height: number): void;
    readPixels(x: number, y: number, w: number, h: number, buffer: TypedArray): Promise<void>;
    readPixelsToBuffer(x: number, y: number, w: number, h: number, buffer: GPUDataBuffer): void;
    loadFromElement(element: TextureImageElement, creationFlags?: number): void;
    createEmpty(format: TextureFormat, width: number, height: number, creationFlags?: number): void;
    generateMipmaps(): void;
    createWithMipmapData(data: TextureMipmapData, creationFlags?: number): void;
}
