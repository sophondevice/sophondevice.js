import { PrimitiveType } from '../base_types';
import { WebGLGPUObject } from './gpuobject_webgl';
import { VertexInputLayout, StructuredBuffer, IndexBuffer, VertexSemantic } from '../gpuobject';
import { VertexData } from '../vertexdata';
import type { WebGLDevice } from './device_webgl';
export declare class WebGLVertexInputLayout extends WebGLGPUObject<WebGLVertexArrayObject | WebGLVertexArrayObjectOES> implements VertexInputLayout<WebGLVertexArrayObject | WebGLVertexArrayObjectOES> {
    private _vertexData;
    constructor(device: WebGLDevice, vertexData: VertexData);
    destroy(): void;
    restore(): Promise<void>;
    get vertexBuffers(): {
        buffer: StructuredBuffer<unknown>;
        offset: number;
        stepMode: import("../gpuobject").VertexStepMode;
    }[];
    get indexBuffer(): IndexBuffer<unknown>;
    getDrawOffset(): number;
    getVertexBuffer(semantic: VertexSemantic): StructuredBuffer;
    getIndexBuffer(): IndexBuffer;
    bind(): void;
    draw(primitiveType: PrimitiveType, first: number, count: number): void;
    drawInstanced(primitiveType: PrimitiveType, first: number, count: number, numInstances: number): void;
    isVAO(): boolean;
    private load;
    private bindBuffers;
}
