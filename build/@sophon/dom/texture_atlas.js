/** sophon base library */
class TextureAtlas {
    _texture;
    _uvMin;
    _uvMax;
    _topLeftPatch9;
    _bottomRightPatch9;
    constructor(texture, uvMin, uvMax, topLeftPatch9, bottomRightPatch9) {
        this._texture = texture || null;
        this._uvMin = uvMin || { x: 0, y: 0 };
        this._uvMax = uvMax || { x: 1, y: 1 };
        this._topLeftPatch9 = topLeftPatch9 || null;
        this._bottomRightPatch9 = bottomRightPatch9 || null;
    }
    get texture() {
        return this._texture;
    }
    set texture(tex) {
        this._texture = tex;
    }
    get uvMin() {
        return this._uvMin;
    }
    set uvMin(v) {
        this._uvMin.x = v.x;
        this._uvMin.y = v.y;
    }
    get uvMax() {
        return this._uvMax;
    }
    set uvMax(v) {
        this._uvMax.x = v.x;
        this._uvMax.y = v.y;
    }
    get topLeftPatch9() {
        return this._topLeftPatch9;
    }
    set topLeftPatch9(v) {
        this._topLeftPatch9.x = v.x;
        this._topLeftPatch9.y = v.y;
    }
    get bottomRightPatch9() {
        return this._bottomRightPatch9;
    }
    set bottomRightPatch9(v) {
        this._bottomRightPatch9.x = v.x;
        this._bottomRightPatch9.y = v.y;
    }
}

export { TextureAtlas };
//# sourceMappingURL=texture_atlas.js.map
