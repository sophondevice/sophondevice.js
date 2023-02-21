import { WebGLGPUBuffer } from "./buffer_webgl";
import { PBPrimitiveTypeInfo } from "../builder";
import { IndexBuffer } from "../gpuobject";
import type { WebGLDevice } from './device_webgl';
export declare class WebGLIndexBuffer extends WebGLGPUBuffer implements IndexBuffer {
    readonly indexType: PBPrimitiveTypeInfo;
    readonly length: number;
    constructor(device: WebGLDevice, data: Uint16Array | Uint32Array, usage?: number);
}
