/// <reference types="dist" />
import { WebGPUObject } from './gpuobject_webgpu';
import { ShaderType } from '../base_types';
import type { GPUProgram, BindGroupLayout, BindPointInfo } from '../gpuobject';
import type { GPUProgramConstructParams } from '../device';
import type { WebGPUDevice } from './device';
export declare class WebGPUProgram extends WebGPUObject<unknown> implements GPUProgram {
    private static _hashCounter;
    private _type;
    private _vs;
    private _fs;
    private _cs;
    private _label;
    private _hash;
    private _error;
    private _bindGroupLayouts;
    private _vertexAttributes;
    private _csModule;
    private _vsModule;
    private _fsModule;
    private _pipelineLayout;
    constructor(device: WebGPUDevice, params: GPUProgramConstructParams);
    get type(): 'render' | 'compute';
    get label(): string;
    getCompileError(): string;
    getShaderSource(shaderType: ShaderType): string;
    getBindingInfo(name: string): BindPointInfo;
    get bindGroupLayouts(): BindGroupLayout[];
    get vertexAttributes(): string;
    get hash(): string;
    getPipelineLayout(): GPUPipelineLayout;
    getShaderModule(): {
        vsModule: GPUShaderModule;
        fsModule: GPUShaderModule;
        csModule: GPUShaderModule;
        pipelineLayout: GPUPipelineLayout;
    };
    get fsModule(): GPUShaderModule;
    destroy(): void;
    restore(): Promise<void>;
    isProgram(): boolean;
    private _load;
    private createPipelineLayout;
    private createShaderModule;
    use(): void;
}
