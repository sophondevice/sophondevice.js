import { Material } from '../material';
import { ShaderLib } from './shaderlib';
import { FaceMode } from '../../device/render_states';
import * as values from '../values';
export class SkyboxMaterial extends Material {
    _skyCubemap;
    _skySampler;
    constructor(device) {
        super(device);
        this._renderStateSet.useRasterizerState().setCullMode(FaceMode.NONE);
        this._skyCubemap = null;
        this._skySampler = null;
    }
    get skyCubeMap() {
        return this._skyCubemap;
    }
    set skyCubeMap(tex) {
        tex = tex || null;
        if (tex !== this._skyCubemap) {
            const hash = this._createHash();
            this._skyCubemap = tex;
            if (tex && !this._skySampler) {
                this._skySampler = tex.getDefaultSampler(false);
            }
            this.optionChanged(hash !== this._createHash());
        }
    }
    supportLighting() {
        return false;
    }
    _createHash() {
        if (!this._skyCubemap) {
            return '0';
        }
        else if (this.device.getDeviceType() === 'webgpu') {
            return this._skyCubemap.isFilterable() ? '1' : '2';
        }
        else {
            return '1';
        }
    }
    _applyUniforms(bindGroup, ctx) {
        if (this._skyCubemap) {
            bindGroup.setTexture('skyCubeMap', this._skyCubemap, this._skySampler);
        }
    }
    _createProgram(pb, ctx, func) {
        const that = this;
        const lib = new ShaderLib(pb);
        return pb.buildRenderProgram({
            vertex() {
                Material.initShader(pb, ctx);
                this.$inputs.pos = pb.vec3().attrib('position');
                this.$outputs.texCoord = pb.vec3();
                this.$mainFunc(function () {
                    this.$outputs.texCoord = this.$inputs.pos;
                    this.$l.worldPos = pb.add(pb.reflection.tag(ShaderLib.USAGE_CAMERA_POSITION), lib.objectSpacePositionToWorld(this.$inputs.pos).xyz);
                    this.$builtins.position = lib.worldSpacePositionToClip(this.worldPos);
                    this.$builtins.position.z = this.$builtins.position.w;
                });
            },
            fragment() {
                Material.initShader(pb, ctx);
                if (func === values.MATERIAL_FUNC_NORMAL) {
                    this.$outputs.outColor = pb.vec4();
                    if (that._skyCubemap) {
                        this.skyCubeMap = pb.texCube().uniform(2);
                        if (!that._skyCubemap.isFilterable()) {
                            this.skyCubeMap.sampleType('unfilterable-float');
                        }
                    }
                    this.$mainFunc(function () {
                        if (that._skyCubemap) {
                            this.$l.texCoord = pb.normalize(this.$inputs.texCoord);
                            this.$l.color = pb.device?.getShaderCaps().supportShaderTextureLod
                                ? pb.textureSampleLevel(this.skyCubeMap, this.texCoord, 0).xyz
                                : pb.textureSample(this.skyCubeMap, this.texCoord).xyz;
                        }
                        else {
                            this.$l.color = pb.vec3(0);
                        }
                        this.$outputs.outColor = lib.encodeColorOutput(pb.vec4(this.color, 1));
                    });
                }
                else {
                    this.$mainFunc(function () {
                        pb.discard();
                    });
                }
            }
        });
    }
}
//# sourceMappingURL=skybox.js.map