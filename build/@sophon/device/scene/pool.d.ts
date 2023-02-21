import type { StructuredBuffer } from "../device";
export declare class BufferPool {
    private static _uniformBufferFreeList;
    private static _storageBufferFreeList;
    static allocUniformBuffer(size: number): StructuredBuffer;
    static freeUniformBuffer(buffer: StructuredBuffer): void;
    static allocStorageBuffer(size: number): StructuredBuffer;
    static freeStorageBuffer(buffer: StructuredBuffer): void;
    static purgeUniformBuffers(): void;
    static purgeStorageBuffers(): void;
    static allocBuffer(freeList: StructuredBuffer[], size: number): StructuredBuffer;
    static freeBuffer(freeList: StructuredBuffer[], buffer: StructuredBuffer): void;
    private static findLeastSize;
}
