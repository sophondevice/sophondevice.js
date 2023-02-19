import { TextureTarget, linearTextureFormatToSRGB } from '../base_types';
import { textureTargetMap } from './constants_webgl';
import { WebGLBaseTexture } from './basetexture_webgl';
import { GPUResourceUsageFlags } from '../gpuobject';
export class WebGLTexture2DArray extends WebGLBaseTexture {
    constructor(device) {
        if (!device.isWebGL2) {
            throw new Error('device does not support 2d texture array');
        }
        super(device, TextureTarget.Texture2DArray);
    }
    isTexture2DArray() {
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
        if (this._mipLevelCount > 1) {
            this.generateMipmaps();
        }
    }
    updateFromElement(data, xOffset, yOffset, layerIndex, x, y, width, height) {
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
        if (x === 0 && y === 0 && width === data.width && height === data.height) {
            gl.texSubImage3D(textureTargetMap[this._target], 0, xOffset, yOffset, layerIndex, width, height, 1, params.glFormat, params.glType[0], data);
        }
        else {
            const cvs = document.createElement('canvas');
            cvs.width = width;
            cvs.height = height;
            const ctx = cvs.getContext('2d');
            ctx.drawImage(data, x, y, width, height, 0, 0, width, height);
            gl.texSubImage3D(textureTargetMap[this._target], 0, xOffset, yOffset, layerIndex, width, height, 1, params.glFormat, params.glType[0], cvs);
            cvs.width = 0;
            cvs.height = 0;
        }
        if (this._mipLevelCount > 1) {
            this.generateMipmaps();
        }
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
        if (this._object && this._mipLevelCount > 1) {
            const target = textureTargetMap[this._target];
            this._device.context.bindTexture(target, this._object);
            this._device.context.generateMipmap(target);
        }
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
//# sourceMappingURL=texture2darray_webgl.js.map