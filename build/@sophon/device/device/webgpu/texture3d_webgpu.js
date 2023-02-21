/** sophon base library */
import { TextureTarget, linearTextureFormatToSRGB, getTextureFormatBlockWidth, getTextureFormatBlockHeight, getTextureFormatBlockSize } from '../base_types.js';
import { WebGPUBaseTexture } from './basetexture_webgpu.js';
import { GPUResourceUsageFlags } from '../gpuobject.js';

class WebGPUTexture3D extends WebGPUBaseTexture {
    constructor(device) {
        super(device, TextureTarget.Texture2D);
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
        this.uploadRaw(data, width, height, depth, xOffset, yOffset, zOffset, 0);
    }
    updateFromElement(data, xOffset, yOffset, zOffset, width, height) {
        if (this._device.isContextLost()) {
            return;
        }
        if (!this._object) {
            this.allocInternal(this._format, this._width, this._height, this._depth, this._mipLevelCount);
        }
        const cvs = document.createElement('canvas');
        cvs.width = width;
        cvs.height = height;
        const ctx = cvs.getContext('2d');
        ctx.drawImage(data, 0, 0, width, height, 0, 0, width, height);
        this.uploadImageData(cvs, width, height, xOffset, yOffset, 0, zOffset);
    }
    createEmpty(format, width, height, depth, creationFlags) {
        this._flags = Number(creationFlags) || 0;
        format = (this._flags & GPUResourceUsageFlags.TF_LINEAR_COLOR_SPACE) ? format : linearTextureFormatToSRGB(format);
        this.loadEmpty(format, width, height, depth, 0);
    }
    createView(level, face, mipCount) {
        return this._object ? this._device.gpuCreateTextureView(this._object, {
            dimension: '2d',
            baseMipLevel: 0,
            mipLevelCount: 1,
            baseArrayLayer: face,
            arrayLayerCount: 1,
        }) : null;
    }
    async readPixels(layer, x, y, w, h, buffer) {
        const blockWidth = getTextureFormatBlockWidth(this.format);
        const blockHeight = getTextureFormatBlockHeight(this.format);
        const blockSize = getTextureFormatBlockSize(this.format);
        const blocksPerRow = this.width / blockWidth;
        const blocksPerCol = this.height / blockHeight;
        const imageSize = blocksPerRow * blocksPerCol * blockSize;
        if (buffer.byteLength < imageSize) {
            throw new Error(`Texture2D.readPixels() failed: destination buffer size is ${buffer.byteLength}, should be at least ${imageSize}`);
        }
        const tmpBuffer = this._device.createBuffer(imageSize, { usage: 'read' });
        await this.copyPixelDataToBuffer(x, y, w, h, layer, 0, tmpBuffer);
        await tmpBuffer.getBufferSubData(new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength), 0, imageSize);
        tmpBuffer.dispose();
    }
    readPixelsToBuffer(layer, x, y, w, h, buffer) {
        this.copyPixelDataToBuffer(x, y, w, h, layer, 0, buffer);
    }
    loadEmpty(format, width, height, depth, numMipLevels) {
        this.allocInternal(format, width, height, depth, numMipLevels);
        if (this._mipLevelCount > 1 && !this._device.isContextLost()) {
            this.generateMipmaps();
        }
    }
}

export { WebGPUTexture3D };
//# sourceMappingURL=texture3d_webgpu.js.map
