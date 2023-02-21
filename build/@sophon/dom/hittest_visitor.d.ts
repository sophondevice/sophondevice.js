import type { RNode } from './node';
export declare class GUIHitTestVisitor {
    constructor(x: number, y: number);
    getHits(): {
        element: RNode;
        x: number;
        y: number;
    }[];
    beginTraverseNode(): void;
    endTraverseNode(): void;
    visitNode(w: RNode): void;
}
