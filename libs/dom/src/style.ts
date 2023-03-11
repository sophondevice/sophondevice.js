import { ColorRGBA, parseColor } from '@sophon/base';
import * as Yoga from './typeflex/api';

const overflowConstantMap = {
  hidden: 'hidden',
  auto: 'auto',
  scroll: 'scroll',
  visible: 'visible'
};

const alignmentConstantMap = {
  auto: Yoga.ALIGN_AUTO,
  'flex-start': Yoga.ALIGN_FLEX_START,
  'flex-end': Yoga.ALIGN_FLEX_END,
  center: Yoga.ALIGN_CENTER,
  stretch: Yoga.ALIGN_STRETCH,
  baseline: Yoga.ALIGN_BASELINE,
  'space-between': Yoga.ALIGN_SPACE_BETWEEN,
  'space-around': Yoga.ALIGN_SPACE_AROUND
};

const directionConstantMap = {
  row: Yoga.FLEX_DIRECTION_ROW,
  'row-reverse': Yoga.FLEX_DIRECTION_ROW_REVERSE,
  column: Yoga.FLEX_DIRECTION_COLUMN,
  'column-reverse': Yoga.FLEX_DIRECTION_COLUMN_REVERSE
};

const justifyConstantMap = {
  'flex-start': Yoga.JUSTIFY_FLEX_START,
  center: Yoga.JUSTIFY_CENTER,
  'flex-end': Yoga.JUSTIFY_FLEX_END,
  'space-between': Yoga.JUSTIFY_SPACE_BETWEEN,
  'space-around': Yoga.JUSTIFY_SPACE_AROUND,
  'space-evenly': Yoga.JUSTIFY_SPACE_EVENLY
};

const wrapConstantMap = {
  wrap: Yoga.WRAP_WRAP,
  nowrap: Yoga.WRAP_NO_WRAP,
  'wrap-reverse': Yoga.WRAP_WRAP_REVERSE
};

const positionConstantMap = {
  fixed: Yoga.POSITION_TYPE_ABSOLUTE,
  relative: Yoga.POSITION_TYPE_RELATIVE,
  absolute: Yoga.POSITION_TYPE_ABSOLUTE
};

const displayConstantMap = {
  flex: Yoga.DISPLAY_FLEX,
  none: Yoga.DISPLAY_NONE
};

/** @internal */
export function parseStyleSheet(styles: string, extra?: unknown): StyleSheet {
  const items = styles
    .split(';')
    .map((val) => val.trim())
    .filter((val) => !!val);
  const ss = {} as StyleSheet;
  for (const item of items) {
    const kv = item.split(':').map((val) => val.trim());
    if (kv.length === 2) {
      const setter = styleSetters[kv[0]];
      if (setter) {
        const k = kv[0]
          .split('-')
          .map((val, index) => (index === 0 ? val : val[0].toUpperCase() + val.substr(1)))
          .join('');
        ss[k] = kv[1];
      } else if (extra) {
        extra[kv[0]] = kv[1];
      }
    }
  }
  return ss;
}

/** @internal */
export function serializeStyleSheet(styles: StyleSheet): string {
  let s = '';
  for (const k in styles) {
    if (styles[k]) {
      const kk = k
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .split(' ')
        .map((s) => s.toLowerCase())
        .join('-');
      s = s + `${kk}:${styles[k]};`;
    }
  }
  return s;
}

/** @internal */
export function _normalizeCSSValue(value: string): string[] {
  function _fetch(value: string, pos: number): [string, number] {
    function _issep(ch: string) {
      return ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r';
    }
    let start: number, end: number;
    let quot: string = null;
    for (start = pos; start < value.length && _issep(value[start]); start++);
    if (start === value.length) {
      return ['', value.length];
    }
    if (value[start] === ',') {
      return [',', start + 1];
    }
    if (value[start] === "'" || value[start] === '"') {
      quot = value[start];
    }
    if (quot === null) {
      for (end = start + 1; end < value.length && !_issep(value[end]) && value[end] !== ','; end++);
      return [value.substring(start, end), end];
    } else {
      let backslash = false;
      for (end = start + 1; end < value.length; end++) {
        if (!backslash && value[end] === quot) {
          quot = null;
          end++;
          break;
        }
        if (backslash) {
          backslash = false;
        } else if (value[end] === '\\') {
          backslash = true;
        }
      }
      if (quot !== null) {
        return null;
      }
      if (backslash) {
        end--;
      }
      return [value.substring(start, end), end];
    }
  }
  const ret: string[] = [];
  let pos = 0;
  let last = -1;
  for (;;) {
    const t = _fetch(value, pos);
    if (t === null) {
      return null;
    }
    if (t[0] === '') {
      break;
    }
    if (t[0] === ',') {
      if (ret.length === 0) {
        return null;
      }
      last = ret.length - 1;
      ret[last] = ret[last] + ',';
      pos = t[1];
    } else {
      if (last >= 0) {
        ret[last] = ret[last] + t[0];
        last = -1;
      } else {
        ret.push(t[0]);
      }
      pos = t[1];
    }
  }
  return ret;
}

/** @internal */
export function unescapeCSSString(input: string): string {
  function isHexCharCode(ch: number) {
    const cc0 = 0x30;
    const cc9 = 0x39;
    const cca = 0x61;
    const ccf = 0x66;
    const ccA = 0x41;
    const ccF = 0x46;
    return (ch >= cc0 && ch <= cc9) || (ch >= cca && ch <= ccf) || (ch >= ccA && ch <= ccF);
  }
  let output = '';
  let readoffset = 0;
  let inputoffset = 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch !== '\\' || i === input.length - 1) {
      continue;
    }
    let codepoint = -1;
    if (ch === '\\') {
      const next = input[i + 1];
      switch (next) {
        case '\n':
          codepoint = -2;
          inputoffset = i + 1;
          break;
        case ' ':
        case '!':
        case '"':
        case "'":
        case '#':
        case '$':
        case '%':
        case '&':
        case '\\':
        case '(':
        case ')':
        case '*':
        case '+':
        case ',':
        case '-':
        case '.':
        case '/':
        case ':':
        case '<':
        case '=':
        case '>':
        case '?':
        case '@':
        case '[':
        case ']':
        case '^':
        case '_':
        case '`':
        case '{':
        case '|':
        case '}':
        case '~':
          codepoint = next.charCodeAt(0);
          inputoffset = i + 1;
          break;
      }
      if (codepoint === -1) {
        const cc = next.charCodeAt(0);
        if (isHexCharCode(cc)) {
          // hexa escape
          let f = i + 2;
          while (f < i + 7 && f < input.length) {
            const cf = input.charCodeAt(f);
            if (!isHexCharCode(cf)) {
              break;
            }
            f++;
          }
          codepoint = parseInt(input.substring(i + 1, f), 16);
          inputoffset = f - 1;
          if (f < input.length && input[f] === ' ') {
            inputoffset++;
          }
        } else if (next === '\r' || next === '\f') {
          i++;
          continue;
        } else {
          codepoint = next.charCodeAt(0);
          inputoffset = i + 1;
        }
      }
    }
    if (i - readoffset > 0) {
      output = output + input.substring(readoffset, i);
    }
    i = inputoffset;
    readoffset = i + 1;
    if (codepoint !== -2) {
      output = output + String.fromCharCode(codepoint);
    }
  }
  if (input.length > readoffset) {
    output = output + input.substring(readoffset);
  }
  return output;
}
/** @internal */
export interface StyleSheet {
  display?: string;
  position?: string;
  overflow?: string;
  overflowX?: string;
  overflowY?: string;
  color?: string;
  font?: string;
  fontSize?: string;
  fontFamily?: string;
  fontStyle?: string;
  fontVariant?: string;
  fontWeight?: string;
  fontStretch?: string;
  flexDirection?: string;
  flexWrap?: string;
  flexFlow?: string;
  flexGrow?: string;
  flexShrink?: string;
  flexBasis?: string;
  flex?: string;
  justifyContent?: string;
  alignItems?: string;
  alignContent?: string;
  alignSelf?: string;
  padding?: string;
  paddingLeft?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  margin?: string;
  marginLeft?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  borderWidth?: string;
  borderLeftWidth?: string;
  borderTopWidth?: string;
  borderRightWidth?: string;
  borderBottomWidth?: string;
  borderColor?: string;
  borderLeftColor?: string;
  borderTopColor?: string;
  borderRightColor?: string;
  borderBottomColor?: string;
  left?: string;
  right?: string;
  top?: string;
  bottom?: string;
  width?: string;
  height?: string;
  minWidth?: string;
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;
  zIndex?: string;
  cursor?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  pointerEvents?: string;
}

interface NodeLayout {
  node: Yoga.Node;
  updateZIndex(): void;
  updateCursor(val: string): void;
  updateDisplay(val: string): void;
  updateStyle(val: string): void;
  updateFont(val: string): void;
  updateFontSize(val: string): void;
  updateFontFamily(val: string): void;
  updateFontColor(val: string): void;
  updateBorderColor(edge: number, val: ColorRGBA): void;
  updateBackgroundColor(val: ColorRGBA): void;
  updateBorder(val: number): void;
  invalidateLayout(): void;
}

export class ElementStyle {
  /** @internal */
  _layout: NodeLayout;
  /** @internal */
  _setNonInline: boolean;
  /** @internal */
  _stylesheetInline: StyleSheet;
  /** @internal */
  _stylesheet: StyleSheet;
  /** @internal */
  constructor(layout: NodeLayout) {
    this._layout = layout;
    this._setNonInline = false;
    this._stylesheetInline = {};
    this._stylesheet = {};
  }
  /** @internal */
  reset() {
    this._setNonInline = true;
    for (const k in this._stylesheet) {
      this[k] = '';
    }
    this._stylesheet = {};
    this._setNonInline = false;
  }
  static get defaultBackgroundColor(): ColorRGBA {
    return { r: 0, g: 0, b: 0, a: 0 };
  }
  static get defaultBorderColor(): ColorRGBA {
    return { r: 0, g: 0, b: 0, a: 1 };
  }
  static get defaultFontColor(): ColorRGBA {
    return { r: 0, g: 0, b: 0, a: 1 };
  }
  get display(): string {
    return this._stylesheet.display || '';
  }
  set display(val: string) {
    this.setDisplay(val || '');
  }
  get position(): string {
    return this._stylesheet.position || '';
  }
  set position(val: string) {
    this.setPositionType(val || '');
  }
  get overflow(): string {
    if (!this._stylesheet.overflowX || !this._stylesheet.overflowY) {
      return '';
    } else if (this._stylesheet.overflowX === this._stylesheet.overflowY) {
      return this._stylesheet.overflowX;
    } else {
      return `${this._stylesheet.overflowX} ${this._stylesheet.overflowY}`;
    }
  }
  set overflow(val: string) {
    this.setOverflow(val || '');
  }
  get overflowX(): string {
    return this._stylesheet.overflowX || '';
  }
  set overflowX(val: string) {
    this.setOverflowX(val || '');
  }
  get overflowY(): string {
    return this._stylesheet.overflowY || '';
  }
  set overflowY(val: string) {
    this.setOverflowY(val || '');
  }
  get left(): string | number {
    return this._stylesheet.left || '';
  }
  set left(val: string | number) {
    this.setLeft(val === null ? '' : String(val));
  }
  get top(): string | number {
    return this._stylesheet.top || '';
  }
  set top(val: string | number) {
    this.setTop(val === null ? '' : String(val));
  }
  get right(): string | number {
    return this._stylesheet.right || '';
  }
  set right(val: string | number) {
    this.setRight(val === null ? '' : String(val));
  }
  get bottom(): string | number {
    return this._stylesheet.bottom || '';
  }
  set bottom(val: string | number) {
    this.setBottom(val === null ? '' : String(val));
  }
  get width(): string | number {
    return this._stylesheet.width || '';
  }
  set width(val: string | number) {
    this.setWidth(val === null ? '' : String(val));
  }
  get minWidth(): string | number {
    return this._stylesheet.minWidth || '';
  }
  set minWidth(val: string | number) {
    this.setMinWidth(val === null ? '' : String(val));
  }
  get maxWidth(): string | number {
    return this._stylesheet.maxWidth || '';
  }
  set maxWidth(val: string | number) {
    this.setMaxWidth(val === null ? '' : String(val));
  }
  get height(): string | number {
    return this._stylesheet.height || '';
  }
  set height(val: string | number) {
    this.setHeight(val === null ? '' : String(val));
  }
  get minHeight(): string | number {
    return this._stylesheet.minHeight || '';
  }
  set minHeight(val: string | number) {
    this.setMinHeight(val === null ? '' : String(val));
  }
  get maxHeight(): string | number {
    return this._stylesheet.maxHeight || '';
  }
  set maxHeight(val: string | number) {
    this.setMaxHeight(val === null ? '' : String(val));
  }
  get flexDirection(): string {
    return this._stylesheet.flexDirection || '';
  }
  set flexDirection(val: string) {
    this.setFlexDirection(val || '');
  }
  get flexWrap(): string {
    return this._stylesheet.flexWrap || '';
  }
  set flexWrap(val: string) {
    this.setFlexWrap(val || '');
  }
  get flexFlow(): string | number {
    const grow = this.flexGrow;
    const wrap = this.flexWrap;
    if (grow && wrap) {
      return `${grow} ${wrap}`;
    } else {
      return '';
    }
  }
  set flexFlow(val: string | number) {
    this.setFlexFlow(val === null ? '' : String(val));
  }
  get alignItems(): string {
    return this._stylesheet.alignItems || '';
  }
  set alignItems(val: string) {
    this.setAlignItems(val || '');
  }
  get alignContent(): string {
    return this._stylesheet.alignContent || '';
  }
  set alignContent(val: string) {
    this.setAlignContent(val || '');
  }
  get alignSelf(): string {
    return this._stylesheet.alignSelf || '';
  }
  set alignSelf(val: string) {
    this.setAlignSelf(val || '');
  }
  get justifyContent(): string {
    return this._stylesheet.justifyContent || '';
  }
  set justifyContent(val: string) {
    this.setJustifyContent(val || '');
  }
  get flexGrow(): string | number {
    return this._stylesheet.flexGrow || '';
  }
  set flexGrow(val: string | number) {
    this.setFlexGrow(val === null ? '' : String(val));
  }
  get flexShrink(): string | number {
    return this._stylesheet.flexShrink || '';
  }
  set flexShrink(val: string | number) {
    this.setFlexShrink(val === null ? '' : String(val));
  }
  get flexBasis(): string | number {
    return this._stylesheet.flexBasis || '';
  }
  set flexBasis(val: string | number) {
    this.setFlexBasis(val === null ? '' : String(val));
  }
  get flex(): string | number {
    const grow = this.flexGrow;
    const shrink = this.flexShrink;
    const basis = this.flexBasis;
    if (grow && shrink && basis) {
      return `${grow} ${shrink} ${basis}`;
    } else {
      return '';
    }
  }
  set flex(val: string | number) {
    this.setFlex(val === null ? '' : String(val));
  }
  get borderColor(): string | number {
    const top = this.borderTopColor;
    const right = this.borderRightColor;
    const bottom = this.borderBottomColor;
    const left = this.borderLeftColor;
    if (!top || !right || !bottom || !left) {
      return '';
    } else if (top === bottom && right === left) {
      if (top === right) {
        return top;
      } else {
        return `${top} ${right}`;
      }
    } else if (right === left) {
      return `${top} ${right} ${bottom}`;
    } else {
      return `${top} ${right} ${bottom} ${left}`;
    }
  }
  set borderColor(val: string | number) {
    this.setBorderColor(val === null ? '' : String(val));
  }
  get borderLeftColor(): string | number {
    return this._stylesheet.borderLeftColor || '';
  }
  set borderLeftColor(val: string | number) {
    this.setBorderLeftColor(val === null ? '' : String(val));
  }
  get borderTopColor(): string | number {
    return this._stylesheet.borderTopColor || '';
  }
  set borderTopColor(val: string | number) {
    this.setBorderTopColor(val === null ? '' : String(val));
  }
  get borderRightColor(): string | number {
    return this._stylesheet.borderRightColor || '';
  }
  set borderRightColor(val: string | number) {
    this.setBorderRightColor(val === null ? '' : String(val));
  }
  get borderBottomColor(): string | number {
    return this._stylesheet.borderBottomColor || '';
  }
  set borderBottomColor(val: string | number) {
    this.setBorderBottomColor(val === null ? '' : String(val));
  }
  get borderWidth(): string | number {
    const top = this.borderTopWidth;
    const right = this.borderRightWidth;
    const bottom = this.borderBottomWidth;
    const left = this.borderLeftWidth;
    if (!top || !right || !bottom || !left) {
      return '';
    } else if (top === bottom && right === left) {
      if (top === right) {
        return top;
      } else {
        return `${top} ${right}`;
      }
    } else if (right === left) {
      return `${top} ${right} ${bottom}`;
    } else {
      return `${top} ${right} ${bottom} ${left}`;
    }
  }
  set borderWidth(val: string | number) {
    this.setBorderWidth(val === null ? '' : String(val));
  }
  get borderLeftWidth(): string | number {
    return this._stylesheet.borderLeftWidth || '';
  }
  set borderLeftWidth(val: string | number) {
    this.setBorderLeftWidth(val === null ? '' : String(val));
  }
  get borderTopWidth(): string | number {
    return this._stylesheet.borderTopWidth || '';
  }
  set borderTopWidth(val: string | number) {
    this.setBorderTopWidth(val === null ? '' : String(val));
  }
  get borderRightWidth(): string | number {
    return this._stylesheet.borderRightWidth || '';
  }
  set borderRightWidth(val: string | number) {
    this.setBorderRightWidth(val === null ? '' : String(val));
  }
  get borderBottomWidth(): string | number {
    return this._stylesheet.borderBottomWidth || '';
  }
  set borderBottomWidth(val: string | number) {
    this.setBorderBottomWidth(val === null ? '' : String(val));
  }
  get margin(): string | number {
    const top = this.marginTop;
    const right = this.marginRight;
    const bottom = this.marginBottom;
    const left = this.marginLeft;
    if (!top || !right || !bottom || !left) {
      return '';
    } else if (top === bottom && right === left) {
      if (top === right) {
        return top;
      } else {
        return `${top} ${right}`;
      }
    } else if (right === left) {
      return `${top} ${right} ${bottom}`;
    } else {
      return `${top} ${right} ${bottom} ${left}`;
    }
  }
  set margin(val: string | number) {
    this.setMargin(val === null ? '' : String(val));
  }
  get marginLeft(): string | number {
    return this._stylesheet.marginLeft || '';
  }
  set marginLeft(val: string | number) {
    this.setMarginLeft(val === null ? '' : String(val));
  }
  get marginTop(): string | number {
    return this._stylesheet.marginTop || '';
  }
  set marginTop(val: string | number) {
    this.setMarginTop(val === null ? '' : String(val));
  }
  get marginRight(): string | number {
    return this._stylesheet.marginRight || '';
  }
  set marginRight(val: string | number) {
    this.setMarginRight(val === null ? '' : String(val));
  }
  get marginBottom(): string | number {
    return this._stylesheet.marginBottom || '';
  }
  set marginBottom(val: string | number) {
    this.setMarginBottom(val === null ? '' : String(val));
  }
  get padding(): string | number {
    const top = this.paddingTop;
    const right = this.paddingRight;
    const bottom = this.paddingBottom;
    const left = this.paddingLeft;
    if (!top || !right || !bottom || !left) {
      return '';
    } else if (top === bottom && right === left) {
      if (top === right) {
        return top;
      } else {
        return `${top} ${right}`;
      }
    } else if (right === left) {
      return `${top} ${right} ${bottom}`;
    } else {
      return `${top} ${right} ${bottom} ${left}`;
    }
  }
  set padding(val: string | number) {
    this.setPadding(val === null ? '' : String(val));
  }
  get paddingLeft(): string | number {
    return this._stylesheet.paddingLeft || '';
  }
  set paddingLeft(val: string | number) {
    this.setPaddingLeft(val === null ? '' : String(val));
  }
  get paddingTop(): string | number {
    return this._stylesheet.paddingTop || '';
  }
  set paddingTop(val: string | number) {
    this.setPaddingTop(val === null ? '' : String(val));
  }
  get paddingRight(): string | number {
    return this._stylesheet.paddingRight || '';
  }
  set paddingRight(val: string | number) {
    this.setPaddingRight(val === null ? '' : String(val));
  }
  get paddingBottom(): string | number {
    return this._stylesheet.paddingBottom || '';
  }
  set paddingBottom(val: string | number) {
    this.setPaddingBottom(val === null ? '' : String(val));
  }
  get zIndex(): string | number {
    return this._stylesheet.zIndex || '';
  }
  set zIndex(val: string | number) {
    this.setZIndex(val === null ? '' : String(val));
  }
  get cursor(): string {
    return this._stylesheet.cursor || '';
  }
  set cursor(val: string) {
    this.setCursor(val || '');
  }
  get backgroundColor(): string {
    return this._stylesheet.backgroundColor || '';
  }
  set backgroundColor(val: string) {
    this.setBackgroundColor(val || '');
  }
  get backgroundImage(): string {
    return this._stylesheet.backgroundImage || '';
  }
  set backgroundImage(val: string) {
    this.setBackgroundImage(val || '');
  }
  get font(): string {
    const fontSize = this.fontSize;
    const fontFamily = this.fontFamily;
    return fontSize && fontFamily ? `${fontSize} ${fontFamily}` : '';
  }
  set font(val: string) {
    this.setFont(val || '');
  }
  get fontSize(): string {
    return this._stylesheet.fontSize || '';
  }
  set fontSize(val: string) {
    this.setFontSize(val);
  }
  get fontFamily(): string {
    return this._stylesheet.fontFamily || '';
  }
  set fontFamily(val: string) {
    this.setFontFamily(val);
  }
  get color(): string {
    return this._stylesheet.color || '';
  }
  set color(val: string) {
    this.setFontColor(val || '');
  }
  get pointerEvents(): string {
    return this._stylesheet.pointerEvents || '';
  }
  set pointerEvents(val: string) {
    this.setPointerEvents(val || '');
  }
  /** @internal */
  unescapeCSSString(s: string): string {
    return unescapeCSSString(s);
  }
  /** @internal */
  _syncValue(k: string, val: string) {
    if (val === '') {
      delete this._stylesheet[k];
      if (!this._setNonInline) {
        delete this._stylesheetInline[k];
      }
    } else {
      this._stylesheet[k] = val;
      if (!this._setNonInline) {
        this._stylesheetInline[k] = val;
      }
    }
    if (!this._setNonInline) {
      this._layout.updateStyle(serializeStyleSheet(this._stylesheetInline));
    }
  }
  /** @internal */
  _syncValues(values: { [k: string]: string }) {
    for (const k in values) {
      const val = values[k];
      val ? (this._stylesheet[k] = val) : delete this._stylesheet[k];
      if (!this._setNonInline) {
        val ? (this._stylesheetInline[k] = val) : delete this._stylesheetInline[k];
        this._layout.updateStyle(serializeStyleSheet(this._stylesheetInline));
      }
    }
  }
  /** @internal */
  setOverflow(val: string) {
    const values = ElementStyle._normalizeCSSValue(val);
    if (values) {
      if (values.length === 1) {
        this.setOverflowX(values[0]);
        this.setOverflowY(values[0]);
      } else if (values.length === 2) {
        this.setOverflowX(values[0]);
        this.setOverflowY(values[1]);
      }
    }
  }
  /** @internal */
  setOverflowX(val: string) {
    if (val !== this._stylesheet.overflowX && (val === '' || overflowConstantMap[val])) {
      this._syncValue('overflowX', val);
      this._layout.invalidateLayout();
    }
  }
  /** @internal */
  setOverflowY(val: string) {
    if (val !== this._stylesheet.overflowY && (val === '' || overflowConstantMap[val])) {
      this._syncValue('overflowY', val);
      this._layout.invalidateLayout();
    }
  }
  /** @internal */
  getBorderLeft(): number {
    return this._layout.node.getBorder(Yoga.EDGE_LEFT) || 0;
  }
  /** @internal */
  getBorderTop(): number {
    return this._layout.node.getBorder(Yoga.EDGE_TOP) || 0;
  }
  /** @internal */
  getBorderRight(): number {
    return this._layout.node.getBorder(Yoga.EDGE_RIGHT) || 0;
  }
  /** @internal */
  getBorderBottom(): number {
    return this._layout.node.getBorder(Yoga.EDGE_BOTTOM) || 0;
  }
  /** @internal */
  getPaddingLeft(): number {
    return this._layout.node.getPadding(Yoga.EDGE_LEFT).value || 0;
  }
  /** @internal */
  getPaddingTop(): number {
    return this._layout.node.getPadding(Yoga.EDGE_TOP).value || 0;
  }
  /** @internal */
  getPaddingRight(): number {
    return this._layout.node.getPadding(Yoga.EDGE_RIGHT).value || 0;
  }
  /** @internal */
  getPaddingBottom(): number {
    return this._layout.node.getPadding(Yoga.EDGE_BOTTOM).value || 0;
  }
  /** @internal */
  private _checkStringConstant(
    k: string,
    v: string,
    defaultValue: any,
    constantMap: { [k: string]: any }
  ): any {
    if (v !== this[k] && (v === '' || constantMap[v] !== undefined)) {
      const val = v === '' ? defaultValue : constantMap[v];
      this._syncValue(k, v);
      return val;
    }
  }
  /** @internal */
  setDisplay(val: string) {
    const v = this._checkStringConstant('display', val, Yoga.DISPLAY_FLEX, displayConstantMap);
    if (v !== undefined) {
      this._layout.node.setDisplay(v);
      this._layout.updateDisplay(val);
      this._layout.invalidateLayout();
    }
  }
  /** @internal */
  setPositionType(val: string) {
    const v = this._checkStringConstant('position', val, Yoga.POSITION_TYPE_RELATIVE, positionConstantMap);
    if (v !== undefined) {
      this._layout.node.setPositionType(v);
      this._layout.invalidateLayout();
    }
  }
  /** @internal */
  private _setPosition(edge: number, k: string, v: string) {
    const position = v === '' ? 0 : this.parsePosition(v);
    if (v !== '') {
      v = typeof position === 'number' ? `${position}px` : position;
    }
    if (v !== undefined && v !== this[k]) {
      this._syncValue(k, v);
      this._layout.node.setPosition(edge, position);
      this._layout.invalidateLayout();
    }
  }
  /** @internal */
  setLeft(val: string) {
    this._setPosition(Yoga.EDGE_LEFT, 'left', val);
  }
  /** @internal */
  setTop(val: string) {
    this._setPosition(Yoga.EDGE_TOP, 'top', val);
  }
  /** @internal */
  setRight(val: string) {
    this._setPosition(Yoga.EDGE_RIGHT, 'right', val);
  }
  /** @internal */
  setBottom(val: string) {
    this._setPosition(Yoga.EDGE_BOTTOM, 'bottom', val);
  }
  /** @internal */
  setWidth(val: string) {
    const w = val === '' ? 'auto' : this.parseLengthOrAuto(val);
    val = typeof w === 'number' ? `${w}px` : w;
    if (val !== undefined && val !== this.width) {
      this._syncValue('width', val);
      this._layout.node.setWidth(w);
      this._layout.invalidateLayout();
    }
  }
  /** @internal */
  setMinWidth(val: string) {
    const w = val === '' ? undefined : this.parseLength(val);
    val = typeof w === 'number' ? `${w}px` : w;
    if (val !== this.minWidth) {
      this._syncValue('minWidth', val);
      this._layout.node.setMinWidth(w);
      this._layout.invalidateLayout();
    }
  }
  /** @internal */
  setMaxWidth(val: string) {
    const w = val === '' ? undefined : this.parseLength(val);
    val = typeof w === 'number' ? `${w}px` : w;
    if (val !== this.maxWidth) {
      this._syncValue('maxWidth', val);
      this._layout.node.setMaxWidth(w);
      this._layout.invalidateLayout();
    }
  }
  /** @internal */
  setHeight(val: string) {
    const h = val === '' ? 'auto' : this.parseLengthOrAuto(val);
    val = typeof h === 'number' ? `${h}px` : h;
    if (val !== undefined && val !== this.height) {
      this._syncValue('height', val);
      this._layout.node.setHeight(h);
      this._layout.invalidateLayout();
    }
  }
  /** @internal */
  setMinHeight(val: string) {
    const h = val === '' ? undefined : this.parseLength(val);
    val = typeof h === 'number' ? `${h}px` : h;
    if (val !== this.minHeight) {
      this._syncValue('minHeight', val);
      this._layout.node.setMinHeight(h);
      this._layout.invalidateLayout();
    }
  }
  /** @internal */
  setMaxHeight(val: string) {
    const h = val === '' ? undefined : this.parseLength(val);
    val = typeof h === 'number' ? `${h}px` : h;
    if (val !== this.maxHeight) {
      this._syncValue('maxHeight', val);
      this._layout.node.setMaxHeight(h);
      this._layout.invalidateLayout();
    }
  }
  /** @internal */
  setFlexDirection(val: string) {
    const v = this._checkStringConstant('flexDirection', val, Yoga.FLEX_DIRECTION_ROW, directionConstantMap);
    if (v !== undefined) {
      this._layout.node.setFlexDirection(v);
      this._layout.invalidateLayout();
    }
  }
  /** @internal */
  setFlexWrap(val: string) {
    const v = this._checkStringConstant('flexWrap', val, Yoga.WRAP_NO_WRAP, wrapConstantMap);
    if (v !== undefined) {
      this._layout.node.setFlexWrap(v);
      this._layout.invalidateLayout();
    }
  }
  /** @internal */
  setFlexFlow(val: string) {
    if (val !== this.flexFlow) {
      if (val === '') {
        this.setFlexDirection('');
        this.setFlexWrap('');
      } else {
        let invalid = false;
        let direction = '';
        let wrap = '';
        const tuples = val.trim().split(/\s+/);
        if (tuples.length < 3) {
          for (let i = 0; i < tuples.length; i++) {
            if (direction === '') {
              if (directionConstantMap[tuples[i]] !== undefined) {
                direction = tuples[i];
                continue;
              }
            }
            if (wrap === '') {
              if (wrapConstantMap[tuples[i]] !== undefined) {
                wrap = tuples[i];
                continue;
              }
            }
            invalid = true;
            break;
          }
          if (!invalid) {
            this.setFlexDirection(direction);
            this.setFlexWrap(wrap);
          }
        }
      }
    }
  }
  /** @internal */
  setAlignItems(val: string) {
    const v = this._checkStringConstant('alignItems', val, Yoga.ALIGN_STRETCH, alignmentConstantMap);
    if (v !== undefined) {
      this._layout.node.setAlignItems(v);
      this._layout.invalidateLayout();
    }
  }
  /** @internal */
  setAlignContent(val: string) {
    const v = this._checkStringConstant('alignContent', val, Yoga.ALIGN_FLEX_START, alignmentConstantMap);
    if (v !== undefined) {
      this._layout.node.setAlignContent(v);
      this._layout.invalidateLayout();
    }
  }
  /** @internal */
  setAlignSelf(val: string) {
    const v = this._checkStringConstant('alignSelf', val, Yoga.ALIGN_AUTO, alignmentConstantMap);
    if (v !== undefined) {
      this._layout.node.setAlignSelf(v);
      this._layout.invalidateLayout();
    }
  }
  /** @internal */
  setJustifyContent(val: string) {
    const v = this._checkStringConstant('justifyContent', val, Yoga.JUSTIFY_FLEX_START, justifyConstantMap);
    if (v !== undefined) {
      this._layout.node.setJustifyContent(v);
      this._layout.invalidateLayout();
    }
  }
  /** @internal */
  setFlexGrow(val: string) {
    const grow = val === '' ? undefined : this.parseGrowOrShrink(val);
    if (val !== '' && typeof grow === 'number') {
      val = String(grow);
    }
    if ((val === '' || grow !== undefined) && val !== this.flexGrow) {
      this._syncValue('flexGrow', val);
      this._layout.node.setFlexGrow(grow);
      this._layout.invalidateLayout();
    }
  }
  /** @internal */
  setFlexShrink(val: string) {
    const shrink = val === '' ? undefined : this.parseGrowOrShrink(val);
    if (val !== '' && typeof shrink === 'number') {
      val = String(shrink);
    }
    if ((val === '' || shrink !== undefined) && val !== this.flexShrink) {
      this._syncValue('flexShrink', val);
      this._layout.node.setFlexShrink(shrink);
      this._layout.invalidateLayout();
    }
  }
  /** @internal */
  setFlexBasis(val: string) {
    const basis = val === '' ? 'auto' : this.parseLengthOrAuto(val);
    val = typeof basis === 'number' ? `${basis}px` : basis;
    if (val !== undefined && val !== this.flexBasis) {
      this._syncValue('flexBasis', val);
      this._layout.node.setFlexBasis(basis);
      this._layout.invalidateLayout();
    }
  }
  /** @internal */
  setFlex(val: string) {
    if (val !== this.flex || (val === '' && (this.flexGrow || this.flexShrink || this.flexBasis))) {
      if (val === '') {
        this.setFlexGrow('');
        this.setFlexShrink('');
        this.setFlexBasis('');
      } else {
        let invalid = false;
        const values: string[] = [];
        const tuples = String(val).trim().split(/\s+/);
        if (tuples.length < 4) {
          for (let i = 0; i < tuples.length; i++) {
            const val = i < 2 ? this.parseGrowOrShrink(tuples[i]) : this.parseLengthOrAuto(tuples[i]);
            if (val === undefined) {
              invalid = true;
              break;
            }
            values.push(tuples[i]);
          }
          if (!invalid) {
            if (values.length > 0) {
              this.setFlexGrow(values[0]);
            } else {
              this.setFlexGrow('');
              this.setFlexShrink('');
              this.setFlexBasis('');
            }
            if (values.length > 1) {
              this.setFlexShrink(values[1]);
            } else {
              this.setFlexShrink('');
              this.setFlexBasis('');
            }
            if (values.length > 2) {
              this.setFlexBasis(values[2]);
            } else {
              this.setFlexBasis('');
            }
            this._layout.invalidateLayout();
          }
        }
      }
    }
  }
  /** @internal */
  setMarginLeft(val: string) {
    this._setMargin(Yoga.EDGE_LEFT, 'marginLeft', val);
  }
  /** @internal */
  setMarginTop(val: string) {
    this._setMargin(Yoga.EDGE_TOP, 'marginTop', val);
  }
  /** @internal */
  setMarginRight(val: string) {
    this._setMargin(Yoga.EDGE_RIGHT, 'marginRight', val);
  }
  /** @internal */
  setMarginBottom(val: string) {
    this._setMargin(Yoga.EDGE_BOTTOM, 'marginBottom', val);
  }
  /** @internal */
  setMargin(val: string) {
    if (
      val !== this.margin ||
      (val === '' && (this.marginLeft || this.marginTop || this.marginRight || this.marginBottom))
    ) {
      if (val === '') {
        this.setMarginLeft('');
        this.setMarginTop('');
        this.setMarginRight('');
        this.setMarginBottom('');
      } else {
        let invalid = false;
        const values: string[] = [];
        const tuples = val.trim().split(/\s+/);
        if (tuples.length < 5) {
          for (let i = 0; i < tuples.length; i++) {
            const margin = this.parseMargin(tuples[i]);
            if (margin === undefined) {
              invalid = true;
              break;
            }
            values.push(tuples[i]);
          }
          if (!invalid) {
            switch (values.length) {
              case 1:
                this.setMarginTop(values[0]);
                this.setMarginRight(values[0]);
                this.setMarginBottom(values[0]);
                this.setMarginLeft(values[0]);
                break;
              case 2:
                this.setMarginTop(values[0]);
                this.setMarginRight(values[1]);
                this.setMarginBottom(values[0]);
                this.setMarginLeft(values[1]);
                break;
              case 3:
                this.setMarginTop(values[0]);
                this.setMarginRight(values[1]);
                this.setMarginBottom(values[2]);
                this.setMarginLeft(values[1]);
                break;
              case 4:
                this.setMarginTop(values[0]);
                this.setMarginRight(values[1]);
                this.setMarginBottom(values[2]);
                this.setMarginLeft(values[3]);
                break;
            }
            this._layout.invalidateLayout();
          }
        }
      }
    }
  }
  /** @internal */
  setBorderLeftColor(val: string) {
    this._setBorderColor(Yoga.EDGE_LEFT, 'borderLeftColor', val);
  }
  /** @internal */
  setBorderTopColor(val: string) {
    this._setBorderColor(Yoga.EDGE_TOP, 'borderTopColor', val);
  }
  /** @internal */
  setBorderRightColor(val: string) {
    this._setBorderColor(Yoga.EDGE_RIGHT, 'borderRightColor', val);
  }
  /** @internal */
  setBorderBottomColor(val: string) {
    this._setBorderColor(Yoga.EDGE_BOTTOM, 'borderBottomColor', val);
  }
  /** @internal */
  setBorderColor(val: string) {
    if (
      val !== this.borderColor ||
      (val === '' &&
        (this.borderLeftColor || this.borderTopColor || this.borderRightColor || this.borderBottomColor))
    ) {
      if (val === '') {
        this.setBorderLeftColor('');
        this.setBorderTopColor('');
        this.setBorderRightColor('');
        this.setBorderBottomColor('');
      } else {
        let invalid = false;
        const values: string[] = [];
        const tuples = val.trim().split(/\s+/);
        if (tuples.length < 5) {
          for (let i = 0; i < tuples.length; i++) {
            const color = parseColor(tuples[i]);
            if (color === undefined) {
              invalid = true;
              break;
            }
            values.push(tuples[i]);
          }
          if (!invalid) {
            switch (values.length) {
              case 1:
                this.setBorderTopColor(values[0]);
                this.setBorderRightColor(values[0]);
                this.setBorderBottomColor(values[0]);
                this.setBorderLeftColor(values[0]);
                break;
              case 2:
                this.setBorderTopColor(values[0]);
                this.setBorderRightColor(values[1]);
                this.setBorderBottomColor(values[0]);
                this.setBorderLeftColor(values[1]);
                break;
              case 3:
                this.setBorderTopColor(values[0]);
                this.setBorderRightColor(values[1]);
                this.setBorderBottomColor(values[2]);
                this.setBorderLeftColor(values[1]);
                break;
              case 4:
                this.setBorderTopColor(values[0]);
                this.setBorderRightColor(values[1]);
                this.setBorderBottomColor(values[2]);
                this.setBorderLeftColor(values[3]);
                break;
            }
            this._layout.invalidateLayout();
          }
        }
      }
    }
  }
  /** @internal */
  setBorderLeftWidth(val: string) {
    this._setBorderWidth(Yoga.EDGE_LEFT, 'borderLeftWidth', val);
  }
  /** @internal */
  setBorderTopWidth(val: string) {
    this._setBorderWidth(Yoga.EDGE_TOP, 'borderTopWidth', val);
  }
  /** @internal */
  setBorderRightWidth(val: string) {
    this._setBorderWidth(Yoga.EDGE_RIGHT, 'borderRightWidth', val);
  }
  /** @internal */
  setBorderBottomWidth(val: string) {
    this._setBorderWidth(Yoga.EDGE_BOTTOM, 'borderBottomWidth', val);
  }
  /** @internal */
  setBorderWidth(val: string) {
    if (
      val !== this.borderWidth ||
      (val === '' &&
        (this.borderLeftWidth || this.borderTopWidth || this.borderRightWidth || this.borderBottomWidth))
    ) {
      if (val === '') {
        this.setBorderLeftWidth('');
        this.setBorderTopWidth('');
        this.setBorderRightWidth('');
        this.setBorderBottomWidth('');
      } else {
        let invalid = false;
        const values: string[] = [];
        const tuples = val.trim().split(/\s+/);
        if (tuples.length < 5) {
          for (let i = 0; i < tuples.length; i++) {
            const border = this.parseFixedNonNegative(tuples[i]);
            if (border === undefined) {
              invalid = true;
              break;
            }
            values.push(tuples[i]);
          }
          if (!invalid) {
            switch (values.length) {
              case 1:
                this.setBorderTopWidth(values[0]);
                this.setBorderRightWidth(values[0]);
                this.setBorderBottomWidth(values[0]);
                this.setBorderLeftWidth(values[0]);
                break;
              case 2:
                this.setBorderTopWidth(values[0]);
                this.setBorderRightWidth(values[1]);
                this.setBorderBottomWidth(values[0]);
                this.setBorderLeftWidth(values[1]);
                break;
              case 3:
                this.setBorderTopWidth(values[0]);
                this.setBorderRightWidth(values[1]);
                this.setBorderBottomWidth(values[2]);
                this.setBorderLeftWidth(values[1]);
                break;
              case 4:
                this.setBorderTopWidth(values[0]);
                this.setBorderRightWidth(values[1]);
                this.setBorderBottomWidth(values[2]);
                this.setBorderLeftWidth(values[3]);
                break;
            }
            this._layout.invalidateLayout();
          }
        }
      }
    }
  }
  /** @internal */
  setPaddingLeft(val: string) {
    this._setPadding(Yoga.EDGE_LEFT, 'paddingLeft', val);
  }
  /** @internal */
  setPaddingTop(val: string) {
    this._setPadding(Yoga.EDGE_TOP, 'paddingTop', val);
  }
  /** @internal */
  setPaddingRight(val: string) {
    this._setPadding(Yoga.EDGE_RIGHT, 'paddingRight', val);
  }
  /** @internal */
  setPaddingBottom(val: string) {
    this._setPadding(Yoga.EDGE_BOTTOM, 'paddingBottom', val);
  }
  /** @internal */
  setPadding(val: string) {
    if (
      val !== this.padding ||
      (val === '' && (this.paddingLeft || this.paddingTop || this.paddingRight || this.paddingBottom))
    ) {
      if (val === '') {
        this.setPaddingLeft('');
        this.setPaddingTop('');
        this.setPaddingBottom('');
        this.setPaddingRight('');
      } else {
        let invalid = false;
        const values: string[] = [];
        const tuples = val.trim().split(/\s+/);
        if (tuples.length < 5) {
          for (let i = 0; i < tuples.length; i++) {
            const padding = this.parseFixedNonNegative(tuples[i]);
            if (padding === undefined) {
              invalid = true;
              break;
            }
            values.push(tuples[i]);
          }
          if (!invalid) {
            switch (values.length) {
              case 1:
                this.setPaddingTop(values[0]);
                this.setPaddingRight(values[0]);
                this.setPaddingBottom(values[0]);
                this.setPaddingLeft(values[0]);
                break;
              case 2:
                this.setPaddingTop(values[0]);
                this.setPaddingRight(values[1]);
                this.setPaddingBottom(values[0]);
                this.setPaddingLeft(values[1]);
                break;
              case 3:
                this.setPaddingTop(values[0]);
                this.setPaddingRight(values[1]);
                this.setPaddingBottom(values[2]);
                this.setPaddingLeft(values[1]);
                break;
              case 4:
                this.setPaddingTop(values[0]);
                this.setPaddingRight(values[1]);
                this.setPaddingBottom(values[2]);
                this.setPaddingLeft(values[3]);
                break;
            }
            this._layout.invalidateLayout();
          }
        }
      }
    }
  }
  /** @internal */
  setZIndex(val: string) {
    const z = val === '' ? 0 : Number(val);
    if (!Number.isNaN(z)) {
      val = String(z);
    }
    if (!Number.isNaN(z) && val !== this.zIndex) {
      this._syncValue('zIndex', val);
      this._layout.updateZIndex();
    }
  }
  /** @internal */
  setCursor(val: string) {
    val = val || 'default';
    if (this._stylesheet.cursor !== val) {
      this._syncValue('cursor', val);
      this._layout.updateCursor(val);
    }
  }
  /** @internal */
  setBackgroundColor(val: string) {
    if (this._stylesheet.backgroundColor !== val) {
      const color = val !== '' ? parseColor(val) : ElementStyle.defaultBackgroundColor;
      if (color) {
        this._syncValue('backgroundColor', val);
        this._layout.updateBackgroundColor(color);
      }
    }
  }
  /** @internal */
  setBackgroundImage(val: string) {
    if (this._stylesheet.backgroundImage !== val) {
      this._syncValue('backgroundImage', val);
    }
  }
  /** @internal */
  setFontSize(val: string) {
    const size = val === '' ? undefined : this.parseFixedNonNegative(val);
    if (size !== undefined) {
      val = typeof size === 'number' ? `${size}px` : val;
    }
    if (val !== this.fontSize) {
      this._syncValue('fontSize', val);
      this._layout.updateFontSize(val);
    }
  }
  /** @internal */
  setFontFamily(val: string) {
    if (val !== this.fontFamily) {
      this._syncValue('fontFamily', val);
      this._layout.updateFontFamily(val);
    }
  }
  /** @internal */
  setFont(val: string) {
    if (val === '') {
      this.setFontSize('');
      this.setFontFamily('');
    } else {
      const fontParts = _normalizeCSSValue(val);
      if (fontParts.length > 1) {
        const fontSize = fontParts[fontParts.length - 2];
        const fontFamily = fontParts[fontParts.length - 1];
        this.setFontSize(fontSize);
        this.setFontFamily(fontFamily);
      }
    }
  }
  /** @internal */
  setFontColor(val: string) {
    if (this._stylesheet.color !== val) {
      this._syncValue('color', val);
      this._layout.updateFontColor(val);
    }
  }
  /** @internal */
  setPointerEvents(val: string) {
    val = val || 'auto';
    if (this._stylesheet.pointerEvents !== val) {
      this._syncValue('pointerEvents', val);
    }
  }
  /** @internal */
  applyStyles(styles: string, inline: boolean) {
    this._setNonInline = !inline;
    const items = styles
      .split(';')
      .map((val) => val.trim())
      .filter((val) => !!val);
    for (const item of items) {
      const kv = item.split(':').map((val) => val.trim());
      if (kv.length === 2) {
        const setter = styleSetters[kv[0]];
        setter && setter.call(this, kv[1]);
      }
    }
    this._setNonInline = false;
  }
  /** @internal */
  applyStyleSheet(stylesheet: StyleSheet, inline: boolean) {
    this._setNonInline = !inline;
    for (const k in stylesheet) {
      const v = stylesheet[k];
      if (v) {
        this[k] = v;
      }
    }
    this._setNonInline = false;
  }
  /** @internal */
  private parseGrowOrShrink(s: string) {
    const val = Number(s);
    if (!Number.isNaN(val) && val >= 0) {
      return val;
    }
  }
  /** @internal */
  private parseLengthOrAuto(s: string): string | number {
    if (s === 'auto') {
      return s;
    } else {
      return this.parseLength(s);
    }
  }
  /** @internal */
  private parseFixed(s: string): number {
    if (s.length > 2 && s.substr(s.length - 2, 2) === 'px') {
      s = s.substr(0, s.length - 2);
    }
    const pixels = Number(s);
    if (!Number.isNaN(pixels)) {
      return pixels;
    }
  }
  /** @internal */
  private parseFixedNonNegative(s: string): number {
    const pixels = this.parseFixed(s);
    if (pixels !== undefined && pixels >= 0) {
      return pixels;
    }
  }
  /** @internal */
  private parseLength(s: string): string | number {
    if (s[s.length - 1] === '%') {
      const percent = Number(s.substr(0, s.length - 1));
      if (!Number.isNaN(percent) && percent >= 0) {
        return s;
      }
    } else {
      const pixels = this.parseFixed(s);
      if (pixels >= 0) {
        return pixels;
      }
    }
  }
  /** @internal */
  private parsePosition(s: string): string | number {
    if (s[s.length - 1] === '%') {
      const percent = Number(s.substr(0, s.length - 1));
      if (!Number.isNaN(percent) && percent >= 0) {
        return s;
      }
    } else {
      return this.parseFixed(s);
    }
  }
  /** @internal */
  private parseMargin(s: string): string | number {
    if (s === 'auto') {
      return s;
    } else {
      return this.parsePosition(s);
    }
  }
  /** @internal */
  private _setPadding(edge: number, k: string, v: string) {
    const padding = v === '' ? undefined : this.parseFixedNonNegative(v);
    if (padding !== undefined) {
      v = typeof padding === 'number' ? `${padding}px` : padding;
    }
    if ((v === '' || padding !== undefined) && v !== this[k]) {
      this._syncValue(k, v);
      this._layout.node.setPadding(edge, padding);
      this._layout.invalidateLayout();
    }
  }
  /** @internal */
  private _setMargin(edge: number, k: string, v: string) {
    const margin = v === '' ? undefined : this.parseMargin(v);
    if (margin !== undefined) {
      v = typeof margin === 'number' ? `${margin}px` : margin;
    }
    if ((v === '' || margin !== undefined) && v !== this[k]) {
      this._syncValue(k, v);
      this._layout.node.setMargin(edge, margin);
      this._layout.invalidateLayout();
    }
  }
  /** @internal */
  private _setBorderColor(edge: number, k: string, v: string) {
    if (this._stylesheet[k] !== v) {
      const color = v !== '' ? parseColor(v) : ElementStyle.defaultBorderColor;
      if (color) {
        this._syncValue(k, v);
        this._layout.updateBorderColor(edge, color);
      }
    }
  }
  /** @internal */
  private _setBorderWidth(edge: number, k: string, v: string) {
    const border = v === '' ? undefined : this.parseFixedNonNegative(v);
    if (border !== undefined) {
      v = typeof border === 'number' ? `${border}px` : border;
    }
    if ((v === '' || border !== undefined) && v !== this[k]) {
      this._syncValue(k, v);
      this._layout.node.setBorder(edge, border);
      this._layout.invalidateLayout();
    }
  }
  /** @internal */
  static _normalizeCSSValue(value: string): string[] {
    return _normalizeCSSValue(value);
  }
}

const styleSetters: { [k: string]: (v: string) => void } = {
  'border-color': ElementStyle.prototype.setBorderColor,
  'border-left-color': ElementStyle.prototype.setBorderLeftColor,
  'border-top-color': ElementStyle.prototype.setBorderTopColor,
  'border-right-color': ElementStyle.prototype.setBorderRightColor,
  'border-bottom-color': ElementStyle.prototype.setBorderBottomColor,
  'border-width': ElementStyle.prototype.setBorderWidth,
  'border-left-width': ElementStyle.prototype.setBorderLeftWidth,
  'border-top-width': ElementStyle.prototype.setBorderTopWidth,
  'border-right-width': ElementStyle.prototype.setBorderRightWidth,
  'border-bottom-width': ElementStyle.prototype.setBorderBottomWidth,
  margin: ElementStyle.prototype.setMargin,
  'margin-left': ElementStyle.prototype.setMarginLeft,
  'margin-top': ElementStyle.prototype.setMarginTop,
  'margin-right': ElementStyle.prototype.setMarginRight,
  'margin-bottom': ElementStyle.prototype.setMarginBottom,
  padding: ElementStyle.prototype.setPadding,
  'padding-left': ElementStyle.prototype.setPaddingLeft,
  'padding-right': ElementStyle.prototype.setPaddingRight,
  'padding-top': ElementStyle.prototype.setPaddingTop,
  'padding-bottom': ElementStyle.prototype.setPaddingBottom,
  position: ElementStyle.prototype.setPositionType,
  overflow: ElementStyle.prototype.setOverflow,
  'overflow-x': ElementStyle.prototype.setOverflowX,
  'overflow-y': ElementStyle.prototype.setOverflowY,
  display: ElementStyle.prototype.setDisplay,
  left: ElementStyle.prototype.setLeft,
  top: ElementStyle.prototype.setTop,
  right: ElementStyle.prototype.setRight,
  bottom: ElementStyle.prototype.setBottom,
  width: ElementStyle.prototype.setWidth,
  height: ElementStyle.prototype.setHeight,
  'min-width': ElementStyle.prototype.setMinWidth,
  'max-width': ElementStyle.prototype.setMaxWidth,
  'min-height': ElementStyle.prototype.setMinHeight,
  'max-height': ElementStyle.prototype.setMaxHeight,
  'flex-flow': ElementStyle.prototype.setFlexFlow,
  'flex-direction': ElementStyle.prototype.setFlexDirection,
  'flex-wrap': ElementStyle.prototype.setFlexWrap,
  'align-content': ElementStyle.prototype.setAlignContent,
  'align-items': ElementStyle.prototype.setAlignItems,
  'align-self': ElementStyle.prototype.setAlignSelf,
  'justify-content': ElementStyle.prototype.setJustifyContent,
  'flex-grow': ElementStyle.prototype.setFlexGrow,
  'flex-shrink': ElementStyle.prototype.setFlexShrink,
  'flex-basis': ElementStyle.prototype.setFlexBasis,
  flex: ElementStyle.prototype.setFlex,
  'z-index': ElementStyle.prototype.setZIndex,
  cursor: ElementStyle.prototype.setCursor,
  'background-color': ElementStyle.prototype.setBackgroundColor,
  'background-image': ElementStyle.prototype.setBackgroundImage,
  font: ElementStyle.prototype.setFont,
  'font-size': ElementStyle.prototype.setFontSize,
  'font-family': ElementStyle.prototype.setFontFamily,
  color: ElementStyle.prototype.setFontColor,
  'pointer-events': ElementStyle.prototype.setPointerEvents
};
