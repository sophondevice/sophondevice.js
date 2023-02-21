/** sophon base library */
import { FontCanvas } from './font.js';
import { AtlasManager } from './atlas_manager.js';

class GlyphManager extends AtlasManager {
    constructor(renderer, cacheWidth, cacheHeight, cachePadding) {
        super(renderer, Math.max(cacheWidth || 0, 0), cacheHeight, cachePadding, true);
        this._atlasRestoreHandler = async (tex) => {
            if (this._atlasList.length > 0) {
                this.clear();
            }
        };
    }
    getGlyphTexture(index) {
        return this.getAtlasTexture(index);
    }
    getGlyphInfo(char, font, color) {
        if (!char || !font || !color) {
            return null;
        }
        let glyphInfo = this.getAtlasInfo(this._hash(char, font, color));
        if (!glyphInfo) {
            glyphInfo = this._cacheGlyph(char, font, color);
            glyphInfo.width = Math.round(glyphInfo.width * (font.maxHeight / font.maxHeightScaled));
            glyphInfo.height = font.maxHeight;
        }
        return glyphInfo;
    }
    measureStringWidth(str, charMargin, font) {
        let w = 0;
        for (const ch of str) {
            w += charMargin + this.getCharWidth(ch, font);
        }
        return w;
    }
    clipStringToWidth(str, width, charMargin, start, font) {
        let sum = 0;
        let i = start;
        for (; i < str.length; i++) {
            sum += charMargin + this.getCharWidth(str[i], font);
            if (sum > width) {
                break;
            }
        }
        return i - start;
    }
    _normalizeColor(color) {
        const r = `0${(Math.round(color.r * 255) & 0xff).toString(16)}`.slice(-2);
        const g = `0${(Math.round(color.g * 255) & 0xff).toString(16)}`.slice(-2);
        const b = `0${(Math.round(color.b * 255) & 0xff).toString(16)}`.slice(-2);
        return `#${r}${g}${b}`;
    }
    _hash(char, font, color) {
        const clr = this._renderer.supportColorComposition() ? '' : `@${this._normalizeColor(color)}`;
        return `${font.family}@${font.size}${clr}&${char}`;
    }
    _cacheGlyph(char, font, color) {
        const bitmap = this._getGlyphBitmap(char, font, color);
        return this.pushBitmap(this._hash(char, font, color), bitmap);
    }
    getCharWidth(char, font) {
        if (!font) {
            return 0;
        }
        FontCanvas.font = font.fontNameScaled;
        const metric = FontCanvas.context.measureText(char);
        let w = metric.width;
        if (w === 0) {
            return 0;
        }
        if (typeof metric.actualBoundingBoxRight === 'number') {
            w = Math.floor(Math.max(w, metric.actualBoundingBoxRight) + 0.8);
        }
        w = Math.round(w * (font.maxHeight / font.maxHeightScaled));
        return w;
    }
    _getGlyphBitmap(char, font, color) {
        if (!font) {
            return null;
        }
        FontCanvas.font = font.fontNameScaled;
        const metric = FontCanvas.context.measureText(char);
        let w = metric.width;
        if (w === 0) {
            return null;
        }
        if (typeof metric.actualBoundingBoxRight === 'number') {
            w = Math.floor(Math.max(w, metric.actualBoundingBoxRight) + 0.8);
        }
        const h = font.maxHeightScaled;
        FontCanvas.context.fillStyle = this._renderer.supportColorComposition()
            ? '#fff'
            : this._normalizeColor(color);
        FontCanvas.context.clearRect(0, 0, w + 2, h);
        FontCanvas.context.fillText(char, 0, -font.topScaled);
        return FontCanvas.context.getImageData(0, 0, w, h);
    }
}

export { GlyphManager };
//# sourceMappingURL=glyph_manager.js.map
