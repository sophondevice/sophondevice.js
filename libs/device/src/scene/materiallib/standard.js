import { MAX_TEXCOORD_INDEX_COUNT } from '../../device/gpuobject';
import { BlendFunc } from '../../device/render_states';
import { Material } from '../material';
import { ShaderLib } from './shaderlib';
import { forwardComputeLighting } from '../renderers/forward.shaderlib';
import * as values from '../values';
export class StandardMaterial extends Material {
    _vertexColor;
    _hasNormal;
    _useTangent;
    _alphaBlend;
    _alphaCutoff;
    _opacity;
    _texCoordTransforms;
    _texCoordTransformHash;
    _lightModel;
    constructor(device) {
        super(device);
        this._vertexColor = false;
        this._useTangent = false;
        this._hasNormal = true;
        this._alphaBlend = false;
        this._alphaCutoff = 0;
        this._opacity = 1;
        this._texCoordTransforms = null;
        this._texCoordTransformHash = '';
        this._lightModel = null;
    }
    get lightModel() {
        return this._lightModel;
    }
    set lightModel(lm) {
        this._lightModel = lm || null;
    }
    get vertexColor() {
        return this._vertexColor;
    }
    set vertexColor(val) {
        if (this._vertexColor !== !!val) {
            this._vertexColor = !!val;
            this.optionChanged(true);
        }
    }
    get vertexTangent() {
        return this._useTangent;
    }
    set vertexTangent(val) {
        if (this._useTangent !== !!val) {
            this._useTangent = !!val;
            this.optionChanged(true);
        }
    }
    get vertexNormal() {
        return this._hasNormal;
    }
    set vertexNormal(val) {
        if (this._hasNormal !== !!val) {
            this._hasNormal = !!val;
            this.optionChanged(true);
        }
    }
    get alphaBlend() {
        return this._alphaBlend;
    }
    set alphaBlend(val) {
        if (this._alphaBlend !== !!val) {
            this._alphaBlend = !!val;
            const blending = this._alphaBlend || this._opacity < 1;
            if (blending && (!this._renderStateSet.blendingState?.enabled)) {
                this._renderStateSet.useBlendingState().enable(true).setBlendFunc(BlendFunc.ONE, BlendFunc.INV_SRC_ALPHA);
            }
            else if (this._renderStateSet.blendingState?.enabled && !blending) {
                this._renderStateSet.defaultBlendingState();
            }
            this.optionChanged(true);
        }
    }
    get alphaCutoff() {
        return this._alphaCutoff;
    }
    set alphaCutoff(val) {
        if (this._alphaCutoff !== val) {
            this.optionChanged(this._alphaCutoff === 0 || val === 0);
            this._alphaCutoff = val;
        }
    }
    get opacity() {
        return this._opacity;
    }
    set opacity(val) {
        val = val < 0 ? 0 : val > 1 ? 1 : val;
        if (this._opacity !== val) {
            this.optionChanged(this._opacity === 1 || val === 1);
            this._opacity = val;
            const blending = this._alphaBlend || this._opacity < 1;
            if (blending && (!this._renderStateSet.blendingState?.enabled)) {
                this._renderStateSet.useBlendingState().enable(true).setBlendFunc(BlendFunc.ONE, BlendFunc.INV_SRC_ALPHA);
            }
            else if (this._renderStateSet.blendingState?.enabled && !blending) {
                this._renderStateSet.defaultBlendingState();
            }
        }
    }
    getTexCoordTransform(index) {
        return this._texCoordTransforms?.get(index) || null;
    }
    setTexCoordTransform(index, matrix) {
        if (matrix) {
            const replace = this._texCoordTransforms?.has(index);
            if (!this._texCoordTransforms) {
                this._texCoordTransforms = new Map();
            }
            this._texCoordTransforms.set(index, matrix);
            if (!replace) {
                this._texCoordTransformHash = [...this._texCoordTransforms.keys()].sort().join('');
            }
            this.optionChanged(!replace);
        }
        else {
            this.removeTexCoordTransform(index);
        }
    }
    removeTexCoordTransform(index) {
        if (this._texCoordTransforms?.has(index)) {
            this._texCoordTransforms?.delete(index);
            if (this._texCoordTransforms.size === 0) {
                this._texCoordTransforms = null;
            }
            this._texCoordTransformHash = this._texCoordTransforms ? [...this._texCoordTransforms.keys()].sort().join('') : '';
            this.optionChanged(true);
        }
    }
    clearTexCoordTransforms() {
        if (this._texCoordTransforms) {
            this._texCoordTransforms = null;
            this.optionChanged(true);
            this._texCoordTransformHash = '';
        }
    }
    isTransparent() {
        return this._alphaBlend || this._opacity < 1;
    }
    supportLighting() {
        return this._lightModel ? this._lightModel.supportLighting() : false;
    }
    applyUniforms(bindGroup, ctx, needUpdate) {
        super.applyUniforms(bindGroup, ctx, needUpdate);
        this._lightModel?.applyUniformsIfOutdated(bindGroup, ctx);
    }
    _applyUniforms(bindGroup, ctx) {
        if (this._alphaCutoff > 0) {
            bindGroup.setValue('alphaCutoff', this._alphaCutoff);
        }
        if (this._alphaBlend || this._opacity < 1) {
            bindGroup.setValue('opacity', this._opacity);
        }
        this._texCoordTransforms?.forEach(((val, key) => {
            bindGroup.setValue(`texCoordMatrix${key}`, val);
        }));
    }
    _createHash() {
        return `|${Number(!!this._vertexColor)}`
            + `|${Number(!!this._useTangent)}`
            + `|${Number(!!this._hasNormal)}`
            + `|${Number(this._opacity < 1 || this._alphaBlend)}`
            + `|${Number(this._alphaCutoff > 0)}`
            + `|${this._lightModel?.getHash() || ''}`
            + `|${this._texCoordTransformHash}`;
    }
    _createProgram(pb, ctx, func) {
        const that = this;
        const lib = new ShaderLib(pb);
        const useNormal = that._hasNormal && (func !== values.MATERIAL_FUNC_DEPTH_ONLY && (that._lightModel?.isNormalUsed()));
        if (ctx.materialFunc === values.MATERIAL_FUNC_DEPTH_SHADOW && ctx.renderPass.light.shadow.depthClampEnabled) {
            pb.emulateDepthClamp = true;
        }
        else {
            pb.emulateDepthClamp = false;
        }
        return pb.buildRenderProgram({
            vertex() {
                Material.initShader(pb, ctx);
                this.$inputs.pos = pb.vec3().attrib('position');
                if (useNormal) {
                    this.$inputs.normal = pb.vec3().attrib('normal');
                }
                if (ctx.target.getBoneMatrices()) {
                    this.$inputs.blendIndices = pb.vec4().attrib('blendIndices');
                    this.$inputs.blendWeights = pb.vec4().attrib('blendWeights');
                }
                if (that._vertexColor) {
                    this.$inputs.vertexColor = pb.vec4().attrib('diffuse');
                }
                for (let i = 0; i < MAX_TEXCOORD_INDEX_COUNT; i++) {
                    if (that._lightModel?.isTexCoordSrcLocationUsed(i)) {
                        this.$inputs[`texcoord${i}`] = pb.vec2().attrib(`texCoord${i}`);
                    }
                }
                if (useNormal && that._useTangent) {
                    this.$inputs.tangent = pb.vec4().attrib('tangent');
                }
                that._lightModel?.setupUniforms(this, ctx);
                this.$mainFunc(function () {
                    if (ctx.target.getBoneMatrices()) {
                        this.$l.skinningMatrix = lib.getSkinMatrix();
                        this.$l.pos = lib.transformSkinnedVertex(this.$l.skinningMatrix);
                        if (useNormal) {
                            this.$l.norm = lib.transformSkinnedNormal(this.$l.skinningMatrix);
                            if (that._useTangent) {
                                this.$l.tangent = lib.transformSkinnedTangent(this.$l.skinningMatrix);
                            }
                        }
                    }
                    else {
                        this.$l.pos = this.$inputs.pos;
                        if (useNormal) {
                            this.$l.norm = this.$inputs.normal;
                            if (that._useTangent) {
                                this.$l.tangent = this.$inputs.tangent;
                            }
                        }
                    }
                    this.$outputs.worldPosition = lib.objectSpacePositionToWorld(this.$l.pos).tag(ShaderLib.USAGE_WORLD_POSITION);
                    if (useNormal) {
                        this.$outputs.worldNormal = pb.normalize(lib.objectSpaceVectorToWorld(this.$l.norm)).tag(ShaderLib.USAGE_WORLD_NORMAL);
                        if (that._useTangent) {
                            this.$outputs.worldTangent = pb.normalize(lib.objectSpaceVectorToWorld(this.$l.tangent.xyz)).tag(ShaderLib.USAGE_WORLD_TANGENT);
                            this.$outputs.worldBinormal = pb.normalize(pb.mul(pb.cross(this.$outputs.worldNormal, this.$outputs.worldTangent), this.$l.tangent.w)).tag(ShaderLib.USAGE_WORLD_BINORMAL);
                        }
                    }
                    this.$builtins.position = lib.ftransform(this.$l.pos);
                    if (that._vertexColor) {
                        this.$outputs.outVertexColor = this.$inputs.vertexColor.tag(ShaderLib.USAGE_VERTEX_COLOR);
                    }
                    for (let i = 0; i < MAX_TEXCOORD_INDEX_COUNT; i++) {
                        if (that._lightModel?.isTexCoordIndexUsed(i)) {
                            this.$outputs[`texcoord${i}`] = that._lightModel.calculateTexCoord(this, i);
                        }
                    }
                });
            },
            fragment() {
                Material.initShader(pb, ctx);
                if (func === values.MATERIAL_FUNC_NORMAL) {
                    const blend = that._alphaBlend || that._opacity < 1;
                    that._lightModel?.setupUniforms(this, ctx);
                    if (blend) {
                        this.opacity = pb.float().uniform(2);
                    }
                    if (that._alphaCutoff > 0) {
                        this.alphaCutoff = pb.float().uniform(2);
                    }
                    this.$outputs.outColor = pb.vec4();
                    this.$mainFunc(function () {
                        this.$l.litColor = that._lightModel ? forwardComputeLighting(this, that._lightModel, ctx) : pb.vec4(1);
                        if (!blend && that._alphaCutoff === 0) {
                            this.litColor.a = 1;
                        }
                        else if (blend) {
                            this.litColor.a = pb.mul(this.litColor.a, this.opacity);
                        }
                        if (that._alphaCutoff > 0) {
                            this.$if(pb.lessThan(this.litColor.a, this.alphaCutoff), function () {
                                pb.discard();
                            });
                        }
                        if (blend) {
                            this.litColor = pb.vec4(pb.mul(this.litColor.rgb, this.litColor.a), this.litColor.a);
                        }
                        this.$outputs.outColor = lib.encodeColorOutput(this.litColor);
                    });
                }
                else if (func === values.MATERIAL_FUNC_DEPTH_ONLY) {
                    this.$outputs.outColor = pb.vec4();
                    this.$mainFunc(function () {
                        this.$outputs.outColor = pb.vec4(1);
                    });
                }
                else if (func === values.MATERIAL_FUNC_DEPTH_SHADOW) {
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
//# sourceMappingURL=standard.js.map