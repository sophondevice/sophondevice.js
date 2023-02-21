import { RElement } from '../element';
import type { GUI } from '../gui';
export declare class Slider extends RElement {
    constructor(uiscene: GUI);
    get value(): number;
    set value(val: number);
    get rangeStart(): number;
    set rangeStart(val: number);
    get rangeEnd(): number;
    set rangeEnd(val: number);
    get blockSize(): number;
    set blockSize(val: number);
    get stepValue(): number;
    set stepValue(val: number);
    get pageValue(): number;
    set pageValue(val: number);
    get orientation(): string;
    set orientation(val: string);
    get blockColor(): string;
    set blockColor(val: string);
    get blockImage(): string;
    set blockImage(val: string);
}
