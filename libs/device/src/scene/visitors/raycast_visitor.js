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
import { Ray } from '@sophon/base/math/ray';
import { GraphNode } from '../graph_node';
import { OctreeNode } from '../octree';
import { Mesh } from '../mesh';
import { Terrain } from '../terrain';
export class RaycastVisitor extends Visitor {
    _ray;
    _rayLocal;
    _intersected;
    _intersectedDist;
    constructor(ray) {
        super();
        this._ray = ray;
        this._rayLocal = new Ray();
        this._intersected = null;
        this._intersectedDist = Infinity;
    }
    get intersected() {
        return this._intersected;
    }
    visitTerrain(node) {
        if (node.computedShowState !== GraphNode.SHOW_HIDE && node.computedPickMode !== GraphNode.PICK_DISABLED) {
            this._ray.transform(node.invWorldMatrix, this._rayLocal);
            const d = this._rayLocal.bboxIntersectionTestEx(node.getBoundingVolume().toAABB());
            if (d !== null && d < this._intersectedDist) {
                this._intersectedDist = d;
                this._intersected = node;
            }
        }
    }
    visitMesh(node) {
        if (node.computedShowState !== GraphNode.SHOW_HIDE && node.computedPickMode !== GraphNode.PICK_DISABLED) {
            this._ray.transform(node.invWorldMatrix, this._rayLocal);
            const d = this._rayLocal.bboxIntersectionTestEx(node.getBoundingVolume().toAABB());
            if (d !== null && d < this._intersectedDist) {
                this._intersectedDist = d;
                this._intersected = node;
            }
        }
    }
    visitOctreeNode(node) {
        if (node.getLevel() === 0 || this._ray.bboxIntersectionTest(node.getBoxLoosed()) !== null) {
            const nodes = node.getNodes();
            for (let i = 0; i < nodes.length; i++) {
                this.visit(nodes[i]);
            }
            return true;
        }
        return false;
    }
}
__decorate([
    visitor(Terrain),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Terrain]),
    __metadata("design:returntype", void 0)
], RaycastVisitor.prototype, "visitTerrain", null);
__decorate([
    visitor(Mesh),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Mesh]),
    __metadata("design:returntype", void 0)
], RaycastVisitor.prototype, "visitMesh", null);
__decorate([
    visitor(OctreeNode),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [OctreeNode]),
    __metadata("design:returntype", void 0)
], RaycastVisitor.prototype, "visitOctreeNode", null);
//# sourceMappingURL=raycast_visitor.js.map