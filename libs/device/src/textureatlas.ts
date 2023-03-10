import { RectsPacker } from '@sophon/base';
import type { Device } from './device';
import type { BaseTexture, Texture2D } from './gpuobject';

export interface AtlasInfo {
  atlasIndex: number;
  width: number;
  height: number;
  uMin: number;
  vMin: number;
  uMax: number;
  vMax: number;
}

export class TextureAtlasManager {
  /** @internal */
  protected static readonly ATLAS_WIDTH = 1024;
  /** @internal */
  protected static readonly ATLAS_HEIGHT = 1024;
  /** @internal */
  protected _packer: RectsPacker;
  /** @internal */
  protected _device: Device;
  /** @internal */
  protected _binWidth: number;
  /** @internal */
  protected _binHeight: number;
  /** @internal */
  protected _rectBorderWidth: number;
  /** @internal */
  protected _linearSpace: boolean;
  /** @internal */
  protected _atlasList: Texture2D[];
  /** @internal */
  protected _atlasInfoMap: { [hash: string]: AtlasInfo };
  /** @internal */
  protected _atlasRestoreHandler: (tex: BaseTexture) => Promise<void>;
  constructor(device: Device, binWidth: number, binHeight: number, rectBorderWidth: number, linearSpace?: boolean) {
    this._device = device;
    this._binWidth = binWidth;
    this._binHeight = binHeight;
    this._rectBorderWidth = rectBorderWidth;
    this._linearSpace = !!linearSpace;
    this._packer = new RectsPacker(this._binWidth, this._binHeight);
    this._atlasList = [];
    this._atlasInfoMap = {};
    this._atlasRestoreHandler = null;
  }
  get atlasTextureRestoreHandler(): (tex: BaseTexture) => Promise<void> {
    return this._atlasRestoreHandler;
  }
  set atlasTextureRestoreHandler(f: (tex: BaseTexture) => Promise<void>) {
    this._atlasRestoreHandler = f;
  }
  getAtlasTexture(index: number): Texture2D {
    return this._atlasList[index];
  }
  getAtlasInfo(key: string): AtlasInfo {
    return this._atlasInfoMap[key] || null;
  }
  isEmpty(): boolean {
    return this._atlasList.length === 0;
  }
  clear() {
    this._packer.clear();
    for (const tex of this._atlasList) {
      tex.dispose();
    }
    this._atlasList = [];
    this._atlasInfoMap = {};
  }
  pushCanvas(key: string, ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    const rc = this._packer.insert(w + 2 * this._rectBorderWidth, h + 2 * this._rectBorderWidth);
    if (rc) {
      const atlasX = rc.x + this._rectBorderWidth;
      const atlasY = rc.y + this._rectBorderWidth;
      this._updateAtlasTextureCanvas(
        rc.binIndex,
        ctx,
        atlasX,
        atlasY,
        w,
        h,
        x,
        y
      );
      const info: AtlasInfo = {
        atlasIndex: rc.binIndex,
        uMin: atlasX / this._binWidth,
        vMin: atlasY / this._binHeight,
        uMax: (atlasX + w) / this._binWidth,
        vMax: (atlasY + h) / this._binHeight,
        width: w,
        height: h
      };
      this._atlasInfoMap[key] = info;
      return info;
    }
  }
  pushBitmap(key: string, bitmap: ImageData): AtlasInfo {
    const rc = this._packer.insert(bitmap.width + 2 * this._rectBorderWidth, bitmap.height + 2 * this._rectBorderWidth);
    if (rc) {
      const atlasX = rc.x + this._rectBorderWidth;
      const atlasY = rc.y + this._rectBorderWidth;
      this._updateAtlasTexture(rc.binIndex, bitmap, atlasX, atlasY);
      const info: AtlasInfo = {
        atlasIndex: rc.binIndex,
        uMin: atlasX / this._binWidth,
        vMin: atlasY / this._binHeight,
        uMax: (atlasX + bitmap.width) / this._binWidth,
        vMax: (atlasY + bitmap.height) / this._binHeight,
        width: bitmap.width,
        height: bitmap.height
      };
      this._atlasInfoMap[key] = info;
      return info;
    }
    return null;
  }
  /** @internal */
  protected _createAtlasTexture(): Texture2D {
    const tex = this._device.createTexture2D('rgba8unorm', this._binWidth, this._binHeight, {
      colorSpace: this._linearSpace ? 'linear' : 'srgb',
      noMipmap: true
    });
    tex.update(new Uint8Array(tex.width * tex.height * 4), 0, 0, tex.width, tex.height);
    tex.restoreHandler = async () => {
      tex.update(new Uint8Array(tex.width * tex.height * 4), 0, 0, tex.width, tex.height);
      this._atlasRestoreHandler && (await this._atlasRestoreHandler(tex));
    };
    return tex;
  }
  /** @internal */
  private _updateAtlasTextureCanvas(
    atlasIndex: number,
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    xOffset: number,
    yOffset: number
  ) {
    let textureAtlas: Texture2D = null;
    if (atlasIndex === this._atlasList.length) {
      textureAtlas = this._createAtlasTexture();
      this._atlasList.push(textureAtlas);
    } else {
      textureAtlas = this._atlasList[atlasIndex];
    }
    textureAtlas.updateFromElement(ctx.canvas, x, y, xOffset, yOffset, w, h);
  }
  /** @internal */
  private _updateAtlasTexture(atlasIndex: number, bitmap: ImageData, x: number, y: number) {
    let textureAtlas: Texture2D = null;
    if (atlasIndex === this._atlasList.length) {
      textureAtlas = this._createAtlasTexture();
      this._atlasList.push(textureAtlas);
    } else {
      textureAtlas = this._atlasList[atlasIndex];
    }
    const originValues = new Uint8Array(bitmap.data.buffer);
    textureAtlas.update(originValues, x, y, bitmap.width, bitmap.height);
  }
}
