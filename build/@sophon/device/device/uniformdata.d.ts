import type { StructuredValue, UniformBufferLayout, StructuredBuffer } from './gpuobject';
import type { TypedArray } from '../misc';
export declare class StructuredBufferData {
    protected _cache: ArrayBuffer;
    protected _buffer: StructuredBuffer;
    protected _size: number;
    protected _uniformMap: {
        [name: string]: TypedArray;
    };
    protected _uniformPositions: {
        [name: string]: [number, number];
    };
    constructor(layout: UniformBufferLayout, buffer?: StructuredBuffer | ArrayBuffer);
    get byteLength(): number;
    get buffer(): ArrayBuffer;
    get uniforms(): {
        [name: string]: TypedArray;
    };
    set(name: string, value: StructuredValue): void;
}
