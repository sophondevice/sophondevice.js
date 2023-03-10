import { Font, FontCanvas } from './font';
import { GUIRenderer } from './renderer';
import { TextureAtlasManager, Texture2D } from '@sophon/device';

export interface GlyphInfo {
  atlasIndex: number;
  width: number;
  height: number;
  uMin: number;
  vMin: number;
  uMax: number;
  vMax: number;
}

export class GlyphManager extends TextureAtlasManager {
  constructor(renderer: GUIRenderer, binWidth: number, binHeight: number, border: number) {
    super(renderer.device, binWidth, binHeight, border, true);
    this.atlasTextureRestoreHandler = async () => {
      if (!this.isEmpty()) {
        this.clear();
      }
    };
  }
  getGlyphTexture(index: number): Texture2D {
    return this.getAtlasTexture(index);
  }
  getGlyphInfo(char: string, font: Font): GlyphInfo {
    if (!char || !font) {
      return null;
    }
    let glyphInfo = this.getAtlasInfo(this._hash(char, font));
    if (!glyphInfo) {
      glyphInfo = this._cacheGlyph(char, font);
      glyphInfo.width = Math.round(glyphInfo.width * (font.maxHeight / font.maxHeightScaled));
      glyphInfo.height = font.maxHeight;
    }
    return glyphInfo;
  }
  measureStringWidth(str: string, charMargin: number, font: Font) {
    let w = 0;
    for (const ch of str) {
      w += charMargin + this.getCharWidth(ch, font);
    }
    return w;
  }
  clipStringToWidth(str: string, width: number, charMargin: number, start: number, font: Font) {
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
  /** @internal */
  private _hash(char: string, font: Font) {
    return `${font.family}@${font.size}&${char}`;
  }
  /** @internal */
  private _cacheGlyph(char: string, font: Font): GlyphInfo {
    const bitmap = this._getGlyphBitmap(char, font) as ImageData;
    return this.pushBitmap(this._hash(char, font), bitmap);
  }
  getCharWidth(char: string, font: Font): number {
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
  /** @internal */
  private _getGlyphBitmap(char: string, font: Font): ImageData | { x: number; y: number; w: number; h: number } {
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
    FontCanvas.context.fillStyle = '#fff';
    FontCanvas.context.clearRect(0, 0, w + 2, h);
    FontCanvas.context.fillText(char, 0, -font.topScaled);
    return FontCanvas.context.getImageData(0, 0, w, h);
  }
}
