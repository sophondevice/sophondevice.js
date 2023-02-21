import { PBInsideFunctionScope, PBShaderExp } from "../../device/builder";
import { DrawContext } from "../drawable";
import type { LightModel } from "../materiallib/lightmodel";
export declare function forwardComputeLighting(scope: PBInsideFunctionScope, lm: LightModel, ctx: DrawContext): PBShaderExp;
export declare function forwardComputeLightingMultiPass(scope: PBInsideFunctionScope, lm: LightModel, ctx: DrawContext): PBShaderExp;
