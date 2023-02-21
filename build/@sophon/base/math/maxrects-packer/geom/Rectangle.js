/** sophon base library */
class Rectangle {
    oversized = false;
    constructor(width = 0, height = 0, x = 0, y = 0, rot = false, allowRotation = undefined) {
        this._width = width;
        this._height = height;
        this._x = x;
        this._y = y;
        this._data = {};
        this._rot = rot;
        this._allowRotation = allowRotation;
    }
    static Collide(first, second) {
        return first.collide(second);
    }
    static Contain(first, second) {
        return first.contain(second);
    }
    area() {
        return this.width * this.height;
    }
    collide(rect) {
        return (rect.x < this.x + this.width &&
            rect.x + rect.width > this.x &&
            rect.y < this.y + this.height &&
            rect.y + rect.height > this.y);
    }
    contain(rect) {
        return (rect.x >= this.x &&
            rect.y >= this.y &&
            rect.x + rect.width <= this.x + this.width &&
            rect.y + rect.height <= this.y + this.height);
    }
    _width;
    get width() {
        return this._width;
    }
    set width(value) {
        if (value === this._width)
            return;
        this._width = value;
        this._dirty++;
    }
    _height;
    get height() {
        return this._height;
    }
    set height(value) {
        if (value === this._height)
            return;
        this._height = value;
        this._dirty++;
    }
    _x;
    get x() {
        return this._x;
    }
    set x(value) {
        if (value === this._x)
            return;
        this._x = value;
        this._dirty++;
    }
    _y;
    get y() {
        return this._y;
    }
    set y(value) {
        if (value === this._y)
            return;
        this._y = value;
        this._dirty++;
    }
    _rot = false;
    get rot() {
        return this._rot;
    }
    set rot(value) {
        if (this._allowRotation === false)
            return;
        if (this._rot !== value) {
            const tmp = this.width;
            this.width = this.height;
            this.height = tmp;
            this._rot = value;
            this._dirty++;
        }
    }
    _allowRotation = undefined;
    get allowRotation() {
        return this._allowRotation;
    }
    set allowRotation(value) {
        if (this._allowRotation !== value) {
            this._allowRotation = value;
            this._dirty++;
        }
    }
    _data;
    get data() {
        return this._data;
    }
    set data(value) {
        if (value === null || value === this._data)
            return;
        this._data = value;
        if (typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, 'allowRotation')) {
            this._allowRotation = value.allowRotation;
        }
        this._dirty++;
    }
    _dirty = 0;
    get dirty() {
        return this._dirty > 0;
    }
    setDirty(value = true) {
        this._dirty = value ? this._dirty + 1 : 0;
    }
}

export { Rectangle };
//# sourceMappingURL=Rectangle.js.map
