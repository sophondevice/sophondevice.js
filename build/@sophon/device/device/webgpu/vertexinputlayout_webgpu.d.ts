import { PrimitiveType } from '../base_types';
import { StructuredBuffer, VertexInputLayout, IndexBuffer, VertexSemantic } from '../gpuobject';
import { WebGPUObject } from './gpuobject_webgpu';
import type { WebGPUDevice } from './device';
import type { VertexData } from '../vertexdata';
import type { WebGPUBuffer } from './buffer_webgpu';
export declare class WebGPUVertexInputLayout extends WebGPUObject<unknown> implements VertexInputLayout<unknown> {
    private static _hashCounter;
    private _vertexData;
    private _hash;
    private _layouts;
    constructor(device: WebGPUDevice, vertexData: VertexData);
    destroy(): void;
    restore(): Promise<void>;
    get hash(): string;
    get vertexBuffers(): {
        buffer: StructuredBuffer<unknown>;
        offset: number;
        stepMode: import("../gpuobject").VertexStepMode;
    }[];
    get indexBuffer(): IndexBuffer<unknown>;
    getDrawOffset(): number;
    getVertexBuffer(semantic: VertexSemantic): StructuredBuffer;
    getIndexBuffer(): IndexBuffer;
    getLayouts(attributes: string): {
        layoutHash: string;
        buffers: {
            buffer: WebGPUBuffer;
            offset: number;
        }[];
    };
    private calcHash;
    bind(): void;
    draw(primitiveType: PrimitiveType, first: number, count: number): void;
    drawInstanced(primitiveType: PrimitiveType, first: number, count: number, numInstances: number): void;
}
