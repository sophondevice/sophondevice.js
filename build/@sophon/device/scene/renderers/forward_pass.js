/** sophon base library */
import { BlendFunc } from '../../device/render_states.js';
import { ShaderType } from '../../device/base_types.js';
import { RenderPass } from './renderpass.js';
import '../material.js';
import { ShaderLib } from '../materiallib/shaderlib.js';
import { MAX_FORWARD_LIGHT_COUNT, RENDER_PASS_TYPE_FORWARD, MATERIAL_FUNC_NORMAL } from '../values.js';
import '../../device/gpuobject.js';
import '../../device/builder/ast.js';
import '../../device/builder/types.js';
import '../../device/builder/programbuilder.js';
import '../materiallib/lightmodel.js';
import '@sophon/base';

class ForwardRenderPass extends RenderPass {
    _overriddenState;
    _overriddenStateTrans;
    _shadowMapHash;
    _lightUniform;
    constructor(renderScheme, name) {
        super(renderScheme, name);
        this._overriddenState = renderScheme.device.createRenderStateSet();
        this._overriddenState.useBlendingState().enable(true).setBlendFunc(BlendFunc.ONE, BlendFunc.ONE);
        this._overriddenStateTrans = renderScheme.device.createRenderStateSet();
        this._overriddenStateTrans.useBlendingState().enable(true).setBlendFunc(BlendFunc.ONE, BlendFunc.INV_SRC_ALPHA);
        this._overriddenStateTrans.useDepthState().enableTest(true).enableWrite(false);
        this._shadowMapHash = null;
        this._lightUniform = {
            light: {
                lightIndices: new Int32Array((MAX_FORWARD_LIGHT_COUNT + 1) * 4),
                lightParams: new Float32Array(MAX_FORWARD_LIGHT_COUNT * 4 * 23),
                numLights: 0,
                envLightStrength: 1
            }
        };
    }
    getRenderPassType() {
        return RENDER_PASS_TYPE_FORWARD;
    }
    _getGlobalBindGroupHash(ctx) {
        return `${ctx.environment?.constructor.name || ''}:${this._shadowMapHash}`;
    }
    setLightListUniforms(bindGroup, ctx, lightList) {
        this._lightUniform.light.numLights = Math.min(lightList.length, MAX_FORWARD_LIGHT_COUNT);
        this._lightUniform.light.envLightStrength = ctx.envStrength ?? 1;
        for (let i = 0; i < this._lightUniform.light.numLights; i++) {
            const light = lightList[i];
            const indices = this._lightUniform.light.lightIndices;
            const params = this._lightUniform.light.lightParams;
            indices[i * 4] = light.lightType;
            indices[i * 4 + 1] = light.castShadow ? light.shadow.numShadowCascades : 0;
            params.set(light.positionAndRange.getArray(), i * 92);
            params.set(light.directionAndCutoff.getArray(), i * 92 + 4);
            params.set(light.diffuseAndIntensity.getArray(), i * 92 + 8);
            if (light.castShadow) {
                params.set(light.shadow.cascadeDistances.getArray(), i * 92 + 12);
                params.set(light.shadow.depthBiasValues.getArray(), i * 92 + 16);
                params.set(light.shadow.shadowCameraParams.getArray(), i * 92 + 20);
                params.set(light.shadow.depthBiasScales.getArray(), i * 92 + 24);
                params.set(light.shadow.shadowMatrices, i * 92 + 28);
            }
        }
        bindGroup.setValue('global', this._lightUniform);
        if (ctx.shadowMapper) {
            bindGroup.setTexture('shadowMap', ctx.shadowMapper.shadowMap, ctx.shadowMapper.shadowMapSampler);
        }
        ctx.environment?.updateBindGroup(bindGroup);
    }
    setGlobalBindings(scope, ctx) {
        const pb = scope.$builder;
        const structCamera = pb.defineStruct(null, null, pb.vec3('position'), pb.mat4('viewProjectionMatrix'), pb.mat4('viewMatrix'), pb.mat4('projectionMatrix'), pb.vec4('params'));
        const structLight = pb.defineStruct(null, null, pb.int('numLights'), pb.ivec4[MAX_FORWARD_LIGHT_COUNT + 1]('lightIndices'), pb.vec4[MAX_FORWARD_LIGHT_COUNT * 23]('lightParams'), pb.float('envLightStrength'));
        const structGlobal = pb.defineStruct(null, 'std140', structCamera('camera'), structLight('light'));
        pb.globalScope.global = structGlobal().uniform(0).tag({
            camera: {
                position: ShaderLib.USAGE_CAMERA_POSITION,
                viewProjectionMatrix: ShaderLib.USAGE_VIEW_PROJ_MATRIX,
                viewMatrix: ShaderLib.USAGE_VIEW_MATRIX,
                projectionMatrix: ShaderLib.USAGE_PROJECTION_MATRIX,
                params: ShaderLib.USAGE_CAMERA_PARAMS,
            },
            light: {
                envLightStrength: ShaderLib.USAGE_ENV_LIGHT_STRENGTH
            }
        });
        if (scope.$builder.shaderType === ShaderType.Fragment && ctx.shadowMapper) {
            const tex = ctx.shadowMapper.shadowMap.isTextureCube()
                ? ctx.shadowMapper.shadowMap.isDepth() ? scope.$builder.texCubeShadow() : scope.$builder.texCube()
                : ctx.shadowMapper.shadowMap.isTexture2D()
                    ? ctx.shadowMapper.shadowMap.isDepth() ? scope.$builder.tex2DShadow() : scope.$builder.tex2D()
                    : ctx.shadowMapper.shadowMap.isDepth() ? scope.$builder.tex2DArrayShadow() : scope.$builder.tex2DArray();
            if (!ctx.shadowMapper.shadowMap.isDepth() && !this.device.getTextureCaps().getTextureFormatInfo(ctx.shadowMapper.shadowMap.format).filterable) {
                tex.sampleType('unfilterable-float');
            }
            scope.shadowMap = tex.uniform(0);
        }
        ctx.environment?.initShaderBindings(pb);
    }
    renderLightPass(camera, ctx, items, lights, trans, blend, flip) {
        ctx.environment = blend ? null : camera.scene.environment;
        ctx.renderPassHash = this.getGlobalBindGroupHash(ctx);
        const bindGroup = this.getGlobalBindGroup(ctx);
        this.setCameraUniforms(bindGroup, ctx, flip);
        this.setLightListUniforms(bindGroup, ctx, lights);
        this.device.setBindGroup(0, bindGroup);
        if (blend) {
            this.device.setRenderStatesOverridden(this._overriddenState);
        }
        else if (trans) {
            this.device.setRenderStatesOverridden(this._overriddenStateTrans);
        }
        for (const item of items) {
            if (!blend || !item.drawable.isUnlit()) {
                ctx.instanceData = item.instanceData;
                ctx.target = item.drawable;
                item.drawable.draw(ctx);
            }
        }
        this.device.setRenderStatesOverridden(null);
    }
    renderItems(camera, renderQueue, lightList) {
        let ll = lightList.slice().sort((a, b) => Number(!!b.castShadow) - Number(!!a.castShadow));
        const ctx = {
            camera,
            target: null,
            renderPass: this,
            renderPassHash: null,
            materialFunc: MATERIAL_FUNC_NORMAL,
            environment: camera.scene.environment,
            envStrength: camera.scene.envLightStrength ?? 1,
        };
        const flip = this._verticalFlip !== this.isAutoFlip();
        renderQueue.sortItems();
        if (ll.length === 0) {
            ll = [null];
        }
        for (const order of Object.keys(renderQueue.items).map(val => Number(val)).sort((a, b) => a - b)) {
            const items = renderQueue.items[order];
            const lists = [items.opaqueList, items.transList];
            for (let i = 0; i < 2; i++) {
                const list = lists[i];
                let lightIndex = 0;
                for (; lightIndex < ll.length && ll[lightIndex]?.castShadow; lightIndex++) {
                    const light = ll[lightIndex];
                    this._shadowMapHash = light.shadow.shaderHash;
                    ctx.shadowMapper = light.shadow;
                    this.renderLightPass(camera, ctx, list, [light], i > 0, lightIndex > 0, flip);
                }
                if (lightIndex < ll.length) {
                    ctx.shadowMapper = null;
                    this._shadowMapHash = '';
                    this.renderLightPass(camera, ctx, list, ll.slice(lightIndex), i > 0, lightIndex > 0, flip);
                }
            }
        }
    }
}

export { ForwardRenderPass };
//# sourceMappingURL=forward_pass.js.map
