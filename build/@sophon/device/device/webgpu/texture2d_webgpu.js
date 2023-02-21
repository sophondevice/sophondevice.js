/** sophon base library */
import { TextureTarget, getTextureFormatBlockWidth, getTextureFormatBlockHeight, getTextureFormatBlockSize, TextureFormat, linearTextureFormatToSRGB } from '../base_types.js';
import { WebGPUBaseTexture } from './basetexture_webgpu.js';
import { GPUResourceUsageFlags } from '../gpuobject.js';

class WebGPUTexture2D extends WebGPUBaseTexture {
    constructor(device) {
        super(device, TextureTarget.Texture2D);
    }
    isTexture2D() {
        return true;
    }
    init() {
        this.loadEmpty(this._format, this._width, this._height, this._mipLevelCount);
    }
    update(data, xOffset, yOffset, width, height) {
        if (this._device.isContextLost()) {
            return;
        }
        if (!this._object) {
            this.allocInternal(this._format, this._width, this._height, 1, this._mipLevelCount);
        }
        this.uploadRaw(data, width, height, 1, xOffset, yOffset, 0, 0);
        if (this._mipLevelCount > 1) {
            this.generateMipmaps();
        }
    }
    updateFromElement(data, xOffset, yOffset, x, y, width, height) {
        if (this._device.isContextLost()) {
            return;
        }
        if (!this._object) {
            this.allocInternal(this._format, this._width, this._height, 1, this._mipLevelCount);
        }
        if (data instanceof HTMLCanvasElement && x === 0 && y === 0) {
            this.uploadImageData(data, width, height, xOffset, yOffset, 0, 0);
        }
        else {
            const cvs = document.createElement('canvas');
            cvs.width = width;
            cvs.height = height;
            const ctx = cvs.getContext('2d');
            ctx.drawImage(data, x, y, width, height, 0, 0, width, height);
            this.uploadImageData(cvs, width, height, xOffset, yOffset, 0, 0);
            cvs.width = 0;
            cvs.height = 0;
        }
    }
    async readPixels(x, y, w, h, buffer) {
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
        await this.copyPixelDataToBuffer(x, y, w, h, 0, 0, tmpBuffer);
        await tmpBuffer.getBufferSubData(new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength), 0, imageSize);
        tmpBuffer.dispose();
    }
    readPixelsToBuffer(x, y, w, h, buffer) {
        this.copyPixelDataToBuffer(x, y, w, h, 0, 0, buffer);
    }
    loadFromElement(element, creationFlags) {
        this._flags = Number(creationFlags) || 0;
        const format = (this._flags & GPUResourceUsageFlags.TF_LINEAR_COLOR_SPACE) ? TextureFormat.RGBA8UNORM : TextureFormat.RGBA8UNORM_SRGB;
        this.loadImage(element, format);
    }
    createEmpty(format, width, height, creationFlags) {
        this._flags = Number(creationFlags) || 0;
        format = (this._flags & GPUResourceUsageFlags.TF_LINEAR_COLOR_SPACE) ? format : linearTextureFormatToSRGB(format);
        this.loadEmpty(format, width, height, 0);
    }
    createView(level, face, mipCount) {
        return this._object ? this._device.gpuCreateTextureView(this._object, {
            dimension: '2d',
            baseMipLevel: level ?? 0,
            mipLevelCount: mipCount || this._mipLevelCount - (level ?? 0),
            baseArrayLayer: 0,
            arrayLayerCount: 1,
        }) : null;
    }
    createWithMipmapData(data, creationFlags) {
        if (data.isCubemap || data.isVolume) {
            console.error('loading 2d texture with mipmap data failed: data is not 2d texture');
        }
        else {
            this._flags = Number(creationFlags) || 0;
            if (this._flags & GPUResourceUsageFlags.TF_WRITABLE) {
                console.error(new Error('webgl device does not support storage texture'));
            }
            else {
                this.loadLevels(data);
            }
        }
    }
    guessTextureFormat(url, mimeType) {
        if (mimeType === 'image/jpeg' || mimeType === 'image/png') {
            return this.linearColorSpace ? TextureFormat.RGBA8UNORM : TextureFormat.RGBA8UNORM_SRGB;
        }
        const dataURIRegex = /^data:(.*?)(;base64)?,(.*)$/;
        const matchResult = url.match(dataURIRegex);
        if (matchResult) {
            const type = matchResult[1];
            if (type.indexOf('image/jpeg') >= 0 || type.indexOf('image/png') >= 0) {
                return this.linearColorSpace ? TextureFormat.RGBA8UNORM : TextureFormat.RGBA8UNORM_SRGB;
            }
        }
        else {
            const pindex = url.indexOf('?');
            if (pindex >= 0) {
                url = url.substring(0, pindex);
            }
            const eindex = url.lastIndexOf('.');
            if (eindex >= 0) {
                const ext = url.substring(eindex + 1).toLowerCase();
                if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') {
                    return this.linearColorSpace ? TextureFormat.RGBA8UNORM : TextureFormat.RGBA8UNORM_SRGB;
                }
            }
        }
        return TextureFormat.Unknown;
    }
    loadEmpty(format, width, height, numMipLevels) {
        this.allocInternal(format, width, height, 1, numMipLevels);
        if (this._mipLevelCount > 1 && !this._device.isContextLost()) {
            this.generateMipmaps();
        }
    }
    loadLevels(levels) {
        const sRGB = !(this._flags & GPUResourceUsageFlags.TF_LINEAR_COLOR_SPACE);
        let format = sRGB ? linearTextureFormatToSRGB(levels.format) : levels.format;
        let swizzle = false;
        if (format === TextureFormat.BGRA8UNORM) {
            format = TextureFormat.RGBA8UNORM;
            swizzle = true;
        }
        else if (this._format === TextureFormat.BGRA8UNORM_SRGB) {
            format = TextureFormat.RGBA8UNORM_SRGB;
            swizzle = true;
        }
        const width = levels.width;
        const height = levels.height;
        const mipLevelCount = levels.mipLevels;
        if (levels.isCompressed) {
            if (sRGB ? !this._device.getTextureCaps().supportS3TCSRGB : !this._device.getTextureCaps().supportS3TC) {
                console.error('No s3tc compression format support');
                return;
            }
        }
        this.allocInternal(format, width, height, 1, mipLevelCount);
        if (!this._device.isContextLost()) {
            for (let i = 0; i < levels.mipDatas[0].length; i++) {
                if (swizzle) {
                    for (let j = 0; j < levels.mipDatas[0][i].width * levels.mipDatas[0][i].height; j++) {
                        const t = levels.mipDatas[0][i].data[j * 4];
                        levels.mipDatas[0][i].data[j * 4] = levels.mipDatas[0][i].data[j * 4 + 2];
                        levels.mipDatas[0][i].data[j * 4 + 2] = t;
                    }
                }
                this.uploadRaw(levels.mipDatas[0][i].data, levels.mipDatas[0][i].width, levels.mipDatas[0][i].height, 1, 0, 0, 0, i);
            }
        }
    }
    loadImage(element, format) {
        this.allocInternal(format, Number(element.width), Number(element.height), 1, 0);
        if (!this._device.isContextLost()) {
            this.uploadImageData(element, this._width, this._height, 0, 0, 0, 0);
            if (this._mipLevelCount > 1) {
                this.generateMipmaps();
            }
        }
    }
}

export { WebGPUTexture2D };
//# sourceMappingURL=texture2d_webgpu.js.map
