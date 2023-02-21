import { StructuredBuffer, IndexBuffer, VertexStepMode, VertexSemantic } from './gpuobject';
export declare class VertexData {
    constructor();
    clone(): VertexData;
    updateTag(): void;
    getTag(): number;
    get vertexBuffers(): {
        buffer: StructuredBuffer<unknown>;
        offset: number;
        stepMode: VertexStepMode;
    }[];
    get indexBuffer(): IndexBuffer<unknown>;
    getDrawOffset(): number;
    setDrawOffset(offset: number): void;
    getVertexBuffer(semantic: VertexSemantic): StructuredBuffer;
    getIndexBuffer(): IndexBuffer;
    setVertexBuffer(buffer: StructuredBuffer, stepMode?: VertexStepMode): StructuredBuffer;
    removeVertexBuffer(buffer: StructuredBuffer): boolean;
    setIndexBuffer(buffer: IndexBuffer): IndexBuffer;
}
