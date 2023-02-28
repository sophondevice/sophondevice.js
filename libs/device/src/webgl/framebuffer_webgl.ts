import { CubeFace } from '@sophon/base';
import { WebGLGPUObject } from './gpuobject_webgl';
import { WebGLEnum } from './webgl_enum';
import { BaseTexture, FrameBufferTextureAttachment, FrameBuffer, FrameBufferOptions } from '../gpuobject';
import { cubeMapFaceMap } from './constants_webgl';
import { hasStencilChannel } from '../base_types';
import { WebGLTextureCap } from './capabilities_webgl';
import type { WebGLDevice } from './device_webgl';

const STATUS_UNCHECKED = 0;
const STATUS_OK = 1;
const STATUS_FAILED = 2;
export class WebGLFrameBuffer
  extends WebGLGPUObject<WebGLFramebuffer>
  implements FrameBuffer<WebGLFramebuffer>
{
  private _options: FrameBufferOptions;
  private _viewport: number[];
  private _scissor: [number, number, number, number];
  private _needBindBuffers: boolean;
  private _drawTags: number;
  private _lastDrawTag: number;
  private _status: number;
  private _statusAA: number;
  private _width: number;
  private _height: number;
  private _isMRT: boolean;
  private _drawBuffers: number[];
  private _depthAttachmentTarget: number;
  private _colorAttachmentsAA: WebGLRenderbuffer[];
  private _depthAttachmentAA: WebGLRenderbuffer;
  private _framebufferAA: WebGLFramebuffer;
  constructor(device: WebGLDevice, opt?: FrameBufferOptions) {
    super(device);
    this._object = null;
    this._framebufferAA = null;
    this._colorAttachmentsAA = null;
    this._depthAttachmentAA = null;
    this._viewport = [0, 0, 0, 0];
    this._scissor = null;
    this._needBindBuffers = false;
    this._drawTags = 0;
    this._lastDrawTag = -1;
    this._status = STATUS_UNCHECKED;
    this._statusAA = STATUS_UNCHECKED;
    this._options = {
      colorAttachments: opt?.colorAttachments
        ? opt.colorAttachments.map((value) =>
            Object.assign(
              {
                texture: null,
                face: 0,
                layer: 0,
                level: 0
              },
              value
            )
          )
        : null,
      depthAttachment: opt?.depthAttachment?.texture ? Object.assign({}, opt.depthAttachment) : null,
      sampleCount: opt?.sampleCount ?? 1,
      ignoreDepthStencil: opt?.ignoreDepthStencil ?? false
    };
    this._width = 0;
    this._height = 0;
    this._drawBuffers = this._options.colorAttachments.map(
      (val, index) => WebGLEnum.COLOR_ATTACHMENT0 + index
    );
    this._isMRT = this._drawBuffers.length > 1;
    if (this._options.depthAttachment) {
      const format = this._options.depthAttachment.texture.format;
      this._depthAttachmentTarget = hasStencilChannel(format)
        ? WebGLEnum.DEPTH_STENCIL_ATTACHMENT
        : WebGLEnum.DEPTH_ATTACHMENT;
    } else {
      this._depthAttachmentTarget = WebGLEnum.NONE;
    }
    this._init();
  }
  tagDraw() {
    this._drawTags++;
  }
  getViewport(): number[] {
    return this._viewport;
  }
  setViewport(vp: number[]): void {
    this._viewport = [...vp];
  }
  getScissorRect(): number[] {
    return this._scissor;
  }
  setScissorRect(scissor: [number, number, number, number]): void {
    this._scissor = scissor ? [...scissor] : null;
  }
  isMRT(): boolean {
    return this._isMRT;
  }
  getWidth(): number {
    return this._width;
  }
  getHeight(): number {
    return this._height;
  }
  async restore() {
    if (!this._object && !this._device.isContextLost()) {
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
    }
    this._init();
  }
  destroy() {
    if (this._object) {
      this._device.context.deleteFramebuffer(this._object);
      this._object = null;
      if (this._colorAttachmentsAA) {
        for (const rb of this._colorAttachmentsAA) {
          this._device.context.deleteRenderbuffer(rb);
        }
        this._colorAttachmentsAA = null;
      }
      if (this._depthAttachmentAA) {
        this._device.context.deleteRenderbuffer(this._depthAttachmentAA);
        this._depthAttachmentAA = null;
      }
      if (this._framebufferAA) {
        this._device.context.deleteFramebuffer(this._framebufferAA);
        this._framebufferAA = null;
      }
    }
  }
  setCubeTextureFace(index: number, face: CubeFace) {
    const k = this._options.colorAttachments[index];
    if (k && k.face !== face) {
      k.face = face;
      this._needBindBuffers = true;
      if (this._device.context._currentFramebuffer === this) {
        this._updateMSAABuffer();
        this.bind();
      }
    }
  }
  setTextureLevel(index: number, level: number) {
    const k = this._options.colorAttachments[index];
    if (k && k.level !== level) {
      k.level = level;
      this._needBindBuffers = true;
      if (this._device.context._currentFramebuffer === this) {
        this._updateMSAABuffer();
        this.bind();
      }
    }
  }
  setTextureLayer(index: number, layer: number) {
    const k = this._options.colorAttachments[index];
    if (k && k.layer !== layer) {
      k.layer = layer;
      this._needBindBuffers = true;
      if (this._device.context._currentFramebuffer === this) {
        this._updateMSAABuffer();
        this.bind();
      }
    }
  }
  setDepthTextureLayer(layer: number) {
    const k = this._options.depthAttachment;
    if (k && k.layer !== layer) {
      k.layer = layer;
      this._needBindBuffers = true;
      if (this._device.context._currentFramebuffer === this) {
        this._updateMSAABuffer();
        this.bind();
      }
    }
  }
  getDepthAttachment(): BaseTexture {
    return this._options?.depthAttachment?.texture || null;
  }
  getColorAttachments(): BaseTexture[] {
    return this._options.colorAttachments?.map((val) => val.texture || null) || [];
  }
  bind(): boolean {
    if (this._object) {
      this._device.context._currentFramebuffer = this;
      this._lastDrawTag = -1;
      if (this._needBindBuffers) {
        this._needBindBuffers = false;
        if (!this._bindBuffersAA() || !this._bindBuffers()) {
          this._device.context.bindFramebuffer(WebGLEnum.FRAMEBUFFER, null);
          this._device.context._currentFramebuffer = null;
          return false;
        }
      }
      this._device.context.bindFramebuffer(WebGLEnum.FRAMEBUFFER, this._framebufferAA || this._object);
      const drawBuffersExt = this._device.drawBuffersExt;
      if (drawBuffersExt) {
        drawBuffersExt.drawBuffers(this._drawBuffers);
      } else if (this._isMRT) {
        console.error('device does not support multiple framebuffer color attachments');
      }
      this._device.setViewport();
      this._device.setScissor();
      return true;
    }
    return false;
  }
  unbind(): void {
    if (this._device.context._currentFramebuffer === this) {
      this._updateMSAABuffer();
      this._device.context.bindFramebuffer(WebGLEnum.FRAMEBUFFER, null);
      this._device.context._currentFramebuffer = null;
      this._device.setViewport();
      this._device.setScissor();
      const drawBuffersExt = this._device.drawBuffersExt;
      if (drawBuffersExt) {
        drawBuffersExt.drawBuffers([WebGLEnum.BACK]);
      }
    }
  }
  private _updateMSAABuffer() {
    if (this._options.sampleCount > 1 && this._lastDrawTag !== this._drawTags) {
      const gl = this._device.context as WebGL2RenderingContext;
      gl.bindFramebuffer(WebGLEnum.READ_FRAMEBUFFER, this._framebufferAA);
      gl.bindFramebuffer(WebGLEnum.DRAW_FRAMEBUFFER, this._object);
      for (let i = 0; i < this._drawBuffers.length; i++) {
        for (let j = 0; j < this._drawBuffers.length; j++) {
          this._drawBuffers[j] = j === i ? WebGLEnum.COLOR_ATTACHMENT0 + i : WebGLEnum.NONE;
        }
        gl.readBuffer(this._drawBuffers[i]);
        gl.drawBuffers(this._drawBuffers);
        gl.blitFramebuffer(
          0,
          0,
          this._width,
          this._height,
          0,
          0,
          this._width,
          this._height,
          WebGLEnum.COLOR_BUFFER_BIT,
          WebGLEnum.NEAREST
        );
      }
      if (!this._options.ignoreDepthStencil && this._depthAttachmentTarget !== WebGLEnum.NONE) {
        const mask =
          WebGLEnum.DEPTH_BUFFER_BIT |
          (this._depthAttachmentTarget === WebGLEnum.DEPTH_STENCIL_ATTACHMENT
            ? WebGLEnum.STENCIL_BUFFER_BIT
            : 0);
        gl.blitFramebuffer(
          0,
          0,
          this._width,
          this._height,
          0,
          0,
          this._width,
          this._height,
          mask,
          WebGLEnum.NEAREST
        );
      }
      for (let i = 0; i < this._drawBuffers.length; i++) {
        this._drawBuffers[i] = WebGLEnum.COLOR_ATTACHMENT0 + i;
      }
      gl.bindFramebuffer(WebGLEnum.READ_FRAMEBUFFER, null);
      gl.bindFramebuffer(WebGLEnum.DRAW_FRAMEBUFFER, null);
      this._lastDrawTag = this._drawTags;
    }
  }
  private _load(): void {
    if (this._device.isContextLost()) {
      return;
    }
    do {
      if (this._options.sampleCount > 1) {
        this._framebufferAA = this._device.context.createFramebuffer();
        this._colorAttachmentsAA = [];
        this._depthAttachmentAA = null;
        if (!this._bindBuffersAA()) {
          this.dispose();
          break;
        }
      }
      this._object = this._device.context.createFramebuffer();
      this._device.context.bindFramebuffer(WebGLEnum.FRAMEBUFFER, this._object);
      if (!this._bindBuffers()) {
        this.dispose();
      }
    } while (0);
    this._lastDrawTag = -1;
    this._device.context.bindFramebuffer(WebGLEnum.FRAMEBUFFER, null);
    this._device.context._currentFramebuffer = null;
  }
  private _bindAttachment(attachment: number, info: FrameBufferTextureAttachment): boolean {
    if (info.texture) {
      if (info.texture.isTexture2D()) {
        this._device.context.framebufferTexture2D(
          WebGLEnum.FRAMEBUFFER,
          attachment,
          WebGLEnum.TEXTURE_2D,
          info.texture.object,
          info.level ?? 0
        );
      } else if (info.texture.isTextureCube()) {
        this._device.context.framebufferTexture2D(
          WebGLEnum.FRAMEBUFFER,
          attachment,
          cubeMapFaceMap[info.face ?? CubeFace.PX],
          info.texture.object,
          info.level ?? 0
        );
      } else if (info.texture.isTexture2DArray() || info.texture.isTexture3D()) {
        (this._device.context as WebGL2RenderingContext).framebufferTextureLayer(
          WebGLEnum.FRAMEBUFFER,
          attachment,
          info.texture.object,
          info.level ?? 0,
          info.layer ?? 0
        );
      } else {
        return false;
      }
      return true;
    }
    return false;
  }
  private _bindBuffers(): boolean {
    if (!this._object) {
      return false;
    }
    this._device.context.bindFramebuffer(WebGLEnum.FRAMEBUFFER, this._object);
    if (this._depthAttachmentTarget !== WebGLEnum.NONE) {
      if (!this._bindAttachment(this._depthAttachmentTarget, this._options.depthAttachment)) {
        return false;
      }
    }
    for (let i = 0; i < this._options.colorAttachments.length; i++) {
      const opt = this._options.colorAttachments[i];
      if (opt.texture) {
        if (!this._bindAttachment(WebGLEnum.COLOR_ATTACHMENT0 + i, opt)) {
          return false;
        }
      }
    }
    if (this._status === STATUS_UNCHECKED) {
      const status = this._device.context.checkFramebufferStatus(WebGLEnum.FRAMEBUFFER);
      if (status !== WebGLEnum.FRAMEBUFFER_COMPLETE) {
        console.error(`Framebuffer not complete: ${status}`);
        this._status = STATUS_FAILED;
      } else {
        this._status = STATUS_OK;
      }
    }
    return this._status === STATUS_OK;
  }
  private _createRenderbufferAA(texture: BaseTexture): WebGLRenderbuffer {
    const renderBuffer = this._device.context.createRenderbuffer();
    const formatInfo = (this.device.getTextureCaps() as WebGLTextureCap).getTextureFormatInfo(texture.format);
    this._device.context.bindRenderbuffer(WebGLEnum.RENDERBUFFER, renderBuffer);
    (this._device.context as WebGL2RenderingContext).renderbufferStorageMultisample(
      WebGLEnum.RENDERBUFFER,
      this._options.sampleCount,
      formatInfo.glInternalFormat,
      this._options.depthAttachment.texture.width,
      this._options.depthAttachment.texture.height
    );
    return renderBuffer;
  }
  private _bindBuffersAA(): boolean {
    if (!this._framebufferAA) {
      return true;
    }
    this._device.context.bindFramebuffer(WebGLEnum.FRAMEBUFFER, this._framebufferAA);
    if (this._depthAttachmentTarget !== WebGLEnum.NONE) {
      if (!this._depthAttachmentAA) {
        this._depthAttachmentAA = this._createRenderbufferAA(this._options.depthAttachment.texture);
      }
      this._device.context.framebufferRenderbuffer(
        WebGLEnum.FRAMEBUFFER,
        this._depthAttachmentTarget,
        WebGLEnum.RENDERBUFFER,
        this._depthAttachmentAA
      );
    }
    for (let i = 0; i < this._options.colorAttachments.length; i++) {
      const opt = this._options.colorAttachments[i];
      if (opt.texture) {
        if (!this._colorAttachmentsAA[i]) {
          this._colorAttachmentsAA[i] = this._createRenderbufferAA(this._options.colorAttachments[i].texture);
        }
        this._device.context.framebufferRenderbuffer(
          WebGLEnum.FRAMEBUFFER,
          WebGLEnum.COLOR_ATTACHMENT0 + i,
          WebGLEnum.RENDERBUFFER,
          this._colorAttachmentsAA[i]
        );
      }
    }
    if (this._statusAA === STATUS_UNCHECKED) {
      const status = this._device.context.checkFramebufferStatus(WebGLEnum.FRAMEBUFFER);
      if (status !== WebGLEnum.FRAMEBUFFER_COMPLETE) {
        console.error(`Framebuffer not complete: ${status}`);
        this._statusAA = STATUS_FAILED;
      } else {
        this._statusAA = STATUS_OK;
      }
    }
    return this._statusAA === STATUS_OK;
  }
  private _init(): void {
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
        if (
          this._width !== colorAttachment.texture.width ||
          this._height !== colorAttachment.texture.height
        ) {
          console.error('init frame buffer failed: color attachment textures must have same size');
          return;
        }
      }
    }
    if (this._width === 0 || this._height === 0) {
      console.error('init frame buffer failed: can not create frame buffer with zero size');
      return;
    }
    if (this._options.sampleCount !== 1 && this._options.sampleCount !== 4) {
      console.error(`init frame buffer failed: invalid sample count value: ${this._options.sampleCount}`);
      return;
    }
    if (this._options.sampleCount > 1 && !this._device.getFramebufferCaps().supportMultisampledFramebuffer) {
      console.error('init frame buffer failed: webgl1 does not support multisampled frame buffer');
      return;
    }
    this._load();
    this._viewport = [0, 0, this._width, this._height];
  }
  isFramebuffer(): boolean {
    return true;
  }
  getSampleCount(): number {
    return 1;
  }
}
