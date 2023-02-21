import { REventPath, REventPathBuilder, REventTarget, REvent, Vector3, Quaternion } from '@sophon/base';
import { XForm } from './xform';
import type { Visitor } from '../misc';
import type { Scene } from './scene';
import type { GraphNode } from './graph_node';
import type { Mesh } from './mesh';
import type { Camera } from './camera';
import type { Terrain } from './terrain';
import type { PunctualLight, BaseLight } from './light';
export declare class SceneNodeEventPathBuilder implements REventPathBuilder {
    build(node: REventTarget): REventPath;
}
export declare class SceneNodeAttachEvent extends REvent {
    static readonly ATTACHED_NAME = "attached";
    static readonly DETACHED_NAME = "detached";
    node: SceneNode;
    constructor(name: string, node: SceneNode);
}
export declare class SceneNode extends XForm<SceneNode> {
    constructor(scene: Scene, parent?: SceneNode);
    get name(): string;
    set name(val: string);
    get attached(): boolean;
    setPosition(value: Vector3): this;
    setScale(value: Vector3): this;
    setRotation(value: Quaternion): this;
    hasChild(child: SceneNode): boolean;
    removeChildren(): void;
    iterateChildren(func: (child: SceneNode) => void): void;
    isParentOf(child: SceneNode): boolean;
    remove(): this;
    reparent(p?: SceneNode): this;
    accept(v: Visitor): void;
    traverse(v: Visitor, inverse?: boolean): void;
    isGraphNode(): this is GraphNode;
    isLight(): this is BaseLight;
    isMesh(): this is Mesh;
    isTerrain(): this is Terrain;
    isCamera(): this is Camera;
    isPunctualLight(): this is PunctualLight;
    dispose(): void;
    invalidateWorldBoundingVolume(): void;
}
