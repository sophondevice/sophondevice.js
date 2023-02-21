import { WebGLGPUBuffer } from "./buffer_webgl";
import { StructuredBufferData } from "../uniformdata";
import { PBStructTypeInfo } from "../builder";
import { StructuredBuffer, StructuredValue } from "../gpuobject";
import type { WebGLDevice } from './device_webgl';
import type { TypedArray } from "../../misc";
export declare class WebGLStructuredBuffer extends WebGLGPUBuffer implements StructuredBuffer {
    private _structure;
    private _data;
    constructor(device: WebGLDevice, structure: PBStructTypeInfo, usage: number, source?: TypedArray);
    set(name: string, value: StructuredValue): void;
    get structure(): PBStructTypeInfo;
    set structure(st: PBStructTypeInfo);
    getUniformData(): StructuredBufferData;
    private static isValidArrayElementType;
}
