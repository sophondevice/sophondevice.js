import { PrimitiveType } from './base_types';
import {
  VertexInputLayout,
  StructuredBuffer,
  IndexBuffer,
  VertexStepMode,
  VertexSemantic,
  getVertexAttribByName,
  VertexAttribFormat
} from './gpuobject';
import { VertexData } from './vertexdata';
import type { TypedArray } from '@sophon/base';
import type { PBStructTypeInfo } from './builder';
import type { Device } from './device';

export class Geometry {
  /** @internal */
  protected _device: Device;
  /** @internal */
  protected _vao: VertexInputLayout;
  /** @internal */
  protected _vertexData: VertexData;
  /** @internal */
  protected _primitiveType: PrimitiveType;
  /** @internal */
  protected _indexStart: number;
  /** @internal */
  protected _indexCount: number;
  /** @internal */
  protected _vaoDirty: boolean;

  constructor(device: Device) {
    this._device = device;
    this._vao = null;
    this._vertexData = new VertexData();
    this._primitiveType = PrimitiveType.TriangleList;
    this._indexStart = 0;
    this._indexCount = 0;
    this._vaoDirty = false;
  }
  get primitiveType() {
    return this._primitiveType;
  }
  set primitiveType(type) {
    this._primitiveType = type;
  }
  get indexStart() {
    return this._indexStart;
  }
  set indexStart(val) {
    this._indexStart = val;
  }
  get indexCount() {
    return this._indexCount;
  }
  set indexCount(val) {
    this._indexCount = val;
  }
  get drawOffset() {
    return this._vertexData.getDrawOffset();
  }
  removeVertexBuffer(buffer: StructuredBuffer): void {
    this._vaoDirty = this._vertexData.removeVertexBuffer(buffer);
  }
  getVertexBuffer(semantic: VertexSemantic): StructuredBuffer {
    return this._vertexData.getVertexBuffer(semantic);
  }
  createAndSetVertexBuffer(
    format: VertexAttribFormat,
    data: TypedArray,
    stepMode?: VertexStepMode
  ): StructuredBuffer {
    const buffer = this._device.createVertexBuffer(format, data);
    const ret = this._vertexData.setVertexBuffer(buffer, stepMode);
    this._vaoDirty = !!ret;
    return ret;
  }
  setVertexBuffer(buffer: StructuredBuffer, stepMode?: VertexStepMode) {
    const ret = this._vertexData.setVertexBuffer(buffer, stepMode);
    this._vaoDirty = !!ret;
    return ret;
  }
  createAndSetIndexBuffer(data: Uint16Array | Uint32Array, dynamic?: boolean): IndexBuffer {
    const buffer = this._device.createIndexBuffer(data, {
      dynamic: !!dynamic,
      managed: !dynamic
    });
    this._vertexData.setIndexBuffer(buffer);
    this._vaoDirty = true;
    return buffer;
  }
  setIndexBuffer(data: IndexBuffer): void {
    if (this._vertexData.indexBuffer !== data) {
      this._vertexData.setIndexBuffer(data);
      this._vaoDirty = true;
    }
  }
  getIndexBuffer(): IndexBuffer {
    return this._vertexData.indexBuffer;
  }
  draw() {
    if (this._vaoDirty) {
      this._vao?.dispose();
      this._vao = this._device.createVAO(this._vertexData);
      this._vaoDirty = false;
    }
    this._vao?.draw(this._primitiveType, this._indexStart, this._indexCount);
  }
  drawInstanced(numInstances: number) {
    if (this._vaoDirty) {
      this._vao?.dispose();
      this._vao = this._device.createVAO(this._vertexData);
      this._vaoDirty = false;
    }
    this._vao?.drawInstanced(this._primitiveType, this._indexStart, this._indexCount, numInstances);
  }
  dispose() {
    if (this._vao) {
      this._vao.dispose();
      this._vao = null;
    }
    this._vertexData = null;
    this._indexCount = 0;
    this._indexStart = 0;
    this._primitiveType = PrimitiveType.Unknown;
  }
}
