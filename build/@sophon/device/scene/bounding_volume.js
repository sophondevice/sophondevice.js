/** sophon base library */
import { AABB, Frustum, ClipState } from '@sophon/base';
import { AABBTree } from './aabbtree.js';

class BoundingBox extends AABB {
    constructor(arg0, arg1) {
        super(arg0, arg1);
    }
    clone() {
        return new BoundingBox(this);
    }
    transform(matrix) {
        return new BoundingBox(AABB.transform(this, matrix));
    }
    outsideFrustum(frustum) {
        return ((frustum instanceof Frustum
            ? this.getClipStateWithFrustum(frustum)
            : this.getClipState(frustum)) === ClipState.NOT_CLIPPED);
    }
    toAABB() {
        return this;
    }
}
class BoundingBoxTree extends AABBTree {
    constructor(arg) {
        super(arg);
    }
    clone() {
        return new BoundingBoxTree(this);
    }
    transform(matrix) {
        const newBV = new BoundingBoxTree(this);
        newBV.transform(matrix);
        return newBV;
    }
    outsideFrustum(frustum) {
        const aabb = this.getTopLevelAABB();
        if (aabb) {
            return ((frustum instanceof Frustum
                ? aabb.getClipStateWithFrustum(frustum)
                : aabb.getClipState(frustum)) === ClipState.NOT_CLIPPED);
        }
        else {
            return false;
        }
    }
    toAABB() {
        return this.getTopLevelAABB();
    }
}

export { BoundingBox, BoundingBoxTree };
//# sourceMappingURL=bounding_volume.js.map
