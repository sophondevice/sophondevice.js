/** sophon base library */
import { WebGPUObject } from './gpuobject_webgpu.js';
import { TextureTarget, TextureFormat, isFloatTextureFormat, isIntegerTextureFormat, isSignedTextureFormat, isCompressedTextureFormat, isDepthTextureFormat, TextureFilter, TextureWrapping, CompareFunc, getTextureFormatBlockHeight, getTextureFormatBlockSize, getTextureFormatBlockWidth } from '../base_types.js';
import { GPUResourceUsageFlags } from '../gpuobject.js';
import { UploadRingBuffer } from './uploadringbuffer.js';
import { textureFormatMap } from './constants_webgpu.js';

class WebGPUBaseTexture extends WebGPUObject {
    _target;
    _hash;
    _memCost;
    _views;
    _defaultView;
    _mipmapDirty;
    _flags;
    _width;
    _height;
    _depth;
    _format;
    _renderable;
    _fb;
    _gpuFormat;
    _mipLevelCount;
    _ringBuffer;
    _pendingUploads;
    constructor(device, target) {
        super(device);
        this._target = target || TextureTarget.Texture2D;
        this._flags = 0;
        this._width = 0;
        this._height = 0;
        this._depth = 0;
        this._renderable = false;
        this._fb = false;
        this._format = TextureFormat.Unknown;
        this._gpuFormat = null;
        this._mipLevelCount = 0;
        this._memCost = 0;
        this._mipmapDirty = false;
        this._views = [];
        this._defaultView = null;
        this._ringBuffer = new UploadRingBuffer(device);
        this._pendingUploads = [];
    }
    get hash() {
        return this._object ? this._device.gpuGetObjectHash(this._object) : 0;
    }
    get target() {
        return this._target;
    }
    get linearColorSpace() {
        return !!(this._flags & GPUResourceUsageFlags.TF_LINEAR_COLOR_SPACE);
    }
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }
    get depth() {
        return this._depth;
    }
    get format() {
        return this._format;
    }
    get mipLevelCount() {
        return this._mipLevelCount;
    }
    get gpuFormat() {
        return this._gpuFormat;
    }
    isTexture() {
        return true;
    }
    isFilterable() {
        if (!this.getTextureCaps().getTextureFormatInfo(this._format)?.filterable) {
            return false;
        }
        return true;
    }
    getPendingUploads() {
        return this._pendingUploads;
    }
    clearPendingUploads() {
        if (this._pendingUploads.length > 0) {
            this._pendingUploads = [];
            this.beginSyncChanges(null);
            this.endSyncChanges();
        }
    }
    isMipmapDirty() {
        return this._mipmapDirty;
    }
    setMipmapDirty(b) {
        this._mipmapDirty = b;
    }
    destroy() {
        if (this._object) {
            if (!this.isTextureVideo()) {
                this._object.destroy();
            }
            this._object = null;
            this._device.updateVideoMemoryCost(-this._memCost);
            this._memCost = 0;
        }
    }
    async restore() {
        if (!this._object && !this._device.isContextLost()) {
            this.init();
        }
    }
    getTextureCaps() {
        return this._device.getTextureCaps();
    }
    isFloatFormat() {
        return isFloatTextureFormat(this._format);
    }
    isIntegerFormat() {
        return isIntegerTextureFormat(this._format);
    }
    isSignedFormat() {
        return isSignedTextureFormat(this._format);
    }
    isCompressedFormat() {
        return isCompressedTextureFormat(this._format);
    }
    isDepth() {
        return isDepthTextureFormat(this._format);
    }
    isRenderable() {
        return this._renderable;
    }
    getView(level, face, mipCount) {
        level = Number(level) || 0;
        face = Number(face) || 0;
        mipCount = Number(mipCount) || 0;
        if (!this._views[face]) {
            this._views[face] = [];
        }
        if (!this._views[face][level]) {
            this._views[face][level] = [];
        }
        if (!this._views[face][level][mipCount]) {
            this._views[face][level][mipCount] = this.createView(level, face, mipCount);
        }
        return this._views[face][level][mipCount];
    }
    getDefaultView() {
        if (!this._defaultView && this._object && !this.isTextureVideo()) {
            this._defaultView = this._device.gpuCreateTextureView(this._object, {
                dimension: this.isTextureCube() ? 'cube' : this.isTexture3D() ? '3d' : this.isTexture2DArray() ? '2d-array' : '2d',
                arrayLayerCount: this.isTextureCube() ? 6 : this.isTexture2DArray() ? this._depth : 1,
                aspect: isDepthTextureFormat(this.format) ? 'depth-only' : 'all',
            });
        }
        return this._defaultView;
    }
    copyPixelDataToBuffer(x, y, w, h, layer, level, buffer) {
        if (this.isTextureVideo()) {
            throw new Error('copyPixelDataToBuffer() failed: can not copy pixel data of video texture');
        }
        WebGPUBaseTexture.copyTexturePixelsToBuffer(this._device.device, this.object, this.width, this.height, this.format, x, y, w, h, layer, level, buffer);
    }
    generateMipmaps() {
        this._mipmapDirty = true;
    }
    beginSyncChanges(encoder) {
        if (!this.isTextureVideo() && this._pendingUploads.length > 0 && this._object) {
            const cmdEncoder = encoder || this._device.device.createCommandEncoder();
            for (const u of this._pendingUploads) {
                if (u.mappedBuffer) {
                    const upload = u;
                    cmdEncoder.copyBufferToTexture({
                        buffer: upload.mappedBuffer.buffer,
                        offset: upload.mappedBuffer.offset,
                        bytesPerRow: upload.bufferStride,
                        rowsPerImage: upload.uploadHeight,
                    }, {
                        texture: this._object,
                        origin: {
                            x: upload.uploadOffsetX,
                            y: upload.uploadOffsetY,
                            z: upload.uploadOffsetZ,
                        },
                        mipLevel: upload.mipLevel,
                    }, {
                        width: upload.uploadWidth,
                        height: upload.uploadHeight,
                        depthOrArrayLayers: upload.uploadDepth
                    });
                }
                else if (u.image) {
                    const upload = u;
                    const copyView = {
                        texture: this._object,
                        origin: {
                            x: upload.offsetX,
                            y: upload.offsetY,
                            z: upload.offsetZ
                        },
                        mipLevel: upload.mipLevel
                    };
                    this._device.device.queue.copyExternalImageToTexture({ source: upload.image }, copyView, {
                        width: upload.width,
                        height: upload.height,
                        depthOrArrayLayers: upload.depth
                    });
                }
            }
            this._pendingUploads.length = 0;
            if (!encoder) {
                this._device.device.queue.submit([cmdEncoder.finish()]);
            }
            this._ringBuffer.beginUploads();
        }
    }
    endSyncChanges() {
        if (this._flags & GPUResourceUsageFlags.DYNAMIC) {
            this._ringBuffer.endUploads();
        }
        else {
            this._ringBuffer.purge();
        }
    }
    getDefaultSampler(shadow) {
        const params = this.getTextureCaps().getTextureFormatInfo(this._format);
        return this._device.createSampler(this._getSamplerOptions(params, shadow));
    }
    _calcMipLevelCount(format, width, height, depth) {
        if (isDepthTextureFormat(format) || this.isTexture3D() || this.isTextureVideo()) {
            return 1;
        }
        if (this._flags & GPUResourceUsageFlags.TF_NO_MIPMAP) {
            return 1;
        }
        const params = this.getTextureCaps().getTextureFormatInfo(format);
        if (!params || !params.renderable) {
            return 1;
        }
        return Math.floor(Math.log2(Math.max(width, height))) + 1;
    }
    allocInternal(format, width, height, depth, numMipLevels) {
        if (this.isTextureVideo()) {
            return;
        }
        if (numMipLevels === 0) {
            numMipLevels = this._calcMipLevelCount(format, width, height, depth);
        }
        else if (numMipLevels !== 1) {
            const autoMipLevelCount = this._calcMipLevelCount(format, width, height, depth);
            if (!Number.isInteger(numMipLevels) || numMipLevels < 0 || numMipLevels > autoMipLevelCount) {
                numMipLevels = autoMipLevelCount;
            }
        }
        if (this._object && (this._format !== format || this._width !== width || this._height !== height || this._depth !== depth, this._mipLevelCount !== numMipLevels)) {
            const obj = this._object;
            this._device.runNextFrame(() => {
                obj.destroy();
            });
            this._object = null;
        }
        if (!this._object) {
            this._format = format;
            this._width = width;
            this._height = height;
            this._depth = depth;
            this._mipLevelCount = numMipLevels;
            if (!this._device.isContextLost()) {
                this._gpuFormat = textureFormatMap[this._format];
                const params = this.getTextureCaps().getTextureFormatInfo(this._format);
                this._renderable = params.renderable && !(this._flags & GPUResourceUsageFlags.TF_WRITABLE);
                this._object = this._device.gpuCreateTexture({
                    size: {
                        width: this._width,
                        height: this._height,
                        depthOrArrayLayers: this.isTextureCube() ? 6 : this._depth
                    },
                    format: this._gpuFormat,
                    mipLevelCount: this._mipLevelCount,
                    sampleCount: 1,
                    dimension: this.isTexture3D() ? '3d' : '2d',
                    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.COPY_SRC
                        | (this._renderable && !this.isTexture3D() ? GPUTextureUsage.RENDER_ATTACHMENT : 0)
                        | ((this._flags & GPUResourceUsageFlags.TF_WRITABLE) ? GPUTextureUsage.STORAGE_BINDING : 0)
                });
                const memCost = this.getTextureCaps().calcMemoryUsage(this._format, this._width * this._height * (this.isTextureCube() ? 6 : this._depth));
                this._device.updateVideoMemoryCost(memCost - this._memCost);
                this._memCost = memCost;
            }
        }
    }
    static copyTexturePixelsToBuffer(device, texture, texWidth, texHeight, format, x, y, w, h, layer, level, buffer) {
        if (!(buffer.gpuUsage & GPUBufferUsage.COPY_DST)) {
            throw new Error('copyTexturePixelsToBuffer() failed: destination buffer does not have COPY_DST usage set');
        }
        const blockWidth = getTextureFormatBlockWidth(format);
        const blockHeight = getTextureFormatBlockHeight(format);
        const blockSize = getTextureFormatBlockSize(format);
        const blocksPerRow = texWidth / blockWidth;
        const blocksPerCol = texHeight / blockHeight;
        const rowStride = blocksPerRow * blockSize;
        const bufferStride = (rowStride + 255) & ~255;
        const bufferSize = blocksPerRow * rowStride;
        const bufferSizeAligned = blocksPerCol * bufferStride;
        if (buffer.byteLength < bufferSize) {
            throw new Error(`copyTexturePixelsToBuffer() failed: destination buffer size is ${buffer.byteLength}, should be at least ${bufferSize}`);
        }
        const tmpBuffer = device.createBuffer({ size: bufferSizeAligned, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC });
        const encoder = device.createCommandEncoder();
        encoder.copyTextureToBuffer({
            texture: texture,
            mipLevel: level ?? 0,
            origin: {
                x: x,
                y: y,
                z: layer ?? 0
            }
        }, {
            buffer: tmpBuffer,
            offset: 0,
            bytesPerRow: bufferStride
        }, {
            width: w,
            height: h,
            depthOrArrayLayers: 1
        });
        if (bufferSize !== bufferSizeAligned) {
            for (let i = 0; i < blocksPerCol; i++) {
                encoder.copyBufferToBuffer(tmpBuffer, i * bufferStride, buffer.object, i * rowStride, rowStride);
            }
        }
        else {
            encoder.copyBufferToBuffer(tmpBuffer, 0, buffer.object, 0, bufferSize);
        }
        device.queue.submit([encoder.finish()]);
        tmpBuffer.destroy();
    }
    uploadRaw(pixels, width, height, depth, offsetX, offsetY, offsetZ, miplevel) {
        const data = new Uint8Array(pixels.buffer, pixels.byteOffset, pixels.byteLength);
        const info = this._device.getTextureCaps().getTextureFormatInfo(this._format);
        const blockWidth = info.blockWidth || 1;
        const blockHeight = info.blockHeight || 1;
        const blocksPerRow = Math.ceil(width / blockWidth);
        const blocksPerCol = Math.ceil(height / blockHeight);
        const rowStride = blocksPerRow * info.size;
        if (rowStride * blocksPerCol * depth !== data.byteLength) {
            throw new Error(`WebGPUTexture.update() invalid data size: ${data.byteLength}`);
        }
        if (!this._device.isTextureUploading(this)) {
            this.clearPendingUploads();
            const destination = {
                texture: this._object,
                mipLevel: miplevel,
                origin: {
                    x: offsetX,
                    y: offsetY,
                    z: offsetZ,
                },
            };
            const dataLayout = {
                bytesPerRow: rowStride,
                rowsPerImage: blockHeight * blocksPerCol,
            };
            const size = {
                width: blockWidth * blocksPerRow,
                height: blockHeight * blocksPerCol,
                depthOrArrayLayers: depth
            };
            this._device.device.queue.writeTexture(destination, data, dataLayout, size);
        }
        else {
            const bufferStride = (rowStride + 255) & ~255;
            const uploadSize = bufferStride * blocksPerCol * depth;
            const upload = this._ringBuffer.uploadBuffer(null, null, 0, 0, uploadSize);
            const mappedRange = upload.mappedBuffer.mappedRange;
            const src = new Uint8Array(data);
            const dst = new Uint8Array(mappedRange, upload.mappedBuffer.offset, uploadSize);
            if (uploadSize === data.byteLength) {
                dst.set(new Uint8Array(data));
            }
            else {
                for (let d = 0; d < depth; d++) {
                    const srcLayerOffset = d * rowStride * blocksPerRow;
                    const dstLayerOffset = d * bufferStride * blocksPerCol;
                    for (let i = 0; i < blocksPerCol; i++) {
                        dst.set(src.subarray(srcLayerOffset + i * rowStride, srcLayerOffset + (i + 1) * rowStride), dstLayerOffset + i * bufferStride);
                    }
                }
            }
            this._pendingUploads.push({
                mappedBuffer: upload.mappedBuffer,
                uploadOffsetX: offsetX,
                uploadOffsetY: offsetY,
                uploadOffsetZ: offsetZ,
                uploadWidth: blockWidth * blocksPerRow,
                uploadHeight: blockHeight * blocksPerCol,
                uploadDepth: depth,
                bufferStride: bufferStride,
                mipLevel: miplevel,
            });
        }
    }
    uploadImageData(data, width, height, offsetX, offsetY, miplevel, faceIndex) {
        if (!this._device.isTextureUploading(this) && this._device.device.queue.copyExternalImageToTexture) {
            this.clearPendingUploads();
            const copyView = {
                texture: this._object,
                origin: {
                    x: offsetX,
                    y: offsetY,
                    z: faceIndex || 0
                },
                mipLevel: miplevel || 0
            };
            this._device.device.queue.copyExternalImageToTexture({ source: data }, copyView, {
                width: width,
                height: height,
                depthOrArrayLayers: 1
            });
        }
        else {
            const tmpCanvas = document.createElement('canvas');
            tmpCanvas.width = width;
            tmpCanvas.height = height;
            const ctx = tmpCanvas.getContext('2d');
            ctx.drawImage(data, 0, 0, width, height, 0, 0, width, height);
            const imageData = ctx.getImageData(0, 0, width, height);
            this.uploadRaw(imageData.data, width, height, 1, offsetX, offsetY, faceIndex, miplevel);
            tmpCanvas.width = 0;
            tmpCanvas.height = 0;
        }
    }
    _getSamplerOptions(params, shadow) {
        const comparison = this.isDepth() && shadow;
        const filterable = params.filterable || comparison;
        const magFilter = filterable
            ? TextureFilter.Linear
            : TextureFilter.Nearest;
        const minFilter = params.filterable
            ? TextureFilter.Linear
            : TextureFilter.Nearest;
        const mipFilter = this._mipLevelCount > 1
            ? filterable ? TextureFilter.Linear : TextureFilter.Nearest
            : TextureFilter.None;
        const addressU = TextureWrapping.ClampToEdge;
        const addressV = TextureWrapping.ClampToEdge;
        const addressW = TextureWrapping.ClampToEdge;
        const compare = comparison ? CompareFunc.Less : null;
        return {
            addressU,
            addressV,
            addressW,
            magFilter,
            minFilter,
            mipFilter,
            compare,
        };
    }
    _markAsCurrentFB(b) {
        this._fb = b;
    }
    _isMarkedAsCurrentFB() {
        return this._fb;
    }
}

export { WebGPUBaseTexture };
//# sourceMappingURL=basetexture_webgpu.js.map
