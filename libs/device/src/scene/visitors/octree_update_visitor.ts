import { Visitor, visitor } from '@sophon/base/visitor';
import { GraphNode } from '../graph_node';
import type { Octree } from '../octree';

export class OctreeUpdateVisitor extends Visitor {
  /** @internal */
  private _octree: Octree;
  constructor(octree: Octree) {
    super();
    this._octree = octree;
  }
  @visitor(GraphNode)
  visitGraphNode(node: GraphNode) {
    this._octree.placeNode(node);
  }
}
