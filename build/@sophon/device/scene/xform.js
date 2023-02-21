/** sophon base library */
import { REvent, REventTarget, Vector3, Quaternion, Matrix4x4 } from '@sophon/base';

class XFormChangeEvent extends REvent {
    static NAME = 'xform_change';
    xform;
    constructor(xform) {
        super(XFormChangeEvent.NAME, true, false);
        this.xform = xform;
    }
}
class XForm extends REventTarget {
    _scene;
    _parent;
    _children;
    _position;
    _scaling;
    _rotation;
    _localMatrix;
    _worldMatrix;
    _invWorldMatrix;
    _tmpLocalMatrix;
    _tmpWorldMatrix;
    _transformTag;
    _bv;
    _bvDirty;
    _bvWorld;
    _changeEvent;
    constructor(scene, parent, eventPathBuilder) {
        super(eventPathBuilder);
        this._scene = scene;
        this._parent = parent || null;
        this._children = [];
        this._position = Vector3.zero();
        this._position.setChangeCallback(() => this._transformCallback(true, true));
        this._scaling = Vector3.one();
        this._scaling.setChangeCallback(() => this._transformCallback(true, true));
        this._rotation = Quaternion.identity();
        this._rotation.setChangeCallback(() => this._transformCallback(true, true));
        this._worldMatrix = null;
        this._invWorldMatrix = null;
        this._localMatrix = null;
        this._transformTag = 0;
        this._tmpLocalMatrix = Matrix4x4.identity();
        this._tmpWorldMatrix = Matrix4x4.identity();
        this._bv = null;
        this._bvWorld = null;
        this._bvDirty = true;
        this._changeEvent = new XFormChangeEvent(this);
    }
    get scene() {
        return this._scene;
    }
    get parent() {
        return this._parent;
    }
    set parent(p) {
        p = p || null;
        if (p !== this._parent) {
            this._setParent(p);
        }
    }
    get children() {
        return this._children;
    }
    get position() {
        return this._position;
    }
    set position(t) {
        if (t && this._position !== t) {
            this._position.assign(t.getArray());
        }
    }
    get scaling() {
        return this._scaling;
    }
    set scaling(s) {
        const v = typeof s === 'number' ? new Vector3(s, s, s) : s;
        if (!this._scaling.equalsTo(v)) {
            this._scaling.assign(v.getArray());
        }
    }
    get rotation() {
        return this._rotation;
    }
    set rotation(r) {
        if (r && r !== this._rotation) {
            this._rotation.assign(r.getArray());
        }
    }
    get localMatrix() {
        if (!this._localMatrix) {
            this._localMatrix = this._tmpLocalMatrix;
            this._localMatrix
                .scaling(this._scaling)
                .rotateLeft(new Matrix4x4(this._rotation))
                .translateLeft(this._position);
        }
        return this._localMatrix;
    }
    get worldMatrix() {
        if (!this._worldMatrix) {
            this._worldMatrix = this._tmpWorldMatrix;
            if (this._parent) {
                this._worldMatrix.assign(this._parent.worldMatrix.getArray()).multiplyRightAffine(this.localMatrix);
            }
            else {
                this._worldMatrix.assign(this.localMatrix.getArray());
            }
        }
        return this._worldMatrix;
    }
    get invWorldMatrix() {
        if (!this._invWorldMatrix) {
            this._invWorldMatrix = Matrix4x4.inverseAffine(this.worldMatrix);
        }
        return this._invWorldMatrix;
    }
    lookAt(eye, target, up) {
        Matrix4x4.lookAt(eye, target, up).decompose(this.scaling, this.rotation, this.position);
        return this;
    }
    notifyChanged(invalidLocal, dispatch) {
        this._transformCallback(invalidLocal, dispatch);
    }
    computeBoundingVolume(bv) {
        return bv;
    }
    getBoundingVolume() {
        if (this._bvDirty) {
            this._bv = this.computeBoundingVolume(this._bv) || null;
            this._bvDirty = false;
        }
        return this._bv;
    }
    setBoundingVolume(bv) {
        if (bv !== this._bv) {
            this._bv = bv;
            this.invalidateBoundingVolume();
        }
    }
    getWorldBoundingVolume() {
        if (!this._bvWorld) {
            this._bvWorld = this.getBoundingVolume()?.transform(this.worldMatrix) ?? null;
        }
        return this._bvWorld;
    }
    invalidateBoundingVolume() {
        this._bvDirty = true;
        this.invalidateWorldBoundingVolume();
    }
    invalidateWorldBoundingVolume() {
        this._bvWorld = null;
    }
    getTag() {
        return this._transformTag;
    }
    _setParent(p) {
        if (this._parent) {
            this._parent._children.splice(this._parent._children.indexOf(this), 1);
        }
        this._parent = p;
        if (this._parent) {
            this._parent._children.push(this);
        }
        this._transformCallback(false, true);
    }
    _transformCallback(invalidLocal, dispatch) {
        if (invalidLocal) {
            this._localMatrix = null;
        }
        this._invalidateWorldMatrix();
        this.invalidateWorldBoundingVolume();
        if (dispatch) {
            this._changeEvent.reset();
            this.dispatchEvent(this._changeEvent);
        }
        for (const child of this._children) {
            child._transformCallback(false, dispatch);
        }
    }
    _invalidateWorldMatrix() {
        this._worldMatrix = null;
        this._invWorldMatrix = null;
        this._transformTag++;
        for (const child of this._children) {
            child._invalidateWorldMatrix();
        }
    }
}

export { XForm, XFormChangeEvent };
//# sourceMappingURL=xform.js.map
