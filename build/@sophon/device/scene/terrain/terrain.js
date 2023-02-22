/** sophon base library */
import { Vector3 } from '@sophon/base';
import { Quadtree } from './quadtree.js';
import '../../device/base_types.js';
import '../../device/gpuobject.js';
import { FaceMode } from '../../device/render_states.js';
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
import { MAX_DETAIL_TEXTURE_LEVELS, TerrainMaterial } from './terrainmaterial.js';
import { GraphNode } from '../graph_node.js';
import { MATERIAL_FUNC_DEPTH_SHADOW } from '../values.js';

class Terrain extends GraphNode {
    _quadtree;
    _maxPixelError;
    _maxPixelErrorDirty;
    _detailPatches;
    _nondetailPatches;
    _lodCamera;
    _scale;
    _patchSize;
    _detailLodLevel;
    _lastViewportH;
    _lastTanHalfFOVY;
    _width;
    _height;
    _material;
    _terrainInfoBuffer;
    _maxDetailTextureLevels;
    _overridenStateSet;
    _wireframe;
    _viewPoint;
    _castShadow;
    _updateFunc;
    constructor(scene, parent) {
        super(scene, null);
        this._quadtree = null;
        this._maxPixelError = 10;
        this._maxPixelErrorDirty = true;
        this._lodCamera = null;
        this._detailPatches = [];
        this._nondetailPatches = [];
        this._scale = Vector3.one();
        this._patchSize = 33;
        this._detailLodLevel = 0;
        this._lastViewportH = 0;
        this._lastTanHalfFOVY = 0;
        this._width = 0;
        this._height = 0;
        this._material = null;
        this._maxDetailTextureLevels = MAX_DETAIL_TEXTURE_LEVELS;
        this._wireframe = false;
        this._viewPoint = null;
        this._castShadow = false;
        this._overridenStateSet = scene.device.createRenderStateSet();
        this._overridenStateSet.useRasterizerState().setCullMode(FaceMode.NONE);
        this._updateFunc = (evt) => this.frameUpdate(evt.camera);
        this.addEventListener('attached', () => {
            scene.addEventListener('tick', this._updateFunc);
        });
        this.addEventListener('detached', () => {
            scene.removeEventListener('tick', this._updateFunc);
        });
        this.parent = parent || scene.rootNode;
    }
    get castShadow() {
        return this._castShadow;
    }
    set castShadow(val) {
        this._castShadow = !!val;
    }
    get maxDetailTextureLevels() {
        return this._maxDetailTextureLevels;
    }
    get maxPixelError() {
        return this._maxPixelError;
    }
    set maxPixelError(val) {
        if (val !== this._maxPixelError) {
            this._maxPixelError = val;
            this._maxPixelErrorDirty = true;
        }
    }
    get LODCamera() {
        return this._lodCamera;
    }
    set LODCamera(camera) {
        this._lodCamera = camera;
    }
    get scale() {
        return this._scale;
    }
    get patchSize() {
        return this._patchSize;
    }
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }
    get detailLODLevel() {
        return this._detailLodLevel;
    }
    get material() {
        return this._material;
    }
    get wireframe() {
        return this._wireframe;
    }
    set wireframe(b) {
        this._wireframe = !!b;
    }
    get normalMap() {
        return this._quadtree.normalMap;
    }
    create(sizeX, sizeZ, elevations, scale, patchSize) {
        this._quadtree = new Quadtree(this);
        this._material = new TerrainMaterial(this._scene.device);
        if (!this._quadtree.build(this._scene, patchSize, sizeX, sizeZ, elevations, scale.x, scale.z, 24)) {
            this._quadtree = null;
            return false;
        }
        this._patchSize = patchSize;
        this._width = sizeX;
        this._height = sizeZ;
        this._material.normalMap = this._quadtree.normalMap;
        this._terrainInfoBuffer = null;
        this.invalidateBoundingVolume();
        return true;
    }
    computeBoundingVolume(bv) {
        return this._quadtree ? this._quadtree.getHeightField().getBBoxTree().getRootNode().bbox : null;
    }
    frameUpdate(camera) {
        const viewportH = this.scene.device.getViewport()[3];
        const tanHalfFovy = camera.getTanHalfFovy();
        if (viewportH !== this._lastViewportH || tanHalfFovy !== this._lastTanHalfFOVY || this._maxPixelErrorDirty) {
            this._maxPixelErrorDirty = false;
            this._lastViewportH = viewportH;
            this._lastTanHalfFOVY = tanHalfFovy;
            this._quadtree.setupCamera(viewportH, tanHalfFovy, this._maxPixelError);
        }
        const worldEyePos = camera.worldMatrix.getRow(3).xyz();
        this._viewPoint = this.invWorldMatrix.transformPointAffine(worldEyePos);
    }
    cull(cullVisitor) {
        this.clearPatches();
        this._quadtree.cull(cullVisitor.camera, this._viewPoint, this.worldMatrix);
        return this._detailPatches.length > 0;
    }
    isTransparency() {
        return false;
    }
    isUnlit() {
        return !this.material?.supportLighting();
    }
    isTerrain() {
        return true;
    }
    draw(ctx) {
        if (!this._terrainInfoBuffer) {
            const program = this._material.getOrCreateProgram(ctx).programs[ctx.materialFunc];
            this._terrainInfoBuffer = this.scene.device.createStructuredBuffer(program.getBindingInfo('terrainInfo').type, { usage: 'uniform' });
            const bbox = this.getBoundingVolume().toAABB();
            const terrainSizeX = bbox.extents.x * 2;
            const terrainSizeZ = bbox.extents.z * 2;
            this._terrainInfoBuffer.bufferSubData(0, new Int32Array([terrainSizeX, terrainSizeZ, 0, 0]));
            this._terrainInfoBuffer.restoreHandler = async (obj) => {
                this._terrainInfoBuffer.bufferSubData(0, new Int32Array([terrainSizeX, terrainSizeZ, 0, 0]));
            };
        }
        if (ctx.materialFunc === MATERIAL_FUNC_DEPTH_SHADOW) {
            this.scene.device.setRenderStatesOverridden(this._overridenStateSet);
        }
        if (this._material.beginDraw(ctx)) {
            const bindGroup = this._material.getMaterialBindGroup();
            bindGroup.setBuffer('terrainInfo', this._terrainInfoBuffer);
            for (const patch of this._detailPatches) {
                bindGroup.setBuffer('scaleOffset', patch.getOffsetScale(this, ctx));
                (this._wireframe ? patch.getGeometryWireframe() : patch.getGeometry()).draw();
            }
            this._material.endDraw();
        }
        if (ctx.materialFunc === MATERIAL_FUNC_DEPTH_SHADOW) {
            this.scene.device.setRenderStatesOverridden(null);
        }
    }
    getPatches() {
        return this._quadtree?.getPatches() || [];
    }
    addPatch(patch, detail) {
        if (detail) {
            this._detailPatches.push(patch);
        }
        else {
            this._nondetailPatches.push(patch);
        }
    }
    clearPatches() {
        this._detailPatches.length = 0;
        this._nondetailPatches.length = 0;
    }
}

export { Terrain };
//# sourceMappingURL=terrain.js.map
