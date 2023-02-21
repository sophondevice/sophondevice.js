/** sophon base library */
import { YGDirection } from './enums.js';
import { YGFloatOptional } from './ygfloatoptional.js';
import { YGCachedMeasurement } from './internal.js';
import { YGFloatArrayEqual } from './utils.js';
import { YGFloatIsUndefined } from './yoga.js';

const kYGDefaultDimensionValues = function () {
    return [undefined, undefined];
};
const YG_MAX_CACHED_RESULT_COUNT = 16;
function buildCache(c) {
    const ret = [];
    for (let i = 0; i < c; i++) {
        ret.push(new YGCachedMeasurement());
    }
    return ret;
}
class YGLayout {
    position;
    dimensions;
    margin;
    border;
    padding;
    direction;
    computedFlexBasisGeneration;
    computedFlexBasis;
    hadOverflow;
    generationCount;
    lastOwnerDirection;
    nextCachedMeasurementsIndex;
    cachedMeasurements;
    measuredDimensions;
    cachedLayout;
    didUseLegacyFlag;
    doesLegacyStretchFlagAffectsLayout;
    constructor() {
        this.dimensions = kYGDefaultDimensionValues();
        this.direction = YGDirection.Inherit;
        this.computedFlexBasisGeneration = 0;
        this.computedFlexBasis = new YGFloatOptional();
        this.hadOverflow = false;
        this.generationCount = 0;
        this.lastOwnerDirection = YGDirection.RTL;
        this.nextCachedMeasurementsIndex = 0;
        this.measuredDimensions = kYGDefaultDimensionValues();
        this.cachedLayout = new YGCachedMeasurement();
        this.didUseLegacyFlag = false;
        this.doesLegacyStretchFlagAffectsLayout = false;
        this.position = [undefined, undefined, undefined, undefined];
        this.margin = [undefined, undefined, undefined, undefined, undefined, undefined];
        this.border = [undefined, undefined, undefined, undefined, undefined, undefined];
        this.padding = [undefined, undefined, undefined, undefined, undefined, undefined];
        this.cachedMeasurements = buildCache(YG_MAX_CACHED_RESULT_COUNT);
    }
    equal(layout) {
        let isEqual = YGFloatArrayEqual(this.position, layout.position) &&
            YGFloatArrayEqual(this.dimensions, layout.dimensions) &&
            YGFloatArrayEqual(this.margin, layout.margin) &&
            YGFloatArrayEqual(this.border, layout.border) &&
            YGFloatArrayEqual(this.padding, layout.padding) &&
            this.direction == layout.direction &&
            this.hadOverflow == layout.hadOverflow &&
            this.lastOwnerDirection == layout.lastOwnerDirection &&
            this.nextCachedMeasurementsIndex == layout.nextCachedMeasurementsIndex &&
            this.cachedLayout == layout.cachedLayout &&
            this.computedFlexBasis == layout.computedFlexBasis;
        for (let i = 0; i < YG_MAX_CACHED_RESULT_COUNT && isEqual; ++i) {
            isEqual = isEqual && this.cachedMeasurements[i] == layout.cachedMeasurements[i];
        }
        if (!YGFloatIsUndefined(this.measuredDimensions[0]) ||
            !YGFloatIsUndefined(layout.measuredDimensions[0])) {
            isEqual = isEqual && this.measuredDimensions[0] == layout.measuredDimensions[0];
        }
        if (!YGFloatIsUndefined(this.measuredDimensions[1]) ||
            !YGFloatIsUndefined(layout.measuredDimensions[1])) {
            isEqual = isEqual && this.measuredDimensions[1] == layout.measuredDimensions[1];
        }
        return isEqual;
    }
    diff(layout) {
        return !this.equal(layout);
    }
    clean() {
        this.dimensions = kYGDefaultDimensionValues();
        this.direction = YGDirection.Inherit;
        this.computedFlexBasisGeneration = 0;
        this.computedFlexBasis = new YGFloatOptional();
        this.hadOverflow = false;
        this.generationCount = 0;
        this.lastOwnerDirection = YGDirection.RTL;
        this.nextCachedMeasurementsIndex = 0;
        this.measuredDimensions = kYGDefaultDimensionValues();
        this.cachedLayout = new YGCachedMeasurement();
        this.didUseLegacyFlag = false;
        this.doesLegacyStretchFlagAffectsLayout = false;
        this.position = [undefined, undefined, undefined, undefined];
        this.margin = [undefined, undefined, undefined, undefined, undefined, undefined];
        this.border = [undefined, undefined, undefined, undefined, undefined, undefined];
        this.padding = [undefined, undefined, undefined, undefined, undefined, undefined];
        this.cachedMeasurements = buildCache(YG_MAX_CACHED_RESULT_COUNT);
    }
    clone() {
        const newLayout = new YGLayout();
        newLayout.dimensions = [this.dimensions[0], this.dimensions[1]];
        newLayout.direction = this.direction;
        newLayout.computedFlexBasisGeneration = this.computedFlexBasisGeneration;
        newLayout.computedFlexBasis = this.computedFlexBasis.clone();
        newLayout.hadOverflow = this.hadOverflow;
        newLayout.generationCount = this.generationCount;
        newLayout.lastOwnerDirection = this.lastOwnerDirection;
        newLayout.nextCachedMeasurementsIndex = this.nextCachedMeasurementsIndex;
        newLayout.measuredDimensions = [this.measuredDimensions[0], this.measuredDimensions[1]];
        newLayout.cachedLayout = this.cachedLayout.clone();
        newLayout.didUseLegacyFlag = this.didUseLegacyFlag;
        newLayout.doesLegacyStretchFlagAffectsLayout = this.doesLegacyStretchFlagAffectsLayout;
        newLayout.position = [this.position[0], this.position[1], this.position[2], this.position[3]];
        newLayout.margin = [
            this.margin[0],
            this.margin[1],
            this.margin[2],
            this.margin[3],
            this.margin[4],
            this.margin[5],
        ];
        newLayout.border = [
            this.border[0],
            this.border[1],
            this.border[2],
            this.border[3],
            this.border[4],
            this.border[5],
        ];
        newLayout.padding = [
            this.padding[0],
            this.padding[1],
            this.padding[2],
            this.padding[3],
            this.padding[4],
            this.padding[5],
        ];
        newLayout.cachedMeasurements = buildCache(YG_MAX_CACHED_RESULT_COUNT);
        return newLayout;
    }
}

export { YGLayout };
//# sourceMappingURL=yglayout.js.map
