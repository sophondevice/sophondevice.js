import { PBInsideFunctionScope, PBShaderExp, TextureFormat, TextureSampler } from '@sophon/device';
import { ShadowImpl } from './shadow_impl';
import { ShaderLib } from '../materiallib';
import * as lib from '../renderers/shadowmap.shaderlib';
import type { ShadowMapper, ShadowMapType, ShadowMode } from './shadowmapper';

export class PCFOPT extends ShadowImpl {
  protected _kernelSize: number;
  protected _shadowSampler: TextureSampler;
  constructor(kernelSize?: number) {
    super();
    this._kernelSize = kernelSize ?? 5;
    this._shadowSampler = null;
  }
  get kernelSize(): number {
    return this._kernelSize;
  }
  set kernelSize(val: number) {
    val = val !== 3 && val !== 5 && val !== 7 ? 5 : val;
    this._kernelSize = val;
  }
  getType(): ShadowMode {
    return 'pcf-opt';
  }
  dispose(): void {
    this._shadowSampler = null;
  }
  isSupported(shadowMapper: ShadowMapper): boolean {
    return (
      this.getShadowMapColorFormat(shadowMapper) !== 'unknown' &&
      this.getShadowMapDepthFormat(shadowMapper) !== 'unknown'
    );
  }
  resourceDirty(): boolean {
    return false;
  }
  getShadowMap(shadowMapper: ShadowMapper): ShadowMapType {
    return this.useNativeShadowMap(shadowMapper)
      ? shadowMapper.getDepthAttachment()
      : shadowMapper.getColorAttachment();
  }
  getShadowMapSampler(shadowMapper: ShadowMapper): TextureSampler {
    if (!this._shadowSampler) {
      this._shadowSampler =
        this.getShadowMap(shadowMapper)?.getDefaultSampler(this.useNativeShadowMap(shadowMapper)) || null;
    }
    return this._shadowSampler;
  }
  doUpdateResources() {
    this._shadowSampler = null;
  }
  postRenderShadowMap() {}
  getDepthScale(): number {
    return 1;
  }
  setDepthScale(val: number) {}
  getShaderHash(): string {
    return `${this._kernelSize}`;
  }
  getShadowMapColorFormat(shadowMapper: ShadowMapper): TextureFormat {
    return 'rgba8unorm';
  }
  getShadowMapDepthFormat(shadowMapper: ShadowMapper): TextureFormat {
    return shadowMapper.light.scene.device.type === 'webgl'
      ? 'd24s8'
      : 'd32f';
  }
  computeShadowMapDepth(shadowMapper: ShadowMapper, scope: PBInsideFunctionScope): PBShaderExp {
    return lib.computeShadowMapDepth(scope, shadowMapper.shadowMap.format);
  }
  computeShadowCSM(
    shadowMapper: ShadowMapper,
    scope: PBInsideFunctionScope,
    shadowVertex: PBShaderExp,
    NdotL: PBShaderExp,
    split: PBShaderExp
  ): PBShaderExp {
    const funcNameComputeShadowCSM = 'lib_computeShadowCSM';
    const pb = scope.$builder;
    const that = this;
    if (!pb.getFunction(funcNameComputeShadowCSM)) {
      pb.globalScope.$function(
        funcNameComputeShadowCSM,
        [pb.vec4('shadowVertex'), pb.float('NdotL'), pb.int('split')],
        function () {
          this.$l.shadowCoord = pb.div(this.shadowVertex, this.shadowVertex.w);
          this.$l.shadowCoord = pb.add(pb.mul(this.shadowCoord, 0.5), 0.5);
          this.$l.inShadow = pb.all(
            pb.bvec2(
              pb.all(
                pb.bvec4(
                  pb.greaterThanEqual(this.shadowCoord.x, 0),
                  pb.lessThanEqual(this.shadowCoord.x, 1),
                  pb.greaterThanEqual(this.shadowCoord.y, 0),
                  pb.lessThanEqual(this.shadowCoord.y, 1)
                )
              ),
              pb.lessThanEqual(this.shadowCoord.z, 1)
            )
          );
          this.$l.shadow = pb.float(1);
          this.$l.receiverPlaneDepthBias = lib.computeReceiverPlaneDepthBias(this, this.shadowCoord);
          this.$if(this.inShadow, function () {
            this.$l.shadowBias = shadowMapper.computeShadowBiasCSM(this, this.NdotL, this.split);
            this.shadowCoord.z = pb.sub(this.shadowCoord.z, this.shadowBias);
            this.shadow = lib.filterShadowPCF(
              this,
              shadowMapper.light.lightType,
              shadowMapper.shadowMap.format,
              that._kernelSize,
              this.shadowCoord,
              this.receiverPlaneDepthBias,
              this.split
            );
          });
          this.$return(this.shadow);
        }
      );
    }
    return pb.globalScope[funcNameComputeShadowCSM](shadowVertex, NdotL, split);
  }
  computeShadow(
    shadowMapper: ShadowMapper,
    scope: PBInsideFunctionScope,
    shadowVertex: PBShaderExp,
    NdotL: PBShaderExp
  ): PBShaderExp {
    const funcNameComputeShadow = 'lib_computeShadow';
    const pb = scope.$builder;
    const shaderlib = new ShaderLib(pb);
    const that = this;
    if (!pb.getFunction(funcNameComputeShadow)) {
      pb.globalScope.$function(
        funcNameComputeShadow,
        [pb.vec4('shadowVertex'), pb.float('NdotL')],
        function () {
          if (shadowMapper.light.isPointLight()) {
            if (that.useNativeShadowMap(shadowMapper)) {
              this.$l.nearFar =
                pb.device.type === 'webgl'
                  ? this.global.light.shadowCameraParams.xy
                  : this.global.light.lightParams[5].xy;
              this.$l.distance = shaderlib.linearToNonLinear(
                pb.max(
                  pb.max(pb.abs(this.shadowVertex.x), pb.abs(this.shadowVertex.y)),
                  pb.abs(this.shadowVertex.z)
                ),
                this.nearFar
              );
              this.$l.shadowBias = shadowMapper.computeShadowBias(this, this.distance, this.NdotL);
              this.$return(
                that.sampleShadowMap(shadowMapper, this, this.shadowVertex, this.distance, this.shadowBias)
              );
            } else {
              this.$l.distance = pb.length(this.shadowVertex.xyz);
              this.$l.distance = pb.div(this.$l.distance, this.global.light.lightParams[0].w);
              this.$l.shadowBias = shadowMapper.computeShadowBias(this, this.distance, this.NdotL);
              this.$return(
                that.sampleShadowMap(shadowMapper, this, this.shadowVertex, this.distance, this.shadowBias)
              );
            }
          } else {
            this.$l.shadowCoord = pb.div(this.shadowVertex, this.shadowVertex.w);
            this.$l.shadowCoord = pb.add(pb.mul(this.shadowCoord, 0.5), 0.5);
            this.$l.inShadow = pb.all(
              pb.bvec2(
                pb.all(
                  pb.bvec4(
                    pb.greaterThanEqual(this.shadowCoord.x, 0),
                    pb.lessThanEqual(this.shadowCoord.x, 1),
                    pb.greaterThanEqual(this.shadowCoord.y, 0),
                    pb.lessThanEqual(this.shadowCoord.y, 1)
                  )
                ),
                pb.lessThanEqual(this.shadowCoord.z, 1)
              )
            );
            this.$l.shadow = pb.float(1);
            this.$l.receiverPlaneDepthBias = lib.computeReceiverPlaneDepthBias(this, this.shadowCoord);
            this.$if(this.inShadow, function () {
              this.$l.shadowBias = shadowMapper.computeShadowBias(this, this.shadowCoord.z, this.NdotL);
              this.shadowCoord.z = pb.sub(this.shadowCoord.z, this.shadowBias);
              this.shadow = lib.filterShadowPCF(
                this,
                shadowMapper.light.lightType,
                shadowMapper.shadowMap.format,
                that._kernelSize,
                this.shadowCoord,
                this.receiverPlaneDepthBias
              );
            });
            this.$return(this.shadow);
          }
        }
      );
    }
    return pb.globalScope[funcNameComputeShadow](shadowVertex, NdotL);
  }
  useNativeShadowMap(shadowMapper: ShadowMapper): boolean {
    return shadowMapper.light.scene.device.type !== 'webgl';
  }
  /** @internal */
  sampleShadowMap(
    shadowMapper: ShadowMapper,
    scope: PBInsideFunctionScope,
    coords: PBShaderExp,
    z: PBShaderExp,
    bias: PBShaderExp
  ): PBShaderExp {
    const funcNameSampleShadowMap = `lib_sampleShadowMap`;
    const pb = scope.$builder;
    const lib = new ShaderLib(pb);
    const that = this;
    if (!pb.getFunction(funcNameSampleShadowMap)) {
      pb.globalScope.$function(
        funcNameSampleShadowMap,
        [pb.vec4('coords'), pb.float('z'), pb.float('bias')],
        function () {
          const floatDepthTexture = shadowMapper.shadowMap.format !== 'rgba8unorm';
          if (shadowMapper.light.isPointLight()) {
            if (this.useNativeShadowMap(shadowMapper)) {
              this.$return(
                pb.clamp(
                  pb.textureSampleCompareLevel(this.shadowMap, this.coords.xyz, pb.sub(this.z, this.bias)),
                  0,
                  1
                )
              );
            } else {
              this.$l.shadowTex = pb.textureSampleLevel(this.shadowMap, this.coords.xyz, 0);
              if (!floatDepthTexture) {
                this.shadowTex.x = lib.decodeNormalizedFloatFromRGBA(this.shadowTex);
              }
              this.$l.distance = pb.sub(this.z, this.bias);
              this.$return(pb.step(this.distance, this.shadowTex.x));
            }
          } else {
            this.$l.distance = pb.sub(this.z, this.bias);
            if (that.useNativeShadowMap(shadowMapper)) {
              this.$return(
                pb.clamp(pb.textureSampleCompareLevel(this.shadowMap, this.coords.xy, this.distance), 0, 1)
              );
            } else {
              this.$l.shadowTex = pb.textureSampleLevel(this.shadowMap, this.coords.xy, 0);
              if (!floatDepthTexture) {
                this.shadowTex.x = lib.decodeNormalizedFloatFromRGBA(this.shadowTex);
              }
              this.$return(pb.step(this.distance, this.shadowTex.x));
            }
          }
        }
      );
    }
    return pb.globalScope[funcNameSampleShadowMap](coords, z, bias);
  }
  /** @internal */
  sampleShadowMapCSM(
    shadowMapper: ShadowMapper,
    scope: PBInsideFunctionScope,
    coords: PBShaderExp,
    split: PBShaderExp,
    z: PBShaderExp,
    bias: PBShaderExp
  ): PBShaderExp {
    const funcNameSampleShadowMapCSM = 'lib_sampleShadowMapCSM';
    const pb = scope.$builder;
    const lib = new ShaderLib(pb);
    const that = this;
    if (!pb.getFunction(funcNameSampleShadowMapCSM)) {
      pb.globalScope.$function(
        funcNameSampleShadowMapCSM,
        [pb.vec4('coords'), pb.int('split'), pb.float('z'), pb.float('bias')],
        function () {
          const floatDepthTexture = shadowMapper.shadowMap.format !== 'rgba8unorm';
          this.$l.distance = pb.sub(this.z, this.bias);
          if (that.useNativeShadowMap(shadowMapper)) {
            if (shadowMapper.shadowMap.isTexture2DArray()) {
              this.$return(
                pb.clamp(
                  pb.textureArraySampleCompareLevel(
                    this.shadowMap,
                    this.coords.xy,
                    this.split,
                    this.distance
                  ),
                  0,
                  1
                )
              );
            } else {
              this.$return(
                pb.clamp(pb.textureSampleCompareLevel(this.shadowMap, this.coords.xy, this.distance), 0, 1)
              );
            }
          } else {
            if (shadowMapper.shadowMap.isTexture2DArray()) {
              this.$l.shadowTex = pb.textureArraySampleLevel(this.shadowMap, this.coords.xy, this.split, 0);
            } else {
              this.$l.shadowTex = pb.textureSampleLevel(this.shadowMap, this.coords.xy, 0);
            }
            if (!floatDepthTexture) {
              this.shadowTex.x = lib.decodeNormalizedFloatFromRGBA(this.shadowTex);
            }
            this.$return(pb.step(this.distance, this.shadowTex.x));
          }
        }
      );
    }
    return pb.globalScope[funcNameSampleShadowMapCSM](coords, split, z, bias);
  }
}
