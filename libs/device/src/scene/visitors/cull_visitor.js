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
import { ClipState } from '@sophon/base/math/clip_test';
import { GraphNode } from '../graph_node';
import { OctreeNode } from '../octree';
import { Mesh } from '../mesh';
import { Terrain } from '../terrain';
import { RenderQueue } from '../render_queue';
import { RENDER_PASS_TYPE_SHADOWMAP } from '../values';
export class CullVisitor extends Visitor {
    _camera;
    _skipClipTest;
    _renderQueue;
    _renderPass;
    _postCullHook;
    constructor(renderPass, camera) {
        super();
        this._camera = camera || null;
        this._renderQueue = new RenderQueue(renderPass);
        this._skipClipTest = false;
        this._renderPass = renderPass;
        this._postCullHook = null;
    }
    get camera() {
        return this._camera;
    }
    set camera(camera) {
        this._camera = camera || null;
    }
    get renderPass() {
        return this._renderPass;
    }
    get renderQueue() {
        return this._renderQueue;
    }
    get frustum() {
        return this._camera?.frustum || null;
    }
    get postCullHook() {
        return this._postCullHook;
    }
    set postCullHook(hook) {
        this._postCullHook = hook;
    }
    push(camera, drawable, renderOrder, castShadow, clipState, box) {
        if (!this._postCullHook || this._postCullHook(camera, drawable, castShadow, clipState, box)) {
            this.renderQueue.push(camera, drawable, renderOrder);
        }
    }
    visitTerrain(node) {
        if (node.computedShowState !== GraphNode.SHOW_HIDE && (node.castShadow || this._renderPass.getRenderPassType() !== RENDER_PASS_TYPE_SHADOWMAP)) {
            const clipState = this.getClipState(node);
            if (clipState !== ClipState.NOT_CLIPPED) {
                if (node.cull(this)) {
                    this.push(this._camera, node, node.computedRenderOrder, node.castShadow, clipState, node.getWorldBoundingVolume()?.toAABB());
                }
            }
        }
    }
    visitMesh(node) {
        if (node.computedShowState !== GraphNode.SHOW_HIDE && (node.castShadow || this._renderPass.getRenderPassType() !== RENDER_PASS_TYPE_SHADOWMAP)) {
            const clipState = this.getClipState(node);
            if (clipState !== ClipState.NOT_CLIPPED) {
                this.push(this._camera, node, node.computedRenderOrder, node.castShadow, clipState, node.getWorldBoundingVolume()?.toAABB());
            }
        }
    }
    visitOctreeNode(node) {
        const clipState = node.getLevel() > 0
            ? node.getBoxLoosed().getClipStateWithFrustum(this.frustum)
            : ClipState.CLIPPED;
        if (clipState !== ClipState.NOT_CLIPPED) {
            const saveSkipFlag = this._skipClipTest;
            this._skipClipTest = clipState === ClipState.A_INSIDE_B;
            const nodes = node.getNodes();
            for (let i = 0; i < nodes.length; i++) {
                this.visit(nodes[i]);
            }
            this._skipClipTest = saveSkipFlag;
            return true;
        }
        return false;
    }
    getClipState(node) {
        let clipState;
        if (this._skipClipTest) {
            clipState = ClipState.A_INSIDE_B;
        }
        else if (node.computedClipMode === GraphNode.CLIP_DISABLED) {
            clipState = ClipState.CLIPPED;
        }
        else {
            const bv = node.getWorldBoundingVolume();
            clipState = bv ? bv.toAABB().getClipStateWithFrustum(this.frustum) : ClipState.CLIPPED;
        }
        return clipState;
    }
}
__decorate([
    visitor(Terrain),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Terrain]),
    __metadata("design:returntype", void 0)
], CullVisitor.prototype, "visitTerrain", null);
__decorate([
    visitor(Mesh),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Mesh]),
    __metadata("design:returntype", void 0)
], CullVisitor.prototype, "visitMesh", null);
__decorate([
    visitor(OctreeNode),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [OctreeNode]),
    __metadata("design:returntype", void 0)
], CullVisitor.prototype, "visitOctreeNode", null);
//# sourceMappingURL=cull_visitor.js.map