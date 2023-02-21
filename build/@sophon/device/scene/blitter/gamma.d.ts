import { Blitter, BlitType } from "./blitter";
import type { BindGroup } from '../../device/gpuobject';
import type { PBShaderExp, PBInsideFunctionScope, PBGlobalScope } from "../../device/builder";
export declare class GammaBlitter extends Blitter {
    protected _gamma: number;
    constructor(gamma: number);
    setup(scope: PBGlobalScope, type: BlitType): void;
    setUniforms(bindGroup: BindGroup): void;
    filter(scope: PBInsideFunctionScope, type: BlitType, srcTex: PBShaderExp, srcUV: PBShaderExp, srcLayer: PBShaderExp): PBShaderExp;
    protected calcHash(): string;
}
