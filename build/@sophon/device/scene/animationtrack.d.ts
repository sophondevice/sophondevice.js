import type { Device } from "../device";
import type { Interpolator } from "./interpolator";
export declare class AnimationTrack {
    protected _interpolator: Interpolator;
    protected _currentPlayTime: number;
    protected _playing: boolean;
    constructor(interpolator: Interpolator);
    get interpolator(): Interpolator;
    get playing(): boolean;
    start(): void;
    stop(): void;
    rewind(): void;
    reset(): void;
    update(device: Device, result: Float32Array, playTime: number, duration: number): void;
}
