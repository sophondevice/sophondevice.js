import { Vector4, Matrix4x4, Quaternion, CubeFace } from '@sophon/base/math/vector';
import { CullVisitor } from '../visitors/cull_visitor';
import { Material } from '../material';
import { RENDER_PASS_TYPE_UNKNOWN } from '../values';
const cubeFaceList = [
    CubeFace.PX,
    CubeFace.NX,
    CubeFace.PY,
    CubeFace.NY,
    CubeFace.PZ,
    CubeFace.NZ,
];
export class RenderPass {
    _globalBindGroups;
    _renderScheme;
    _name;
    _mainCamera;
    _cullCamera;
    _renderQueue;
    _cullVisitor;
    _clearColor;
    _clearDepth;
    _clearStencil;
    _clearColorEnabled;
    _clearDepthEnabled;
    _clearStencilEnabled;
    _viewport;
    _scissor;
    _errorFlagNoCamera;
    _verticalFlip;
    _renderTimeStamp;
    constructor(renderScheme, name) {
        this._renderScheme = renderScheme;
        this._name = name;
        this._mainCamera = null;
        this._cullCamera = null;
        this._renderQueue = null;
        this._clearColor = new Vector4(0, 0, 0, 1);
        this._clearDepth = 1;
        this._clearStencil = 0;
        this._clearColorEnabled = true;
        this._clearDepthEnabled = true;
        this._clearStencilEnabled = true;
        this._globalBindGroups = {};
        this._cullVisitor = new CullVisitor(this);
        this._viewport = null;
        this._scissor = null;
        this._errorFlagNoCamera = false;
        this._verticalFlip = false;
        this._renderTimeStamp = 0;
    }
    get name() {
        return this._name;
    }
    get renderScheme() {
        return this._renderScheme;
    }
    get device() {
        return this._renderScheme.device;
    }
    get cullCamera() {
        return this._cullCamera;
    }
    set cullCamera(camera) {
        this._cullCamera = camera;
    }
    get mainCamera() {
        return this._mainCamera;
    }
    get renderQueue() {
        return this._renderQueue;
    }
    set renderQueue(list) {
        this._renderQueue = list;
    }
    get clearColor() {
        return this._clearColor;
    }
    set clearColor(color) {
        this._clearColor.assign(color.getArray());
    }
    get clearDepth() {
        return this._clearDepth;
    }
    set clearDepth(depth) {
        this._clearDepth = depth;
    }
    get clearStencil() {
        return this._clearStencil;
    }
    set clearStencil(stencil) {
        this._clearStencil = stencil;
    }
    get viewport() {
        return this._viewport ? [...this._viewport] : null;
    }
    set viewport(vp) {
        this._viewport = vp ? [...vp] : null;
    }
    get scissor() {
        return this._scissor ? [...this._scissor] : null;
    }
    set scissor(scissor) {
        this._scissor = scissor ? [...scissor] : null;
    }
    get cullVisitor() {
        return this._cullVisitor;
    }
    set cullVisitor(visitor) {
        this._cullVisitor = visitor;
    }
    get verticalFlip() {
        return this._verticalFlip;
    }
    set verticalFlip(b) {
        this._verticalFlip = !!b;
    }
    get renderTimeStamp() {
        return this._renderTimeStamp;
    }
    getRenderPassType() {
        return RENDER_PASS_TYPE_UNKNOWN;
    }
    isAutoFlip() {
        return !!(this._renderScheme.device.getFramebuffer() && this._renderScheme.device.getDeviceType() === 'webgpu');
    }
    enableClear(color, depthStencil) {
        this._clearColorEnabled = !!color;
        this._clearDepthEnabled = !!depthStencil;
        this._clearStencilEnabled = !!depthStencil;
    }
    render(scene, camera) {
        this._mainCamera = camera;
        const device = this._renderScheme.device;
        this._renderTimeStamp = device.frameInfo.frameTimestamp;
        const cullCamera = this._cullCamera || camera;
        this.drawScene(scene, camera, cullCamera, false);
        this._mainCamera = null;
    }
    renderToCubeTexture(scene, camera, frameBuffer) {
        this._mainCamera = camera;
        const device = this._renderScheme.device;
        this._renderTimeStamp = device.frameInfo.frameTimestamp;
        const cullCamera = this._cullCamera || camera;
        const saveRT = device.getFramebuffer();
        const saveViewport = device.getViewport();
        const saveScissor = device.getScissor();
        const r = new Quaternion(camera.rotation);
        const savedProjMatrix = camera.projectionMatrix;
        const znear = camera.getNearPlane();
        const zfar = camera.getFarPlane();
        camera.projectionMatrix = Matrix4x4.perspective(Math.PI / 2, 1, znear, zfar);
        this._renderScheme.device.setFramebuffer(frameBuffer);
        for (const face of cubeFaceList) {
            camera.lookAtCubeFace(face);
            frameBuffer.setCubeTextureFace(0, face);
            this.drawScene(scene, camera, cullCamera, false);
        }
        camera.rotation = r;
        camera.projectionMatrix = savedProjMatrix;
        device.setFramebuffer(saveRT);
        device.setViewport(saveViewport);
        device.setScissor(saveScissor);
        this._mainCamera = null;
    }
    renderToTexture(scene, camera, frameBuffer) {
        this._mainCamera = camera;
        const device = this._renderScheme.device;
        this._renderTimeStamp = device.frameInfo.frameTimestamp;
        const cullCamera = this._cullCamera || camera;
        const saveRT = device.getFramebuffer();
        const saveViewport = device.getViewport();
        const saveScissor = device.getScissor();
        this._renderScheme.device.setFramebuffer(frameBuffer);
        this.drawScene(scene, camera, cullCamera, false);
        this._renderScheme.device.setFramebuffer(saveRT);
        device.setFramebuffer(saveRT);
        device.setViewport(saveViewport);
        device.setScissor(saveScissor);
        this._mainCamera = null;
    }
    getGlobalBindGroup(ctx) {
        const hash = this.getGlobalBindGroupHash(ctx);
        let bindGroup = this._globalBindGroups[hash];
        if (!bindGroup) {
            const that = this;
            const pb = this.device.createProgramBuilder();
            const ret = pb.buildRender({
                vertex() {
                    that.setGlobalBindings(this, ctx);
                    this.$mainFunc(function () {
                    });
                },
                fragment() {
                    that.setGlobalBindings(this, ctx);
                    this.$mainFunc(function () {
                    });
                }
            });
            bindGroup = this.device.createBindGroup(ret[2][0]);
            this._globalBindGroups[hash] = bindGroup;
        }
        if (bindGroup.disposed) {
            bindGroup.reload();
        }
        return bindGroup;
    }
    dispose() {
        for (const k in this._globalBindGroups) {
            Material.bindGroupGarbageCollect(this._globalBindGroups[k]);
        }
        this._globalBindGroups = {};
    }
    getGlobalBindGroupHash(ctx) {
        return `${this.constructor.name}:${this._getGlobalBindGroupHash(ctx)}`;
    }
    setCameraUniforms(bindGroup, ctx, flip) {
        const cameraStruct = {
            position: ctx.camera.worldMatrix.getRow(3).xyz(),
            viewProjectionMatrix: ctx.camera.viewProjectionMatrix,
            viewMatrix: ctx.camera.viewMatrix,
            projectionMatrix: ctx.camera.projectionMatrix,
            params: new Vector4(ctx.camera.getNearPlane(), ctx.camera.getFarPlane(), flip ? 1 : 0, ctx.camera.linearOutputEnabled ? 0 : 1)
        };
        bindGroup.setValue('global', {
            camera: cameraStruct
        });
    }
    drawSceneToTexture(scene, renderCamera, cullCamera, target, forceCull) {
        this._renderScheme.device.setFramebuffer(target);
        this.drawScene(scene, renderCamera, cullCamera, forceCull);
        this._renderScheme.device.setFramebuffer(null);
    }
    drawSceneToCubeTexture(scene, renderCamera, target) {
        const r = new Quaternion(renderCamera.rotation);
        const savedProjMatrix = renderCamera.projectionMatrix;
        const znear = renderCamera.getNearPlane();
        const zfar = renderCamera.getFarPlane();
        renderCamera.projectionMatrix = Matrix4x4.perspective(Math.PI / 2, 1, znear, zfar);
        for (const face of cubeFaceList) {
            renderCamera.lookAtCubeFace(face);
            target.setCubeTextureFace(0, face);
            this.drawSceneToTexture(scene, renderCamera, renderCamera, target, true);
        }
        renderCamera.rotation = r;
        renderCamera.projectionMatrix = savedProjMatrix;
    }
    drawScene(scene, renderCamera, cullCamera, forceCull) {
        const device = this._renderScheme.device;
        device.setViewport(this._viewport);
        device.setScissor(this._scissor);
        this.clearFramebuffer();
        if (scene) {
            const renderQueue = this.cullScene(scene, cullCamera, forceCull);
            if (renderQueue) {
                const windingReversed = device.isWindingOrderReversed();
                device.reverseVertexWindingOrder(this._verticalFlip !== this.isAutoFlip());
                renderCamera.enableLinearOutput(!!device.getFramebuffer()?.getColorAttachments()[0]);
                this.renderItems(renderCamera, renderQueue, scene.lightList);
                device.reverseVertexWindingOrder(windingReversed);
            }
        }
    }
    cullScene(scene, cullCamera, force) {
        if (this._renderQueue && !force) {
            return this._renderQueue;
        }
        else {
            if (cullCamera) {
                this._cullVisitor.renderQueue.clear();
                this._cullVisitor.camera = cullCamera;
                if (scene.octree) {
                    scene.octree.getRootNode().traverse(this._cullVisitor);
                }
                else {
                    scene.rootNode.traverse(this._cullVisitor);
                }
                return this._cullVisitor.renderQueue;
            }
        }
        return null;
    }
    clearFramebuffer() {
        const clearColor = this._clearColorEnabled ? this._clearColor : null;
        const clearDepth = this._clearDepthEnabled ? this._clearDepth : null;
        const clearStencil = this._clearStencilEnabled ? this._clearStencil : null;
        this._renderScheme.device.clearFrameBuffer(clearColor, clearDepth, clearStencil);
    }
}
//# sourceMappingURL=renderpass.js.map