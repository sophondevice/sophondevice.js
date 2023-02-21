/** sophon base library */
import { EDGE_LEFT, EDGE_TOP, EDGE_RIGHT, EDGE_BOTTOM, DISPLAY_FLEX, POSITION_TYPE_RELATIVE, FLEX_DIRECTION_ROW, WRAP_NO_WRAP, ALIGN_STRETCH, ALIGN_FLEX_START, ALIGN_AUTO, JUSTIFY_FLEX_START, ALIGN_FLEX_END, ALIGN_CENTER, ALIGN_BASELINE, ALIGN_SPACE_BETWEEN, ALIGN_SPACE_AROUND, FLEX_DIRECTION_ROW_REVERSE, FLEX_DIRECTION_COLUMN, FLEX_DIRECTION_COLUMN_REVERSE, JUSTIFY_CENTER, JUSTIFY_FLEX_END, JUSTIFY_SPACE_BETWEEN, JUSTIFY_SPACE_AROUND, JUSTIFY_SPACE_EVENLY, WRAP_WRAP, WRAP_WRAP_REVERSE, POSITION_TYPE_ABSOLUTE, DISPLAY_NONE } from './typeflex/api.js';

const colorNames = {
    aliceblue: '#f0f8ff',
    antiquewhite: '#faebd7',
    aqua: '#00ffff',
    aquamarine: '#7fffd4',
    azure: '#f0ffff',
    beige: '#f5f5dc',
    bisque: '#ffe4c4',
    black: '#000000',
    blanchedalmond: '#ffebcd',
    blue: '#0000ff',
    blueviolet: '#8a2be2',
    brown: '#a52a2a',
    burlywood: '#deb887',
    cadetblue: '#5f9ea0',
    chartreuse: '#7fff00',
    chocolate: '#d2691e',
    coral: '#ff7f50',
    cornflowerblue: '#6495ed',
    cornsilk: '#fff8dc',
    crimson: '#dc143c',
    cyan: '#00ffff',
    darkblue: '#00008b',
    darkcyan: '#008b8b',
    darkgoldenrod: '#b8860b',
    darkgray: '#a9a9a9',
    darkgreen: '#006400',
    darkkhaki: '#bdb76b',
    darkmagenta: '#8b008b',
    darkolivegreen: '#556b2f',
    darkorange: '#ff8c00',
    darkorchid: '#9932cc',
    darkred: '#8b0000',
    darksalmon: '#e9967a',
    darkseagreen: '#8fbc8f',
    darkslateblue: '#483d8b',
    darkslategray: '#2f4f4f',
    darkturquoise: '#00ced1',
    darkviolet: '#9400d3',
    deeppink: '#ff1493',
    deepskyblue: '#00bfff',
    dimgray: '#696969',
    dodgerblue: '#1e90ff',
    firebrick: '#b22222',
    floralwhite: '#fffaf0',
    forestgreen: '#228b22',
    fuchsia: '#ff00ff',
    gainsboro: '#dcdcdc',
    ghostwhite: '#f8f8ff',
    gold: '#ffd700',
    goldenrod: '#daa520',
    gray: '#808080',
    green: '#008000',
    greenyellow: '#adff2f',
    honeydew: '#f0fff0',
    hotpink: '#ff69b4',
    indianred: '#cd5c5c',
    indigo: '#4b0082',
    ivory: '#fffff0',
    khaki: '#f0e68c',
    lavender: '#e6e6fa',
    lavenderblush: '#fff0f5',
    lawngreen: '#7cfc00',
    lemonchiffon: '#fffacd',
    lightblue: '#add8e6',
    lightcoral: '#f08080',
    lightcyan: '#e0ffff',
    lightgoldenrodyellow: '#fafad2',
    lightgray: '#d3d3d3',
    lightgreen: '#90ee90',
    lightpink: '#ffb6c1',
    lightsalmon: '#ffa07a',
    lightseagreen: '#20b2aa',
    lightskyblue: '#87cefa',
    lightslategray: '#778899',
    lightsteelblue: '#b0c4de',
    lightyellow: '#ffffe0',
    lime: '#00ff00',
    limegreen: '#32cd32',
    linen: '#faf0e6',
    magenta: '#ff00ff',
    maroon: '#800000',
    mediumaquamarine: '#66cdaa',
    mediumblue: '#0000cd',
    mediumorchid: '#ba55d3',
    mediumpurple: '#9370db',
    mediumseagreen: '#3cb371',
    mediumslateblue: '#7b68ee',
    mediumspringgreen: '#00fa9a',
    mediumturquoise: '#48d1cc',
    mediumvioletred: '#c71585',
    midnightblue: '#191970',
    mintcream: '#f5fffa',
    mistyrose: '#ffe4e1',
    moccasin: '#ffe4b5',
    navajowhite: '#ffdead',
    navy: '#000080',
    oldlace: '#fdf5e6',
    olive: '#808000',
    olivedrab: '#6b8e23',
    orange: '#ffa500',
    orangered: '#ff4500',
    orchid: '#da70d6',
    palegoldenrod: '#eee8aa',
    palegreen: '#98fb98',
    paleturquoise: '#afeeee',
    palevioletred: '#db7093',
    papayawhip: '#ffefd5',
    peachpuff: '#ffdab9',
    peru: '#cd853f',
    pink: '#ffc0cb',
    plum: '#dda0dd',
    powderblue: '#b0e0e6',
    purple: '#800080',
    red: '#ff0000',
    rosybrown: '#bc8f8f',
    royalblue: '#4169e1',
    saddlebrown: '#8b4513',
    salmon: '#fa8072',
    sandybrown: '#f4a460',
    seagreen: '#2e8b57',
    seashell: '#fff5ee',
    sienna: '#a0522d',
    silver: '#c0c0c0',
    skyblue: '#87ceeb',
    slateblue: '#6a5acd',
    slategray: '#708090',
    snow: '#fffafa',
    springgreen: '#00ff7f',
    steelblue: '#4682b4',
    tan: '#d2b48c',
    teal: '#008080',
    thistle: '#d8bfd8',
    tomato: '#ff6347',
    turquoise: '#40e0d0',
    violet: '#ee82ee',
    wheat: '#f5deb3',
    white: '#ffffff',
    whitesmoke: '#f5f5f5',
    yellow: '#ffff00',
    yellowgreen: '#9acd32',
    transparent: 'rgba(0,0,0,0)',
};
const overflowConstantMap = {
    hidden: 'hidden',
    auto: 'auto',
    scroll: 'scroll',
    visible: 'visible',
};
const alignmentConstantMap = {
    auto: ALIGN_AUTO,
    'flex-start': ALIGN_FLEX_START,
    'flex-end': ALIGN_FLEX_END,
    center: ALIGN_CENTER,
    stretch: ALIGN_STRETCH,
    baseline: ALIGN_BASELINE,
    'space-between': ALIGN_SPACE_BETWEEN,
    'space-around': ALIGN_SPACE_AROUND,
};
const directionConstantMap = {
    row: FLEX_DIRECTION_ROW,
    'row-reverse': FLEX_DIRECTION_ROW_REVERSE,
    column: FLEX_DIRECTION_COLUMN,
    'column-reverse': FLEX_DIRECTION_COLUMN_REVERSE,
};
const justifyConstantMap = {
    'flex-start': JUSTIFY_FLEX_START,
    center: JUSTIFY_CENTER,
    'flex-end': JUSTIFY_FLEX_END,
    'space-between': JUSTIFY_SPACE_BETWEEN,
    'space-around': JUSTIFY_SPACE_AROUND,
    'space-evenly': JUSTIFY_SPACE_EVENLY,
};
const wrapConstantMap = {
    wrap: WRAP_WRAP,
    nowrap: WRAP_NO_WRAP,
    'wrap-reverse': WRAP_WRAP_REVERSE,
};
const positionConstantMap = {
    fixed: POSITION_TYPE_ABSOLUTE,
    relative: POSITION_TYPE_RELATIVE,
    absolute: POSITION_TYPE_ABSOLUTE,
};
const displayConstantMap = {
    flex: DISPLAY_FLEX,
    none: DISPLAY_NONE,
};
function parseStyleSheet(styles, extra) {
    const items = styles
        .split(';')
        .map((val) => val.trim())
        .filter((val) => !!val);
    const ss = {};
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
            }
            else if (extra) {
                extra[kv[0]] = kv[1];
            }
        }
    }
    return ss;
}
function serializeStyleSheet(styles) {
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
function _normalizeCSSValue(value) {
    function _fetch(value, pos) {
        function _issep(ch) {
            return ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r';
        }
        let start, end;
        let quot = null;
        for (start = pos; start < value.length && _issep(value[start]); start++)
            ;
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
            for (end = start + 1; end < value.length && !_issep(value[end]) && value[end] !== ','; end++)
                ;
            return [value.substring(start, end), end];
        }
        else {
            let backslash = false;
            for (end = start + 1; end < value.length; end++) {
                if (!backslash && value[end] === quot) {
                    quot = null;
                    end++;
                    break;
                }
                if (backslash) {
                    backslash = false;
                }
                else if (value[end] === '\\') {
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
    const ret = [];
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
        }
        else {
            if (last >= 0) {
                ret[last] = ret[last] + t[0];
                last = -1;
            }
            else {
                ret.push(t[0]);
            }
            pos = t[1];
        }
    }
    return ret;
}
function unescapeCSSString(input) {
    function isHexCharCode(ch) {
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
                }
                else if (next === '\r' || next === '\f') {
                    i++;
                    continue;
                }
                else {
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
class ElementStyle {
    _layout;
    _setNonInline;
    _stylesheetInline;
    _stylesheet;
    constructor(layout) {
        this._layout = layout;
        this._setNonInline = false;
        this._stylesheetInline = {};
        this._stylesheet = {};
    }
    reset() {
        this._setNonInline = true;
        for (const k in this._stylesheet) {
            this[k] = '';
        }
        this._stylesheet = {};
        this._setNonInline = false;
    }
    static get defaultBackgroundColor() {
        return { r: 0, g: 0, b: 0, a: 0 };
    }
    static get defaultBorderColor() {
        return { r: 0, g: 0, b: 0, a: 1 };
    }
    static get defaultFontColor() {
        return { r: 0, g: 0, b: 0, a: 1 };
    }
    get display() {
        return this._stylesheet.display || '';
    }
    set display(val) {
        this.setDisplay(val || '');
    }
    get position() {
        return this._stylesheet.position || '';
    }
    set position(val) {
        this.setPositionType(val || '');
    }
    get overflow() {
        if (!this._stylesheet.overflowX || !this._stylesheet.overflowY) {
            return '';
        }
        else if (this._stylesheet.overflowX === this._stylesheet.overflowY) {
            return this._stylesheet.overflowX;
        }
        else {
            return `${this._stylesheet.overflowX} ${this._stylesheet.overflowY}`;
        }
    }
    set overflow(val) {
        this.setOverflow(val || '');
    }
    get overflowX() {
        return this._stylesheet.overflowX || '';
    }
    set overflowX(val) {
        this.setOverflowX(val || '');
    }
    get overflowY() {
        return this._stylesheet.overflowY || '';
    }
    set overflowY(val) {
        this.setOverflowY(val || '');
    }
    get left() {
        return this._stylesheet.left || '';
    }
    set left(val) {
        this.setLeft(val === null ? '' : String(val));
    }
    get top() {
        return this._stylesheet.top || '';
    }
    set top(val) {
        this.setTop(val === null ? '' : String(val));
    }
    get right() {
        return this._stylesheet.right || '';
    }
    set right(val) {
        this.setRight(val === null ? '' : String(val));
    }
    get bottom() {
        return this._stylesheet.bottom || '';
    }
    set bottom(val) {
        this.setBottom(val === null ? '' : String(val));
    }
    get width() {
        return this._stylesheet.width || '';
    }
    set width(val) {
        this.setWidth(val === null ? '' : String(val));
    }
    get minWidth() {
        return this._stylesheet.minWidth || '';
    }
    set minWidth(val) {
        this.setMinWidth(val === null ? '' : String(val));
    }
    get maxWidth() {
        return this._stylesheet.maxWidth || '';
    }
    set maxWidth(val) {
        this.setMaxWidth(val === null ? '' : String(val));
    }
    get height() {
        return this._stylesheet.height || '';
    }
    set height(val) {
        this.setHeight(val === null ? '' : String(val));
    }
    get minHeight() {
        return this._stylesheet.minHeight || '';
    }
    set minHeight(val) {
        this.setMinHeight(val === null ? '' : String(val));
    }
    get maxHeight() {
        return this._stylesheet.maxHeight || '';
    }
    set maxHeight(val) {
        this.setMaxHeight(val === null ? '' : String(val));
    }
    get flexDirection() {
        return this._stylesheet.flexDirection || '';
    }
    set flexDirection(val) {
        this.setFlexDirection(val || '');
    }
    get flexWrap() {
        return this._stylesheet.flexWrap || '';
    }
    set flexWrap(val) {
        this.setFlexWrap(val || '');
    }
    get flexFlow() {
        const grow = this.flexGrow;
        const wrap = this.flexWrap;
        if (grow && wrap) {
            return `${grow} ${wrap}`;
        }
        else {
            return '';
        }
    }
    set flexFlow(val) {
        this.setFlexFlow(val === null ? '' : String(val));
    }
    get alignItems() {
        return this._stylesheet.alignItems || '';
    }
    set alignItems(val) {
        this.setAlignItems(val || '');
    }
    get alignContent() {
        return this._stylesheet.alignContent || '';
    }
    set alignContent(val) {
        this.setAlignContent(val || '');
    }
    get alignSelf() {
        return this._stylesheet.alignSelf || '';
    }
    set alignSelf(val) {
        this.setAlignSelf(val || '');
    }
    get justifyContent() {
        return this._stylesheet.justifyContent || '';
    }
    set justifyContent(val) {
        this.setJustifyContent(val || '');
    }
    get flexGrow() {
        return this._stylesheet.flexGrow || '';
    }
    set flexGrow(val) {
        this.setFlexGrow(val === null ? '' : String(val));
    }
    get flexShrink() {
        return this._stylesheet.flexShrink || '';
    }
    set flexShrink(val) {
        this.setFlexShrink(val === null ? '' : String(val));
    }
    get flexBasis() {
        return this._stylesheet.flexBasis || '';
    }
    set flexBasis(val) {
        this.setFlexBasis(val === null ? '' : String(val));
    }
    get flex() {
        const grow = this.flexGrow;
        const shrink = this.flexShrink;
        const basis = this.flexBasis;
        if (grow && shrink && basis) {
            return `${grow} ${shrink} ${basis}`;
        }
        else {
            return '';
        }
    }
    set flex(val) {
        this.setFlex(val === null ? '' : String(val));
    }
    get borderColor() {
        const top = this.borderTopColor;
        const right = this.borderRightColor;
        const bottom = this.borderBottomColor;
        const left = this.borderLeftColor;
        if (!top || !right || !bottom || !left) {
            return '';
        }
        else if (top === bottom && right === left) {
            if (top === right) {
                return top;
            }
            else {
                return `${top} ${right}`;
            }
        }
        else if (right === left) {
            return `${top} ${right} ${bottom}`;
        }
        else {
            return `${top} ${right} ${bottom} ${left}`;
        }
    }
    set borderColor(val) {
        this.setBorderColor(val === null ? '' : String(val));
    }
    get borderLeftColor() {
        return this._stylesheet.borderLeftColor || '';
    }
    set borderLeftColor(val) {
        this.setBorderLeftColor(val === null ? '' : String(val));
    }
    get borderTopColor() {
        return this._stylesheet.borderTopColor || '';
    }
    set borderTopColor(val) {
        this.setBorderTopColor(val === null ? '' : String(val));
    }
    get borderRightColor() {
        return this._stylesheet.borderRightColor || '';
    }
    set borderRightColor(val) {
        this.setBorderRightColor(val === null ? '' : String(val));
    }
    get borderBottomColor() {
        return this._stylesheet.borderBottomColor || '';
    }
    set borderBottomColor(val) {
        this.setBorderBottomColor(val === null ? '' : String(val));
    }
    get borderWidth() {
        const top = this.borderTopWidth;
        const right = this.borderRightWidth;
        const bottom = this.borderBottomWidth;
        const left = this.borderLeftWidth;
        if (!top || !right || !bottom || !left) {
            return '';
        }
        else if (top === bottom && right === left) {
            if (top === right) {
                return top;
            }
            else {
                return `${top} ${right}`;
            }
        }
        else if (right === left) {
            return `${top} ${right} ${bottom}`;
        }
        else {
            return `${top} ${right} ${bottom} ${left}`;
        }
    }
    set borderWidth(val) {
        this.setBorderWidth(val === null ? '' : String(val));
    }
    get borderLeftWidth() {
        return this._stylesheet.borderLeftWidth || '';
    }
    set borderLeftWidth(val) {
        this.setBorderLeftWidth(val === null ? '' : String(val));
    }
    get borderTopWidth() {
        return this._stylesheet.borderTopWidth || '';
    }
    set borderTopWidth(val) {
        this.setBorderTopWidth(val === null ? '' : String(val));
    }
    get borderRightWidth() {
        return this._stylesheet.borderRightWidth || '';
    }
    set borderRightWidth(val) {
        this.setBorderRightWidth(val === null ? '' : String(val));
    }
    get borderBottomWidth() {
        return this._stylesheet.borderBottomWidth || '';
    }
    set borderBottomWidth(val) {
        this.setBorderBottomWidth(val === null ? '' : String(val));
    }
    get margin() {
        const top = this.marginTop;
        const right = this.marginRight;
        const bottom = this.marginBottom;
        const left = this.marginLeft;
        if (!top || !right || !bottom || !left) {
            return '';
        }
        else if (top === bottom && right === left) {
            if (top === right) {
                return top;
            }
            else {
                return `${top} ${right}`;
            }
        }
        else if (right === left) {
            return `${top} ${right} ${bottom}`;
        }
        else {
            return `${top} ${right} ${bottom} ${left}`;
        }
    }
    set margin(val) {
        this.setMargin(val === null ? '' : String(val));
    }
    get marginLeft() {
        return this._stylesheet.marginLeft || '';
    }
    set marginLeft(val) {
        this.setMarginLeft(val === null ? '' : String(val));
    }
    get marginTop() {
        return this._stylesheet.marginTop || '';
    }
    set marginTop(val) {
        this.setMarginTop(val === null ? '' : String(val));
    }
    get marginRight() {
        return this._stylesheet.marginRight || '';
    }
    set marginRight(val) {
        this.setMarginRight(val === null ? '' : String(val));
    }
    get marginBottom() {
        return this._stylesheet.marginBottom || '';
    }
    set marginBottom(val) {
        this.setMarginBottom(val === null ? '' : String(val));
    }
    get padding() {
        const top = this.paddingTop;
        const right = this.paddingRight;
        const bottom = this.paddingBottom;
        const left = this.paddingLeft;
        if (!top || !right || !bottom || !left) {
            return '';
        }
        else if (top === bottom && right === left) {
            if (top === right) {
                return top;
            }
            else {
                return `${top} ${right}`;
            }
        }
        else if (right === left) {
            return `${top} ${right} ${bottom}`;
        }
        else {
            return `${top} ${right} ${bottom} ${left}`;
        }
    }
    set padding(val) {
        this.setPadding(val === null ? '' : String(val));
    }
    get paddingLeft() {
        return this._stylesheet.paddingLeft || '';
    }
    set paddingLeft(val) {
        this.setPaddingLeft(val === null ? '' : String(val));
    }
    get paddingTop() {
        return this._stylesheet.paddingTop || '';
    }
    set paddingTop(val) {
        this.setPaddingTop(val === null ? '' : String(val));
    }
    get paddingRight() {
        return this._stylesheet.paddingRight || '';
    }
    set paddingRight(val) {
        this.setPaddingRight(val === null ? '' : String(val));
    }
    get paddingBottom() {
        return this._stylesheet.paddingBottom || '';
    }
    set paddingBottom(val) {
        this.setPaddingBottom(val === null ? '' : String(val));
    }
    get zIndex() {
        return this._stylesheet.zIndex || '';
    }
    set zIndex(val) {
        this.setZIndex(val === null ? '' : String(val));
    }
    get cursor() {
        return this._stylesheet.cursor || '';
    }
    set cursor(val) {
        this.setCursor(val || '');
    }
    get backgroundColor() {
        return this._stylesheet.backgroundColor || '';
    }
    set backgroundColor(val) {
        this.setBackgroundColor(val || '');
    }
    get backgroundImage() {
        return this._stylesheet.backgroundImage || '';
    }
    set backgroundImage(val) {
        this.setBackgroundImage(val || '');
    }
    get font() {
        const fontSize = this.fontSize;
        const fontFamily = this.fontFamily;
        return fontSize && fontFamily ? `${fontSize} ${fontFamily}` : '';
    }
    set font(val) {
        this.setFont(val || '');
    }
    get fontSize() {
        return this._stylesheet.fontSize || '';
    }
    set fontSize(val) {
        this.setFontSize(val);
    }
    get fontFamily() {
        return this._stylesheet.fontFamily || '';
    }
    set fontFamily(val) {
        this.setFontFamily(val);
    }
    get color() {
        return this._stylesheet.color || '';
    }
    set color(val) {
        this.setFontColor(val || '');
    }
    get pointerEvents() {
        return this._stylesheet.pointerEvents || '';
    }
    set pointerEvents(val) {
        this.setPointerEvents(val || '');
    }
    unescapeCSSString(s) {
        return unescapeCSSString(s);
    }
    _syncValue(k, val) {
        if (val === '') {
            delete this._stylesheet[k];
            if (!this._setNonInline) {
                delete this._stylesheetInline[k];
            }
        }
        else {
            this._stylesheet[k] = val;
            if (!this._setNonInline) {
                this._stylesheetInline[k] = val;
            }
        }
        if (!this._setNonInline) {
            this._layout.updateStyle(serializeStyleSheet(this._stylesheetInline));
        }
    }
    _syncValues(values) {
        for (const k in values) {
            const val = values[k];
            val ? (this._stylesheet[k] = val) : delete this._stylesheet[k];
            if (!this._setNonInline) {
                val ? (this._stylesheetInline[k] = val) : delete this._stylesheetInline[k];
                this._layout.updateStyle(serializeStyleSheet(this._stylesheetInline));
            }
        }
    }
    setOverflow(val) {
        const values = ElementStyle._normalizeCSSValue(val);
        if (values) {
            if (values.length === 1) {
                this.setOverflowX(values[0]);
                this.setOverflowY(values[0]);
            }
            else if (values.length === 2) {
                this.setOverflowX(values[0]);
                this.setOverflowY(values[1]);
            }
        }
    }
    setOverflowX(val) {
        if (val !== this._stylesheet.overflowX && (val === '' || overflowConstantMap[val])) {
            this._syncValue('overflowX', val);
            this._layout.invalidateLayout();
        }
    }
    setOverflowY(val) {
        if (val !== this._stylesheet.overflowY && (val === '' || overflowConstantMap[val])) {
            this._syncValue('overflowY', val);
            this._layout.invalidateLayout();
        }
    }
    getBorderLeft() {
        return this._layout.node.getBorder(EDGE_LEFT) || 0;
    }
    getBorderTop() {
        return this._layout.node.getBorder(EDGE_TOP) || 0;
    }
    getBorderRight() {
        return this._layout.node.getBorder(EDGE_RIGHT) || 0;
    }
    getBorderBottom() {
        return this._layout.node.getBorder(EDGE_BOTTOM) || 0;
    }
    getPaddingLeft() {
        return this._layout.node.getPadding(EDGE_LEFT).value || 0;
    }
    getPaddingTop() {
        return this._layout.node.getPadding(EDGE_TOP).value || 0;
    }
    getPaddingRight() {
        return this._layout.node.getPadding(EDGE_RIGHT).value || 0;
    }
    getPaddingBottom() {
        return this._layout.node.getPadding(EDGE_BOTTOM).value || 0;
    }
    _checkStringConstant(k, v, defaultValue, constantMap) {
        if (v !== this[k] && (v === '' || constantMap[v] !== undefined)) {
            const val = v === '' ? defaultValue : constantMap[v];
            this._syncValue(k, v);
            return val;
        }
    }
    setDisplay(val) {
        const v = this._checkStringConstant('display', val, DISPLAY_FLEX, displayConstantMap);
        if (v !== undefined) {
            this._layout.node.setDisplay(v);
            this._layout.updateDisplay(val);
            this._layout.invalidateLayout();
        }
    }
    setPositionType(val) {
        const v = this._checkStringConstant('position', val, POSITION_TYPE_RELATIVE, positionConstantMap);
        if (v !== undefined) {
            this._layout.node.setPositionType(v);
            this._layout.invalidateLayout();
        }
    }
    _setPosition(edge, k, v) {
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
    setLeft(val) {
        this._setPosition(EDGE_LEFT, 'left', val);
    }
    setTop(val) {
        this._setPosition(EDGE_TOP, 'top', val);
    }
    setRight(val) {
        this._setPosition(EDGE_RIGHT, 'right', val);
    }
    setBottom(val) {
        this._setPosition(EDGE_BOTTOM, 'bottom', val);
    }
    setWidth(val) {
        const w = val === '' ? 'auto' : this.parseLengthOrAuto(val);
        val = typeof w === 'number' ? `${w}px` : w;
        if (val !== undefined && val !== this.width) {
            this._syncValue('width', val);
            this._layout.node.setWidth(w);
            this._layout.invalidateLayout();
        }
    }
    setMinWidth(val) {
        const w = val === '' ? undefined : this.parseLength(val);
        val = typeof w === 'number' ? `${w}px` : w;
        if (val !== this.minWidth) {
            this._syncValue('minWidth', val);
            this._layout.node.setMinWidth(w);
            this._layout.invalidateLayout();
        }
    }
    setMaxWidth(val) {
        const w = val === '' ? undefined : this.parseLength(val);
        val = typeof w === 'number' ? `${w}px` : w;
        if (val !== this.maxWidth) {
            this._syncValue('maxWidth', val);
            this._layout.node.setMaxWidth(w);
            this._layout.invalidateLayout();
        }
    }
    setHeight(val) {
        const h = val === '' ? 'auto' : this.parseLengthOrAuto(val);
        val = typeof h === 'number' ? `${h}px` : h;
        if (val !== undefined && val !== this.height) {
            this._syncValue('height', val);
            this._layout.node.setHeight(h);
            this._layout.invalidateLayout();
        }
    }
    setMinHeight(val) {
        const h = val === '' ? undefined : this.parseLength(val);
        val = typeof h === 'number' ? `${h}px` : h;
        if (val !== this.minHeight) {
            this._syncValue('minHeight', val);
            this._layout.node.setMinHeight(h);
            this._layout.invalidateLayout();
        }
    }
    setMaxHeight(val) {
        const h = val === '' ? undefined : this.parseLength(val);
        val = typeof h === 'number' ? `${h}px` : h;
        if (val !== this.maxHeight) {
            this._syncValue('maxHeight', val);
            this._layout.node.setMaxHeight(h);
            this._layout.invalidateLayout();
        }
    }
    setFlexDirection(val) {
        const v = this._checkStringConstant('flexDirection', val, FLEX_DIRECTION_ROW, directionConstantMap);
        if (v !== undefined) {
            this._layout.node.setFlexDirection(v);
            this._layout.invalidateLayout();
        }
    }
    setFlexWrap(val) {
        const v = this._checkStringConstant('flexWrap', val, WRAP_NO_WRAP, wrapConstantMap);
        if (v !== undefined) {
            this._layout.node.setFlexWrap(v);
            this._layout.invalidateLayout();
        }
    }
    setFlexFlow(val) {
        if (val !== this.flexFlow) {
            if (val === '') {
                this.setFlexDirection('');
                this.setFlexWrap('');
            }
            else {
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
    setAlignItems(val) {
        const v = this._checkStringConstant('alignItems', val, ALIGN_STRETCH, alignmentConstantMap);
        if (v !== undefined) {
            this._layout.node.setAlignItems(v);
            this._layout.invalidateLayout();
        }
    }
    setAlignContent(val) {
        const v = this._checkStringConstant('alignContent', val, ALIGN_FLEX_START, alignmentConstantMap);
        if (v !== undefined) {
            this._layout.node.setAlignContent(v);
            this._layout.invalidateLayout();
        }
    }
    setAlignSelf(val) {
        const v = this._checkStringConstant('alignSelf', val, ALIGN_AUTO, alignmentConstantMap);
        if (v !== undefined) {
            this._layout.node.setAlignSelf(v);
            this._layout.invalidateLayout();
        }
    }
    setJustifyContent(val) {
        const v = this._checkStringConstant('justifyContent', val, JUSTIFY_FLEX_START, justifyConstantMap);
        if (v !== undefined) {
            this._layout.node.setJustifyContent(v);
            this._layout.invalidateLayout();
        }
    }
    setFlexGrow(val) {
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
    setFlexShrink(val) {
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
    setFlexBasis(val) {
        const basis = val === '' ? 'auto' : this.parseLengthOrAuto(val);
        val = typeof basis === 'number' ? `${basis}px` : basis;
        if (val !== undefined && val !== this.flexBasis) {
            this._syncValue('flexBasis', val);
            this._layout.node.setFlexBasis(basis);
            this._layout.invalidateLayout();
        }
    }
    setFlex(val) {
        if (val !== this.flex || (val === '' && (this.flexGrow || this.flexShrink || this.flexBasis))) {
            if (val === '') {
                this.setFlexGrow('');
                this.setFlexShrink('');
                this.setFlexBasis('');
            }
            else {
                let invalid = false;
                const values = [];
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
                        }
                        else {
                            this.setFlexGrow('');
                            this.setFlexShrink('');
                            this.setFlexBasis('');
                        }
                        if (values.length > 1) {
                            this.setFlexShrink(values[1]);
                        }
                        else {
                            this.setFlexShrink('');
                            this.setFlexBasis('');
                        }
                        if (values.length > 2) {
                            this.setFlexBasis(values[2]);
                        }
                        else {
                            this.setFlexBasis('');
                        }
                        this._layout.invalidateLayout();
                    }
                }
            }
        }
    }
    setMarginLeft(val) {
        this._setMargin(EDGE_LEFT, 'marginLeft', val);
    }
    setMarginTop(val) {
        this._setMargin(EDGE_TOP, 'marginTop', val);
    }
    setMarginRight(val) {
        this._setMargin(EDGE_RIGHT, 'marginRight', val);
    }
    setMarginBottom(val) {
        this._setMargin(EDGE_BOTTOM, 'marginBottom', val);
    }
    setMargin(val) {
        if (val !== this.margin ||
            (val === '' && (this.marginLeft || this.marginTop || this.marginRight || this.marginBottom))) {
            if (val === '') {
                this.setMarginLeft('');
                this.setMarginTop('');
                this.setMarginRight('');
                this.setMarginBottom('');
            }
            else {
                let invalid = false;
                const values = [];
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
    setBorderLeftColor(val) {
        this._setBorderColor(EDGE_LEFT, 'borderLeftColor', val);
    }
    setBorderTopColor(val) {
        this._setBorderColor(EDGE_TOP, 'borderTopColor', val);
    }
    setBorderRightColor(val) {
        this._setBorderColor(EDGE_RIGHT, 'borderRightColor', val);
    }
    setBorderBottomColor(val) {
        this._setBorderColor(EDGE_BOTTOM, 'borderBottomColor', val);
    }
    setBorderColor(val) {
        if (val !== this.borderColor ||
            (val === '' &&
                (this.borderLeftColor ||
                    this.borderTopColor ||
                    this.borderRightColor ||
                    this.borderBottomColor))) {
            if (val === '') {
                this.setBorderLeftColor('');
                this.setBorderTopColor('');
                this.setBorderRightColor('');
                this.setBorderBottomColor('');
            }
            else {
                let invalid = false;
                const values = [];
                const tuples = val.trim().split(/\s+/);
                if (tuples.length < 5) {
                    for (let i = 0; i < tuples.length; i++) {
                        const color = this.parseColor(tuples[i]);
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
    setBorderLeftWidth(val) {
        this._setBorderWidth(EDGE_LEFT, 'borderLeftWidth', val);
    }
    setBorderTopWidth(val) {
        this._setBorderWidth(EDGE_TOP, 'borderTopWidth', val);
    }
    setBorderRightWidth(val) {
        this._setBorderWidth(EDGE_RIGHT, 'borderRightWidth', val);
    }
    setBorderBottomWidth(val) {
        this._setBorderWidth(EDGE_BOTTOM, 'borderBottomWidth', val);
    }
    setBorderWidth(val) {
        if (val !== this.borderWidth ||
            (val === '' &&
                (this.borderLeftWidth ||
                    this.borderTopWidth ||
                    this.borderRightWidth ||
                    this.borderBottomWidth))) {
            if (val === '') {
                this.setBorderLeftWidth('');
                this.setBorderTopWidth('');
                this.setBorderRightWidth('');
                this.setBorderBottomWidth('');
            }
            else {
                let invalid = false;
                const values = [];
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
    setPaddingLeft(val) {
        this._setPadding(EDGE_LEFT, 'paddingLeft', val);
    }
    setPaddingTop(val) {
        this._setPadding(EDGE_TOP, 'paddingTop', val);
    }
    setPaddingRight(val) {
        this._setPadding(EDGE_RIGHT, 'paddingRight', val);
    }
    setPaddingBottom(val) {
        this._setPadding(EDGE_BOTTOM, 'paddingBottom', val);
    }
    setPadding(val) {
        if (val !== this.padding ||
            (val === '' &&
                (this.paddingLeft || this.paddingTop || this.paddingRight || this.paddingBottom))) {
            if (val === '') {
                this.setPaddingLeft('');
                this.setPaddingTop('');
                this.setPaddingBottom('');
                this.setPaddingRight('');
            }
            else {
                let invalid = false;
                const values = [];
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
    setZIndex(val) {
        const z = val === '' ? 0 : Number(val);
        if (!Number.isNaN(z)) {
            val = String(z);
        }
        if (!Number.isNaN(z) && val !== this.zIndex) {
            this._syncValue('zIndex', val);
            this._layout.updateZIndex();
        }
    }
    setCursor(val) {
        val = val || 'default';
        if (this._stylesheet.cursor !== val) {
            this._syncValue('cursor', val);
            this._layout.updateCursor(val);
        }
    }
    setBackgroundColor(val) {
        if (this._stylesheet.backgroundColor !== val) {
            const color = val !== '' ? this.parseColor(val) : ElementStyle.defaultBackgroundColor;
            if (color) {
                this._syncValue('backgroundColor', val);
                this._layout.updateBackgroundColor(color);
            }
        }
    }
    setBackgroundImage(val) {
        if (this._stylesheet.backgroundImage !== val) {
            this._syncValue('backgroundImage', val);
        }
    }
    setFontSize(val) {
        const size = val === '' ? undefined : this.parseFixedNonNegative(val);
        if (size !== undefined) {
            val = typeof size === 'number' ? `${size}px` : val;
        }
        if (val !== this.fontSize) {
            this._syncValue('fontSize', val);
            this._layout.updateFontSize(val);
        }
    }
    setFontFamily(val) {
        if (val !== this.fontFamily) {
            this._syncValue('fontFamily', val);
            this._layout.updateFontFamily(val);
        }
    }
    setFont(val) {
        if (val === '') {
            this.setFontSize('');
            this.setFontFamily('');
        }
        else {
            const fontParts = _normalizeCSSValue(val);
            if (fontParts.length > 1) {
                const fontSize = fontParts[fontParts.length - 2];
                const fontFamily = fontParts[fontParts.length - 1];
                this.setFontSize(fontSize);
                this.setFontFamily(fontFamily);
            }
        }
    }
    setFontColor(val) {
        if (this._stylesheet.color !== val) {
            this._syncValue('color', val);
            this._layout.updateFontColor(val);
        }
    }
    setPointerEvents(val) {
        val = val || 'auto';
        if (this._stylesheet.pointerEvents !== val) {
            this._syncValue('pointerEvents', val);
        }
    }
    applyStyles(styles, inline) {
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
    applyStyleSheet(stylesheet, inline) {
        this._setNonInline = !inline;
        for (const k in stylesheet) {
            const v = stylesheet[k];
            if (v) {
                this[k] = v;
            }
        }
        this._setNonInline = false;
    }
    parseColor(input) {
        input = input.trim().toLowerCase();
        input = colorNames[input] || input;
        let v = null;
        if (input.substr(0, 1) == '#') {
            const collen = (input.length - 1) / 3;
            const fact = [17, 1, 0.062272][collen - 1];
            v = {
                r: (parseInt(input.substr(1, collen), 16) * fact) / 255,
                g: (parseInt(input.substr(1 + collen, collen), 16) * fact) / 255,
                b: (parseInt(input.substr(1 + 2 * collen, collen), 16) * fact) / 255,
                a: 1,
            };
        }
        else {
            let m;
            if ((m = input.match(/^\s*rgb\s*\(\s*(\d*\.?\d*)\s*,\s*(\d*\.?\d*)\s*,\s*(\d\.?\d*)\s*\)\s*$/i))) {
                v = {
                    r: Number(m[1]) / 255,
                    g: Number(m[2]) / 255,
                    b: Number(m[3]) / 255,
                    a: 1,
                };
            }
            else if ((m = input.match(/^\s*rgba\s*\(\s*(\d*\.?\d*)\s*,\s*(\d*\.?\d*)\s*,\s*([\d*.?\d*]+)\s*,\s*(\d*\.?\d*)\s*\)\s*$/i))) {
                v = {
                    r: Number(m[1]) / 255,
                    g: Number(m[2]) / 255,
                    b: Number(m[3]) / 255,
                    a: Number(m[4]),
                };
            }
        }
        if (!v || Number.isNaN(v.r) || Number.isNaN(v.g) || Number.isNaN(v.b) || Number.isNaN(v.a)) {
            throw new Error(`parseColor(): invalid color '${input}'`);
        }
        v.r = Math.pow(Math.min(1, v.r), 2.2);
        v.g = Math.pow(Math.min(1, v.g), 2.2);
        v.b = Math.pow(Math.min(1, v.b), 2.2);
        v.a = Math.min(1, v.a);
        return v;
    }
    parseGrowOrShrink(s) {
        const val = Number(s);
        if (!Number.isNaN(val) && val >= 0) {
            return val;
        }
    }
    parseLengthOrAuto(s) {
        if (s === 'auto') {
            return s;
        }
        else {
            return this.parseLength(s);
        }
    }
    parseFixed(s) {
        if (s.length > 2 && s.substr(s.length - 2, 2) === 'px') {
            s = s.substr(0, s.length - 2);
        }
        const pixels = Number(s);
        if (!Number.isNaN(pixels)) {
            return pixels;
        }
    }
    parseFixedNonNegative(s) {
        const pixels = this.parseFixed(s);
        if (pixels !== undefined && pixels >= 0) {
            return pixels;
        }
    }
    parseLength(s) {
        if (s[s.length - 1] === '%') {
            const percent = Number(s.substr(0, s.length - 1));
            if (!Number.isNaN(percent) && percent >= 0) {
                return s;
            }
        }
        else {
            const pixels = this.parseFixed(s);
            if (pixels >= 0) {
                return pixels;
            }
        }
    }
    parsePosition(s) {
        if (s[s.length - 1] === '%') {
            const percent = Number(s.substr(0, s.length - 1));
            if (!Number.isNaN(percent) && percent >= 0) {
                return s;
            }
        }
        else {
            return this.parseFixed(s);
        }
    }
    parseMargin(s) {
        if (s === 'auto') {
            return s;
        }
        else {
            return this.parsePosition(s);
        }
    }
    _setPadding(edge, k, v) {
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
    _setMargin(edge, k, v) {
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
    _setBorderColor(edge, k, v) {
        if (this._stylesheet[k] !== v) {
            const color = v !== '' ? this.parseColor(v) : ElementStyle.defaultBorderColor;
            if (color) {
                this._syncValue(k, v);
                this._layout.updateBorderColor(edge, color);
            }
        }
    }
    _setBorderWidth(edge, k, v) {
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
    static _normalizeCSSValue(value) {
        return _normalizeCSSValue(value);
    }
}
const styleSetters = {
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
    'pointer-events': ElementStyle.prototype.setPointerEvents,
};

export { ElementStyle, _normalizeCSSValue, parseStyleSheet, serializeStyleSheet, unescapeCSSString };
//# sourceMappingURL=style.js.map
