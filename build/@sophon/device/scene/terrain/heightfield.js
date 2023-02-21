/** sophon base library */
import { Vector4, Vector3 } from '@sophon/base';
import { BoundingBox } from '../bounding_volume.js';

class HeightfieldBBoxTree {
    _resX;
    _resY;
    _heights;
    _rootNode;
    _patchSize;
    constructor(res_x, res_y, vertices, patchSize) {
        this._rootNode = null;
        this._heights = null;
        this._patchSize = patchSize;
        this.create(res_x, res_y, vertices);
    }
    create(res_x, res_y, vertices) {
        this._resX = res_x;
        this._resY = res_y;
        this._rootNode = this.allocNode();
        this._heights = new Float32Array(res_x * res_y);
        for (let i = 0; i < this._heights.length; i++) {
            this._heights[i] = vertices[i].y;
        }
        this.createChildNode(this._rootNode, 0, 0, res_x, res_y, vertices);
        return true;
    }
    getHeight(x, y) {
        return this._heights[(this._resY - 1 - y) * this._resX + x];
    }
    getRealHeight(x, y) {
        x -= this._rootNode.bbox.minPoint.x;
        y -= this._rootNode.bbox.minPoint.z;
        const tileSizeX = (this._rootNode.bbox.maxPoint.x - this._rootNode.bbox.minPoint.x) / (this._resX - 1);
        const tileSizeY = (this._rootNode.bbox.maxPoint.z - this._rootNode.bbox.minPoint.z) / (this._resY - 1);
        const x_unscale = x / tileSizeX;
        const y_unscale = y / tileSizeY;
        let l = Math.floor(x_unscale);
        let t = Math.floor(y_unscale);
        let r = l + 1;
        let b = t + 1;
        if (l < 0) {
            l = 0;
        }
        if (t < 0) {
            t = 0;
        }
        if (r >= this._resX) {
            r = this._resX - 1;
        }
        if (b >= this._resY) {
            b = this._resY - 1;
        }
        if (l === r) {
            if (t === b) {
                return this.getHeight(l, t);
            }
            else {
                const ht = this.getHeight(l, t);
                const hb = this.getHeight(l, b);
                return ht + (hb - ht) * (y_unscale - t);
            }
        }
        else {
            const hlt = this.getHeight(l, t);
            const hrt = this.getHeight(r, t);
            const ht = hlt + (hrt - hlt) * (x_unscale - l);
            if (t === b) {
                return ht;
            }
            else {
                const hlb = this.getHeight(l, b);
                const hrb = this.getHeight(r, b);
                const hb = hlb + (hrb - hlb) * (x_unscale - l);
                return ht + (hb - ht) * (y_unscale - t);
            }
        }
    }
    getRootNode() {
        return this._rootNode;
    }
    getHeights() {
        return this._heights;
    }
    allocNode() {
        return {
            bbox: new BoundingBox(),
            rc: { x: 0, y: 0, w: 0, h: 0 },
            left: null,
            right: null,
        };
    }
    computeNodeBoundingBox(node, bbox, vertices) {
        bbox.beginExtend();
        for (let i = 0; i < node.rc.w; i++) {
            for (let j = 0; j < node.rc.h; j++) {
                const index = node.rc.x + i + (node.rc.y + j) * this._resX;
                bbox.extend(vertices[index]);
            }
        }
    }
    createChildNode(node, x, y, w, h, vertices) {
        node.rc.x = x;
        node.rc.y = y;
        node.rc.w = w;
        node.rc.h = h;
        if (w <= this._patchSize && h <= this._patchSize) {
            node.left = null;
            node.right = null;
            this.computeNodeBoundingBox(node, node.bbox, vertices);
        }
        else {
            if (w >= h) {
                const w1 = (w + 1) >> 1;
                const w2 = w - w1 + 1;
                node.left = this.allocNode();
                this.createChildNode(node.left, x, y, w1, h, vertices);
                node.right = this.allocNode();
                this.createChildNode(node.right, x + w1 - 1, y, w2, h, vertices);
            }
            else {
                const h1 = (h + 1) >> 1;
                const h2 = h - h1 + 1;
                node.left = this.allocNode();
                this.createChildNode(node.left, x, y, w, h1, vertices);
                node.right = this.allocNode();
                this.createChildNode(node.right, x, y + h1 - 1, w, h2, vertices);
            }
            node.bbox.beginExtend();
            node.bbox.extend(node.left.bbox.minPoint);
            node.bbox.extend(node.left.bbox.maxPoint);
            node.bbox.extend(node.right.bbox.minPoint);
            node.bbox.extend(node.right.bbox.maxPoint);
        }
        return true;
    }
}
class HeightField {
    m_v4Range;
    m_scale;
    m_sizeX;
    m_sizeZ;
    m_bboxTree;
    constructor() {
        this.m_v4Range = Vector4.zero();
        this.m_bboxTree = null;
        this.m_scale = Vector3.one();
        this.m_sizeX = 0;
        this.m_sizeZ = 0;
    }
    init(sizeX, sizeZ, offsetX, offsetZ, spacingX, spacingZ, vScale, heights, patchSize) {
        const v = [];
        for (let i = 0; i < sizeZ; ++i) {
            const srcOffset = i * sizeX;
            const dstOffset = (sizeZ - i - 1) * sizeX;
            for (let j = 0; j < sizeX; ++j) {
                v[dstOffset + j] = new Vector4(offsetX + j * spacingX, heights[srcOffset + j] * vScale, offsetZ + i * spacingZ, 1);
            }
        }
        this.m_bboxTree = new HeightfieldBBoxTree(sizeX, sizeZ, v, patchSize);
        this.m_v4Range.set(this.m_bboxTree.getRootNode().bbox.minPoint.x, this.m_bboxTree.getRootNode().bbox.minPoint.z, this.m_bboxTree.getRootNode().bbox.extents.x * 2, this.m_bboxTree.getRootNode().bbox.extents.z * 2);
        this.m_scale.set(spacingX, vScale, spacingZ);
        this.m_sizeX = sizeX;
        this.m_sizeZ = sizeZ;
        return true;
    }
    initWithVertices(sizeX, sizeZ, vertices, patchSize) {
        this.m_bboxTree = new HeightfieldBBoxTree(sizeX, sizeZ, vertices, patchSize);
        this.m_scale.set(1, 1, 1);
        this.m_sizeX = sizeX;
        this.m_sizeZ = sizeZ;
        this.m_v4Range.set(this.m_bboxTree.getRootNode().bbox.minPoint.x, this.m_bboxTree.getRootNode().bbox.minPoint.z, this.m_bboxTree.getRootNode().bbox.extents.x * 2, this.m_bboxTree.getRootNode().bbox.extents.z * 2);
        return true;
    }
    clear() {
        this.m_bboxTree = null;
        this.m_v4Range.set(0, 0, 0, 0);
        this.m_scale.set(1, 1, 1);
        this.m_sizeX = 0;
        this.m_sizeZ = 0;
    }
    computeNormals() {
        const scaleX = this.m_scale.x;
        const scaleZ = this.m_scale.z;
        const heights = this.getHeights();
        const v = new Vector3();
        const normals = new Uint8Array((this.m_sizeZ - 1) * (this.m_sizeX - 1) * 4);
        for (let y = 0; y < this.m_sizeZ - 1; ++y) {
            for (let x = 0; x < this.m_sizeX - 1; ++x) {
                const h00 = heights[x + y * this.m_sizeX];
                const h01 = heights[x + (y + 1) * this.m_sizeX];
                const h11 = heights[x + 1 + (y + 1) * this.m_sizeX];
                const h10 = heights[x + 1 + y * this.m_sizeX];
                const sx = (h00 + h01 - h11 - h10) * 0.5;
                const sy = (h00 + h10 - h01 - h11) * 0.5;
                const index = (x + (this.m_sizeZ - 2 - y) * (this.m_sizeX - 1));
                v.set(sx * scaleZ, 2 * scaleX * scaleZ, -sy * scaleX).inplaceNormalize();
                normals[index * 4 + 0] = Math.floor((v.x * 0.5 + 0.5) * 255);
                normals[index * 4 + 1] = Math.floor((v.y * 0.5 + 0.5) * 255);
                normals[index * 4 + 2] = Math.floor((v.z * 0.5 + 0.5) * 255);
                normals[index * 4 + 3] = 255;
            }
        }
        return normals;
    }
    computeNormalVectors() {
        const scaleX = this.m_scale.x;
        const scaleZ = this.m_scale.z;
        const heights = this.getHeights();
        const v = new Vector3();
        const normals = new Float32Array(this.m_sizeZ * this.m_sizeX * 3);
        for (let y = 0; y < this.m_sizeZ; ++y) {
            for (let x = 0; x < this.m_sizeX; ++x) {
                const h = heights[x + y * this.m_sizeX];
                const h00 = x > 0 && y > 0 ? heights[x - 1 + (y - 1) * this.m_sizeX] : h;
                const h01 = y > 0 && y < this.m_sizeZ - 1 ? heights[(x - 1) + (y + 1) * this.m_sizeX] : h;
                const h11 = x < this.m_sizeX - 1 && y < this.m_sizeZ - 1 ? heights[x + 1 + (y + 1) * this.m_sizeX] : h;
                const h10 = x < this.m_sizeX - 1 && y > 0 ? heights[x + 1 + (y - 1) * this.m_sizeX] : h;
                const sx = (h00 + h01 - h11 - h10) * 0.5;
                const sy = (h00 + h10 - h01 - h11) * 0.5;
                const index = x + (this.m_sizeZ - 1 - y) * this.m_sizeX;
                v.set(sx * scaleZ, 2 * scaleX * scaleZ, -sy * scaleX).inplaceNormalize();
                normals[index * 3 + 0] = v.x;
                normals[index * 3 + 1] = v.y;
                normals[index * 3 + 2] = v.z;
            }
        }
        return normals;
    }
    getBBoxTree() {
        return this.m_bboxTree;
    }
    getSpacingX() {
        return this.m_scale.x;
    }
    getSpacingZ() {
        return this.m_scale.z;
    }
    getVerticalScale() {
        return this.m_scale.y;
    }
    getSizeX() {
        return this.m_sizeX;
    }
    getSizeZ() {
        return this.m_sizeZ;
    }
    getOffsetX() {
        return this.m_v4Range.x;
    }
    getOffsetZ() {
        return this.m_v4Range.y;
    }
    getBoundingbox() {
        return this.m_bboxTree?.getRootNode()?.bbox || null;
    }
    getHeights() {
        return this.m_bboxTree?.getHeights() || null;
    }
    getHeight(x, z) {
        return this.m_bboxTree ? this.m_bboxTree.getHeight(x, z) : 0;
    }
    getRealHeight(x, z) {
        return this.m_bboxTree ? this.m_bboxTree.getRealHeight(x, z) : 0;
    }
}

export { HeightField, HeightfieldBBoxTree };
//# sourceMappingURL=heightfield.js.map
