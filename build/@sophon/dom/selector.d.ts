import { RNode } from './node';
interface IPseudoElementCallback {
    (node: RNode, pseudoType: string): void;
}
export declare class Rule {
    constructor();
    resolve(roots: RNode[], up: boolean, allowInternal: boolean, pseudoElementCallback?: IPseudoElementCallback): void;
}
export declare class RSelector {
    constructor(s: string);
    resolve(root: RNode, excludeRoot: boolean, allowInternal: any): RNode[];
    multiResolve(roots: RNode[], allowInternal: any): RNode[];
    rules(): Rule[];
}
export {};
