import { IOption } from './maxrects-packer';
import { Rectangle, IRectangle } from './geom/Rectangle';
import { Bin } from './abstract-bin';
export declare class MaxRectsBin<T extends IRectangle = Rectangle> extends Bin<T> {
    maxWidth: number;
    maxHeight: number;
    padding: number;
    options: IOption;
    freeRects: Rectangle[];
    rects: T[];
    private verticalExpand;
    private stage;
    private border;
    constructor(maxWidth?: number, maxHeight?: number, padding?: number, options?: IOption);
    add(rect: T): T | undefined;
    add(width: number, height: number, data: any): T | undefined;
    repack(): T[] | undefined;
    reset(deepReset?: boolean, resetOption?: boolean): void;
    private place;
    private findNode;
    private splitNode;
    private pruneFreeList;
    private updateBinSize;
    private expandFreeRects;
}
