import { CubeFace } from '@sophon/base';
import { WebGPUObject } from './gpuobject_webgpu';
import { FrameBuffer, FrameBufferOptions } from '../gpuobject';
import type { WebGPUDevice } from './device';
import type { BaseTexture } from '../gpuobject';
import type { WebGPUBaseTexture } from './basetexture_webgpu';

export class WebGPUFrameBuffer extends WebGPUObject<unknown> implements FrameBuffer<unknown> {
  private _options: FrameBufferOptions;
  private _viewport: number[];
  private _scissor: number[];
  private _width: number;
  private _height: number;
  private _bindFlag: number;
  private _msaaColorTextures: GPUTexture[];
  private _msaaDepthTexture: GPUTexture;
  constructor(device: WebGPUDevice, opt?: FrameBufferOptions) {
    super(device);
    this._object = null;
    this._viewport = [0, 0, 0, 0];
    this._scissor = null;
    this._options = {
      colorAttachments: opt?.colorAttachments
        ? opt.colorAttachments.map((value) => Object.assign({ texture: null }, value))
        : null,
      depthAttachment: opt?.depthAttachment ? Object.assign({}, opt.depthAttachment) : null,
      sampleCount: opt?.sampleCount ?? 1,
      ignoreDepthStencil: opt?.ignoreDepthStencil ?? false
    };
    this._width = 0;
    this._height = 0;
    this._bindFlag = 0;
    this._msaaColorTextures = null;
    this._msaaDepthTexture = null;
    this._init();
  }
  get options(): FrameBufferOptions {
    return this._options;
  }
  get bindFlag(): number {
    return this._bindFlag;
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
  setScissorRect(scissor: number[]): void {
    this._scissor = scissor ? [...scissor] : null;
  }
  getWidth(): number {
    return this._width;
  }
  getHeight(): number {
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
    if (this._msaaColorTextures) {
      for (const tex of this._msaaColorTextures) {
        tex.destroy();
      }
      this._msaaColorTextures = null;
    }
    if (this._msaaDepthTexture) {
      this._msaaDepthTexture.destroy();
      this._msaaDepthTexture = null;
    }
  }
  setCubeTextureFace(index: number, face: CubeFace) {
    if (this._options.colorAttachments[index].face !== face) {
      this._options.colorAttachments[index].face = face;
      this._bindFlag++;
    }
  }
  setTextureLevel(index: number, level: number) {
    if (this._options.colorAttachments[index].level !== level) {
      this._options.colorAttachments[index].level = level;
      this._bindFlag++;
    }
  }
  setTextureLayer(index: number, layer: number) {
    if (this._options.colorAttachments[index].layer !== layer) {
      this._options.colorAttachments[index].layer = layer;
      this._bindFlag++;
    }
  }
  setDepthTextureLayer(layer: number) {
    if (this._options.depthAttachment && this._options.depthAttachment.layer !== layer) {
      this._options.depthAttachment.layer = layer;
      this._bindFlag++;
    }
  }
  getDepthAttachment(): BaseTexture {
    return this._options?.depthAttachment?.texture || null;
  }
  getColorAttachments(): BaseTexture[] {
    return this._options?.colorAttachments?.map((val) => val?.texture || null) || [];
  }
  getMSAADepthAttachment(): GPUTexture {
    return this._msaaDepthTexture;
  }
  getMSAAColorAttacments(): GPUTexture[] {
    return this._msaaColorTextures;
  }
  getColorFormats(): GPUTextureFormat[] {
    return this._options?.colorAttachments?.map(
      (val) => (val?.texture as WebGPUBaseTexture)?.gpuFormat || null
    );
  }
  getDepthFormat(): GPUTextureFormat {
    return (this._options.depthAttachment?.texture as WebGPUBaseTexture)?.gpuFormat || null;
  }
  bind(): boolean {
    throw new Error('no bind operatation for WebGPU');
  }
  unbind(): void {
    throw new Error('no unbind operatation for WebGPU');
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
    if (this._options.sampleCount > 1) {
      this._msaaColorTextures = [];
      for (const colorAttachment of this._options.colorAttachments) {
        const msaaTexture = (this.device as WebGPUDevice).gpuCreateTexture({
          size: {
            width: this._width,
            height: this._height,
            depthOrArrayLayers: 1
          },
          format: (colorAttachment.texture as WebGPUBaseTexture).gpuFormat,
          mipLevelCount: 1,
          sampleCount: this._options.sampleCount,
          dimension: '2d',
          usage: GPUTextureUsage.COPY_SRC | GPUTextureUsage.RENDER_ATTACHMENT
        });
        this._msaaColorTextures.push(msaaTexture);
      }
      if (this._options.depthAttachment) {
        const msaaDepthTexture = (this.device as WebGPUDevice).gpuCreateTexture({
          size: {
            width: this._width,
            height: this._height,
            depthOrArrayLayers: 1
          },
          format: (this._options.depthAttachment.texture as WebGPUBaseTexture).gpuFormat,
          mipLevelCount: 1,
          sampleCount: this._options.sampleCount,
          dimension: '2d',
          usage: GPUTextureUsage.COPY_SRC | GPUTextureUsage.RENDER_ATTACHMENT
        });
        this._msaaDepthTexture = msaaDepthTexture;
      }
    }
    this._object = {};
  }
  isFramebuffer(): boolean {
    return true;
  }
  getSampleCount(): number {
    return 1;
  }
}
