var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Visitor, visitor } from '@sophon/base/visitor';
import { GraphNode } from '../graph_node';
export class OctreeUpdateVisitor extends Visitor {
    _octree;
    constructor(octree) {
        super();
        this._octree = octree;
    }
    visitGraphNode(node) {
        this._octree.placeNode(node);
    }
}
__decorate([
    visitor(GraphNode),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GraphNode]),
    __metadata("design:returntype", void 0)
], OctreeUpdateVisitor.prototype, "visitGraphNode", null);
//# sourceMappingURL=octree_update_visitor.js.map