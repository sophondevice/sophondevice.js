import { WebGPUProgram } from "./gpuprogram_webgpu";
import { WebGPUBindGroup } from "./bindgroup_webgpu";
import type { WebGPUBaseTexture } from "./basetexture_webgpu";
import type { WebGPUBuffer } from "./buffer_webgpu";
import type { WebGPUDevice } from "./device";
import type { WebGPUFrameBuffer } from "./framebuffer_webgpu";
export declare class WebGPUComputePass {
    private _device;
    private _bufferUploads;
    private _textureUploads;
    private _uploadCommandEncoder;
    private _computeCommandEncoder;
    private _computePassEncoder;
    constructor(device: WebGPUDevice, frameBuffer?: WebGPUFrameBuffer);
    get active(): boolean;
    isBufferUploading(buffer: WebGPUBuffer): boolean;
    isTextureUploading(tex: WebGPUBaseTexture): boolean;
    compute(program: WebGPUProgram, bindGroups: WebGPUBindGroup[], bindGroupOffsets: Iterable<number>[], workgroupCountX: number, workgroupCountY: number, workgroupCountZ: number): void;
    private setBindGroupsForCompute;
    begin(): void;
    end(): void;
    private validateCompute;
}
