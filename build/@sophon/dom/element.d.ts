import { RNode } from './node';
import { RNodeList } from './nodelist';
import type { GUI } from './gui';
export interface RClassList {
    [n: number]: string;
}
export declare class RClassList {
    constructor(el: RElement);
    get value(): string;
    set value(val: string);
    get length(): number;
    add(...args: string[]): void;
    remove(...args: string[]): void;
    toggle(className: string): boolean;
    contains(className: string): boolean;
    replace(oldClassName: string, newClassName: string): void;
}
export interface RAttr {
    name: string;
    value: string;
}
export declare class RElement extends RNode {
    constructor(uiscene: GUI);
    get children(): RNodeList;
    get childElementCount(): number;
    get nodeType(): number;
    get localName(): string;
    get tagName(): string;
    get id(): string;
    set id(id: string);
    get classList(): RClassList;
    get className(): string;
    get attributes(): RAttr[];
    get firstElementChild(): RElement;
    get lastElementChild(): RElement;
    get nextElementSibling(): RElement;
    get previousElementSibling(): RElement;
    getAttribute(k: string): string;
    setAttribute(k: string, v?: string): void;
    removeAttribute(k: string): void;
    hasAttribute(k: string): boolean;
    hasAttributes(): boolean;
    insertAdjacentElement(position: string, element: RElement): RElement;
    insertAdjacentText(position: string, text: string): string;
    matches(selectorString: string): boolean;
    cloneNode(deep: boolean): RNode;
    replaceWith(...nodes: (RNode | string)[]): void;
    remove(): RNode;
    before(...nodes: (RNode | string)[]): void;
    after(...nodes: (RNode | string)[]): void;
    append(...nodes: (RNode | string)[]): void;
    prepend(...nodes: (RNode | string)[]): void;
    querySelectorAll(selectors: string): RNodeList;
    querySelector<T extends RElement>(selectors: string): T;
    getElementById(id: string): RElement;
    getElementsByTagName(tagName: string): RNodeList;
    getElementsByClassName(classnames: string): RNodeList;
}
