import { YGDirection } from './enums';
import { YGFloatOptional } from './ygfloatoptional';
import { YGCachedMeasurement } from './internal';
declare class YGLayout {
    position: [number, number, number, number];
    dimensions: [number, number];
    margin: [number, number, number, number, number, number];
    border: [number, number, number, number, number, number];
    padding: [number, number, number, number, number, number];
    direction: YGDirection;
    computedFlexBasisGeneration: number;
    computedFlexBasis: YGFloatOptional;
    hadOverflow: boolean;
    generationCount: number;
    lastOwnerDirection: YGDirection;
    nextCachedMeasurementsIndex: number;
    cachedMeasurements: Array<YGCachedMeasurement>;
    measuredDimensions: Array<number>;
    cachedLayout: YGCachedMeasurement;
    didUseLegacyFlag: boolean;
    doesLegacyStretchFlagAffectsLayout: boolean;
    constructor();
    equal(layout: YGLayout): boolean;
    diff(layout: YGLayout): boolean;
    clean(): void;
    clone(): YGLayout;
}
export { YGLayout };
