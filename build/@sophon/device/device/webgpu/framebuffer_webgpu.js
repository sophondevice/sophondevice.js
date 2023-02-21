/** sophon base library */
import { WebGPUObject } from './gpuobject_webgpu.js';

class WebGPUFrameBuffer extends WebGPUObject {
    _options;
    _viewport;
    _scissor;
    _width;
    _height;
    _bindFlag;
    constructor(device, opt) {
        super(device);
        this._object = null;
        this._viewport = [0, 0, 0, 0];
        this._scissor = null;
        this._options = {
            colorAttachments: opt?.colorAttachments
                ? opt.colorAttachments.map((value) => Object.assign({ texture: null }, value))
                : null,
            depthAttachment: opt?.depthAttachment ? Object.assign({}, opt.depthAttachment) : null
        };
        this._width = 0;
        this._height = 0;
        this._bindFlag = 0;
        this._init();
    }
    get options() {
        return this._options;
    }
    get bindFlag() {
        return this._bindFlag;
    }
    getViewport() {
        return this._viewport;
    }
    setViewport(vp) {
        this._viewport = [...vp];
    }
    getScissorRect() {
        return this._scissor;
    }
    setScissorRect(scissor) {
        this._scissor = scissor ? [...scissor] : null;
    }
    getWidth() {
        return this._width;
    }
    getHeight() {
        return this._height;
    }
    async restore() {
        if (this._options?.depthAttachment?.texture?.disposed) {
            await this._options.depthAttachment.texture.reload();
        }
        if (this._options?.colorAttachments) {
            for (const k of this._options.colorAttachments) {
                if (k?.texture?.disposed) {
                    await k.texture.reload();
                }
            }
        }
        if (!this._device.isContextLost()) {
            this._init();
        }
    }
    destroy() {
        this._object = null;
    }
    setCubeTextureFace(index, face) {
        if (this._options.colorAttachments[index].face !== face) {
            this._options.colorAttachments[index].face = face;
            this._bindFlag++;
        }
    }
    setTextureLevel(index, level) {
        if (this._options.colorAttachments[index].level !== level) {
            this._options.colorAttachments[index].level = level;
            this._bindFlag++;
        }
    }
    setTextureLayer(index, layer) {
        if (this._options.colorAttachments[index].layer !== layer) {
            this._options.colorAttachments[index].layer = layer;
            this._bindFlag++;
        }
    }
    setDepthTextureLayer(layer) {
        if (this._options.depthAttachment && this._options.depthAttachment.layer !== layer) {
            this._options.depthAttachment.layer = layer;
            this._bindFlag++;
        }
    }
    getDepthAttachment() {
        return this._options?.depthAttachment?.texture || null;
    }
    getColorAttachments() {
        return this._options?.colorAttachments?.map(val => val?.texture || null) || [];
    }
    getColorFormats() {
        return this._options?.colorAttachments?.map(val => val?.texture?.gpuFormat || null);
    }
    getDepthFormat() {
        return this._options.depthAttachment?.texture?.gpuFormat || null;
    }
    bind() {
        throw new Error('no bind operatation for WebGPU');
    }
    unbind() {
        throw new Error('no unbind operatation for WebGPU');
    }
    _init() {
        this._width = 0;
        this._height = 0;
        for (const colorAttachment of this._options.colorAttachments) {
            if (colorAttachment.texture) {
                if (this._width === 0) {
                    this._width = colorAttachment.texture.width;
                }
                if (this._height === 0) {
                    this._height = colorAttachment.texture.height;
                }
                if (this._width !== colorAttachment.texture.width || this._height !== colorAttachment.texture.height) {
                    console.error('init frame buffer failed: color attachment textures must have same size');
                    return;
                }
            }
        }
        if (this._width === 0 || this._height === 0) {
            console.error('init frame buffer failed: can not create frame buffer with zero size');
            return;
        }
        this._object = {};
    }
    isFramebuffer() {
        return true;
    }
    getSampleCount() {
        return 1;
    }
}

export { WebGPUFrameBuffer };
//# sourceMappingURL=framebuffer_webgpu.js.map
