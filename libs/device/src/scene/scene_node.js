import { REvent } from '@sophon/base/event';
import { XForm } from './xform';
class SceneNodeEventPath {
    path;
    constructor() {
        this.path = [];
    }
    toArray() {
        return this.path;
    }
}
export class SceneNodeEventPathBuilder {
    build(node) {
        const path = new SceneNodeEventPath();
        let sceneNode = node;
        while (sceneNode) {
            path.path.push(sceneNode);
            if (sceneNode.parent) {
                sceneNode = sceneNode.parent;
            }
            else {
                path.path.push(sceneNode.scene);
                sceneNode = null;
            }
        }
        return path;
    }
}
export class SceneNodeAttachEvent extends REvent {
    static ATTACHED_NAME = 'attached';
    static DETACHED_NAME = 'detached';
    node;
    constructor(name, node) {
        super(name, true, false);
        this.node = node;
    }
}
const sceneNodeEventPathBuilder = new SceneNodeEventPathBuilder();
export class SceneNode extends XForm {
    _name;
    _attachEvent;
    _detachEvent;
    constructor(scene, parent) {
        super(scene, null, sceneNodeEventPathBuilder);
        this._name = '';
        this._attachEvent = new SceneNodeAttachEvent(SceneNodeAttachEvent.ATTACHED_NAME, this);
        this._detachEvent = new SceneNodeAttachEvent(SceneNodeAttachEvent.DETACHED_NAME, this);
        if (parent !== null) {
            this.reparent(parent || scene.rootNode);
        }
    }
    get name() {
        return this._name;
    }
    set name(val) {
        this._name = val || '';
    }
    get attached() {
        return !!this._scene?.rootNode.isParentOf(this);
    }
    setPosition(value) {
        this.position = value;
        return this;
    }
    setScale(value) {
        this.scaling = value;
        return this;
    }
    setRotation(value) {
        this.rotation = value;
        return this;
    }
    hasChild(child) {
        return this._children.indexOf(child) >= 0;
    }
    removeChildren() {
        while (this._children.length) {
            this._children[0].remove();
        }
    }
    iterateChildren(func) {
        for (const child of this._children) {
            func(child);
            child.iterateChildren(func);
        }
    }
    isParentOf(child) {
        while (child && child !== this) {
            child = child.parent;
        }
        return child === this;
    }
    remove() {
        this.parent = null;
        return this;
    }
    reparent(p) {
        this.parent = p;
        return this;
    }
    accept(v) {
        v.visit(this);
    }
    traverse(v, inverse) {
        if (inverse) {
            for (let i = this._children.length - 1; i >= 0; i--) {
                this._children[i].traverse(v, inverse);
            }
            v.visit(this);
        }
        else {
            v.visit(this);
            for (const child of this._children) {
                child.traverse(v);
            }
        }
    }
    isGraphNode() {
        return false;
    }
    isLight() {
        return false;
    }
    isMesh() {
        return false;
    }
    isTerrain() {
        return false;
    }
    isCamera() {
        return false;
    }
    isPunctualLight() {
        return false;
    }
    dispose() {
        this.remove();
        this.removeChildren();
    }
    invalidateWorldBoundingVolume() {
        super.invalidateWorldBoundingVolume();
        this._scene && this._scene._bvChanged(this);
    }
    _setParent(p) {
        const lastAttached = this.attached;
        super._setParent(p);
        if (lastAttached) {
            this._fireAttachEvent(this._detachEvent);
        }
        if (this.attached) {
            this._fireAttachEvent(this._attachEvent);
        }
    }
    _fireAttachEvent(evt) {
        evt.reset();
        this.dispatchEvent(evt);
        for (const child of this.children) {
            child._fireAttachEvent(evt);
        }
    }
}
//# sourceMappingURL=scene_node.js.map