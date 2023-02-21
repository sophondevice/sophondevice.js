import { TextureFormat } from '../base_types';
import { WebGLBaseTexture } from './basetexture_webgl';
import { Texture3D, GPUDataBuffer } from '../gpuobject';
import type { WebGLDevice } from './device_webgl';
import type { TypedArray } from '../../misc';
export declare class WebGLTexture3D extends WebGLBaseTexture implements Texture3D<WebGLTexture> {
    constructor(device: WebGLDevice);
    get depth(): number;
    isTexture3D(): this is Texture3D;
    init(): void;
    update(data: TypedArray, xOffset: number, yOffset: number, zOffset: number, width: number, height: number, depth: number): void;
    createEmpty(format: TextureFormat, width: number, height: number, depth: number, creationFlags?: number): void;
    generateMipmaps(): void;
    readPixels(layer: number, x: number, y: number, w: number, h: number, buffer: TypedArray): Promise<void>;
    readPixelsToBuffer(layer: number, x: number, y: number, w: number, h: number, buffer: GPUDataBuffer): void;
}
