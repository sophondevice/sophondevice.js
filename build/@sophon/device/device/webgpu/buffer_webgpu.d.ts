/// <reference types="dist" />
import { WebGPUObject } from './gpuobject_webgpu';
import { UploadBuffer } from './uploadringbuffer';
import { GPUDataBuffer } from '../gpuobject';
import type { WebGPUDevice } from './device';
import type { TypedArray } from '../../misc';
export declare class WebGPUBuffer extends WebGPUObject<GPUBuffer> implements GPUDataBuffer<GPUBuffer> {
    private _size;
    private _usage;
    private _gpuUsage;
    private _memCost;
    private _ringBuffer;
    protected _pendingUploads: UploadBuffer[];
    constructor(device: WebGPUDevice, usage: number, data: TypedArray | number);
    get hash(): number;
    get byteLength(): number;
    get usage(): number;
    get gpuUsage(): number;
    getPendingUploads(): UploadBuffer[];
    clearPendingUploads(): void;
    bufferSubData(dstByteOffset: number, data: TypedArray, srcOffset?: number, srcLength?: number): void;
    getBufferSubData(dstBuffer?: Uint8Array, offsetInBytes?: number, sizeInBytes?: number): Promise<Uint8Array>;
    restore(): Promise<void>;
    destroy(): void;
    isBuffer(): boolean;
    beginSyncChanges(encoder: GPUCommandEncoder): void;
    endSyncChanges(): void;
    private load;
    private pushUpload;
}
