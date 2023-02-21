import { Matrix4x4, Vector3 } from './vector';
import { AABB } from './aabb';
export declare class Ray {
    _origin: Vector3;
    _direction: Vector3;
    bboxIntersectionTest: (bbox: AABB) => boolean;
    bboxIntersectionTestEx: (bbox: AABB) => number | null;
    constructor();
    constructor(origin: Vector3, directionNormalized: Vector3);
    get origin(): Vector3;
    get direction(): Vector3;
    set(origin: Vector3, directionNormalized: Vector3): void;
    transform(matrix: Matrix4x4, other?: Ray): Ray;
    intersectionTestTriangle(v1: Vector3, v2: Vector3, v3: Vector3, cull: boolean): number | null;
}
