import { AnimationClip } from './animation';
import { GraphNode } from './graph_node';
import type { Scene } from './scene';
import type { Camera } from './camera';
export declare class Model extends GraphNode {
    constructor(scene: Scene);
    addAnimation(name?: string): AnimationClip;
    removeAnimation(name: string): void;
    getAnimationNames(): string[];
    update(camera: Camera): void;
    isPlayingAnimation(name?: string): boolean;
    playAnimation(name: string, repeat?: number): void;
    stopAnimation(name: string): void;
}
