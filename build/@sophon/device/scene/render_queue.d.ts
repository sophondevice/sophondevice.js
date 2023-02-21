import type { Matrix4x4 } from '@sophon/base';
import type { Device } from '../device';
import type { Camera } from './camera';
import type { Drawable } from './drawable';
import type { RenderPass } from './renderers';
export interface InstanceData {
    worldMatrices: Matrix4x4[];
    hash: string;
}
export interface IRenderQueueItem {
    drawable: Drawable;
    sortDistance: number;
    instanceData: InstanceData;
}
interface RenderItemList {
    opaqueList: IRenderQueueItem[];
    opaqueInstanceList: {
        [hash: string]: number;
    };
    transList: IRenderQueueItem[];
    transInstanceList: {
        [hash: string]: number;
    };
}
export declare class RenderQueue {
    constructor(renderPass: RenderPass);
    get renderPass(): RenderPass;
    get items(): {
        [order: number]: RenderItemList;
    };
    getMaxBatchSize(device: Device): number;
    push(camera: Camera, drawable: Drawable, renderOrder: number): void;
    clear(): void;
    sortItems(): void;
}
export {};
