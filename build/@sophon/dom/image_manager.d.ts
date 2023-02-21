import { TextureAtlas } from './texture_atlas';
import type { GUIRenderer } from './renderer';
export declare class ImageManager {
    constructor(renderer: GUIRenderer);
    get renderer(): GUIRenderer;
    getImage(name: string): TextureAtlas;
    dispose(): void;
}
