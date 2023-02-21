import { Texture2D } from '../../device/gpuobject';
import type { Device } from '../../device/device';
export declare function getSheenLutLoader(textureSize: number): (device: Device) => Promise<Texture2D>;
