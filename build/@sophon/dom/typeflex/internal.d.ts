import { YGMeasureMode, YGEdge, YGDimension } from './enums';
export declare class YGCachedMeasurement {
    availableWidth: number;
    availableHeight: number;
    widthMeasureMode: YGMeasureMode;
    heightMeasureMode: YGMeasureMode;
    computedWidth: number;
    computedHeight: number;
    constructor();
    isEqual(measurement: YGCachedMeasurement): boolean;
    clone(): YGCachedMeasurement;
}
export declare const leading: [YGEdge, YGEdge, YGEdge, YGEdge];
export declare const trailing: [YGEdge, YGEdge, YGEdge, YGEdge];
export declare const pos: [YGEdge, YGEdge, YGEdge, YGEdge];
export declare const dim: [YGDimension, YGDimension, YGDimension, YGDimension];
export declare const YG_MAX_CACHED_RESULT_COUNT = 16;
export declare const kDefaultFlexGrow = 0;
export declare const kDefaultFlexShrink = 0;
export declare const kWebDefaultFlexShrink = 1;
