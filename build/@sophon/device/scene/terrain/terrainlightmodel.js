/** sophon base library */
import { Vector2 } from '@sophon/base';
import '../material.js';
import '../../device/gpuobject.js';
import '../../device/builder/ast.js';
import { TextureFilter, TextureWrapping, ShaderType } from '../../device/base_types.js';
import '../../device/builder/types.js';
import '../../device/builder/builtinfunc.js';
import '../../device/builder/constructors.js';
import '../../device/render_states.js';
import { MATERIAL_FUNC_NORMAL } from '../values.js';
import { LambertLightModel } from '../materiallib/lightmodel.js';
import '../asset/assetmanager.js';
import '../../device/webgl/utils.js';
import '../../device/webgl/webgl_enum.js';
import '../../device/webgl/constants_webgl.js';
import '../../device/webgl/renderstate_webgl.js';
import '../../device/webgpu/constants_webgpu.js';
import '../../device/webgpu/structuredbuffer_webgpu.js';
import '../../device/webgpu/renderstates_webgpu.js';
import '../../device/webgpu/utils_webgpu.js';

class TerrainLightModel extends LambertLightModel {
    static funcNameCalcTerrainAlbedo = 'lib_terrainLM_albedo';
    static funcNameCalcTerrainNormal = 'lib_terrainLM_normal';
    static uniformTerrainBaseMap = 'lib_terrainLM_baseMap';
    static uniformTerrainNormalMap = 'lib_terrainLM_normalMap';
    static uniformMaskMap = 'lib_terrainLM_maskMap';
    static uniformDetailMap = 'lib_terrainLM_detailMap';
    static uniformDetailScales = 'lib_terrainLM_detailScales';
    static uniformTerrainUV = 'lib_terrainLM_uv';
    _terrainBaseMap;
    _terrainBaseMapSampler;
    _terrainNormalMap;
    _terrainNormalMapSampler;
    _detailMaskMap;
    _detailMaskMapSampler;
    _detailColorMaps;
    _detailColorMapSamplers;
    _detailScales;
    constructor() {
        super();
        this._terrainBaseMap = null;
        this._terrainBaseMapSampler = null;
        this._terrainNormalMap = null;
        this._terrainNormalMapSampler = null;
        this._detailMaskMap = null;
        this._detailMaskMapSampler = null;
        this._detailColorMaps = [];
        this._detailColorMapSamplers = [];
        this._detailScales = [];
    }
    get terrainBaseMap() {
        return this._terrainBaseMap;
    }
    set terrainBaseMap(tex) {
        tex = tex || null;
        if (this._terrainBaseMap !== tex) {
            this.optionChanged(!this._terrainBaseMap || !tex);
            this._terrainBaseMap = tex;
        }
    }
    get terrainNormalMap() {
        return this._terrainNormalMap;
    }
    set terrainNormalMap(tex) {
        tex = tex || null;
        if (this._terrainNormalMap !== tex) {
            this.optionChanged(!this._terrainNormalMap || !tex);
            this._terrainNormalMap = tex;
        }
    }
    get detailMaskMap() {
        return this._detailMaskMap;
    }
    set detailMaskMap(tex) {
        tex = tex || null;
        if (this._detailMaskMap !== tex) {
            this.optionChanged(!this._detailMaskMap || !tex);
            this._detailMaskMap = tex;
            this._detailMaskMapSampler = tex.device.createSampler({
                magFilter: tex.isFilterable() ? TextureFilter.Linear : TextureFilter.Nearest,
                minFilter: tex.isFilterable() ? TextureFilter.Linear : TextureFilter.Nearest,
                mipFilter: tex.mipLevelCount === 1 ? TextureFilter.None : tex.isFilterable() ? TextureFilter.Linear : TextureFilter.Nearest,
            });
        }
    }
    get numDetailMaps() {
        return this._detailMaskMap ? this._detailColorMaps.length : 0;
    }
    get uniformUV() {
        return TerrainLightModel.uniformTerrainUV;
    }
    getDetailColorMap(index) {
        return this._detailColorMaps[index];
    }
    getDetailScale(index) {
        return this._detailScales[index];
    }
    supportLighting() {
        return !!this._terrainNormalMap;
    }
    calculateHash() {
        return `${this._detailColorMaps.map(tex => this._calcTextureHash(tex)).join('')}_${this._calcTextureHash(this._terrainBaseMap)}_${this._calcTextureHash(this._terrainNormalMap)}`;
    }
    addDetailMap(color, scale) {
        if (!color) {
            console.error(`addDetailMap(): texture can not be null`);
            return;
        }
        scale = scale || Vector2.one();
        this._detailColorMaps.push(color);
        this._detailColorMapSamplers.push(color.device.createSampler({
            addressU: TextureWrapping.Repeat,
            addressV: TextureWrapping.Repeat,
            magFilter: color.isFilterable() ? TextureFilter.Linear : TextureFilter.Nearest,
            minFilter: color.isFilterable() ? TextureFilter.Linear : TextureFilter.Nearest,
            mipFilter: color.mipLevelCount === 1 ? TextureFilter.None : color.isFilterable() ? TextureFilter.Linear : TextureFilter.Nearest,
        }));
        this._detailScales.push(scale);
        this.optionChanged(true);
    }
    applyUniforms(bindGroup, ctx) {
        if (ctx.materialFunc === MATERIAL_FUNC_NORMAL) {
            if (this._terrainBaseMap) {
                bindGroup.setTexture('terrainlm_baseMap', this._terrainBaseMap, this._terrainBaseMapSampler);
            }
            if (this._terrainNormalMap) {
                bindGroup.setTexture('terrainlm_normalMap', this._terrainNormalMap, this._terrainNormalMapSampler);
            }
            if (this.numDetailMaps > 0) {
                bindGroup.setTexture('terrainlm_maskMap', this._detailMaskMap, this._detailMaskMapSampler);
                for (let i = 0; i < this.numDetailMaps; i++) {
                    bindGroup.setTexture(`terrainlm_detailMap${i}`, this._detailColorMaps[i], this._detailColorMapSamplers[i]);
                    bindGroup.setValue(`terrainlm_detailScale${i}`, this._detailScales[i]);
                }
            }
        }
    }
    setupUniforms(scope) {
        const pb = scope.$builder;
        if (pb.shaderType === ShaderType.Fragment) {
            if (this._terrainBaseMap && !scope.$query(TerrainLightModel.uniformTerrainBaseMap)) {
                scope.terrainlm_baseMap = pb.tex2D().uniform(2).tag(TerrainLightModel.uniformTerrainBaseMap);
            }
            if (this._terrainNormalMap && !scope.$query(TerrainLightModel.uniformTerrainNormalMap)) {
                scope.terrainlm_normalMap = pb.tex2D().uniform(2).tag(TerrainLightModel.uniformTerrainNormalMap);
            }
            for (let i = 0; i < this.numDetailMaps; i++) {
                scope[`terrainlm_detailMap${i}`] = pb.tex2D().uniform(2).tag(`${TerrainLightModel.uniformDetailMap}${i}`);
                scope[`terrainlm_detailScale${i}`] = pb.vec2().uniform(2).tag(`${TerrainLightModel.uniformDetailScales}${i}`);
            }
            if (this.numDetailMaps > 0 && !scope.$query(TerrainLightModel.uniformMaskMap)) {
                scope.terrainlm_maskMap = pb.tex2D().uniform(2).tag(TerrainLightModel.uniformMaskMap);
            }
        }
    }
    calculateAlbedo(scope) {
        const that = this;
        const pb = scope.$builder;
        if (!pb.getFunction(TerrainLightModel.funcNameCalcTerrainAlbedo)) {
            pb.globalScope.$function(TerrainLightModel.funcNameCalcTerrainAlbedo, [], function () {
                const maskMap = this.$query(TerrainLightModel.uniformMaskMap);
                const uv = this.$query(TerrainLightModel.uniformTerrainUV);
                if (maskMap) {
                    if (uv) {
                        this.$l.color = pb.vec3(0);
                        this.$l.uv = uv;
                        this.$l.mask = pb.textureSample(maskMap, this.uv);
                        for (let i = 0; i < that.numDetailMaps; i++) {
                            this.color = pb.add(this.color, pb.mul(pb.textureSample(this.$query(`${TerrainLightModel.uniformDetailMap}${i}`), pb.mul(this.uv, this.$query(`${TerrainLightModel.uniformDetailScales}${i}`))).xyz, this.mask[i]));
                        }
                        this.$return(pb.vec4(this.color, 1));
                    }
                    else {
                        this.$return(pb.vec4(1));
                    }
                }
                else {
                    const baseMap = this.$query(TerrainLightModel.uniformTerrainBaseMap);
                    if (baseMap && uv) {
                        this.$return(pb.textureSample(baseMap, uv));
                    }
                    else {
                        this.$return(pb.vec4(1));
                    }
                }
            });
        }
        return pb.globalScope[TerrainLightModel.funcNameCalcTerrainAlbedo]();
    }
    _calcTextureHash(tex) {
        if (!tex) {
            return '0';
        }
        else if (tex.device.getDeviceType() === 'webgpu') {
            return tex.isFilterable() ? '1' : '2';
        }
        else {
            return '1';
        }
    }
}

export { TerrainLightModel };
//# sourceMappingURL=terrainlightmodel.js.map
