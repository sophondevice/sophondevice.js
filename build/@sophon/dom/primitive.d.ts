import { UIRect } from './layout';
import { RColor } from './types';
import type { Texture2D } from '@sophon/device';
export declare abstract class RPrimitive {
    abstract forEach(callback: (x: number, y: number, u: number, v: number) => void, thisArg?: unknown): any;
    abstract clipToRect(x: number, y: number, w: number, h: number): RPrimitive;
    abstract clone(): RPrimitive;
}
type Vertex = {
    x: number;
    y: number;
    u?: number;
    v?: number;
};
export declare class RPolygonPrimitive extends RPrimitive {
    constructor(vertices?: Vertex[]);
    get vertices(): Vertex[];
    set vertices(v: Vertex[]);
    clone(): RPrimitive;
    forEach(callback: (x: number, y: number, u: number, v: number) => void, thisArg?: unknown): void;
    clipToRect(x: number, y: number, w: number, h: number): RPrimitive;
}
export declare class RRectPrimitive extends RPrimitive {
    constructor(x: number, y: number, w: number, h: number, uMin: number, vMin: number, uMax: number, vMax: number);
    clone(): RPrimitive;
    forEach(callback: (x: number, y: number, u: number, v: number) => void, thisArg?: unknown): void;
    clipToRect(x: number, y: number, w: number, h: number): RPrimitive;
}
export declare class RPrimitiveBatchList {
    constructor(x: number, y: number);
    get length(): number;
    get x(): number;
    set x(val: number);
    get y(): number;
    set y(val: number);
    clear(): void;
    clone(transformOptions?: {
        textureTransformFunc?: (t: Texture2D) => Texture2D;
        colorTransformFunc?: (c: RColor) => RColor;
    }): RPrimitiveBatchList;
    getBatch(index: number): RPrimitiveBatch;
    getVertices(index: number): Float32Array;
    addBatch(batch: RPrimitiveBatch): void;
    addPrimitive(prim: RPrimitive, clipper: UIRect, tex?: Texture2D, color?: RColor): void;
}
export declare class RPrimitiveBatch {
    constructor(clipper: UIRect);
    get texture(): Texture2D;
    set texture(tex: Texture2D);
    get color(): RColor;
    set color(clr: RColor);
    get length(): number;
    clone(transformOptions?: {
        textureTransformFunc?: (t: Texture2D) => Texture2D;
        colorTransformFunc?: (c: RColor) => RColor;
    }): RPrimitiveBatch;
    getPrimitive(index: number): RPrimitive;
    addPrimitive(prim: RPrimitive): void;
    setClipper(rect: UIRect): void;
    isSameClipper(rc: UIRect): boolean;
    clear(): void;
}
export {};
