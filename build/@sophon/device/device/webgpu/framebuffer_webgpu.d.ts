/// <reference types="dist" />
import { CubeFace } from '@sophon/base';
import { WebGPUObject } from './gpuobject_webgpu';
import { FrameBuffer, IFrameBufferOptions } from '../gpuobject';
import type { WebGPUDevice } from './device';
import type { BaseTexture } from '../gpuobject';
export declare class WebGPUFrameBuffer extends WebGPUObject<unknown> implements FrameBuffer<unknown> {
    private _options;
    private _viewport;
    private _scissor;
    private _width;
    private _height;
    private _bindFlag;
    constructor(device: WebGPUDevice, opt?: IFrameBufferOptions);
    get options(): IFrameBufferOptions;
    get bindFlag(): number;
    getViewport(): number[];
    setViewport(vp: number[]): void;
    getScissorRect(): number[];
    setScissorRect(scissor: number[]): void;
    getWidth(): number;
    getHeight(): number;
    restore(): Promise<void>;
    destroy(): void;
    setCubeTextureFace(index: number, face: CubeFace): void;
    setTextureLevel(index: number, level: number): void;
    setTextureLayer(index: number, layer: number): void;
    setDepthTextureLayer(layer: number): void;
    getDepthAttachment(): BaseTexture;
    getColorAttachments(): BaseTexture[];
    getColorFormats(): GPUTextureFormat[];
    getDepthFormat(): GPUTextureFormat;
    bind(): boolean;
    unbind(): void;
    private _init;
    isFramebuffer(): boolean;
    getSampleCount(): number;
}
