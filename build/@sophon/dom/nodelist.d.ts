import type { RNode } from './node';
export interface RNodeList {
    length: number;
    item(index: number): RNode;
    entries(): Iterable<[number, RNode]>;
    keys(): Iterable<number>;
    values(): Iterable<RNode>;
    indexOf(node: RNode): number;
    forEach(callback: (currentValue: RNode, currentIndex?: number, listObj?: RNodeList) => void, thisArg?: unknown): void;
    [index: number]: RNode;
}
