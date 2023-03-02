import { WebGLGPUObject } from './gpuobject_webgl';
import { WebGLEnum } from './webgl_enum';
import {
  VertexLayout,
  StructuredBuffer,
  IndexBuffer,
  getVertexBufferAttribType,
  getVertexBufferStride,
  VertexSemantic,
  VertexLayoutOptions
} from '../gpuobject';
import { VertexData } from '../vertexdata';
import { typeMap } from './constants_webgl';
import type { PrimitiveType } from '../base_types';
import type { WebGLDevice } from './device_webgl';

export class WebGLVertexLayout
  extends WebGLGPUObject<WebGLVertexArrayObject | WebGLVertexArrayObjectOES>
  implements VertexLayout<WebGLVertexArrayObject | WebGLVertexArrayObjectOES>
{
  private _vertexData: VertexData;
  constructor(device: WebGLDevice, options: VertexLayoutOptions) {
    super(device);
    this._vertexData = new VertexData();
    for (const vb of options.vertexBuffers) {
      this._vertexData.setVertexBuffer(vb.buffer, vb.stepMode);
    }
    if (options.indexBuffer) {
      this._vertexData.setIndexBuffer(options.indexBuffer);
    }
    this.load();
  }
  destroy() {
    if (this._object && this._device.vaoExt) {
      this._device.vaoExt.deleteVertexArray(this._object);
    }
    this._object = null;
  }
  async restore() {
    if (!this._device.isContextLost()) {
      this.load();
    }
  }
  get vertexBuffers() {
    return this._vertexData.vertexBuffers;
  }
  get indexBuffer() {
    return this._vertexData.indexBuffer;
  }
  getDrawOffset(): number {
    return this._vertexData.getDrawOffset();
  }
  getVertexBuffer(semantic: VertexSemantic): StructuredBuffer {
    return this._vertexData.getVertexBuffer(semantic);
  }
  getIndexBuffer(): IndexBuffer {
    return this._vertexData.getIndexBuffer();
  }
  bind() {
    if (this._object && this._device.vaoExt) {
      this._device.vaoExt.bindVertexArray(this._object);
    } else {
      this.bindBuffers();
    }
  }
  draw(primitiveType: PrimitiveType, first: number, count: number): void {
    this._device.setVertexData(this);
    this._device.draw(primitiveType, first, count);
  }
  drawInstanced(primitiveType: PrimitiveType, first: number, count: number, numInstances: number): void {
    this._device.setVertexData(this);
    this._device.drawInstanced(primitiveType, first, count, numInstances);
  }
  isVertexLayout(): boolean {
    return true;
  }
  private load(): void {
    if (this._device.isContextLost()) {
      return;
    }
    if (this._device.vaoExt) {
      if (!this._object) {
        this._object = this._device.vaoExt.createVertexArray();
        this._device.vaoExt.bindVertexArray(this._object);
        this.bindBuffers();
        this._device.vaoExt.bindVertexArray(null);
      }
    } else {
      this._object = {};
    }
  }
  private bindBuffers() {
    const vertexBuffers = this._vertexData.vertexBuffers;
    const drawOffset = this._vertexData.getDrawOffset();
    const gl = this._device.context;
    for (let loc = 0; loc < vertexBuffers.length; loc++) {
      const bufferInfo = vertexBuffers[loc];
      const buffer = bufferInfo?.buffer;
      if (buffer) {
        if (buffer.disposed) {
          buffer.reload();
        }
        gl.bindBuffer(WebGLEnum.ARRAY_BUFFER, buffer.object);
        gl.enableVertexAttribArray(loc);
        const vertexType = getVertexBufferAttribType(bufferInfo.buffer.structure, loc);
        const stride = getVertexBufferStride(bufferInfo.buffer.structure);
        if (bufferInfo.stepMode === 'instance' && this._device.instancedArraysExt) {
          gl.vertexAttribPointer(
            loc,
            vertexType.cols,
            typeMap[vertexType.scalarType],
            false,
            stride,
            bufferInfo.offset
          );
          this._device.instancedArraysExt.vertexAttribDivisor(loc, 1);
        } else {
          gl.vertexAttribPointer(
            loc,
            vertexType.cols,
            typeMap[vertexType.scalarType],
            false,
            stride,
            drawOffset * stride + bufferInfo.offset
          );
        }
      } else {
        gl.disableVertexAttribArray(loc);
      }
    }
    if (this._vertexData.indexBuffer?.disposed) {
      this._vertexData.indexBuffer.reload();
    }
    gl.bindBuffer(
      WebGLEnum.ELEMENT_ARRAY_BUFFER,
      this._vertexData.indexBuffer ? this._vertexData.indexBuffer.object : null
    );
  }
}
