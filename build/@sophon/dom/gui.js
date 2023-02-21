/** sophon base library */
import { REventTarget } from '@sophon/base';
import { DISPLAY_FLEX, EDGE_LEFT, EDGE_TOP, EDGE_RIGHT, EDGE_BOTTOM, POSITION_TYPE_ABSOLUTE } from './typeflex/api.js';
import { injectGUIEvents } from './renderer.js';
import { GUIEventPathBuilder } from './types.js';
import { GlyphManager } from './glyph_manager.js';
import { ImageManager } from './image_manager.js';
import { GUIHitTestVisitor } from './hittest_visitor.js';
import { UILayout } from './layout.js';
import { RNode } from './node.js';
import { RText } from './components/text.js';
import { RDocument } from './document.js';
import { parseStyleSheet } from './style.js';
import { RMouseEvent, RKeyEvent, RDOMTreeEvent, RFocusEvent, RDragEvent } from './events.js';
import { RSelector } from './selector.js';
import { DummyElement } from './dummy_element.js';
import { RElement } from './element.js';
import { Input } from './components/input.js';
import { StyleElement } from './style_element.js';
import { RFlowElement } from './flow_element.js';
import { Button } from './components/button.js';
import { ScrollBar } from './components/scrollbar.js';
import { Option, Select } from './components/select.js';
import { Slider } from './components/slider.js';

class DrawVisitor {
    _renderer;
    _drawDragImage;
    _gui;
    constructor(gui) {
        this._gui = gui;
        this._renderer = gui.renderer;
        this._drawDragImage = false;
    }
    beginTraverse() { }
    beginTraverseNode(w) {
        const dragSession = this._gui.getDragSession();
        if (dragSession &&
            dragSession.started &&
            w === dragSession.node &&
            dragSession.dragImage.length === 0) {
            this._drawDragImage = true;
        }
    }
    endTraverseNode(w) {
        if (this._drawDragImage) {
            const dragSession = this._gui.getDragSession();
            if (dragSession && dragSession.node === w) {
                this._drawDragImage = false;
            }
        }
    }
    endTraverse() {
        const dragSession = this._gui.getDragSession();
        if (dragSession && dragSession.started) {
            const offsetX = this._gui.mouseX - dragSession.startX;
            const offsetY = this._gui.mouseY - dragSession.startY;
            for (const batchList of dragSession.dragImage) {
                const x = batchList.x;
                const y = batchList.y;
                batchList.x += offsetX;
                batchList.y += offsetY;
                this._gui._drawBatchList(batchList);
                batchList.x = x;
                batchList.y = y;
            }
        }
    }
    visitNode(w) {
        w.draw(this._renderer);
        if (this._drawDragImage) {
            this._gui.getDragSession().dragImage.push(w.batchList.clone({
                colorTransformFunc: (c) => {
                    return { r: c.r, g: c.g, b: c.b, a: c.a * 0.5 };
                },
            }));
        }
    }
}
class ElementRegistry {
    _constructors;
    constructor(tags) {
        this._constructors = {};
        if (tags) {
            for (const tag in tags) {
                this.register(tags[tag], tag);
            }
        }
    }
    register(ctor, tagName) {
        console.assert(!!ctor, 'Failed to register element type with null constructor');
        console.assert(!!tagName, 'Failed to register element type with null tag name getter');
        if (typeof tagName === 'string') {
            console.assert(!this._constructors[tagName], 'Failed to register element type: tagname already registered');
            this._constructors[tagName] = ctor;
        }
    }
    createElement(gui, tagName) {
        const ctor = this._constructors[tagName] || this._constructors['div'];
        const el = new ctor(gui);
        el._setTagName(tagName);
        return el;
    }
}
const elementRegistry = new ElementRegistry({
    link: DummyElement,
    head: DummyElement,
    meta: DummyElement,
    div: RElement,
    html: RFlowElement,
    body: RFlowElement,
    style: StyleElement,
    button: Button,
    input: Input,
    scrollbar: ScrollBar,
    option: Option,
    select: Select,
    slider: Slider,
});
const deviceMouseEvents = {
    [RMouseEvent.NAME_RENDERER_MOUSEDOWN]: RMouseEvent.NAME_MOUSEDOWN,
    [RMouseEvent.NAME_RENDERER_MOUSEUP]: RMouseEvent.NAME_MOUSEUP,
    [RMouseEvent.NAME_RENDERER_MOUSEMOVE]: RMouseEvent.NAME_MOUSEMOVE,
    [RMouseEvent.NAME_RENDERER_MOUSECLICK]: RMouseEvent.NAME_MOUSECLICK,
    [RMouseEvent.NAME_RENDERER_MOUSEDBLCLICK]: RMouseEvent.NAME_MOUSEDBLCLICK,
    [RMouseEvent.NAME_RENDERER_MOUSEWHEEL]: RMouseEvent.NAME_MOUSEWHEEL,
};
const deviceKeyEvents = {
    [RKeyEvent.NAME_RENDERER_KEYDOWN]: RKeyEvent.NAME_KEYDOWN,
    [RKeyEvent.NAME_RENDERER_KEYUP]: RKeyEvent.NAME_KEYUP,
    [RKeyEvent.NAME_RENDERER_KEYPRESS]: RKeyEvent.NAME_KEYPRESS,
};
const DRAG_DISTANCE = 4;
const DRAGOVER_INTERVAL = 100;
class DragSession {
    node;
    overNode;
    startX;
    startY;
    dataTransfer;
    timer;
    started;
    cachedDragOverEvent;
    dragImage;
    gui;
    constructor(gui, node, x, y) {
        this.node = node;
        this.overNode = null;
        this.startX = x;
        this.startY = y;
        this.dataTransfer = null;
        this.timer = null;
        this.started = false;
        this.cachedDragOverEvent = null;
        this.dragImage = null;
        this.gui = gui;
    }
    update() {
        if ((!this.started && Math.abs(this.gui.mouseX - this.startX) >= DRAG_DISTANCE) ||
            Math.abs(this.gui.mouseY - this.startY) >= DRAG_DISTANCE) {
            if (!this.start(this.gui.mouseX, this.gui.mouseY, new DataTransfer())) {
                return false;
            }
        }
        if (this.started) {
            const hover = this.gui.getHover();
            if (hover.element !== this.overNode) {
                if (this.overNode) {
                    const p = this.overNode.toAbsolute();
                    if (!this.overNode.isElement() || this.overNode.style.pointerEvents !== 'none') {
                        this.overNode.dispatchEvent(new RDragEvent(RDragEvent.NAME_DRAGLEAVE, this.gui.mouseX, this.gui.mouseY, this.gui.mouseX - p.x, this.gui.mouseY - p.y, 0, this.gui.mouseButtonState, this.gui.ctrlKey, this.gui.shiftKey, this.gui.altKey, this.gui.metaKey, this.dataTransfer));
                    }
                }
                hover.element.dispatchEvent(new RDragEvent(RDragEvent.NAME_DRAGENTER, this.gui.mouseX, this.gui.mouseY, hover.x, hover.y, 0, this.gui.mouseButtonState, this.gui.ctrlKey, this.gui.shiftKey, this.gui.altKey, this.gui.metaKey, this.dataTransfer));
                this.overNode = hover.element;
            }
        }
        return true;
    }
    start(x, y, dataTransfer) {
        if (!this.started) {
            if (this.node && (!this.node.isElement() || this.node.style.pointerEvents !== 'none')) {
                const absPos = this.node.toAbsolute();
                const dragStartEvent = new RDragEvent(RDragEvent.NAME_DRAGSTART, x, y, x - absPos.x, y - absPos.y, 0, this.gui.mouseButtonState, this.gui.ctrlKey, this.gui.shiftKey, this.gui.altKey, this.gui.metaKey, dataTransfer);
                this.node.dispatchEvent(dragStartEvent);
                if (dragStartEvent.defaultPrevented) {
                    return false;
                }
            }
            this.startX = x;
            this.startY = y;
            this.dataTransfer = dataTransfer;
            this.started = true;
            this.dragImage = [];
            this.cachedDragOverEvent = new RDragEvent(RDragEvent.NAME_DRAGOVER, 0, 0, 0, 0, 0, 0, false, false, false, false, null);
            this.timer = window.setInterval(() => {
                const hover = this.gui.getHover();
                if (hover) {
                    this.cachedDragOverEvent.init(x, y, hover.x, hover.y, 0, this.gui.mouseButtonState, 0, 0, this.gui.ctrlKey, this.gui.shiftKey, this.gui.altKey, this.gui.metaKey);
                    this.cachedDragOverEvent.dataTransfer = this.dataTransfer;
                    hover.element.dispatchEvent(this.cachedDragOverEvent);
                }
            }, DRAGOVER_INTERVAL);
        }
        return true;
    }
    end(drop) {
        if (this.started) {
            if (drop) {
                const hover = this.gui.getHover();
                if (hover) {
                    hover.element.dispatchEvent(new RDragEvent(RDragEvent.NAME_DRAGDROP, this.gui.mouseX, this.gui.mouseY, hover.x, hover.y, 0, this.gui.mouseButtonState, this.gui.ctrlKey, this.gui.shiftKey, this.gui.altKey, this.gui.metaKey, this.dataTransfer));
                }
            }
            if (this.node && (!this.node.isElement() || this.node.style.pointerEvents !== 'none')) {
                const absPos = this.node.toAbsolute();
                this.node.dispatchEvent(new RDragEvent(RDragEvent.NAME_DRAGEND, this.gui.mouseX, this.gui.mouseY, this.gui.mouseX - absPos.x, this.gui.mouseY - absPos.y, 0, this.gui.mouseButtonState, this.gui.ctrlKey, this.gui.shiftKey, this.gui.altKey, this.gui.metaKey, this.dataTransfer));
            }
            this.started = false;
            this.dataTransfer = null;
            this.dragImage = null;
            this.cachedDragOverEvent = null;
            window.clearInterval(this.timer);
            this.timer = null;
        }
    }
}
class GUI extends REventTarget {
    _renderer;
    _imageManager;
    _glyphManager;
    _document;
    _focusElement;
    _activeElement;
    _captureElement;
    _layoutDirty;
    _updatingLayout;
    _topLayout;
    _hoverElements;
    _bounds;
    _rendererWidth;
    _rendererHeight;
    _styleRefreshList;
    _styleFullRefresh;
    _ruleListImported;
    _guiLoading;
    _styleUpdating;
    _domTag;
    _baseURI;
    _drawVisitor;
    _dragSession;
    _mouseX;
    _mouseY;
    _buttonState;
    _ctrlKey;
    _shiftKey;
    _altKey;
    _metaKey;
    _styleElements;
    _assetManager;
    constructor(renderer, bounds) {
        super(new GUIEventPathBuilder());
        this._renderer = renderer;
        this._drawVisitor = new DrawVisitor(this);
        this._imageManager = new ImageManager(this._renderer);
        this._glyphManager = new GlyphManager(this._renderer);
        this._assetManager = this._renderer.device.createAssetManager();
        this._document = null;
        this._focusElement = null;
        this._activeElement = null;
        this._captureElement = null;
        this._hoverElements = [];
        this._layoutDirty = false;
        this._updatingLayout = false;
        this._bounds = bounds ? { ...bounds } : null;
        this._styleRefreshList = [];
        this._styleFullRefresh = false;
        this._ruleListImported = [];
        this._guiLoading = false;
        this._styleUpdating = false;
        this._domTag = 0;
        this._baseURI = '';
        this._dragSession = null;
        this._mouseX = 0;
        this._mouseY = 0;
        this._buttonState = 0;
        this._ctrlKey = false;
        this._shiftKey = false;
        this._altKey = false;
        this._metaKey = false;
        this._styleElements = [];
        this._topLayout = new UILayout(null);
        this._rendererWidth = this._renderer.getDrawingBufferWidth();
        this._rendererHeight = this._renderer.getDrawingBufferHeight();
        this._topLayout.node.setDisplay(DISPLAY_FLEX);
        this._topLayout.node.setPadding(EDGE_LEFT, 0);
        this._topLayout.node.setPadding(EDGE_TOP, 0);
        this._topLayout.node.setPadding(EDGE_RIGHT, 0);
        this._topLayout.node.setPadding(EDGE_BOTTOM, 0);
        this._topLayout.node.setPositionType(POSITION_TYPE_ABSOLUTE);
        this._topLayout.node.setPosition(EDGE_LEFT, this._bounds ? this._bounds.x : 0);
        this._topLayout.node.setPosition(EDGE_TOP, this._bounds ? this._bounds.y : 0);
        this._topLayout.node.setWidth(this._bounds ? this._bounds.width : this._rendererWidth);
        this._topLayout.node.setHeight(this._bounds ? this._bounds.height : this._rendererHeight);
        this._renderer.device?.addEventListener('device_restored', () => {
            this._invalidateTextContents();
        });
        this.addDefaultEventListener(RMouseEvent.NAME_RENDERER_DRAGENTER, function (e) {
            const dragEvent = e;
            this._syncMouseStates(dragEvent);
            this._updateMouseLocation(dragEvent.x, dragEvent.y, dragEvent.button);
            if (!this._dragSession) {
                this._dragSession = new DragSession(this, null, dragEvent.x, dragEvent.y);
                this._dragSession.start(dragEvent.x, dragEvent.y, dragEvent.dataTransfer);
                this._dragSession.update();
            }
        });
        this.addDefaultEventListener(RMouseEvent.NAME_RENDERER_DRAGOVER, function (e) {
            const dragEvent = e;
            this._syncMouseStates(dragEvent);
            this._updateMouseLocation(dragEvent.x, dragEvent.y, dragEvent.button);
            if (this._dragSession) {
                this._dragSession.dataTransfer = dragEvent.dataTransfer;
                this._dragSession.update();
            }
        });
        this.addDefaultEventListener(RMouseEvent.NAME_RENDERER_DRAGDROP, function (e) {
            const dragEvent = e;
            this._syncMouseStates(dragEvent);
            this._updateMouseLocation(dragEvent.x, dragEvent.y, dragEvent.button);
            if (this._dragSession) {
                this._dragSession.dataTransfer = dragEvent.dataTransfer;
                this._dragSession.end(true);
                this._dragSession = null;
            }
        });
        for (const evt in deviceMouseEvents) {
            this.addDefaultEventListener(evt, function (e) {
                const mouseEvent = e;
                this._syncMouseStates(mouseEvent);
                let click = false;
                let dragend = false;
                let drop = false;
                if (evt === RMouseEvent.NAME_RENDERER_MOUSEMOVE) {
                    this._updateMouseLocation(mouseEvent.x, mouseEvent.y, mouseEvent.button);
                }
                let info = null;
                for (const el of this._hoverElements) {
                    if (!el.element.isElement() ||
                        el.element.style.pointerEvents !== 'none') {
                        info = el;
                        break;
                    }
                }
                if (evt === RMouseEvent.NAME_RENDERER_MOUSEDOWN) {
                    if (info && mouseEvent.button === 0) {
                        if (this._dragSession) {
                            this._dragSession.end(false);
                            this._dragSession = null;
                        }
                        this._activeElement = info.element;
                        this._activeElement._onMouseDown(info.x, info.y);
                        this.setFocus(info.element);
                        if (this._activeElement.isElement() &&
                            this._activeElement.getAttribute('draggable') === 'true') {
                            this._dragSession = new DragSession(this, this._activeElement, mouseEvent.x, mouseEvent.y);
                        }
                    }
                }
                else if (evt === RMouseEvent.NAME_RENDERER_MOUSEUP) {
                    if (info && mouseEvent.button === 0) {
                        if (!this._dragSession || !this._dragSession.started) {
                            info.element._onMouseUp(info.x, info.y);
                            if (info.element === this._activeElement) {
                                click = true;
                            }
                        }
                        dragend = true;
                        drop = true;
                        this._activeElement = null;
                    }
                }
                if (dragend && this._dragSession) {
                    this._dragSession.end(drop);
                    this._dragSession = null;
                    this._updateMouseLocation(mouseEvent.x, mouseEvent.y, mouseEvent.button);
                }
                if (!this._dragSession || !this._dragSession.started) {
                    const me = new RMouseEvent(deviceMouseEvents[evt], mouseEvent.x, mouseEvent.y, info ? info.x : mouseEvent.x, info ? info.y : mouseEvent.y, mouseEvent.button, mouseEvent.buttons, mouseEvent.wheelDeltaX, mouseEvent.wheelDeltaY, mouseEvent.ctrlKey, mouseEvent.shiftKey, mouseEvent.altKey, mouseEvent.metaKey);
                    (info ? info.element : this.document).dispatchEvent(me);
                    if (click) {
                        const ce = new RMouseEvent(RMouseEvent.NAME_MOUSECLICK, mouseEvent.x, mouseEvent.y, info ? info.x : mouseEvent.x, info ? info.y : mouseEvent.y, mouseEvent.button, mouseEvent.buttons, mouseEvent.wheelDeltaX, mouseEvent.wheelDeltaY, mouseEvent.ctrlKey, mouseEvent.shiftKey, mouseEvent.altKey, mouseEvent.metaKey);
                        (info ? info.element : this.document).dispatchEvent(ce);
                    }
                }
            });
        }
        for (const evt in deviceKeyEvents) {
            this.addDefaultEventListener(evt, function (e) {
                const keyEvent = e;
                this._ctrlKey = keyEvent.ctrlKey;
                this._shiftKey = keyEvent.shiftKey;
                this._altKey = keyEvent.altKey;
                this._metaKey = keyEvent.metaKey;
                if (this._focusElement) {
                    this._focusElement.dispatchEvent(new RKeyEvent(deviceKeyEvents[evt], keyEvent.code, keyEvent.key, keyEvent.repeat, keyEvent.ctrlKey, keyEvent.shiftKey, keyEvent.altKey, keyEvent.metaKey));
                }
            });
        }
        const domChangeFunc = function (e) {
            const data = e;
            this._domTag++;
            if (data.node.isElement()) {
                const el = data.node;
                const numChildren = el.children.length;
                let styleChanged = false;
                if (e.type === RDOMTreeEvent.NAME_INSERTED) {
                    if (el.isConnected) {
                        if (el.tagName === 'style') {
                            this._styleElements.push(el);
                            styleChanged = true;
                        }
                        if (el._isText()) {
                            el._invalidateContent();
                        }
                        if (numChildren > 0) {
                            const styles = el.querySelectorAll('style');
                            styles.forEach((styleEl) => {
                                this._styleElements.push(styleEl);
                                styleChanged = true;
                            });
                        }
                    }
                }
                else if (e.type === RDOMTreeEvent.NAME_REMOVED) {
                    if (data.parent.isConnected) {
                        if (el.tagName === 'style') {
                            const index = this._styleElements.indexOf(el);
                            console.assert(index >= 0, 'Style element not found');
                            this._styleElements.splice(index, 1);
                            styleChanged = true;
                        }
                        if (numChildren > 0) {
                            const styles = el.querySelectorAll('style');
                            styles.forEach((styleEl) => {
                                const index = this._styleElements.indexOf(styleEl);
                                console.assert(index >= 0, 'Style element not found');
                                this._styleElements.splice(index, 1);
                                styleChanged = true;
                            });
                        }
                    }
                }
                if (styleChanged) {
                    this.requireFullStyleRefresh();
                }
                else {
                    this._markStyleRefreshForElement(data.parent || el);
                }
                if (!this._guiLoading &&
                    (el.tagName === 'link' || (numChildren > 0 && el.querySelector('link')))) {
                    const linkElements = [...(el.tagName === 'link' ? [el] : []), ...el.querySelectorAll('link').values()];
                    linkElements.forEach(linkEl => {
                        this._importLinkContent(linkEl);
                    });
                }
            }
        };
        this.addDefaultEventListener(RDOMTreeEvent.NAME_INSERTED, domChangeFunc);
        this.addDefaultEventListener(RDOMTreeEvent.NAME_REMOVED, domChangeFunc);
        injectGUIEvents(this, this._renderer);
        this._document = new RDocument(this);
        this._topLayout.appendChild(this._document._getLayout());
        const root = this._document.createElement('html');
        root.append(this._document.createElement('head'));
        root.append(this._document.createElement('body'));
        this._document.append(root);
        this._hoverElements.push({ element: this._document, x: 0, y: 0 });
        this.invalidateLayout();
        this.requireFullStyleRefresh();
    }
    get renderer() {
        return this._renderer;
    }
    get bounds() {
        return this._bounds;
    }
    set bounds(rect) {
        this._bounds = rect ? { ...rect } : null;
        this._topLayout.node.setPosition(EDGE_LEFT, this._bounds ? this._bounds.x : 0);
        this._topLayout.node.setPosition(EDGE_TOP, this._bounds ? this._bounds.y : 0);
        this._topLayout.node.setWidth(this._bounds ? this._bounds.width : this._renderer.getDrawingBufferWidth());
        this._topLayout.node.setHeight(this._bounds ? this._bounds.height : this._renderer.getDrawingBufferHeight());
        this.invalidateLayout();
    }
    get baseURI() {
        return this._baseURI;
    }
    set baseURI(val) {
        this._baseURI = val || '';
    }
    get document() {
        return this._document;
    }
    get imageManager() {
        return this._imageManager;
    }
    get mouseX() {
        return this._mouseX;
    }
    get mouseY() {
        return this._mouseY;
    }
    get mouseButtonState() {
        return this._buttonState;
    }
    get ctrlKey() {
        return this._ctrlKey;
    }
    get shiftKey() {
        return this._shiftKey;
    }
    get altKey() {
        return this._altKey;
    }
    get metaKey() {
        return this._metaKey;
    }
    getDragSession() {
        return this._dragSession || null;
    }
    getHover() {
        for (const info of this._hoverElements) {
            if (!info.element.isElement() || info.element.style.pointerEvents !== 'none') {
                return info;
            }
        }
        return null;
    }
    getFocus() {
        return this._focusElement;
    }
    setFocus(node) {
        node = node || null;
        if (node !== this._focusElement) {
            if (this._focusElement) {
                const focusElement = this._focusElement;
                setTimeout(() => {
                    focusElement.dispatchEvent(new RFocusEvent(RFocusEvent.NAME_BLUR));
                }, 0);
            }
            if (node) {
                setTimeout(() => {
                    node.dispatchEvent(new RFocusEvent(RFocusEvent.NAME_FOCUS));
                }, 0);
            }
            this._focusElement = node;
            this.dispatchEvent(new RDOMTreeEvent(RDOMTreeEvent.NAME_FOCUSED, null, node));
        }
    }
    getCapture() {
        return this._captureElement;
    }
    setCapture(node) {
        this._captureElement = node || null;
    }
    dispose() {
        this._imageManager?.dispose();
        this._imageManager = null;
    }
    invalidateLayout() {
        this._layoutDirty = true;
    }
    requireFullStyleRefresh() {
        if (!this._styleUpdating) {
            this._styleFullRefresh = true;
        }
    }
    get domTag() {
        return this._domTag;
    }
    checkSize() {
        if (!this._bounds) {
            const width = this._renderer.getDrawingBufferWidth();
            const height = this._renderer.getDrawingBufferHeight();
            if (this._rendererWidth !== width || this._rendererHeight !== height) {
                this._rendererWidth = width;
                this._rendererHeight = height;
                this._topLayout.node.setWidth(this._rendererWidth);
                this._topLayout.node.setHeight(this._rendererHeight);
                this.invalidateLayout();
                setTimeout(() => {
                    const inputs = this.document.querySelectorAll('input');
                    for (const input of inputs.values()) {
                        input._updateHiddenInput();
                    }
                }, 0);
            }
        }
    }
    checkAndRefreshStyle() {
        if (this._document) {
            if (this._styleFullRefresh) {
                this._styleRefreshList.splice(0, this._styleRefreshList.length, this._document);
            }
            else {
                const validElements = [];
                for (const e of this._styleRefreshList) {
                    if (e.nodeType === RNode.ELEMENT_NODE &&
                        e.tagName !== 'style' &&
                        e._isSucceedingOf(this._document)) {
                        validElements.push(e);
                    }
                }
                this._styleRefreshList = validElements;
            }
            if (this._styleRefreshList.length > 0) {
                this._styleUpdating = true;
                const styleElements = this._styleElements;
                const processedElements = new Set();
                const ruleList = [...this._ruleListImported];
                for (const el of styleElements) {
                    for (const def of el.definitions) {
                        for (const rule of def.selector.rules()) {
                            ruleList.push({
                                rule: rule,
                                stylesheet: def.stylesheet,
                                extra: def.extra,
                            });
                        }
                    }
                }
                let allElements = null;
                const pseudoMap = new Map();
                if (this._styleFullRefresh) {
                    allElements = this._querySelectorAll(this._document, '*', true, true);
                }
                if (ruleList.length > 0) {
                    if (this._styleRefreshList.indexOf(this._document) >= 0) {
                        this._styleRefreshList.splice(0, this._styleRefreshList.length, this._document);
                    }
                    ruleList.sort((a, b) => {
                        return a.rule.specificity - b.rule.specificity;
                    });
                    for (const rule of ruleList) {
                        rule.rule.resolve(this._styleRefreshList, true, true, (node, type) => {
                            const pseudoTypes = pseudoMap.get(node) || new Map();
                            pseudoMap.set(node, pseudoTypes);
                            const styleList = pseudoTypes.get(type) || [];
                            pseudoTypes.set(type, styleList);
                            styleList.push({
                                stylesheet: rule.stylesheet,
                                extra: rule.extra,
                            });
                        });
                        for (const e of rule.rule.targets) {
                            if (e.nodeType !== RNode.DOCUMENT_NODE) {
                                if (!processedElements.has(e)) {
                                    e._resetStyle();
                                    processedElements.add(e);
                                }
                                e.style.applyStyleSheet(rule.stylesheet, false);
                            }
                            e._updatePseudoElementStyles(pseudoMap.get(e));
                        }
                        if (!this._styleFullRefresh) {
                            for (const e of pseudoMap) {
                                e[0]._updatePseudoElementStyles(e[1]);
                            }
                            pseudoMap.clear();
                        }
                    }
                    processedElements.forEach((e) => {
                        e._applyInlineStyles();
                    });
                }
                if (this._styleFullRefresh) {
                    for (const e of allElements) {
                        if (!processedElements.has(e)) {
                            e._resetStyle();
                            e._applyInlineStyles();
                        }
                        e._updatePseudoElementStyles(pseudoMap.get(e));
                    }
                }
                else {
                    for (const e of this._styleRefreshList) {
                        if (!processedElements.has(e)) {
                            e._resetStyle();
                            e._applyInlineStyles();
                        }
                    }
                }
                this._styleUpdating = false;
            }
        }
        this._styleRefreshList.splice(0, this._styleRefreshList.length);
        this._styleFullRefresh = false;
    }
    updateLayout() {
        if (this._layoutDirty) {
            if (this._updatingLayout) {
                console.warn('updateLayout called recursively');
            }
            else {
                this._layoutDirty = false;
                this._updatingLayout = true;
                this._topLayout.calcLayout();
                if (this._document) {
                    this._document._syncLayout();
                }
                this._updatingLayout = false;
            }
        }
    }
    hitTest(x, y) {
        this.updateLayout();
        const v = new GUIHitTestVisitor(x, y);
        this._document.traverse(v, true, true);
        let hits = v.getHits();
        if (hits.length > 0) {
            const topmost = hits[0].element;
            hits = hits.filter((val) => val.element.contains(topmost));
        }
        return hits;
    }
    render() {
        this.checkSize();
        this.checkAndRefreshStyle();
        this.updateLayout();
        this._renderer.beginRender();
        this._drawVisitor.beginTraverse();
        this.document.traverse(this._drawVisitor, false, true);
        this._drawVisitor.endTraverse();
        this._renderer.endRender();
    }
    serializeToXML() {
        return this._serializeToXML();
    }
    async deserializeFromXML(xml) {
        this._guiLoading = true;
        while (this._document.firstChild) {
            this._document.removeChild(this._document.firstChild);
        }
        const parser = new DOMParser();
        const dom = parser.parseFromString(xml, 'text/html');
        if (dom.getElementsByTagName('parsererror').length > 0) {
            return null;
        }
        const docElement = dom.documentElement;
        this._document.append(this._deserializeElement(docElement));
        const linkElements = this._document.querySelectorAll('link');
        for (const link of linkElements.values()) {
            await this._importLinkContent(link);
        }
        this._guiLoading = false;
    }
    async deserializeFromURL(url) {
        this._guiLoading = true;
        const content = await this._assetManager.fetchTextData(url);
        if (content) {
            const normalizedURL = this._assetManager.resolveURL(url);
            const index = normalizedURL.lastIndexOf('/');
            this._baseURI = normalizedURL.substring(0, index + 1);
            await this.deserializeFromXML(content);
        }
        this._guiLoading = false;
    }
    createElement(tagName) {
        const el = elementRegistry.createElement(this, tagName);
        el._init();
        return el;
    }
    createTextNode() {
        return new RText(this);
    }
    loadCSS(content) {
        if (content) {
            const entries = this._parseStyleContent(content);
            for (const def of entries) {
                for (const rule of def.selector.rules()) {
                    this._ruleListImported.push({
                        rule: rule,
                        stylesheet: def.stylesheet,
                        extra: def.extra,
                    });
                }
            }
        }
        this.requireFullStyleRefresh();
    }
    async loadCSSFromURL(url) {
        const content = await this._assetManager.fetchTextData(this._baseURI + url);
        this.loadCSS(content);
    }
    _invalidateTextContents(root) {
        root = root || this.document;
        if (root._isText()) {
            root._invalidateContent();
            for (let child = root.firstChild; child; child = child.nextSibling) {
                this._invalidateTextContents(child);
            }
        }
    }
    _drawBatchList(batches) {
        for (let i = 0; i < batches.length; i++) {
            const batch = batches.getBatch(i);
            const vertices = batches.getVertices(i);
            const color = batch.color;
            if (color.a > 0 && vertices) {
                this._renderer.drawQuads(vertices, batch.texture || null);
            }
        }
    }
    _getGlyphTexture(index) {
        return this._glyphManager.getGlyphTexture(index);
    }
    _getGlyphInfo(char, font, color) {
        return this._glyphManager.getGlyphInfo(char, font, color);
    }
    _getCharWidth(char, font) {
        return this._glyphManager.getCharWidth(char, font);
    }
    _measureStringWidth(str, charMargin, font) {
        return this._glyphManager.measureStringWidth(str, charMargin, font);
    }
    _clipStringToWidth(str, width, charMargin, start, font) {
        return this._glyphManager.clipStringToWidth(str, width, charMargin, start, font);
    }
    _querySelectorAll(root, selectors, excludeRoot, allowInternal) {
        return new RSelector(selectors).resolve(root, excludeRoot, allowInternal);
    }
    _querySelectorOne(root, selectors, excludeRoot, allowInternal) {
        return this._querySelectorAll(root, selectors, excludeRoot, allowInternal)[0] || null;
    }
    _getTopLayout() {
        return this._topLayout;
    }
    _getElementById(root, id) {
        if (root.nodeType === RNode.ELEMENT_NODE && root.id === id) {
            return root;
        }
        for (const child of root.childNodes.values()) {
            const e = this._getElementById(child, id);
            if (e) {
                return e;
            }
        }
        return null;
    }
    _getElementsByTagName(root, tagName, results) {
        if (root.nodeType === RNode.ELEMENT_NODE && root.tagName === tagName) {
            results.push(root);
        }
        for (const child of root.childNodes.values()) {
            this._getElementsByTagName(child, tagName, results);
        }
        return null;
    }
    _getElementsByClassName(root, classnames, results) {
        if (root.nodeType === RNode.ELEMENT_NODE) {
            let matched = true;
            const el = root;
            for (const classname of classnames) {
                if (!el.classList.contains(classname)) {
                    matched = false;
                    break;
                }
            }
            if (matched) {
                results.push(el);
            }
        }
        for (const child of root.childNodes.values()) {
            this._getElementsByClassName(child, classnames, results);
        }
        return null;
    }
    _markStyleRefreshForElement(element) {
        if (!this._styleUpdating && element && this._styleRefreshList.indexOf(element) < 0) {
            this._styleRefreshList.push(element);
        }
    }
    _parseStyleContent(content) {
        const result = [];
        content = content
            .split(/[\r\n]+/)
            .join('')
            .replace(/\/\*[\s\S]*?\*\//g, '');
        for (;;) {
            const lbracket = content.indexOf('{');
            const rbracket = content.indexOf('}');
            if (lbracket < 0 || rbracket < 0 || lbracket > rbracket) {
                break;
            }
            const sel = content.substring(0, lbracket).trim();
            const styles = content.substring(lbracket + 1, rbracket);
            content = content.substr(rbracket + 1);
            const selector = new RSelector(sel);
            if (selector.rules().length === 0) {
                continue;
            }
            const extra = {};
            const stylesheet = parseStyleSheet(styles, extra);
            if (!stylesheet) {
                continue;
            }
            result.push({ selector, stylesheet, extra });
        }
        return result;
    }
    _deserializeElement(el) {
        const element = this.createElement(el.tagName.toLowerCase());
        for (const attr of el.attributes) {
            element.setAttribute(attr.name, attr.value);
        }
        for (const className of el.classList) {
            element.classList.add(className);
        }
        for (const child of el.childNodes) {
            if (child.nodeType === Node.TEXT_NODE) {
                const text = child.textContent.trim().replace(/\s+/, ' ');
                if (text !== '') {
                    element.append(text);
                }
            }
            else if (child.nodeType === Node.ELEMENT_NODE) {
                element.append(this._deserializeElement(child));
            }
        }
        return element;
    }
    async _importLinkContent(link) {
        const rel = link.getAttribute('rel');
        switch (rel) {
            case 'stylesheet': {
                await this.loadCSSFromURL(link.getAttribute('href'));
                break;
            }
            default: {
                throw new Error(`Invalid rel attribute for link: ${rel}`);
            }
        }
    }
    _serializeToXML() {
        const doc = document.implementation.createDocument(null, 'node', null);
        doc.firstChild.remove();
        if (this.document.documentElement) {
            doc.append(this._createDOMElement(this.document.documentElement, doc, null));
            this._buildDOM(this.document.documentElement, doc, doc.documentElement);
        }
        return new XMLSerializer().serializeToString(doc);
    }
    _buildDOM(root, doc, parent) {
        for (const child of root.childNodes.values()) {
            if (!child._isInternal()) {
                const childElement = this._createDOMElement(child, doc, null);
                parent.append(childElement);
                if (childElement instanceof Element) {
                    this._buildDOM(child, doc, childElement);
                }
            }
        }
    }
    _createDOMElement(el, doc, out) {
        if (el._isText()) {
            out = doc.createTextNode(el.textContent);
        }
        else if (el.nodeType === RNode.ELEMENT_NODE) {
            out = out || doc.createElement(el.tagName);
            if (el.className) {
                out.className = el.className;
            }
            for (const k of el.attributes) {
                out.setAttribute(k.name, k.value);
            }
        }
        return out;
    }
    _syncMouseStates(evt) {
        this._mouseX = evt.x;
        this._mouseY = evt.y;
        this._buttonState = evt.buttons;
        this._ctrlKey = evt.ctrlKey;
        this._shiftKey = evt.shiftKey;
        this._altKey = evt.altKey;
        this._metaKey = evt.metaKey;
    }
    _updateMouseLocation(x, y, button) {
        let hits = null;
        if (this._captureElement) {
            const v = this._captureElement.toAbsolute({ x: 0, y: 0 });
            hits = [{ element: this._captureElement, x: x - v.x, y: y - v.y }];
        }
        else {
            hits = this.hitTest(x, y);
        }
        if (!this._dragSession) {
            for (const info of this._hoverElements) {
                if (!hits.find((hit) => hit.element === info.element)) {
                    const p = info.element.toAbsolute({ x: 0, y: 0 });
                    info.element._onMouseLeave(x - p.x, y - p.y);
                    if (!info.element.isElement() || info.element.style.pointerEvents !== 'none') {
                        info.element.dispatchEvent(new RMouseEvent(RMouseEvent.NAME_MOUSELEAVE, x, y, x - p.x, y - p.y, button, this._buttonState, 0, 0, this._ctrlKey, this._shiftKey, this._altKey, this._metaKey));
                    }
                }
            }
            for (const info of hits) {
                if (!this._hoverElements.find((hit) => hit.element === info.element)) {
                    info.element._onMouseEnter(info.x, info.y);
                    if (!info.element.isElement() || info.element.style.pointerEvents !== 'none') {
                        info.element.dispatchEvent(new RMouseEvent(RMouseEvent.NAME_MOUSEENTER, x, y, info.x, info.y, button, this._buttonState, 0, 0, this._ctrlKey, this._shiftKey, this._altKey, this._metaKey));
                    }
                }
            }
            const lastHover = this.getHover();
            let newHover = null;
            for (const hit of hits) {
                if (!hit.element.isElement() || hit.element.style.pointerEvents !== 'none') {
                    newHover = hit;
                    break;
                }
            }
            if (lastHover.element !== newHover.element) {
                const p = lastHover.element.toAbsolute({ x: 0, y: 0 });
                lastHover.element._onMouseOut(x - p.x, y - p.y);
                const evtOut = new RMouseEvent(RMouseEvent.NAME_MOUSEOUT, x, y, x - p.x, y - p.y, button, this._buttonState, 0, 0, this._ctrlKey, this._shiftKey, this._altKey, this._metaKey);
                evtOut.relatedTarget = newHover.element;
                lastHover.element.dispatchEvent(evtOut);
                newHover.element._onMouseIn(newHover.x, newHover.y);
                const evtOver = new RMouseEvent(RMouseEvent.NAME_MOUSEOVER, x, y, newHover.x, newHover.y, button, this._buttonState, 0, 0, this._ctrlKey, this._shiftKey, this._altKey, this._metaKey);
                evtOver.relatedTarget = lastHover.element;
                newHover.element.dispatchEvent(evtOver);
            }
        }
        this._hoverElements = hits;
        if (this._dragSession) {
            if (!this._dragSession.update()) {
                this._dragSession = null;
            }
        }
    }
}

export { ElementRegistry, GUI };
//# sourceMappingURL=gui.js.map
