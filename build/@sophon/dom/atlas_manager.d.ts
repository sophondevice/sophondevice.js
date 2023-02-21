import type { GUIRenderer } from './renderer';
import type { BaseTexture, Texture2D } from '@sophon/device';
export interface IAtlasInfo {
    atlasIndex: number;
    width: number;
    height: number;
    uMin: number;
    vMin: number;
    uMax: number;
    vMax: number;
}
export declare class AtlasManager {
    constructor(renderer: GUIRenderer, cacheWidth?: number, cacheHeight?: number, cachePadding?: number, linearSpace?: boolean);
    get atlasTextureRestoreHandler(): (tex: BaseTexture) => Promise<void>;
    set atlasTextureRestoreHandler(f: (tex: BaseTexture) => Promise<void>);
    getAtlasTexture(index: number): Texture2D;
    getAtlasInfo(key: string): IAtlasInfo;
    isEmpty(): boolean;
    clear(): void;
    pushCanvas(key: string, ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): IAtlasInfo;
    pushBitmap(key: string, bitmap: ImageData): IAtlasInfo;
}
