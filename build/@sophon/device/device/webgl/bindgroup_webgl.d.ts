import { WebGLGPUProgram } from './gpuprogram_webgl';
import { StructuredValue } from '../gpuobject';
import { WebGLGPUObject } from './gpuobject_webgl';
import type { TypedArray } from '../../misc';
import type { WebGLDevice } from './device_webgl';
import type { BindGroupLayout, BaseTexture, StructuredBuffer, TextureSampler, BindGroup } from '../gpuobject';
export declare class WebGLBindGroup extends WebGLGPUObject<unknown> implements BindGroup {
    private _layout;
    private _resources;
    constructor(device: WebGLDevice, layout: BindGroupLayout);
    getLayout(): BindGroupLayout;
    getBuffer(name: string): StructuredBuffer;
    setBuffer(name: string, buffer: StructuredBuffer): void;
    setRawData(name: string, byteOffset: number, data: TypedArray, srcPos?: number, srcLength?: number): void;
    setValue(name: string, value: StructuredValue): void;
    setTextureView(name: string, value: BaseTexture, level: number, face: number): void;
    getTexture(name: string): BaseTexture;
    setTexture(name: string, texture: BaseTexture, sampler?: TextureSampler): void;
    setSampler(name: string, value: TextureSampler): void;
    apply(program: WebGLGPUProgram, offsets?: Iterable<number>): void;
    destroy(): void;
    restore(): Promise<void>;
    isBindGroup(): this is BindGroup;
    private _getBuffer;
    private _findTextureLayout;
}
