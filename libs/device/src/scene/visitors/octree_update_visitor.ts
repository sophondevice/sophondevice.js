import { GraphNode } from '../graph_node';
import type { Visitor } from '../../misc';
import type { Octree } from '../octree';

export class OctreeUpdateVisitor implements Visitor {
  /** @internal */
  private _octree: Octree;
  constructor(octree: Octree) {
    this._octree = octree;
  }
  visit(node: unknown) {
    if (node instanceof GraphNode) {
      this._octree.placeNode(node);
    }
  }
}
