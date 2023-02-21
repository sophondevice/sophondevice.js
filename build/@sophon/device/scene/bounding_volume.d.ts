import { Vector3, Matrix4x4, Frustum, AABB, Plane } from '@sophon/base';
import { AABBTree } from './aabbtree';
export interface BoundingVolume {
    clone(): BoundingVolume;
    transform(matrix: Matrix4x4): BoundingVolume;
    behindPlane(plane: Plane): boolean;
    outsideFrustum(frustum: Frustum | Matrix4x4): boolean;
    toAABB(): AABB;
}
export interface BoundingBox extends BoundingVolume {
}
export declare class BoundingBox extends AABB {
    constructor();
    constructor(box: AABB);
    constructor(minPoint: Vector3, maxPoint: Vector3);
    clone(): BoundingVolume;
    transform(matrix: Matrix4x4): BoundingVolume;
    outsideFrustum(frustum: Frustum | Matrix4x4): boolean;
    toAABB(): AABB;
}
export interface BoundingBoxTree extends BoundingVolume {
}
export declare class BoundingBoxTree extends AABBTree {
    constructor();
    constructor(aabbtree: AABBTree);
    clone(): BoundingVolume;
    transform(matrix: Matrix4x4): BoundingVolume;
    outsideFrustum(frustum: Frustum | Matrix4x4): boolean;
    toAABB(): AABB;
}
