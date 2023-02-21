/** sophon base library */
class FontCanvas {
    static _canvas = null;
    static _context = null;
    static _currentFont = null;
    static get canvas() {
        this._realize();
        return this._canvas;
    }
    static get context() {
        this._realize();
        return this._context;
    }
    static get font() {
        return this.context.font;
    }
    static set font(font) {
        this.context.font = font;
    }
    static _realize() {
        if (!this._canvas) {
            this._canvas = document.createElement('canvas');
            this._canvas.width = 512;
            this._canvas.height = 512;
            this._canvas.style.left = '-10000px';
            this._canvas.style.position = 'absolute';
            document.body.appendChild(this._canvas);
            this._context = this._canvas.getContext('2d', {
                willReadFrequently: true
            });
            this._context.textBaseline = 'top';
            this._context.textAlign = 'left';
            this._context.fillStyle = 'transparent';
            this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
            this._context.fillStyle = '#ffffff';
            this._context.imageSmoothingEnabled = true;
        }
    }
}
class Font {
    static fontCache = {};
    _name;
    _nameScaled;
    _scale;
    _size;
    _family;
    _top;
    _bottom;
    _topScaled;
    _bottomScaled;
    constructor(name, scale) {
        this._top = 0;
        this._bottom = 0;
        this._size = 0;
        this._topScaled = 0;
        this._bottomScaled = 0;
        this._family = '';
        this._scale = scale;
        this._name = name;
        this._nameScaled = null;
        if (this._name) {
            this._normalizeFont();
        }
    }
    static fetchFont(name, scale) {
        let fontlist = this.fontCache[name];
        if (!fontlist) {
            fontlist = {};
            this.fontCache[name] = fontlist;
        }
        let font = fontlist[scale];
        if (!font) {
            font = new Font(name, scale);
            fontlist[scale] = font;
        }
        return font;
    }
    get fontName() {
        return this._name;
    }
    set fontName(name) {
        this._name = name;
        this._normalizeFont();
    }
    get fontNameScaled() {
        return this._nameScaled;
    }
    get size() {
        return this._size;
    }
    get family() {
        return this._family;
    }
    get top() {
        return this._top;
    }
    get bottom() {
        return this._bottom;
    }
    get maxHeight() {
        return this._bottom - this._top + 1;
    }
    get topScaled() {
        return this._topScaled;
    }
    get bottomScaled() {
        return this._bottomScaled;
    }
    get maxHeightScaled() {
        return this._bottomScaled - this._topScaled + 1;
    }
    equalTo(other) {
        return this._size === other._size && this._family === other._family;
    }
    _measureFontHeight(fontName) {
        const oldFont = FontCanvas.context.font;
        const oldTextBaseline = FontCanvas.context.textBaseline;
        const oldFillStyle = FontCanvas.context.fillStyle;
        const fontParts = fontName.split(/\s+/);
        console.assert(fontParts.length >= 2, 'normalize font failed');
        const sizePart = fontParts[fontParts.length - 2];
        console.assert(sizePart.slice(sizePart.length - 2) === 'px', 'normalize font failed');
        const size = parseInt(sizePart.substring(0, sizePart.length - 2));
        const family = fontParts[fontParts.length - 1];
        FontCanvas.context.font = fontName;
        const testString = 'bdfghijklpq国美|_~';
        const metric = FontCanvas.context.measureText(testString);
        let top, bottom;
        top = 0;
        bottom = size - 1;
        const extra = 10;
        const halfExtra = extra >> 1;
        const maxWidth = Math.ceil(metric.width) + extra;
        const maxHeight = size + extra;
        FontCanvas.context.clearRect(0, 0, maxWidth, maxHeight);
        FontCanvas.context.textBaseline = 'top';
        FontCanvas.context.fillStyle = '#ffffff';
        FontCanvas.context.fillText(testString, halfExtra, halfExtra);
        const bitmap = FontCanvas.context.getImageData(0, 0, maxWidth, maxHeight);
        const pixels = bitmap.data;
        for (let i = 0; i < maxWidth * maxHeight; i++) {
            if (pixels[i * 4 + 3] > 0) {
                top = Math.floor(i / maxWidth);
                break;
            }
        }
        for (let i = maxWidth * maxHeight - 1; i >= 0; i--) {
            if (pixels[i * 4 + 3] > 0) {
                bottom = Math.floor(i / maxWidth);
                break;
            }
        }
        top -= halfExtra;
        bottom -= halfExtra;
        FontCanvas.context.font = oldFont;
        FontCanvas.context.textBaseline = oldTextBaseline;
        FontCanvas.context.fillStyle = oldFillStyle;
        return { size, family, top, bottom };
    }
    _normalizeFont() {
        const info = this._measureFontHeight(this._name);
        this._nameScaled = `${Math.round(info.size * this._scale)}px ${info.family}`;
        const infoScaled = this._measureFontHeight(this._nameScaled);
        this._size = info.size;
        this._family = info.family;
        this._top = info.top;
        this._bottom = info.bottom;
        this._topScaled = infoScaled.top;
        this._bottomScaled = infoScaled.bottom;
    }
}

export { Font, FontCanvas };
//# sourceMappingURL=font.js.map
