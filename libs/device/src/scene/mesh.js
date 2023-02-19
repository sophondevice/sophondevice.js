import { GraphNode } from './graph_node';
import { BoxFrameShape, BoxShape, PlaneShape, SphereShape } from './shape';
import { LambertLightModel, StandardMaterial } from './materiallib';
export class Mesh extends GraphNode {
    _primitive;
    _material;
    _castShadow;
    _bboxChangeCallback;
    _animatedBoundingBox;
    _boneMatrices;
    _invBindMatrix;
    _instanceHash;
    _batchable;
    _boundingBoxNode;
    constructor(scene, parent) {
        super(scene, parent);
        this._primitive = null;
        this._material = null;
        this._castShadow = true;
        this._animatedBoundingBox = null;
        this._boneMatrices = null;
        this._invBindMatrix = null;
        this._instanceHash = null;
        this._boundingBoxNode = null;
        this._batchable = scene.device.getDeviceType() !== 'webgl';
        this._bboxChangeCallback = this._onBoundingboxChange.bind(this);
    }
    getInstanceId(renderPass) {
        return this._instanceHash;
    }
    get castShadow() {
        return this._castShadow;
    }
    set castShadow(b) {
        this._castShadow = b;
    }
    get primitive() {
        return this._primitive;
    }
    set primitive(prim) {
        if (prim !== this._primitive) {
            if (this._primitive) {
                this._primitive.removeBoundingboxChangeCallback(this._bboxChangeCallback);
            }
            this._primitive = prim || null;
            if (this._primitive) {
                this._primitive.addBoundingboxChangeCallback(this._bboxChangeCallback);
            }
            this._instanceHash = (this._primitive && this._material) ? `${this.constructor.name}:${this._scene.id}:${this._primitive.id}:${this._material.id}` : null;
            this.invalidateBoundingVolume();
        }
    }
    get material() {
        return this._material;
    }
    set material(m) {
        if (this._material !== m) {
            this._material = m;
            this._instanceHash = (this._primitive && this._material) ? `${this.constructor.name}:${this._scene.id}:${this._primitive.id}:${this._material.id}` : null;
        }
    }
    get drawBoundingBox() {
        return !!this._boundingBoxNode;
    }
    set drawBoundingBox(val) {
        if (!!this._boundingBoxNode !== !!val) {
            if (!val) {
                this._boundingBoxNode.remove();
                this._boundingBoxNode = null;
            }
            else {
                this._boundingBoxNode = Mesh.unitBoxFrame(this._scene, this);
                this._boundingBoxNode.scaling.assign(this.getBoundingVolume().toAABB().size.getArray());
                this._boundingBoxNode.position.assign(this.getBoundingVolume().toAABB().minPoint.getArray());
            }
        }
    }
    isMesh() {
        return true;
    }
    setAnimatedBoundingBox(bbox) {
        this._animatedBoundingBox = bbox;
        this.invalidateBoundingVolume();
    }
    setBoneMatrices(matrices) {
        this._boneMatrices = matrices;
    }
    setInvBindMatrix(matrix) {
        this._invBindMatrix = matrix;
    }
    isBatchable() {
        return this._batchable && !this._boneMatrices;
    }
    dispose() {
        this._primitive = null;
        this._material = null;
        super.dispose();
    }
    isTransparency() {
        return !!this.material?.isTransparent();
    }
    isUnlit() {
        return !this.material?.supportLighting();
    }
    draw(ctx) {
        this.material.draw(this.primitive, ctx);
    }
    getBoneMatrices() {
        return this._boneMatrices;
    }
    getInvBindMatrix() {
        return this._invBindMatrix;
    }
    getXForm() {
        return this;
    }
    computeBoundingVolume(bv) {
        let bbox;
        if (this._animatedBoundingBox) {
            bbox = this._animatedBoundingBox;
        }
        else {
            const primitive = this.primitive;
            bbox = primitive ? primitive.getBoundingVolume() : null;
        }
        if (bbox && this._boundingBoxNode) {
            this._boundingBoxNode.scaling.assign(bbox.toAABB().size.getArray());
            this._boundingBoxNode.position.assign(bbox.toAABB().minPoint.getArray());
        }
        return bbox;
    }
    _onBoundingboxChange() {
        this.invalidateBoundingVolume();
    }
    static _defaultMaterial = null;
    static _defaultSphere = null;
    static _defaultBox = null;
    static _defaultBoxFrame = null;
    static _getDefaultMaterial(device) {
        if (!this._defaultMaterial) {
            this._defaultMaterial = new StandardMaterial(device);
            this._defaultMaterial.lightModel = new LambertLightModel();
        }
        return this._defaultMaterial;
    }
    static unitSphere(scene, parent) {
        if (!this._defaultSphere) {
            this._defaultSphere = new SphereShape(scene.device, { radius: 1 });
        }
        const mesh = new Mesh(scene, parent);
        mesh.primitive = this._defaultSphere;
        mesh.material = this._getDefaultMaterial(scene.device);
        return mesh;
    }
    static unitBox(scene, parent) {
        if (!this._defaultBox) {
            this._defaultBox = new BoxShape(scene.device, { size: 1 });
        }
        const mesh = new Mesh(scene, parent);
        mesh.primitive = this._defaultBox;
        mesh.material = this._getDefaultMaterial(scene.device);
        return mesh;
    }
    static unitBoxFrame(scene, parent) {
        if (!this._defaultBoxFrame) {
            this._defaultBoxFrame = new BoxFrameShape(scene.device, { size: 1 });
        }
        const mesh = new Mesh(scene, parent);
        mesh.primitive = this._defaultBoxFrame;
        mesh.material = this._getDefaultMaterial(scene.device);
        return mesh;
    }
}
export class BoxMesh extends Mesh {
    constructor(scene, options) {
        super(scene);
        this.primitive = new BoxShape(scene.device, options);
        this.material = options.material;
        if (!this.material) {
            const stdMat = new StandardMaterial(scene.device);
            stdMat.lightModel = new LambertLightModel();
            this.material = stdMat;
        }
    }
}
export class PlaneMesh extends Mesh {
    constructor(scene, options) {
        super(scene);
        this.primitive = new PlaneShape(scene.device, options);
        this.material = options.material;
        if (!this.material) {
            const stdMat = new StandardMaterial(scene.device);
            stdMat.lightModel = new LambertLightModel();
            this.material = stdMat;
        }
    }
}
export class SphereMesh extends Mesh {
    constructor(scene, options) {
        super(scene);
        this.primitive = new SphereShape(scene.device, options);
        this.material = options.material;
        if (!this.material) {
            const stdMat = new StandardMaterial(scene.device);
            stdMat.lightModel = new LambertLightModel();
            this.material = stdMat;
        }
    }
}
//# sourceMappingURL=mesh.js.map