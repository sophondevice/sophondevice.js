import { Matrix4x4 } from "@sophon/base";
import { Texture2D } from "../device/gpuobject";
import { SkinnedBoundingBox } from "./animation";
import type { SceneNode } from "./scene_node";
import type { Device } from '../device/device';
export declare class Skeleton {
    protected _joints: SceneNode[];
    protected _inverseBindMatrices: Matrix4x4[];
    protected _bindPoseMatrices: Matrix4x4[];
    protected _jointMatrices: Matrix4x4[];
    protected _jointMatrixArray: Float32Array;
    protected _jointTexture: Texture2D;
    constructor(joints: SceneNode[], inverseBindMatrices: Matrix4x4[], bindPoseMatrices: Matrix4x4[]);
    get jointMatrices(): Matrix4x4[];
    get jointTexture(): Texture2D;
    updateJointMatrices(device: Device, jointTransforms?: Matrix4x4[]): void;
    computeBindPose(device: Device): void;
    computeJoints(device: Device): void;
    computeBoundingBox(info: SkinnedBoundingBox, invWorldMatrix: Matrix4x4): void;
}
