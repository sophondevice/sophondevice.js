export interface IRectangle {
    width: number;
    height: number;
    x: number;
    y: number;
    [propName: string]: any;
}
export declare class Rectangle implements IRectangle {
    oversized: boolean;
    constructor(width?: number, height?: number, x?: number, y?: number, rot?: boolean, allowRotation?: boolean | undefined);
    static Collide(first: IRectangle, second: IRectangle): any;
    static Contain(first: IRectangle, second: IRectangle): any;
    area(): number;
    collide(rect: IRectangle): boolean;
    contain(rect: IRectangle): boolean;
    protected _width: number;
    get width(): number;
    set width(value: number);
    protected _height: number;
    get height(): number;
    set height(value: number);
    protected _x: number;
    get x(): number;
    set x(value: number);
    protected _y: number;
    get y(): number;
    set y(value: number);
    protected _rot: boolean;
    get rot(): boolean;
    set rot(value: boolean);
    protected _allowRotation: boolean | undefined;
    get allowRotation(): boolean | undefined;
    set allowRotation(value: boolean | undefined);
    protected _data: any;
    get data(): any;
    set data(value: any);
    protected _dirty: number;
    get dirty(): boolean;
    setDirty(value?: boolean): void;
}
