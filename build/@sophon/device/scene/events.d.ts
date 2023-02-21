import type { BaseLight } from './light';
import type { Camera } from './camera';
export declare class AddLight {
    node: BaseLight;
    constructor(node?: BaseLight);
}
export declare class RemoveLight {
    node: BaseLight;
    constructor(node?: BaseLight);
}
export declare class CameraChange {
    camera: Camera;
    constructor(camera?: Camera);
}
