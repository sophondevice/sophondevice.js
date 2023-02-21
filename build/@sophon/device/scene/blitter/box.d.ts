import { Blitter, BlitType } from "./blitter";
import type { BindGroup } from '../../device/gpuobject';
import type { PBShaderExp, PBInsideFunctionScope, PBGlobalScope } from "../../device/builder";
export declare class BoxFilterBlitter extends Blitter {
    protected _phase: 'horizonal' | 'vertical';
    protected _kernelSize: number;
    protected _sigma: number;
    protected _blurSize: number;
    protected _logSpace: boolean;
    protected _logSpaceMultiplier: number;
    constructor(phase: 'horizonal' | 'vertical', kernelSize: number, blurSize: number);
    get logSpace(): boolean;
    set logSpace(val: boolean);
    get logSpaceMultiplier(): number;
    set logSpaceMultiplier(val: number);
    setup(scope: PBGlobalScope, type: BlitType): void;
    setUniforms(bindGroup: BindGroup): void;
    filter(scope: PBInsideFunctionScope, type: BlitType, srcTex: PBShaderExp, srcUV: PBShaderExp, srcLayer: PBShaderExp): PBShaderExp;
    protected calcHash(): string;
}
