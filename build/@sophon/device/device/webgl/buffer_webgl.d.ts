import { WebGLGPUObject } from './gpuobject_webgl';
import { GPUDataBuffer } from '../gpuobject';
import type { TypedArray } from '../../misc';
import type { WebGLDevice } from './device_webgl';
export declare class WebGLGPUBuffer extends WebGLGPUObject<WebGLBuffer> implements GPUDataBuffer<WebGLBuffer> {
    protected _size: number;
    protected _usage: number;
    protected _systemMemoryBuffer: Uint8Array;
    protected _systemMemory: boolean;
    protected _memCost: number;
    constructor(device: WebGLDevice, usage: number, data: TypedArray | number, systemMemory?: boolean);
    get byteLength(): number;
    get systemMemoryBuffer(): ArrayBuffer;
    get usage(): number;
    bufferSubData(dstByteOffset: number, data: TypedArray, srcPos?: number, srcLength?: number): void;
    getBufferSubData(dstBuffer?: Uint8Array, offsetInBytes?: number, sizeInBytes?: number): Promise<Uint8Array>;
    protected _getBufferData(dstBuffer?: Uint8Array, offsetInBytes?: number, sizeInBytes?: number): Promise<Uint8Array>;
    restore(): Promise<void>;
    destroy(): void;
    isBuffer(): boolean;
    protected load(data?: TypedArray): void;
}
