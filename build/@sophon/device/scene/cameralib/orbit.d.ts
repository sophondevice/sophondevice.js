import { BaseCameraModel } from './base';
import type { AbstractCameraModel } from '../camera';
export interface IOrbitCameraModelOptions {
    distance?: number;
    damping?: number;
    zoomSpeed?: number;
    rotateSpeed?: number;
}
export declare class OrbitCameraModel extends BaseCameraModel implements AbstractCameraModel {
    constructor(options?: IOrbitCameraModelOptions);
    reset(): void;
    setOptions(opt?: IOrbitCameraModelOptions): void;
    update(): void;
}
