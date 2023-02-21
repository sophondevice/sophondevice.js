import { ListIterator } from '@sophon/base';
import type { DrawContext } from './drawable';
import type { Geometry, BindGroup, GPUProgram, RenderStateSet, Device, ProgramBuilder } from '../device';
export type MaterialGCOptions = {
    disabled?: boolean;
    drawableCountThreshold?: number;
    materialCountThreshold?: number;
    inactiveTimeDuration?: number;
    verbose?: boolean;
};
type ProgramInfo = {
    programs: GPUProgram[];
    hash: string;
};
export declare class Material {
    constructor(device: Device);
    get id(): number;
    getLRUIterator(): ListIterator<Material>;
    setLRUIterator(iter: ListIterator<Material>): void;
    setLastRenderTimeStamp(val: number): void;
    getLastRenderTimeStamp(): number;
    getHash(): string;
    get stateSet(): RenderStateSet;
    set stateSet(stateset: RenderStateSet);
    get device(): Device;
    isTransparent(): boolean;
    supportLighting(): boolean;
    draw(primitive: Geometry, ctx: DrawContext): void;
    beginDraw(ctx: DrawContext): boolean;
    endDraw(): void;
    getMaterialBindGroup(): BindGroup;
    applyUniforms(bindGroup: BindGroup, ctx: DrawContext, needUpdate: boolean): void;
    getOrCreateProgram(ctx: DrawContext): ProgramInfo;
    dispose(): void;
    static initShader(pb: ProgramBuilder, ctx: DrawContext): void;
    static setGCOptions(opt: MaterialGCOptions): void;
    static getGCOptions(): MaterialGCOptions;
    static garbageCollect(ts: number): number;
}
export {};
