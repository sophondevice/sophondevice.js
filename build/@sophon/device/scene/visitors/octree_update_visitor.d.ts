import type { Visitor } from '../../misc';
import type { Octree } from '../octree';
export declare class OctreeUpdateVisitor implements Visitor {
    constructor(octree: Octree);
    visit(node: unknown): void;
}
