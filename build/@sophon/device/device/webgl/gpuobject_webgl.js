/** sophon base library */
import { DeviceGPUObjectRenameEvent } from '../device.js';
import { genDefaultName } from '../gpuobject.js';

let _uniqueId = 0;
class WebGLGPUObject {
    _device;
    _object;
    _uid;
    _cid;
    _name;
    _restoreHandler;
    constructor(device) {
        this._device = device;
        this._object = null;
        this._uid = ++_uniqueId;
        this._cid = 1;
        this._name = `${genDefaultName(this)}#${this._uid}`;
        this._restoreHandler = null;
        this._device.addGPUObject(this);
    }
    get device() {
        return this._device;
    }
    get object() {
        return this._object;
    }
    get disposed() {
        return !this._object;
    }
    get restoreHandler() {
        return this._restoreHandler;
    }
    set restoreHandler(handler) {
        this._restoreHandler = handler;
    }
    get uid() {
        return this._uid;
    }
    get cid() {
        return this._cid;
    }
    get name() {
        return this._name;
    }
    set name(val) {
        if (val !== this._name) {
            const evt = new DeviceGPUObjectRenameEvent(this, this._name);
            this._name = val;
            this._device.dispatchEvent(evt);
        }
    }
    isVAO() {
        return false;
    }
    isFramebuffer() {
        return false;
    }
    isSampler() {
        return false;
    }
    isTexture() {
        return false;
    }
    isTexture2D() {
        return false;
    }
    isTexture2DArray() {
        return false;
    }
    isTexture3D() {
        return false;
    }
    isTextureCube() {
        return false;
    }
    isTextureVideo() {
        return false;
    }
    isProgram() {
        return false;
    }
    isBuffer() {
        return false;
    }
    isBindGroup() {
        return false;
    }
    dispose() {
        if (!this.disposed) {
            this._device.disposeObject(this, true);
        }
    }
    async reload() {
        if (this.disposed) {
            const p = this._device.restoreObject(this);
            this._cid++;
            return p;
        }
    }
    destroy() {
        throw new Error('Abstract function call: destroy()');
    }
    async restore() {
        throw new Error('Abstract function call: restore()');
    }
}

export { WebGLGPUObject };
//# sourceMappingURL=gpuobject_webgl.js.map
