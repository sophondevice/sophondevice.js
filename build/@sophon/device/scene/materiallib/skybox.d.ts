import { Material } from '../material';
import type { DrawContext } from '../drawable';
import type { Device, TextureCube, BindGroup, GPUProgram, ProgramBuilder } from '../../device';
export declare class SkyboxMaterial extends Material {
    private _skyCubemap;
    private _skySampler;
    constructor(device: Device);
    get skyCubeMap(): TextureCube;
    set skyCubeMap(tex: TextureCube);
    supportLighting(): boolean;
    protected _createHash(): string;
    protected _applyUniforms(bindGroup: BindGroup, ctx: DrawContext): void;
    protected _createProgram(pb: ProgramBuilder, ctx: DrawContext, func: number): GPUProgram;
}
