import { Quaternion } from "@sophon/base";
import type { TypedArray } from "../misc";
export declare enum InterpolationMode {
    UNKNOWN = 0,
    STEP = 1,
    LINEAR = 2,
    CUBICSPLINE = 3
}
export declare enum InterpolationTarget {
    UNKNOWN = 0,
    ROTATION = 1,
    TRANSLATION = 2,
    SCALING = 3,
    WEIGHTS = 4
}
export declare class Interpolator {
    private _prevKey;
    private _prevT;
    private _inputs;
    private _outputs;
    private _mode;
    private _target;
    private _stride;
    private _maxTime;
    constructor(mode: InterpolationMode, target: InterpolationTarget, inputs: TypedArray, outputs: TypedArray, stride?: number);
    get mode(): InterpolationMode;
    get target(): InterpolationTarget;
    get maxTime(): number;
    slerpQuat(q1: Quaternion, q2: Quaternion, t: number, result?: Float32Array): Float32Array;
    step(prevKey: number, result?: Float32Array): Float32Array;
    linear(prevKey: number, nextKey: number, t: number, result?: Float32Array): Float32Array;
    cubicSpline(prevKey: number, nextKey: number, keyDelta: number, t: number, result?: Float32Array): Float32Array;
    interpolate(t: number, maxTime: number, result?: Float32Array): Float32Array;
    getQuat(index: number, result?: Float32Array): Float32Array;
}
