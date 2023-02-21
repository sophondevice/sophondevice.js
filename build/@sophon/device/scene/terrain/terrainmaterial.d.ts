import { Material } from '../material';
import { Device, Texture2D, BindGroup, GPUProgram, ProgramBuilder } from '../../device';
import type { Vector2 } from '@sophon/base';
import type { DrawContext } from '../drawable';
export declare enum TerrainRenderMode {
    UNKNOWN = 0,
    NORMAL = 1,
    DETAIL = 2
}
export declare const MAX_DETAIL_TEXTURE_LEVELS = 8;
export declare class TerrainMaterial extends Material {
    private _lightModel;
    constructor(device: Device);
    get baseMap(): Texture2D;
    set baseMap(tex: Texture2D);
    get normalMap(): Texture2D;
    set normalMap(tex: Texture2D);
    get detailMaskMap(): Texture2D;
    set detailMaskMap(tex: Texture2D);
    get numDetailMaps(): number;
    getDetailColorMap(index: number): Texture2D;
    getDetailScale(index: number): Vector2;
    addDetailMap(color: Texture2D, scale: Vector2): void;
    isTransparent(): boolean;
    supportLighting(): boolean;
    applyUniforms(bindGroup: BindGroup, ctx: DrawContext, needUpdate: boolean): void;
    protected _createHash(): string;
    protected _createProgram(pb: ProgramBuilder, ctx: DrawContext, func: number): GPUProgram;
}
