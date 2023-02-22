/** sophon base library */
import { Vector3 } from '@sophon/base';
import { BoundingBox } from '../bounding_volume.js';
import { Primitive } from '../primitive.js';
import { PatchPosition } from './types.js';
import { PrimitiveType } from '../../device/base_types.js';
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

let patchId = 0;
class TerrainPatch {
    _geometry;
    _geometryLines;
    _quadtree;
    _mipLevel;
    _offsetX;
    _offsetZ;
    _step;
    _boundingBox;
    _lodDistance;
    _maxError;
    _parent;
    _offsetScale;
    _id;
    constructor() {
        this._geometry = null;
        this._geometryLines = null;
        this._mipLevel = 0;
        this._offsetX = 0;
        this._offsetZ = 0;
        this._boundingBox = null;
        this._parent = null;
        this._offsetScale = null;
        this._quadtree = null;
        this._step = 0;
        this._lodDistance = 0;
        this._id = patchId++;
    }
    initialize(scene, quadtree, parent, position, baseVertices, normals, elevations) {
        const device = scene.device;
        const patchSize = quadtree.getPatchSize();
        const rootSize = quadtree.getRootSize();
        this._mipLevel = parent ? parent.getMipLevel() + 1 : 0;
        const step = Math.floor((rootSize - 1) / (patchSize - 1)) >> this._mipLevel;
        const interval = (patchSize - 1) * step;
        const parentOffsetX = parent ? parent.getOffsetX() : 0;
        const parentOffsetZ = parent ? parent.getOffsetZ() : 0;
        switch (position) {
            case PatchPosition.LeftTop:
                this._offsetX = parentOffsetX;
                this._offsetZ = parentOffsetZ;
                break;
            case PatchPosition.RightTop:
                this._offsetX = parentOffsetX + interval;
                this._offsetZ = parentOffsetZ;
                break;
            case PatchPosition.LeftBottom:
                this._offsetX = parentOffsetX;
                this._offsetZ = parentOffsetZ + interval;
                break;
            case PatchPosition.RightBottom:
                this._offsetX = parentOffsetX + interval;
                this._offsetZ = parentOffsetZ + interval;
                break;
            default:
                return false;
        }
        if (this._offsetX + interval >= quadtree.getRootSizeX() || this._offsetZ + interval >= quadtree.getRootSizeZ()) {
            baseVertices = null;
        }
        this._quadtree = quadtree;
        this._step = step;
        this._parent = parent;
        this._geometry = baseVertices ? new Primitive(device) : null;
        this._geometryLines = baseVertices ? new Primitive(device) : null;
        this._maxError = baseVertices ? this.computeMaxError() : 0;
        if (baseVertices) {
            const scaleX = this._quadtree.getScaleX();
            const scaleZ = this._quadtree.getScaleZ();
            if (step === 1) {
                this._boundingBox = new BoundingBox();
                this._boundingBox.minPoint.x = this._offsetX * scaleX;
                this._boundingBox.minPoint.y = Number.MAX_VALUE;
                this._boundingBox.minPoint.z = this._offsetZ * scaleZ;
                this._boundingBox.maxPoint.x = this._offsetX * scaleX + (this._quadtree.getPatchSize() - 1) * this._step * scaleX;
                this._boundingBox.maxPoint.y = -Number.MAX_VALUE;
                this._boundingBox.maxPoint.z = this._offsetZ * scaleZ + (this._quadtree.getPatchSize() - 1) * this._step * scaleZ;
            }
            this.setupVertices(device, this.computeSkirtLength(), baseVertices, normals, elevations);
        }
        return true;
    }
    setupCamera(viewportH, tanHalfFovy, maxPixelError) {
        if (maxPixelError > 0 && tanHalfFovy > 0) {
            this._lodDistance = this.computeLodDistance(viewportH, tanHalfFovy, maxPixelError);
        }
        else {
            this._lodDistance = -1;
        }
    }
    setupVertices(device, skirtLength, baseVertices, normalVectors, elevations) {
        const that = this;
        function setNormalAndHeight(heights, normals, index, x, z, width, height, hDelta) {
            const k = x + z * width;
            const h = elevations[k];
            normals[index * 3 + 0] = normalVectors[k * 3 + 0];
            normals[index * 3 + 1] = normalVectors[k * 3 + 1];
            normals[index * 3 + 2] = normalVectors[k * 3 + 2];
            heights[index] = h + hDelta;
            if (that._boundingBox) {
                if (that._boundingBox.maxPoint.y < h) {
                    that._boundingBox.maxPoint.y = h;
                }
                if (that._boundingBox.minPoint.y > h) {
                    that._boundingBox.minPoint.y = h;
                }
            }
            return index + 1;
        }
        const patchSize = this._quadtree.getPatchSize();
        const numVerts = (patchSize + 2) * (patchSize + 2);
        const heights = new Float32Array(numVerts);
        const normals = new Float32Array(numVerts * 3);
        let x = this._offsetX;
        let z = this._offsetZ;
        let t = 0;
        const hf = this._quadtree.getHeightField();
        const w = hf.getSizeX();
        const h = hf.getSizeZ();
        t = setNormalAndHeight(heights, normals, t, x, z, w, h, -skirtLength);
        for (let i = 0; i < patchSize; i++, x += this._step) {
            t = setNormalAndHeight(heights, normals, t, x, z, w, h, -skirtLength);
        }
        t = setNormalAndHeight(heights, normals, t, x - this._step, z, w, h, -skirtLength);
        z = this._offsetZ;
        for (let i = 0; i < patchSize; i++, z += this._step) {
            x = this._offsetX;
            t = setNormalAndHeight(heights, normals, t, x, z, w, h, -skirtLength);
            for (let j = 0; j < patchSize; j++, x += this._step) {
                t = setNormalAndHeight(heights, normals, t, x, z, w, h, 0);
            }
            t = setNormalAndHeight(heights, normals, t, x - this._step, z, w, h, -skirtLength);
        }
        x = this._offsetX;
        z -= this._step;
        t = setNormalAndHeight(heights, normals, t, x, z, w, h, -skirtLength);
        for (let i = 0; i < patchSize; i++, x += this._step) {
            t = setNormalAndHeight(heights, normals, t, x, z, w, h, -skirtLength);
        }
        t = setNormalAndHeight(heights, normals, t, x - this._step, z, w, h, -skirtLength);
        const heightArray = device.createStructuredBuffer(makeVertexBufferType(numVerts, 'custom0_f32'), { usage: 'vertex', managed: true }, heights);
        const normalArray = device.createStructuredBuffer(makeVertexBufferType(numVerts, 'normal_f32x3'), { usage: 'vertex', managed: true }, normals);
        this._geometry.setVertexBuffer(baseVertices);
        this._geometry.setVertexBuffer(normalArray);
        this._geometry.setVertexBuffer(heightArray);
        this._geometry.setIndexBuffer(this._quadtree.getIndices());
        this._geometry.indexStart = 0;
        this._geometry.indexCount = this._quadtree.getIndices().length;
        this._geometry.primitiveType = PrimitiveType.TriangleStrip;
        this._geometryLines.setVertexBuffer(baseVertices);
        this._geometryLines.setVertexBuffer(normalArray);
        this._geometryLines.setVertexBuffer(heightArray);
        this._geometryLines.setIndexBuffer(this._quadtree.getIndicesWireframe());
        this._geometryLines.indexStart = 0;
        this._geometryLines.indexCount = this._quadtree.getIndicesWireframe().length;
        this._geometryLines.primitiveType = PrimitiveType.LineList;
    }
    getOffsetScale(terrain, ctx) {
        if (!this._offsetScale) {
            const terrainProgram = terrain.material.getOrCreateProgram(ctx);
            const scaleX = this._quadtree.getScaleX();
            const scaleZ = this._quadtree.getScaleZ();
            const v = new Float32Array([this._step * scaleX, this._offsetX * scaleX, this._step * scaleZ, this._offsetZ * scaleZ]);
            this._offsetScale = ctx.renderPass.device.createStructuredBuffer(terrainProgram.programs[ctx.materialFunc].getBindingInfo('scaleOffset').type, { usage: 'uniform' }, v);
            this._offsetScale.restoreHandler = async (obj) => {
                obj.bufferSubData(0, v);
            };
        }
        return this._offsetScale;
    }
    getBoundingBox() {
        return this._boundingBox;
    }
    setBoundingBox(bbox) {
        this._boundingBox = bbox;
    }
    getMipLevel() {
        return this._mipLevel;
    }
    getOffsetX() {
        return this._offsetX;
    }
    getOffsetZ() {
        return this._offsetZ;
    }
    getStep() {
        return this._step;
    }
    getLODDistance() {
        return this._lodDistance;
    }
    getGeometry() {
        return this._geometry;
    }
    getGeometryWireframe() {
        return this._geometryLines;
    }
    getHeight(x, z) {
        const startX = this._offsetX + this._step * Math.floor((x - this._offsetX) / this._step);
        const startZ = this._offsetZ + this._step * Math.floor((z - this._offsetZ) / this._step);
        const endX = startX == x ? startX : startX + this._step;
        const endZ = startZ == z ? startZ : startZ + this._step;
        const hf = this._quadtree.getHeightField();
        const lt_height = hf.getHeight(startX, startZ);
        const rt_height = hf.getHeight(endX, startZ);
        const lb_height = hf.getHeight(startX, endZ);
        const rb_height = hf.getHeight(endX, endZ);
        const t1 = (x - startX) / this._step;
        const t2 = (z - startZ) / this._step;
        const h1 = lt_height + (rt_height - lt_height) * t1;
        const h2 = lb_height + (rb_height - lb_height) * t1;
        return h1 + (h2 - h1) * t2;
    }
    computeMaxError() {
        if (this._step === 1) {
            return 0;
        }
        let maxError = 0;
        const dimension = this._step * (this._quadtree.getPatchSize() - 1);
        const rootSize = this._quadtree.getRootSize();
        const hf = this._quadtree.getHeightField();
        for (let i = this._offsetZ; i <= this._offsetZ + dimension; i++) {
            for (let j = this._offsetX; j <= this._offsetX + dimension; j++) {
                const i00 = this._offsetZ + Math.floor((i - this._offsetZ) / this._step) * this._step;
                const j00 = this._offsetX + Math.floor((j - this._offsetX) / this._step) * this._step;
                if (i00 === rootSize - 1 || j00 === rootSize - 1) {
                    continue;
                }
                const i11 = i00 + this._step;
                const j11 = j00 + this._step;
                const h00 = hf.getHeight(j00, i00);
                const h01 = hf.getHeight(j11, i00);
                const h10 = hf.getHeight(j00, i11);
                const h11 = hf.getHeight(j11, i11);
                const factorZ = (i - i00) / this._step;
                const factorX = (j - j00) / this._step;
                const h = hf.getHeight(j, i);
                const h0 = h00 + factorX * (h01 - h00);
                const h1 = h10 + factorX * (h11 - h10);
                const h2 = h0 + factorZ * (h1 - h0);
                const err = Math.abs(h - h2);
                if (err > maxError) {
                    maxError = err;
                }
            }
        }
        return maxError;
    }
    computeSkirtLength() {
        let skirtLength = 0;
        let p = this._parent;
        while (p) {
            const f = this.computeErrorMetric(p);
            if (f > skirtLength) {
                skirtLength = f;
            }
            p = p._parent;
        }
        return skirtLength;
    }
    computeErrorMetric(other) {
        let errMetric = 0;
        if (other.getMipLevel() > this._mipLevel) {
            const otherOffsetX = other.getOffsetX();
            const otherOffsetZ = other.getOffsetZ();
            const otherStep = other.getStep();
            const otherDimension = other.getStep() * this._quadtree.getPatchSize();
            for (let i = otherOffsetZ; i < otherOffsetZ + otherDimension; i += otherStep) {
                for (let j = otherOffsetX; j < otherOffsetX + otherDimension; j += otherStep) {
                    const err = Math.abs(this.getHeight(j, i) - other.getHeight(j, i));
                    if (err > errMetric) {
                        errMetric = err;
                    }
                }
            }
        }
        else if (other.getMipLevel() < this._mipLevel) {
            const dimension = this._step * (this._quadtree.getPatchSize() - 1);
            for (let i = this._offsetZ; i <= this._offsetZ + dimension; i += this._step) {
                for (let j = this._offsetX; j <= this._offsetX + dimension; j += this._step) {
                    const err = Math.abs(this.getHeight(j, i) - other.getHeight(j, i));
                    if (err > errMetric) {
                        errMetric = err;
                    }
                }
            }
        }
        return errMetric;
    }
    computeBoundingBox(box) {
        const [maxHeight, minHeight] = this.computeHeightBound();
        const scaleX = this._quadtree.getScaleX();
        const scaleZ = this._quadtree.getScaleZ();
        box.minPoint = new Vector3(this._offsetX * scaleX, minHeight, this._offsetZ * scaleZ);
        box.maxPoint = new Vector3(this._offsetX * scaleX + (this._quadtree.getPatchSize() - 1) * this._step * scaleX, maxHeight, this._offsetZ * scaleZ + (this._quadtree.getPatchSize() - 1) * this._step * scaleZ);
    }
    computeLodDistance(viewportH, tanHalfFovy, maxPixelError) {
        return 0.5 * this._maxError * viewportH / (maxPixelError * tanHalfFovy);
    }
    sqrDistanceToPoint(point) {
        const bbox = this.getBoundingBox();
        const radius = Math.sqrt(bbox.extents.x * bbox.extents.x + bbox.extents.z * bbox.extents.z);
        const dx = point.x - bbox.center.x;
        const dz = point.z - bbox.center.z;
        const s = Math.max(0, Math.sqrt(dx * dx + dz * dz) - radius);
        const t = point.y > bbox.maxPoint.y ? point.y - bbox.maxPoint.y : point.y < bbox.minPoint.y ? bbox.minPoint.y - point.y : 0;
        return s * s + t * t;
    }
    sqrDistancePointToTriangle(P, t0, t1, t2) {
        const B = t0;
        const E0 = Vector3.sub(t1, B);
        const E1 = Vector3.sub(t2, B);
        const D = Vector3.sub(B, P);
        const a = Vector3.dot(E0, E0);
        const b = Vector3.dot(E0, E1);
        const c = Vector3.dot(E1, E1);
        const d = Vector3.dot(E0, D);
        const e = Vector3.dot(E1, D);
        const f = Vector3.dot(D, D);
        const det = a * c - b * b;
        let s = b * e - c * d;
        let t = b * d - a * e;
        let sqrDistance;
        if (s + t <= det) {
            if (s < 0) {
                if (t < 0) {
                    if (d < 0) {
                        t = 0;
                        if (-d >= a) {
                            s = 1;
                            sqrDistance = a + 2 * d + f;
                        }
                        else {
                            s = -d / a;
                            sqrDistance = d * s + f;
                        }
                    }
                    else {
                        s = 0;
                        if (e >= 0) {
                            t = 0;
                            sqrDistance = f;
                        }
                        else {
                            if (-e >= c) {
                                t = 1;
                                sqrDistance = c + 2 * e + f;
                            }
                            else {
                                t = -e / c;
                                sqrDistance = e * t + f;
                            }
                        }
                    }
                }
                else {
                    s = 0;
                    if (e >= 0) {
                        t = 0;
                        sqrDistance = f;
                    }
                    else {
                        if (-e >= c) {
                            t = 1;
                            sqrDistance = c + 2 * e + f;
                        }
                        else {
                            t = -e / c;
                            sqrDistance = e * t + f;
                        }
                    }
                }
            }
            else {
                if (t < 0) {
                    t = 0;
                    if (d >= 0) {
                        s = 0;
                        sqrDistance = f;
                    }
                    else {
                        if (-d >= a) {
                            s = 1;
                            sqrDistance = a + 2 * d + f;
                        }
                        else {
                            s = -d / a;
                            sqrDistance = d * s + f;
                        }
                    }
                }
                else {
                    s /= det;
                    t /= det;
                    sqrDistance = s * (a * s + b * t + 2 * d) + t * (b * s + c * t + 2 * e) + f;
                }
            }
        }
        else {
            if (s < 0) {
                const tmp0 = b + d;
                const tmp1 = c + e;
                if (tmp1 > tmp0) {
                    const numer = tmp1 - tmp0;
                    const denom = a - 2 * b + c;
                    if (numer >= denom) {
                        s = 1;
                        t = 0;
                        sqrDistance = a + 2 * d + f;
                    }
                    else {
                        s = numer / denom;
                        t = 1 - s;
                        sqrDistance = s * (a * s + b * t + 2 * d) + t * (b * s + c * t + 2 * e) + f;
                    }
                }
                else {
                    s = 0;
                    if (tmp1 <= 0) {
                        t = 1;
                        sqrDistance = c + 2 * e + f;
                    }
                    else {
                        if (e >= 0) {
                            t = 0;
                            sqrDistance = f;
                        }
                        else {
                            t = -e / c;
                            sqrDistance = e * t + f;
                        }
                    }
                }
            }
            else {
                if (t < 0) {
                    const tmp0 = b + e;
                    const tmp1 = a + d;
                    if (tmp1 > tmp0) {
                        const numer = tmp1 - tmp0;
                        const denom = a - 2 * b + c;
                        if (numer >= denom) {
                            t = 1;
                            s = 0;
                            sqrDistance = c + 2 * e + f;
                        }
                        else {
                            t = numer / denom;
                            s = 1 - t;
                            sqrDistance = s * (a * s + b * t + 2 * d) + t * (b * s + c * t + 2 * e) + f;
                        }
                    }
                    else {
                        t = 0;
                        if (tmp1 <= 0) {
                            s = 1;
                            sqrDistance = a + 2 * d + f;
                        }
                        else {
                            if (d >= 0) {
                                s = 0;
                                sqrDistance = f;
                            }
                            else {
                                s = -d / a;
                                sqrDistance = d * s + f;
                            }
                        }
                    }
                }
                else {
                    const numer = c + e - b - d;
                    if (numer <= 0) {
                        s = 0;
                        t = 1;
                        sqrDistance = c + 2 * e + f;
                    }
                    else {
                        const denom = a - 2 * b + c;
                        if (numer >= denom) {
                            s = 1;
                            t = 0;
                            sqrDistance = a + 2 * d + f;
                        }
                        else {
                            s = numer / denom;
                            t = 1 - s;
                            sqrDistance = s * (a * s + b * t + 2 * d) + t * (b * s + c * t + 2 * e) + f;
                        }
                    }
                }
            }
        }
        if (sqrDistance < 0) {
            sqrDistance = 0;
        }
        return sqrDistance;
    }
    computeHeightBound() {
        let maxHeight = -Number.MAX_VALUE;
        let minHeight = Number.MAX_VALUE;
        const dimension = this._step * (this._quadtree.getPatchSize() - 1);
        const hf = this._quadtree.getHeightField();
        const z = Math.min(hf.getSizeZ() - 1, this._offsetZ + dimension);
        const x = Math.min(hf.getSizeX() - 1, this._offsetX + dimension);
        for (let i = this._offsetZ; i <= z; i++) {
            for (let j = this._offsetX; j <= x; j++) {
                const h = hf.getHeight(j, i);
                if (h > maxHeight) {
                    maxHeight = h;
                }
                if (h < minHeight) {
                    minHeight = h;
                }
            }
        }
        return [maxHeight, minHeight];
    }
    isDummy() {
        return !this._geometry && !!this._quadtree;
    }
}

export { TerrainPatch };
//# sourceMappingURL=patch.js.map
