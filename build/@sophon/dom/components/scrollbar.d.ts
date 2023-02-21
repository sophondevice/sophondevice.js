import { Slider } from './slider';
import type { GUI } from '../gui';
export declare class ScrollBar extends Slider {
    constructor(uiscene: GUI);
    get buttonSize(): number;
    set buttonSize(val: number);
}
