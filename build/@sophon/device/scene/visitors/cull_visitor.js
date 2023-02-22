/** sophon base library */
import { ClipState } from '@sophon/base';
import { GraphNode } from '../graph_node.js';
import { OctreeNode } from '../octree.js';
import { Mesh } from '../mesh.js';
import { Terrain } from '../terrain/terrain.js';
import '../../device/base_types.js';
import '../../device/gpuobject.js';
import '../terrain/types.js';
import '../../device/render_states.js';
import '../asset/assetmanager.js';
import '../../device/builder/ast.js';
import '../../device/builder/types.js';
import '../../device/builder/programbuilder.js';
import '../../device/webgl/utils.js';
import '../../device/webgl/webgl_enum.js';
import '../../device/webgl/constants_webgl.js';
import '../../device/webgl/renderstate_webgl.js';
import '../../device/webgpu/constants_webgpu.js';
import '../../device/webgpu/structuredbuffer_webgpu.js';
import '../../device/webgpu/renderstates_webgpu.js';
import '../../device/webgpu/utils_webgpu.js';
import '../terrain/terrainmaterial.js';
import { RenderQueue } from '../render_queue.js';
import { RENDER_PASS_TYPE_SHADOWMAP } from '../values.js';

class CullVisitor {
    _camera;
    _skipClipTest;
    _renderQueue;
    _renderPass;
    _postCullHook;
    constructor(renderPass, camera) {
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
    visit(target) {
        if (target instanceof Mesh) {
            return this.visitMesh(target);
        }
        else if (target instanceof OctreeNode) {
            return this.visitOctreeNode(target);
        }
        else if (target instanceof Terrain) {
            return this.visitTerrain(target);
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

export { CullVisitor };
//# sourceMappingURL=cull_visitor.js.map
