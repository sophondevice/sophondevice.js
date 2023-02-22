/** sophon base library */
import { REventTarget, Matrix4x4, Vector4, Vector3, Ray, AABB, REvent } from '@sophon/base';
import { XFormChangeEvent } from './xform.js';
import { SkyboxMaterial } from './materiallib/skybox.js';
import '../device/gpuobject.js';
import '../device/render_states.js';
import { Material } from './material.js';
import '../device/builder/ast.js';
import '../device/builder/types.js';
import '../device/builder/programbuilder.js';
import './materiallib/lightmodel.js';
import { SceneNode, SceneNodeAttachEvent } from './scene_node.js';
import { BoxMesh } from './mesh.js';
import { Camera } from './camera.js';
import { Octree } from './octree.js';
import { GraphNode } from './graph_node.js';
import './terrain/types.js';
import '../device/base_types.js';
import './asset/assetmanager.js';
import '../device/webgl/utils.js';
import '../device/webgl/webgl_enum.js';
import '../device/webgl/constants_webgl.js';
import '../device/webgl/renderstate_webgl.js';
import '../device/webgpu/constants_webgpu.js';
import '../device/webgpu/structuredbuffer_webgpu.js';
import '../device/webgpu/renderstates_webgpu.js';
import '../device/webgpu/utils_webgpu.js';
import './terrain/terrainmaterial.js';
import { OctreeUpdateVisitor } from './visitors/octree_update_visitor.js';
import { RaycastVisitor } from './visitors/raycast_visitor.js';

class Scene extends REventTarget {
    static _nextId = 0;
    _device;
    _rootNode;
    _octree;
    _cameraList;
    _lightList;
    _xformChangedList;
    _bvChangedList;
    _environmentLighting;
    _envLightStrength;
    _tickEvent;
    _updateFrame;
    _id;
    constructor(device) {
        super();
        this._id = ++Scene._nextId;
        this._device = device;
        this._rootNode = new SceneNode(this, null);
        this._octree = new Octree(this, 2048, 64);
        this._cameraList = [];
        this._lightList = [];
        this._xformChangedList = new Set();
        this._bvChangedList = new Set();
        this._environmentLighting = null;
        this._envLightStrength = 1;
        this._tickEvent = new Scene.TickEvent(this);
        this._updateFrame = -1;
        this.addDefaultEventListener(XFormChangeEvent.NAME, (evt) => {
            const e = evt;
            this._xformChanged(e.xform);
        });
        this.addDefaultEventListener(SceneNodeAttachEvent.ATTACHED_NAME, (evt) => {
            const e = evt;
            this._xformChanged(e.node);
            if (e.node.isCamera()) {
                this._addCamera(e.node);
            }
            else if (e.node.isLight() && e.node.isPunctualLight()) {
                this._addLight(e.node);
            }
            if (this.octree) {
                this.octree.placeNode(e.node);
            }
        });
        this.addDefaultEventListener(SceneNodeAttachEvent.DETACHED_NAME, (evt) => {
            const e = evt;
            this._xformChangedRemove(e.node);
            this._bvChangedRemove(e.node);
            if (this.octree) {
                this.octree.removeNode(e.node);
            }
            if (e.node.isCamera()) {
                this._removeCamera(e.node);
            }
            else if (e.node.isLight() && e.node.isPunctualLight()) {
                this._removeLight(e.node);
            }
        });
    }
    get id() {
        return this._id;
    }
    get device() {
        return this._device;
    }
    get rootNode() {
        return this._rootNode;
    }
    get octree() {
        return this._octree;
    }
    get cameraList() {
        return this._cameraList;
    }
    get lightList() {
        return this._lightList;
    }
    get boundingBox() {
        this._syncBVChangedList();
        return this._octree.getRootNode().getBox() || this._octree.getRootNode().getBoxLoosed();
    }
    get environment() {
        return this._environmentLighting;
    }
    set environment(env) {
        this._environmentLighting = env;
    }
    get envHash() {
        return this._environmentLighting?.constructor.name || '';
    }
    get envLightStrength() {
        return this._envLightStrength;
    }
    set envLightStrength(val) {
        this._envLightStrength = val;
    }
    dispose() {
        this._device = null;
        this._rootNode = null;
    }
    addSkybox(skyTexture) {
        const material = new SkyboxMaterial(this._device);
        material.skyCubeMap = skyTexture;
        const sky = new BoxMesh(this, {
            size: 4,
            pivotX: 0.5,
            pivotY: 0.5,
            pivotZ: 0.5,
            material: material
        });
        sky.clipMode = GraphNode.CLIP_DISABLED;
        sky.renderOrder = GraphNode.ORDER_BACKGROUND;
        sky.pickMode = GraphNode.PICK_DISABLED;
        return sky;
    }
    addCamera(matrix) {
        return new Camera(this, matrix || Matrix4x4.perspective(Math.PI / 3, this._device.getDrawingBufferWidth() / this._device.getDrawingBufferHeight(), 1, 100));
    }
    raycast(camera, screenX, screenY) {
        const viewport = this.device.getViewport();
        const ray = this.constructRay(camera, viewport[2], viewport[3], screenX, screenY);
        const raycastVisitor = new RaycastVisitor(ray);
        this.octree.getRootNode().traverse(raycastVisitor);
        return raycastVisitor.intersected;
    }
    constructRay(camera, viewportWidth, viewportHeight, screenX, screenY, invModelMatrix) {
        const vClip = new Vector4((2 * screenX) / viewportWidth - 1, 1 - (2 * screenY) / viewportHeight, 1, 1);
        const vWorld = camera.invViewProjectionMatrix.transform(vClip);
        vWorld.scaleBy(1 / vWorld.w);
        let vEye = camera.worldMatrix.getRow(3).xyz();
        let vDir = Vector3.sub(vWorld.xyz(), vEye).inplaceNormalize();
        if (invModelMatrix) {
            vEye = invModelMatrix.transformPointAffine(vEye);
            vDir = invModelMatrix.transformVectorAffine(vDir);
        }
        return new Ray(vEye, vDir);
    }
    _addLight(node) {
        if (node && node.isLight() && this._lightList.indexOf(node) < 0) {
            this._lightList.push(node);
        }
    }
    _removeLight(node) {
        const index = this._lightList.indexOf(node);
        if (index >= 0) {
            this._lightList.splice(index, 1);
        }
    }
    _addCamera(node) {
        if (node && node.isCamera() && this._cameraList.indexOf(node) < 0) {
            this._cameraList.push(node);
        }
    }
    _removeCamera(node) {
        const index = this._cameraList.indexOf(node);
        if (index >= 0) {
            this._cameraList.splice(index, 1);
        }
    }
    _xformChanged(node) {
        if (node) {
            !this._xformChangedList.has(node) && this._xformChangedList.add(node);
            !this._bvChangedList.has(node) && this._bvChangedList.add(node);
        }
    }
    _xformChangedRemove(node) {
        if (node) {
            if (this._xformChangedList.has(node)) {
                this._xformChangedList.delete(node);
            }
            for (const child of node.children) {
                this._xformChangedRemove(child);
            }
        }
    }
    _bvChanged(node) {
        node && !this._bvChangedList.has(node) && this._bvChangedList.add(node);
    }
    _bvChangedRemove(node) {
        if (this._bvChangedList.has(node)) {
            this._bvChangedList.delete(node);
        }
    }
    frameUpdate(camera) {
        const frameInfo = this._device.frameInfo;
        if (frameInfo.frameCounter !== this._updateFrame) {
            this._updateFrame = frameInfo.frameCounter;
            if (!Material.getGCOptions().disabled) {
                Material.garbageCollect(frameInfo.frameTimestamp);
            }
            this._tickEvent.reset();
            this._tickEvent.camera = camera;
            this.dispatchEvent(this._tickEvent);
            this._syncXFormChangedList();
            this._syncBVChangedList();
            camera.frameUpdate();
        }
    }
    _syncXFormChangedList() {
        const that = this;
        function syncNodeXForm(node, checkAttach) {
            if (!checkAttach || node.attached) {
                if (that.octree && node.isGraphNode()) {
                    that.octree.placeNode(node);
                }
                if (node.isPunctualLight()) {
                    node.invalidateUniforms();
                }
                for (const child of node.children) {
                    syncNodeXForm(child, false);
                }
                if (that._xformChangedList.has(node)) {
                    that._xformChangedList.delete(node);
                }
            }
            else {
                that._xformChangedList.delete(node);
            }
        }
        while (this._xformChangedList.size > 0) {
            syncNodeXForm(this._xformChangedList.keys().next().value, true);
        }
    }
    _syncNodeBV(node) {
        if (this.octree && node.isGraphNode() && node.attached) {
            this.octree.placeNode(node);
        }
        this._bvChangedList.delete(node);
    }
    _syncBVChangedList() {
        if (this._bvChangedList.size > 0) {
            while (this._bvChangedList.size > 0) {
                this._syncNodeBV(this._bvChangedList.keys().next().value);
            }
            const worldBox = this.boundingBox;
            const rootBox = new AABB(this._octree.getRootNode().getBoxLoosed());
            let rootSize = this._octree.getRootSize();
            while (!rootBox.containsBox(worldBox)) {
                rootSize *= 2;
                rootBox.minPoint.scaleBy(2);
                rootBox.maxPoint.scaleBy(2);
            }
            if (rootSize > this._octree.getRootSize()) {
                this._octree.initialize(rootSize, this._octree.getLeafSize());
                const v = new OctreeUpdateVisitor(this._octree);
                this._rootNode.traverse(v);
            }
        }
    }
}
(function (Scene) {
    class TickEvent extends REvent {
        static NAME = 'tick';
        camera;
        scene;
        constructor(scene) {
            super(TickEvent.NAME, false, false);
            this.scene = scene;
            this.camera = null;
        }
    }
    Scene.TickEvent = TickEvent;
})(Scene || (Scene = {}));

export { Scene };
//# sourceMappingURL=scene.js.map
