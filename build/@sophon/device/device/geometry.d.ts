import { PrimitiveType } from './base_types';
import { StructuredBuffer, IndexBuffer, VertexStepMode, VertexSemantic } from './gpuobject';
import type { PBStructTypeInfo } from './builder';
import type { Device } from './device';
import type { TypedArray } from '../misc';
export declare class Geometry {
    constructor(device: Device);
    get primitiveType(): PrimitiveType;
    set primitiveType(type: PrimitiveType);
    get indexStart(): number;
    set indexStart(val: number);
    get indexCount(): number;
    set indexCount(val: number);
    get drawOffset(): number;
    removeVertexBuffer(buffer: StructuredBuffer): void;
    getVertexBuffer(semantic: VertexSemantic): StructuredBuffer;
    createAndSetVertexBuffer(structureType: PBStructTypeInfo, data: TypedArray, stepMode?: VertexStepMode): StructuredBuffer;
    setVertexBuffer(buffer: StructuredBuffer, stepMode?: VertexStepMode): StructuredBuffer<unknown>;
    createAndSetIndexBuffer(data: Uint16Array | Uint32Array, dynamic?: boolean): IndexBuffer;
    setIndexBuffer(data: IndexBuffer): void;
    getIndexBuffer(): IndexBuffer;
    draw(): void;
    drawInstanced(numInstances: number): void;
    dispose(): void;
}
