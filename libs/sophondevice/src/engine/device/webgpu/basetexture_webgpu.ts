import { WebGPUObject } from './gpuobject_webgpu';
import { TextureCaps } from '../device';
import { TextureTarget, TextureFilter, TextureWrapping, TextureFormat, isCompressedTextureFormat, isDepthTextureFormat, isFloatTextureFormat, isIntegerTextureFormat, isSignedTextureFormat, CompareFunc, getTextureFormatBlockWidth, getTextureFormatBlockHeight, getTextureFormatBlockSize } from '../base_types';
import { GPUResourceUsageFlags, SamplerOptions, BaseTexture, TextureSampler, GPUDataBuffer } from '../gpuobject';
import { UploadRingBuffer, UploadTexture, UploadImage } from './uploadringbuffer';
import type { WebGPUDevice } from './device';
import type { WebGPUBuffer } from './buffer_webgpu';
import type { TypedArray } from '../../../shared';
import type { WebGPUTextureCap, ITextureFormatInfoWebGPU } from './capabilities_webgpu';
import { textureFormatMap } from './constants_webgpu';

export abstract class WebGPUBaseTexture<T extends GPUTexture|GPUExternalTexture = GPUTexture> extends WebGPUObject<T> {
  protected _target: TextureTarget;
  protected _hash: string;
  protected _memCost: number;
  protected _views: GPUTextureView[][][];
  protected _defaultView: GPUTextureView;
  protected _mipmapDirty: boolean;
  protected _flags: number;
  protected _width: number;
  protected _height: number;
  protected _depth: number;
  protected _format: TextureFormat;
  protected _renderable: boolean;
  protected _fb: boolean;
  protected _gpuFormat: GPUTextureFormat;
  protected _mipLevelCount: number;
  protected _ringBuffer: UploadRingBuffer;
  protected _pendingUploads: (UploadTexture | UploadImage)[];
  constructor(device: WebGPUDevice, target?: TextureTarget) {
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
  get hash(): number {
    return this._object ? this._device.gpuGetObjectHash(this._object) : 0;
  }
  get target(): TextureTarget {
    return this._target;
  }
  get linearColorSpace(): boolean {
    return !!(this._flags & GPUResourceUsageFlags.TF_LINEAR_COLOR_SPACE);
  }
  get width(): number {
    return this._width;
  }
  get height(): number {
    return this._height;
  }
  get depth(): number {
    return this._depth;
  }
  get format(): TextureFormat {
    return this._format;
  }
  get mipLevelCount(): number {
    return this._mipLevelCount;
  }
  get gpuFormat(): GPUTextureFormat {
    return this._gpuFormat;
  }
  abstract init(): void;
  isTexture(): this is BaseTexture {
    return true;
  }
  isFilterable(): boolean {
    if (!this.getTextureCaps().getTextureFormatInfo(this._format)?.filterable) {
      return false;
    }
    return true;
  }
  /** @internal */
  getPendingUploads(): (UploadTexture | UploadImage)[] {
    return this._pendingUploads;
  }
  /** @internal */
  clearPendingUploads() {
    if (this._pendingUploads.length > 0) {
      this._pendingUploads = [];
      this.beginSyncChanges(null);
      this.endSyncChanges();
    }
  }
  isMipmapDirty(): boolean {
    return this._mipmapDirty;
  }
  setMipmapDirty(b: boolean) {
    this._mipmapDirty = b;
  }
  destroy(): void {
    if (this._object) {
      if (!this.isTextureVideo()) {
        (this._object as GPUTexture).destroy();
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
  getTextureCaps(): TextureCaps {
    return this._device.getTextureCaps();
  }
  isFloatFormat(): boolean {
    return isFloatTextureFormat(this._format);
  }
  isIntegerFormat(): boolean {
    return isIntegerTextureFormat(this._format);
  }
  isSignedFormat(): boolean {
    return isSignedTextureFormat(this._format);
  }
  isCompressedFormat(): boolean {
    return isCompressedTextureFormat(this._format);
  }
  isDepth(): boolean {
    return isDepthTextureFormat(this._format);
  }
  isRenderable(): boolean {
    return this._renderable;
  }
  getView(level?: number, face?: number, mipCount?: number): GPUTextureView {
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
  getDefaultView(): GPUTextureView {
    if (!this._defaultView && this._object && !this.isTextureVideo()) {
      this._defaultView = this._device.gpuCreateTextureView(this._object as GPUTexture, {
        dimension: this.isTextureCube() ? 'cube' : this.isTexture3D() ? '3d' : this.isTexture2DArray() ? '2d-array' : '2d',
        arrayLayerCount: this.isTextureCube() ? 6 : this.isTexture2DArray() ? this._depth : 1,
        aspect: isDepthTextureFormat(this.format) ? 'depth-only' : 'all',
      });
    }
    return this._defaultView;
  }
  copyPixelDataToBuffer(x: number, y: number, w: number, h: number, layer: number, level: number, buffer: GPUDataBuffer): void {
    if (this.isTextureVideo()) {
      throw new Error('copyPixelDataToBuffer() failed: can not copy pixel data of video texture');
    }
    WebGPUBaseTexture.copyTexturePixelsToBuffer(this._device.device, this.object as GPUTexture, this.width, this.height, this.format, x, y, w, h, layer, level, buffer);
  }
  generateMipmaps() {
    this._mipmapDirty = true;
  }
  beginSyncChanges(encoder: GPUCommandEncoder) {
    if (!this.isTextureVideo() && this._pendingUploads.length > 0 && this._object) {
      const cmdEncoder = encoder || this._device.device.createCommandEncoder();
      for (const u of this._pendingUploads) {
        if ((u as UploadTexture).mappedBuffer) {
          const upload = u as UploadTexture;
          cmdEncoder.copyBufferToTexture({
            buffer: upload.mappedBuffer.buffer,
            offset: upload.mappedBuffer.offset,
            bytesPerRow: upload.bufferStride,
            rowsPerImage: upload.uploadHeight,
          }, {
            texture: this._object as GPUTexture,
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
        } else if ((u as UploadImage).image) {
          const upload = u as UploadImage;
          // FIXME: copy image cannot be queued into the command buffer
          const copyView: GPUImageCopyTextureTagged = {
            texture: this._object as GPUTexture,
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
    } else {
      this._ringBuffer.purge();
    }
  }
  getDefaultSampler(shadow: boolean): TextureSampler {
    const params = (this.getTextureCaps() as WebGPUTextureCap).getTextureFormatInfo(this._format);
    return this._device.createSampler(this._getSamplerOptions(params, shadow));
  }
  abstract createView(level?: number, face?: number, mipCount?: number): GPUTextureView;
  /** @internal */
  protected _calcMipLevelCount(format: TextureFormat, width: number, height: number, depth: number): number {
    if (isDepthTextureFormat(format) || this.isTexture3D() || this.isTextureVideo()) {
      return 1;
    }
    if (this._flags & GPUResourceUsageFlags.TF_NO_MIPMAP) {
      return 1;
    }
    const params = (this.getTextureCaps() as WebGPUTextureCap).getTextureFormatInfo(format);
    if (!params || !params.renderable) {
      return 1;
    }
    return Math.floor(Math.log2(Math.max(width, height))) + 1;
  }
  /** @internal */
  protected allocInternal(format: TextureFormat, width: number, height: number, depth: number, numMipLevels: number) {
    if (this.isTextureVideo()) {
      return;
    }
    if (numMipLevels === 0) {
      numMipLevels = this._calcMipLevelCount(format, width, height, depth);
    } else if (numMipLevels !== 1) {
      const autoMipLevelCount = this._calcMipLevelCount(format, width, height, depth);
      if (!Number.isInteger(numMipLevels) || numMipLevels < 0 || numMipLevels > autoMipLevelCount) {
        numMipLevels = autoMipLevelCount;
      }
    }
    if (this._object && (this._format !== format || this._width !== width || this._height !== height || this._depth !== depth, this._mipLevelCount !== numMipLevels)) {
      const obj = this._object;
      this._device.runNextFrame(() => {
        (obj as GPUTexture).destroy();
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
        const params = (this.getTextureCaps() as WebGPUTextureCap).getTextureFormatInfo(this._format);
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
        }) as any;
        const memCost = (this.getTextureCaps() as WebGPUTextureCap).calcMemoryUsage(this._format, this._width * this._height * (this.isTextureCube() ? 6 : this._depth));
        this._device.updateVideoMemoryCost(memCost - this._memCost);
        this._memCost = memCost;
      }
    }
  }
  /** @internal */
  static copyTexturePixelsToBuffer(device: GPUDevice, texture: GPUTexture, texWidth: number, texHeight: number, format: TextureFormat, x: number, y: number, w: number, h: number, layer: number, level: number, buffer: GPUDataBuffer): void {
    if (!((buffer as WebGPUBuffer).gpuUsage & GPUBufferUsage.COPY_DST)) {
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
      buffer: tmpBuffer as GPUBuffer,
      offset: 0,
      bytesPerRow: bufferStride
    }, {
      width: w,
      height: h,
      depthOrArrayLayers: 1
    });
    if (bufferSize !== bufferSizeAligned) {
      for (let i = 0; i < blocksPerCol; i++) {
        encoder.copyBufferToBuffer(tmpBuffer, i * bufferStride, buffer.object as GPUBuffer, i * rowStride, rowStride);
      }
    } else {
      encoder.copyBufferToBuffer(tmpBuffer, 0, buffer.object as GPUBuffer, 0, bufferSize);
    }
    device.queue.submit([encoder.finish()]);
    tmpBuffer.destroy();
  }
  /** @internal */
  protected uploadRaw(pixels: TypedArray, width: number, height: number, depth: number, offsetX: number, offsetY: number, offsetZ: number, miplevel: number) {
    const data = new Uint8Array(pixels.buffer, pixels.byteOffset, pixels.byteLength);
    const info = (this._device.getTextureCaps() as WebGPUTextureCap).getTextureFormatInfo(this._format);
    const blockWidth = info.blockWidth || 1;
    const blockHeight = info.blockHeight || 1;
    const blocksPerRow = Math.ceil(width / blockWidth);
    const blocksPerCol = Math.ceil(height / blockHeight);
    const rowStride = blocksPerRow * info.size;
    if (rowStride * blocksPerCol * depth !== data.byteLength) {
      throw new Error(`WebGPUTexture.update() invalid data size: ${data.byteLength}`);
    }
    if (!this._device.isTextureUploading(this as any)) {
      this.clearPendingUploads();
      const destination: GPUImageCopyTexture = {
        texture: this._object as GPUTexture,
        mipLevel: miplevel,
        origin: {
          x: offsetX,
          y: offsetY,
          z: offsetZ,
        },
      };
      const dataLayout: GPUImageDataLayout = {
        bytesPerRow: rowStride,
        rowsPerImage: blockHeight * blocksPerCol,
      };
      const size: GPUExtent3D = {
        width: blockWidth * blocksPerRow,
        height: blockHeight * blocksPerCol,
        depthOrArrayLayers: depth
      };
      this._device.device.queue.writeTexture(destination, data, dataLayout, size);
    } else {
      const bufferStride = (rowStride + 255) & ~255; // align to 256 bytes
      const uploadSize = bufferStride * blocksPerCol * depth;
      const upload = this._ringBuffer.uploadBuffer(null, null, 0, 0, uploadSize);
      const mappedRange = upload.mappedBuffer.mappedRange;
      const src = new Uint8Array(data);
      const dst = new Uint8Array(mappedRange, upload.mappedBuffer.offset, uploadSize);
      if (uploadSize === data.byteLength) {
        dst.set(new Uint8Array(data));
      } else {
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
  /** @internal */
  protected uploadImageData(data: ImageBitmap | HTMLCanvasElement, width: number, height: number, offsetX: number, offsetY: number, miplevel: number, faceIndex: number) {
    if (!this._device.isTextureUploading(this as any) && this._device.device.queue.copyExternalImageToTexture) {
      this.clearPendingUploads();
      const copyView: GPUImageCopyTextureTagged = {
        texture: this._object as GPUTexture,
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
    } else {
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
  /** @internal */
  protected _getSamplerOptions(params: Partial<ITextureFormatInfoWebGPU>, shadow: boolean): SamplerOptions {
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
  /** @internal */
  _markAsCurrentFB(b: boolean) {
    this._fb = b;
  }
  /** @internal */
  _isMarkedAsCurrentFB(): boolean {
    return this._fb;
  }
}
