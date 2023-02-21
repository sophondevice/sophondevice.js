/** sophon base library */
import { Geometry } from '../device/geometry.js';

class Primitive extends Geometry {
    static _nextId = 0;
    _id;
    _bbox;
    _bboxChangeCallback;
    constructor(device) {
        super(device);
        this._id = ++Primitive._nextId;
        this._bbox = null;
        this._bboxChangeCallback = [];
    }
    get id() {
        return this._id;
    }
    addBoundingboxChangeCallback(cb) {
        cb && this._bboxChangeCallback.push(cb);
    }
    removeBoundingboxChangeCallback(cb) {
        const index = this._bboxChangeCallback.indexOf(cb);
        if (index >= 0) {
            this._bboxChangeCallback.splice(index, 1);
        }
    }
    getBoundingVolume() {
        return this._bbox;
    }
    setBoundingVolume(bv) {
        if (bv !== this._bbox) {
            this._bbox = bv;
            for (const cb of this._bboxChangeCallback) {
                cb();
            }
        }
    }
}

export { Primitive };
//# sourceMappingURL=primitive.js.map
