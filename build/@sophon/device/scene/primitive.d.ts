import { Geometry } from '../device/geometry';
import type { BoundingVolume } from './bounding_volume';
import type { Device } from '../device/device';
export declare class Primitive extends Geometry {
    constructor(device: Device);
    get id(): number;
    addBoundingboxChangeCallback(cb: () => void): void;
    removeBoundingboxChangeCallback(cb: () => void): void;
    getBoundingVolume(): BoundingVolume;
    setBoundingVolume(bv: BoundingVolume): void;
}
