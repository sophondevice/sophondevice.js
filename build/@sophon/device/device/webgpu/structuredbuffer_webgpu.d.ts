/// <reference types="dist" />
import { WebGPUBuffer } from "./buffer_webgpu";
import { StructuredBuffer, StructuredValue } from "../gpuobject";
import * as typeinfo from '../builder/types';
import type { WebGPUDevice } from './device';
import type { TypedArray } from "../../misc";
export declare class WebGPUStructuredBuffer extends WebGPUBuffer implements StructuredBuffer {
    private _structure;
    private _data;
    constructor(device: WebGPUDevice, structure: typeinfo.PBStructTypeInfo, usage: number, source?: TypedArray);
    set(name: string, value: StructuredValue): void;
    get structure(): typeinfo.PBStructTypeInfo;
    set structure(st: typeinfo.PBStructTypeInfo);
    static getGPUVertexFormat(type: typeinfo.PBTypeInfo): GPUVertexFormat;
}
