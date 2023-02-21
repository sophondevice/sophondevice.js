import { WebGPUBuffer } from "./buffer_webgpu";
import { PBPrimitiveTypeInfo } from "../builder";
import { IndexBuffer } from "../gpuobject";
import type { WebGPUDevice } from "./device";
export declare class WebGPUIndexBuffer extends WebGPUBuffer implements IndexBuffer {
    readonly indexType: PBPrimitiveTypeInfo;
    readonly length: number;
    constructor(device: WebGPUDevice, data: Uint16Array | Uint32Array, usage?: number);
}
