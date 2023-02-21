export declare class ListIterator<T = unknown> {
    constructor(dl: List<T>, node: ListNodeImpl, reverse: boolean);
    valid(): boolean;
    next(): ListIterator<T>;
    getNext(): ListIterator<T>;
    prev(): ListIterator<T>;
    getPrev(): ListIterator<T>;
    get node(): ListNodeImpl;
    set node(n: ListNodeImpl);
    get reversed(): boolean;
    get list(): List<T>;
    get data(): T;
    set data(val: T);
}
export declare class List<T = unknown> {
    constructor();
    get head(): ListNodeImpl;
    get length(): number;
    clear(): void;
    append(data: T): ListIterator<T>;
    prepend(data: T): ListIterator<T>;
    removeAndAppend(it: ListIterator<T>): void;
    removeAndPrepend(it: ListIterator<T>): void;
    remove(it: ListIterator<T>): void;
    insertAt(data: T, at: ListIterator<T>): ListIterator<T>;
    forEach(callback: (data: T) => void): void;
    forEachReverse(callback: (data: T) => void): void;
    front(): T;
    back(): T;
    begin(): ListIterator<T>;
    rbegin(): ListIterator<T>;
}
declare class ListNodeImpl {
    next: ListNodeImpl;
    prev: ListNodeImpl;
    constructor();
}
export {};
