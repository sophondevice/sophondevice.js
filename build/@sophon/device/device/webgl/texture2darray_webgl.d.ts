import { TextureFormat } from '../base_types';
import { WebGLBaseTexture } from './basetexture_webgl';
import { TextureImageElement, Texture2DArray, GPUDataBuffer } from '../gpuobject';
import type { WebGLDevice } from './device_webgl';
import type { TypedArray } from '../../misc';
export declare class WebGLTexture2DArray extends WebGLBaseTexture implements Texture2DArray<WebGLTexture> {
    constructor(device: WebGLDevice);
    isTexture2DArray(): this is Texture2DArray;
    init(): void;
    update(data: TypedArray, xOffset: number, yOffset: number, zOffset: number, width: number, height: number, depth: number): void;
    updateFromElement(data: TextureImageElement, xOffset: number, yOffset: number, layerIndex: number, x: number, y: number, width: number, height: number): void;
    createEmpty(format: TextureFormat, width: number, height: number, depth: number, creationFlags?: number): void;
    generateMipmaps(): void;
    readPixels(layer: number, x: number, y: number, w: number, h: number, buffer: TypedArray): Promise<void>;
    readPixelsToBuffer(layer: number, x: number, y: number, w: number, h: number, buffer: GPUDataBuffer): void;
    private loadEmpty;
}
