import { RElement } from '../element';
import type { GUI } from '../gui';
export declare class Option extends RElement {
    constructor(uiscene: GUI);
    setAttribute(k: string, v?: string): void;
}
export declare class Select extends RElement {
    constructor(uiscene: GUI);
    get value(): string;
}
