import { Plane } from './plane';
import { Matrix4x4, Vector3 } from './vector';
export declare class Frustum {
    static readonly CORNER_LEFT_TOP_NEAR = 0;
    static readonly CORNER_LEFT_TOP_FAR = 1;
    static readonly CORNER_RIGHT_TOP_FAR = 2;
    static readonly CORNER_RIGHT_TOP_NEAR = 3;
    static readonly CORNER_LEFT_BOTTOM_NEAR = 4;
    static readonly CORNER_LEFT_BOTTOM_FAR = 5;
    static readonly CORNER_RIGHT_BOTTOM_FAR = 6;
    static readonly CORNER_RIGHT_BOTTOM_NEAR = 7;
    constructor();
    constructor(viewProjMatrix: Matrix4x4, worldMatrix?: Matrix4x4);
    constructor(other: Frustum);
    get worldMatrix(): Matrix4x4;
    set worldMatrix(m: Matrix4x4);
    setWorldMatrix(m: Matrix4x4): this;
    get viewProjectionMatrix(): Matrix4x4;
    set viewProjectionMatrix(m: Matrix4x4);
    setViewProjectionMatrix(m: Matrix4x4): this;
    setMatrix(viewProjMatrix: Matrix4x4, worldMatrix: Matrix4x4): this;
    transform(m: Matrix4x4): this;
    get planes(): Plane[];
    get corners(): Vector3[];
    getCorner(pos: number): Vector3;
    containsPoint(pt: Vector3): boolean;
}
