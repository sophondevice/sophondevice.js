import { ShadowImpl } from "./shadow_impl";
import { TextureFormat, PBInsideFunctionScope, PBShaderExp, TextureSampler } from "../../device";
import type { ShadowMapper, ShadowMapType, ShadowMode } from "./shadowmapper";
export declare class SSM extends ShadowImpl {
    static instance: SSM;
    private _shadowSampler;
    constructor();
    isSupported(shadowMapper: ShadowMapper): boolean;
    resourceDirty(): boolean;
    getType(): ShadowMode;
    dispose(): void;
    getShadowMap(shadowMapper: ShadowMapper): ShadowMapType;
    getShadowMapSampler(shadowMapper: ShadowMapper): TextureSampler;
    doUpdateResources(): void;
    postRenderShadowMap(): void;
    getDepthScale(): number;
    setDepthScale(val: number): void;
    getShaderHash(): string;
    getShadowMapColorFormat(shadowMapper: ShadowMapper): TextureFormat;
    getShadowMapDepthFormat(shadowMapper: ShadowMapper): TextureFormat;
    computeShadowMapDepth(shadowMapper: ShadowMapper, scope: PBInsideFunctionScope): PBShaderExp;
    computeShadowCSM(shadowMapper: ShadowMapper, scope: PBInsideFunctionScope, shadowVertex: PBShaderExp, NdotL: PBShaderExp, split: PBShaderExp): PBShaderExp;
    computeShadow(shadowMapper: ShadowMapper, scope: PBInsideFunctionScope, shadowVertex: PBShaderExp, NdotL: PBShaderExp): PBShaderExp;
    useNativeShadowMap(shadowMapper: ShadowMapper): boolean;
}
