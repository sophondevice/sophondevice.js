/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TypedArray } from '@sophon/base';
import type { Device, VertexStepMode, VertexLayout, VertexLayoutOptions, PrimitiveType, StructuredBuffer, IndexBuffer, VertexSemantic, VertexAttribFormat } from '@sophon/device';
import type { BoundingVolume } from './bounding_volume';

export class Primitive {
  /** @internal */
  protected _device: Device;
  /** @internal */
  protected _vertexLayout: VertexLayout;
  /** @internal */
  protected _vertexLayoutOptions: VertexLayoutOptions;
  /** @internal */
  protected _primitiveType: PrimitiveType;
  /** @internal */
  protected _indexStart: number;
  /** @internal */
  protected _indexCount: number;
  /** @internal */
  protected _vertexLayoutDirty: boolean;
  /** @internal */
  private static _nextId = 0;
  /** @internal */
  protected _id: number;
  /** @internal */
  protected _bbox: BoundingVolume;
  /** @internal */
  protected _bboxChangeCallback: (() => void)[];

  constructor(device: Device) {
    this._device = device;
    this._vertexLayout = null;
    this._vertexLayoutOptions = { vertexBuffers: [] };
    this._primitiveType = 'triangle-list';
    this._indexStart = 0;
    this._indexCount = 0;
    this._vertexLayoutDirty = false;
    this._id = ++Primitive._nextId;
    this._bbox = null;
    this._bboxChangeCallback = [];
  }
  get id(): number {
    return this._id;
  }
  addBoundingboxChangeCallback(cb: () => void) {
    cb && this._bboxChangeCallback.push(cb);
  }
  removeBoundingboxChangeCallback(cb: () => void) {
    const index = this._bboxChangeCallback.indexOf(cb);
    if (index >= 0) {
      this._bboxChangeCallback.splice(index, 1);
    }
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
  removeVertexBuffer(buffer: StructuredBuffer): void {
    for (let loc = 0; loc < this._vertexLayoutOptions.vertexBuffers.length; loc++) {
      const info = this._vertexLayoutOptions.vertexBuffers[loc];
      if (info?.buffer === buffer) {
        info[loc] = null;
        this._vertexLayoutDirty = true;
      }
    }
  }
  getVertexBuffer(semantic: VertexSemantic): StructuredBuffer {
    this.checkVertexLayout();
    return this._vertexLayout.getVertexBuffer(semantic);
  }
  createAndSetVertexBuffer(
    format: VertexAttribFormat,
    data: TypedArray,
    stepMode?: VertexStepMode
  ): StructuredBuffer {
    const buffer = this._device.createVertexBuffer(format, data);
    return this.setVertexBuffer(buffer, stepMode);
  }
  setVertexBuffer(buffer: StructuredBuffer, stepMode?: VertexStepMode) {
    this._vertexLayoutOptions.vertexBuffers.push({
      buffer,
      stepMode
    });
    this._vertexLayoutDirty = true;
    return buffer;
  }
  createAndSetIndexBuffer(data: Uint16Array | Uint32Array, dynamic?: boolean): IndexBuffer {
    const buffer = this._device.createIndexBuffer(data, {
      dynamic: !!dynamic,
      managed: !dynamic
    });
    this.setIndexBuffer(buffer);
    return buffer;
  }
  setIndexBuffer(buffer: IndexBuffer): void {
    if (this._vertexLayoutOptions.indexBuffer !== buffer) {
      this._vertexLayoutOptions.indexBuffer = buffer;
      this._vertexLayoutDirty = true;
    }
  }
  getIndexBuffer(): IndexBuffer {
    return this._vertexLayoutOptions.indexBuffer;
  }
  draw() {
    this.checkVertexLayout();
    this._vertexLayout?.draw(this._primitiveType, this._indexStart, this._indexCount);
  }
  drawInstanced(numInstances: number) {
    this.checkVertexLayout();
    this._vertexLayout?.drawInstanced(this._primitiveType, this._indexStart, this._indexCount, numInstances);
  }
  dispose() {
    if (this._vertexLayout) {
      this._vertexLayout.dispose();
      this._vertexLayout = null;
    }
    this._indexCount = 0;
    this._indexStart = 0;
  }
  /*
  createAABBTree(): AABBTree {
    const indices = this.getIndexBuffer() ? this.getIndexBuffer().getData() : null;
    const vertices = (this.getVertexBuffer(VERTEX_ATTRIB_POSITION)?.getData() as Float32Array) || null;
    const aabbtree = new AABBTree();
    aabbtree.buildFromPrimitives(vertices, indices, this._primitiveType);
    return aabbtree;
  }
  */
  getBoundingVolume(): BoundingVolume {
    return this._bbox;
  }
  setBoundingVolume(bv: BoundingVolume) {
    if (bv !== this._bbox) {
      this._bbox = bv;
      for (const cb of this._bboxChangeCallback) {
        cb();
      }
    }
  }
  /** @internal */
  private checkVertexLayout() {
    if (this._vertexLayoutDirty) {
      this._vertexLayout?.dispose();
      this._vertexLayout = this._device.createVertexLayout(this._vertexLayoutOptions);
      this._vertexLayoutDirty = false;
    }
  }
}
