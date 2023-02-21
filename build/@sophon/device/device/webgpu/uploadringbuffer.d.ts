/// <reference types="dist" />
import type { WebGPUDevice } from './device';
export interface MappedBuffer {
    buffer: GPUBuffer;
    size: number;
    offset: number;
    used: boolean;
    mappedRange: ArrayBuffer;
}
export interface UploadBuffer {
    mappedBuffer: MappedBuffer;
    uploadSize: number;
    uploadBuffer: GPUBuffer;
    uploadOffset: number;
}
export interface UploadImage {
    offsetX: number;
    offsetY: number;
    offsetZ: number;
    width: number;
    height: number;
    depth: number;
    mipLevel: number;
    image: ImageBitmap | HTMLCanvasElement | OffscreenCanvas;
}
export interface UploadTexture {
    mappedBuffer: MappedBuffer;
    uploadOffsetX: number;
    uploadOffsetY: number;
    uploadOffsetZ: number;
    uploadWidth: number;
    uploadHeight: number;
    uploadDepth: number;
    bufferStride: number;
    mipLevel: number;
}
export declare class UploadRingBuffer {
    private _device;
    private _bufferList;
    private _defaultSize;
    private _unmappedBufferList;
    constructor(device: WebGPUDevice, defaultSize?: number);
    uploadBuffer(src: ArrayBuffer, dst: GPUBuffer, srcOffset: number, dstOffset: number, uploadSize: number, allowOverlap?: boolean): UploadBuffer;
    beginUploads(): number;
    endUploads(): void;
    purge(): void;
    fetchBufferMapped(size: number, allowOverlap: boolean): MappedBuffer;
}
