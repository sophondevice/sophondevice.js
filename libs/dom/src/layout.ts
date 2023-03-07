import { List, ListIterator, Tuple2, Tuple4, ColorRGBA } from '@sophon/base';
import * as Yoga from './typeflex/api';
import { YGSize } from './typeflex/yoga';
import type { RNode } from './node';
import type { YGNode } from './typeflex/yoga';
import type { YGMeasureMode } from './typeflex/enums';

const yogaConfig = Yoga.Config.create();
yogaConfig.config.useWebDefaults = true;

/** @internal */
export class UILayout {
  element: RNode;
  actualRect: Tuple4;
  clientRect: Tuple4;
  borderRect: Tuple4;
  clippedRect: Tuple4;
  scrollRect: Tuple4;
  desiredScrollX: number;
  desiredScrollY: number;
  actualScrollX: number;
  actualScrollY: number;
  minScrollX: number;
  maxScrollX: number;
  minScrollY: number;
  maxScrollY: number;
  changeStamp: number;
  node: Yoga.Node;
  protected _parent: UILayout;
  protected _children: List<UILayout>;
  protected _iterator: ListIterator<UILayout>;
  constructor(element: RNode) {
    this.element = element;
    this._parent = null;
    this._children = new List<UILayout>();
    this._iterator = null;
    this.actualRect = { x: 0, y: 0, z: 0, w: 0 };
    this.clientRect = { x: 0, y: 0, z: 0, w: 0 };
    this.borderRect = { x: 0, y: 0, z: 0, w: 0 };
    this.clippedRect = null;
    this.scrollRect = { x: 0, y: 0, z: 0, w: 0 };
    this.desiredScrollX = 0;
    this.desiredScrollY = 0;
    this.actualScrollX = 0;
    this.actualScrollY = 0;
    this.minScrollX = 0;
    this.maxScrollX = 0;
    this.minScrollY = 0;
    this.maxScrollY = 0;
    this.changeStamp = 0;
    this.node = Yoga.Node.create(yogaConfig);
    if (element && element._isText()) {
      this.node.setMeasureFunc(
        (
          node: YGNode,
          width: number,
          widthMode: YGMeasureMode,
          height: number,
          heightMode: YGMeasureMode
        ): YGSize => {
          const rc = element._measureContentSize({
            x: 0,
            y: 0,
            z: 0,
            w: 0
          });
          const size = new YGSize();
          size.width = rc.z;
          size.height = rc.w;
          return size;
        }
      );
    }
  }
  invalidateLayout() {
    this.element?._invalidateLayout();
  }
  getNumChildren(): number {
    return this._children.length;
  }
  appendChild(child: UILayout) {
    console.assert(
      this._children.length === this.node.getChildCount(),
      'Failed to append child layout: child count mismatch'
    );
    console.assert(
      child && !child._parent,
      'Failed to append child layout: invalid child or child already has an parent'
    );
    child._parent = this;
    child._iterator = this._children.append(child);
    this.node.insertChild(child.node, this.node.getChildCount());
    this.invalidateLayout();
  }
  removeChild(child: UILayout) {
    console.assert(
      this._children.length === this.node.getChildCount(),
      'Failed to append child layout: child count mismatch'
    );
    if (child._iterator && child._iterator.list === this._children) {
      this.node.removeChild(child.node);
      this.invalidateLayout();
      this._children.remove(child._iterator);
      child._parent = null;
      child._iterator = null;
    }
  }
  insertChild(child: UILayout, at: UILayout) {
    console.assert(
      this._children.length === this.node.getChildCount(),
      'Failed to append child layout: child count mismatch'
    );
    console.assert(
      child && !child._parent,
      'Failed to append child layout: invalid child or child already has an parent'
    );
    console.assert(at && at._parent === this, 'Failed to append child layout: invalid reference child');
    child._parent = this;
    child._iterator = this._children.insertAt(child, at._iterator);
    const index = this.node.node.getChildren().indexOf(at.node.node);
    console.assert(index >= 0, 'Failed to append child layout: cannot get reference child index');
    this.node.insertChild(child.node, index);
    this.invalidateLayout();
  }
  firstChild(): UILayout {
    const it = this._children.begin();
    return it.valid() ? it.data : null;
  }
  lastChild(): UILayout {
    const it = this._children.rbegin();
    return it.valid() ? it.data : null;
  }
  nextSibling(): UILayout {
    const it = this._iterator?.getNext();
    return it && it.valid() ? it.data : null;
  }
  previousSibling(): UILayout {
    const it = this._iterator?.getPrev();
    return it && it.valid() ? it.data : null;
  }
  markDirty() {
    if (this.element && this.element._isText()) {
      this.node.markDirty();
    }
  }
  calcLayout(): void {
    console.assert(!this._parent, 'calcLayout must be called on root element');
    this.node.calculateLayout(Yoga.UNDEFINED, Yoga.UNDEFINED, Yoga.DIRECTION_LTR);
    this.syncComputedRect(0, 0, false);
  }
  updateStyle(val: string): void {
    this.element._updateStyle(val);
  }
  updateBorder(val: number): void {
    this.element._updateBorder();
  }
  updateZIndex(): void {
    this.element._updateZIndex();
  }
  updateCursor(val: string): void {
    this.element._updateCursor(val);
  }
  updateDisplay(val: string): void {
    this.element._updateDisplay(val);
  }
  updateFont(val: string): void {
    this.element.gui?.invalidateLayout();
    this.element._updateFont(val);
  }
  updateFontSize(val: string): void {
    this.element._updateFontSize(val);
  }
  updateFontFamily(val: string): void {
    this.element._updateFontFamily(val);
  }
  updateFontColor(val: string): void {
    this.element._updateFontColor(val);
  }
  updateBorderColor(edge: number, val: ColorRGBA): void {
    switch (edge) {
      case Yoga.EDGE_LEFT:
        this.element._updateBorderLeftColor(val);
        break;
      case Yoga.EDGE_TOP:
        this.element._updateBorderTopColor(val);
        break;
      case Yoga.EDGE_RIGHT:
        this.element._updateBorderRightColor(val);
        break;
      case Yoga.EDGE_BOTTOM:
        this.element._updateBorderBottomColor(val);
        break;
    }
  }
  updateBackgroundColor(val: ColorRGBA): void {
    this.element._updateBackgroundColor(val);
  }
  protected syncComputedRect(px: number, py: number, markChanged: boolean) {
    const paddingLeft = this.node.getComputedPadding(Yoga.EDGE_LEFT);
    const paddingTop = this.node.getComputedPadding(Yoga.EDGE_TOP);
    const paddingRight = this.node.getComputedPadding(Yoga.EDGE_RIGHT);
    const paddingBottom = this.node.getComputedPadding(Yoga.EDGE_BOTTOM);
    const borderLeft = this.node.getComputedBorder(Yoga.EDGE_LEFT);
    const borderTop = this.node.getComputedBorder(Yoga.EDGE_TOP);
    const borderRight = this.node.getComputedBorder(Yoga.EDGE_RIGHT);
    const borderBottom = this.node.getComputedBorder(Yoga.EDGE_BOTTOM);

    const rect = this.actualRect;
    const x = this.node.getComputedLeft() - px;
    const y = this.node.getComputedTop() - py;
    const w = this.node.getComputedWidth();
    const h = this.node.getComputedHeight();
    if (!markChanged && (x !== rect.x || y !== rect.y || w !== rect.z || h !== rect.w)) {
      markChanged = true;
    }
    rect.x = x;
    rect.y = y;
    rect.z = w;
    rect.w = h;

    const clientRect = this.clientRect;
    const cx = paddingLeft + borderLeft;
    const cy = paddingTop + borderTop;
    const cw = Math.max(0, rect.z - paddingLeft - paddingRight - borderLeft - borderRight);
    const ch = Math.max(0, rect.w - paddingTop - paddingBottom - borderTop - borderBottom);
    if (
      !markChanged &&
      (cx !== clientRect.x || cy !== clientRect.y || cw !== clientRect.z || ch !== clientRect.w)
    ) {
      markChanged = true;
    }
    clientRect.x = cx;
    clientRect.y = cy;
    clientRect.z = cw;
    clientRect.w = ch;

    const borderRect = this.borderRect;
    const bx = borderLeft;
    const by = borderTop;
    const bw = Math.max(0, rect.z - borderLeft - borderRight);
    const bh = Math.max(0, rect.w - borderTop - borderBottom);
    if (
      !markChanged &&
      (bx !== borderRect.x || by !== borderRect.y || bw !== borderRect.z || bh !== borderRect.w)
    ) {
      markChanged = true;
    }
    borderRect.x = bx;
    borderRect.y = by;
    borderRect.z = bw;
    borderRect.w = bh;

    this.actualScrollX = 0;
    this.actualScrollY = 0;
    let minX = 0;
    let minY = 0;
    let maxX = clientRect.z;
    let maxY = clientRect.w;
    this._children.forEach((child) => {
      if (child.element._isVisible()) {
        child.syncComputedRect(paddingLeft + borderLeft, paddingTop + borderTop, markChanged);
        const x1 = child.actualRect.x;
        const y1 = child.actualRect.y;
        const x2 = x1 + child.actualRect.z;
        const y2 = y1 + child.actualRect.w;
        minX = Math.min(minX, x1);
        minY = Math.min(minY, y1);
        maxX = Math.max(maxX, x2);
        maxY = Math.max(maxY, y2);
      }
    });
    this.scrollRect = {
      x: minX,
      y: minY,
      z: maxX - minX,
      w: maxY - minY
    };
    this.minScrollX = this.scrollRect.x;
    this.maxScrollX = this.scrollRect.x + this.scrollRect.z - clientRect.z;
    this.minScrollY = this.scrollRect.y;
    this.maxScrollY = this.scrollRect.y + this.scrollRect.w - clientRect.w;

    if (markChanged) {
      this.changeStamp++;
    }
  }
  thisToParentClient(p: Tuple2): Tuple2 {
    p.x += this.actualRect.x;
    p.y += this.actualRect.y;
    return p;
  }
  thisToParent(p: Tuple2): Tuple2 {
    this.thisToParentClient(p);
    if (this._parent) {
      p.x += this._parent.clientRect.x;
      p.y += this._parent.clientRect.y;
    }
    return p;
  }
  clipRectForChildren(): Tuple4 {
    const rcClient = this.clientRect;
    if (this.clippedRect) {
      const x = Math.max(rcClient.x, this.clippedRect.x);
      const y = Math.max(rcClient.y, this.clippedRect.y);
      const z = Math.max(
        0,
        Math.min(this.clippedRect.x + this.clippedRect.z, rcClient.x + rcClient.z) - x
      );
      const w = Math.max(
        0,
        Math.min(this.clippedRect.y + this.clippedRect.w, rcClient.y + rcClient.w) - y
      );
      return { x, y, z, w };
    } else {
      return rcClient;
    }
  }
  toAbsolute(v?: Tuple2): Tuple2 {
    v = v || { x: 0, y: 0 };
    let layout: UILayout = this;
    v.x += layout.actualRect.x;
    v.y += layout.actualRect.y;
    while ((layout = layout._parent)) {
      v.x += layout.actualRect.x + layout.clientRect.x;
      v.y += layout.actualRect.y + layout.clientRect.y;
    }
    return v;
  }
  clipToParent(parent: UILayout): Tuple4 {
    const parentRect: Tuple4 = parent.clipRectForChildren();
    const vThis = this.toAbsolute({ x: 0, y: 0 });
    const vParent = parent.toAbsolute({ x: parentRect.x, y: parentRect.y });
    const x1This = vThis.x;
    const y1This = vThis.y;
    const x2This = x1This + this.actualRect.z;
    const y2This = y1This + this.actualRect.w;
    const x1Parent = vParent.x;
    const y1Parent = vParent.y;
    const x2Parent = x1Parent + parentRect.z;
    const y2Parent = y1Parent + parentRect.w;
    const x1Clip = Math.max(x1This, x1Parent);
    const y1Clip = Math.max(y1This, y1Parent);
    const x2Clip = Math.min(x2This, x2Parent);
    const y2Clip = Math.min(y2This, y2Parent);
    return {
      x: x1Clip - x1This,
      y: y1Clip - y1This,
      z: Math.max(0, x2Clip - x1Clip),
      w: Math.max(0, y2Clip - y1Clip)
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
    let parent: UILayout = this._parent;
    let xClip: Tuple4 = null;
    let yClip: Tuple4 = null;
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
    } else if (yClip === null) {
      this.clippedRect = xClip;
    } else {
      this.clippedRect = {
        x: xClip.x,
        y: yClip.y,
        z: xClip.z,
        w: yClip.w
      };
    }
    if (
      this.clippedRect &&
      this.clippedRect.z === this.actualRect.z &&
      this.clippedRect.w === this.actualRect.w
    ) {
      this.clippedRect = null;
    }
    let markChanged = false;
    if (this.clippedRect !== lastClippedRect) {
      if (this.clippedRect && lastClippedRect) {
        markChanged =
          this.clippedRect.x !== lastClippedRect.x ||
          this.clippedRect.y !== lastClippedRect.y ||
          this.clippedRect.z !== lastClippedRect.z ||
          this.clippedRect.w !== lastClippedRect.w;
      } else {
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
  private _markChanged() {
    this.changeStamp++;
    this._children.forEach((child) => {
      child._markChanged();
    });
  }
  private _isClipX(): boolean {
    return this._parent?.element?.style.overflowX !== 'visible';
  }
  private _isClipY(): boolean {
    return this._parent?.element?.style.overflowY !== 'visible';
  }
}
