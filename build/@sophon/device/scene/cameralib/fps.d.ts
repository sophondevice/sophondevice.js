import { BaseCameraModel } from './base';
import type { AbstractCameraModel } from '../camera';
export interface IFPSCameraModelOptions {
    controlKeys?: {
        up: string;
        down: string;
        forward: string;
        backward: string;
        left: string;
        right: string;
    };
    moveSpeed?: number;
    rotateSpeed?: number;
}
export declare class FPSCameraModel extends BaseCameraModel implements AbstractCameraModel {
    constructor(options?: IFPSCameraModelOptions);
    reset(): void;
    setOptions(opt?: IFPSCameraModelOptions): void;
    update(): void;
}
