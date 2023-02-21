/** sophon base library */
import { YGEdge, YGDimension, YGMeasureMode } from './enums.js';
import { YGFloatIsUndefined } from './yoga.js';

class YGCachedMeasurement {
    availableWidth;
    availableHeight;
    widthMeasureMode;
    heightMeasureMode;
    computedWidth;
    computedHeight;
    constructor() {
        this.availableWidth = 0;
        this.availableHeight = 0;
        this.widthMeasureMode = YGMeasureMode.AtMost;
        this.heightMeasureMode = YGMeasureMode.AtMost;
        this.computedWidth = -1;
        this.computedHeight = -1;
    }
    isEqual(measurement) {
        let isEqual = this.widthMeasureMode == measurement.widthMeasureMode &&
            this.heightMeasureMode == measurement.heightMeasureMode;
        if (!YGFloatIsUndefined(this.availableWidth) ||
            !YGFloatIsUndefined(measurement.availableWidth)) {
            isEqual = isEqual && this.availableWidth == measurement.availableWidth;
        }
        if (!YGFloatIsUndefined(this.availableHeight) ||
            !YGFloatIsUndefined(measurement.availableHeight)) {
            isEqual = isEqual && this.availableHeight == measurement.availableHeight;
        }
        if (!YGFloatIsUndefined(this.computedWidth) || !YGFloatIsUndefined(measurement.computedWidth)) {
            isEqual = isEqual && this.computedWidth == measurement.computedWidth;
        }
        if (!YGFloatIsUndefined(this.computedHeight) ||
            !YGFloatIsUndefined(measurement.computedHeight)) {
            isEqual = isEqual && this.computedHeight == measurement.computedHeight;
        }
        return isEqual;
    }
    clone() {
        const newCached = new YGCachedMeasurement();
        newCached.availableWidth = this.availableWidth;
        newCached.availableHeight = this.availableHeight;
        newCached.widthMeasureMode = this.widthMeasureMode;
        newCached.heightMeasureMode = this.heightMeasureMode;
        newCached.computedWidth = this.computedWidth;
        newCached.computedHeight = this.computedHeight;
        return newCached;
    }
}
const leading = [
    YGEdge.Top,
    YGEdge.Bottom,
    YGEdge.Left,
    YGEdge.Right,
];
const trailing = [
    YGEdge.Bottom,
    YGEdge.Top,
    YGEdge.Right,
    YGEdge.Left,
];
const pos = [
    YGEdge.Top,
    YGEdge.Bottom,
    YGEdge.Left,
    YGEdge.Right,
];
const dim = [
    YGDimension.Height,
    YGDimension.Height,
    YGDimension.Width,
    YGDimension.Width,
];
const YG_MAX_CACHED_RESULT_COUNT = 16;
const kDefaultFlexGrow = 0.0;
const kDefaultFlexShrink = 0.0;
const kWebDefaultFlexShrink = 1.0;

export { YGCachedMeasurement, YG_MAX_CACHED_RESULT_COUNT, dim, kDefaultFlexGrow, kDefaultFlexShrink, kWebDefaultFlexShrink, leading, pos, trailing };
//# sourceMappingURL=internal.js.map
