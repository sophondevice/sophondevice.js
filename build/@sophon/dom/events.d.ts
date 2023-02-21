import { REvent } from '@sophon/base';
import type { RNode } from './node';
import type { RPrimitiveBatchList } from './primitive';
export declare class RResizeEvent extends REvent {
    static readonly NAME = "resize";
    constructor();
}
export declare class RMouseEvent extends REvent {
    static readonly NAME_RENDERER_MOUSEDOWN = "renderermousedown";
    static readonly NAME_RENDERER_MOUSEUP = "renderermouseup";
    static readonly NAME_RENDERER_MOUSEMOVE = "renderermousemove";
    static readonly NAME_RENDERER_MOUSECLICK = "rendererclick";
    static readonly NAME_RENDERER_MOUSEDBLCLICK = "rendererdblclick";
    static readonly NAME_RENDERER_MOUSEWHEEL = "renderermousewheel";
    static readonly NAME_RENDERER_DRAGENTER = "rendererdragenter";
    static readonly NAME_RENDERER_DRAGOVER = "rendererdragover";
    static readonly NAME_RENDERER_DRAGDROP = "rendererdragdrop";
    static readonly NAME_MOUSEDOWN = "mousedown";
    static readonly NAME_MOUSEUP = "mouseup";
    static readonly NAME_MOUSEMOVE = "mousemove";
    static readonly NAME_MOUSECLICK = "click";
    static readonly NAME_MOUSEDBLCLICK = "dblclick";
    static readonly NAME_MOUSEWHEEL = "wheel";
    static readonly NAME_MOUSEENTER = "mouseenter";
    static readonly NAME_MOUSELEAVE = "mouseleave";
    static readonly NAME_MOUSEOVER = "mouseover";
    static readonly NAME_MOUSEOUT = "mouseout";
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
    button: number;
    buttons: number;
    wheelDeltaX: number;
    wheelDeltaY: number;
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    metaKey: boolean;
    relatedTarget: unknown;
    constructor(type: string, x: number, y: number, offsetX: number, offsetY: number, button: number, buttons: number, wheelDeltaX: number, wheelDeltaY: number, ctrlKey: boolean, shiftKey: boolean, altKey: boolean, metaKey: boolean);
    init(x: number, y: number, offsetX: number, offsetY: number, button: number, buttons: number, wheelDeltaX: number, wheelDeltaY: number, ctrlKey: boolean, shiftKey: boolean, altKey: boolean, metaKey: boolean): void;
}
export declare class RDragEvent extends RMouseEvent {
    static readonly NAME_DRAG = "drag";
    static readonly NAME_DRAGSTART = "dragstart";
    static readonly NAME_DRAGEND = "dragend";
    static readonly NAME_DRAGOVER = "dragover";
    static readonly NAME_DRAGENTER = "dragenter";
    static readonly NAME_DRAGLEAVE = "dragleave";
    static readonly NAME_DRAGDROP = "drop";
    dataTransfer: DataTransfer;
    constructor(type: string, x: number, y: number, offsetX: number, offsetY: number, button: number, buttons: number, ctrlKey: boolean, shiftKey: boolean, altKey: boolean, metaKey: boolean, dataTransfer: DataTransfer);
}
export declare class RKeyEvent extends REvent {
    static readonly NAME_RENDERER_KEYDOWN = "rendererkeydown";
    static readonly NAME_RENDERER_KEYUP = "rendererkeyup";
    static readonly NAME_RENDERER_KEYPRESS = "rendererkeypress";
    static readonly NAME_KEYDOWN = "keydown";
    static readonly NAME_KEYUP = "keyup";
    static readonly NAME_KEYPRESS = "keypress";
    code: string;
    key: string;
    repeat: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    metaKey: boolean;
    constructor(type: string, code: string, key: string, repeat: boolean, ctrlKey: boolean, shiftKey: boolean, altKey: boolean, metaKey: boolean);
}
export declare class RFocusEvent extends REvent {
    static readonly NAME_FOCUS = "focus";
    static readonly NAME_BLUR = "blur";
    constructor(type: string);
}
export declare class RElementLayoutEvent extends REvent {
    static readonly NAME = "layout";
    constructor();
}
export declare class RElementDrawEvent extends REvent {
    static readonly NAME = "draw";
    constructor();
}
export declare class RElementBuildContentEvent extends REvent {
    static readonly NAME_PREBUILD = "prebuildcontent";
    static readonly NAME_POSTBUILD = "postbuildcontent";
    batchList: RPrimitiveBatchList;
    constructor(type: string, batchList: RPrimitiveBatchList);
}
export declare class RTextEvent extends REvent {
    static readonly NAME_CONTENT_CHANGE = "textcontentchange";
    static readonly NAME_FONT_CHANGE = "textfontchange";
    constructor(type: string);
}
export declare class RValueChangeEvent extends REvent {
    static readonly NAME = "valuechange";
    value: number;
    constructor(value: number);
}
export declare class RAttributeChangeEvent extends REvent {
    static readonly NAME = "attributechange";
    name: string;
    removed: boolean;
    constructor(name: string, removed: boolean);
}
export declare class RTextContentChangeEvent extends REvent {
    static readonly NAME = "elementtextcontentchange";
    constructor();
}
export declare class RChangeEvent extends REvent {
    static readonly NAME = "change";
    constructor();
}
export declare class RDOMTreeEvent extends REvent {
    static readonly NAME_INSERTED = "elementinserted";
    static readonly NAME_REMOVED = "elementremoved";
    static readonly NAME_FOCUSED = "elementfocused";
    parent: RNode;
    node: RNode;
    constructor(type: string, parent: RNode, node: RNode);
}
