import { Vector4 } from "@sophon/base";
import type { WebGPUProgram } from "./gpuprogram_webgpu";
import type { WebGPUBaseTexture } from "./basetexture_webgpu";
import type { WebGPUBindGroup } from "./bindgroup_webgpu";
import type { WebGPURenderStateSet } from "./renderstates_webgpu";
import type { WebGPUDevice } from "./device";
import type { FrameBufferInfo } from "./pipeline_cache";
import type { WebGPURenderPass } from "./renderpass_webgpu";
export declare class WebGPUClearQuad {
    private static _clearPrograms;
    private static _clearBindGroup;
    private static _clearStateSet;
    private static _defaultClearColor;
    static drawClearQuad(renderPass: WebGPURenderPass, clearColor: Vector4, clearDepth: number, clearStencil: number): void;
    private static initClearQuad;
    private static createClearQuadProgram;
}
export declare class WebGPUMipmapGenerator {
    static _frameBufferInfo: FrameBufferInfo;
    static _mipmapGenerationProgram: WebGPUProgram;
    static _mipmapGenerationBindGroup: WeakMap<WebGPUBaseTexture, WebGPUBindGroup[][]>;
    static _mipmapGenerationStateSet: WebGPURenderStateSet;
    static generateMipmap(device: WebGPUDevice, tex: WebGPUBaseTexture): void;
    static generateMipmapsForBindGroups(device: WebGPUDevice, bindGroups: WebGPUBindGroup[]): void;
    private static generateMiplevel;
    private static beginMipmapGenerationPass;
    private static getMipmapGenerationBindGroup;
    private static initMipmapGeneration;
}
