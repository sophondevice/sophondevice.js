/** sophon base library */
import { Matrix4x4, Frustum } from '@sophon/base';
import { SceneNode } from './scene_node.js';

class Camera extends SceneNode {
    _projMatrix;
    _viewMatrix;
    _viewProjMatrix;
    _invViewProjMatrix;
    _framestamp;
    _xformDirty;
    _linearOutput;
    _model;
    _mouseInputSource;
    _keyboardInputSource;
    _cameraTag;
    _frustum;
    constructor(scene, projectionMatrix) {
        super(scene);
        this._projMatrix = projectionMatrix || Matrix4x4.identity();
        this._viewMatrix = Matrix4x4.identity();
        this._viewProjMatrix = Matrix4x4.identity();
        this._invViewProjMatrix = Matrix4x4.identity();
        this._framestamp = { frameId: 0, timestamp: 0 };
        this._xformDirty = true;
        this._linearOutput = false;
        this._model = null;
        this._cameraTag = 0;
        this._frustum = null;
        this._mouseInputSource = null;
        this._keyboardInputSource = null;
        this._projMatrix.setChangeCallback(() => this._invalidate());
        this.addDefaultEventListener('xform_change', () => this._invalidate());
    }
    get cameraTag() {
        return this._cameraTag;
    }
    get framestamp() {
        return this._framestamp;
    }
    get mouseInputSource() {
        return this._mouseInputSource;
    }
    set mouseInputSource(inputSource) {
        if (inputSource !== this._mouseInputSource) {
            if (this._model) {
                this._model.uninstallMouseInput(this._mouseInputSource);
            }
            this._mouseInputSource = inputSource;
            if (this._model) {
                this._model.installMouseInput(this._mouseInputSource);
            }
        }
    }
    get keyboardInputSource() {
        return this._keyboardInputSource;
    }
    set keyboardInputSource(inputSource) {
        if (inputSource !== this._keyboardInputSource) {
            if (this._model) {
                this._model.uninstallKeyboardInput(this._keyboardInputSource);
            }
            this._keyboardInputSource = inputSource;
            if (this._model) {
                this._model.installKeyboardInput(this._keyboardInputSource);
            }
        }
    }
    lookAt(eye, target, up) {
        Matrix4x4.lookAt(eye, target, up).decompose(this.scaling, this.rotation, this.position);
        return this;
    }
    lookAtCubeFace(face, position) {
        Matrix4x4.lookAtCubeFace(face).decompose(this.scaling, this.rotation, this.position);
        if (position) {
            this.position = position;
        }
    }
    get projectionMatrix() {
        return this._projMatrix;
    }
    set projectionMatrix(matrix) {
        this.setProjectionMatrix(matrix);
    }
    setProjectionMatrix(matrix) {
        this._projMatrix.assign(matrix.getArray());
        this._invalidate();
        return this;
    }
    get viewMatrix() {
        if (this._xformDirty) {
            this._xformDirty = false;
            this._computeViewProj();
        }
        return this._viewMatrix;
    }
    get viewProjectionMatrix() {
        if (this._xformDirty) {
            this._xformDirty = false;
            this._computeViewProj();
        }
        return this._viewProjMatrix;
    }
    get invViewProjectionMatrix() {
        if (this._xformDirty) {
            this._xformDirty = false;
            this._computeViewProj();
        }
        return this._invViewProjMatrix;
    }
    get frustum() {
        if (!this._frustum) {
            this._frustum = new Frustum();
            this._frustum.setMatrix(this.viewProjectionMatrix, Matrix4x4.identity());
        }
        return this._frustum;
    }
    get linearOutputEnabled() {
        return this._linearOutput;
    }
    set linearOutputEnabled(val) {
        this.enableLinearOutput(val);
    }
    get model() {
        return this._model || null;
    }
    set model(model) {
        this.setModel(model);
    }
    enableLinearOutput(val) {
        this._linearOutput = val;
        return this;
    }
    isPerspective() {
        return this._projMatrix.isPerspective();
    }
    isOrtho() {
        return this._projMatrix.isOrtho();
    }
    isCamera() {
        return true;
    }
    getNearPlane() {
        return this._projMatrix.getNearPlane();
    }
    getFarPlane() {
        return this._projMatrix.getFarPlane();
    }
    getFOV() {
        return this._projMatrix.getFov();
    }
    getTanHalfFovy() {
        return this._projMatrix.getTanHalfFov();
    }
    getAspect() {
        return this._projMatrix.getAspect();
    }
    setNearFar(znear, zfar) {
        this._projMatrix.setNearFar(znear, zfar);
    }
    setModel(model) {
        if (this._model !== model) {
            if (model && model._getCamera() && model._getCamera() !== this) {
                throw new Error('Camera.setModel failed: one camera model object cannot be assigned to multiple camera');
            }
            if (this._model) {
                this._model._setCamera(null);
            }
            this._model = model || null;
            if (this._model) {
                this._model._setCamera(this);
            }
        }
        return this;
    }
    frameUpdate() {
        this._framestamp.frameId++;
        this._framestamp.timestamp = Date.now();
        if (this._model) {
            this._model.update();
        }
    }
    _invalidate() {
        this._xformDirty = true;
        this._cameraTag++;
        this._frustum = null;
    }
    _computeViewProj() {
        Matrix4x4.inverseAffine(this.worldMatrix, this._viewMatrix);
        Matrix4x4.multiply(this._projMatrix, this._viewMatrix, this._viewProjMatrix);
        Matrix4x4.inverse(this._viewProjMatrix, this._invViewProjMatrix);
    }
    dispose() {
        this.setModel(null);
        this._projMatrix = null;
        this._viewMatrix = null;
        this._viewProjMatrix = null;
    }
}

export { Camera };
//# sourceMappingURL=camera.js.map
