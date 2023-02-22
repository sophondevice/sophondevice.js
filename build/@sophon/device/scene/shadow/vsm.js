/** sophon base library */
import { ShadowImpl } from './shadow_impl.js';
import { Blitter } from '../blitter/blitter.js';
import { ShaderType, TextureTarget, TextureFormat } from '../../device/base_types.js';
import '../material.js';
import { ShaderLib } from '../materiallib/shaderlib.js';
import '../../device/render_states.js';
import '../../device/gpuobject.js';
import '../../device/builder/ast.js';
import '../../device/builder/types.js';
import '../../device/builder/programbuilder.js';
import '../materiallib/lightmodel.js';
import '@sophon/base';
import '../asset/assetmanager.js';
import '../../device/webgl/utils.js';
import '../../device/webgl/webgl_enum.js';
import '../../device/webgl/constants_webgl.js';
import '../../device/webgl/renderstate_webgl.js';
import '../../device/webgpu/constants_webgpu.js';
import '../../device/webgpu/structuredbuffer_webgpu.js';
import '../../device/webgpu/renderstates_webgpu.js';
import '../../device/webgpu/utils_webgpu.js';
import { computeShadowMapDepth, filterShadowVSM } from '../renderers/shadowmap.shaderlib.js';

class VSMBlitter extends Blitter {
    _phase;
    _packFloat;
    _blurSize;
    _kernelSize;
    constructor(phase, kernelSize, blurSize, packFloat) {
        super();
        this._phase = phase;
        this._blurSize = blurSize;
        this._kernelSize = kernelSize;
        this._packFloat = packFloat;
    }
    get blurSize() {
        return this._blurSize;
    }
    set blurSize(val) {
        this._blurSize = val;
    }
    get kernelSize() {
        return this._kernelSize;
    }
    set kernelSize(val) {
        if (val !== this._kernelSize) {
            this._kernelSize = val;
            this.invalidateHash();
        }
    }
    get packFloat() {
        return this._packFloat;
    }
    set packFloat(b) {
        if (this._packFloat !== !!b) {
            this._packFloat = !!b;
            this.invalidateHash();
        }
    }
    setup(scope, type) {
        const pb = scope.$builder;
        if (pb.shaderType === ShaderType.Fragment) {
            scope.blurSize = pb.float().uniform(0);
            scope.blurMultiplyVec = type === 'cube'
                ? this._phase === 'horizonal' ? pb.vec3(1, 0, 0) : pb.vec3(0, 1, 0)
                : this._phase === 'horizonal' ? pb.vec2(1, 0) : pb.vec2(0, 1);
            scope.numBlurPixelsPerSide = pb.float((this._kernelSize + 1) / 2);
            scope.weight = pb.float(1 / (this._kernelSize * this._kernelSize));
        }
    }
    setUniforms(bindGroup) {
        bindGroup.setValue('blurSize', this._blurSize);
    }
    readTexel(scope, type, srcTex, srcUV, srcLayer) {
        const pb = scope.$builder;
        const texel = super.readTexel(scope, type, srcTex, srcUV, srcLayer);
        if (this._packFloat) {
            const lib = new ShaderLib(pb);
            if (this._phase === 'horizonal') {
                return pb.vec4(lib.decodeNormalizedFloatFromRGBA(texel));
            }
            else {
                return pb.vec4(lib.decode2HalfFromRGBA(texel), 0, 0);
            }
        }
        else {
            return texel;
        }
    }
    writeTexel(scope, type, srcUV, texel) {
        const pb = scope.$builder;
        const outTexel = super.writeTexel(scope, type, srcUV, texel);
        if (this._packFloat) {
            const lib = new ShaderLib(pb);
            return lib.encode2HalfToRGBA(outTexel.x, outTexel.y);
        }
        else {
            return outTexel;
        }
    }
    filter(scope, type, srcTex, srcUV, srcLayer) {
        const that = this;
        const pb = scope.$builder;
        scope.d0 = that.readTexel(scope, type, srcTex, srcUV, srcLayer);
        scope.mean = pb.float(0);
        scope.squaredMean = pb.float(0);
        scope.$for(pb.float('i'), 1, scope.numBlurPixelsPerSide, function () {
            this.d1 = that.readTexel(this, type, srcTex, pb.sub(srcUV, pb.mul(this.blurMultiplyVec, this.blurSize, this.i)), srcLayer);
            this.d2 = that.readTexel(this, type, srcTex, pb.add(srcUV, pb.mul(this.blurMultiplyVec, this.blurSize, this.i)), srcLayer);
            this.mean = pb.add(this.mean, this.d1.x);
            this.mean = pb.add(this.mean, this.d2.x);
            if (that._phase === 'horizonal') {
                this.squaredMean = pb.add(this.squaredMean, pb.mul(this.d1.x, this.d1.x));
                this.squaredMean = pb.add(this.squaredMean, pb.mul(this.d2.x, this.d2.x));
            }
            else {
                this.squaredMean = pb.add(this.squaredMean, pb.dot(this.d1.xy, this.d1.xy));
                this.squaredMean = pb.add(this.squaredMean, pb.dot(this.d2.xy, this.d2.xy));
            }
        });
        scope.mean = pb.div(scope.mean, that._kernelSize);
        scope.squaredMean = pb.div(scope.squaredMean, that._kernelSize);
        scope.stdDev = pb.sqrt(pb.max(0, pb.sub(scope.squaredMean, pb.mul(scope.mean, scope.mean))));
        return pb.vec4(scope.mean, scope.stdDev, 0, 1);
    }
    calcHash() {
        return `${this._phase}-${this._kernelSize}-${Number(this._packFloat)}`;
    }
}
class VSM extends ShadowImpl {
    _blur;
    _kernelSize;
    _blurSize;
    _blurMap;
    _blurFramebuffer;
    _blurMap2;
    _blurFramebuffer2;
    _blitterH;
    _blitterV;
    _mipmap;
    _darkness;
    _shadowSampler;
    constructor(kernelSize, blurSize, darkness) {
        super();
        this._blur = true;
        this._kernelSize = kernelSize ?? 5;
        this._blurSize = blurSize ?? 1;
        this._darkness = darkness ?? 0;
        this._mipmap = true;
        this._shadowSampler = null;
        this._blitterH = new VSMBlitter('horizonal', this._kernelSize, 1 / 1024, false);
        this._blitterV = new VSMBlitter('vertical', this._kernelSize, 1 / 1024, false);
    }
    resourceDirty() {
        return this._resourceDirty;
    }
    get blur() {
        return this._blur;
    }
    set blur(val) {
        if (this._blur !== !!val) {
            this._blur = !!val;
            this._resourceDirty = true;
        }
    }
    get mipmap() {
        return this._mipmap;
    }
    set mipmap(b) {
        if (this._mipmap !== !!b) {
            this._mipmap = !!b;
            if (this._blur) {
                this._resourceDirty = true;
            }
        }
    }
    get kernelSize() {
        return this._kernelSize;
    }
    set kernelSize(val) {
        this._kernelSize = val;
    }
    get blurSize() {
        return this._blurSize;
    }
    set blurSize(val) {
        this._blurSize = val;
    }
    getDepthScale() {
        return this._darkness;
    }
    setDepthScale(val) {
        this._darkness = val;
    }
    getType() {
        return 'vsm';
    }
    dispose() {
        this._blurFramebuffer?.dispose();
        this._blurFramebuffer = null;
        this._blurFramebuffer2?.dispose();
        this._blurFramebuffer2 = null;
        this._blurMap?.dispose();
        this._blurMap = null;
        this._blurMap2?.dispose();
        this._blurMap2 = null;
        this._shadowSampler = null;
    }
    getShadowMap(shadowMapper) {
        return this._blur ? this._blurMap2 : shadowMapper.getColorAttachment();
    }
    getShadowMapSampler(shadowMapper) {
        if (!this._shadowSampler) {
            this._shadowSampler = this.getShadowMap(shadowMapper)?.getDefaultSampler(false) || null;
        }
        return this._shadowSampler;
    }
    isTextureInvalid(shadowMapper, texture, target, format, width, height) {
        return texture && (texture.target !== target
            || texture.format !== format
            || texture.width !== width
            || texture.height !== height
            || texture.depth !== shadowMapper.numShadowCascades);
    }
    createTexture(device, target, format, width, height, depth, mipmap) {
        const options = {
            colorSpace: 'linear',
            noMipmap: !mipmap
        };
        switch (target) {
            case TextureTarget.Texture2D:
                return device.createTexture2D(format, width, height, options);
            case TextureTarget.TextureCubemap:
                return device.createCubeTexture(format, width, options);
            case TextureTarget.Texture2DArray:
                return device.createTexture2DArray(format, width, height, depth, options);
            default:
                return null;
        }
    }
    doUpdateResources(shadowMapper) {
        const device = shadowMapper.light.scene.device;
        const colorFormat = this.getShadowMapColorFormat(shadowMapper);
        const target = shadowMapper.getColorAttachment().target;
        const shadowMapWidth = shadowMapper.getColorAttachment().width;
        const shadowMapHeight = shadowMapper.getColorAttachment().height;
        const blur = this._blur;
        const blurMapWidth = shadowMapWidth;
        const blurMapHeight = shadowMapHeight;
        if (!blur) {
            this._blurFramebuffer?.dispose();
            this._blurFramebuffer = null;
            this._blurMap?.dispose();
            this._blurMap = null;
            this._blurFramebuffer2?.dispose();
            this._blurFramebuffer2 = null;
            this._blurMap2?.dispose();
            this._blurMap2 = null;
        }
        if (this.isTextureInvalid(shadowMapper, this._blurMap, target, colorFormat, blurMapWidth, blurMapHeight)) {
            this._blurFramebuffer?.dispose();
            this._blurFramebuffer = null;
            this._blurMap?.dispose();
            this._blurMap = null;
        }
        if (this.isTextureInvalid(shadowMapper, this._blurMap2, target, colorFormat, blurMapWidth, blurMapHeight)) {
            this._blurFramebuffer2?.dispose();
            this._blurFramebuffer2 = null;
            this._blurMap2?.dispose();
            this._blurMap2 = null;
        }
        if (blur) {
            if (!this._blurMap || this._blurMap.disposed) {
                this._blurMap = this.createTexture(device, target, colorFormat, blurMapWidth, blurMapHeight, shadowMapper.numShadowCascades, false);
            }
            if (!this._blurMap2 || (this._mipmap !== this._blurMap2.mipLevelCount > 1) || this._blurMap2.disposed) {
                this._blurMap2 = this.createTexture(device, target, colorFormat, blurMapWidth, blurMapHeight, shadowMapper.numShadowCascades, this._mipmap);
            }
            if (!this._blurFramebuffer || this._blurFramebuffer.disposed) {
                this._blurFramebuffer = device.createFrameBuffer({ colorAttachments: [{ texture: this._blurMap }] });
            }
            if (!this._blurFramebuffer2 || this._blurFramebuffer2.disposed) {
                this._blurFramebuffer2 = device.createFrameBuffer({ colorAttachments: [{ texture: this._blurMap2 }] });
            }
        }
        this._shadowSampler = null;
    }
    postRenderShadowMap(shadowMapper) {
        if (this._blur) {
            this._blitterH.blurSize = this._blurSize / shadowMapper.shadowMap.width;
            this._blitterH.kernelSize = this._kernelSize;
            this._blitterH.packFloat = shadowMapper.shadowMap.format === TextureFormat.RGBA8UNORM;
            this._blitterV.blurSize = this._blurSize / shadowMapper.shadowMap.height;
            this._blitterV.kernelSize = this._kernelSize;
            this._blitterV.packFloat = shadowMapper.shadowMap.format === TextureFormat.RGBA8UNORM;
            this._blitterH.blit(shadowMapper.getColorAttachment(), this._blurFramebuffer);
            this._blitterV.blit(this._blurMap, this._blurFramebuffer2);
        }
    }
    isSupported(shadowMapper) {
        return this.getShadowMapColorFormat(shadowMapper) !== TextureFormat.Unknown && this.getShadowMapDepthFormat(shadowMapper) !== TextureFormat.Unknown;
    }
    getShaderHash() {
        return '';
    }
    getShadowMapColorFormat(shadowMapper) {
        const device = shadowMapper.light.scene.device;
        return device.getTextureCaps().supportFloatColorBuffer && device.getTextureCaps().supportLinearFloatTexture
            ? device.getDeviceType() === 'webgl' ? TextureFormat.RGBA32F : TextureFormat.RG32F
            : device.getTextureCaps().supportHalfFloatColorBuffer && device.getTextureCaps().supportLinearHalfFloatTexture
                ? device.getDeviceType() === 'webgl' ? TextureFormat.RGBA16F : TextureFormat.RG16F
                : TextureFormat.RGBA8UNORM;
    }
    getShadowMapDepthFormat(shadowMapper) {
        return TextureFormat.D24S8;
    }
    computeShadowMapDepth(shadowMapper, scope) {
        return computeShadowMapDepth(scope, shadowMapper.shadowMap.format);
    }
    computeShadowCSM(shadowMapper, scope, shadowVertex, NdotL, split) {
        const funcNameComputeShadowCSM = 'lib_computeShadowCSM';
        const pb = scope.$builder;
        if (!pb.getFunction(funcNameComputeShadowCSM)) {
            pb.globalScope.$function(funcNameComputeShadowCSM, [pb.vec4('shadowVertex'), pb.float('NdotL'), pb.int('split')], function () {
                this.$l.shadowCoord = pb.div(this.shadowVertex, this.shadowVertex.w);
                this.$l.shadowCoord = pb.add(pb.mul(this.shadowCoord, 0.5), 0.5);
                this.$l.inShadow = pb.all(pb.bvec2(pb.all(pb.bvec4(pb.greaterThanEqual(this.shadowCoord.x, 0), pb.lessThanEqual(this.shadowCoord.x, 1), pb.greaterThanEqual(this.shadowCoord.y, 0), pb.lessThanEqual(this.shadowCoord.y, 1))), pb.lessThanEqual(this.shadowCoord.z, 1)));
                this.$l.shadow = pb.float(1);
                this.$if(this.inShadow, function () {
                    this.$l.shadowBias = shadowMapper.computeShadowBiasCSM(this, this.NdotL, this.split);
                    this.shadowCoord.z = pb.sub(this.shadowCoord.z, this.shadowBias);
                    this.shadow = filterShadowVSM(this, shadowMapper.light.lightType, shadowMapper.shadowMap.format, this.shadowCoord, this.split);
                });
                this.$return(this.shadow);
            });
        }
        return pb.globalScope[funcNameComputeShadowCSM](shadowVertex, NdotL, split);
    }
    computeShadow(shadowMapper, scope, shadowVertex, NdotL) {
        const funcNameComputeShadow = 'lib_computeShadow';
        const pb = scope.$builder;
        const lib = new ShaderLib(pb);
        if (!pb.getFunction(funcNameComputeShadow)) {
            pb.globalScope.$function(funcNameComputeShadow, [pb.vec4('shadowVertex'), pb.float('NdotL')], function () {
                if (shadowMapper.light.isPointLight()) {
                    this.$l.shadowBias = shadowMapper.computeShadowBias(this, this.distance, this.NdotL);
                    this.$l.coord = pb.vec4(this.shadowVertex.xyz, pb.sub(pb.div(pb.length(this.shadowVertex.xyz), this.global.light.lightParams[0].w), this.shadowBias));
                    this.$return(filterShadowVSM(this, shadowMapper.light.lightType, shadowMapper.shadowMap.format, this.coord));
                }
                else {
                    this.$l.shadowCoord = pb.div(this.shadowVertex, this.shadowVertex.w);
                    this.$l.shadowCoord = pb.add(pb.mul(this.shadowCoord, 0.5), 0.5);
                    this.$l.inShadow = pb.all(pb.bvec2(pb.all(pb.bvec4(pb.greaterThanEqual(this.shadowCoord.x, 0), pb.lessThanEqual(this.shadowCoord.x, 1), pb.greaterThanEqual(this.shadowCoord.y, 0), pb.lessThanEqual(this.shadowCoord.y, 1))), pb.lessThanEqual(this.shadowCoord.z, 1)));
                    this.$l.shadow = pb.float(1);
                    this.$if(this.inShadow, function () {
                        if (shadowMapper.light.isSpotLight()) {
                            this.$l.nearFar = pb.getDeviceType() === 'webgl' ? this.global.light.shadowCameraParams.xy : this.global.light.lightParams[5].xy;
                            this.shadowCoord.z = lib.nonLinearDepthToLinearNormalized(this.shadowCoord.z, this.nearFar);
                        }
                        this.$l.shadowBias = shadowMapper.computeShadowBias(this, this.shadowCoord.z, this.NdotL);
                        this.shadowCoord.z = pb.sub(this.shadowCoord.z, this.shadowBias);
                        this.shadow = filterShadowVSM(this, shadowMapper.light.lightType, shadowMapper.shadowMap.format, this.shadowCoord);
                    });
                    this.$return(this.shadow);
                }
            });
        }
        return pb.globalScope[funcNameComputeShadow](shadowVertex, NdotL);
    }
    useNativeShadowMap(shadowMapper) {
        return false;
    }
}

export { VSM, VSMBlitter };
//# sourceMappingURL=vsm.js.map
