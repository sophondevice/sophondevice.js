import { Vector4 } from "@sophon/base";
import { BoundingBox } from "../bounding_volume";
export interface HeightfieldBBoxTreeNode {
    bbox: BoundingBox;
    rc: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    left: HeightfieldBBoxTreeNode;
    right: HeightfieldBBoxTreeNode;
}
export declare class HeightfieldBBoxTree {
    private _resX;
    private _resY;
    private _heights;
    private _rootNode;
    private _patchSize;
    constructor(res_x: number, res_y: number, vertices: Vector4[], patchSize: number);
    create(res_x: number, res_y: number, vertices: Vector4[]): boolean;
    getHeight(x: number, y: number): number;
    getRealHeight(x: number, y: number): number;
    getRootNode(): HeightfieldBBoxTreeNode;
    getHeights(): Float32Array;
    allocNode(): HeightfieldBBoxTreeNode;
    computeNodeBoundingBox(node: HeightfieldBBoxTreeNode, bbox: BoundingBox, vertices: Vector4[]): void;
    createChildNode(node: HeightfieldBBoxTreeNode, x: number, y: number, w: number, h: number, vertices: Vector4[]): boolean;
}
export declare class HeightField {
    private m_v4Range;
    private m_scale;
    private m_sizeX;
    private m_sizeZ;
    private m_bboxTree;
    constructor();
    init(sizeX: number, sizeZ: number, offsetX: number, offsetZ: number, spacingX: number, spacingZ: number, vScale: number, heights: Float32Array, patchSize: number): boolean;
    initWithVertices(sizeX: number, sizeZ: number, vertices: Vector4[], patchSize: number): boolean;
    clear(): void;
    computeNormals(): Uint8Array;
    computeNormalVectors(): Float32Array;
    getBBoxTree(): HeightfieldBBoxTree;
    getSpacingX(): number;
    getSpacingZ(): number;
    getVerticalScale(): number;
    getSizeX(): number;
    getSizeZ(): number;
    getOffsetX(): number;
    getOffsetZ(): number;
    getBoundingbox(): BoundingBox;
    getHeights(): Float32Array;
    getHeight(x: number, z: number): number;
    getRealHeight(x: number, z: number): number;
}
