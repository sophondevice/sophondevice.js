import { REventTarget, REvent, REventPathBuilder, Vector3, Quaternion, Matrix4x4 } from '@sophon/base';
import { BoundingVolume } from '../scene/bounding_volume';
import type { Scene } from '../scene/scene';
export declare class XFormChangeEvent extends REvent {
    static readonly NAME = "xform_change";
    xform: XForm<any>;
    constructor(xform: XForm<any>);
}
export declare class XForm<T extends XForm<T> = XForm<any>> extends REventTarget {
    constructor(scene: Scene, parent?: T, eventPathBuilder?: REventPathBuilder);
    get scene(): Scene;
    get parent(): T;
    set parent(p: T);
    get children(): T[];
    get position(): Vector3;
    set position(t: Vector3);
    get scaling(): Vector3;
    set scaling(s: Vector3 | number);
    get rotation(): Quaternion;
    set rotation(r: Quaternion);
    get localMatrix(): Matrix4x4;
    get worldMatrix(): Matrix4x4;
    get invWorldMatrix(): Matrix4x4;
    lookAt(eye: Vector3, target: Vector3, up: Vector3): this;
    notifyChanged(invalidLocal: boolean, dispatch: boolean): void;
    computeBoundingVolume(bv: BoundingVolume): BoundingVolume;
    getBoundingVolume(): BoundingVolume;
    setBoundingVolume(bv: BoundingVolume): void;
    getWorldBoundingVolume(): BoundingVolume;
    invalidateBoundingVolume(): void;
    invalidateWorldBoundingVolume(): void;
}
