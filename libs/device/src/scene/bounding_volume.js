var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BoundingBox_1, BoundingBoxTree_1;
import { Vector3 } from '@sophon/base/math/vector';
import { Frustum } from '@sophon/base/math/frustum';
import { AABB } from '@sophon/base/math/aabb';
import { ClipState } from '@sophon/base/math/clip_test';
import { AABBTree } from './aabbtree';
export function boundingvolume() {
    return function (constructor) {
        constructor.__tagcounter = 1;
        constructor._fetchTag = function () {
            return constructor.__tagcounter++;
        };
        constructor.prototype._tag = constructor._fetchTag();
        constructor.prototype.tag = function () {
            this._tag = constructor._fetchTag();
        };
        constructor.prototype.getTag = function () {
            return this._tag;
        };
    };
}
let BoundingBox = BoundingBox_1 = class BoundingBox extends AABB {
    constructor(arg0, arg1) {
        super(arg0, arg1);
        this.minPoint.setChangeCallback(() => this.tag());
        this.maxPoint.setChangeCallback(() => this.tag());
    }
    clone() {
        return new BoundingBox_1(this);
    }
    transform(matrix) {
        return new BoundingBox_1(AABB.transform(this, matrix));
    }
    outsideFrustum(frustum) {
        return ((frustum instanceof Frustum
            ? this.getClipStateWithFrustum(frustum)
            : this.getClipState(frustum)) === ClipState.NOT_CLIPPED);
    }
    toAABB() {
        return this;
    }
};
BoundingBox = BoundingBox_1 = __decorate([
    boundingvolume(),
    __metadata("design:paramtypes", [Object, Vector3])
], BoundingBox);
export { BoundingBox };
let BoundingBoxTree = BoundingBoxTree_1 = class BoundingBoxTree extends AABBTree {
    constructor(arg) {
        super(arg);
    }
    clone() {
        return new BoundingBoxTree_1(this);
    }
    transform(matrix) {
        const newBV = new BoundingBoxTree_1(this);
        newBV.transform(matrix);
        return newBV;
    }
    outsideFrustum(frustum) {
        const aabb = this.getTopLevelAABB();
        if (aabb) {
            return ((frustum instanceof Frustum
                ? aabb.getClipStateWithFrustum(frustum)
                : aabb.getClipState(frustum)) === ClipState.NOT_CLIPPED);
        }
        else {
            return false;
        }
    }
    toAABB() {
        return this.getTopLevelAABB();
    }
};
BoundingBoxTree = BoundingBoxTree_1 = __decorate([
    boundingvolume(),
    __metadata("design:paramtypes", [AABBTree])
], BoundingBoxTree);
export { BoundingBoxTree };
//# sourceMappingURL=bounding_volume.js.map