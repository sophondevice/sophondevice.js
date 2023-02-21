/** sophon base library */
import { REventTarget } from '@sophon/base';
import { GUIEventPathBuilder } from './types.js';
import { RPrimitiveBatchList, RRectPrimitive, RPolygonPrimitive } from './primitive.js';
import { RLiveNodeList } from './nodelist.js';
import { UILayout } from './layout.js';
import { ElementStyle, unescapeCSSString } from './style.js';
import { RElementDrawEvent, RElementBuildContentEvent, RDOMTreeEvent, RElementLayoutEvent, RTextContentChangeEvent, RValueChangeEvent } from './events.js';
import { NodeType } from './values.js';
import { Font } from './font.js';

const defaultCursor = 'default';
class RNode extends REventTarget {
    static PSEUDO_NONE = 0;
    static PSEUDO_BEFORE = 1;
    static PSEUDO_AFTER = 2;
    static _drawEvent = new RElementDrawEvent();
    static UNKNOWN_NODE = NodeType.UNKNOWN_NODE;
    static ELEMENT_NODE = NodeType.ELEMENT_NODE;
    static TEXT_NODE = NodeType.TEXT_NODE;
    static DOCUMENT_NODE = NodeType.DOCUMENT_NODE;
    static _defaultFontSize = '12px';
    static _defaultFontFamily = 'arial';
    _uiscene;
    _parent;
    _childNodes;
    _children;
    _childrenElements;
    _renderOrder;
    _renderOrderChanged;
    _hScroll;
    _vScroll;
    _layout;
    _layoutChangeStamp;
    _disableCounter;
    _mouseIn;
    _mouseDown;
    _state;
    _batchList;
    _numQuads;
    _contentDirty;
    _loadingTextures;
    _backgroundColor;
    _backgroundImage;
    _borderLeftColor;
    _borderTopColor;
    _borderRightColor;
    _borderBottomColor;
    _style;
    _hide;
    _internal;
    _pseudo;
    _font;
    _cachedFontSize;
    _cachedFontFamily;
    _fontColor;
    _customDraw;
    _preBuildContentEvent;
    _postBuildContentEvent;
    _insertEvent;
    _removeEvent;
    constructor(uiscene) {
        super(new GUIEventPathBuilder());
        this._uiscene = uiscene;
        this._parent = null;
        this._childNodes = [];
        this._children = new RLiveNodeList(this, RLiveNodeList.MODE_NON_INTERNAL);
        this._childrenElements = new RLiveNodeList(this, RLiveNodeList.MODE_ELEMENT_NON_INTERNAL);
        this._renderOrder = [];
        this._renderOrderChanged = false;
        this._hScroll = null;
        this._vScroll = null;
        this._loadingTextures = [];
        this._backgroundColor = ElementStyle.defaultBackgroundColor;
        this._backgroundImage = null;
        this._borderLeftColor = ElementStyle.defaultBorderColor;
        this._borderTopColor = ElementStyle.defaultBorderColor;
        this._borderRightColor = ElementStyle.defaultBorderColor;
        this._borderBottomColor = ElementStyle.defaultBorderColor;
        this._layout = new UILayout(this);
        this._style = new ElementStyle(this._layout);
        this._layoutChangeStamp = -1;
        this._disableCounter = 0;
        this._batchList = new RPrimitiveBatchList(0, 0);
        this._numQuads = 0;
        this._contentDirty = true;
        this._hide = false;
        this._internal = false;
        this._pseudo = RNode.PSEUDO_NONE;
        this._font = null;
        this._cachedFontSize = null;
        this._cachedFontFamily = null;
        this._fontColor = null;
        this._customDraw = false;
        this._preBuildContentEvent = new RElementBuildContentEvent(RElementBuildContentEvent.NAME_PREBUILD, this._batchList);
        this._postBuildContentEvent = new RElementBuildContentEvent(RElementBuildContentEvent.NAME_POSTBUILD, this._batchList);
        this._insertEvent = new RDOMTreeEvent(RDOMTreeEvent.NAME_INSERTED, null, this);
        this._removeEvent = new RDOMTreeEvent(RDOMTreeEvent.NAME_REMOVED, null, this);
        this._resetStyle();
    }
    get gui() {
        return this._uiscene;
    }
    get nodeType() {
        return RNode.UNKNOWN_NODE;
    }
    get nodeName() {
        switch (this.nodeType) {
            case RNode.ELEMENT_NODE:
                return this.tagName;
            case RNode.TEXT_NODE:
                return '#text';
            case RNode.DOCUMENT_NODE:
                return '#document';
            default:
                return '#unknown';
        }
    }
    get nodeValue() {
        switch (this.nodeType) {
            case RNode.TEXT_NODE:
                return this.textContent;
            default:
                return null;
        }
    }
    get ownerDocument() {
        return this === this._uiscene.document ? null : this._uiscene.document || null;
    }
    get isConnected() {
        return this._isSucceedingOf(this._uiscene.document);
    }
    get parentNode() {
        return this._parent;
    }
    get parentElement() {
        return this._parent && this._parent.nodeType === RNode.ELEMENT_NODE
            ? this._parent
            : null;
    }
    get childNodes() {
        return this._children;
    }
    get style() {
        return this._style;
    }
    get textContent() {
        let content = '';
        for (let child = this.firstChild; child; child = child.nextSibling) {
            content += child.textContent;
        }
        return content;
    }
    set textContent(text) {
        text = String(text) || '';
        text = text.trim().replace(/\s+/, ' ');
        const childrenToBeRemoved = [];
        for (let child = this.firstChild; child; child = child.nextSibling) {
            if (!child._isInternal()) {
                childrenToBeRemoved.push(child);
            }
        }
        for (const child of childrenToBeRemoved) {
            child._remove();
        }
        if (this._pseudo === RNode.PSEUDO_BEFORE ||
            this._pseudo === RNode.PSEUDO_AFTER ||
            text !== '') {
            this._append(text);
        }
    }
    get batchList() {
        this.checkContents();
        return this._batchList;
    }
    get customDraw() {
        return this._customDraw;
    }
    set customDraw(val) {
        this._customDraw = val;
    }
    isElement() {
        return this.nodeType === RNode.ELEMENT_NODE;
    }
    isDocument() {
        return this.nodeType === RNode.DOCUMENT_NODE;
    }
    normalize() {
        let finished = false;
        let child = this.firstChild;
        while (!finished) {
            finished = true;
            for (; child; child = child.nextSibling) {
                if (child._isText()) {
                    child._normalize();
                    finished = false;
                    break;
                }
            }
        }
        for (child = this.firstChild; child; child = child.nextSibling) {
            child.normalize();
        }
    }
    get scrollX() {
        return this._layout.desiredScrollX;
    }
    set scrollX(val) {
        this.setScrollX(val);
    }
    setScrollX(val) {
        if (this._layout.desiredScrollX !== val) {
            this._layout.desiredScrollX = val;
            this._syncLayout();
        }
    }
    get scrollY() {
        return this._layout.desiredScrollY;
    }
    set scrollY(val) {
        this.setScrollY(val);
    }
    setScrollY(val) {
        if (this._layout.desiredScrollY !== val) {
            this._layout.desiredScrollY = val;
            this._syncLayout();
        }
    }
    setScroll(x, y) {
        if (this._layout.desiredScrollX !== x || this._layout.desiredScrollY !== y) {
            this._layout.desiredScrollX = x;
            this._layout.desiredScrollY = y;
            this._syncLayout();
        }
    }
    getRect() {
        this._uiscene.updateLayout();
        return this._layout.actualRect;
    }
    getClippedRect() {
        this._uiscene.updateLayout();
        return this._layout.clippedRect;
    }
    getClientRect() {
        this._uiscene.updateLayout();
        return this._layout.clientRect;
    }
    getBorderRect() {
        this._uiscene.updateLayout();
        return this._layout.borderRect;
    }
    get nextSibling() {
        return this._getNextSibling(false);
    }
    get previousSibling() {
        return this._getPreviousSibling(false);
    }
    _remove() {
        let parent = null;
        if (this._parent) {
            parent = this._parent;
            const index = this._parent._childNodes.indexOf(this);
            console.assert(index >= 0, 'remove: node is not child');
            const focus = this._uiscene.getFocus();
            if (focus && focus._isSucceedingOf(this)) {
                this._uiscene.setFocus(null);
            }
            const captured = this._uiscene.getCapture();
            if (captured && captured._isSucceedingOf(this)) {
                this._uiscene.setCapture(null);
            }
            this._parent._removeChild(index);
            this._parent = null;
            this._disable(-this._disableCounter);
        }
        else {
            return null;
        }
        this._removeEvent.parent = parent;
        this._uiscene.dispatchEvent(this._removeEvent);
        return this;
    }
    _before(...nodes) {
        console.assert(!!this.parentNode, 'Failed to execute before: parent element must not be null');
        console.assert(nodes.indexOf(this) < 0, 'Failed to execute before: cannot insert self node');
        let first = this;
        for (let i = nodes.length - 1; i >= 0; i--) {
            const node = nodes[i];
            if (typeof node === 'string') {
                const textNode = this._uiscene.createTextNode();
                textNode.textContent = node;
                textNode.style.width = 'auto';
                textNode.style.height = 'auto';
                textNode.style.flex = '0 0 auto';
                textNode.style.cursor = 'auto';
                this.parentNode.insertBefore(textNode, first);
                first = textNode;
            }
            else if (node instanceof RNode) {
                this.parentNode.insertBefore(node, first);
                first = node;
            }
        }
    }
    _after(...nodes) {
        console.assert(!!this.parentNode, 'Failed to execute after: parent element must not be null');
        console.assert(nodes.indexOf(this) < 0, 'Failed to execute after: cannot insert self node');
        const next = this.nextSibling;
        if (next) {
            next._before(...nodes);
        }
        else {
            this.parentNode._append(...nodes);
        }
    }
    _append(...nodes) {
        for (const node of nodes) {
            if (typeof node === 'string') {
                const textNode = this._uiscene.createTextNode();
                textNode.textContent = node;
                textNode.style.width = 'auto';
                textNode.style.height = 'auto';
                textNode.style.flex = '0 0 auto';
                textNode.style.cursor = 'auto';
                textNode.style.backgroundColor = 'rgba(0,0,0,0)';
                this.appendChild(textNode);
            }
            else if (node instanceof RNode) {
                this.appendChild(node);
            }
        }
    }
    _prepend(...nodes) {
        const first = this.firstChild;
        if (!first) {
            this._append(...nodes);
        }
        else {
            first._before(...nodes);
        }
    }
    cloneNode(deep) {
        throw new Error(`Failed to call cloneNode(${deep})`);
    }
    getRootNode() {
        let root = this;
        while (root.parentNode) {
            root = root.parentNode;
        }
        return root;
    }
    appendChild(child) {
        console.assert(!!child, `Failed to appendChild: element to be append is ${child}`);
        console.assert(!this._isSucceedingOf(child), `Failed to appendChild: cannot append parent element`);
        const ref = this.lastChild?._layout.nextSibling()?.element;
        child._reparent(this, ref);
        return child;
    }
    insertBefore(newElement, referenceElement) {
        console.assert(referenceElement && this === referenceElement.parentNode, 'Failed to insertBefore: reference element is not a valid elememnt or is not a child of this node');
        console.assert(!!newElement, `Failed to insertBefore: element to be insert is ${newElement}`);
        console.assert(!this._isSucceedingOf(newElement), `Failed to insertBefore: cannot insert parent element`);
        newElement._reparent(this, referenceElement);
        return newElement;
    }
    removeChild(child) {
        console.assert(!!child, `Failed to removeChild: element to be remove is ${child}`);
        console.assert(this === child.parentNode, 'Failed to removeChild: element to be remove is not a child of this node');
        return child._remove();
    }
    replaceChild(newChild, oldChild) {
        console.assert(!!newChild, `Failed to replaceChild: element to be insert is ${newChild}`);
        console.assert(!!oldChild, `Failed to replaceChild: element to be replaced is ${oldChild}`);
        console.assert(this === oldChild.parentNode, 'Failed to replaceChild: element to be replaced is not a child of this node');
        if (newChild !== oldChild) {
            const next = oldChild.nextSibling;
            this.removeChild(oldChild);
            if (next) {
                this.insertBefore(newChild, next);
            }
            else {
                this.appendChild(newChild);
            }
        }
        return oldChild;
    }
    get firstChild() {
        return this._getFirstChild(false);
    }
    get lastChild() {
        return this._getLastChild(false);
    }
    contains(child) {
        return child && child._isSucceedingOf(this);
    }
    hasChildNodes() {
        return this.childNodes.length > 0;
    }
    setCapture() {
        if (this._isSucceedingOf(this._uiscene.document)) {
            this._uiscene.setCapture(this);
        }
    }
    releaseCapture() {
        if (this._uiscene.getCapture() === this) {
            this._uiscene.setCapture(null);
        }
    }
    traverse(v, inverse, render) {
        v.beginTraverseNode(this);
        if (!this._isVisible()) {
            return;
        }
        if (render) {
            if (this._renderOrderChanged) {
                this._renderOrderChanged = false;
                this._updateRenderOrders();
            }
            if (inverse) {
                for (let i = this._renderOrder.length - 1; i >= 0; i--) {
                    this._childNodes[this._renderOrder[i]].traverse(v, inverse, render);
                }
                v.visitNode(this);
            }
            else {
                v.visitNode(this);
                for (let i = 0; i < this._renderOrder.length; i++) {
                    this._childNodes[this._renderOrder[i]].traverse(v, inverse, render);
                }
            }
        }
        else {
            if (inverse) {
                for (let i = this._childNodes.length - 1; i >= 0; i--) {
                    this._childNodes[i].traverse(v, inverse, render);
                }
                v.visitNode(this);
            }
            else {
                v.visitNode(this);
                for (const child of this._childNodes) {
                    child.traverse(v, inverse, render);
                }
            }
        }
        v.endTraverseNode(this);
    }
    checkContents() {
        const img = this.style.backgroundImage
            ? this._uiscene.imageManager.getImage(this.style.backgroundImage)
            : null;
        if (img !== this._backgroundImage) {
            this._backgroundImage = img;
            this._contentDirty = true;
        }
        if (this._contentDirty) {
            this._contentDirty = false;
            this._batchList.clear();
            const w = this._layout.actualRect.width;
            const h = this._layout.actualRect.height;
            if (w > 0 && h > 0) {
                const v = this.toAbsolute({ x: 0, y: 0 });
                this._batchList.x = v.x;
                this._batchList.y = v.y;
                this._buildVertexData();
            }
        }
    }
    draw(renderer) {
        let drawDefault = true;
        if (this._customDraw) {
            this.gui.renderer.beginCustomDraw(this);
            RNode._drawEvent.reset();
            this.dispatchEvent(RNode._drawEvent);
            this.gui.renderer.endCustomDraw(this);
            if (RNode._drawEvent.defaultPrevented) {
                drawDefault = false;
            }
        }
        if (drawDefault) {
            this.checkContents();
            this._draw(renderer);
        }
    }
    toAbsolute(v) {
        return this._layout.toAbsolute(v);
    }
    _getCachedFontSize() {
        return this._cachedFontSize || this.parentNode?._getCachedFontSize() || RNode._defaultFontSize;
    }
    _getCachedFontFamily() {
        return (this._cachedFontFamily || this.parentNode?._getCachedFontFamily() || RNode._defaultFontFamily);
    }
    _getCachedFont() {
        if (!this._font) {
            this._font = Font.fetchFont(`${this._getCachedFontSize()} ${this._getCachedFontFamily()}`, this._uiscene.renderer.screenToDevice(1));
        }
        return this._font;
    }
    _getCachedFontColor() {
        return (this._fontColor || this.parentNode?._getCachedFontColor() || ElementStyle.defaultFontColor);
    }
    _updatePseudoElementStyles(types) {
        for (const name of ['before', 'after']) {
            const info = types?.get(name);
            let pseudo;
            let node;
            if (name === 'before') {
                pseudo = RNode.PSEUDO_BEFORE;
                node =
                    this._childNodes.length > 0 && this._childNodes[0]._getPseudo() === pseudo
                        ? this._childNodes[0]
                        : null;
            }
            else {
                pseudo = RNode.PSEUDO_AFTER;
                node =
                    this._childNodes.length > 0 &&
                        this._childNodes[this._childNodes.length - 1]._getPseudo() === pseudo
                        ? this._childNodes[this._childNodes.length - 1]
                        : null;
            }
            if (info && !node) {
                node = this.ownerDocument.createElement('div');
                node._setInternal();
                node._setPseudo(pseudo);
                node.style.flex = '0 0 auto';
                node._reparent(this, name === 'before' && this._childNodes.length > 0 ? this._childNodes[0] : null);
                for (const s of info) {
                    node.style.applyStyleSheet(s.stylesheet, true);
                }
                const content = info[info.length - 1].extra.content;
                if (info.length > 0 && typeof content === 'string') {
                    const s = content.trim();
                    let match = s.match(/^'([^']*)'$/);
                    if (!match) {
                        match = s.match(/^"([^"]*)"$/);
                    }
                    if (match) {
                        node.textContent = unescapeCSSString(match[1]);
                    }
                }
            }
            else if (node && !info) {
                node._remove();
            }
        }
    }
    _updateStyle(val) {
        this._uiscene._markStyleRefreshForElement(this);
    }
    _updateBorder() {
        this._invalidateContent();
    }
    _updateZIndex() {
        if (this._parent) {
            this._parent._markRenderOrderChanged();
        }
        return this;
    }
    _updateCursor(val) { }
    _updateDisplay(val) {
        this._hide = val === 'none';
    }
    _updateBorderLeftColor(val) {
        this._borderLeftColor.r = val.r;
        this._borderLeftColor.g = val.g;
        this._borderLeftColor.b = val.b;
        this._borderLeftColor.a = val.a;
        this._invalidateContent();
    }
    _updateBorderTopColor(val) {
        this._borderTopColor.r = val.r;
        this._borderTopColor.g = val.g;
        this._borderTopColor.b = val.b;
        this._borderTopColor.a = val.a;
        this._invalidateContent();
    }
    _updateBorderRightColor(val) {
        this._borderRightColor.r = val.r;
        this._borderRightColor.g = val.g;
        this._borderRightColor.b = val.b;
        this._borderRightColor.a = val.a;
        this._invalidateContent();
    }
    _updateBorderBottomColor(val) {
        this._borderBottomColor.r = val.r;
        this._borderBottomColor.g = val.g;
        this._borderBottomColor.b = val.b;
        this._borderBottomColor.a = val.a;
        this._invalidateContent();
    }
    _updateBackgroundColor(val) {
        this._backgroundColor.r = val.r;
        this._backgroundColor.g = val.g;
        this._backgroundColor.b = val.b;
        this._backgroundColor.a = val.a;
        this._invalidateContent();
    }
    _updateFont(val) {
        if (this.style.font === val) {
            this._font = val ? Font.fetchFont(val, this._uiscene.renderer.screenToDevice(1)) : null;
        }
        this._invalidateContent();
        this._invalidateLayout();
        for (const child of this._childNodes) {
            child._updateFont(val);
        }
    }
    _updateFontSize(val) {
        val = val || null;
        if (this._cachedFontSize !== val) {
            this._cachedFontSize = val;
            this._font = null;
            this._invalidateContent();
            this._invalidateLayout();
            for (const child of this._childNodes) {
                child._invalidateFont(true, false);
            }
        }
    }
    _updateFontFamily(val) {
        val = val || null;
        if (this._cachedFontFamily !== val) {
            this._cachedFontFamily = val;
            this._font = null;
            this._invalidateContent();
            this._invalidateLayout();
            for (const child of this._childNodes) {
                child._invalidateFont(false, true);
            }
        }
    }
    _updateFontColor(val) {
        if (this.style.color === val) {
            this._fontColor = val ? this.style.parseColor(val) : null;
        }
        this._invalidateContent();
        for (const child of this._childNodes) {
            child._updateFontColor(val);
        }
    }
    _isSucceedingOf(w) {
        let p = this;
        while (p && p !== w) {
            p = p.parentNode;
        }
        return !!p;
    }
    _isValid() {
        return this._uiscene && this._isSucceedingOf(this._uiscene.document);
    }
    _invalidateLayout() {
        if (this._isSucceedingOf(this._uiscene.document)) {
            this._layout.markDirty();
            this._uiscene.invalidateLayout();
        }
    }
    _invalidateContent() {
        this._contentDirty = true;
    }
    _invalidateFont(sizeChange, familyChange) {
        if ((sizeChange && this._cachedFontSize === null) ||
            (familyChange && this._cachedFontFamily === null)) {
            this._font = null;
            this._invalidateContent();
            for (const child of this._childNodes) {
                child._invalidateFont(sizeChange, familyChange);
            }
        }
    }
    _reparent(p, at) {
        if (this._parent !== p) {
            this._remove();
            this._parent = p;
            if (p) {
                p._insertChild(this, at ? p._childNodes.indexOf(at) : -1);
                this._disable(p._disableCounter);
                this._insertEvent.parent = p;
                this._uiscene.dispatchEvent(this._insertEvent);
            }
        }
        return this;
    }
    _calcLayout() {
        this._layout.calcLayout();
        this._syncLayout();
    }
    _getClipper(clipToClient) {
        const clipper = this._layout.clippedRect ||
            (clipToClient
                ? this._layout.clientRect
                : {
                    x: 0,
                    y: 0,
                    width: this._layout.actualRect.width,
                    height: this._layout.actualRect.height,
                });
        return clipper.width > 0 && clipper.height > 0 ? clipper : null;
    }
    _measureContentSize(rc) {
        rc.width = 0;
        rc.height = 0;
        return rc;
    }
    _onMouseIn(x, y) {
        const cursor = this.style.cursor || defaultCursor;
        if (cursor !== 'auto') {
            this._uiscene.renderer.setCursorStyle(cursor);
        }
    }
    _onMouseOut(x, y) { }
    _onMouseEnter(x, y) {
        this._mouseIn = true;
        this._updateState();
    }
    _onMouseLeave(x, y) {
        this._mouseIn = false;
        this._updateState();
    }
    _onMouseDown(x, y) {
        this._mouseDown = true;
        this._updateState();
    }
    _onMouseUp(x, y) {
        this._mouseDown = false;
        this._updateState();
    }
    _getDefaultStyleSheet() {
        const style = {};
        style.flex = '0 1 auto';
        style.flexDirection = 'row';
        style.width = 'auto';
        style.height = 'auto';
        return style;
    }
    _resetStyle() {
        this._font = null;
        this._fontColor = null;
        this.style.reset();
        this.style.applyStyleSheet(this._getDefaultStyleSheet(), false);
    }
    _applyInlineStyles() { }
    _isVisible() {
        return !this._hide && (!this._parent || this._parent._isVisible());
    }
    _getLayout() {
        return this._layout;
    }
    _syncLayout() {
        this._layout.calcLayoutScroll();
        this._layout.calcLayoutClip();
        this._notifyLayoutEvents();
    }
    _updateState() {
        if (this._pseudo === RNode.PSEUDO_NONE) {
            this._uiscene._markStyleRefreshForElement(this);
        }
    }
    _draw(renderer) {
        if (this._batchList.length > 0) {
            this._uiscene._drawBatchList(this._batchList);
        }
    }
    _buildVertexData() {
        const w = this._layout.actualRect.width;
        const h = this._layout.actualRect.height;
        const img = this._backgroundImage;
        let drawPatch9 = !!(img?.topLeftPatch9 && img?.bottomRightPatch9);
        if (drawPatch9) {
            if (img.topLeftPatch9.x + img.bottomRightPatch9.x > this._layout.actualRect.height ||
                img.topLeftPatch9.y + img.bottomRightPatch9.y > this._layout.actualRect.width) {
                drawPatch9 = false;
            }
        }
        const color = this._backgroundColor;
        const clipper = this._getClipper(false);
        if (clipper) {
            if (color.a > 0) {
                if (!drawPatch9) {
                    const u1 = img?.uvMin.x || 0;
                    const v1 = img?.uvMin.y || 0;
                    const u2 = img?.uvMax.x || 0;
                    const v2 = img?.uvMax.y || 0;
                    this._batchList.addPrimitive(new RRectPrimitive(0, 0, w, h, u1, v1, u2, v2), clipper, this._backgroundImage?.texture || null, color);
                }
                else {
                    let t = img.topLeftPatch9.x;
                    let l = img.topLeftPatch9.y;
                    let b = img.bottomRightPatch9.x;
                    let r = img.bottomRightPatch9.y;
                    const u1 = img.uvMin.x;
                    const v1 = img.uvMin.y;
                    const u2 = img.uvMax.x;
                    const v2 = img.uvMax.y;
                    const aw = (this._uiscene.renderer.getTextureWidth(img.texture) * (u2 - u1) + 0.5) | 0;
                    const ah = (this._uiscene.renderer.getTextureHeight(img.texture) * (v2 - v1) + 0.5) | 0;
                    const ul = u1 + (u2 - u1) * l;
                    const ur = u1 + (u2 - u1) * r;
                    const vt = v1 + (v2 - v1) * t;
                    const vb = v1 + (v2 - v1) * b;
                    t = (t * ah) | 0;
                    l = (l * aw) | 0;
                    b = ah - ((b * ah) | 0);
                    r = aw - ((r * aw) | 0);
                    const quads = [
                        t === 0 || l === 0 ? null : [0, 0, l, t, u1, v1, ul, vt],
                        t === 0 ? null : [t, 0, w - l - r, t, ul, v1, ur, vt],
                        t === 0 || r === 0 ? null : [w - r, 0, r, t, ur, v1, u2, vt],
                        t + b === h ? null : [0, t, l, h - t - b, u1, vt, ul, vb],
                        t + b === h ? null : [l, t, w - l - r, h - t - b, ul, vt, ur, vb],
                        t + b === h ? null : [w - r, t, r, h - t - b, ur, vt, u2, vb],
                        b === 0 || l === 0 ? null : [0, h - b, l, b, u1, vb, ul, v2],
                        b === 0 ? null : [l, h - b, w - l - r, b, ul, vb, ur, v2],
                        b === 0 || r === 0 ? null : [w - r, h - b, r, b, ur, vb, u2, v2],
                    ];
                    for (const q of quads) {
                        if (q) {
                            q[4];
                            q[5];
                            q[6];
                            q[7];
                            this._batchList.addPrimitive(new RRectPrimitive(q[0], q[1], q[2], q[3], q[4], q[5], q[6], q[7]), clipper, this._backgroundImage?.texture || null, color);
                        }
                    }
                }
            }
            const borderLeft = this.style.borderLeftWidth
                ? parseInt(this.style.borderLeftWidth)
                : 0;
            const borderTop = this.style.borderTopWidth
                ? parseInt(this.style.borderTopWidth)
                : 0;
            const borderRight = this.style.borderRightWidth
                ? parseInt(this.style.borderRightWidth)
                : 0;
            const borderBottom = this.style.borderBottomWidth
                ? parseInt(this.style.borderBottomWidth)
                : 0;
            const borderColorLeft = this._borderLeftColor;
            const borderColorTop = this._borderTopColor;
            const borderColorRight = this._borderRightColor;
            const borderColorBottom = this._borderBottomColor;
            if (borderLeft && borderColorLeft.a > 0) {
                this._batchList.addPrimitive(new RPolygonPrimitive([
                    { x: 0, y: 0 },
                    { x: borderLeft, y: borderTop },
                    { x: borderLeft, y: h - borderBottom },
                    { x: 0, y: h },
                ]), clipper, null, borderColorLeft);
            }
            if (borderTop && borderColorTop.a > 0) {
                this._batchList.addPrimitive(new RPolygonPrimitive([
                    { x: 0, y: 0 },
                    { x: w, y: 0 },
                    { x: w - borderRight, y: borderTop },
                    { x: borderLeft, y: borderTop },
                ]), clipper, null, borderColorTop);
            }
            if (borderRight && borderColorRight.a > 0) {
                this._batchList.addPrimitive(new RPolygonPrimitive([
                    { x: w - borderRight, y: borderTop },
                    { x: w, y: 0 },
                    { x: w, y: h },
                    { x: w - borderRight, y: h - borderBottom },
                ]), clipper, null, borderColorRight);
            }
            if (borderBottom && borderColorBottom.a > 0) {
                this._batchList.addPrimitive(new RPolygonPrimitive([
                    { x: 0, y: h },
                    { x: borderLeft, y: h - borderBottom },
                    { x: w - borderRight, y: h - borderBottom },
                    { x: w, y: h },
                ]), clipper, null, borderColorBottom);
            }
        }
    }
    _isText() {
        return false;
    }
    _isInternal() {
        return this._internal;
    }
    _setInternal() {
        this._internal = true;
    }
    _getPseudo() {
        return this._pseudo;
    }
    _setPseudo(val) {
        this._pseudo = val;
    }
    _isHover() {
        return this._mouseIn;
    }
    _isActive() {
        return this._mouseDown;
    }
    _disable(count) {
        this._disableCounter += count;
        for (const child of this._childNodes) {
            child._disable(count);
        }
    }
    _markRenderOrderChanged() {
        this._renderOrderChanged = true;
    }
    _updateRenderOrders() {
        this._renderOrder = this._childNodes.map((val, index) => index);
        this._renderOrder.sort((a, b) => this._childNodes[a]._getZIndex() - this._childNodes[b]._getZIndex() || a - b);
    }
    _notifyLayoutEvents() {
        if (this._layout.changeStamp !== this._layoutChangeStamp) {
            this._layoutChangeStamp = this._layout.changeStamp;
            this._invalidateContent();
            this.dispatchEvent(new RElementLayoutEvent());
        }
        this._updateScrollState();
        for (const child of this._childNodes) {
            child._notifyLayoutEvents();
        }
    }
    _notifyTextContentEvents() {
        this.dispatchEvent(new RTextContentChangeEvent());
    }
    _getZIndex() {
        let val = Number(this.style.zIndex);
        if (Number.isNaN(val)) {
            val = 0;
        }
        return val;
    }
    _removeChild(index) {
        this._layout.removeChild(this._childNodes[index]._getLayout());
        this._childNodes.splice(index, 1);
        this._invalidateLayout();
        this._markRenderOrderChanged();
    }
    _insertChild(child, index = -1) {
        if (index >= 0) {
            let p = this._childNodes[index];
            this._layout.insertChild(child._getLayout(), p._getLayout());
            this._childNodes.splice(index, 0, child);
            if (child.nodeType === RNode.ELEMENT_NODE) {
                for (; p; p = p.nextSibling) {
                    if (p.nodeType === RNode.ELEMENT_NODE) {
                        break;
                    }
                }
            }
        }
        else {
            this._layout.appendChild(child._getLayout());
            this._childNodes.push(child);
        }
        this._invalidateLayout();
        this._markRenderOrderChanged();
    }
    _getChildren() {
        return this._childNodes;
    }
    _getFirstChild(element) {
        for (let child = this._layout.firstChild()?.element; child; child = child._layout.nextSibling()?.element) {
            if (!child._isInternal() && (!element || child.nodeType === RNode.ELEMENT_NODE)) {
                return child;
            }
        }
        return null;
    }
    _getLastChild(element) {
        for (let child = this._layout.lastChild()?.element; child; child = child._layout.previousSibling()?.element) {
            if (!child._isInternal() && (!element || child.nodeType === RNode.ELEMENT_NODE)) {
                return child;
            }
        }
        return null;
    }
    _getNextSibling(element) {
        let result = this;
        do {
            result = result._layout.nextSibling()?.element || null;
        } while (result &&
            (result._isInternal() || (!!element && result.nodeType !== RNode.ELEMENT_NODE)));
        return result;
    }
    _getPreviousSibling(element) {
        let result = this;
        do {
            result = result._layout.previousSibling()?.element || null;
        } while (result &&
            (result._isInternal() || (!!element && result.nodeType !== RNode.ELEMENT_NODE)));
        return result;
    }
    _init() {
    }
    _updateScrollState() {
        const overflowX = this.style.overflowX || 'auto';
        const overflowY = this.style.overflowY || 'auto';
        let xOverflow = overflowX === 'scroll' ||
            (overflowX === 'auto' &&
                this._layout.scrollRect !== null &&
                this._layout.scrollRect.width > this._layout.actualRect.width);
        let yOverflow = overflowY === 'scroll' ||
            (overflowY === 'auto' &&
                this._layout.scrollRect !== null &&
                this._layout.scrollRect.height > this._layout.actualRect.height);
        const scrollBarSize = 12;
        const blockSize = 8;
        const buttonSize = 12;
        if (xOverflow) {
            const width = yOverflow
                ? this._layout.clientRect.width - scrollBarSize
                : this._layout.clientRect.width;
            if (this._layout.clientRect.height < scrollBarSize || width < 2 * buttonSize + blockSize) {
                xOverflow = false;
            }
            else {
                if (!this._hScroll) {
                    this._hScroll = this._uiscene.createElement('scrollbar');
                    this._hScroll.style.position = 'fixed';
                    this._hScroll.style.zIndex = 999999;
                    this._hScroll.style.height = scrollBarSize;
                    this._hScroll.setAttribute('orientation', 'horizonal');
                    this._hScroll.setAttribute('blockSize', String(blockSize));
                    this._hScroll.setAttribute('buttonSize', String(buttonSize));
                    this._hScroll._setInternal();
                    this._hScroll.addDefaultEventListener(RValueChangeEvent.NAME, (e) => {
                        const data = e;
                        this.scrollX = data.value;
                    });
                    this.appendChild(this._hScroll);
                }
                this._hScroll.setAttribute('rangeStart', String(this._layout.minScrollX));
                this._hScroll.setAttribute('rangeEnd', String(this._layout.maxScrollX));
                this._hScroll.setAttribute('value', String(this.scrollX));
                this._hScroll.style.left = this._layout.clientRect.x - this._layout.borderRect.x;
                this._hScroll.style.width = width;
                this._hScroll.style.bottom =
                    this._layout.borderRect.height -
                        this._layout.clientRect.height -
                        this._layout.clientRect.y +
                        this._layout.borderRect.y;
            }
        }
        if (!xOverflow && this._hScroll) {
            this.removeChild(this._hScroll);
            this._hScroll = null;
        }
        if (yOverflow) {
            const height = xOverflow
                ? this._layout.clientRect.height - scrollBarSize
                : this._layout.clientRect.height;
            if (this._layout.clientRect.width < scrollBarSize || height < 2 * buttonSize + blockSize) {
                yOverflow = false;
            }
            else {
                if (!this._vScroll) {
                    this._vScroll = this._uiscene.createElement('scrollbar');
                    this._vScroll.style.position = 'fixed';
                    this._vScroll.style.zIndex = 999999;
                    this._vScroll.style.width = scrollBarSize;
                    this._vScroll.setAttribute('orientation', 'vertical');
                    this._vScroll.setAttribute('blockSize', String(blockSize));
                    this._vScroll.setAttribute('buttonSize', String(buttonSize));
                    this._vScroll._setInternal();
                    this._vScroll.addDefaultEventListener(RValueChangeEvent.NAME, (e) => {
                        const data = e;
                        this.scrollY = data.value;
                    });
                    this.appendChild(this._vScroll);
                }
                this._vScroll.setAttribute('rangeStart', String(this._layout.minScrollY));
                this._vScroll.setAttribute('rangeEnd', String(this._layout.maxScrollY));
                this._vScroll.setAttribute('value', String(this.scrollY));
                this._vScroll.style.top = this._layout.clientRect.y - this._layout.borderRect.y;
                this._vScroll.style.height = height;
                this._vScroll.style.right =
                    this._layout.borderRect.width -
                        this._layout.clientRect.width -
                        this._layout.clientRect.x +
                        this._layout.borderRect.x;
            }
        }
        if (!yOverflow && this._vScroll) {
            this.removeChild(this._vScroll);
            this._vScroll = null;
        }
    }
}

export { RNode };
//# sourceMappingURL=node.js.map
