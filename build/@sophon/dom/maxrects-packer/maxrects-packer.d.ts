import { Rectangle, IRectangle } from './geom/Rectangle';
import { Bin, IBin } from './abstract-bin';
export declare const EDGE_MAX_VALUE = 4096;
export declare const EDGE_MIN_VALUE = 128;
export declare enum PACKING_LOGIC {
    MAX_AREA = 0,
    MAX_EDGE = 1
}
export interface IOption {
    smart?: boolean;
    pot?: boolean;
    square?: boolean;
    allowRotation?: boolean;
    tag?: boolean;
    border?: number;
    logic?: PACKING_LOGIC;
}
export declare class MaxRectsPacker<T extends IRectangle = Rectangle> {
    width: number;
    height: number;
    padding: number;
    options: IOption;
    bins: Bin<T>[];
    constructor(width?: number, height?: number, padding?: number, options?: IOption);
    add(width: number, height: number, data: any): T;
    add(rect: T): T;
    addArray(rects: T[]): void;
    reset(): void;
    repack(quick?: boolean): void;
    next(): number;
    load(bins: IBin[]): void;
    save(): IBin[];
    private sort;
    private _currentBinIndex;
    get currentBinIndex(): number;
    get dirty(): boolean;
    get rects(): T[];
}
