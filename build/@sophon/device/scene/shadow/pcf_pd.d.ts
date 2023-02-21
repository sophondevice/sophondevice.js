import { ShadowImpl } from './shadow_impl';
import { PBInsideFunctionScope, PBShaderExp, TextureFormat, TextureSampler } from '../../device';
import type { ShadowMapper, ShadowMapType, ShadowMode } from './shadowmapper';
export declare class PCFPD extends ShadowImpl {
    protected _tapCount: number;
    protected _sampleRadius: number;
    protected _shadowSampler: TextureSampler;
    constructor(tapCount?: number, sampleRadius?: number);
    get tapCount(): number;
    set tapCount(val: number);
    getType(): ShadowMode;
    dispose(): void;
    isSupported(shadowMapper: ShadowMapper): boolean;
    resourceDirty(): boolean;
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
