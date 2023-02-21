import { PBInsideFunctionScope, PBShaderExp, TextureFormat, TextureSampler } from "../../device";
import type { ShadowMapper, ShadowMapType, ShadowMode } from "./shadowmapper";
export declare abstract class ShadowImpl {
    protected _resourceDirty: boolean;
    constructor();
    invalidateResource(): void;
    updateResources(shadowMapper: ShadowMapper): void;
    abstract dispose(): void;
    abstract getType(): ShadowMode;
    abstract getShadowMap(shadowMapper: ShadowMapper): ShadowMapType;
    abstract getShadowMapSampler(shadowMapper: ShadowMapper): TextureSampler;
    abstract postRenderShadowMap(shadowMapper: ShadowMapper): any;
    abstract getDepthScale(): number;
    abstract setDepthScale(val: number): any;
    abstract resourceDirty(): boolean;
    abstract isSupported(shadowMapper: ShadowMapper): boolean;
    abstract doUpdateResources(shadowMapper: ShadowMapper): any;
    abstract getShaderHash(): string;
    abstract computeShadowMapDepth(shadowMapper: ShadowMapper, scope: PBInsideFunctionScope): PBShaderExp;
    abstract computeShadow(shadowMapper: ShadowMapper, scope: PBInsideFunctionScope, shadowVertex: PBShaderExp, NdotL: PBShaderExp): PBShaderExp;
    abstract computeShadowCSM(shadowMapper: ShadowMapper, scope: PBInsideFunctionScope, shadowVertex: PBShaderExp, NdotL: PBShaderExp, split: PBShaderExp): PBShaderExp;
    abstract getShadowMapColorFormat(shadowMapper: ShadowMapper): TextureFormat;
    abstract getShadowMapDepthFormat(shadowMapper: ShadowMapper): TextureFormat;
    abstract useNativeShadowMap(shadowMapper: ShadowMapper): boolean;
}
