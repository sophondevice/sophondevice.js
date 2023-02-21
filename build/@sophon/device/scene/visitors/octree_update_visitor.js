/** sophon base library */
import { GraphNode } from '../graph_node.js';

class OctreeUpdateVisitor {
    _octree;
    constructor(octree) {
        this._octree = octree;
    }
    visit(node) {
        if (node instanceof GraphNode) {
            this._octree.placeNode(node);
        }
    }
}

export { OctreeUpdateVisitor };
//# sourceMappingURL=octree_update_visitor.js.map
