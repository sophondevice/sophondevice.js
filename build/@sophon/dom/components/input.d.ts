import { RElement } from '../element';
import type { GUI } from '../gui';
export declare class Input extends RElement {
    constructor(uiscene: GUI);
    get type(): string;
    set type(val: string);
    get value(): string;
    set value(val: string);
}
