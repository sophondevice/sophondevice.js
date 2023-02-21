import { YGUnit } from './enums';
export declare class YGValue {
    value: number;
    unit: YGUnit;
    constructor(value: number, unit: YGUnit);
    clone(): YGValue;
}
