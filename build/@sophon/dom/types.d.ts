import { REventPath, REventPathBuilder, REventTarget } from '@sophon/base';
export interface RCoord {
    x: number;
    y: number;
}
export interface RColor {
    r: number;
    g: number;
    b: number;
    a: number;
}
export declare class GUIEventPathBuilder implements REventPathBuilder {
    build(node: REventTarget): REventPath;
}
