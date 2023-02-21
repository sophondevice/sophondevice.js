/** sophon base library */
import { REvent } from '@sophon/base';

class RResizeEvent extends REvent {
    static NAME = 'resize';
    constructor() {
        super(RResizeEvent.NAME, false, false);
    }
}
class RMouseEvent extends REvent {
    static NAME_RENDERER_MOUSEDOWN = 'renderermousedown';
    static NAME_RENDERER_MOUSEUP = 'renderermouseup';
    static NAME_RENDERER_MOUSEMOVE = 'renderermousemove';
    static NAME_RENDERER_MOUSECLICK = 'rendererclick';
    static NAME_RENDERER_MOUSEDBLCLICK = 'rendererdblclick';
    static NAME_RENDERER_MOUSEWHEEL = 'renderermousewheel';
    static NAME_RENDERER_DRAGENTER = 'rendererdragenter';
    static NAME_RENDERER_DRAGOVER = 'rendererdragover';
    static NAME_RENDERER_DRAGDROP = 'rendererdragdrop';
    static NAME_MOUSEDOWN = 'mousedown';
    static NAME_MOUSEUP = 'mouseup';
    static NAME_MOUSEMOVE = 'mousemove';
    static NAME_MOUSECLICK = 'click';
    static NAME_MOUSEDBLCLICK = 'dblclick';
    static NAME_MOUSEWHEEL = 'wheel';
    static NAME_MOUSEENTER = 'mouseenter';
    static NAME_MOUSELEAVE = 'mouseleave';
    static NAME_MOUSEOVER = 'mouseover';
    static NAME_MOUSEOUT = 'mouseout';
    x;
    y;
    offsetX;
    offsetY;
    button;
    buttons;
    wheelDeltaX;
    wheelDeltaY;
    ctrlKey;
    shiftKey;
    altKey;
    metaKey;
    relatedTarget;
    constructor(type, x, y, offsetX, offsetY, button, buttons, wheelDeltaX, wheelDeltaY, ctrlKey, shiftKey, altKey, metaKey) {
        super(type, type !== RMouseEvent.NAME_MOUSEENTER && type !== RMouseEvent.NAME_MOUSELEAVE, true);
        this.relatedTarget = null;
        this.init(x, y, offsetX, offsetY, button, buttons, wheelDeltaX, wheelDeltaY, ctrlKey, shiftKey, altKey, metaKey);
    }
    init(x, y, offsetX, offsetY, button, buttons, wheelDeltaX, wheelDeltaY, ctrlKey, shiftKey, altKey, metaKey) {
        this.x = x;
        this.y = y;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.button = button;
        this.buttons = buttons;
        this.wheelDeltaX = wheelDeltaX;
        this.wheelDeltaY = wheelDeltaY;
        this.ctrlKey = ctrlKey;
        this.shiftKey = shiftKey;
        this.altKey = altKey;
        this.metaKey = metaKey;
    }
}
class RDragEvent extends RMouseEvent {
    static NAME_DRAG = 'drag';
    static NAME_DRAGSTART = 'dragstart';
    static NAME_DRAGEND = 'dragend';
    static NAME_DRAGOVER = 'dragover';
    static NAME_DRAGENTER = 'dragenter';
    static NAME_DRAGLEAVE = 'dragleave';
    static NAME_DRAGDROP = 'drop';
    dataTransfer;
    constructor(type, x, y, offsetX, offsetY, button, buttons, ctrlKey, shiftKey, altKey, metaKey, dataTransfer) {
        super(type, x, y, offsetX, offsetY, button, buttons, 0, 0, ctrlKey, shiftKey, altKey, metaKey);
        this.dataTransfer = dataTransfer;
    }
}
class RKeyEvent extends REvent {
    static NAME_RENDERER_KEYDOWN = 'rendererkeydown';
    static NAME_RENDERER_KEYUP = 'rendererkeyup';
    static NAME_RENDERER_KEYPRESS = 'rendererkeypress';
    static NAME_KEYDOWN = 'keydown';
    static NAME_KEYUP = 'keyup';
    static NAME_KEYPRESS = 'keypress';
    code;
    key;
    repeat;
    ctrlKey;
    shiftKey;
    altKey;
    metaKey;
    constructor(type, code, key, repeat, ctrlKey, shiftKey, altKey, metaKey) {
        super(type, true, true);
        this.code = code;
        this.key = key;
        this.repeat = repeat;
        this.ctrlKey = ctrlKey;
        this.shiftKey = shiftKey;
        this.altKey = altKey;
        this.metaKey = metaKey;
    }
}
class RFocusEvent extends REvent {
    static NAME_FOCUS = 'focus';
    static NAME_BLUR = 'blur';
    constructor(type) {
        super(type, false, false);
    }
}
class RElementLayoutEvent extends REvent {
    static NAME = 'layout';
    constructor() {
        super(RElementLayoutEvent.NAME, false, false);
    }
}
class RElementDrawEvent extends REvent {
    static NAME = 'draw';
    constructor() {
        super(RElementDrawEvent.NAME, false, false);
    }
}
class RElementBuildContentEvent extends REvent {
    static NAME_PREBUILD = 'prebuildcontent';
    static NAME_POSTBUILD = 'postbuildcontent';
    batchList;
    constructor(type, batchList) {
        super(type, false, false);
        this.batchList = batchList;
    }
}
class RTextEvent extends REvent {
    static NAME_CONTENT_CHANGE = 'textcontentchange';
    static NAME_FONT_CHANGE = 'textfontchange';
    constructor(type) {
        super(type, false, false);
    }
}
class RValueChangeEvent extends REvent {
    static NAME = 'valuechange';
    value;
    constructor(value) {
        super(RValueChangeEvent.NAME, false, false);
        this.value = value;
    }
}
class RAttributeChangeEvent extends REvent {
    static NAME = 'attributechange';
    name;
    removed;
    constructor(name, removed) {
        super(RAttributeChangeEvent.NAME, false, false);
        this.name = name;
        this.removed = removed;
    }
}
class RTextContentChangeEvent extends REvent {
    static NAME = 'elementtextcontentchange';
    constructor() {
        super(RTextContentChangeEvent.NAME, true, true);
    }
}
class RChangeEvent extends REvent {
    static NAME = 'change';
    constructor() {
        super(RChangeEvent.NAME, true, false);
    }
}
class RDOMTreeEvent extends REvent {
    static NAME_INSERTED = 'elementinserted';
    static NAME_REMOVED = 'elementremoved';
    static NAME_FOCUSED = 'elementfocused';
    parent;
    node;
    constructor(type, parent, node) {
        super(type, type !== RDOMTreeEvent.NAME_FOCUSED, type !== RDOMTreeEvent.NAME_FOCUSED);
        this.parent = parent;
        this.node = node;
    }
}

export { RAttributeChangeEvent, RChangeEvent, RDOMTreeEvent, RDragEvent, RElementBuildContentEvent, RElementDrawEvent, RElementLayoutEvent, RFocusEvent, RKeyEvent, RMouseEvent, RResizeEvent, RTextContentChangeEvent, RTextEvent, RValueChangeEvent };
//# sourceMappingURL=events.js.map
