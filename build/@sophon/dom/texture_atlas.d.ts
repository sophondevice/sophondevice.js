import type { Texture2D } from '@sophon/device';
import type { RCoord } from './types';
export declare class TextureAtlas {
    constructor(texture?: Texture2D, uvMin?: RCoord, uvMax?: RCoord, topLeftPatch9?: RCoord, bottomRightPatch9?: RCoord);
    get texture(): Texture2D;
    set texture(tex: Texture2D);
    get uvMin(): RCoord;
    set uvMin(v: RCoord);
    get uvMax(): RCoord;
    set uvMax(v: RCoord);
    get topLeftPatch9(): RCoord;
    set topLeftPatch9(v: RCoord);
    get bottomRightPatch9(): RCoord;
    set bottomRightPatch9(v: RCoord);
}
