/** sophon base library */
import { ShadowImpl } from './shadow_impl.js';
import '../material.js';
import { ShaderLib } from '../materiallib/shaderlib.js';
import '../../device/render_states.js';
import '../../device/gpuobject.js';
import '../../device/builder/ast.js';
import '../../device/builder/types.js';
import '../../device/builder/programbuilder.js';
import '../materiallib/lightmodel.js';
import '@sophon/base';
import { TextureFormat } from '../../device/base_types.js';
import '../asset/assetmanager.js';
import '../../device/webgl/utils.js';
import '../../device/webgl/webgl_enum.js';
import '../../device/webgl/constants_webgl.js';
import '../../device/webgl/renderstate_webgl.js';
import '../../device/webgpu/constants_webgpu.js';
import '../../device/webgpu/structuredbuffer_webgpu.js';
import '../../device/webgpu/renderstates_webgpu.js';
import '../../device/webgpu/utils_webgpu.js';
import { computeShadowMapDepth, computeReceiverPlaneDepthBias, filterShadowPCF } from '../renderers/shadowmap.shaderlib.js';

class PCFOPT extends ShadowImpl {
    _kernelSize;
    _shadowSampler;
    constructor(kernelSize) {
        super();
        this._kernelSize = kernelSize ?? 5;
        this._shadowSampler = null;
    }
    get kernelSize() {
        return this._kernelSize;
    }
    set kernelSize(val) {
        val = (val !== 3 && val !== 5 && val !== 7) ? 5 : val;
        this._kernelSize = val;
    }
    getType() {
        return 'pcf-opt';
    }
    dispose() {
        this._shadowSampler = null;
    }
    isSupported(shadowMapper) {
        return this.getShadowMapColorFormat(shadowMapper) !== TextureFormat.Unknown && this.getShadowMapDepthFormat(shadowMapper) !== TextureFormat.Unknown;
    }
    resourceDirty() {
        return false;
    }
    getShadowMap(shadowMapper) {
        return this.useNativeShadowMap(shadowMapper) ? shadowMapper.getDepthAttachment() : shadowMapper.getColorAttachment();
    }
    getShadowMapSampler(shadowMapper) {
        if (!this._shadowSampler) {
            this._shadowSampler = this.getShadowMap(shadowMapper)?.getDefaultSampler(this.useNativeShadowMap(shadowMapper)) || null;
        }
        return this._shadowSampler;
    }
    doUpdateResources() {
        this._shadowSampler = null;
    }
    postRenderShadowMap() {
    }
    getDepthScale() {
        return 1;
    }
    setDepthScale(val) {
    }
    getShaderHash() {
        return `${this._kernelSize}`;
    }
    getShadowMapColorFormat(shadowMapper) {
        return TextureFormat.RGBA8UNORM;
    }
    getShadowMapDepthFormat(shadowMapper) {
        return shadowMapper.light.scene.device.getDeviceType() === 'webgl' ? TextureFormat.D24S8 : TextureFormat.D32F;
    }
    computeShadowMapDepth(shadowMapper, scope) {
        return computeShadowMapDepth(scope, shadowMapper.shadowMap.format);
    }
    computeShadowCSM(shadowMapper, scope, shadowVertex, NdotL, split) {
        const funcNameComputeShadowCSM = 'lib_computeShadowCSM';
        const pb = scope.$builder;
        const that = this;
        if (!pb.getFunction(funcNameComputeShadowCSM)) {
            pb.globalScope.$function(funcNameComputeShadowCSM, [pb.vec4('shadowVertex'), pb.float('NdotL'), pb.int('split')], function () {
                this.$l.shadowCoord = pb.div(this.shadowVertex, this.shadowVertex.w);
                this.$l.shadowCoord = pb.add(pb.mul(this.shadowCoord, 0.5), 0.5);
                this.$l.inShadow = pb.all(pb.bvec2(pb.all(pb.bvec4(pb.greaterThanEqual(this.shadowCoord.x, 0), pb.lessThanEqual(this.shadowCoord.x, 1), pb.greaterThanEqual(this.shadowCoord.y, 0), pb.lessThanEqual(this.shadowCoord.y, 1))), pb.lessThanEqual(this.shadowCoord.z, 1)));
                this.$l.shadow = pb.float(1);
                this.$l.receiverPlaneDepthBias = computeReceiverPlaneDepthBias(this, this.shadowCoord);
                this.$if(this.inShadow, function () {
                    this.$l.shadowBias = shadowMapper.computeShadowBiasCSM(this, this.NdotL, this.split);
                    this.shadowCoord.z = pb.sub(this.shadowCoord.z, this.shadowBias);
                    this.shadow = filterShadowPCF(this, shadowMapper.light.lightType, shadowMapper.shadowMap.format, that._kernelSize, this.shadowCoord, this.receiverPlaneDepthBias, this.split);
                });
                this.$return(this.shadow);
            });
        }
        return pb.globalScope[funcNameComputeShadowCSM](shadowVertex, NdotL, split);
    }
    computeShadow(shadowMapper, scope, shadowVertex, NdotL) {
        const funcNameComputeShadow = 'lib_computeShadow';
        const pb = scope.$builder;
        const shaderlib = new ShaderLib(pb);
        const that = this;
        if (!pb.getFunction(funcNameComputeShadow)) {
            pb.globalScope.$function(funcNameComputeShadow, [pb.vec4('shadowVertex'), pb.float('NdotL')], function () {
                if (shadowMapper.light.isPointLight()) {
                    if (that.useNativeShadowMap(shadowMapper)) {
                        this.$l.nearFar = pb.getDeviceType() === 'webgl' ? this.global.light.shadowCameraParams.xy : this.global.light.lightParams[5].xy;
                        this.$l.distance = shaderlib.linearToNonLinear(pb.max(pb.max(pb.abs(this.shadowVertex.x), pb.abs(this.shadowVertex.y)), pb.abs(this.shadowVertex.z)), this.nearFar);
                        this.$l.shadowBias = shadowMapper.computeShadowBias(this, this.distance, this.NdotL);
                        this.$return(that.sampleShadowMap(shadowMapper, this, this.shadowVertex, this.distance, this.shadowBias));
                    }
                    else {
                        this.$l.distance = pb.length(this.shadowVertex.xyz);
                        this.$l.distance = pb.div(this.$l.distance, this.global.light.lightParams[0].w);
                        this.$l.shadowBias = shadowMapper.computeShadowBias(this, this.distance, this.NdotL);
                        this.$return(that.sampleShadowMap(shadowMapper, this, this.shadowVertex, this.distance, this.shadowBias));
                    }
                }
                else {
                    this.$l.shadowCoord = pb.div(this.shadowVertex, this.shadowVertex.w);
                    this.$l.shadowCoord = pb.add(pb.mul(this.shadowCoord, 0.5), 0.5);
                    this.$l.inShadow = pb.all(pb.bvec2(pb.all(pb.bvec4(pb.greaterThanEqual(this.shadowCoord.x, 0), pb.lessThanEqual(this.shadowCoord.x, 1), pb.greaterThanEqual(this.shadowCoord.y, 0), pb.lessThanEqual(this.shadowCoord.y, 1))), pb.lessThanEqual(this.shadowCoord.z, 1)));
                    this.$l.shadow = pb.float(1);
                    this.$l.receiverPlaneDepthBias = computeReceiverPlaneDepthBias(this, this.shadowCoord);
                    this.$if(this.inShadow, function () {
                        this.$l.shadowBias = shadowMapper.computeShadowBias(this, this.shadowCoord.z, this.NdotL);
                        this.shadowCoord.z = pb.sub(this.shadowCoord.z, this.shadowBias);
                        this.shadow = filterShadowPCF(this, shadowMapper.light.lightType, shadowMapper.shadowMap.format, that._kernelSize, this.shadowCoord, this.receiverPlaneDepthBias);
                    });
                    this.$return(this.shadow);
                }
            });
        }
        return pb.globalScope[funcNameComputeShadow](shadowVertex, NdotL);
    }
    useNativeShadowMap(shadowMapper) {
        return shadowMapper.light.scene.device.getDeviceType() !== 'webgl';
    }
    sampleShadowMap(shadowMapper, scope, coords, z, bias) {
        const funcNameSampleShadowMap = `lib_sampleShadowMap`;
        const pb = scope.$builder;
        const lib = new ShaderLib(pb);
        const that = this;
        if (!pb.getFunction(funcNameSampleShadowMap)) {
            pb.globalScope.$function(funcNameSampleShadowMap, [pb.vec4('coords'), pb.float('z'), pb.float('bias')], function () {
                const floatDepthTexture = shadowMapper.shadowMap.format !== TextureFormat.RGBA8UNORM;
                if (shadowMapper.light.isPointLight()) {
                    if (this.useNativeShadowMap(shadowMapper)) {
                        this.$return(pb.clamp(pb.textureSampleCompareLevel(this.shadowMap, this.coords.xyz, pb.sub(this.z, this.bias)), 0, 1));
                    }
                    else {
                        this.$l.shadowTex = pb.textureSampleLevel(this.shadowMap, this.coords.xyz, 0);
                        if (!floatDepthTexture) {
                            this.shadowTex.x = lib.decodeNormalizedFloatFromRGBA(this.shadowTex);
                        }
                        this.$l.distance = pb.sub(this.z, this.bias);
                        this.$return(pb.step(this.distance, this.shadowTex.x));
                    }
                }
                else {
                    this.$l.distance = pb.sub(this.z, this.bias);
                    if (that.useNativeShadowMap(shadowMapper)) {
                        this.$return(pb.clamp(pb.textureSampleCompareLevel(this.shadowMap, this.coords.xy, this.distance), 0, 1));
                    }
                    else {
                        this.$l.shadowTex = pb.textureSampleLevel(this.shadowMap, this.coords.xy, 0);
                        if (!floatDepthTexture) {
                            this.shadowTex.x = lib.decodeNormalizedFloatFromRGBA(this.shadowTex);
                        }
                        this.$return(pb.step(this.distance, this.shadowTex.x));
                    }
                }
            });
        }
        return pb.globalScope[funcNameSampleShadowMap](coords, z, bias);
    }
    sampleShadowMapCSM(shadowMapper, scope, coords, split, z, bias) {
        const funcNameSampleShadowMapCSM = 'lib_sampleShadowMapCSM';
        const pb = scope.$builder;
        const lib = new ShaderLib(pb);
        const that = this;
        if (!pb.getFunction(funcNameSampleShadowMapCSM)) {
            pb.globalScope.$function(funcNameSampleShadowMapCSM, [pb.vec4('coords'), pb.int('split'), pb.float('z'), pb.float('bias')], function () {
                const floatDepthTexture = shadowMapper.shadowMap.format !== TextureFormat.RGBA8UNORM;
                this.$l.distance = pb.sub(this.z, this.bias);
                if (that.useNativeShadowMap(shadowMapper)) {
                    if (shadowMapper.shadowMap.isTexture2DArray()) {
                        this.$return(pb.clamp(pb.textureArraySampleCompareLevel(this.shadowMap, this.coords.xy, this.split, this.distance), 0, 1));
                    }
                    else {
                        this.$return(pb.clamp(pb.textureSampleCompareLevel(this.shadowMap, this.coords.xy, this.distance), 0, 1));
                    }
                }
                else {
                    if (shadowMapper.shadowMap.isTexture2DArray()) {
                        this.$l.shadowTex = pb.textureArraySampleLevel(this.shadowMap, this.coords.xy, this.split, 0);
                    }
                    else {
                        this.$l.shadowTex = pb.textureSampleLevel(this.shadowMap, this.coords.xy, 0);
                    }
                    if (!floatDepthTexture) {
                        this.shadowTex.x = lib.decodeNormalizedFloatFromRGBA(this.shadowTex);
                    }
                    this.$return(pb.step(this.distance, this.shadowTex.x));
                }
            });
        }
        return pb.globalScope[funcNameSampleShadowMapCSM](coords, split, z, bias);
    }
}

export { PCFOPT };
//# sourceMappingURL=pcf_opt.js.map
