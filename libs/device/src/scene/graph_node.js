import { SceneNode } from './scene_node';
export class GraphNode extends SceneNode {
    static ORDER_INHERITED = -1;
    static ORDER_BACKGROUND = 0;
    static ORDER_DEFAULT = 32;
    static CLIP_INHERITED = -1;
    static CLIP_DISABLED = 0;
    static CLIP_ENABLED = 1;
    static SHOW_INHERITED = -1;
    static SHOW_HIDE = 0;
    static SHOW_DEFAULT = 1;
    static PICK_INHERITED = -1;
    static PICK_DISABLED = 0;
    static PICK_ENABLED = 1;
    static BBOXDRAW_INHERITED = -1;
    static BBOXDRAW_DISABLED = 0;
    static BBOXDRAW_LOCAL = 1;
    static BBOXDRAW_WORLD = 2;
    _clipMode;
    _renderOrder;
    _boxDrawMode;
    _visible;
    _pickMode;
    _lastRenderTimestamp;
    _lruIterator;
    constructor(scene, parent) {
        super(scene, parent);
        this._clipMode = GraphNode.CLIP_ENABLED;
        this._boxDrawMode = GraphNode.BBOXDRAW_DISABLED;
        this._renderOrder = GraphNode.ORDER_DEFAULT;
        this._visible = GraphNode.SHOW_DEFAULT;
        this._pickMode = GraphNode.PICK_DISABLED;
        this._lastRenderTimestamp = 0;
        this._lruIterator = null;
    }
    get computedRenderOrder() {
        if (this._renderOrder === GraphNode.ORDER_INHERITED) {
            let parent = this.parent;
            while (parent && !parent.isGraphNode()) {
                parent = parent.parent;
            }
            return parent?.computedRenderOrder ?? GraphNode.ORDER_DEFAULT;
        }
        return this._renderOrder;
    }
    get renderOrder() {
        return this._renderOrder;
    }
    set renderOrder(val) {
        this._renderOrder = val;
    }
    get computedClipMode() {
        if (this._clipMode === GraphNode.CLIP_INHERITED) {
            let parent = this.parent;
            while (parent && !parent.isGraphNode()) {
                parent = parent.parent;
            }
            return parent?.computedClipMode ?? GraphNode.CLIP_ENABLED;
        }
        return this._clipMode;
    }
    get clipMode() {
        return this._clipMode;
    }
    set clipMode(val) {
        this._clipMode = val;
    }
    get computedShowState() {
        if (this._visible === GraphNode.SHOW_INHERITED) {
            let parent = this.parent;
            while (parent && !parent.isGraphNode()) {
                parent = parent.parent;
            }
            return parent?.computedShowState ?? GraphNode.SHOW_DEFAULT;
        }
        return this._visible;
    }
    get showState() {
        return this._visible;
    }
    set showState(val) {
        this._visible = val;
    }
    get computedPickMode() {
        if (this._pickMode === GraphNode.PICK_INHERITED) {
            let parent = this.parent;
            while (parent && !parent.isGraphNode()) {
                parent = parent.parent;
            }
            return parent?.computedPickMode ?? GraphNode.PICK_DISABLED;
        }
        return this._pickMode;
    }
    get pickMode() {
        return this._pickMode;
    }
    set pickMode(val) {
        this._pickMode = val;
    }
    get computedBoundingBoxDrawMode() {
        if (this._boxDrawMode === GraphNode.BBOXDRAW_INHERITED) {
            let parent = this.parent;
            while (parent && !parent.isGraphNode()) {
                parent = parent.parent;
            }
            return parent?.computedBoundingBoxDrawMode ?? GraphNode.BBOXDRAW_DISABLED;
        }
        return this._boxDrawMode;
    }
    get boundingBoxDrawMode() {
        return this._boxDrawMode;
    }
    set boundingBoxDrawMode(mode) {
        this._boxDrawMode = mode;
    }
    isGraphNode() {
        return true;
    }
    outsideFrustum(frustum) {
        const bv = this.getBoundingVolume();
        return bv && bv.outsideFrustum(frustum);
    }
    getXForm() {
        return this;
    }
    getBoneMatrices() {
        return null;
    }
    getInvBindMatrix() {
        return null;
    }
    getSortDistance(camera) {
        const cameraWorldMatrix = camera.worldMatrix;
        const objectWorldMatrix = this.worldMatrix;
        const dx = cameraWorldMatrix.m03 - objectWorldMatrix.m03;
        const dy = cameraWorldMatrix.m13 - objectWorldMatrix.m13;
        const dz = cameraWorldMatrix.m23 - objectWorldMatrix.m23;
        return dx * dx + dy * dy * dz * dz;
    }
    setLastRenderTimestamp(ts) {
        this._lastRenderTimestamp = ts;
    }
    getLastRenderTimeStamp() {
        return this._lastRenderTimestamp;
    }
    setLRUIterator(iter) {
        this._lruIterator = iter;
    }
    getLRUIterator() {
        return this._lruIterator;
    }
    isBatchable() {
        return false;
    }
}
//# sourceMappingURL=graph_node.js.map