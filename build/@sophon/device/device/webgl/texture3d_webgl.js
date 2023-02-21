/** sophon base library */
import { TextureTarget, linearTextureFormatToSRGB } from '../base_types.js';
import { textureTargetMap } from './constants_webgl.js';
import { WebGLBaseTexture } from './basetexture_webgl.js';
import { GPUResourceUsageFlags } from '../gpuobject.js';

class WebGLTexture3D extends WebGLBaseTexture {
    constructor(device) {
        if (!device.isWebGL2) {
            throw new Error('device does not support 3D texture');
        }
        super(device, TextureTarget.Texture3D);
    }
    get depth() {
        return this._depth;
    }
    isTexture3D() {
        return true;
    }
    init() {
        this.loadEmpty(this._format, this._width, this._height, this._depth, this._mipLevelCount);
    }
    update(data, xOffset, yOffset, zOffset, width, height, depth) {
        if (this._device.isContextLost()) {
            return;
        }
        if (!this._object) {
            this.allocInternal(this._format, this._width, this._height, this._depth, this._mipLevelCount);
        }
        const params = this.getTextureCaps().getTextureFormatInfo(this._format);
        const gl = this._device.context;
        gl.bindTexture(textureTargetMap[this._target], this._object);
        gl.pixelStorei(this._device.context.UNPACK_ALIGNMENT, 1);
        gl.texSubImage3D(textureTargetMap[this._target], 0, xOffset, yOffset, zOffset, width, height, depth, params.glFormat, params.glType[0], data);
    }
    createEmpty(format, width, height, depth, creationFlags) {
        this._flags = Number(creationFlags) || 0;
        if (this._flags & GPUResourceUsageFlags.TF_WRITABLE) {
            console.error(new Error('webgl device does not support storage texture'));
        }
        else {
            format = (this._flags & GPUResourceUsageFlags.TF_LINEAR_COLOR_SPACE) ? format : linearTextureFormatToSRGB(format);
            this.loadEmpty(format, width, height, depth, 0);
        }
    }
    generateMipmaps() {
    }
    readPixels(layer, x, y, w, h, buffer) {
        return new Promise(resolve => {
            const fb = this._device.createFrameBuffer({
                colorAttachments: [{ texture: this, layer }]
            });
            const savedViewport = this._device.getViewport();
            const savedScissor = this._device.getScissor();
            const savedFB = this._device.getFramebuffer();
            this._device.setFramebuffer(fb);
            this._device.readPixels(x, y, w, h, buffer).then(() => {
                fb.dispose();
                resolve();
            });
            this._device.setFramebuffer(savedFB);
            this._device.setViewport(...savedViewport);
            this._device.setScissor(...savedScissor);
        });
    }
    readPixelsToBuffer(layer, x, y, w, h, buffer) {
        const fb = this._device.createFrameBuffer({
            colorAttachments: [{ texture: this, layer }]
        });
        const savedViewport = this._device.getViewport();
        const savedScissor = this._device.getScissor();
        const savedFB = this._device.getFramebuffer();
        this._device.setFramebuffer(fb);
        this._device.readPixelsToBuffer(x, y, w, h, buffer);
        this._device.setFramebuffer(savedFB);
        this._device.setViewport(...savedViewport);
        this._device.setScissor(...savedScissor);
        fb.dispose();
    }
    loadEmpty(format, width, height, depth, numMipLevels) {
        this.allocInternal(format, width, height, depth, numMipLevels);
        if (this._mipLevelCount > 1 && !this._device.isContextLost()) {
            this.generateMipmaps();
        }
    }
}

export { WebGLTexture3D };
//# sourceMappingURL=texture3d_webgl.js.map
