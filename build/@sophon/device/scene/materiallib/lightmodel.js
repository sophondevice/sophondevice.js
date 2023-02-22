/** sophon base library */
import { Matrix4x4, Vector4 } from '@sophon/base';
import { ShaderType } from '../../device/base_types.js';
import '../../device/builder/ast.js';
import { PBStructTypeInfo, typeF32Vec4, typeF32Vec3, typeF32, typeMat3 } from '../../device/builder/types.js';
import '../../device/builder/programbuilder.js';
import { EnvConstantAmbient, EnvIBL } from './envlight.js';
import { ShaderLib } from './shaderlib.js';
import { MATERIAL_FUNC_NORMAL } from '../values.js';

const identTexTransform = Matrix4x4.identity();
const TEX_NAME_ALBEDO = 'albedo';
const TEX_NAME_NORMAL = 'normal';
const TEX_NAME_EMISSIVE = 'emissive';
const TEX_NAME_OCCLUSION = 'occlusion';
const TEX_NAME_SPECULAR = 'specular';
const TEX_NAME_SPECULAR_COLOR = 'specularColor';
const TEX_NAME_METALLIC = 'metallic';
const TEX_NAME_SHEEN_COLOR = 'sheenColor';
const TEX_NAME_SHEEN_ROUGHNESS = 'sheenRoughness';
const TEX_NAME_SHEEN_LUT = 'sheenLut';
const TEX_NAME_CLEARCOAT_INTENSITY = 'clearcoatIntensity';
const TEX_NAME_CLEARCOAT_ROUGHNESS = 'clearcoatRoughness';
const TEX_NAME_CLEARCOAT_NORMAL = 'clearcoatNormal';
class LightModel {
    static uniformAlbedoColor = 'libLM_USAGE_albedoColor';
    static uniformNormalScale = 'libLM_USAGE_normalScale';
    static uniformEmissiveFactor = 'libLM_USAGE_emissiveFactor';
    static funcNameCalcAlbedo = 'libLM_calcAlbedo';
    _albedo;
    _normalScale;
    _emissiveFactor;
    _hash;
    _hashVersion;
    _uniformVersion;
    _bindGroupTagList;
    _texCoordChannels;
    _textureOptions;
    _surfaceDataType;
    constructor() {
        this._albedo = Vector4.one();
        this._normalScale = 1;
        this._emissiveFactor = new Vector4(0, 0, 0, 1);
        this._hash = null;
        this._hashVersion = 0;
        this._uniformVersion = 0;
        this._bindGroupTagList = new WeakMap();
        this._texCoordChannels = [];
        this._textureOptions = {};
        this._surfaceDataType = null;
    }
    getSurfaceDataType(env) {
        return this.createSurfaceDataType(env);
    }
    get albedo() {
        return this._albedo;
    }
    set albedo(val) {
        if (!val.equalsTo(this._albedo)) {
            this._albedo.assign(val.getArray());
            this.optionChanged(false);
        }
    }
    get albedoMap() {
        return this._textureOptions[TEX_NAME_ALBEDO]?.texture ?? null;
    }
    get albedoSampler() {
        return this._textureOptions[TEX_NAME_ALBEDO]?.sampler ?? null;
    }
    get albedoMapTexCoord() {
        return this._textureOptions[TEX_NAME_ALBEDO]?.texCoordIndex ?? null;
    }
    setAlbedoMap(tex, sampler, texCoordIndex, texTransform) {
        this.setTextureOptions(TEX_NAME_ALBEDO, tex, sampler, texCoordIndex, texTransform);
    }
    get normalMap() {
        return this._textureOptions[TEX_NAME_NORMAL]?.texture ?? null;
    }
    get normalSampler() {
        return this._textureOptions[TEX_NAME_NORMAL]?.sampler ?? null;
    }
    get normalMapTexCoord() {
        return this._textureOptions[TEX_NAME_NORMAL]?.texCoordIndex ?? null;
    }
    setNormalMap(tex, sampler, texCoordIndex, texTransform) {
        this.setTextureOptions(TEX_NAME_NORMAL, tex, sampler, texCoordIndex, texTransform);
    }
    get normalScale() {
        return this._normalScale;
    }
    set normalScale(val) {
        if (val !== this._normalScale) {
            this._normalScale = val;
            if (this.normalMap) {
                this.optionChanged(false);
            }
        }
    }
    get emissiveMap() {
        return this._textureOptions[TEX_NAME_EMISSIVE]?.texture ?? null;
    }
    get emissiveSampler() {
        return this._textureOptions[TEX_NAME_EMISSIVE]?.sampler ?? null;
    }
    get emissiveMapTexCoord() {
        return this._textureOptions[TEX_NAME_EMISSIVE]?.texCoordIndex ?? null;
    }
    setEmissiveMap(tex, sampler, texCoordIndex, texTransform) {
        this.setTextureOptions(TEX_NAME_EMISSIVE, tex, sampler, texCoordIndex, texTransform);
    }
    get emissiveColor() {
        return this._emissiveFactor.xyz();
    }
    set emissiveColor(val) {
        if (val.x !== this._emissiveFactor.x || val.y !== this._emissiveFactor.y || val.z !== this._emissiveFactor.z) {
            this._emissiveFactor.x = val.x;
            this._emissiveFactor.y = val.y;
            this._emissiveFactor.z = val.z;
            this.optionChanged(false);
        }
    }
    get emissiveStrength() {
        return this._emissiveFactor.w;
    }
    set emissiveStrength(val) {
        if (this._emissiveFactor.w !== val) {
            this._emissiveFactor.w = val;
            this.optionChanged(false);
        }
    }
    setTextureOptions(name, tex, sampler, texCoord, texTransform) {
        tex = tex ?? null;
        let info = this._textureOptions[name];
        if (!tex) {
            if (info) {
                delete this._textureOptions[name];
                this.optionChanged(true);
            }
            return;
        }
        if (!info) {
            info = {
                texture: null,
                texCoordIndex: null,
                sampler: null
            };
            this._textureOptions[name] = info;
        }
        sampler = sampler ?? null;
        texTransform = texTransform || identTexTransform;
        let uniformChanged = false;
        let hashChanged = false;
        if (info.texture !== tex) {
            hashChanged ||= (!info.texture || !tex);
            info.texture = tex;
        }
        if (info.sampler !== sampler) {
            uniformChanged ||= !!info.texture;
            info.sampler = sampler;
        }
        const index = this.addTexCoordChannel(texCoord, texTransform);
        if (index !== info.texCoordIndex) {
            info.texCoordIndex = index;
            uniformChanged ||= !!info.texture;
        }
        if (uniformChanged || hashChanged) {
            this.optionChanged(hashChanged);
        }
    }
    calculateHash() {
        const texChannelHash = this._texCoordChannels.map(val => val.srcLocation).join('');
        const albedoHash = this.albedoMap ? this.albedoMapTexCoord + 1 : 0;
        const normalHash = this.normalMap ? this.normalMapTexCoord + 1 : 0;
        const emissiveHash = this.emissiveMap ? this.emissiveMapTexCoord + 1 : 0;
        return `${texChannelHash}_${albedoHash}_${normalHash}_${emissiveHash}`;
    }
    setupUniforms(scope, ctx) {
        if (ctx.materialFunc === MATERIAL_FUNC_NORMAL) {
            const pb = scope.$builder;
            const that = this;
            if (pb.shaderType === ShaderType.Vertex) {
                for (let i = 0; i < that._texCoordChannels.length; i++) {
                    scope[`lm_texTransform${i}`] = pb.mat4().uniform(2);
                }
            }
            else {
                scope.lm_albedo = pb.vec4().uniform(2).tag(LightModel.uniformAlbedoColor);
                if (this.normalMap) {
                    scope.lm_normalScale = pb.float().uniform(2).tag(LightModel.uniformNormalScale);
                }
                scope.lm_emissiveFactor = pb.vec4().uniform(2).tag(LightModel.uniformEmissiveFactor);
                this.setupTextureUniforms(scope);
            }
        }
    }
    applyUniforms(bindGroup, ctx) {
        if (ctx.materialFunc === MATERIAL_FUNC_NORMAL) {
            for (let i = 0; i < this._texCoordChannels.length; i++) {
                bindGroup.setValue(`lm_texTransform${i}`, this._texCoordChannels[i].transform);
            }
            bindGroup.setValue('lm_albedo', this._albedo);
            if (this.normalMap) {
                bindGroup.setValue('lm_normalScale', this._normalScale);
            }
            bindGroup.setValue('lm_emissiveFactor', this._emissiveFactor);
            this.applyTextureUniforms(bindGroup);
        }
    }
    getSurfaceData(scope, envLight, worldPos, worldNormal, worldTangent, worldBinormal) {
        const funcNameGetSurfaceData = 'lib_getSurfaceData';
        const pb = scope.$builder;
        const that = this;
        const args = [worldPos.xyz];
        if (!pb.getFunction(funcNameGetSurfaceData)) {
            const params = [pb.vec3('worldPos')];
            if (worldNormal) {
                params.push(pb.vec3('worldNormal'));
                args.push(worldNormal);
                if (worldTangent) {
                    params.push(pb.vec3('worldTangent'), pb.vec3('worldBinormal'));
                    args.push(worldTangent, worldBinormal);
                }
            }
            pb.globalScope.$function(funcNameGetSurfaceData, params, function () {
                this.$l.surfaceData = pb.defineStructByType(that.getSurfaceDataType(envLight))();
                this.$l.normalInfo = that.calculateNormal(this, this.worldPos, worldNormal ? this.worldNormal : null, worldTangent ? this.worldTangent : null, worldTangent ? this.worldBinormal : null);
                this.surfaceData.TBN = this.normalInfo.TBN;
                this.surfaceData.normal = this.normalInfo.normal;
                this.surfaceData.viewVec = pb.normalize(pb.sub(pb.queryGlobal(ShaderLib.USAGE_CAMERA_POSITION), this.worldPos));
                this.surfaceData.NdotV = pb.clamp(pb.dot(this.surfaceData.normal, this.surfaceData.viewVec), 0.0001, 1);
                this.surfaceData.diffuse = that.calculateAlbedo(this);
                this.surfaceData.accumDiffuse = pb.vec3(0);
                this.surfaceData.accumSpecular = pb.vec3(0);
                this.surfaceData.accumEmissive = that.calculateEmissive(this);
                this.surfaceData.accumColor = pb.vec3(0);
                that.fillSurfaceData(this, envLight, this.surfaceData);
                this.$return(this.surfaceData);
            });
        }
        return pb.globalScope[funcNameGetSurfaceData](...args);
    }
    getTextureUniformName(key) {
        return `lm_${key}_Map`;
    }
    calculateTexCoord(scope, index) {
        return scope.$builder.mul(scope[`lm_texTransform${index}`], scope.$builder.vec4(scope.$inputs[`texcoord${this._texCoordChannels[index].srcLocation}`], 0, 1)).xy;
    }
    calculateEmissive(scope) {
        const pb = scope.$builder;
        const emissiveMap = scope[this.getTextureUniformName(TEX_NAME_EMISSIVE)];
        const emissiveFactor = pb.queryGlobal(LightModel.uniformEmissiveFactor);
        if (emissiveFactor) {
            const emissiveColor = pb.mul(emissiveFactor.rgb, emissiveFactor.a);
            if (emissiveMap) {
                const emissiveTexCoord = scope.$inputs[`texcoord${this.emissiveMapTexCoord}`];
                return pb.mul(pb.textureSample(emissiveMap, emissiveTexCoord).rgb, emissiveColor).rgb;
            }
            else {
                return emissiveColor;
            }
        }
        else {
            return pb.vec3(0);
        }
    }
    calculateAlbedo(scope) {
        const that = this;
        const pb = scope.$builder;
        if (!pb.getFunction(LightModel.funcNameCalcAlbedo)) {
            pb.globalScope.$function(LightModel.funcNameCalcAlbedo, [], function () {
                const diffuseMap = this[that.getTextureUniformName(TEX_NAME_ALBEDO)];
                const texCoord = diffuseMap && this.$inputs[`texcoord${that.albedoMapTexCoord}`];
                const vertexColor = pb.queryGlobal(ShaderLib.USAGE_VERTEX_COLOR);
                let val = pb.queryGlobal(LightModel.uniformAlbedoColor);
                if (diffuseMap && texCoord) {
                    const tex = pb.textureSample(diffuseMap, texCoord);
                    val = pb.mul(val, tex);
                }
                if (vertexColor) {
                    val = pb.mul(val, vertexColor);
                }
                this.$return(val);
            });
        }
        return pb.globalScope[LightModel.funcNameCalcAlbedo]();
    }
    calculateNormal(scope, worldPosition, worldNormal, worldTangent, worldBinormal) {
        return this.calculatePixelNormal(scope, this.calculateTBN(scope, worldPosition, worldNormal, worldTangent, worldBinormal));
    }
    finalComposite(scope, surfaceData) {
        const funcNameFinalComposite = 'lib_finalComposite';
        const pb = scope.$builder;
        const that = this;
        if (!pb.getFunction(funcNameFinalComposite)) {
            pb.globalScope.$function(funcNameFinalComposite, [pb.struct(surfaceData.getTypeName(), 'surfaceData')], function () {
                this.surfaceData.accumColor = pb.add(this.surfaceData.accumDiffuse, this.surfaceData.accumSpecular, this.surfaceData.accumEmissive);
                that.compositeSurfaceData(this, this.surfaceData);
                this.$return(this.surfaceData.accumColor);
            });
        }
        return pb.globalScope[funcNameFinalComposite](surfaceData);
    }
    getHash() {
        if (!this._hash) {
            this._hash = `${this.constructor.name}_${this.calculateHash()}`;
        }
        return this._hash;
    }
    compositeSurfaceData(scope, surfaceData) {
    }
    createSurfaceDataType(env) {
        return new PBStructTypeInfo('', 'default', [{
                name: 'diffuse',
                type: typeF32Vec4
            }, {
                name: 'normal',
                type: typeF32Vec3
            }, {
                name: 'viewVec',
                type: typeF32Vec3
            }, {
                name: 'NdotV',
                type: typeF32
            }, {
                name: 'TBN',
                type: typeMat3
            }, {
                name: 'accumDiffuse',
                type: typeF32Vec3
            }, {
                name: 'accumSpecular',
                type: typeF32Vec3
            }, {
                name: 'accumEmissive',
                type: typeF32Vec3
            }, {
                name: 'accumColor',
                type: typeF32Vec3
            }]);
    }
    isTextureUsed(name) {
        return !!this._textureOptions[name]?.texture;
    }
    fillSurfaceData(scope, envLight, surfaceData) {
    }
    applyTextureUniforms(bindGroup) {
        for (const k in this._textureOptions) {
            if (this.isTextureUsed(k)) {
                const uniformName = this.getTextureUniformName(k);
                const info = this._textureOptions[k];
                bindGroup.setTexture(uniformName, info.texture, info.sampler);
            }
        }
    }
    setupTextureUniforms(scope) {
        const pb = scope.$builder;
        for (const k in this._textureOptions) {
            if (this.isTextureUsed(k)) {
                const uniformName = this.getTextureUniformName(k);
                const texture = this._textureOptions[k].texture;
                let exp;
                if (texture.isTexture2D()) {
                    exp = pb.tex2D().uniform(2);
                }
                else if (texture.isTextureCube()) {
                    exp = pb.texCube().uniform(2);
                }
                else if (texture.isTexture3D()) {
                    exp = pb.tex3D().uniform(2);
                }
                else if (texture.isTexture2DArray()) {
                    exp = pb.tex2DArray().uniform(2);
                }
                else if (texture.isTextureVideo()) {
                    exp = pb.texExternal().uniform(2);
                }
                else {
                    throw new Error('Unsupported light model texture type');
                }
                if (!texture.isFilterable()) {
                    exp.sampleType('unfilterable-float');
                }
                scope[uniformName] = exp;
            }
        }
    }
    addTexCoordChannel(srcLocation, transform) {
        transform = transform || Matrix4x4.identity();
        let index = this._texCoordChannels.findIndex(val => val.srcLocation === srcLocation && val.transform.equalsTo(transform));
        if (index < 0) {
            index = this._texCoordChannels.length;
            this._texCoordChannels.push({
                srcLocation,
                transform: new Matrix4x4(transform)
            });
        }
        return index;
    }
    calculatePixelNormal(scope, TBN) {
        const funcNameCalculatePixelNormal = 'lib_calculatePixelNormal';
        const pb = scope.$builder;
        const that = this;
        if (!pb.getFunction(funcNameCalculatePixelNormal)) {
            pb.globalScope.$function(funcNameCalculatePixelNormal, [pb.mat3('TBN')], function () {
                if (that.normalMap) {
                    this.$l.normalScale = pb.queryGlobal(ShaderLib.USAGE_NORMAL_SCALE) || pb.float(1);
                    this.$l.normalTex = pb.sub(pb.mul(pb.textureSample(this[that.getTextureUniformName(TEX_NAME_NORMAL)], this.$inputs[`texcoord${that.normalMapTexCoord}`]).rgb, 2), pb.vec3(1));
                    this.$l.normalTex = pb.mul(this.normalTex, pb.vec3(this.normalScale, this.normalScale, 1));
                    this.$l.pixelNormal = pb.normalize(pb.mul(this.TBN, this.normalTex));
                }
                else {
                    this.$l.pixelNormal = this.TBN[2];
                }
                this.$return(pb.defineStruct('', 'default', pb.mat3('TBN'), pb.vec3('normal'))(this.TBN, this.pixelNormal));
            });
        }
        return pb.globalScope[funcNameCalculatePixelNormal](TBN);
    }
    calculateTBN(scope, worldPosition, worldNormal, worldTangent, worldBinormal) {
        const funcNameCalculateTBN = 'lib_calculateTBN';
        const pb = scope.$builder;
        const that = this;
        if (!pb.getFunction(funcNameCalculateTBN)) {
            const params = [pb.vec3('posW')];
            if (worldNormal) {
                params.push(pb.vec3('normalW'));
            }
            if (worldTangent) {
                params.push(pb.vec3('tangentW'));
                params.push(pb.vec3('binormalW'));
            }
            pb.globalScope.$function(funcNameCalculateTBN, params, function () {
                this.$l.UV = that.normalMap
                    ? scope.$inputs[`texcoord${that.normalMapTexCoord}`]
                    : that.albedoMap
                        ? scope.$inputs[`texcoord${that.albedoMapTexCoord}`]
                        : pb.vec2(0);
                this.$l.uv_dx = pb.dpdx(pb.vec3(this.UV, 0));
                this.$l.uv_dy = pb.dpdy(pb.vec3(this.UV, 0));
                this.$if(pb.lessThanEqual(pb.add(pb.length(this.uv_dx), pb.length(this.uv_dy)), 0.000001), function () {
                    this.uv_dx = pb.vec3(1, 0, 0);
                    this.uv_dy = pb.vec3(0, 1, 0);
                });
                this.$l.t_ = pb.div(pb.sub(pb.mul(pb.dpdx(this.posW), this.uv_dy.y), pb.mul(pb.dpdy(this.posW), this.uv_dx.y)), pb.sub(pb.mul(this.uv_dx.x, this.uv_dy.y), pb.mul(this.uv_dx.y, this.uv_dy.x)));
                this.$l.n = pb.vec3();
                this.$l.t = pb.vec3();
                this.$l.b = pb.vec3();
                this.$l.ng = pb.vec3();
                if (worldNormal) {
                    if (worldTangent) {
                        this.t = pb.normalize(this.tangentW);
                        this.b = pb.normalize(this.binormalW);
                        this.ng = pb.normalize(this.normalW);
                    }
                    else {
                        this.ng = pb.normalize(this.normalW);
                        this.t = pb.normalize(pb.sub(this.t_, pb.mul(this.ng, pb.dot(this.ng, this.t_))));
                        this.b = pb.cross(this.ng, this.t);
                    }
                }
                else {
                    this.ng = pb.normalize(pb.cross(pb.dpdx(this.posW), pb.dpdy(this.posW)));
                    this.t = pb.normalize(pb.sub(this.t_, pb.mul(this.ng, pb.dot(this.ng, this.t_))));
                    this.b = pb.cross(this.ng, this.t);
                }
                this.$if(pb.not(this.$builtins.frontFacing), function () {
                    this.t = pb.mul(this.t, -1);
                    this.b = pb.mul(this.b, -1);
                    this.ng = pb.mul(this.ng, -1);
                });
                this.$return(pb.mat3(this.t, this.b, this.ng));
            });
        }
        const params = [worldPosition];
        if (worldNormal) {
            params.push(worldNormal);
        }
        if (worldTangent) {
            params.push(worldTangent);
            params.push(worldBinormal);
        }
        return pb.globalScope[funcNameCalculateTBN](...params);
    }
    optionChanged(changeHash) {
        this._uniformVersion++;
        if (changeHash) {
            this._hash = null;
            this._surfaceDataType = null;
            this._hashVersion++;
        }
    }
    isTexCoordIndexUsed(texCoordIndex) {
        return typeof this._texCoordChannels[texCoordIndex]?.srcLocation === 'number';
    }
    isTexCoordSrcLocationUsed(loc) {
        return this._texCoordChannels.findIndex(val => val.srcLocation === loc) >= 0;
    }
    getTexCoordSrcLocation(texCoordIndex) {
        return this._texCoordChannels[texCoordIndex].srcLocation;
    }
    isNormalUsed() {
        return true;
    }
    applyUniformsIfOutdated(bindGroup, ctx) {
        const tags = this._bindGroupTagList.get(bindGroup);
        if (!tags || tags[0] !== this._uniformVersion || tags[1] !== bindGroup.cid) {
            if (tags) {
                tags[0] = this._uniformVersion;
                tags[1] = bindGroup.cid;
            }
            else {
                this._bindGroupTagList.set(bindGroup, [this._uniformVersion, bindGroup.cid]);
            }
            this.applyUniforms(bindGroup, ctx);
        }
    }
}
class UnlitLightModel extends LightModel {
    static funcNameBRDFUnlit = 'libLM_brdfUnlit';
    supportLighting() {
        return false;
    }
    envBRDF(envLight, scope, surfaceData) {
    }
    directBRDF(scope, surfaceData, lightDir, attenuation) {
    }
    isNormalUsed() {
        return false;
    }
    compositeSurfaceData(scope, surfaceData) {
        surfaceData.accumColor = this.calculateAlbedo(scope);
    }
}
class LambertLightModel extends LightModel {
    static funcNameBRDFEnvConstantAmbient = 'lib_lambertLM_envConstantAmbient';
    static funcNameBRDFEnvIBL = 'lib_lambertLM_envIBL';
    static funcNameBRDFDirect = 'lib_lambertLM_direct';
    supportLighting() {
        return true;
    }
    envBRDF(envLight, scope, surfaceData) {
        const pb = scope.$builder;
        if (envLight.isConstant()) {
            if (!pb.getFunction(LambertLightModel.funcNameBRDFEnvConstantAmbient)) {
                pb.globalScope.$function(LambertLightModel.funcNameBRDFEnvConstantAmbient, [pb.struct(surfaceData.getTypeName(), 'surfaceData')], function () {
                    this.surfaceData.accumDiffuse = pb.add(this.surfaceData.accumDiffuse, pb.mul(pb.queryGlobal(EnvConstantAmbient.USAGE_CONSTANT_AMBIENT_LIGHTING).rgb, this.surfaceData.diffuse.rgb));
                });
            }
            pb.globalScope[LambertLightModel.funcNameBRDFEnvConstantAmbient](surfaceData);
        }
        else if (envLight.isIBL()) {
            if (!pb.getFunction(LambertLightModel.funcNameBRDFEnvIBL)) {
                pb.globalScope.$function(LambertLightModel.funcNameBRDFEnvIBL, [pb.struct(surfaceData.getTypeName(), 'surfaceData')], function () {
                    this.$l.irradiance = pb.mul(pb.textureSample(pb.queryGlobal(EnvIBL.USAGE_IBL_IRRADIANCE_MAP), this.surfaceData.normal).rgb, this.surfaceData.diffuse.rgb);
                    this.surfaceData.accumDiffuse = pb.add(this.surfaceData.accumDiffuse, pb.mul(this.irradiance, pb.queryGlobal(ShaderLib.USAGE_ENV_LIGHT_STRENGTH)));
                });
            }
            pb.globalScope[LambertLightModel.funcNameBRDFEnvIBL](surfaceData);
        }
    }
    directBRDF(scope, surfaceData, lightDir, attenuation) {
        const pb = scope.$builder;
        if (!pb.getFunction(LambertLightModel.funcNameBRDFDirect)) {
            pb.globalScope.$function(LambertLightModel.funcNameBRDFDirect, [pb.struct(surfaceData.getTypeName(), 'surfaceData'), pb.vec3('attenuation')], function () {
                this.surfaceData.accumDiffuse = pb.add(this.surfaceData.accumDiffuse, pb.mul(this.surfaceData.diffuse.rgb, this.attenuation));
            });
        }
        pb.globalScope[LambertLightModel.funcNameBRDFDirect](surfaceData, attenuation);
    }
}
class PBRLightModelBase extends LightModel {
    static funcNameFresnelSchlick = 'lib_PBRLM_fresnelSchlick';
    static funcNameDistributionGGX = 'lib_PBRLM_distributionGGX';
    static funcNameVisGGX = 'lib_PBRLM_visGGX';
    static funcNameCalcPBRLight = 'lib_PBRLM_calcPBRLight';
    static funcNameIllumEnvLight = 'lib_PBRLM_illumEnvLight_pbr';
    static funcNameFresnelSchlickRoughness = 'lib_PBRLM_fresnelSchlickRoughness';
    static funcNameEnvDFGLazarov = 'lib_PBRLM_envDFGLazarov';
    static funcNameBRDFEnvConstantAmbient = 'PBRLM_envConstantAmbient';
    static uniformF0 = 'PBRLM_f0';
    static uniformOcclusionStrength = 'PBRLM_occlusionStrength';
    static uniformSheenFactor = 'lib_PBRLM_sheenFactor';
    static uniformClearcoatFactor = 'lib_PBRLM_clearcoatFactor';
    static uniformClearcoatNormalScale = 'lib_PBRLM_clearcoatNormalScale';
    _f0;
    _occlusionStrength;
    _sheen;
    _sheenFactor;
    _clearcoat;
    _clearcoatFactor;
    constructor() {
        super();
        this._f0 = new Vector4(0.04, 0.04, 0.04, 1.5);
        this._sheen = false;
        this._sheenFactor = Vector4.zero();
        this._clearcoat = false;
        this._clearcoatFactor = new Vector4(0, 0, 1, 0);
        this._occlusionStrength = 1;
    }
    get ior() {
        return this._f0.w;
    }
    set ior(val) {
        if (val !== this._f0.w) {
            let k = (val - 1) / (val + 1);
            k *= k;
            this._f0.set(k, k, k, val);
            this.optionChanged(false);
        }
    }
    get occlusionStrength() {
        return this._occlusionStrength;
    }
    set occlusionStrength(val) {
        if (this._occlusionStrength !== val) {
            this._occlusionStrength = val;
            if (this.occlusionMap) {
                this.optionChanged(false);
            }
        }
    }
    get occlusionMap() {
        return this._textureOptions[TEX_NAME_OCCLUSION]?.texture ?? null;
    }
    get occlusionSampler() {
        return this._textureOptions[TEX_NAME_OCCLUSION]?.sampler ?? null;
    }
    get occlusionMapTexCoord() {
        return this._textureOptions[TEX_NAME_OCCLUSION]?.texCoordIndex ?? null;
    }
    setOcclusionMap(tex, sampler, texCoordIndex, texTransform) {
        this.setTextureOptions(TEX_NAME_OCCLUSION, tex, sampler, texCoordIndex, texTransform);
    }
    get useSheen() {
        return this._sheen;
    }
    set useSheen(val) {
        if (this._sheen !== !!val) {
            this._sheen = !!val;
            this.optionChanged(true);
        }
    }
    get sheenColorFactor() {
        return this._sheenFactor.xyz();
    }
    set sheenColorFactor(val) {
        if (val.x !== this._sheenFactor.x || val.y !== this._sheenFactor.y || val.z !== this._sheenFactor.z) {
            this._sheenFactor.x = val.x;
            this._sheenFactor.y = val.y;
            this._sheenFactor.z = val.z;
            if (this._sheen) {
                this.optionChanged(false);
            }
        }
    }
    get sheenRoughnessFactor() {
        return this._sheenFactor.w;
    }
    set sheenRoughnessFactor(val) {
        if (val !== this._sheenFactor.w) {
            this._sheenFactor.w = val;
            if (this._sheen) {
                this.optionChanged(false);
            }
        }
    }
    get sheenLut() {
        return this._textureOptions[TEX_NAME_SHEEN_LUT]?.texture ?? null;
    }
    setSheenLut(tex) {
        this.setTextureOptions(TEX_NAME_SHEEN_LUT, tex, null, 0, null);
    }
    get sheenColorMap() {
        return this._textureOptions[TEX_NAME_SHEEN_COLOR]?.texture ?? null;
    }
    get sheenColorSampler() {
        return this._textureOptions[TEX_NAME_SHEEN_COLOR]?.sampler ?? null;
    }
    get sheenColorMapTexCoord() {
        return this._textureOptions[TEX_NAME_SHEEN_COLOR]?.texCoordIndex ?? null;
    }
    setSheenColorMap(tex, sampler, texCoordIndex, texTransform) {
        this.setTextureOptions(TEX_NAME_SHEEN_COLOR, tex, sampler, texCoordIndex, texTransform);
    }
    get sheenRoughnessMap() {
        return this._textureOptions[TEX_NAME_SHEEN_ROUGHNESS]?.texture ?? null;
    }
    get sheenRoughnessSampler() {
        return this._textureOptions[TEX_NAME_SHEEN_ROUGHNESS]?.sampler ?? null;
    }
    get sheenRoughnessMapTexCoord() {
        return this._textureOptions[TEX_NAME_SHEEN_ROUGHNESS]?.texCoordIndex ?? null;
    }
    setSheenRoughnessMap(tex, sampler, texCoordIndex, texTransform) {
        this.setTextureOptions(TEX_NAME_SHEEN_ROUGHNESS, tex, sampler, texCoordIndex, texTransform);
    }
    get useClearcoat() {
        return this._clearcoat;
    }
    set useClearcoat(val) {
        if (this._clearcoat !== !!val) {
            this._clearcoat = !!val;
            this.optionChanged(true);
        }
    }
    get clearcoatIntensity() {
        return this._clearcoatFactor.x;
    }
    set clearcoatIntensity(val) {
        if (val !== this._clearcoatFactor.x) {
            this._clearcoatFactor.x = val;
            if (this._clearcoat) {
                this.optionChanged(false);
            }
        }
    }
    get clearcoatRoughnessFactor() {
        return this._clearcoatFactor.y;
    }
    set clearcoatRoughnessFactor(val) {
        if (val !== this._clearcoatFactor.y) {
            this._clearcoatFactor.y = val;
            if (this._clearcoat) {
                this.optionChanged(false);
            }
        }
    }
    get clearcoatNormalScale() {
        return this._clearcoatFactor.z;
    }
    set clearcoatNormalScale(val) {
        if (val !== this._clearcoatFactor.z) {
            this._clearcoatFactor.z = val;
            if (this._clearcoat) {
                this.optionChanged(false);
            }
        }
    }
    get clearcoatIntensityMap() {
        return this._textureOptions[TEX_NAME_CLEARCOAT_INTENSITY]?.texture ?? null;
    }
    get clearcoatIntensitySampler() {
        return this._textureOptions[TEX_NAME_CLEARCOAT_INTENSITY]?.sampler ?? null;
    }
    get clearcoatIntensityMapTexCoord() {
        return this._textureOptions[TEX_NAME_CLEARCOAT_INTENSITY]?.texCoordIndex ?? null;
    }
    setClearcoatIntensityMap(tex, sampler, texCoordIndex, texTransform) {
        this.setTextureOptions(TEX_NAME_CLEARCOAT_INTENSITY, tex, sampler, texCoordIndex, texTransform);
    }
    get clearcoatRoughnessMap() {
        return this._textureOptions[TEX_NAME_CLEARCOAT_ROUGHNESS]?.texture ?? null;
    }
    get clearcoatRoughnessSampler() {
        return this._textureOptions[TEX_NAME_CLEARCOAT_ROUGHNESS]?.sampler ?? null;
    }
    get clearcoatRoughnessMapTexCoord() {
        return this._textureOptions[TEX_NAME_CLEARCOAT_ROUGHNESS]?.texCoordIndex ?? null;
    }
    setClearcoatRoughnessMap(tex, sampler, texCoordIndex, texTransform) {
        this.setTextureOptions(TEX_NAME_CLEARCOAT_ROUGHNESS, tex, sampler, texCoordIndex, texTransform);
    }
    get clearcoatNormalMap() {
        return this._textureOptions[TEX_NAME_CLEARCOAT_NORMAL]?.texture ?? null;
    }
    get clearcoatNormalSampler() {
        return this._textureOptions[TEX_NAME_CLEARCOAT_NORMAL]?.sampler ?? null;
    }
    get clearcoatNormalMapTexCoord() {
        return this._textureOptions[TEX_NAME_CLEARCOAT_NORMAL]?.texCoordIndex ?? null;
    }
    setClearcoatNormalMap(tex, sampler, texCoordIndex, texTransform) {
        this.setTextureOptions(TEX_NAME_CLEARCOAT_NORMAL, tex, sampler, texCoordIndex, texTransform);
    }
    applyUniforms(bindGroup, ctx) {
        super.applyUniforms(bindGroup, ctx);
        if (ctx.materialFunc === MATERIAL_FUNC_NORMAL) {
            bindGroup.setValue('lm_f0', this._f0);
            if (this.occlusionMap) {
                bindGroup.setValue('lm_occlusionStrength', this._occlusionStrength);
            }
            if (this._sheen) {
                bindGroup.setValue('lm_sheenFactor', this._sheenFactor);
            }
            if (this._clearcoat) {
                bindGroup.setValue('lm_clearcoatFactor', this._clearcoatFactor);
            }
        }
    }
    calculateHash() {
        const occlusionHash = this.occlusionMap ? this.occlusionMapTexCoord + 1 : 0;
        const ccIntensityHash = this.clearcoatIntensityMap ? this.clearcoatIntensityMapTexCoord + 1 : 0;
        const ccRoughnessHash = this.clearcoatRoughnessMap ? this.clearcoatRoughnessMapTexCoord + 1 : 0;
        const ccNormalHash = this.clearcoatNormalMap ? this.clearcoatNormalMapTexCoord + 1 : 0;
        const ccHash = this.useClearcoat ? `(${ccIntensityHash}-${ccRoughnessHash}-${ccNormalHash})` : '';
        const sheenColorHash = this.sheenColorMap ? this.sheenColorMapTexCoord + 1 : 0;
        const sheenRoughnessHash = this.sheenRoughnessMap ? this.sheenRoughnessMapTexCoord + 1 : 0;
        const sheenHash = this.useSheen ? `(${sheenColorHash}-${sheenRoughnessHash})` : '';
        return `${super.calculateHash()}_${occlusionHash}_${sheenHash}_${ccHash}`;
    }
    setupUniforms(scope, ctx) {
        super.setupUniforms(scope, ctx);
        if (ctx.materialFunc === MATERIAL_FUNC_NORMAL) {
            if (scope.$builder.shaderType === ShaderType.Fragment) {
                scope.lm_f0 = scope.$builder.vec4().uniform(2).tag(PBRLightModelBase.uniformF0);
                if (this.occlusionMap) {
                    scope.lm_occlusionStrength = scope.$builder.float().uniform(2).tag(PBRLightModelBase.uniformOcclusionStrength);
                }
                if (this._sheen) {
                    scope.lm_sheenFactor = scope.$builder.vec4().uniform(2).tag(PBRLightModelBase.uniformSheenFactor);
                }
                if (this._clearcoat) {
                    scope.lm_clearcoatFactor = scope.$builder.vec4().uniform(2).tag(PBRLightModelBase.uniformClearcoatFactor);
                }
            }
        }
    }
    createSurfaceDataType(env) {
        const type = super.createSurfaceDataType(env);
        const props = [{
                name: 'f0',
                type: typeF32Vec4,
            }, {
                name: 'f90',
                type: typeF32Vec3,
            }, {
                name: 'occlusion',
                type: typeF32Vec4,
            }];
        if (this._sheen) {
            props.push({
                name: 'sheenColor',
                type: typeF32Vec3,
            }, {
                name: 'sheenRoughness',
                type: typeF32,
            }, {
                name: 'sheenAlbedoScaling',
                type: typeF32,
            }, {
                name: 'sheenContrib',
                type: typeF32Vec3,
            });
        }
        if (this._clearcoat) {
            props.push({
                name: 'clearcoatFactor',
                type: typeF32Vec4,
            }, {
                name: 'clearcoatNormal',
                type: typeF32Vec3,
            }, {
                name: 'clearcoatNdotV',
                type: typeF32,
            }, {
                name: 'clearcoatFresnel',
                type: typeF32Vec3,
            }, {
                name: 'clearcoatContrib',
                type: typeF32Vec3,
            });
        }
        if (env?.isIBL()) {
            props.push({
                name: 'irradiance',
                type: typeF32Vec3,
            }, {
                name: 'radiance',
                type: typeF32Vec3,
            });
            if (this._sheen) {
                props.push({
                    name: 'radianceSheen',
                    type: typeF32Vec3
                });
            }
            if (this._clearcoat) {
                props.push({
                    name: 'radianceClearcoat',
                    type: typeF32Vec3
                });
            }
        }
        return props.length > 0 ? type.extends('', props) : type;
    }
    fillSurfaceData(scope, envLight, surfaceData) {
        super.fillSurfaceData(scope, envLight, surfaceData);
        const funcNameFillSurfaceDataPBRCommon = 'lib_fillSurfaceDataPBRCommon';
        const pb = scope.$builder;
        const that = this;
        if (!pb.getFunction(funcNameFillSurfaceDataPBRCommon)) {
            pb.globalScope.$function(funcNameFillSurfaceDataPBRCommon, [pb.struct(surfaceData.getTypeName(), 'surfaceData')], function () {
                this.surfaceData.f0 = pb.queryGlobal(PBRLightModelBase.uniformF0);
                this.surfaceData.f90 = pb.vec3(1);
                const strength = pb.queryGlobal(ShaderLib.USAGE_ENV_LIGHT_STRENGTH);
                if (that.occlusionMap) {
                    const occlusionStrength = pb.queryGlobal(PBRLightModelBase.uniformOcclusionStrength);
                    const texCoord = this.$inputs[`texcoord${that.occlusionMapTexCoord ?? that.albedoMapTexCoord}`];
                    this.surfaceData.occlusion = pb.textureSample(this[that.getTextureUniformName(TEX_NAME_OCCLUSION)], texCoord);
                    this.surfaceData.occlusion.r = pb.mul(pb.add(pb.mul(occlusionStrength, pb.sub(this.surfaceData.occlusion.r, 1)), 1), strength);
                }
                else {
                    this.surfaceData.occlusion = pb.vec4(strength);
                }
                if (that.useClearcoat) {
                    this.surfaceData.clearcoatFactor = pb.queryGlobal(PBRLightModelBase.uniformClearcoatFactor);
                    if (that.clearcoatNormalMap) {
                        const clearcoatNormalMap = this[that.getTextureUniformName(TEX_NAME_CLEARCOAT_NORMAL)];
                        const texCoord = this.$inputs[`texcoord${that.clearcoatNormalMapTexCoord ?? that.albedoMapTexCoord}`];
                        this.$l.ccNormal = pb.sub(pb.mul(pb.textureSample(clearcoatNormalMap, texCoord).rgb, 2), pb.vec3(1));
                        this.ccNormal = pb.mul(this.ccNormal, pb.vec3(this.surfaceData.clearcoatFactor.z, this.surfaceData.clearcoatFactor.z, 1));
                        this.surfaceData.clearcoatNormal = pb.normalize(pb.mul(this.surfaceData.TBN, this.ccNormal));
                        this.surfaceData.clearcoatNdotV = pb.clamp(pb.dot(this.surfaceData.clearcoatNormal, this.surfaceData.viewVec), 0.0001, 1);
                    }
                    else {
                        this.surfaceData.clearcoatNormal = this.surfaceData.TBN[2];
                        this.surfaceData.clearcoatNdotV = this.surfaceData.NdotV;
                    }
                    if (that.clearcoatIntensityMap) {
                        const clearcoatIntensityMap = this[that.getTextureUniformName(TEX_NAME_CLEARCOAT_INTENSITY)];
                        const texCoord = this.$inputs[`texcoord${that.clearcoatIntensityMapTexCoord ?? that.albedoMapTexCoord}`];
                        this.surfaceData.clearcoatFactor.x = pb.mul(this.surfaceData.clearcoatFactor.x, pb.textureSample(clearcoatIntensityMap, texCoord).r);
                    }
                    if (that.clearcoatRoughnessMap) {
                        const clearcoatRoughnessMap = this[that.getTextureUniformName(TEX_NAME_CLEARCOAT_ROUGHNESS)];
                        const texCoord = this.$inputs[`texcoord${that.clearcoatRoughnessMapTexCoord ?? that.albedoMapTexCoord}`];
                        this.surfaceData.clearcoatFactor.y = pb.mul(this.surfaceData.clearcoatFactor.y, pb.textureSample(clearcoatRoughnessMap, texCoord).g);
                    }
                    this.surfaceData.clearcoatFactor.y = pb.clamp(this.surfaceData.clearcoatFactor.y, 0, 1);
                    this.surfaceData.clearcoatContrib = pb.vec3(0);
                }
                if (that._sheen) {
                    this.$l.sheenColor = pb.queryGlobal(PBRLightModelBase.uniformSheenFactor).rgb;
                    this.$l.sheenRoughness = pb.queryGlobal(PBRLightModelBase.uniformSheenFactor).a;
                    if (that.sheenColorMap) {
                        const sheenColorMap = this[that.getTextureUniformName(TEX_NAME_SHEEN_COLOR)];
                        const texCoord = this.$inputs[`texcoord${that.sheenColorMapTexCoord ?? that.albedoMapTexCoord}`];
                        this.$l.sheenColor = pb.mul(this.$l.sheenColor, pb.textureSample(sheenColorMap, texCoord).rgb);
                    }
                    if (that.sheenRoughnessMap) {
                        const sheenRoughnessMap = this[that.getTextureUniformName(TEX_NAME_SHEEN_ROUGHNESS)];
                        const texCoord = this.$inputs[`texcoord${that.sheenRoughnessMapTexCoord ?? that.albedoMapTexCoord}`];
                        this.$l.sheenRoughness = pb.mul(this.$l.sheenRoughness, pb.textureSample(sheenRoughnessMap, texCoord).a);
                    }
                    if (that.sheenLut) {
                        const sheenLut = this[that.getTextureUniformName(TEX_NAME_SHEEN_LUT)];
                        this.$l.sheenDFG = pb.textureSample(sheenLut, pb.vec2(this.surfaceData.NdotV, this.sheenRoughness)).b;
                    }
                    else {
                        this.$l.sheenDFG = 0.157;
                    }
                    this.surfaceData.sheenAlbedoScaling = pb.sub(1, pb.mul(pb.max(pb.max(this.sheenColor.r, this.sheenColor.g), this.sheenColor.b), this.sheenDFG));
                    this.surfaceData.sheenColor = this.sheenColor;
                    this.surfaceData.sheenRoughness = this.sheenRoughness;
                    this.surfaceData.sheenContrib = pb.vec3(0);
                    if (envLight?.isIBL()) {
                        this.surfaceData.radianceSheen = pb.mul(this.sheenColor, this.sheenDFG);
                    }
                }
            });
        }
        pb.globalScope[funcNameFillSurfaceDataPBRCommon](surfaceData);
    }
    fresnelSchlickRoughness(scope, NdotV, F0, roughness) {
        const pb = scope.$builder;
        if (!pb.getFunction(PBRLightModelBase.funcNameFresnelSchlickRoughness)) {
            pb.globalScope.$function(PBRLightModelBase.funcNameFresnelSchlickRoughness, [pb.float('NdotV'), pb.vec3('f0'), pb.float('roughness')], function () {
                this.$return(pb.add(this.f0, pb.mul(pb.sub(pb.max(pb.vec3(pb.sub(1, this.roughness)), this.f0), this.f0), pb.pow(pb.sub(1, this.NdotV), 5))));
            });
        }
        return pb.globalScope[PBRLightModelBase.funcNameFresnelSchlickRoughness](NdotV, F0, roughness);
    }
    envDFGLazarov(scope, specularColor, gloss, NdotV) {
        const pb = scope.$builder;
        if (!pb.getFunction(PBRLightModelBase.funcNameEnvDFGLazarov)) {
            pb.globalScope.$function(PBRLightModelBase.funcNameEnvDFGLazarov, [pb.vec3('specularColor'), pb.float('gloss'), pb.float('NdotV')], function () {
                this.$l.p0 = pb.vec4(0.5745, 1.548, -0.02397, 1.301);
                this.$l.p1 = pb.vec4(0.5753, -0.2511, -0.02066, 0.4755);
                this.$l.t = pb.add(pb.mul(this.p0, this.gloss), this.p1);
                this.$l.bias = pb.clamp(pb.add(pb.mul(this.t.x, pb.min(this.t.y, pb.exp2(pb.mul(-7.672, this.NdotV)))), this.t.z), 0, 1);
                this.$l.delta = pb.clamp(this.t.w, 0, 1);
                this.$l.scale = pb.sub(this.delta, this.bias);
                this.bias = pb.mul(this.bias, pb.clamp(pb.mul(50, this.specularColor.y), 0, 1));
                this.$return(pb.add(pb.mul(this.specularColor, this.scale), pb.vec3(this.bias)));
            });
        }
        return pb.globalScope[PBRLightModelBase.funcNameEnvDFGLazarov](specularColor, gloss, NdotV);
    }
    envDFGUE4(scope, roughness, NdotV) {
        const pb = scope.$builder;
        const funcNameEnvDFGUE4 = 'lib_envDFGUE4';
        if (!pb.getFunction(funcNameEnvDFGUE4)) {
            pb.globalScope.$function(funcNameEnvDFGUE4, [pb.float('roughness'), pb.float('NdotV')], function () {
                this.$l.c0 = pb.vec4(-1, -0.0275, -0.572, 0.022);
                this.$l.c1 = pb.vec4(1, 0.0425, 1.04, -0.04);
                this.$l.r = pb.add(pb.mul(this.c0, this.roughness), this.c1);
                this.$l.a004 = pb.add(pb.mul(pb.min(pb.mul(this.r.x, this.r.x), pb.exp2(pb.mul(this.NdotV, -9.28))), this.r.x), this.r.y);
                this.$return(pb.add(pb.mul(pb.vec2(-1.04, 1.04), this.a004), this.r.zw));
            });
        }
        return pb.globalScope[funcNameEnvDFGUE4](roughness, NdotV);
    }
    illumEnvLight(scope, surfaceData) {
        const pb = scope.$builder;
        const that = this;
        if (!pb.getFunction(PBRLightModelBase.funcNameIllumEnvLight)) {
            pb.globalScope.$function(PBRLightModelBase.funcNameIllumEnvLight, [pb.struct(surfaceData.getTypeName(), 'surfaceData')], function () {
                this.$l.f0 = this.surfaceData.f0.rgb;
                this.$l.F = that.fresnelSchlickRoughness(this, this.surfaceData.NdotV, this.f0, this.surfaceData.roughness);
                this.$l.fab = that.envDFGUE4(this, this.surfaceData.roughness, this.surfaceData.NdotV);
                this.$l.fr = pb.sub(pb.max(pb.vec3(pb.sub(1, this.surfaceData.roughness)), this.f0), this.f0);
                this.$l.kS = pb.add(this.f0, pb.mul(this.fr, pb.pow(pb.sub(1, this.surfaceData.NdotV), 5)));
                this.$l.t = pb.mul(this.kS, this.fab.x);
                this.$l.spec = pb.mul(this.surfaceData.radiance, pb.add(this.t, pb.vec3(this.fab.y)), this.surfaceData.specularWeight);
                if (that._clearcoat) {
                    this.$l.ccF = that.fresnelSchlickRoughness(this, this.surfaceData.clearcoatNdotV, this.f0, this.surfaceData.clearcoatFactor.y);
                    this.$l.ccfab = that.envDFGUE4(this, this.surfaceData.clearcoatFactor.y, this.surfaceData.clearcoatNdotV);
                    this.$l.ccfr = pb.sub(pb.max(pb.vec3(pb.sub(1, this.surfaceData.clearcoatFactor.y)), this.f0), this.f0);
                    this.$l.cckS = pb.add(this.f0, pb.mul(this.ccfr, pb.pow(pb.sub(1, this.surfaceData.clearcoatNdotV), 5)));
                    this.$l.cct = pb.mul(this.cckS, this.ccfab.x);
                    this.$l.ccspec = pb.mul(this.surfaceData.radianceClearcoat, pb.add(this.cct, pb.vec3(this.ccfab.y)));
                    this.surfaceData.clearcoatContrib = pb.add(this.surfaceData.clearcoatContrib, pb.mul(this.ccspec, this.surfaceData.occlusion.r));
                }
                this.$l.FssEss = pb.add(pb.mul(this.t, this.surfaceData.specularWeight), this.fab.y);
                this.$l.Ems = pb.sub(1, pb.add(this.fab.x, this.fab.y));
                this.$l.Favg = pb.mul(pb.add(this.f0, pb.div(pb.sub(pb.vec3(1), this.f0), 21)), this.surfaceData.specularWeight);
                this.$l.FmsEms = pb.mul(this.Ems, this.FssEss, pb.div(this.Favg, pb.sub(pb.vec3(1), pb.mul(this.Favg, this.Ems))));
                this.$l.kD = pb.mul(this.surfaceData.diffuse.rgb, pb.add(pb.sub(pb.vec3(1), this.FssEss), this.FmsEms));
                this.diff = pb.mul(pb.add(this.FmsEms, this.kD), this.surfaceData.irradiance);
                this.surfaceData.accumDiffuse = pb.add(this.surfaceData.accumDiffuse, pb.mul(this.diff, this.surfaceData.occlusion.r));
                this.surfaceData.accumSpecular = pb.add(this.surfaceData.accumSpecular, pb.mul(this.spec, this.surfaceData.occlusion.r));
                if (that._sheen) {
                    this.surfaceData.sheenContrib = pb.add(this.surfaceData.sheenContrib, pb.mul(this.surfaceData.radianceSheen, this.surfaceData.occlusion.r));
                }
            });
        }
        pb.globalScope[PBRLightModelBase.funcNameIllumEnvLight](surfaceData);
    }
    supportLighting() {
        return true;
    }
    envBRDF(envLight, scope, surfaceData) {
        if (envLight.isConstant()) {
            const pb = scope.$builder;
            if (!pb.getFunction(PBRLightModelBase.funcNameBRDFEnvConstantAmbient)) {
                pb.globalScope.$function(PBRLightModelBase.funcNameBRDFEnvConstantAmbient, [pb.struct(surfaceData.getTypeName(), 'surfaceData')], function () {
                    this.surfaceData.accumDiffuse = pb.add(this.surfaceData.accumDiffuse, pb.queryGlobal(EnvConstantAmbient.USAGE_CONSTANT_AMBIENT_LIGHTING).rgb);
                });
            }
            pb.globalScope[PBRLightModelBase.funcNameBRDFEnvConstantAmbient](surfaceData);
        }
        else if (envLight.isIBL()) {
            this.illumEnvLight(scope, surfaceData);
        }
    }
    fresnelSchlick(scope, VdotH, f0, f90) {
        const pb = scope.$builder;
        if (!pb.getFunction(PBRLightModelBase.funcNameFresnelSchlick)) {
            pb.globalScope.$function(PBRLightModelBase.funcNameFresnelSchlick, [pb.float('VdotH'), pb.vec3('F0'), pb.vec3('F90')], function () {
                this.$return(pb.add(this.F0, pb.mul(pb.sub(this.F90, this.F0), pb.pow(pb.clamp(pb.sub(1, this.VdotH), 0, 1), 5))));
            });
        }
        return pb.globalScope[PBRLightModelBase.funcNameFresnelSchlick](VdotH, f0, f90);
    }
    distributionGGX(scope, NdotH, alphaRoughness) {
        const pb = scope.$builder;
        if (!pb.getFunction(PBRLightModelBase.funcNameDistributionGGX)) {
            pb.globalScope.$function(PBRLightModelBase.funcNameDistributionGGX, [pb.float('NdotH'), pb.float('roughness')], function () {
                this.$l.a2 = pb.mul(this.roughness, this.roughness);
                this.$l.NdotH2 = pb.mul(this.NdotH, this.NdotH);
                this.$l.num = this.a2;
                this.$l.denom = pb.add(pb.mul(this.NdotH2, pb.sub(this.a2, 1)), 1);
                this.denom = pb.mul(pb.mul(3.14159265, this.denom), this.denom);
                this.$return(pb.div(this.num, this.denom));
            });
        }
        return pb.globalScope[PBRLightModelBase.funcNameDistributionGGX](NdotH, alphaRoughness);
    }
    visGGX(scope, NdotV, NdotL, alphaRoughness) {
        const pb = scope.$builder;
        if (!pb.getFunction(PBRLightModelBase.funcNameVisGGX)) {
            pb.globalScope.$function(PBRLightModelBase.funcNameVisGGX, [pb.float('NdotV'), pb.float('NdotL'), pb.float('roughness')], function () {
                this.$l.a2 = pb.mul(this.roughness, this.roughness);
                this.$l.ggxV = pb.mul(this.NdotL, pb.sqrt(pb.add(pb.mul(this.NdotV, this.NdotV, pb.sub(1, this.a2)), this.a2)));
                this.$l.ggxL = pb.mul(this.NdotV, pb.sqrt(pb.add(pb.mul(this.NdotL, this.NdotL, pb.sub(1, this.a2)), this.a2)));
                this.$l.ggx = pb.add(this.ggxV, this.ggxL);
                this.$if(pb.greaterThan(this.ggx, 0), function () {
                    this.$return(pb.div(0.5, this.ggx));
                }).$else(function () {
                    this.$return(pb.float(0));
                });
            });
        }
        return pb.globalScope[PBRLightModelBase.funcNameVisGGX](NdotV, NdotL, alphaRoughness);
    }
    directBRDF(scope, surfaceData, lightDir, attenuation) {
        const that = this;
        const pb = scope.$builder;
        if (!pb.getFunction(PBRLightModelBase.funcNameCalcPBRLight)) {
            pb.globalScope.$function(PBRLightModelBase.funcNameCalcPBRLight, [pb.struct(surfaceData.getTypeName(), 'surfaceData'), pb.vec3('lightDir'), pb.vec3('attenuation')], function () {
                this.$l.L = pb.neg(this.lightDir);
                this.$l.halfVec = pb.normalize(pb.sub(this.surfaceData.viewVec, this.lightDir));
                this.$l.NdotH = pb.clamp(pb.dot(this.surfaceData.normal, this.halfVec), 0, 1);
                this.$l.NdotL = pb.clamp(pb.dot(this.surfaceData.normal, this.L), 0, 1);
                this.$l.VdotH = pb.clamp(pb.dot(this.surfaceData.viewVec, this.halfVec), 0, 1);
                this.$l.alphaRoughness = pb.mul(this.surfaceData.roughness, this.surfaceData.roughness);
                this.$l.D = that.distributionGGX(this, this.NdotH, this.alphaRoughness);
                this.$l.f0 = this.surfaceData.f0.rgb;
                this.$l.F = that.fresnelSchlick(this, this.VdotH, this.f0, this.surfaceData.f90);
                this.$l.V = that.visGGX(this, this.surfaceData.NdotV, this.NdotL, this.alphaRoughness);
                this.surfaceData.accumSpecular = pb.add(this.surfaceData.accumSpecular, pb.mul(this.D, this.V, this.F, this.surfaceData.specularWeight, this.attenuation));
                this.surfaceData.accumDiffuse = pb.add(this.surfaceData.accumDiffuse, pb.mul(pb.sub(pb.vec3(1), pb.mul(this.F, this.surfaceData.specularWeight)), pb.div(this.surfaceData.diffuse.rgb, Math.PI), this.attenuation));
                if (that._sheen) {
                    this.surfaceData.sheenContrib = pb.add(this.surfaceData.sheenContrib, pb.mul(that.sheenDirect(this, this.surfaceData, this.NdotL, this.NdotH), this.attenuation));
                }
                if (that._clearcoat) {
                    this.$l.ccRoughness = pb.mul(this.surfaceData.clearcoatFactor.y, this.surfaceData.clearcoatFactor.y);
                    this.$l.ccNdotH = pb.clamp(pb.dot(this.surfaceData.clearcoatNormal, this.halfVec), 0, 1);
                    this.$l.ccNdotL = pb.clamp(pb.dot(this.surfaceData.clearcoatNormal, this.L), 0, 1);
                    this.$l.ccD = that.distributionGGX(this, this.ccNdotH, this.ccRoughness);
                    this.$l.ccV = that.visGGX(this, this.surfaceData.clearcoatNdotV, this.ccNdotL, this.ccRoughness);
                    this.surfaceData.clearcoatContrib = pb.add(this.surfaceData.clearcoatContrib, pb.mul(this.ccD, this.ccV, this.F, this.attenuation));
                }
            });
        }
        pb.globalScope[PBRLightModelBase.funcNameCalcPBRLight](surfaceData, lightDir, attenuation);
    }
    compositeSurfaceData(scope, surfaceData) {
        super.compositeSurfaceData(scope, surfaceData);
        const pb = scope.$builder;
        if (this._sheen) {
            surfaceData.accumColor = pb.add(pb.mul(surfaceData.accumColor, surfaceData.sheenAlbedoScaling), surfaceData.sheenContrib);
        }
        if (this._clearcoat) {
            surfaceData.accumColor = pb.add(pb.mul(surfaceData.accumColor, pb.sub(pb.vec3(1), pb.mul(surfaceData.clearcoatFresnel, surfaceData.clearcoatFactor.x))), pb.mul(surfaceData.clearcoatContrib, surfaceData.clearcoatFactor.x));
        }
    }
    D_Charlie(scope, NdotH, sheenRoughness) {
        const funcNameDCharlie = 'lib_DCharlie';
        const pb = scope.$builder;
        if (!pb.getFunction(funcNameDCharlie)) {
            pb.globalScope.$function(funcNameDCharlie, [pb.float('NdotH'), pb.float('sheenRoughness')], function () {
                this.$l.alphaG = pb.mul(this.sheenRoughness, this.sheenRoughness);
                this.$l.invR = pb.div(1, this.alphaG);
                this.$l.cos2h = pb.mul(this.NdotH, this.NdotH);
                this.$l.sin2h = pb.sub(1, this.cos2h);
                this.$return(pb.div(pb.mul(pb.add(this.invR, 2), pb.pow(this.sin2h, pb.mul(this.invR, 0.5))), 2 * Math.PI));
            });
        }
        return pb.globalScope[funcNameDCharlie](NdotH, sheenRoughness);
    }
    V_Ashikhmin(scope, NdotL, NdotV) {
        const funcNameVAshikhmin = 'lib_VAshikhmin';
        const pb = scope.$builder;
        if (!pb.getFunction(funcNameVAshikhmin)) {
            pb.globalScope.$function(funcNameVAshikhmin, [pb.float('NdotL'), pb.float('NdotV')], function () {
                this.$return(pb.div(1, pb.mul(pb.sub(pb.add(this.NdotL, this.NdotV), pb.mul(this.NdotL, this.NdotV)), 4)));
            });
        }
        return pb.globalScope[funcNameVAshikhmin](NdotL, NdotV);
    }
    sheenDirect(scope, surfaceData, NdotL, NdotH) {
        const D = this.D_Charlie(scope, NdotH, surfaceData.sheenRoughness);
        const V = this.V_Ashikhmin(scope, NdotL, surfaceData.NdotV);
        return scope.$builder.mul(surfaceData.sheenColor, D, V);
    }
}
class PBRLightModelSG extends PBRLightModelBase {
    static uniformSpecularFactor = 'lib_PBRSG_specularFactor';
    static uniformGlossinessFactor = 'lib_PBRSG_glossinessFactor';
    _specularFactor;
    _glossinessFactor;
    constructor() {
        super();
        this._specularFactor = Vector4.one();
        this._glossinessFactor = 1;
    }
    get specularFactor() {
        return this._specularFactor;
    }
    set specularFactor(val) {
        if (val && !this._specularFactor.equalsTo(val)) {
            this._specularFactor.assign(val.getArray());
            this.optionChanged(false);
        }
    }
    get glossinessFactor() {
        return this._glossinessFactor;
    }
    set glossinessFactor(val) {
        if (val !== this._glossinessFactor) {
            this._glossinessFactor = val;
            this.optionChanged(false);
        }
    }
    get specularMap() {
        return this._textureOptions[TEX_NAME_SPECULAR]?.texture ?? null;
    }
    get specularMapTexCoord() {
        return this._textureOptions[TEX_NAME_SPECULAR]?.texCoordIndex ?? null;
    }
    get specularSampler() {
        return this._textureOptions[TEX_NAME_SPECULAR]?.sampler ?? null;
    }
    setSpecularMap(tex, sampler, texCoordIndex, texTransform) {
        this.setTextureOptions(TEX_NAME_SPECULAR, tex, sampler, texCoordIndex, texTransform);
    }
    applyUniforms(bindGroup, ctx) {
        super.applyUniforms(bindGroup, ctx);
        if (ctx.materialFunc === MATERIAL_FUNC_NORMAL) {
            bindGroup.setValue('lm_specularFactor', this._specularFactor);
            bindGroup.setValue('lm_glossinessFactor', this._glossinessFactor);
        }
    }
    calculateHash() {
        return `${super.calculateHash()}_${this.specularMap ? `${this.specularMapTexCoord + 1}` : 0}`;
    }
    setupUniforms(scope, ctx) {
        super.setupUniforms(scope, ctx);
        if (ctx.materialFunc === MATERIAL_FUNC_NORMAL && scope.$builder.shaderType === ShaderType.Fragment) {
            scope.lm_specularFactor = scope.$builder.vec4().uniform(2).tag(PBRLightModelSG.uniformSpecularFactor);
            scope.lm_glossinessFactor = scope.$builder.float().uniform(2).tag(PBRLightModelSG.uniformGlossinessFactor);
        }
    }
    fillSurfaceData(scope, envLight, surfaceData) {
        const funcNameFillSurfaceDataSG = 'lib_fillSurfaceDataSG';
        const that = this;
        const pb = scope.$builder;
        super.fillSurfaceData(scope, envLight, surfaceData);
        if (!pb.getFunction(funcNameFillSurfaceDataSG)) {
            pb.globalScope.$function(funcNameFillSurfaceDataSG, [pb.struct(surfaceData.getTypeName(), 'surfaceData')], function () {
                this.surfaceData.f0 = pb.vec4(pb.queryGlobal(PBRLightModelSG.uniformSpecularFactor).rgb, this.surfaceData.f0.a);
                this.surfaceData.roughness = pb.queryGlobal(PBRLightModelSG.uniformGlossinessFactor);
                if (that.specularMap) {
                    const texCoord = this.$inputs[`texcoord${that.specularMapTexCoord ?? that.albedoMapTexCoord}`];
                    this.$l.t = pb.textureSample(this[that.getTextureUniformName(TEX_NAME_SPECULAR)], texCoord);
                    this.surfaceData.roughness = pb.mul(this.surfaceData.roughness, this.t.a);
                    this.surfaceData.f0 = pb.mul(this.surfaceData.f0, pb.vec4(this.t.rgb, 1));
                }
                this.surfaceData.roughness = pb.sub(1, this.surfaceData.roughness);
                this.surfaceData.metallic = pb.max(pb.max(this.surfaceData.f0.r, this.surfaceData.f0.g), this.surfaceData.f0.b);
                this.surfaceData.diffuse = pb.vec4(pb.mul(this.surfaceData.diffuse.rgb, pb.sub(1, this.surfaceData.metallic)), this.surfaceData.diffuse.a);
                this.surfaceData.specularWeight = pb.float(1);
                if (that._clearcoat) {
                    this.surfaceData.clearcoatFresnel = that.fresnelSchlick(this, this.surfaceData.clearcoatNdotV, this.surfaceData.f0.rgb, this.surfaceData.f90);
                }
                if (envLight?.isIBL()) {
                    this.surfaceData.irradiance = pb.textureSample(pb.queryGlobal(EnvIBL.USAGE_IBL_IRRADIANCE_MAP), this.surfaceData.normal).rgb;
                    this.$l.refl = pb.reflect(pb.neg(this.surfaceData.viewVec), this.surfaceData.normal);
                    this.$l.maxLod = pb.queryGlobal(EnvIBL.USAGE_IBL_RADIANCE_MAP_MAX_LOD);
                    this.surfaceData.radiance = pb.device?.getShaderCaps().supportShaderTextureLod
                        ? pb.textureSampleLevel(pb.queryGlobal(EnvIBL.USAGE_IBL_RADIANCE_MAP), this.refl, pb.mul(this.surfaceData.roughness, this.maxLod)).rgb
                        : pb.textureSample(pb.queryGlobal(EnvIBL.USAGE_IBL_RADIANCE_MAP), this.refl).rgb;
                    if (that.useSheen) {
                        const r = pb.device?.getShaderCaps().supportShaderTextureLod
                            ? pb.textureSampleLevel(pb.queryGlobal(EnvIBL.USAGE_IBL_RADIANCE_MAP), this.refl, pb.mul(this.surfaceData.sheenRoughness, this.maxLod)).rgb
                            : this.surfaceData.radiance;
                        this.surfaceData.radianceSheen = pb.mul(this.surfaceData.radianceSheen, r);
                    }
                    if (that.useClearcoat) {
                        this.$l.ccRefl = pb.reflect(pb.neg(this.surfaceData.viewVec), this.surfaceData.clearcoatNormal);
                        this.surfaceData.radianceClearcoat = pb.device?.getShaderCaps().supportShaderTextureLod
                            ? pb.textureSampleLevel(pb.queryGlobal(EnvIBL.USAGE_IBL_RADIANCE_MAP), this.ccRefl, pb.mul(this.surfaceData.clearcoatFactor.y, this.maxLod)).rgb
                            : this.surfaceData.radiance;
                    }
                }
            });
        }
        pb.globalScope[funcNameFillSurfaceDataSG](surfaceData);
    }
    createSurfaceDataType(env) {
        return super.createSurfaceDataType(env).extends('', [{
                name: 'metallic',
                type: typeF32
            }, {
                name: 'roughness',
                type: typeF32
            }, {
                name: 'specularWeight',
                type: typeF32
            }]);
    }
}
class PBRLightModelMR extends PBRLightModelBase {
    static uniformMetallic = 'lib_PBRLM_metallic';
    static uniformRoughness = 'lib_PBRLM_roughness';
    static uniformSpecularFactor = 'lib_PBRLM_specularFactor';
    _metallic;
    _roughness;
    _metallicIndex;
    _roughnessIndex;
    _specularFactor;
    constructor() {
        super();
        this._metallic = 1;
        this._roughness = 1;
        this._metallicIndex = 2;
        this._roughnessIndex = 1;
        this._specularFactor = Vector4.one();
    }
    get metallic() {
        return this._metallic;
    }
    set metallic(val) {
        if (val !== this._metallic) {
            this._metallic = val;
            this.optionChanged(false);
        }
    }
    get roughness() {
        return this._roughness;
    }
    set roughness(val) {
        if (val !== this._roughness) {
            this._roughness = val;
            this.optionChanged(false);
        }
    }
    get metallicIndex() {
        return this._metallicIndex;
    }
    set metallicIndex(val) {
        if (this._metallicIndex !== val) {
            this._metallicIndex = val;
            this.optionChanged(true);
        }
    }
    get roughnessIndex() {
        return this._roughnessIndex;
    }
    set roughnessIndex(val) {
        if (this._roughnessIndex !== val) {
            this._roughnessIndex = val;
            this.optionChanged(true);
        }
    }
    get metallicMap() {
        return this._textureOptions[TEX_NAME_METALLIC]?.texture ?? null;
    }
    get metallicSampler() {
        return this._textureOptions[TEX_NAME_METALLIC]?.sampler ?? null;
    }
    get metallicMapTexCoord() {
        return this._textureOptions[TEX_NAME_METALLIC]?.texCoordIndex ?? null;
    }
    setMetallicMap(tex, sampler, texCoordIndex, texTransform) {
        this.setTextureOptions(TEX_NAME_METALLIC, tex, sampler, texCoordIndex, texTransform);
    }
    get specularFactor() {
        return this._specularFactor;
    }
    set specularFactor(val) {
        if (!val.equalsTo(this._specularFactor)) {
            this._specularFactor.assign(val.getArray());
            this.optionChanged(true);
        }
    }
    get specularMap() {
        return this._textureOptions[TEX_NAME_SPECULAR]?.texture ?? null;
    }
    get specularSampler() {
        return this._textureOptions[TEX_NAME_SPECULAR]?.sampler ?? null;
    }
    get specularMapTexCoord() {
        return this._textureOptions[TEX_NAME_SPECULAR]?.texCoordIndex ?? null;
    }
    setSpecularMap(tex, sampler, texCoordIndex, texTransform) {
        this.setTextureOptions(TEX_NAME_SPECULAR, tex, sampler, texCoordIndex, texTransform);
    }
    get specularColorMap() {
        return this._textureOptions[TEX_NAME_SPECULAR_COLOR]?.texture ?? null;
    }
    get specularColorSampler() {
        return this._textureOptions[TEX_NAME_SPECULAR_COLOR]?.sampler ?? null;
    }
    get specularColorMapTexCoord() {
        return this._textureOptions[TEX_NAME_SPECULAR_COLOR]?.texCoordIndex ?? null;
    }
    setSpecularColorMap(tex, sampler, texCoordIndex, texTransform) {
        this.setTextureOptions(TEX_NAME_SPECULAR_COLOR, tex, sampler, texCoordIndex, texTransform);
    }
    applyUniforms(bindGroup, ctx) {
        super.applyUniforms(bindGroup, ctx);
        if (ctx.materialFunc === MATERIAL_FUNC_NORMAL) {
            bindGroup.setValue('lm_pbrMetallic', this._metallic);
            bindGroup.setValue('lm_pbrRoughness', this._roughness);
            bindGroup.setValue('lm_pbrSpecularFactor', this._specularFactor);
        }
    }
    calculateHash() {
        const metallicMapHash = this.metallicMap ? `${this.metallicMapTexCoord + 1}_${this._metallicIndex}_${this._roughnessIndex}` : '0';
        const specularMapHash = this.specularMap ? `${this.specularMapTexCoord + 1}` : '0';
        const specularColorMapHash = this.specularColorMap ? `${this.specularColorMapTexCoord + 1}` : '0';
        return `${super.calculateHash()}_${metallicMapHash}_${specularMapHash}_${specularColorMapHash}`;
    }
    setupUniforms(scope, ctx) {
        super.setupUniforms(scope, ctx);
        if (ctx.materialFunc === MATERIAL_FUNC_NORMAL && scope.$builder.shaderType === ShaderType.Fragment) {
            scope.lm_pbrMetallic = scope.$builder.float().uniform(2).tag(PBRLightModelMR.uniformMetallic);
            scope.lm_pbrRoughness = scope.$builder.float().uniform(2).tag(PBRLightModelMR.uniformRoughness);
            scope.lm_pbrSpecularFactor = scope.$builder.vec4().uniform(2).tag(PBRLightModelMR.uniformSpecularFactor);
        }
    }
    fillSurfaceData(scope, envLight, surfaceData) {
        const funcNameFillSurfaceDataMR = 'lib_fillSurfaceDataMR';
        const that = this;
        const pb = scope.$builder;
        super.fillSurfaceData(scope, envLight, surfaceData);
        if (!pb.getFunction(funcNameFillSurfaceDataMR)) {
            pb.globalScope.$function(funcNameFillSurfaceDataMR, [pb.struct(surfaceData.getTypeName(), 'surfaceData')], function () {
                const metallicMap = that.metallicMap ? this[that.getTextureUniformName(TEX_NAME_METALLIC)] : null;
                const specularMap = that.specularMap ? this[that.getTextureUniformName(TEX_NAME_SPECULAR)] : null;
                const specularColorMap = that.specularColorMap ? this[that.getTextureUniformName(TEX_NAME_SPECULAR_COLOR)] : null;
                const metallicFactor = pb.queryGlobal(PBRLightModelMR.uniformMetallic);
                const roughnessFactor = pb.queryGlobal(PBRLightModelMR.uniformRoughness);
                if (metallicMap) {
                    const texCoord = this.$inputs[`texcoord${that.metallicMapTexCoord ?? that.albedoMapTexCoord}`];
                    this.$l.t = pb.textureSample(metallicMap, texCoord);
                    const metallic = this.t['xyzw'[that._metallicIndex] || 'z'];
                    const roughness = this.t['xyzw'[that._roughnessIndex] || 'y'];
                    this.surfaceData.metallic = metallicFactor ? pb.mul(metallic, metallicFactor) : metallic;
                    this.surfaceData.roughness = roughnessFactor ? pb.mul(roughness, roughnessFactor) : roughness;
                }
                else {
                    this.surfaceData.metallic = metallicFactor;
                    this.surfaceData.roughness = roughnessFactor;
                }
                const specularFactor = pb.queryGlobal(PBRLightModelMR.uniformSpecularFactor);
                this.$l.specularColorFactor = specularFactor.rgb;
                this.surfaceData.specularWeight = specularFactor.a;
                if (specularColorMap) {
                    const texCoord = this.$inputs[`texcoord${that.specularColorMapTexCoord ?? that.albedoMapTexCoord}`];
                    this.specularColorFactor = pb.mul(this.specularColorFactor, pb.textureSample(specularColorMap, texCoord).rgb);
                }
                if (specularMap) {
                    const texCoord = this.$inputs[`texcoord${that.specularMapTexCoord ?? that.albedoMapTexCoord}`];
                    this.surfaceData.specularWeight = pb.mul(this.surfaceData.specularWeight, pb.textureSample(specularMap, texCoord).a);
                }
                this.surfaceData.f0 = pb.vec4(pb.mix(pb.min(pb.mul(this.surfaceData.f0.rgb, this.specularColorFactor), pb.vec3(1)), this.surfaceData.diffuse.rgb, this.surfaceData.metallic), this.surfaceData.f0.a);
                this.surfaceData.diffuse = pb.vec4(pb.mix(this.surfaceData.diffuse.rgb, pb.vec3(0), this.surfaceData.metallic), this.surfaceData.diffuse.a);
                if (that._clearcoat) {
                    this.surfaceData.clearcoatFresnel = that.fresnelSchlick(this, this.surfaceData.clearcoatNdotV, this.surfaceData.f0.rgb, this.surfaceData.f90);
                }
                if (envLight?.isIBL()) {
                    this.surfaceData.irradiance = pb.textureSample(pb.queryGlobal(EnvIBL.USAGE_IBL_IRRADIANCE_MAP), this.surfaceData.normal).rgb;
                    this.$l.refl = pb.reflect(pb.neg(this.surfaceData.viewVec), this.surfaceData.normal);
                    this.$l.maxLod = pb.queryGlobal(EnvIBL.USAGE_IBL_RADIANCE_MAP_MAX_LOD);
                    this.surfaceData.radiance = pb.device?.getShaderCaps().supportShaderTextureLod
                        ? pb.textureSampleLevel(pb.queryGlobal(EnvIBL.USAGE_IBL_RADIANCE_MAP), this.refl, pb.mul(this.surfaceData.roughness, this.maxLod)).rgb
                        : pb.textureSample(pb.queryGlobal(EnvIBL.USAGE_IBL_RADIANCE_MAP), this.refl).rgb;
                    if (that.useSheen) {
                        const r = pb.device?.getShaderCaps().supportShaderTextureLod
                            ? pb.textureSampleLevel(pb.queryGlobal(EnvIBL.USAGE_IBL_RADIANCE_MAP), this.refl, pb.mul(this.surfaceData.sheenRoughness, this.maxLod)).rgb
                            : this.surfaceData.radiance;
                        this.surfaceData.radianceSheen = pb.mul(this.surfaceData.radianceSheen, r);
                    }
                    if (that.useClearcoat) {
                        this.$l.ccRefl = pb.reflect(pb.neg(this.surfaceData.viewVec), this.surfaceData.clearcoatNormal);
                        this.surfaceData.radianceClearcoat = pb.device?.getShaderCaps().supportShaderTextureLod
                            ? pb.textureSampleLevel(pb.queryGlobal(EnvIBL.USAGE_IBL_RADIANCE_MAP), this.ccRefl, pb.mul(this.surfaceData.clearcoatFactor.y, this.maxLod)).rgb
                            : this.surfaceData.radiance;
                    }
                }
            });
        }
        return pb.globalScope[funcNameFillSurfaceDataMR](surfaceData);
    }
    createSurfaceDataType(env) {
        return super.createSurfaceDataType(env).extends('', [{
                name: 'metallic',
                type: typeF32
            }, {
                name: 'roughness',
                type: typeF32
            }, {
                name: 'specularWeight',
                type: typeF32
            }]);
    }
    isTextureUsed(name) {
        if (!this._sheen && (name === TEX_NAME_SHEEN_COLOR || name === TEX_NAME_SHEEN_ROUGHNESS)) {
            return false;
        }
        return super.isTextureUsed(name);
    }
}

export { LambertLightModel, LightModel, PBRLightModelBase, PBRLightModelMR, PBRLightModelSG, UnlitLightModel };
//# sourceMappingURL=lightmodel.js.map
