export declare class REvent {
    static readonly NONE = 0;
    static readonly CAPTURING_PHASE = 1;
    static readonly AT_TARGET = 2;
    static readonly BUBBLING_PHASE = 3;
    constructor(type: string, canBubble: boolean, cancelable: boolean);
    reset(): void;
    get bubbles(): boolean;
    cancelBubble(): void;
    get cancelable(): boolean;
    get composed(): boolean;
    get currentTarget(): REventTarget;
    get defaultPrevented(): boolean;
    get eventPhase(): number;
    get target(): REventTarget;
    get timeStamp(): number;
    get type(): string;
    get isTrusted(): boolean;
    composedPath(): REventTarget[];
    preventDefault(): void;
    stopImmediatePropagation(): void;
    stopPropagation(): void;
}
export type REventHandler<T extends REvent = REvent> = (evt: T) => void;
export type REventHandlerOptions = {
    capture?: boolean;
    once?: boolean;
    passive?: boolean;
};
export interface REventHandlerObject<T extends REvent = REvent> {
    handleEvent: REventHandler<T>;
}
export type REventListener<T extends REvent = REvent> = REventHandler<T> | REventHandlerObject<T>;
export interface REventPath {
    toArray(): REventTarget[];
}
export interface REventPathBuilder {
    build(node: REventTarget): REventPath;
}
export declare class DefaultEventPath implements REventPath {
    target: REventTarget;
    constructor(target: REventTarget);
    toArray(): REventTarget[];
}
export declare class DefaultEventPathBuilder implements REventPathBuilder {
    build(node: REventTarget): REventPath;
}
export declare class REventTarget {
    constructor(pathBuilder?: REventPathBuilder);
    addEventListener(type: string, listener: REventListener, options?: REventHandlerOptions): void;
    removeEventListener(type: string, listener: REventListener, options?: REventHandlerOptions): void;
    dispatchEvent(evt: REvent): boolean;
    addDefaultEventListener(type: string, listener: REventListener, options?: REventHandlerOptions): void;
    removeDefaultEventListener(type: string, listener: REventListener, options?: REventHandlerOptions): void;
}
