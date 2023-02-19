import { TextureFormat, TextureTarget, linearTextureFormatToSRGB, getTextureFormatBlockWidth, getTextureFormatBlockHeight, getTextureFormatBlockSize } from '../base_types';
import { WebGPUBaseTexture } from './basetexture_webgpu';
import { GPUResourceUsageFlags } from '../gpuobject';
export class WebGPUTextureCube extends WebGPUBaseTexture {
    constructor(device) {
        super(device, TextureTarget.TextureCubemap);
    }
    init() {
        this.loadEmpty(this._format, this._width, this._mipLevelCount);
    }
    update(data, xOffset, yOffset, width, height, face) {
        if (this._device.isContextLost()) {
            return;
        }
        if (!this._object) {
            this.allocInternal(this._format, this._width, this._height, 1, this._mipLevelCount);
        }
        this.uploadRaw(data, width, height, 1, xOffset, yOffset, face, 0);
        if (this._mipLevelCount > 1) {
            this.generateMipmaps();
        }
    }
    updateFromElement(data, xOffset, yOffset, face, x, y, width, height) {
        if (this._device.isContextLost()) {
            return;
        }
        if (!this._object) {
            this.allocInternal(this._format, this._width, this._height, 1, this._mipLevelCount);
        }
        if (data instanceof HTMLCanvasElement && x === 0 && y === 0) {
            this.uploadImageData(data, width, height, xOffset, yOffset, 0, face || 0);
        }
        else {
            const cvs = document.createElement('canvas');
            cvs.width = width;
            cvs.height = height;
            const ctx = cvs.getContext('2d');
            ctx.drawImage(data, x, y, width, height, 0, 0, width, height);
            this.uploadImageData(cvs, width, height, xOffset, yOffset, 0, face || 0);
            cvs.width = 0;
            cvs.height = 0;
        }
    }
    createEmpty(format, size, creationFlags) {
        this._flags = Number(creationFlags) || 0;
        if (this._flags & GPUResourceUsageFlags.TF_WRITABLE) {
            console.error(new Error('storage texture can not be cube texture'));
        }
        else {
            format = (this._flags & GPUResourceUsageFlags.TF_LINEAR_COLOR_SPACE) ? format : linearTextureFormatToSRGB(format);
            this.loadEmpty(format, size, 0);
        }
    }
    loadFaceImages(images, creationFlags) {
        this._flags = Number(creationFlags) || 0;
        if (this._flags & GPUResourceUsageFlags.TF_WRITABLE) {
            console.error(new Error('storage texture can not be cube texture'));
        }
        else {
            const format = (this._flags & GPUResourceUsageFlags.TF_LINEAR_COLOR_SPACE) ? TextureFormat.RGBA8UNORM : TextureFormat.RGBA8UNORM_SRGB;
            this.loadImages(images, format);
        }
    }
    isTextureCube() {
        return true;
    }
    createView(level, face, mipCount) {
        return this._object ? this._device.gpuCreateTextureView(this._object, {
            format: this._gpuFormat,
            dimension: '2d',
            baseMipLevel: level ?? 0,
            mipLevelCount: mipCount || this._mipLevelCount - (level ?? 0),
            baseArrayLayer: face ?? 0,
            arrayLayerCount: 1,
            aspect: 'all',
        }) : null;
    }
    async readPixels(face, x, y, w, h, buffer) {
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
        await this.copyPixelDataToBuffer(x, y, w, h, face, 0, tmpBuffer);
        await tmpBuffer.getBufferSubData(new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength), 0, imageSize);
        tmpBuffer.dispose();
    }
    readPixelsToBuffer(face, x, y, w, h, buffer) {
        this.copyPixelDataToBuffer(x, y, w, h, face, 0, buffer);
    }
    createWithMipmapData(data, creationFlags) {
        if (!data.isCubemap) {
            console.error('loading cubmap with mipmap data failed: data is not cubemap');
        }
        else {
            this._flags = Number(creationFlags) || 0;
            if (this._flags & GPUResourceUsageFlags.TF_WRITABLE) {
                console.error('webgl device does not support storage texture');
            }
            else {
                this.loadLevels(data);
            }
        }
    }
    loadEmpty(format, size, mipLevelCount) {
        this.allocInternal(format, size, size, 1, mipLevelCount);
        if (this._mipLevelCount > 1 && !this._device.isContextLost()) {
            this.generateMipmaps();
        }
    }
    loadImages(images, format) {
        const width = images[0].width;
        const height = images[0].height;
        if (images.length !== 6) {
            console.error(new Error('cubemap face list must have 6 images'));
            return;
        }
        for (let i = 1; i < 6; i++) {
            if (images[i].width !== width || images[i].height !== height) {
                console.error(new Error('cubemap face images must have identical sizes'));
                return;
            }
        }
        if (width === 0 || height === 0) {
            return;
        }
        this.allocInternal(format, width, height, 1, 0);
        if (!this._device.isContextLost()) {
            const w = this._width;
            const h = this._height;
            for (let face = 0; face < 6; face++) {
                createImageBitmap(images[face], {
                    premultiplyAlpha: 'none',
                    colorSpaceConversion: 'none',
                }).then((bmData) => {
                    this.uploadImageData(bmData, w, h, 0, 0, 0, 0);
                });
            }
            if (this._mipLevelCount > 1) {
                this.generateMipmaps();
            }
        }
    }
    loadLevels(levels) {
        const sRGB = !(this._flags & GPUResourceUsageFlags.TF_LINEAR_COLOR_SPACE);
        const format = sRGB ? linearTextureFormatToSRGB(levels.format) : levels.format;
        const width = levels.width;
        const height = levels.height;
        const mipLevelCount = levels.mipLevels;
        if (levels.isCompressed) {
            if (sRGB ? !this._device.getTextureCaps().supportS3TCSRGB : !this._device.getTextureCaps().supportS3TC) {
                console.warn('No s3tc compression format support');
                return;
            }
        }
        this.allocInternal(format, width, height, 1, mipLevelCount);
        if (!this._device.isContextLost()) {
            for (let face = 0; face < 6; face++) {
                for (let i = 0; i < levels.mipDatas[face].length; i++) {
                    this.uploadRaw(levels.mipDatas[face][i].data, levels.mipDatas[face][i].width, levels.mipDatas[face][i].height, 1, 0, 0, face, i);
                }
            }
        }
    }
}
//# sourceMappingURL=texturecube_webgpu.js.map