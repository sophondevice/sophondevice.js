import { Vector3, AABB } from '@sophon/base';
import { GraphNode } from './graph_node';
import type { SceneNode } from './scene_node';
import type { Scene } from './scene';
import type { Visitor } from '../misc';
export declare enum OctreePlacement {
    PPP = 0,
    PPN = 1,
    PNP = 2,
    PNN = 3,
    NPP = 4,
    NPN = 5,
    NNP = 6,
    NNN = 7
}
export declare class OctreeNode {
    constructor();
    getNodes(): GraphNode[];
    getLevel(): number;
    addNode(node: GraphNode): void;
    removeNode(node: GraphNode): void;
    clearNodes(): void;
    setChunk(chunk: OctreeNodeChunk): void;
    getChunk(): OctreeNodeChunk;
    setPosition(index: number): void;
    getPosition(): number;
    invalidateBox(): void;
    getBox(): AABB;
    getBoxLoosed(): AABB;
    getMinPoint(): Vector3;
    getMaxPoint(): Vector3;
    getMinPointLoosed(): Vector3;
    getMaxPointLoosed(): Vector3;
    getReference(): number;
    getChild(placement: OctreePlacement): OctreeNode;
    getOrCreateChild(placement: OctreePlacement): OctreeNode;
    getParent(): OctreeNode;
    getOrCreateParent(): OctreeNode;
    createChildren(): void;
    tidy(): boolean;
    accept(v: Visitor): void;
    traverse(v: Visitor): void;
}
export declare class OctreeNodeChunk {
    constructor(octree: Octree);
    getNode(index: number): OctreeNode;
    getOrCreateNode(index: number): OctreeNode;
    getOrCreateNodeChain(index: number): OctreeNode;
    freeNodeByIndex(index: number): void;
    freeNode(node: OctreeNode): void;
    clearNodes(): void;
    getChildIndex(index: number, placement: OctreePlacement): number;
    getParentIndex(index: number): number;
    getNodeSize(): number;
    getNodeSizeLoosed(): number;
    getWorldSize(): number;
    getDimension(): number;
    getLevel(): number;
    empty(): boolean;
    getNext(): OctreeNodeChunk;
    getPrev(): OctreeNodeChunk;
    getOctree(): Octree;
    setLevel(level: number): void;
    setDimension(dimension: number): void;
    setNodeSize(size: number): void;
    setNodeSizeLoosed(size: number): void;
    setNext(chunk: OctreeNodeChunk): void;
    setPrev(chunk: OctreeNodeChunk): void;
}
export declare class Octree {
    constructor(scene: Scene, rootSize?: number, leafSize?: number);
    initialize(rootSize: number, leafSize: number): void;
    finalize(): void;
    getScene(): Scene;
    getRootSize(): number;
    getLeafSize(): number;
    locateNodeChain(candidate: OctreeNode, center: Vector3, radius: number): OctreeNode;
    getRootNode(): OctreeNode;
    getNumChunks(): number;
    getChunk(level: number): OctreeNodeChunk;
    placeNode(node: SceneNode): void;
    removeNode(node: SceneNode): void;
}
