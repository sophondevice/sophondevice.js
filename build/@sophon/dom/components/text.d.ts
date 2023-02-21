import { RNode } from '../node';
import type { GUI } from '../gui';
export declare class RText extends RNode {
    constructor(uiscene: GUI);
    get nodeType(): number;
    cloneNode(): RNode;
    get textContent(): string;
    set textContent(text: string);
    get autoWrap(): boolean;
    set autoWrap(val: boolean);
    get charMargin(): number;
    set charMargin(val: number);
    get lineHeight(): number;
    set lineHeight(val: number);
}
