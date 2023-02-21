/** sophon base library */
class BaseCameraModel {
    _camera;
    _mouseDownHandler;
    _mouseUpHandler;
    _mouseWheelHandler;
    _mouseMoveHandler;
    _keyDownHandler;
    _keyUpHandler;
    constructor() {
        this._camera = null;
        this._mouseDownHandler = this.onMouseDown.bind(this);
        this._mouseUpHandler = this.onMouseUp.bind(this);
        this._mouseWheelHandler = this.onMouseWheel.bind(this);
        this._mouseMoveHandler = this.onMouseMove.bind(this);
        this._keyDownHandler = this.onKeyDown.bind(this);
        this._keyUpHandler = this.onKeyUp.bind(this);
        this.reset();
    }
    _getCamera() {
        return this._camera;
    }
    _setCamera(camera) {
        if (this._camera !== camera) {
            if (this._camera) {
                this.uninstallMouseInput(this._camera.mouseInputSource);
                this.uninstallKeyboardInput(this._camera.keyboardInputSource);
            }
            this._camera = camera;
            if (this._camera) {
                this.installMouseInput(this._camera.mouseInputSource);
                this.installKeyboardInput(this._camera.keyboardInputSource);
                this.reset();
            }
        }
    }
    installMouseInput(input) {
        if (input) {
            input.addEventListener('mousedown', this._mouseDownHandler);
            input.addEventListener('mouseup', this._mouseUpHandler);
            input.addEventListener('wheel', this._mouseWheelHandler);
            input.addEventListener('mousemove', this._mouseMoveHandler);
        }
    }
    uninstallMouseInput(input) {
        if (input) {
            input.removeEventListener('mousedown', this._mouseDownHandler);
            input.removeEventListener('mouseup', this._mouseUpHandler);
            input.removeEventListener('wheel', this._mouseWheelHandler);
            input.removeEventListener('mousemove', this._mouseMoveHandler);
        }
    }
    installKeyboardInput(input) {
        if (input) {
            input.addEventListener('keydown', this._keyDownHandler);
            input.addEventListener('keyup', this._keyUpHandler);
        }
    }
    uninstallKeyboardInput(input) {
        if (input) {
            input.removeEventListener('keydown', this._keyDownHandler);
            input.removeEventListener('keyup', this._keyUpHandler);
        }
    }
    reset() { }
    onMouseDown(evt) {
        if (evt.target === this._camera?.mouseInputSource) {
            this._onMouseDown(evt);
        }
    }
    onMouseUp(evt) {
        if (evt.target === this._camera?.mouseInputSource) {
            this._onMouseUp(evt);
        }
    }
    onMouseWheel(evt) {
        if (evt.target === this._camera?.mouseInputSource) {
            this._onMouseWheel(evt);
        }
    }
    onMouseMove(evt) {
        if (evt.target === this._camera?.mouseInputSource) {
            this._onMouseMove(evt);
        }
    }
    onKeyDown(evt) {
        if (evt.target === this._camera?.keyboardInputSource) {
            this._onKeyDown(evt);
        }
    }
    onKeyUp(evt) {
        if (evt.target === this._camera?.keyboardInputSource) {
            this._onKeyUp(evt);
        }
    }
    update() { }
    _onMouseDown(evt) { }
    _onMouseUp(evt) { }
    _onMouseWheel(evt) { }
    _onMouseMove(evt) { }
    _onKeyDown(evt) { }
    _onKeyUp(evt) { }
}

export { BaseCameraModel };
//# sourceMappingURL=base.js.map
