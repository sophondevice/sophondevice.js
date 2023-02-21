/** sophon base library */
import { Vector3, Vector4, Matrix4x4 } from '@sophon/base';
import { TextureTarget } from '../../device/base_types.js';
import '../../device/gpuobject.js';
import { FaceMode } from '../../device/render_states.js';
import '../asset/assetmanager.js';
import '../../device/builder/ast.js';
import '../../device/builder/types.js';
import '../../device/builder/builtinfunc.js';
import '../../device/builder/constructors.js';
import '../../device/webgl/utils.js';
import '../../device/webgl/webgl_enum.js';
import '../../device/webgl/constants_webgl.js';
import '../../device/webgl/renderstate_webgl.js';
import '../../device/webgpu/constants_webgpu.js';
import '../../device/webgpu/structuredbuffer_webgpu.js';
import '../../device/webgpu/renderstates_webgpu.js';
import '../../device/webgpu/utils_webgpu.js';
import { Camera } from '../camera.js';
import '../material.js';
import { ShaderLib } from '../materiallib/shaderlib.js';
import '../materiallib/lightmodel.js';
import { SSM } from './ssm.js';
import { ESM } from './esm.js';
import { VSM } from './vsm.js';
import { PCFPD } from './pcf_pd.js';
import { PCFOPT } from './pcf_opt.js';

class ShadowMapper {
    static _sceneMin = new Vector3();
    static _sceneMax = new Vector3();
    static _frustumMin = new Vector3();
    static _frustumMax = new Vector3();
    _lightCameras;
    _light;
    _config;
    _colorAttachment;
    _depthAttachment;
    _framebuffer;
    _cascadeDistances;
    _shadowCameraParams;
    _shadowMatrices;
    _resourceDirty;
    _depthClampEnabled;
    _cullFrontFaceRenderStates;
    _depthBias;
    _depthBiasScale;
    _shadowMode;
    _impl;
    _pdSampleCount;
    _pdSampleRadius;
    _pcfKernelSize;
    _vsmBlurKernelSize;
    _vsmBlurRadius;
    _vsmDarkness;
    _esmBlurKernelSize;
    _esmBlurRadius;
    _esmDepthScale;
    constructor(light) {
        this._light = light;
        this._config = {
            shadowMapSize: 512,
            numCascades: 1,
            splitLambda: 0.5,
            depthBias: 0.05,
            normalBias: 0.05,
            renderBackfaceOnly: false,
            nearClip: 1,
        };
        this._colorAttachment = null;
        this._depthAttachment = null;
        this._framebuffer = null;
        this._cascadeDistances = Vector4.zero();
        this._shadowCameraParams = Vector4.zero();
        this._shadowMatrices = new Float32Array(16 * 4);
        this._resourceDirty = true;
        this._depthClampEnabled = false;
        this._lightCameras = new WeakMap();
        this._cullFrontFaceRenderStates = this._light.scene.device.createRenderStateSet();
        this._cullFrontFaceRenderStates.useRasterizerState().setCullMode(FaceMode.FRONT);
        this._depthBias = [new Vector4(), new Vector4(), new Vector4(), new Vector4()];
        this._depthBiasScale = Vector4.one();
        this._shadowMode = 'none';
        this._impl = null;
        this._pdSampleCount = 12;
        this._pdSampleRadius = 4;
        this._pcfKernelSize = 5;
        this._vsmBlurKernelSize = 5;
        this._vsmBlurRadius = 4;
        this._vsmDarkness = 0.3;
        this._esmBlurKernelSize = 5;
        this._esmBlurRadius = 4;
        this._esmDepthScale = 200;
        this.mode = 'hard';
    }
    get light() {
        return this._light;
    }
    get shadowMapSize() {
        return this._config.shadowMapSize;
    }
    set shadowMapSize(num) {
        if (!Number.isInteger(num) || num < 1) {
            console.error(`invalid shadow map size: ${num}`);
            return;
        }
        if (this._config.shadowMapSize !== num) {
            this._config.shadowMapSize = num;
            this._resourceDirty = true;
        }
    }
    get numShadowCascades() {
        return this._config.numCascades;
    }
    set numShadowCascades(num) {
        if (num !== 1 && num !== 2 && num !== 3 && num !== 4) {
            console.error(`invalid shadow cascade number: ${num}`);
            return;
        }
        if (!this._light.isDirectionLight() && num > 1) {
            console.error(`only directional light can have more than one shadow cascades`);
            return;
        }
        if (num !== this._config.numCascades) {
            this._config.numCascades = num;
            this._resourceDirty = true;
        }
    }
    get renderBackfaceOnly() {
        return this._config.renderBackfaceOnly;
    }
    set renderBackfaceOnly(b) {
        this._config.renderBackfaceOnly = !!b;
    }
    get splitLambda() {
        return this._config.splitLambda;
    }
    set splitLambda(val) {
        this._config.splitLambda = val;
    }
    get depthBias() {
        return this._config.depthBias;
    }
    set depthBias(val) {
        this._config.depthBias = val;
    }
    get normalBias() {
        return this._config.normalBias;
    }
    set normalBias(val) {
        this._config.normalBias = val;
    }
    get nearClip() {
        return this._config.nearClip;
    }
    set nearClip(val) {
        this._config.nearClip = val;
    }
    get mode() {
        return this._shadowMode;
    }
    set mode(mode) {
        if (mode !== this._shadowMode) {
            if (mode !== 'none' && mode !== 'hard' && mode !== 'vsm' && mode !== 'esm' && mode !== 'pcf-pd' && mode !== 'pcf-opt') {
                console.error(`ShadowMapper.setShadowMode() failed: invalid mode: ${mode}`);
            }
            this._shadowMode = mode;
            this._resourceDirty = true;
            this._impl?.dispose();
            this._impl = null;
            if (this._shadowMode === 'hard') {
                this._impl = new SSM();
            }
            else if (this._shadowMode === 'vsm') {
                this._impl = new VSM(this._vsmBlurKernelSize, this._vsmBlurRadius, this._vsmDarkness);
            }
            else if (this._shadowMode === 'esm') {
                this._impl = new ESM(this._esmBlurKernelSize, this._esmBlurRadius, this._esmDepthScale);
            }
            else if (this._shadowMode === 'pcf-pd') {
                this._impl = new PCFPD(this._pdSampleCount, this._pdSampleRadius);
            }
            else if (this._shadowMode === 'pcf-opt') {
                this._impl = new PCFOPT(this._pcfKernelSize);
            }
        }
    }
    get depthClampEnabled() {
        return this._depthClampEnabled;
    }
    get cascadeDistances() {
        return this._cascadeDistances;
    }
    get shadowCameraParams() {
        return this._shadowCameraParams;
    }
    get shadowMap() {
        return this._impl.getShadowMap(this) || this._colorAttachment;
    }
    get shadowMapSampler() {
        return this._impl.getShadowMapSampler(this);
    }
    get shaderHash() {
        return `${this._impl.constructor.name}_${this._impl.getShaderHash()}_${this.light.lightType}_${this.shadowMap.target}_${Number(this.numShadowCascades > 1)}_${Number(this.shadowMap.device.getTextureCaps().getTextureFormatInfo(this.shadowMap.format).filterable)}`;
    }
    get pdSampleCount() {
        return this._pdSampleCount;
    }
    set pdSampleCount(val) {
        val = Math.min(Math.max(1, Number(val) >> 0), 64);
        if (val !== this._pdSampleCount) {
            this._pdSampleCount = val;
            this.asPCFPD() && (this.asPCFPD().tapCount = this._pdSampleCount);
        }
    }
    get pdSampleRadius() {
        return this._pdSampleRadius;
    }
    set pdSampleRadius(val) {
        val = Math.max(0, Number(val) >> 0);
        if (val !== this._pdSampleRadius) {
            this._pdSampleRadius = val;
            this.asPCFPD()?.setDepthScale(this._pdSampleRadius);
        }
    }
    get pcfKernelSize() {
        return this._pcfKernelSize;
    }
    set pcfKernelSize(val) {
        val = (val !== 3 && val !== 5 && val !== 7) ? 5 : val;
        if (val !== this._pcfKernelSize) {
            this._pcfKernelSize = val;
            this.asPCFOPT() && (this.asPCFOPT().kernelSize = this._pcfKernelSize);
        }
    }
    get vsmBlurKernelSize() {
        return this._vsmBlurKernelSize;
    }
    set vsmBlurKernelSize(val) {
        val = Math.max(3, Number(val) >> 0) | 1;
        if (val !== this._vsmBlurKernelSize) {
            this._vsmBlurKernelSize = val;
            this.asVSM() && (this.asVSM().kernelSize = this._vsmBlurKernelSize);
        }
    }
    get vsmBlurRadius() {
        return this._vsmBlurRadius;
    }
    set vsmBlurRadius(val) {
        val = Math.max(0, Number(val) || 0);
        if (val !== this._vsmBlurRadius) {
            this._vsmBlurRadius = val;
            this.asVSM() && (this.asVSM().blurSize = this._vsmBlurRadius);
        }
    }
    get vsmDarkness() {
        return this._vsmDarkness;
    }
    set vsmDarkness(val) {
        val = Math.min(0.999, Math.max(0, Number(val) || 0));
        if (val !== this._vsmDarkness) {
            this._vsmDarkness = val;
            this.asVSM()?.setDepthScale(this._vsmDarkness);
        }
    }
    get esmBlurKernelSize() {
        return this._esmBlurKernelSize;
    }
    set esmBlurKernelSize(val) {
        val = Math.max(3, Number(val) >> 0) | 1;
        if (val !== this._esmBlurKernelSize) {
            this._esmBlurKernelSize = val;
            this.asESM() && (this.asESM().kernelSize = this._esmBlurKernelSize);
        }
    }
    get esmBlurRadius() {
        return this._esmBlurRadius;
    }
    set esmBlurRadius(val) {
        val = Math.max(0, Number(val) || 0);
        if (val !== this._esmBlurRadius) {
            this._esmBlurRadius = val;
            this.asESM() && (this.asESM().blurSize = this._esmBlurRadius);
        }
    }
    get esmDepthScale() {
        return this._esmDepthScale;
    }
    set esmDepthScale(val) {
        val = Math.max(0, Number(val) || 0);
        if (val !== this._esmDepthScale) {
            this._esmDepthScale = val;
            this.asESM()?.setDepthScale(this._esmDepthScale);
        }
    }
    computeShadowMapDepth(scope) {
        return this._impl.computeShadowMapDepth(this, scope);
    }
    computeShadow(scope, shadowVertex, NdotL) {
        return this._impl.computeShadow(this, scope, shadowVertex, NdotL);
    }
    computeShadowCSM(scope, shadowVertex, NdotL, split) {
        return this._impl.computeShadowCSM(this, scope, shadowVertex, NdotL, split);
    }
    computeShadowBias(scope, z, NdotL) {
        const pb = scope.$builder;
        const lib = new ShaderLib(pb);
        const depthBiasParam = pb.getDeviceType() === 'webgl'
            ? scope.global.light.depthBias
            : scope.global.light.lightParams[4];
        if (this.light.isDirectionLight()) {
            return pb.dot(pb.mul(depthBiasParam.xy, pb.vec2(1, pb.sub(1, NdotL))), pb.vec2(1, 1));
        }
        else {
            const nearFar = pb.getDeviceType() === 'webgl'
                ? scope.global.light.shadowCameraParams.xy
                : scope.global.light.lightParams[5].xy;
            const linearDepth = lib.nonLinearDepthToLinearNormalized(z, nearFar);
            const biasScaleFactor = pb.mix(1, depthBiasParam.w, linearDepth);
            return pb.dot(pb.mul(depthBiasParam.xy, pb.vec2(1, pb.sub(1, NdotL)), biasScaleFactor), pb.vec2(1, 1));
        }
    }
    computeShadowBiasCSM(scope, NdotL, split) {
        const pb = scope.$builder;
        const depthBiasParam = pb.getDeviceType() === 'webgl'
            ? scope.global.light.depthBias
            : scope.global.light.lightParams[4];
        const splitFlags = pb.vec4(pb.float(pb.equal(split, 0)), pb.float(pb.equal(split, 1)), pb.float(pb.equal(split, 2)), pb.float(pb.equal(split, 3)));
        const depthBiasScale = pb.getDeviceType() === 'webgl'
            ? pb.dot(scope.global.light.depthBiasScales, splitFlags)
            : pb.dot(scope.global.light.lightParams[6], splitFlags);
        return pb.dot(pb.mul(depthBiasParam.xy, pb.vec2(1, pb.sub(1, NdotL)), depthBiasScale), pb.vec2(1, 1));
    }
    get depthBiasValues() {
        return this._depthBias[0];
    }
    get depthBiasScales() {
        return this._depthBiasScale;
    }
    get shadowMatrices() {
        return this._shadowMatrices;
    }
    invalidate() {
        this._framebuffer?.dispose();
        this._framebuffer = null;
        this._colorAttachment?.dispose();
        this._colorAttachment = null;
        this._depthAttachment?.dispose();
        this._depthAttachment = null;
    }
    dispose() {
        this.invalidate();
    }
    getColorAttachment() {
        return this._colorAttachment;
    }
    getDepthAttachment() {
        return this._depthAttachment;
    }
    isTextureInvalid(texture, target, format, width, height) {
        return texture && (texture.target !== target
            || texture.format !== format
            || texture.width !== width
            || texture.height !== height
            || texture.depth !== this.numShadowCascades);
    }
    createTexture(target, format, width, height, depth) {
        const options = {
            colorSpace: 'linear',
            noMipmap: true
        };
        switch (target) {
            case TextureTarget.Texture2D:
                return this._light.scene.device.createTexture2D(format, width, height, options);
            case TextureTarget.TextureCubemap:
                return this._light.scene.device.createCubeTexture(format, width, options);
            case TextureTarget.Texture2DArray:
                return this._light.scene.device.createTexture2DArray(format, width, height, depth, options);
            default:
                return null;
        }
    }
    updateResources() {
        if (this._resourceDirty) {
            this._resourceDirty = false;
            this._impl.invalidateResource();
            const device = this._light.scene.device;
            const colorFormat = this._impl.getShadowMapColorFormat(this);
            const depthFormat = this._impl.getShadowMapDepthFormat(this);
            const numCascades = this._light.isDirectionLight() ? this._config.numCascades : 1;
            const useTextureArray = numCascades > 1 && device.getDeviceType() !== 'webgl';
            const shadowMapWidth = (numCascades > 1 && !useTextureArray) ? 2 * this._config.shadowMapSize : this._config.shadowMapSize;
            const shadowMapHeight = (numCascades > 2 && !useTextureArray) ? 2 * this._config.shadowMapSize : this._config.shadowMapSize;
            const target = useTextureArray ? TextureTarget.Texture2DArray : this._light.isPointLight() ? TextureTarget.TextureCubemap : TextureTarget.Texture2D;
            if (this.isTextureInvalid(this._colorAttachment, target, colorFormat, shadowMapWidth, shadowMapHeight)) {
                this._framebuffer?.dispose();
                this._framebuffer = null;
                this._colorAttachment.dispose();
                this._colorAttachment = null;
            }
            if (this.isTextureInvalid(this._depthAttachment, TextureTarget.Texture2D, depthFormat, shadowMapWidth, shadowMapHeight)) {
                this._framebuffer?.dispose();
                this._framebuffer = null;
                this._depthAttachment.dispose();
                this._depthAttachment = null;
            }
            if (!this._colorAttachment || this._colorAttachment.disposed) {
                this._colorAttachment = this.createTexture(target, colorFormat, shadowMapWidth, shadowMapHeight, numCascades);
            }
            if (!this._depthAttachment || this._depthAttachment.disposed) {
                this._depthAttachment = this.createTexture(target, depthFormat, shadowMapWidth, shadowMapHeight, numCascades);
            }
            if (!this._framebuffer || this._framebuffer.disposed) {
                this._framebuffer = device.createFrameBuffer({
                    colorAttachments: [{ texture: this._colorAttachment }],
                    depthAttachment: { texture: this._depthAttachment },
                });
            }
        }
        if (this._colorAttachment) {
            this._impl.updateResources(this);
        }
    }
    createLightCameraPoint(lightCamera) {
        lightCamera.reparent(this._light);
        lightCamera.position.set(0, 0, 0);
        lightCamera.rotation.identity();
        lightCamera.scaling.set(1, 1, 1);
        lightCamera.projectionMatrix = Matrix4x4.perspective(Math.PI / 2, 1, this._config.nearClip, this._light.range);
    }
    createLightCameraSpot(lightCamera) {
        lightCamera.reparent(this._light);
        lightCamera.position.set(0, 0, 0);
        lightCamera.rotation.identity();
        lightCamera.scaling.set(1, 1, 1);
        lightCamera.projectionMatrix = Matrix4x4.perspective(2 * this._light.cutoff, 1, this._config.nearClip, this._light.range);
    }
    createLightCameraDirectional(sceneAABB, sceneCamera, lightCamera, cropMatrix, clipNear, border) {
        lightCamera.reparent(this._light);
        lightCamera.position.set(0, 0, 0);
        lightCamera.rotation.identity();
        lightCamera.scaling.set(1, 1, 1);
        border = border || 0;
        const expand = border / (1 - 2 * border);
        const frustum = sceneCamera.frustum;
        const sceneMin = ShadowMapper._sceneMin;
        const sceneMax = ShadowMapper._sceneMax;
        const frustumMin = ShadowMapper._frustumMin;
        const frustumMax = ShadowMapper._frustumMax;
        sceneMin.set(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        sceneMax.set(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
        sceneAABB.computePoints().forEach((p) => {
            const lsp = this._light.invWorldMatrix.transformPointAffine(p);
            sceneMin.inplaceMin(lsp);
            sceneMax.inplaceMax(lsp);
        });
        frustumMin.set(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        frustumMax.set(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
        frustum.corners.forEach((p) => {
            const lsPoint = this._light.invWorldMatrix.transformPointAffine(p);
            frustumMin.inplaceMin(lsPoint);
            frustumMax.inplaceMax(lsPoint);
        });
        const minx = Math.max(sceneMin.x, frustumMin.x);
        const maxx = Math.min(sceneMax.x, frustumMax.x);
        const miny = Math.max(sceneMin.y, frustumMin.y);
        const maxy = Math.min(sceneMax.y, frustumMax.y);
        const minz = Math.max(sceneMin.z, frustumMin.z);
        const texelSizeW = (maxx - minx) / this.shadowMapSize;
        const texelSizeH = (maxy - miny) / this.shadowMapSize;
        const cx = Math.floor((minx + maxx) / 2 / texelSizeW) * texelSizeW;
        const cy = Math.floor((miny + maxy) / 2 / texelSizeH) * texelSizeH;
        const hx = Math.floor((maxx - minx) * (expand + 0.5) / texelSizeW) * texelSizeW;
        const hy = Math.floor((maxy - miny) * (expand + 0.5) / texelSizeH) * texelSizeH;
        const maxz = clipNear ? Math.min(sceneMax.z, frustumMax.z) : sceneMax.z;
        lightCamera.position.set(cx, cy, sceneMax.z + 1);
        lightCamera.projectionMatrix = Matrix4x4.ortho(-hx, hx, -hy, hy, sceneMax.z - maxz + 1, sceneMax.z - minz + 1);
        if (cropMatrix) {
            let clipMaxX = 0, clipMaxY = 0;
            let clipMinX = Number.MAX_VALUE, clipMinY = Number.MAX_VALUE;
            frustum.corners.forEach((p) => {
                const clipPos = lightCamera.viewProjectionMatrix.transformPoint(p);
                clipPos.x = Math.min(1, Math.max(-1, clipPos.x / clipPos.w));
                clipPos.y = Math.min(1, Math.max(-1, clipPos.y / clipPos.w));
                if (clipPos.x > clipMaxX) {
                    clipMaxX = clipPos.x;
                }
                if (clipPos.x < clipMinX) {
                    clipMinX = clipPos.x;
                }
                if (clipPos.y > clipMaxY) {
                    clipMaxY = clipPos.y;
                }
                if (clipPos.y < clipMinY) {
                    clipMinY = clipPos.y;
                }
            });
            const clipW = clipMaxX - clipMinX;
            const clipH = clipMaxY - clipMinY;
            clipMinX -= expand * clipW;
            clipMinY -= expand * clipH;
            clipMaxX += expand * clipW;
            clipMaxY += expand * clipH;
            const scaleX = 2 / (clipMaxX - clipMinX);
            const scaleY = 2 / (clipMaxY - clipMinY);
            const offsetX = -0.5 * (clipMaxX + clipMinX) * scaleX;
            const offsetY = -0.5 * (clipMaxY + clipMinY) * scaleY;
            cropMatrix.identity();
            cropMatrix.m00 = scaleX;
            cropMatrix.m11 = scaleY;
            cropMatrix.m03 = offsetX;
            cropMatrix.m13 = offsetY;
        }
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
            result[i] = fLog * this._config.splitLambda + fUniform * (1 - this._config.splitLambda);
        }
        return result;
    }
    calcDepthBiasParams(shadowMapCamera, shadowMapSize, depthBias, normalBias, depthScale, result) {
        const sizeNear = Math.min(shadowMapCamera.projectionMatrix.getNearPlaneWidth(), shadowMapCamera.projectionMatrix.getNearPlaneHeight());
        const sizeFar = Math.min(shadowMapCamera.projectionMatrix.getFarPlaneWidth(), shadowMapCamera.projectionMatrix.getFarPlaneHeight());
        const scaleFactor = sizeNear / shadowMapSize / 2;
        result.set(depthBias * scaleFactor, normalBias * scaleFactor, depthScale, sizeFar / sizeNear);
    }
    postRenderShadowMap() {
        this._impl.postRenderShadowMap(this);
    }
    render(renderPass, scene, camera) {
        this.updateResources();
        const fb = this._framebuffer;
        this._depthClampEnabled = false;
        renderPass.scissor = null;
        renderPass.viewport = null;
        renderPass.clearColor = this._colorAttachment.isFloatFormat() ? new Vector4(1, 1, 1, 1) : new Vector4(0, 0, 0, 1);
        if (this._config.renderBackfaceOnly) {
            scene.device.setRenderStatesOverridden(this._cullFrontFaceRenderStates);
        }
        const depthScale = this._impl.getDepthScale();
        if (this._light.isPointLight()) {
            const shadowMapRenderCamera = this.fetchCameraForScene(scene);
            this.createLightCameraPoint(shadowMapRenderCamera);
            renderPass.cullCamera = shadowMapRenderCamera;
            this.calcDepthBiasParams(shadowMapRenderCamera, this._config.shadowMapSize, this._config.depthBias, this._config.normalBias, depthScale, this._depthBias[0]);
            this._shadowCameraParams.set(shadowMapRenderCamera.getNearPlane(), shadowMapRenderCamera.getFarPlane(), this._config.shadowMapSize, 1 / this._config.shadowMapSize);
            renderPass.renderToCubeTexture(scene, shadowMapRenderCamera, fb);
            this._shadowMatrices.set(Matrix4x4.transpose(shadowMapRenderCamera.viewMatrix).getArray());
            renderPass.cullCamera = null;
            this.releaseCamera(shadowMapRenderCamera);
        }
        else {
            if (this._config.numCascades > 1) {
                const distances = this.calcSplitDistances(camera, this._config.numCascades);
                const cascadeCamera = this.fetchCameraForScene(scene);
                const shadowMapRenderCamera = this.fetchCameraForScene(scene);
                const shadowMapCullCamera = this.fetchCameraForScene(scene);
                cascadeCamera.reparent(camera);
                this._depthClampEnabled = renderPass.renderScheme.device.getShaderCaps().supportFragmentDepth;
                for (let split = 0; split < this._config.numCascades; split++) {
                    cascadeCamera.projectionMatrix = Matrix4x4.perspective(camera.getFOV(), camera.getAspect(), distances[split], distances[split + 1]);
                    const cropMatrix = new Matrix4x4();
                    const border = 20 / this._config.shadowMapSize;
                    this.createLightCameraDirectional(scene.boundingBox, cascadeCamera, shadowMapRenderCamera, cropMatrix, this.depthClampEnabled, border);
                    this.createLightCameraDirectional(scene.boundingBox, cascadeCamera, shadowMapCullCamera, null, false, border);
                    this.calcDepthBiasParams(shadowMapRenderCamera, this._config.shadowMapSize, this._config.depthBias, this._config.normalBias, depthScale, this._depthBias[split]);
                    this._depthBiasScale.getArray()[split] = this._depthBias[0].x !== 0 ? this._depthBias[split].x / this._depthBias[0].x : 1;
                    this._shadowCameraParams.set(shadowMapRenderCamera.getNearPlane(), shadowMapRenderCamera.getFarPlane(), this._config.shadowMapSize, 1 / this._config.shadowMapSize);
                    if (this._colorAttachment.isTexture2DArray()) {
                        shadowMapRenderCamera.projectionMatrix.multiplyLeft(cropMatrix);
                        fb.setTextureLayer(0, split);
                        fb.setDepthTextureLayer(split);
                    }
                    else {
                        const numRows = this._config.numCascades > 2 ? 2 : 1;
                        const numCols = this._config.numCascades > 1 ? 2 : 1;
                        const adjMatrix = new Matrix4x4();
                        const col = split % 2;
                        const row = split >> 1;
                        adjMatrix.setRow(0, new Vector4(1.5 - 0.5 * numCols, 0, 0, 0));
                        adjMatrix.setRow(1, new Vector4(0, 1.5 - 0.5 * numRows, 0, 0));
                        adjMatrix.setRow(2, new Vector4(0, 0, 1, 0));
                        adjMatrix.setRow(3, new Vector4(col - 0.5 * numCols + 0.5, row - 0.5 * numRows + 0.5, 0, 1));
                        shadowMapRenderCamera.projectionMatrix.multiplyLeft(cropMatrix).multiplyLeft(adjMatrix);
                        if (scene.device.getDeviceType() === 'webgpu') {
                            renderPass.scissor = [col * this._config.shadowMapSize, (numRows - 1 - row) * this._config.shadowMapSize, this._config.shadowMapSize, this._config.shadowMapSize];
                        }
                        else {
                            renderPass.scissor = [col * this._config.shadowMapSize, row * this._config.shadowMapSize, this._config.shadowMapSize, this._config.shadowMapSize];
                        }
                    }
                    renderPass.renderQueue = renderPass.cullScene(scene, shadowMapCullCamera, false);
                    renderPass.renderToTexture(scene, shadowMapRenderCamera, fb);
                    renderPass.renderQueue = null;
                    this._shadowMatrices.set(Matrix4x4.transpose(shadowMapRenderCamera.viewProjectionMatrix).getArray(), split * 16);
                    this._cascadeDistances.getArray()[split] = distances[split + 1];
                }
                this.releaseCamera(cascadeCamera);
                this.releaseCamera(shadowMapRenderCamera);
                this.releaseCamera(shadowMapCullCamera);
            }
            else {
                const shadowMapRenderCamera = this.fetchCameraForScene(scene);
                if (this._light.isDirectionLight()) {
                    this.createLightCameraDirectional(scene.boundingBox, camera, shadowMapRenderCamera, null, false);
                }
                else {
                    this.createLightCameraSpot(shadowMapRenderCamera);
                }
                renderPass.renderQueue = renderPass.cullScene(scene, shadowMapRenderCamera, false);
                this.calcDepthBiasParams(shadowMapRenderCamera, this._config.shadowMapSize, this._config.depthBias, this._config.normalBias, depthScale, this._depthBias[0]);
                this._shadowCameraParams.set(shadowMapRenderCamera.getNearPlane(), shadowMapRenderCamera.getFarPlane(), this._config.shadowMapSize, 1 / this._config.shadowMapSize);
                renderPass.renderToTexture(scene, shadowMapRenderCamera, fb);
                renderPass.renderQueue = null;
                this._shadowMatrices.set(Matrix4x4.transpose(shadowMapRenderCamera.viewProjectionMatrix).getArray());
                this.releaseCamera(shadowMapRenderCamera);
            }
        }
        this.postRenderShadowMap();
        scene.device.setRenderStatesOverridden(null);
    }
    asSSM() {
        return this._impl?.getType() === 'hard' ? this._impl : null;
    }
    asVSM() {
        return this._impl?.getType() === 'vsm' ? this._impl : null;
    }
    asESM() {
        return this._impl?.getType() === 'esm' ? this._impl : null;
    }
    asPCFPD() {
        return this._impl?.getType() === 'pcf-pd' ? this._impl : null;
    }
    asPCFOPT() {
        return this._impl?.getType() === 'pcf-opt' ? this._impl : null;
    }
}

export { ShadowMapper };
//# sourceMappingURL=shadowmapper.js.map
