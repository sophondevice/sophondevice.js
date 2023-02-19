import { TextureTarget, TextureFormat } from '../base_types';
import { textureTargetMap } from './constants_webgl';
import { WebGLBaseTexture } from './basetexture_webgl';
import { GPUResourceUsageFlags } from '../gpuobject';
export class WebGLTextureVideo extends WebGLBaseTexture {
    _source;
    _callbackId;
    constructor(device, source) {
        super(device, TextureTarget.Texture2D);
        this._source = null;
        this._callbackId = null;
        this._format = TextureFormat.Unknown;
        this.loadFromElement(source);
    }
    isTextureVideo() {
        return true;
    }
    get source() {
        return this._source;
    }
    destroy() {
        if (this._source && this._callbackId !== null) {
            this._source.cancelVideoFrameCallback(this._callbackId);
        }
        super.destroy();
    }
    init() {
        this.loadElement(this._source);
    }
    loadFromElement(el) {
        this._flags = GPUResourceUsageFlags.TF_NO_MIPMAP | GPUResourceUsageFlags.TF_LINEAR_COLOR_SPACE;
        this.loadElement(el);
    }
    generateMipmaps() {
    }
    updateVideoFrame() {
        if (this.object && this._source.currentTime > 0 && !this._source.requestVideoFrameCallback) {
            this.update();
            return true;
        }
        return false;
    }
    update() {
        this.allocInternal(TextureFormat.RGBA8UNORM, this._source.videoWidth, this._source.videoHeight, 1, 1);
        if (!this._device.isContextLost()) {
            const target = textureTargetMap[this._target];
            const params = this.getTextureCaps().getTextureFormatInfo(this._format);
            this._device.context.bindTexture(target, this._object);
            this._device.context.pixelStorei(this._device.context.UNPACK_ALIGNMENT, 1);
            this._device.context.texImage2D(target, 0, params.glInternalFormat, params.glFormat, params.glType[0], this._source);
        }
    }
    loadElement(element) {
        if (this._source && this._callbackId !== null) {
            this._source.cancelVideoFrameCallback(this._callbackId);
            this._callbackId = null;
        }
        this._source = element;
        if (this._source?.requestVideoFrameCallback) {
            const that = this;
            that._callbackId = this._source.requestVideoFrameCallback(function cb() {
                if (that._object) {
                    that.update();
                    that._callbackId = that._source.requestVideoFrameCallback(cb);
                }
            });
        }
        this.allocInternal(TextureFormat.RGBA8UNORM, Math.max(this._source.videoWidth, 1), Math.max(this._source.videoHeight, 1), 1, 1);
    }
}
//# sourceMappingURL=texturevideo_webgl.js.map