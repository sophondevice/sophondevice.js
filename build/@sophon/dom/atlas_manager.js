/** sophon base library */
import { MaxRectsPacker } from './maxrects-packer/maxrects-packer.js';

class AtlasManager {
    static ATLAS_WIDTH = 1024;
    static ATLAS_HEIGHT = 1024;
    _renderer;
    _packer;
    _cachePadding;
    _cacheWidth;
    _cacheHeight;
    _linearSpace;
    _atlasList;
    _atlasInfoMap;
    _atlasRestoreHandler;
    constructor(renderer, cacheWidth, cacheHeight, cachePadding, linearSpace) {
        this._renderer = renderer;
        this._cacheWidth =
            typeof cacheWidth === 'number'
                ? cacheWidth || AtlasManager.ATLAS_WIDTH
                : AtlasManager.ATLAS_WIDTH;
        this._cacheHeight =
            typeof cacheHeight === 'number'
                ? cacheHeight || AtlasManager.ATLAS_HEIGHT
                : AtlasManager.ATLAS_HEIGHT;
        this._cachePadding = typeof cachePadding === 'number' ? cachePadding : 0;
        this._linearSpace = Boolean(linearSpace);
        this._packer = new MaxRectsPacker(this._cacheWidth, this._cacheHeight, this._cachePadding, {
            smart: true,
            pot: false,
            square: false,
            allowRotation: false,
            border: 1,
            tag: false,
        });
        this._atlasList = [];
        this._atlasInfoMap = {};
        this._atlasRestoreHandler = null;
    }
    get atlasTextureRestoreHandler() {
        return this._atlasRestoreHandler;
    }
    set atlasTextureRestoreHandler(f) {
        this._atlasRestoreHandler = f;
    }
    getAtlasTexture(index) {
        return this._atlasList[index];
    }
    getAtlasInfo(key) {
        return this._atlasInfoMap[key] || null;
    }
    isEmpty() {
        return this._atlasList.length === 0;
    }
    clear() {
        this._packer = new MaxRectsPacker(this._cacheWidth, this._cacheHeight, this._cachePadding, {
            smart: true,
            pot: false,
            square: false,
            allowRotation: false,
            border: 1,
            tag: false,
        });
        for (const tex of this._atlasList) {
            const t = tex;
            this._renderer.disposeTexture(t);
        }
        this._atlasList = [];
        this._atlasInfoMap = {};
    }
    pushCanvas(key, ctx, x, y, w, h) {
        const rc = this._packer.add(w, h, null);
        if (rc) {
            this._updateAtlasTextureCanvas(this._packer.bins.length - 1, ctx, rc.x, rc.y, rc.width, rc.height, x, y);
            const info = {
                atlasIndex: this._packer.bins.length - 1,
                uMin: rc.x / (this._cacheWidth + this._cachePadding),
                vMin: rc.y / (this._cacheHeight + this._cachePadding),
                uMax: (rc.x + rc.width) / (this._cacheWidth + this._cachePadding),
                vMax: (rc.y + rc.height) / (this._cacheHeight + this._cachePadding),
                width: rc.width,
                height: rc.height,
            };
            this._atlasInfoMap[key] = info;
            return info;
        }
    }
    pushBitmap(key, bitmap) {
        const rc = this._packer.add(bitmap.width, bitmap.height, null);
        if (rc) {
            this._updateAtlasTexture(this._packer.bins.length - 1, bitmap, rc.x, rc.y);
            const info = {
                atlasIndex: this._packer.bins.length - 1,
                uMin: rc.x / (this._cacheWidth + this._cachePadding),
                vMin: rc.y / (this._cacheHeight + this._cachePadding),
                uMax: (rc.x + rc.width) / (this._cacheWidth + this._cachePadding),
                vMax: (rc.y + rc.height) / (this._cacheHeight + this._cachePadding),
                width: rc.width,
                height: rc.height,
            };
            this._atlasInfoMap[key] = info;
            return info;
        }
        return null;
    }
    _createAtlasTexture() {
        const zeroColor = { r: 0, g: 0, b: 0, a: 0 };
        const tex = this._renderer.createTexture(this._cacheWidth + this._cachePadding, this._cacheHeight + this._cachePadding, zeroColor, this._linearSpace);
        tex.restoreHandler = async (tex) => {
            this._renderer.clearTexture(tex, zeroColor);
            this._atlasRestoreHandler && await this._atlasRestoreHandler(tex);
        };
        return tex;
    }
    _updateAtlasTextureCanvas(atlasIndex, bitmap, x, y, w, h, xOffset, yOffset) {
        let textureAtlas = null;
        if (atlasIndex === this._atlasList.length) {
            textureAtlas = this._createAtlasTexture();
            this._atlasList.push(textureAtlas);
        }
        else {
            textureAtlas = this._atlasList[atlasIndex];
        }
        this._renderer.updateTextureWithCanvas(textureAtlas, bitmap, xOffset, yOffset, w, h, x, y);
    }
    _updateAtlasTexture(atlasIndex, bitmap, x, y) {
        let textureAtlas = null;
        if (atlasIndex === this._atlasList.length) {
            textureAtlas = this._createAtlasTexture();
            this._atlasList.push(textureAtlas);
        }
        else {
            textureAtlas = this._atlasList[atlasIndex];
        }
        this._renderer.updateTextureWithImage(textureAtlas, bitmap, x, y);
    }
}

export { AtlasManager };
//# sourceMappingURL=atlas_manager.js.map
