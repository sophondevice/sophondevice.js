/** sophon base library */
import { Material } from '../material.js';
import { ShaderLib } from '../materiallib/shaderlib.js';
import { TerrainLightModel } from './terrainlightmodel.js';
import { forwardComputeLighting } from '../renderers/forward.shaderlib.js';
import { MATERIAL_FUNC_DEPTH_SHADOW, MATERIAL_FUNC_NORMAL, MATERIAL_FUNC_DEPTH_ONLY } from '../values.js';

var TerrainRenderMode;
(function (TerrainRenderMode) {
    TerrainRenderMode[TerrainRenderMode["UNKNOWN"] = 0] = "UNKNOWN";
    TerrainRenderMode[TerrainRenderMode["NORMAL"] = 1] = "NORMAL";
    TerrainRenderMode[TerrainRenderMode["DETAIL"] = 2] = "DETAIL";
})(TerrainRenderMode || (TerrainRenderMode = {}));
const MAX_DETAIL_TEXTURE_LEVELS = 8;
class TerrainMaterial extends Material {
    _lightModel;
    constructor(device) {
        super(device);
        this._lightModel = new TerrainLightModel();
    }
    get baseMap() {
        return this._lightModel.terrainBaseMap;
    }
    set baseMap(tex) {
        this._lightModel.terrainBaseMap = tex;
    }
    get normalMap() {
        return this._lightModel.terrainNormalMap;
    }
    set normalMap(tex) {
        this._lightModel.terrainNormalMap = tex;
    }
    get detailMaskMap() {
        return this._lightModel.detailMaskMap;
    }
    set detailMaskMap(tex) {
        this._lightModel.detailMaskMap = tex;
    }
    get numDetailMaps() {
        return this._lightModel.numDetailMaps;
    }
    getDetailColorMap(index) {
        return this._lightModel.getDetailColorMap(index);
    }
    getDetailScale(index) {
        return this._lightModel.getDetailScale(index);
    }
    addDetailMap(color, scale) {
        this._lightModel.addDetailMap(color, scale);
    }
    isTransparent() {
        return false;
    }
    supportLighting() {
        return this._lightModel.supportLighting();
    }
    applyUniforms(bindGroup, ctx, needUpdate) {
        super.applyUniforms(bindGroup, ctx, needUpdate);
        this._lightModel.applyUniformsIfOutdated(bindGroup, ctx);
    }
    _createHash() {
        return this._lightModel.getHash();
    }
    _createProgram(pb, ctx, func) {
        const that = this;
        const lib = new ShaderLib(pb);
        if (ctx.materialFunc === MATERIAL_FUNC_DEPTH_SHADOW && ctx.renderPass.light.shadow.depthClampEnabled) {
            pb.emulateDepthClamp = true;
        }
        else {
            pb.emulateDepthClamp = false;
        }
        return pb.buildRenderProgram({
            vertex() {
                const terrainInfoStruct = pb.defineStruct(null, 'std140', pb.ivec4('value'));
                Material.initShader(pb, ctx);
                that._lightModel.setupUniforms(this);
                this.$inputs.pos = pb.vec3().attrib('position');
                this.$inputs.normal = pb.vec3().attrib('normal');
                this.$inputs.height = pb.float().attrib('custom0');
                this.$outputs.uv = pb.vec2().tag(that._lightModel.uniformUV);
                this.$outputs.worldPosition = pb.vec4().tag(ShaderLib.USAGE_WORLD_POSITION);
                this.$outputs.worldNormal = pb.vec3().tag(ShaderLib.USAGE_WORLD_NORMAL);
                this.scaleOffset = pb.defineStruct(null, 'std140', pb.vec4('value'))().uniform(2);
                this.terrainInfo = terrainInfoStruct().uniform(2);
                this.$mainFunc(function () {
                    this.$l.p = pb.add(pb.mul(this.$inputs.pos.xz, this.scaleOffset.value.xz), this.scaleOffset.value.yw);
                    this.$l.pos = pb.vec3(this.p.x, this.$inputs.height, this.p.y);
                    this.$outputs.uv = pb.div(this.p.xy, pb.vec2(this.terrainInfo.value.xy));
                    this.$outputs.worldPosition = lib.objectSpacePositionToWorld(this.$l.pos);
                    this.$outputs.worldNormal = pb.normalize(lib.objectSpaceVectorToWorld(this.$inputs.normal));
                    this.$builtins.position = lib.ftransform(this.$l.pos);
                });
            },
            fragment() {
                Material.initShader(pb, ctx);
                if (func === MATERIAL_FUNC_NORMAL) {
                    that._lightModel.setupUniforms(this);
                    this.$outputs.outColor = pb.vec4();
                    this.$mainFunc(function () {
                        this.$l.litColor = forwardComputeLighting(this, that._lightModel, ctx);
                        this.$outputs.outColor = lib.encodeColorOutput(this.litColor);
                    });
                }
                else if (func === MATERIAL_FUNC_DEPTH_ONLY) {
                    this.$outputs.outColor = pb.vec4();
                    this.$mainFunc(function () {
                        this.$outputs.outColor = pb.vec4(1);
                    });
                }
                else if (func === MATERIAL_FUNC_DEPTH_SHADOW) {
                    this.$outputs.outColor = pb.vec4();
                    this.$mainFunc(function () {
                        this.$outputs.outColor = ctx.renderPass.light.shadow.computeShadowMapDepth(this);
                    });
                }
                else {
                    throw new Error(`unknown material function: ${func}`);
                }
            }
        });
    }
}

export { MAX_DETAIL_TEXTURE_LEVELS, TerrainMaterial, TerrainRenderMode };
//# sourceMappingURL=terrainmaterial.js.map
