/** sophon base library */
import { Frustum } from '@sophon/base';
import { RenderPass } from './renderpass.js';
import { RENDER_PASS_TYPE_SHADOWMAP, MATERIAL_FUNC_DEPTH_SHADOW } from '../values.js';
import '../material.js';
import { ShaderLib } from '../materiallib/shaderlib.js';
import { FaceMode } from '../../device/render_states.js';
import '../../device/gpuobject.js';
import '../../device/builder/ast.js';
import '../../device/builder/types.js';
import '../../device/builder/programbuilder.js';
import '../materiallib/lightmodel.js';
import { Camera } from '../camera.js';
import { TextureFormat } from '../../device/base_types.js';
import '../asset/assetmanager.js';
import '../../device/webgl/utils.js';
import '../../device/webgl/webgl_enum.js';
import '../../device/webgl/constants_webgl.js';
import '../../device/webgl/renderstate_webgl.js';
import '../../device/webgpu/constants_webgpu.js';
import '../../device/webgpu/structuredbuffer_webgpu.js';
import '../../device/webgpu/renderstates_webgpu.js';
import '../../device/webgpu/utils_webgpu.js';
import { GaussianBlurBlitter } from '../blitter/gaussianblur.js';
import { CopyBlitter } from '../blitter/copy.js';

class DebugBlitter extends CopyBlitter {
    packFloat;
    constructor() {
        super();
        this.packFloat = false;
    }
    filter(scope, type, srcTex, srcUV, srcLayer) {
        const pb = scope.$builder;
        const texel = this.readTexel(scope, type, srcTex, srcUV, srcLayer);
        if (this.packFloat) {
            const lib = new ShaderLib(pb);
            return pb.vec4(lib.decodeNormalizedFloatFromRGBA(texel), 0, 0, 1);
        }
        else {
            return texel;
        }
    }
    calcHash() {
        return `${Number(this.packFloat)}`;
    }
}
class BlurBlitter extends GaussianBlurBlitter {
    packFloat;
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
        return `${Number(this.packFloat)}`;
    }
}
class ShadowMapPass extends RenderPass {
    _currentLight;
    _splitLambda;
    _mainPass;
    _lightCameras;
    _cullFrontFaceRenderStates;
    _blurFilterH;
    _blurFilterV;
    _debugBlitter;
    constructor(renderScheme, name) {
        super(renderScheme, name);
        this._currentLight = null;
        this._splitLambda = 0.5;
        this._cullFrontFaceRenderStates = renderScheme.device.createRenderStateSet();
        this._cullFrontFaceRenderStates.useRasterizerState().setCullMode(FaceMode.FRONT);
        this._mainPass = null;
        this._lightCameras = new WeakMap();
        this._blurFilterH = new BlurBlitter('horizonal', 5, 4, 1 / 1024);
        this._blurFilterH.packFloat = renderScheme.getShadowMapFormat() === TextureFormat.RGBA8UNORM;
        this._blurFilterV = new BlurBlitter('vertical', 5, 4, 1 / 1024);
        this._blurFilterV.packFloat = renderScheme.getShadowMapFormat() === TextureFormat.RGBA8UNORM;
        this._debugBlitter = new DebugBlitter();
        this._debugBlitter.packFloat = renderScheme.getShadowMapFormat() === TextureFormat.RGBA8UNORM;
        this.enableClear(true, true);
    }
    get light() {
        return this._currentLight;
    }
    get mainPass() {
        return this._mainPass;
    }
    set mainPass(pass) {
        this._mainPass = pass;
    }
    getRenderPassType() {
        return RENDER_PASS_TYPE_SHADOWMAP;
    }
    fetchCameraForScene(scene) {
        const cameras = this._lightCameras.get(scene);
        if (!cameras || cameras.length === 0) {
            return new Camera(scene);
        }
        else {
            const camera = cameras.pop();
            camera.position.set(0, 0, 0);
            camera.rotation.identity();
            camera.scaling.set(1, 1, 1);
            return camera;
        }
    }
    releaseCamera(camera) {
        let cameras = this._lightCameras.get(camera.scene);
        if (!cameras) {
            cameras = [];
            this._lightCameras.set(camera.scene, cameras);
        }
        camera.remove();
        cameras.push(camera);
    }
    calcSplitDistances(camera, numCascades) {
        const farPlane = camera.getFarPlane();
        const nearPlane = camera.getNearPlane();
        const result = [0, 0, 0, 0, 0];
        for (let i = 0; i <= numCascades; ++i) {
            const fIDM = i / numCascades;
            const fLog = nearPlane * Math.pow((farPlane / nearPlane), fIDM);
            const fUniform = nearPlane + (farPlane - nearPlane) * fIDM;
            result[i] = fLog * this._splitLambda + fUniform * (1 - this._splitLambda);
        }
        return result;
    }
    _getGlobalBindGroupHash(ctx) {
        return this.light.shadow.shaderHash;
    }
    setGlobalBindings(scope, ctx) {
        const pb = scope.$builder;
        const structCamera = pb.defineStruct(null, 'std140', pb.vec3('position'), pb.mat4('viewProjectionMatrix'), pb.mat4('viewMatrix'), pb.mat4('projectionMatrix'), pb.vec4('params'));
        const structLight = pb.defineStruct(null, 'std140', pb.vec4('positionRange'), pb.vec4('directionCutoff'), pb.mat4('viewMatrix'), pb.vec4('depthBias'), pb.int('lightType'));
        const structGlobal = pb.defineStruct(null, 'std140', structCamera('camera'), structLight('light'));
        pb.globalScope.global = structGlobal().uniform(0).tag({
            camera: {
                position: ShaderLib.USAGE_CAMERA_POSITION,
                viewProjectionMatrix: ShaderLib.USAGE_VIEW_PROJ_MATRIX,
                viewMatrix: ShaderLib.USAGE_VIEW_MATRIX,
                projectionMatrix: ShaderLib.USAGE_PROJECTION_MATRIX,
                params: ShaderLib.USAGE_CAMERA_PARAMS,
            }
        });
    }
    setLightUniforms(bindGroup, ctx, light) {
        if (light) {
            bindGroup.setValue('global', {
                light: {
                    positionRange: light.positionAndRange,
                    directionCutoff: light.directionAndCutoff,
                    viewMatrix: light.viewMatrix,
                    depthBias: light.shadow.depthBiasValues,
                    lightType: light.lightType
                }
            });
        }
        ctx.environment?.updateBindGroup(bindGroup);
    }
    calcDepthBiasParams(shadowMapCamera, shadowMapSize, depthBias, normalBias, depthScale, result) {
        const frustum = shadowMapCamera.frustum;
        const sizeNear = Math.min(Math.abs(frustum.getCorner(Frustum.CORNER_RIGHT_TOP_NEAR).x - frustum.getCorner(Frustum.CORNER_LEFT_TOP_NEAR).x), Math.abs(frustum.getCorner(Frustum.CORNER_RIGHT_TOP_NEAR).y - frustum.getCorner(Frustum.CORNER_RIGHT_BOTTOM_NEAR).y));
        const sizeFar = Math.min(Math.abs(frustum.getCorner(Frustum.CORNER_RIGHT_TOP_FAR).x - frustum.getCorner(Frustum.CORNER_LEFT_TOP_FAR).x), Math.abs(frustum.getCorner(Frustum.CORNER_RIGHT_TOP_FAR).y - frustum.getCorner(Frustum.CORNER_RIGHT_BOTTOM_FAR).y));
        const scaleFactor = sizeNear / shadowMapSize / 2;
        result.set(depthBias * scaleFactor, normalBias * scaleFactor, depthScale, sizeFar / sizeNear);
    }
    render(scene, camera) {
        const savedCullCamera = this._cullCamera;
        for (const light of scene.lightList) {
            if (light.isPunctualLight() && light.castShadow) {
                this._currentLight = light;
                light.shadow.render(this, scene, camera);
            }
        }
        this._cullCamera = savedCullCamera;
    }
    renderItems(camera, renderQueue, lightList) {
        const ctx = {
            camera,
            target: null,
            renderPass: this,
            renderPassHash: null,
            materialFunc: MATERIAL_FUNC_DEPTH_SHADOW,
        };
        const device = this._renderScheme.device;
        const bindGroup = this.getGlobalBindGroup(ctx);
        device.setBindGroup(0, bindGroup);
        this.setLightUniforms(bindGroup, ctx, this._currentLight);
        this.setCameraUniforms(bindGroup, ctx, this._verticalFlip !== this.isAutoFlip());
        ctx.renderPassHash = this.getGlobalBindGroupHash(ctx);
        for (const order of Object.keys(renderQueue.items).map(val => Number(val)).sort((a, b) => a - b)) {
            const renderItems = renderQueue.items[order];
            for (const item of renderItems.opaqueList) {
                if (!item.drawable.isUnlit()) {
                    ctx.instanceData = item.instanceData;
                    ctx.target = item.drawable;
                    item.drawable.draw(ctx);
                }
            }
        }
    }
}

export { ShadowMapPass };
//# sourceMappingURL=shadowmap_pass.js.map
