import { TextureFormat, PBInsideFunctionScope, PBShaderExp } from "../../device";
export declare function computeShadowMapDepth(scope: PBInsideFunctionScope, targetFormat: TextureFormat): PBShaderExp;
export declare function computeReceiverPlaneDepthBias(scope: PBInsideFunctionScope, texCoord: PBShaderExp): PBShaderExp;
export declare function filterShadowVSM(scope: PBInsideFunctionScope, lightType: number, shadowMapFormat: TextureFormat, texCoord: PBShaderExp, cascade?: PBShaderExp): PBShaderExp;
export declare function filterShadowESM(scope: PBInsideFunctionScope, lightType: number, shadowMapFormat: TextureFormat, texCoord: PBShaderExp, cascade?: PBShaderExp): PBShaderExp;
export declare function filterShadowPCF(scope: PBInsideFunctionScope, lightType: number, shadowMapFormat: TextureFormat, kernelSize: number, texCoord: PBShaderExp, receiverPlaneDepthBias?: PBShaderExp, cascade?: PBShaderExp): PBShaderExp;
export declare function filterShadowPoissonDisc(scope: PBInsideFunctionScope, lightType: number, shadowMapFormat: TextureFormat, tapCount: number, texCoord: PBShaderExp, receiverPlaneDepthBias?: PBShaderExp, cascade?: PBShaderExp): PBShaderExp;
