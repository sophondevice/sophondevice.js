import { Quaternion, Vector3 } from "@sophon/base";
import { AnimationTrack } from "./animationtrack";
import { Interpolator } from "./interpolator";
import { BoundingBox } from "./bounding_volume";
import type { SceneNode } from "./scene_node";
import type { Skeleton } from "./skeleton";
import type { Mesh } from "./mesh";
import type { Model } from "./model";
export interface SkinnedBoundingBox {
    boundingVertices: Vector3[];
    boundingVertexBlendIndices: Float32Array;
    boundingVertexJointWeights: Float32Array;
    boundingBox: BoundingBox;
}
export declare class AnimationClip {
    protected _name: string;
    protected _model: Model;
    protected _repeat: number;
    protected _repeatCounter: number;
    protected _duration: number;
    protected _isPlaying: boolean;
    protected _lastUpdateFrame: number;
    protected _currentPlayTime: number;
    protected _tracks: Map<SceneNode, {
        poseTranslation: Vector3;
        poseRotation: Quaternion;
        poseScaling: Vector3;
        translationTrack?: AnimationTrack;
        rotationTrack?: AnimationTrack;
        scalingTrack?: AnimationTrack;
        weightsTrack?: AnimationTrack;
    }>;
    protected _skeletons: Map<Skeleton, {
        mesh: Mesh;
        bounding: SkinnedBoundingBox;
        box: BoundingBox;
    }[]>;
    constructor(name: string, model: Model);
    get name(): string;
    get tracks(): Map<SceneNode, {
        poseTranslation: Vector3;
        poseRotation: Quaternion;
        poseScaling: Vector3;
        translationTrack?: AnimationTrack;
        rotationTrack?: AnimationTrack;
        scalingTrack?: AnimationTrack;
        weightsTrack?: AnimationTrack;
    }>;
    get repeat(): number;
    set repeat(n: number);
    get timeDuration(): number;
    addSkeleton(skeleton: Skeleton, meshList: Mesh[], boundingBoxInfo: SkinnedBoundingBox[]): void;
    addAnimationTrack(node: SceneNode, interpolator: Interpolator): AnimationTrack;
    isPlaying(): boolean;
    update(): void;
    play(): void;
    stop(): void;
    rewind(): void;
}
