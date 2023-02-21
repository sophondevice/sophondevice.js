import { Device, DeviceOptions, DeviceType } from './device';
export declare class Viewer {
    constructor(cvs: HTMLCanvasElement);
    get device(): Device;
    get canvas(): HTMLCanvasElement;
    initDevice(deviceType: DeviceType[] | DeviceType, options?: DeviceOptions): Promise<void>;
}
