/** sophon base library */
import { BlendFunc } from '../../device/render_states.js';
import { RenderPass } from './renderpass.js';
import '../material.js';
import { ShaderLib } from '../materiallib/shaderlib.js';
import { RENDER_PASS_TYPE_MULTI_FORWARD, LIGHT_TYPE_NONE, MATERIAL_FUNC_NORMAL } from '../values.js';
import '../../device/gpuobject.js';
import '../../device/builder/ast.js';
import '../../device/builder/types.js';
import '../../device/builder/programbuilder.js';
import '../materiallib/lightmodel.js';
import '@sophon/base';

class ForwardMultiRenderPass extends RenderPass {
    _overriddenState;
    _overriddenStateTrans;
    _currentLight;
    constructor(renderScheme, name) {
        super(renderScheme, name);
        this._overriddenState = renderScheme.device.createRenderStateSet();
        this._overriddenState.useBlendingState().enable(true).setBlendFunc(BlendFunc.ONE, BlendFunc.ONE);
        this._overriddenStateTrans = renderScheme.device.createRenderStateSet();
        this._overriddenStateTrans.useBlendingState().enable(true).setBlendFunc(BlendFunc.ONE, BlendFunc.INV_SRC_ALPHA);
        this._overriddenStateTrans.useDepthState().enableTest(true).enableWrite(false);
        this._currentLight = null;
    }
    get light() {
        return this._currentLight;
    }
    getRenderPassType() {
        return RENDER_PASS_TYPE_MULTI_FORWARD;
    }
    _getGlobalBindGroupHash(ctx) {
        const shadowMapHash = ctx.shadowMapper ? ctx.shadowMapper.shaderHash : '';
        return `${this._currentLight?.lightType || LIGHT_TYPE_NONE}:${ctx.environment?.constructor.name || ''}:${shadowMapHash}`;
    }
    setLightUniforms(bindGroup, ctx, light) {
        if (light) {
            bindGroup.setValue('global', {
                light: {
                    positionAndRange: light.positionAndRange,
                    directionAndCutoff: light.directionAndCutoff,
                    diffuseAndIntensity: light.diffuseAndIntensity,
                    shadowMatrix: light.shadow.shadowMatrices,
                    splitDistances: light.shadow.cascadeDistances,
                    depthBias: light.shadow.depthBiasValues,
                    shadowCascades: light.shadow.numShadowCascades,
                    shadowCameraParams: light.shadow.shadowCameraParams,
                    depthBiasScales: light.shadow.depthBiasScales,
                    lightType: light.lightType,
                    envLightStrength: light.scene.envLightStrength,
                }
            });
            if (ctx.shadowMapper) {
                bindGroup.setTexture('shadowMap', ctx.shadowMapper.shadowMap, ctx.shadowMapper.shadowMapSampler);
            }
        }
        ctx.environment?.updateBindGroup(bindGroup);
    }
    setGlobalBindings(scope, ctx) {
        const pb = scope.$builder;
        const structCamera = pb.defineStruct(null, null, pb.vec3('position'), pb.mat4('viewProjectionMatrix'), pb.mat4('viewMatrix'), pb.mat4('projectionMatrix'), pb.vec4('params'));
        const structLight = pb.defineStruct(null, null, pb.vec4('positionAndRange'), pb.vec4('directionAndCutoff'), pb.vec4('diffuseAndIntensity'), pb.vec4('splitDistances'), pb.vec4('depthBias'), pb.vec4('shadowCameraParams'), pb.vec4('depthBiasScales'), pb.vec4[16]('shadowMatrix'), pb.int('shadowCascades'), pb.int('lightType'), pb.float('envLightStrength'));
        const structGlobal = pb.defineStruct(null, 'std140', structCamera('camera'), structLight('light'));
        pb.globalScope.global = structGlobal().uniform(0).tag({
            camera: {
                position: ShaderLib.USAGE_CAMERA_POSITION,
                viewProjectionMatrix: ShaderLib.USAGE_VIEW_PROJ_MATRIX,
                params: ShaderLib.USAGE_CAMERA_PARAMS,
            },
            light: {
                envLightStrength: ShaderLib.USAGE_ENV_LIGHT_STRENGTH,
            }
        });
        if (ctx.shadowMapper) {
            const shadowTex = ctx.shadowMapper.shadowMap.isTexture2D() ? pb.tex2D() : pb.texCube();
            if (!this.device.getTextureCaps().getTextureFormatInfo(ctx.shadowMapper.shadowMap.format).filterable) {
                shadowTex.sampleType('unfilterable-float');
            }
            pb.globalScope.shadowMap = shadowTex.uniform(0);
        }
        ctx.environment?.initShaderBindings(pb);
    }
    renderItems(camera, renderQueue, lightList) {
        const ctx = {
            camera,
            target: null,
            materialFunc: MATERIAL_FUNC_NORMAL,
            renderPass: this,
            renderPassHash: null,
        };
        const device = this._renderScheme.device;
        const env = camera.scene.environment;
        const flip = this.isAutoFlip();
        renderQueue.sortItems();
        lightList = lightList?.length > 0 ? lightList : [null];
        for (const order of Object.keys(renderQueue.items).map(val => Number(val)).sort((a, b) => a - b)) {
            const items = renderQueue.items[order];
            const lists = [items.opaqueList, items.transList];
            const overriddenBlendingStates = [this._overriddenState, this._overriddenStateTrans];
            const bindGroupNoLight = this.getGlobalBindGroup(ctx);
            for (let i = 0; i < 2; i++) {
                const list = lists[i];
                if (list?.length > 0) {
                    const overridden = overriddenBlendingStates[i];
                    this._currentLight = null;
                    this.device.setBindGroup(0, bindGroupNoLight);
                    this.setCameraUniforms(bindGroupNoLight, ctx, this._verticalFlip !== flip);
                    ctx.renderPassHash = this.getGlobalBindGroupHash(ctx);
                    for (const item of list) {
                        if (item.drawable.isUnlit()) {
                            ctx.instanceData = item.instanceData;
                            ctx.target = item.drawable;
                            item.drawable.draw(ctx);
                        }
                    }
                    for (let index = 0; index < lightList.length; index++) {
                        const light = lightList[index];
                        this._currentLight = light;
                        if (light?.castShadow) {
                            ctx.shadowMapper = light.shadow;
                        }
                        else {
                            ctx.shadowMapper = null;
                        }
                        let bindGroup;
                        if (index > 0) {
                            device.setRenderStatesOverridden(overridden);
                            ctx.environment = null;
                            bindGroup = this.getGlobalBindGroup(ctx);
                        }
                        else {
                            ctx.environment = env;
                            ctx.envStrength = camera.scene.envLightStrength;
                            bindGroup = this.getGlobalBindGroup(ctx);
                        }
                        device.setBindGroup(0, bindGroup);
                        if (ctx.shadowMapper) {
                            bindGroup.setTexture('shadowMap', ctx.shadowMapper.shadowMap, ctx.shadowMapper.shadowMapSampler);
                        }
                        this.setCameraUniforms(bindGroup, ctx, this._verticalFlip !== flip);
                        this.setLightUniforms(bindGroup, ctx, light);
                        ctx.renderPassHash = this.getGlobalBindGroupHash(ctx);
                        for (const item of list) {
                            if (!item.drawable.isUnlit()) {
                                ctx.instanceData = item.instanceData;
                                ctx.target = item.drawable;
                                item.drawable.draw(ctx);
                            }
                        }
                    }
                    this._currentLight = null;
                    device.setRenderStatesOverridden(null);
                }
            }
        }
    }
}

export { ForwardMultiRenderPass };
//# sourceMappingURL=forward_multi_pass.js.map
