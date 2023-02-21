/** sophon base library */
import { List } from '@sophon/base';
import { Config, Node, UNDEFINED, DIRECTION_LTR, EDGE_BOTTOM, EDGE_RIGHT, EDGE_TOP, EDGE_LEFT } from './typeflex/api.js';
import { YGSize } from './typeflex/yoga.js';

const yogaConfig = Config.create();
yogaConfig.config.useWebDefaults = true;
class UILayout {
    element;
    actualRect;
    clientRect;
    borderRect;
    clippedRect;
    scrollRect;
    desiredScrollX;
    desiredScrollY;
    actualScrollX;
    actualScrollY;
    minScrollX;
    maxScrollX;
    minScrollY;
    maxScrollY;
    changeStamp;
    node;
    _parent;
    _children;
    _iterator;
    constructor(element) {
        this.element = element;
        this._parent = null;
        this._children = new List();
        this._iterator = null;
        this.actualRect = { x: 0, y: 0, width: 0, height: 0 };
        this.clientRect = { x: 0, y: 0, width: 0, height: 0 };
        this.borderRect = { x: 0, y: 0, width: 0, height: 0 };
        this.clippedRect = null;
        this.scrollRect = { x: 0, y: 0, width: 0, height: 0 };
        this.desiredScrollX = 0;
        this.desiredScrollY = 0;
        this.actualScrollX = 0;
        this.actualScrollY = 0;
        this.minScrollX = 0;
        this.maxScrollX = 0;
        this.minScrollY = 0;
        this.maxScrollY = 0;
        this.changeStamp = 0;
        this.node = Node.create(yogaConfig);
        if (element && element._isText()) {
            this.node.setMeasureFunc((node, width, widthMode, height, heightMode) => {
                const rc = element._measureContentSize({
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0,
                });
                const size = new YGSize();
                size.width = rc.width;
                size.height = rc.height;
                return size;
            });
        }
    }
    invalidateLayout() {
        this.element?._invalidateLayout();
    }
    getNumChildren() {
        return this._children.length;
    }
    appendChild(child) {
        console.assert(this._children.length === this.node.getChildCount(), 'Failed to append child layout: child count mismatch');
        console.assert(child && !child._parent, 'Failed to append child layout: invalid child or child already has an parent');
        child._parent = this;
        child._iterator = this._children.append(child);
        this.node.insertChild(child.node, this.node.getChildCount());
        this.invalidateLayout();
    }
    removeChild(child) {
        console.assert(this._children.length === this.node.getChildCount(), 'Failed to append child layout: child count mismatch');
        if (child._iterator && child._iterator.list === this._children) {
            this.node.removeChild(child.node);
            this.invalidateLayout();
            this._children.remove(child._iterator);
            child._parent = null;
            child._iterator = null;
        }
    }
    insertChild(child, at) {
        console.assert(this._children.length === this.node.getChildCount(), 'Failed to append child layout: child count mismatch');
        console.assert(child && !child._parent, 'Failed to append child layout: invalid child or child already has an parent');
        console.assert(at && at._parent === this, 'Failed to append child layout: invalid reference child');
        child._parent = this;
        child._iterator = this._children.insertAt(child, at._iterator);
        const index = this.node.node.getChildren().indexOf(at.node.node);
        console.assert(index >= 0, 'Failed to append child layout: cannot get reference child index');
        this.node.insertChild(child.node, index);
        this.invalidateLayout();
    }
    firstChild() {
        const it = this._children.begin();
        return it.valid() ? it.data : null;
    }
    lastChild() {
        const it = this._children.rbegin();
        return it.valid() ? it.data : null;
    }
    nextSibling() {
        const it = this._iterator?.getNext();
        return it && it.valid() ? it.data : null;
    }
    previousSibling() {
        const it = this._iterator?.getPrev();
        return it && it.valid() ? it.data : null;
    }
    markDirty() {
        if (this.element && this.element._isText()) {
            this.node.markDirty();
        }
    }
    calcLayout() {
        console.assert(!this._parent, 'calcLayout must be called on root element');
        this.node.calculateLayout(UNDEFINED, UNDEFINED, DIRECTION_LTR);
        this.syncComputedRect(0, 0, false);
    }
    updateStyle(val) {
        this.element._updateStyle(val);
    }
    updateBorder(val) {
        this.element._updateBorder();
    }
    updateZIndex() {
        this.element._updateZIndex();
    }
    updateCursor(val) {
        this.element._updateCursor(val);
    }
    updateDisplay(val) {
        this.element._updateDisplay(val);
    }
    updateFont(val) {
        this.element.gui?.invalidateLayout();
        this.element._updateFont(val);
    }
    updateFontSize(val) {
        this.element._updateFontSize(val);
    }
    updateFontFamily(val) {
        this.element._updateFontFamily(val);
    }
    updateFontColor(val) {
        this.element._updateFontColor(val);
    }
    updateBorderColor(edge, val) {
        switch (edge) {
            case EDGE_LEFT:
                this.element._updateBorderLeftColor(val);
                break;
            case EDGE_TOP:
                this.element._updateBorderTopColor(val);
                break;
            case EDGE_RIGHT:
                this.element._updateBorderRightColor(val);
                break;
            case EDGE_BOTTOM:
                this.element._updateBorderBottomColor(val);
                break;
        }
    }
    updateBackgroundColor(val) {
        this.element._updateBackgroundColor(val);
    }
    syncComputedRect(px, py, markChanged) {
        const paddingLeft = this.node.getComputedPadding(EDGE_LEFT);
        const paddingTop = this.node.getComputedPadding(EDGE_TOP);
        const paddingRight = this.node.getComputedPadding(EDGE_RIGHT);
        const paddingBottom = this.node.getComputedPadding(EDGE_BOTTOM);
        const borderLeft = this.node.getComputedBorder(EDGE_LEFT);
        const borderTop = this.node.getComputedBorder(EDGE_TOP);
        const borderRight = this.node.getComputedBorder(EDGE_RIGHT);
        const borderBottom = this.node.getComputedBorder(EDGE_BOTTOM);
        const rect = this.actualRect;
        const x = this.node.getComputedLeft() - px;
        const y = this.node.getComputedTop() - py;
        const w = this.node.getComputedWidth();
        const h = this.node.getComputedHeight();
        if (!markChanged && (x !== rect.x || y !== rect.y || w !== rect.width || h !== rect.height)) {
            markChanged = true;
        }
        rect.x = x;
        rect.y = y;
        rect.width = w;
        rect.height = h;
        const clientRect = this.clientRect;
        const cx = paddingLeft + borderLeft;
        const cy = paddingTop + borderTop;
        const cw = Math.max(0, rect.width - paddingLeft - paddingRight - borderLeft - borderRight);
        const ch = Math.max(0, rect.height - paddingTop - paddingBottom - borderTop - borderBottom);
        if (!markChanged &&
            (cx !== clientRect.x ||
                cy !== clientRect.y ||
                cw !== clientRect.width ||
                ch !== clientRect.height)) {
            markChanged = true;
        }
        clientRect.x = cx;
        clientRect.y = cy;
        clientRect.width = cw;
        clientRect.height = ch;
        const borderRect = this.borderRect;
        const bx = borderLeft;
        const by = borderTop;
        const bw = Math.max(0, rect.width - borderLeft - borderRight);
        const bh = Math.max(0, rect.height - borderTop - borderBottom);
        if (!markChanged &&
            (bx !== borderRect.x ||
                by !== borderRect.y ||
                bw !== borderRect.width ||
                bh !== borderRect.height)) {
            markChanged = true;
        }
        borderRect.x = bx;
        borderRect.y = by;
        borderRect.width = bw;
        borderRect.height = bh;
        this.actualScrollX = 0;
        this.actualScrollY = 0;
        let minX = 0;
        let minY = 0;
        let maxX = clientRect.width;
        let maxY = clientRect.height;
        this._children.forEach((child) => {
            if (child.element._isVisible()) {
                child.syncComputedRect(paddingLeft + borderLeft, paddingTop + borderTop, markChanged);
                const x1 = child.actualRect.x;
                const y1 = child.actualRect.y;
                const x2 = x1 + child.actualRect.width;
                const y2 = y1 + child.actualRect.height;
                minX = Math.min(minX, x1);
                minY = Math.min(minY, y1);
                maxX = Math.max(maxX, x2);
                maxY = Math.max(maxY, y2);
            }
        });
        this.scrollRect = {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
        };
        this.minScrollX = this.scrollRect.x;
        this.maxScrollX = this.scrollRect.x + this.scrollRect.width - clientRect.width;
        this.minScrollY = this.scrollRect.y;
        this.maxScrollY = this.scrollRect.y + this.scrollRect.height - clientRect.height;
        if (markChanged) {
            this.changeStamp++;
        }
    }
    thisToParentClient(p) {
        p.x += this.actualRect.x;
        p.y += this.actualRect.y;
        return p;
    }
    thisToParent(p) {
        this.thisToParentClient(p);
        if (this._parent) {
            p.x += this._parent.clientRect.x;
            p.y += this._parent.clientRect.y;
        }
        return p;
    }
    clipRectForChildren() {
        const rcClient = this.clientRect;
        if (this.clippedRect) {
            const x = Math.max(rcClient.x, this.clippedRect.x);
            const y = Math.max(rcClient.y, this.clippedRect.y);
            const width = Math.max(0, Math.min(this.clippedRect.x + this.clippedRect.width, rcClient.x + rcClient.width) - x);
            const height = Math.max(0, Math.min(this.clippedRect.y + this.clippedRect.height, rcClient.y + rcClient.height) - y);
            return { x, y, width, height };
        }
        else {
            return rcClient;
        }
    }
    toAbsolute(v) {
        v = v || { x: 0, y: 0 };
        let layout = this;
        v.x += layout.actualRect.x;
        v.y += layout.actualRect.y;
        while ((layout = layout._parent)) {
            v.x += layout.actualRect.x + layout.clientRect.x;
            v.y += layout.actualRect.y + layout.clientRect.y;
        }
        return v;
    }
    clipToParent(parent) {
        const parentRect = parent.clipRectForChildren();
        const vThis = this.toAbsolute({ x: 0, y: 0 });
        const vParent = parent.toAbsolute({ x: parentRect.x, y: parentRect.y });
        const x1This = vThis.x;
        const y1This = vThis.y;
        const x2This = x1This + this.actualRect.width;
        const y2This = y1This + this.actualRect.height;
        const x1Parent = vParent.x;
        const y1Parent = vParent.y;
        const x2Parent = x1Parent + parentRect.width;
        const y2Parent = y1Parent + parentRect.height;
        const x1Clip = Math.max(x1This, x1Parent);
        const y1Clip = Math.max(y1This, y1Parent);
        const x2Clip = Math.min(x2This, x2Parent);
        const y2Clip = Math.min(y2This, y2Parent);
        return {
            x: x1Clip - x1This,
            y: y1Clip - y1This,
            width: Math.max(0, x2Clip - x1Clip),
            height: Math.max(0, y2Clip - y1Clip),
        };
    }
    calcLayoutScroll() {
        scrollX = Math.max(this.minScrollX, Math.min(this.maxScrollX, this.desiredScrollX));
        scrollY = Math.max(this.minScrollY, Math.min(this.maxScrollY, this.desiredScrollY));
        if (scrollX !== this.actualScrollX || scrollY !== this.actualScrollY) {
            this._children.forEach((child) => {
                if (child.element.style.position !== 'fixed') {
                    child.actualRect.x += this.actualScrollX - scrollX;
                    child.actualRect.y += this.actualScrollY - scrollY;
                    child._markChanged();
                }
            });
            this.actualScrollX = scrollX;
            this.actualScrollY = scrollY;
        }
        this._children.forEach((child) => {
            child.calcLayoutScroll();
        });
    }
    calcLayoutClip() {
        let parent = this._parent;
        let xClip = null;
        let yClip = null;
        if (!this._isClipX()) {
            while (parent && !parent._isClipX()) {
                parent = parent._parent;
            }
            parent = parent ? parent._parent : null;
        }
        if (parent) {
            xClip = this.clipToParent(parent);
        }
        parent = this._parent;
        if (!this._isClipY()) {
            while (parent && !parent._isClipY()) {
                parent = parent._parent;
            }
            parent = parent ? parent._parent : null;
        }
        if (parent) {
            yClip = this.clipToParent(parent);
        }
        const lastClippedRect = this.clippedRect;
        if (xClip === null) {
            this.clippedRect = yClip;
        }
        else if (yClip === null) {
            this.clippedRect = xClip;
        }
        else {
            this.clippedRect = {
                x: xClip.x,
                y: yClip.y,
                width: xClip.width,
                height: yClip.height,
            };
        }
        if (this.clippedRect &&
            this.clippedRect.width === this.actualRect.width &&
            this.clippedRect.height === this.actualRect.height) {
            this.clippedRect = null;
        }
        let markChanged = false;
        if (this.clippedRect !== lastClippedRect) {
            if (this.clippedRect && lastClippedRect) {
                markChanged =
                    this.clippedRect.x !== lastClippedRect.x ||
                        this.clippedRect.y !== lastClippedRect.y ||
                        this.clippedRect.width !== lastClippedRect.width ||
                        this.clippedRect.height !== lastClippedRect.height;
            }
            else {
                markChanged = true;
            }
            if (markChanged) {
                this.changeStamp++;
            }
        }
        this._children.forEach((child) => {
            child.calcLayoutClip();
        });
    }
    _markChanged() {
        this.changeStamp++;
        this._children.forEach((child) => {
            child._markChanged();
        });
    }
    _isClipX() {
        return this._parent?.element?.style.overflowX !== 'visible';
    }
    _isClipY() {
        return this._parent?.element?.style.overflowY !== 'visible';
    }
}

export { UILayout };
//# sourceMappingURL=layout.js.map
