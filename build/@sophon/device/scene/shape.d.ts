import { Vector2 } from '@sophon/base';
import { Primitive } from './primitive';
import type { Device } from '../device';
export interface IShapeCreationOptions {
    needNormal?: boolean;
    needTangent?: boolean;
    needUV?: boolean;
}
export declare abstract class Shape<T extends IShapeCreationOptions = IShapeCreationOptions> extends Primitive {
    constructor(device: Device, options?: T);
    create(options?: T): boolean;
}
export interface IPlaneCreationOptions extends IShapeCreationOptions {
    size?: number;
    sizeX?: number;
    sizeY?: number;
}
export declare class PlaneShape extends Shape<IPlaneCreationOptions> {
    size: Vector2;
    constructor(device: Device, options?: IPlaneCreationOptions);
}
export interface IBoxCreationOptions extends IShapeCreationOptions {
    size?: number;
    sizeX?: number;
    sizeY?: number;
    sizeZ?: number;
    pivotX?: number;
    pivotY?: number;
    pivotZ?: number;
}
export declare class BoxShape extends Shape<IBoxCreationOptions> {
    constructor(device: Device, options?: IBoxCreationOptions);
}
export declare class BoxFrameShape extends Shape<IBoxCreationOptions> {
    constructor(device: Device, options?: IBoxCreationOptions);
}
export interface ISphereCreationOptions extends IShapeCreationOptions {
    radius?: number;
    verticalDetail?: number;
    horizonalDetail?: number;
}
export declare class SphereShape extends Shape<ISphereCreationOptions> {
    constructor(device: Device, options?: ISphereCreationOptions);
}
