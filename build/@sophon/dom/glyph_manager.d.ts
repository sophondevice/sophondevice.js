import { Font } from './font';
import { GUIRenderer } from './renderer';
import { RColor } from './types';
import { AtlasManager } from './atlas_manager';
import type { Texture2D } from '@sophon/device';
export interface IGlyphInfo {
    atlasIndex: number;
    width: number;
    height: number;
    uMin: number;
    vMin: number;
    uMax: number;
    vMax: number;
}
export declare class GlyphManager extends AtlasManager {
    constructor(renderer: GUIRenderer, cacheWidth?: number, cacheHeight?: number, cachePadding?: number);
    getGlyphTexture(index: number): Texture2D;
    getGlyphInfo(char: string, font: Font, color: RColor): IGlyphInfo;
    measureStringWidth(str: string, charMargin: number, font: Font): number;
    clipStringToWidth(str: string, width: number, charMargin: number, start: number, font: Font): number;
    getCharWidth(char: string, font: Font): number;
}
