/* eslint-disable @typescript-eslint/no-explicit-any */
import { Geometry, Device } from '@sophon/device';
import type { BoundingVolume } from './bounding_volume';

export class Primitive extends Geometry {
  /** @internal */
  private static _nextId = 0;
  /** @internal */
  protected _id: number;
  /** @internal */
  protected _bbox: BoundingVolume;
  /** @internal */
  protected _bboxChangeCallback: (() => void)[];

  constructor(device: Device) {
    super(device);
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
}
