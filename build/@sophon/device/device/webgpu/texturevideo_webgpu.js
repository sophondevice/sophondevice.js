/** sophon base library */
import { WebGPUBaseTexture } from './basetexture_webgpu.js';

class WebGPUTextureVideo extends WebGPUBaseTexture {
    _source;
    constructor(device, element) {
        super(device);
        this._source = element;
        this._width = 0;
        this._height = 0;
        this.loadFromElement();
    }
    isTextureVideo() {
        return true;
    }
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }
    get source() {
        return this._source;
    }
    async restore() {
        if (!this._object && !this._device.isContextLost()) {
            this.loadElement(this._source);
        }
    }
    updateVideoFrame() {
        if ((!this._object || this._object.expired || this._object.expired === undefined) && this._source.readyState > 2) {
            this._object = this._device.gpuImportExternalTexture(this._source);
            return true;
        }
        return false;
    }
    createView(level, face, mipCount) {
        return null;
    }
    init() {
        this.loadFromElement();
    }
    loadFromElement() {
        this.loadElement(this._source);
    }
    loadElement(element) {
        this._width = element.videoWidth;
        this._height = element.videoHeight;
        if (!this._device.isContextLost()) {
            if (element.readyState > 2) {
                this._object = this._device.gpuImportExternalTexture(element);
            }
        }
        return !!this._object;
    }
}

export { WebGPUTextureVideo };
//# sourceMappingURL=texturevideo_webgpu.js.map
