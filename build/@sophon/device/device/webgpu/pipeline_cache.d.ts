/// <reference types="dist" />
import { PrimitiveType } from '../base_types';
import type { WebGPUVertexInputLayout } from './vertexinputlayout_webgpu';
import type { WebGPUProgram } from './gpuprogram_webgpu';
import type { WebGPUDevice } from './device';
import type { WebGPURenderStateSet } from './renderstates_webgpu';
export type FrameBufferInfo = {
    colorFormats: GPUTextureFormat[];
    depthFormat: GPUTextureFormat;
    sampleCount: number;
    hash: string;
};
export declare class PipelineCache {
    private _device;
    private _renderPipelines;
    private _computePipelines;
    constructor(device: WebGPUDevice);
    wipeCache(): void;
    fetchComputePipeline(program: WebGPUProgram): GPUComputePipeline;
    fetchRenderPipeline(program: WebGPUProgram, vertexData: WebGPUVertexInputLayout, stateSet: WebGPURenderStateSet, primitiveType: PrimitiveType, frameBufferInfo: FrameBufferInfo): GPURenderPipeline;
    private createPrimitiveState;
    private createDepthStencilState;
    private createStencilFaceState;
    private createColorTargetState;
    private createBlendState;
    private createBlendComponent;
    private getRenderPipelineHash;
    private getComputePipelineHash;
}
