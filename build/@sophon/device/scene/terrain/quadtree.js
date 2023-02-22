/** sophon base library */
import { isPowerOf2, nextPowerOf2, Vector3, Frustum, ClipState } from '@sophon/base';
import { PatchPosition } from './types.js';
import { BoundingBox } from '../bounding_volume.js';
import { TerrainPatch } from './patch.js';
import { PrimitiveType, TextureFormat } from '../../device/base_types.js';
import { makeVertexBufferType } from '../../device/gpuobject.js';
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
import { HeightField } from './heightfield.js';

class QuadtreeNode {
    _patch;
    _parent;
    _children;
    constructor() {
        this._patch = null;
        this._parent = null;
        this._children = null;
    }
    initialize(scene, quadtree, parent, position, baseVertices, normals, elevations) {
        this._parent = parent;
        this._children = [];
        this._patch = new TerrainPatch();
        if (!this._patch.initialize(scene, quadtree, this._parent?._patch || null, position, baseVertices, normals, elevations)) {
            return false;
        }
        if (this._patch.getStep() > 1) {
            let bbox = null;
            const size = (quadtree.getPatchSize() - 1) * (this._patch.getStep() >> 1);
            const offsetX = this._patch.getOffsetX();
            const offsetZ = this._patch.getOffsetZ();
            const offsets = [
                [offsetX, offsetZ],
                [offsetX + size, offsetZ],
                [offsetX, offsetZ + size],
                [offsetX + size, offsetZ + size]
            ];
            const rootSizeX = quadtree.getRootSizeX() - 1;
            const rootSizeZ = quadtree.getRootSizeZ() - 1;
            for (let i = 0; i < 4; ++i) {
                if (offsets[i][0] >= rootSizeX || offsets[i][1] >= rootSizeZ) {
                    this._children[i] = null;
                }
                else {
                    this._children[i] = new QuadtreeNode();
                    if (!this._children[i].initialize(scene, quadtree, this, i, baseVertices, normals, elevations)) {
                        return false;
                    }
                    const childBBox = this._children[i]._patch.getBoundingBox();
                    if (childBBox) {
                        if (!bbox) {
                            bbox = new BoundingBox();
                            bbox.beginExtend();
                        }
                        bbox.extend(childBBox.minPoint);
                        bbox.extend(childBBox.maxPoint);
                    }
                }
            }
            this._patch.setBoundingBox(bbox);
        }
        quadtree.addPatch(this._patch);
        return true;
    }
    setupCamera(viewportH, tanHalfFovy, maxPixelError) {
        if (this._patch && !this._patch.isDummy()) {
            this._patch.setupCamera(viewportH, tanHalfFovy, maxPixelError);
        }
        for (let i = 0; i < 4; ++i) {
            if (this._children[i]) {
                this._children[i].setupCamera(viewportH, tanHalfFovy, maxPixelError);
            }
        }
    }
    getBoundingbox() {
        return this._patch.getBoundingBox();
    }
    getPatch() {
        return this._patch;
    }
    getParent() {
        return this._parent;
    }
    getChild(index) {
        return this._children[index];
    }
}
class Quadtree {
    _baseVertices;
    _indices;
    _indicesWireframe;
    _normalMap;
    _scaleX;
    _scaleZ;
    _patchSize;
    _rootSizeX;
    _rootSizeZ;
    _rootSize;
    _primitiveCount;
    _primitiveType;
    _rootNode;
    _terrain;
    _heightField;
    _patches;
    constructor(terrain) {
        this._terrain = terrain;
        this._baseVertices = null;
        this._indices = null;
        this._indicesWireframe = null;
        this._normalMap = null;
        this._scaleX = 1;
        this._scaleZ = 1;
        this._patchSize = 0;
        this._rootSizeX = 0;
        this._rootSizeZ = 0;
        this._rootSize = 0;
        this._heightField = null;
        this._rootNode = null;
        this._primitiveCount = 0;
        this._primitiveType = PrimitiveType.TriangleStrip;
        this._patches = [];
    }
    get normalMap() {
        return this._normalMap;
    }
    build(scene, patchSize, rootSizeX, rootSizeZ, elevations, scaleX, scaleZ, vertexCacheSize) {
        const device = scene.device;
        if (!isPowerOf2(patchSize - 1)
            || !!((rootSizeX - 1) % (patchSize - 1))
            || !!((rootSizeZ - 1) % (patchSize - 1))
            || !elevations) {
            return false;
        }
        this._heightField = new HeightField();
        if (!this._heightField.init(rootSizeX, rootSizeZ, 0, 0, scaleX, scaleZ, 1, elevations, patchSize)) {
            this._heightField = null;
            return false;
        }
        this._patchSize = patchSize;
        this._rootSizeX = rootSizeX;
        this._rootSizeZ = rootSizeZ;
        this._rootSize = nextPowerOf2(Math.max((rootSizeX - 1), (rootSizeZ - 1))) + 1;
        this._scaleX = scaleX;
        this._scaleZ = scaleZ;
        const dimension = patchSize + 2;
        const vertices = new Float32Array(dimension * dimension * 3);
        let offset = 0;
        vertices[0] = 0;
        vertices[1] = 0;
        vertices[2] = 0;
        for (let i = 1; i < dimension - 1; ++i) {
            vertices[3 * i + 0] = i - 1;
            vertices[3 * i + 1] = 0;
            vertices[3 * i + 2] = 0;
        }
        vertices[3 * (dimension - 1) + 0] = dimension - 3;
        vertices[3 * (dimension - 1) + 1] = 0;
        vertices[3 * (dimension - 1) + 2] = 0;
        offset += dimension * 3;
        for (let i = 1; i < dimension - 1; ++i, offset += dimension * 3) {
            vertices[offset + 0] = 0;
            vertices[offset + 1] = 0;
            vertices[offset + 2] = i - 1;
            for (let j = 1; j < dimension - 1; ++j) {
                vertices[offset + 3 * j + 0] = j - 1;
                vertices[offset + 3 * j + 1] = 0;
                vertices[offset + 3 * j + 2] = i - 1;
            }
            vertices[offset + (dimension - 1) * 3 + 0] = dimension - 3;
            vertices[offset + (dimension - 1) * 3 + 1] = 0;
            vertices[offset + (dimension - 1) * 3 + 2] = i - 1;
        }
        vertices[offset + 0] = 0;
        vertices[offset + 1] = 0;
        vertices[offset + 2] = dimension - 3;
        for (let i = 1; i < dimension - 1; ++i) {
            vertices[offset + 3 * i + 0] = i - 1;
            vertices[offset + 3 * i + 1] = 0;
            vertices[offset + 3 * i + 2] = dimension - 3;
        }
        vertices[offset + (dimension - 1) * 3 + 0] = dimension - 3;
        vertices[offset + (dimension - 1) * 3 + 1] = 0;
        vertices[offset + (dimension - 1) * 3 + 2] = dimension - 3;
        this._baseVertices = device.createStructuredBuffer(makeVertexBufferType(dimension * dimension, 'position_f32x3'), { usage: 'vertex', managed: true }, vertices);
        const indices = this.strip(vertexCacheSize);
        this._indices = device.createIndexBuffer(indices, { managed: true });
        const lineIndices = this.line(indices);
        this._indicesWireframe = device.createIndexBuffer(lineIndices, { managed: true });
        this._primitiveCount = indices.length - 2;
        this._primitiveType = PrimitiveType.TriangleStrip;
        this._rootNode = new QuadtreeNode();
        const normals = this._heightField.computeNormalVectors();
        const normalMapBytes = new Uint8Array(normals.length / 3 * 4);
        for (let i = 0; i < normals.length / 3; i++) {
            normalMapBytes[i * 4 + 0] = Math.floor((normals[i * 3 + 0] * 0.5 + 0.5) * 255);
            normalMapBytes[i * 4 + 1] = Math.floor((normals[i * 3 + 1] * 0.5 + 0.5) * 255);
            normalMapBytes[i * 4 + 2] = Math.floor((normals[i * 3 + 2] * 0.5 + 0.5) * 255);
            normalMapBytes[i * 4 + 3] = 255;
        }
        this._normalMap = device.createTexture2D(TextureFormat.RGBA8UNORM, rootSizeX, rootSizeZ, { colorSpace: 'linear' });
        this._normalMap.name = `TerrainNormalMap-${this._normalMap.uid}`;
        this._normalMap.update(normalMapBytes, 0, 0, this._normalMap.width, this._normalMap.height);
        return this._rootNode.initialize(scene, this, null, PatchPosition.LeftTop, this._baseVertices, normals, elevations);
    }
    strip(vertexCacheSize) {
        const dimension = this._patchSize + 2;
        const step = (vertexCacheSize >> 1) - 1;
        const indices = [];
        for (let i = 0; i < dimension - 1; i += step) {
            const start = i;
            const end = (i + step > dimension - 1) ? dimension - 1 : i + step;
            for (let j = 0; j < dimension - 1; ++j) {
                for (let k = start; k <= end; ++k) {
                    indices.push((dimension - 1 - k) * dimension + j);
                    indices.push((dimension - 1 - k) * dimension + j + 1);
                }
                indices.push((dimension - 1 - end) * dimension + j + 1);
                indices.push((j == dimension - 2) ? (dimension - 1 - end) * dimension : (dimension - 1 - start) * dimension + j + 1);
            }
        }
        indices.length = indices.length - 2;
        return new Uint16Array(indices);
    }
    line(strip) {
        const numTris = strip.length - 2;
        const lineIndices = [];
        let lastSkipped = true;
        let a, b, c;
        for (let i = 0; i < numTris; i++) {
            if (i % 2 === 0) {
                a = strip[i];
                b = strip[i + 1];
                c = strip[i + 2];
            }
            else {
                a = strip[i + 1];
                b = strip[i];
                c = strip[i + 2];
            }
            const thisSkipped = a === b || a === c || b === c;
            if (!thisSkipped) {
                if (lastSkipped) {
                    lineIndices.push(a, b);
                }
                lineIndices.push(b, c, c, a);
            }
            lastSkipped = thisSkipped;
        }
        return new Uint16Array(lineIndices);
    }
    setupCamera(viewportH, tanHalfFovy, maxPixelError) {
        this._rootNode?.setupCamera(viewportH, tanHalfFovy, maxPixelError);
    }
    getBoundingBox(bbox) {
        if (this._heightField) {
            bbox.minPoint = this._heightField.getBoundingbox().minPoint;
            bbox.maxPoint = this._heightField.getBoundingbox().maxPoint;
        }
        else {
            bbox.minPoint = Vector3.zero();
            bbox.maxPoint = Vector3.zero();
        }
    }
    getPatchSize() {
        return this._patchSize;
    }
    getRootSize() {
        return this._rootSize;
    }
    getRootSizeX() {
        return this._rootSizeX;
    }
    getRootSizeZ() {
        return this._rootSizeZ;
    }
    getTerrain() {
        return this._terrain;
    }
    getElevations() {
        return this._heightField?.getHeights() || null;
    }
    getScaleX() {
        return this._scaleX;
    }
    getScaleZ() {
        return this._scaleZ;
    }
    getIndices() {
        return this._indices;
    }
    getIndicesWireframe() {
        return this._indicesWireframe;
    }
    getPrimitiveCount() {
        return this._primitiveCount;
    }
    getPrimitiveType() {
        return this._primitiveType;
    }
    getHeightField() {
        return this._heightField;
    }
    getPatches() {
        return this._patches;
    }
    addPatch(patch) {
        this._patches.push(patch);
    }
    cull(camera, viewPoint, worldMatrix) {
        if (this._rootNode && this._terrain) {
            const frustum = new Frustum(camera.viewProjectionMatrix, worldMatrix);
            this.cull_r(camera, this._rootNode, viewPoint, worldMatrix, frustum, true);
        }
    }
    cull_r(camera, node, viewPoint, worldMatrix, frustum, cliptest) {
        const bbox = node.getBoundingbox();
        if (cliptest) {
            const clipState = bbox.getClipStateWithFrustum(frustum);
            if (clipState === ClipState.NOT_CLIPPED) {
                return;
            }
            else if (clipState === ClipState.A_INSIDE_B) {
                cliptest = false;
            }
        }
        const ld = node.getPatch().isDummy() ? -1 : node.getPatch().getLODDistance();
        const lodDistance = ld >= 0 ? ld * ld : Number.MAX_VALUE;
        const eyeDistSq = ld >= 0 ? node.getPatch().sqrDistanceToPoint(viewPoint) : 0;
        const lodLevel = this._terrain.detailLODLevel;
        if (eyeDistSq < lodDistance && node.getChild(0) && (lodLevel === 0 || node.getPatch().getMipLevel() < lodLevel)) {
            for (let i = 0; i < 4; i++) {
                const child = node.getChild(i);
                if (child) {
                    this.cull_r(camera, child, viewPoint, worldMatrix, frustum, cliptest);
                }
            }
        }
        else if (!node.getPatch().isDummy()) {
            this._terrain.addPatch(node.getPatch(), true);
        }
    }
}

export { Quadtree, QuadtreeNode };
//# sourceMappingURL=quadtree.js.map
