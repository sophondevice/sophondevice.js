/// <reference types="dist" />
import { WebGPUStructuredBuffer } from './structuredbuffer_webgpu';
import { WebGPUBaseTexture } from './basetexture_webgpu';
import { WebGPUTextureVideo } from './texturevideo_webgpu';
import { StructuredValue, TextureVideo } from '../gpuobject';
import { WebGPUObject } from './gpuobject_webgpu';
import type { WebGPUDevice } from './device';
import type { BindGroupLayout, BaseTexture, TextureSampler, BindGroup, StructuredBuffer } from '../gpuobject';
import type { TypedArray } from '../../misc';
export declare class WebGPUBindGroup extends WebGPUObject<unknown> implements BindGroup {
    private _layout;
    private _bindGroup;
    private _buffers;
    private _textures;
    private _videoTextures;
    private _resources;
    constructor(device: WebGPUDevice, layout: BindGroupLayout);
    get bindGroup(): GPUBindGroup;
    get bufferList(): WebGPUStructuredBuffer[];
    get textureList(): WebGPUBaseTexture[];
    getLayout(): BindGroupLayout;
    getBuffer(name: string): StructuredBuffer;
    setBuffer(name: string, buffer: StructuredBuffer): void;
    setValue(name: string, value: StructuredValue): void;
    setRawData(name: string, byteOffset: number, data: TypedArray, srcPos?: number, srcLength?: number): void;
    getTexture(name: string): BaseTexture;
    setTextureView(name: string, value: BaseTexture, level?: number, face?: number, mipCount?: number): void;
    setTexture(name: string, value: BaseTexture | TextureVideo, sampler?: TextureSampler): void;
    setSampler(name: string, value: TextureSampler): void;
    getResource(name: string): StructuredBuffer | WebGPUTextureVideo | [WebGPUBaseTexture, GPUTextureView] | GPUSampler;
    destroy(): void;
    restore(): Promise<void>;
    isBindGroup(): this is BindGroup;
}
