import { Vector3, Matrix4x4 } from '@sophon/base/math/vector';
import { Frustum } from '@sophon/base/math/frustum';
import { AABB } from '@sophon/base/math/aabb';
import { Plane } from '@sophon/base/math/plane';
import { ClipState } from '@sophon/base/math/clip_test';
import { AABBTree } from './aabbtree';

export interface BoundingVolume {
  clone(): BoundingVolume;
  transform(matrix: Matrix4x4): BoundingVolume;
  behindPlane(plane: Plane): boolean;
  outsideFrustum(frustum: Frustum | Matrix4x4): boolean;
  toAABB(): AABB;
}

export interface BoundingBox extends BoundingVolume {}

export class BoundingBox extends AABB {
  constructor();
  constructor(box: AABB);
  constructor(minPoint: Vector3, maxPoint: Vector3);
  constructor(arg0?: Vector3 | AABB, arg1?: Vector3) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super(arg0 as any, arg1);
  }
  clone(): BoundingVolume {
    return new BoundingBox(this);
  }
  transform(matrix: Matrix4x4): BoundingVolume {
    return new BoundingBox(AABB.transform(this, matrix));
  }
  outsideFrustum(frustum: Frustum | Matrix4x4): boolean {
    return (
      (frustum instanceof Frustum
        ? this.getClipStateWithFrustum(frustum)
        : this.getClipState(frustum)) === ClipState.NOT_CLIPPED
    );
  }
  toAABB(): AABB {
    return this;
  }
}

export interface BoundingBoxTree extends BoundingVolume {}

export class BoundingBoxTree extends AABBTree {
  constructor();
  constructor(aabbtree: AABBTree);
  constructor(arg?: AABBTree) {
    super(arg);
  }
  clone(): BoundingVolume {
    return new BoundingBoxTree(this);
  }
  transform(matrix: Matrix4x4): BoundingVolume {
    const newBV = new BoundingBoxTree(this);
    newBV.transform(matrix);
    return newBV;
  }
  outsideFrustum(frustum: Frustum | Matrix4x4): boolean {
    const aabb = this.getTopLevelAABB();
    if (aabb) {
      return (
        (frustum instanceof Frustum
          ? aabb.getClipStateWithFrustum(frustum)
          : aabb.getClipState(frustum)) === ClipState.NOT_CLIPPED
      );
    } else {
      return false;
    }
  }
  toAABB(): AABB {
    return this.getTopLevelAABB();
  }
}
/*
export class BoundingFrustum implements BoundingVolume {
    protected _frustum: Frustum;
    constructor ();
    constructor (other: BoundingFrustum|Frustum|Matrix4x4);
    constructor (arg0?: BoundingFrustum|Frustum|Matrix4x4) {
        if (arg0 instanceof BoundingFrustum) {
            this._frustum = arg0._frustum ? new Frustum (arg0._frustum) : null;
        } else if (arg0 instanceof Frustum) {
            this._frustum = new Frustum (arg0);
        } else if (arg0 instanceof Matrix4x4) {
            this._frustum = new Frustum (arg0);
        } else {
            this._frustum = null;
        }
    }
    clone (): BoundingVolume {
        return new BoundingFrustum (this);
    }
    transform (matrix: Matrix4x4)
}
*/
