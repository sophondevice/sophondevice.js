/** sophon base library */
class Bin {
    width;
    height;
    maxWidth;
    maxHeight;
    freeRects;
    rects;
    options;
    data;
    tag;
    _dirty = 0;
    get dirty() {
        return this._dirty > 0 || this.rects.some((rect) => rect.dirty);
    }
    setDirty(value = true) {
        this._dirty = value ? this._dirty + 1 : 0;
        if (!value) {
            for (const rect of this.rects) {
                if (rect.setDirty)
                    rect.setDirty(false);
            }
        }
    }
}

export { Bin };
//# sourceMappingURL=abstract-bin.js.map
