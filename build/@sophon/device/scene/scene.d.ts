import { REventTarget, REvent, Matrix4x4, Ray, AABB } from '@sophon/base';
import { Device, TextureCube } from '../device';
import { SceneNode } from './scene_node';
import { Camera } from './camera';
import { Octree } from './octree';
import { GraphNode } from './graph_node';
import type { PunctualLight } from './light';
import type { EnvironmentLighting } from './materiallib/envlight';
export declare class Scene extends REventTarget {
    constructor(device: Device);
    get id(): number;
    get device(): Device;
    get rootNode(): SceneNode;
    get octree(): Octree;
    get cameraList(): Camera[];
    get lightList(): PunctualLight[];
    get boundingBox(): AABB;
    get environment(): EnvironmentLighting;
    set environment(env: EnvironmentLighting);
    get envHash(): string;
    get envLightStrength(): number;
    set envLightStrength(val: number);
    dispose(): void;
    addSkybox(skyTexture: TextureCube): SceneNode;
    addCamera(matrix?: Matrix4x4): Camera;
    raycast(camera: Camera, screenX: number, screenY: number): GraphNode;
    constructRay(camera: Camera, viewportWidth: number, viewportHeight: number, screenX: number, screenY: number, invModelMatrix?: Matrix4x4): Ray;
    frameUpdate(camera: Camera): void;
}
export declare namespace Scene {
    class TickEvent extends REvent {
        static readonly NAME = "tick";
        camera: Camera;
        scene: Scene;
        constructor(scene: Scene);
    }
}
