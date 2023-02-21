import { AABB } from "@sophon/base";
import { Matrix4x4, Ray } from '@sophon/base';
import { PrimitiveType } from '../device/base_types';
import type { TypedArray } from '../misc';
export declare class AABBTree {
    constructor(other?: AABBTree);
    buildFromPrimitives(vertices: number[] | TypedArray, indices: number[] | TypedArray, primitiveType: PrimitiveType): void;
    rayIntersectionTest(ray: Ray): boolean;
    rayIntersectionDistance(ray: Ray): number;
    getTopLevelAABB(): AABB;
    transform(affineMatrix: Matrix4x4): void;
    verify(): void;
}
