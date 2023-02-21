import { IRectangle, Rectangle } from './geom/Rectangle';
import { Bin } from './abstract-bin';
export declare class OversizedElementBin<T extends IRectangle = Rectangle> extends Bin<T> {
    rects: T[];
    constructor(rect: T);
    constructor(width: number, height: number, data: any);
    add(): any;
    reset(deepReset?: boolean): void;
    repack(): T[] | undefined;
}
