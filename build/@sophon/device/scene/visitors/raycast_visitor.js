/** sophon base library */
import { Ray } from '@sophon/base';
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
import '../../device/builder/builtinfunc.js';
import '../../device/builder/constructors.js';
import '../../device/webgl/utils.js';
import '../../device/webgl/webgl_enum.js';
import '../../device/webgl/constants_webgl.js';
import '../../device/webgl/renderstate_webgl.js';
import '../../device/webgpu/constants_webgpu.js';
import '../../device/webgpu/structuredbuffer_webgpu.js';
import '../../device/webgpu/renderstates_webgpu.js';
import '../../device/webgpu/utils_webgpu.js';
import '../terrain/terrainmaterial.js';

class RaycastVisitor {
    _ray;
    _rayLocal;
    _intersected;
    _intersectedDist;
    constructor(ray) {
        this._ray = ray;
        this._rayLocal = new Ray();
        this._intersected = null;
        this._intersectedDist = Infinity;
    }
    get intersected() {
        return this._intersected;
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

export { RaycastVisitor };
//# sourceMappingURL=raycast_visitor.js.map
