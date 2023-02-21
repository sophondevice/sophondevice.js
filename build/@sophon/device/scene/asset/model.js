/** sophon base library */
import { Vector3, Quaternion, Matrix4x4 } from '@sophon/base';

class AssetModelObject {
    name;
    constructor(name) {
        this.name = name;
    }
}
class AssetHierarchyNode extends AssetModelObject {
    _parent;
    _position;
    _rotation;
    _scaling;
    _mesh;
    _skeleton;
    _attachToSkeleton;
    _attachIndex;
    _meshAttached;
    _matrix;
    _worldMatrix;
    _children;
    constructor(name, parent) {
        super(name);
        this._parent = null;
        this._position = Vector3.zero();
        this._rotation = Quaternion.identity();
        this._scaling = Vector3.one();
        this._children = [];
        this._mesh = null;
        this._skeleton = null;
        this._attachToSkeleton = null;
        this._meshAttached = false;
        this._attachIndex = -1;
        this._matrix = null;
        this._worldMatrix = null;
        parent?.addChild(this);
    }
    get parent() {
        return this._parent;
    }
    get matrix() {
        return this._matrix;
    }
    get worldMatrix() {
        return this._worldMatrix;
    }
    get mesh() {
        return this._mesh;
    }
    set mesh(data) {
        this._mesh = data;
        this.setMeshAttached();
    }
    get skeleton() {
        return this._skeleton;
    }
    set skeleton(skeleton) {
        this._skeleton = skeleton;
    }
    get position() {
        return this._position;
    }
    set position(val) {
        this._position = val;
    }
    get rotation() {
        return this._rotation;
    }
    set rotation(val) {
        this._rotation = val;
    }
    get scaling() {
        return this._scaling;
    }
    set scaling(val) {
        this._scaling = val;
    }
    get meshAttached() {
        return this._meshAttached;
    }
    get children() {
        return this._children;
    }
    get skeletonAttached() {
        return this._attachToSkeleton;
    }
    get attachIndex() {
        return this._attachIndex;
    }
    computeTransforms(parentTransform) {
        this._matrix = Matrix4x4.scaling(this._scaling).rotateLeft(this._rotation).translateLeft(this._position);
        this._worldMatrix = parentTransform ? Matrix4x4.multiply(parentTransform, this._matrix) : new Matrix4x4(this._matrix);
        for (const child of this._children) {
            child.computeTransforms(this._worldMatrix);
        }
    }
    addChild(child) {
        if (!child || child.parent) {
            throw new Error('AssetHierarchyNode.addChild(): invalid child node');
        }
        this._children.push(child);
        child._parent = this;
        if (child.meshAttached) {
            this.setMeshAttached();
        }
    }
    removeChild(child) {
        const index = this._children.indexOf(child);
        if (index < 0) {
            throw new Error('AssetHierarchyNode.removeChild(): invalid child node');
        }
        this._children[index]._parent = null;
        this._children.splice(index, 1);
    }
    attachToSkeleton(skeleton, index) {
        if (this._attachToSkeleton && skeleton !== this._attachToSkeleton) {
            throw new Error(`joint can not attached to multiple skeletons`);
        }
        this._attachToSkeleton = skeleton;
        this._attachIndex = index;
    }
    setMeshAttached() {
        this._meshAttached = true;
        this._parent?.setMeshAttached();
    }
}
class AssetSkeleton extends AssetModelObject {
    pivot;
    joints;
    inverseBindMatrices;
    bindPoseMatrices;
    constructor(name) {
        super(name);
        this.name = name;
        this.pivot = null;
        this.joints = [];
        this.inverseBindMatrices = [];
        this.bindPoseMatrices = [];
    }
    addJoint(joint, inverseBindMatrix) {
        joint.attachToSkeleton(this, this.joints.length);
        this.joints.push(joint);
        this.inverseBindMatrices.push(inverseBindMatrix);
        this.bindPoseMatrices.push(joint.worldMatrix);
    }
}
class AssetScene extends AssetModelObject {
    rootNodes;
    constructor(name) {
        super(name);
        this.rootNodes = [];
    }
}
class SharedModel {
    _name;
    _skeletons;
    _nodes;
    _animations;
    _scenes;
    _activeScene;
    constructor(name) {
        this._name = name || '';
        this._skeletons = [];
        this._nodes = [];
        this._scenes = [];
        this._animations = [];
        this._activeScene = -1;
    }
    get name() {
        return this._name;
    }
    set name(val) {
        this._name = val;
    }
    get scenes() {
        return this._scenes;
    }
    get animations() {
        return this._animations;
    }
    get skeletons() {
        return this._skeletons;
    }
    get nodes() {
        return this._nodes;
    }
    get activeScene() {
        return this._activeScene;
    }
    set activeScene(val) {
        this._activeScene = val;
    }
    addNode(parent, index, name) {
        const childNode = new AssetHierarchyNode(name, parent);
        this._nodes[index] = childNode;
        return childNode;
    }
    addSkeleton(skeleton) {
        this._skeletons.push(skeleton);
    }
    addAnimation(animation) {
        this._animations.push(animation);
    }
}

export { AssetHierarchyNode, AssetModelObject, AssetScene, AssetSkeleton, SharedModel };
//# sourceMappingURL=model.js.map
