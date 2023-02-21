import { Blitter, BlitType } from "./blitter";
import { PBShaderExp, PBInsideFunctionScope } from "../../device";
export declare class CopyBlitter extends Blitter {
    filter(scope: PBInsideFunctionScope, type: BlitType, srcTex: PBShaderExp, srcUV: PBShaderExp, srcLayer: PBShaderExp): PBShaderExp;
    protected calcHash(): string;
}
