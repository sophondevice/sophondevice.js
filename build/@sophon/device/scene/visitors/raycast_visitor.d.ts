import { Ray } from '@sophon/base';
import { GraphNode } from '../graph_node';
import { OctreeNode } from '../octree';
import { Mesh } from '../mesh';
import { Terrain } from '../terrain';
import type { Visitor } from '../../misc';
export declare class RaycastVisitor implements Visitor {
    constructor(ray: Ray);
    get intersected(): GraphNode;
    visit(target: unknown): unknown;
    visitTerrain(node: Terrain): void;
    visitMesh(node: Mesh): void;
    visitOctreeNode(node: OctreeNode): boolean;
}
