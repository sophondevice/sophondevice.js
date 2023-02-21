import type { ITimer } from '../timer';
import type { WebGLDevice } from './device_webgl';
export declare class GPUTimer implements ITimer {
    private _device;
    private _query;
    private _state;
    private _timerQuery;
    private _gpuTime;
    constructor(device: WebGLDevice);
    get gpuTimerSupported(): boolean;
    begin(): void;
    end(): void;
    ended(): boolean;
    elapsed(): number;
}
