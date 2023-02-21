/** sophon base library */
import { ShadowImpl } from './shadow_impl.js';
import { TextureTarget, TextureFormat } from '../../device/base_types.js';
import '../../device/render_states.js';
import '../../device/gpuobject.js';
import '@sophon/base';
import { GaussianBlurBlitter } from '../blitter/gaussianblur.js';
import { computeShadowMapDepth, filterShadowESM } from '../renderers/shadowmap.shaderlib.js';
import '../material.js';
import { ShaderLib } from '../materiallib/shaderlib.js';
import '../../device/builder/ast.js';
import '../../device/builder/types.js';
import '../../device/builder/builtinfunc.js';
import '../../device/builder/constructors.js';
import '../materiallib/lightmodel.js';
import '../asset/assetmanager.js';
import '../../device/webgl/utils.js';
import '../../device/webgl/webgl_enum.js';
import '../../device/webgl/constants_webgl.js';
import '../../device/webgl/renderstate_webgl.js';
import '../../device/webgpu/constants_webgpu.js';
import '../../device/webgpu/structuredbuffer_webgpu.js';
import '../../device/webgpu/renderstates_webgpu.js';
import '../../device/webgpu/utils_webgpu.js';

class BlurBlitter extends GaussianBlurBlitter {
    _packFloat;
    get packFloat() {
        return this._packFloat;
    }
    set packFloat(b) {
        if (this._packFloat !== !!b) {
            this._packFloat = !!b;
            this.invalidateHash();
        }
    }
    readTexel(scope, type, srcTex, srcUV, srcLayer) {
        const pb = scope.$builder;
        const texel = super.readTexel(scope, type, srcTex, srcUV, srcLayer);
        if (this.packFloat) {
            const lib = new ShaderLib(pb);
            return pb.vec4(lib.decodeNormalizedFloatFromRGBA(texel), 0, 0, 1);
        }
        else {
            return texel;
        }
    }
    writeTexel(scope, type, srcUV, texel) {
        const pb = scope.$builder;
        const outTexel = super.writeTexel(scope, type, srcUV, texel);
        if (this.packFloat) {
            const lib = new ShaderLib(pb);
            return lib.encodeNormalizedFloatToRGBA(outTexel.r);
        }
        else {
            return outTexel;
        }
    }
    calcHash() {
        return `${super.calcHash()}-${Number(this.packFloat)}`;
    }
}
class ESM extends ShadowImpl {
    _depthScale;
    _blur;
    _kernelSize;
    _blurSize;
    _logSpace;
    _blurMap;
    _blurFramebuffer;
    _blurMap2;
    _blurFramebuffer2;
    _blitterH;
    _blitterV;
    _mipmap;
    _shadowSampler;
    constructor(kernelSize, blurSize, depthScale) {
        super();
        this._blur = true;
        this._depthScale = depthScale ?? 500;
        this._kernelSize = kernelSize ?? 5;
        this._blurSize = blurSize ?? 1;
        this._logSpace = true;
        this._mipmap = true;
        this._shadowSampler = null;
        this._blitterH = new BlurBlitter('horizonal', this._kernelSize, 4, 1 / 1024);
        this._blitterV = new BlurBlitter('vertical', this._kernelSize, 4, 1 / 1024);
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
    get logSpace() {
        return this._logSpace;
    }
    set logSpace(val) {
        this._logSpace = !!val;
    }
    getType() {
        return 'esm';
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
        return null;
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
            this._blitterH.blurSize = this._blurSize / shadowMapper.getColorAttachment().width;
            this._blitterH.kernelSize = this._kernelSize;
            this._blitterH.logSpace = this._logSpace;
            this._blitterH.packFloat = shadowMapper.getColorAttachment().format === TextureFormat.RGBA8UNORM;
            this._blitterV.blurSize = this._blurSize / shadowMapper.getColorAttachment().height;
            this._blitterV.kernelSize = this._kernelSize;
            this._blitterV.logSpace = this._logSpace;
            this._blitterV.packFloat = shadowMapper.getColorAttachment().format === TextureFormat.RGBA8UNORM;
            this._blitterH.blit(shadowMapper.getColorAttachment(), this._blurFramebuffer);
            this._blitterV.blit(this._blurMap, this._blurFramebuffer2);
        }
    }
    getDepthScale() {
        return this._depthScale;
    }
    setDepthScale(val) {
        this._depthScale = val;
    }
    isSupported(shadowMapper) {
        return this.getShadowMapColorFormat(shadowMapper) !== TextureFormat.Unknown && this.getShadowMapDepthFormat(shadowMapper) !== TextureFormat.Unknown;
    }
    getShaderHash() {
        return '';
    }
    getShadowMapColorFormat(shadowMapper) {
        const device = shadowMapper.light.scene.device;
        return device.getTextureCaps().supportHalfFloatColorBuffer
            ? device.getDeviceType() === 'webgl' ? TextureFormat.RGBA16F : TextureFormat.R16F
            : device.getTextureCaps().supportFloatColorBuffer
                ? device.getDeviceType() === 'webgl' ? TextureFormat.RGBA32F : TextureFormat.R32F
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
                    this.shadow = filterShadowESM(this, shadowMapper.light.lightType, shadowMapper.shadowMap.format, this.shadowCoord, this.split);
                });
                this.$return(this.shadow);
            });
        }
        return pb.globalScope[funcNameComputeShadowCSM](shadowVertex, NdotL, split);
    }
    computeShadow(shadowMapper, scope, shadowVertex, NdotL) {
        const funcNameComputeShadow = 'lib_computeShadow';
        const pb = scope.$builder;
        if (!pb.getFunction(funcNameComputeShadow)) {
            pb.globalScope.$function(funcNameComputeShadow, [pb.vec4('shadowVertex'), pb.float('NdotL')], function () {
                if (shadowMapper.light.isPointLight()) {
                    this.$return(filterShadowESM(this, shadowMapper.light.lightType, shadowMapper.shadowMap.format, this.shadowVertex));
                }
                else {
                    this.$l.shadowCoord = pb.div(this.shadowVertex, this.shadowVertex.w);
                    this.$l.shadowCoord = pb.add(pb.mul(this.shadowCoord, 0.5), 0.5);
                    this.$l.inShadow = pb.all(pb.bvec2(pb.all(pb.bvec4(pb.greaterThanEqual(this.shadowCoord.x, 0), pb.lessThanEqual(this.shadowCoord.x, 1), pb.greaterThanEqual(this.shadowCoord.y, 0), pb.lessThanEqual(this.shadowCoord.y, 1))), pb.lessThanEqual(this.shadowCoord.z, 1)));
                    this.$l.shadow = pb.float(1);
                    this.$if(this.inShadow, function () {
                        this.shadow = filterShadowESM(this, shadowMapper.light.lightType, shadowMapper.shadowMap.format, this.shadowCoord);
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

export { ESM };
//# sourceMappingURL=esm.js.map
