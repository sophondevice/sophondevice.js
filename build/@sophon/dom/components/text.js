/** sophon base library */
import { RRectPrimitive } from '../primitive.js';
import { RNode } from '../node.js';
import { RAttributeChangeEvent, RTextEvent } from '../events.js';

class RText extends RNode {
    _actualContent;
    _textContent;
    _autoWrap;
    _charMargin;
    _lineHeight;
    _inlineStyle;
    constructor(uiscene) {
        super(uiscene);
        this._actualContent = '';
        this._textContent = '';
        this._autoWrap = false;
        this._charMargin = 0;
        this._lineHeight = -1;
        this._inlineStyle = '';
        this.addDefaultEventListener(RAttributeChangeEvent.NAME, function (evt) {
            const e = evt;
            if (e.name === 'autoWrap' || e.name === 'charMargin' || e.name === 'lineHeight') {
                this._invalidateLayout();
                this._invalidateContent();
            }
        });
    }
    get nodeType() {
        return RNode.TEXT_NODE;
    }
    cloneNode() {
        const clone = new RText(this._uiscene);
        clone.textContent = this.textContent;
        return clone;
    }
    get actualContent() {
        return this._actualContent;
    }
    set actualContent(text) {
        text = String(text) || '';
        if (this._actualContent !== text) {
            this._actualContent = text;
            this._invalidateLayout();
            this._invalidateContent();
            this.dispatchEvent(new RTextEvent(RTextEvent.NAME_CONTENT_CHANGE));
        }
    }
    get textContent() {
        return this._textContent;
    }
    set textContent(text) {
        text = String(text) || '';
        if (this._textContent !== text) {
            this._textContent = text;
            this._findFirstTextNode()._styleChange();
            this._parent?._notifyTextContentEvents();
        }
    }
    get autoWrap() {
        return this._autoWrap;
    }
    set autoWrap(val) {
        this._autoWrap = !!val;
    }
    get charMargin() {
        return this._charMargin;
    }
    set charMargin(val) {
        this._charMargin = Number(val);
    }
    get lineHeight() {
        return this._lineHeight;
    }
    set lineHeight(val) {
        this._lineHeight = val <= 0 ? -1 : val;
    }
    _updateStyle(val) {
        super._updateStyle(val);
        this._inlineStyle = val;
    }
    _applyInlineStyles() {
        this.style.applyStyles(this._inlineStyle, true);
    }
    _getDefaultStyleSheet() {
        const style = super._getDefaultStyleSheet();
        style.backgroundColor = 'transparent';
        style.flex = '0 0 auto';
        style.display = this._findFirstTextNode() === this ? 'flex' : 'none';
        return style;
    }
    measureTextLocation(px, py) {
        const lines = this._splitContent();
        const font = this._getCachedFont();
        const lineHeight = (this.lineHeight >= 0 ? this.lineHeight : -this.lineHeight * font.maxHeight) | 0;
        const charMargin = this.charMargin;
        const l = Math.floor((py - this.style.getPaddingTop()) / lineHeight);
        if (l < 0 || l >= lines.length) {
            return null;
        }
        let t = this.style.getPaddingLeft();
        let c = 0;
        for (let i = 0; i < l; i++) {
            c += lines[i].length;
        }
        for (const ch of lines[l]) {
            const width = this._uiscene._getCharWidth(ch, font);
            if (px <= t + (width >> 1)) {
                break;
            }
            t += width + charMargin;
            c++;
        }
        return { line: l, pos: c };
    }
    _measureContentSize(rc) {
        const lines = this._splitContent();
        const font = this._getCachedFont();
        const lineHeight = (this.lineHeight >= 0 ? this.lineHeight : -this.lineHeight * font.maxHeight) | 0;
        const charMargin = this.charMargin;
        const autoWrap = this.autoWrap;
        if (rc.width === 0 && rc.height === 0) {
            for (const line of lines) {
                rc.width = Math.max(rc.width, this._uiscene._measureStringWidth(line, charMargin, font));
                rc.height += lineHeight;
            }
        }
        else if (rc.height === 0) {
            for (const line of lines) {
                let start = 0;
                if (line.length === 0) {
                    rc.height += lineHeight;
                }
                else {
                    while (start < line.length) {
                        start += autoWrap
                            ? Math.max(1, this._uiscene._clipStringToWidth(line, rc.width, charMargin, start, font))
                            : line.length;
                        rc.height += lineHeight;
                    }
                }
            }
        }
        else if (rc.width === 0) {
            for (const line of lines) {
                rc.width = Math.max(rc.width, this._uiscene._measureStringWidth(line, charMargin, font));
            }
        }
        return rc;
    }
    _isText() {
        return true;
    }
    _normalize() {
        console.assert(!this.previousSibling || !this.previousSibling._isText(), 'Failed to execute _normalize: text node must be the first');
        this._textContent = this._actualContent;
        const textSiblings = [];
        let next = this.nextSibling;
        while (next && next._isText()) {
            textSiblings.push(next);
            next = next.nextSibling;
        }
        for (const sibling of textSiblings) {
            this.parentNode.removeChild(sibling);
        }
        if (!this._textContent) {
            this._remove();
        }
        return next;
    }
    _remove() {
        const parent = this._parent;
        if (this._isText()) {
            const first = this._findFirstTextNode();
            const next = this.nextSibling;
            const nextTextNode = next && next._isText() ? next : null;
            super._remove();
            if (first !== this) {
                first._styleChange();
            }
            else if (nextTextNode) {
                nextTextNode._styleChange();
            }
        }
        else {
            super._remove();
        }
        if (parent) {
            parent._notifyTextContentEvents();
        }
        return this;
    }
    _init() { }
    _reparent(p, at) {
        if (this._parent !== p) {
            super._reparent(p, at);
            if (this._isText() && this._getPseudo() === RNode.PSEUDO_NONE) {
                const first = this._findFirstTextNode();
                first._styleChange();
                if (first !== this) {
                    this.style.display = 'none';
                }
                const next = this.nextSibling;
                if (next && next._isText() && next._getPseudo() === RNode.PSEUDO_NONE) {
                    next.style.display = 'none';
                }
            }
            if (this._parent) {
                this._parent._notifyTextContentEvents();
            }
        }
        return this;
    }
    _buildVertexData() {
        super._buildVertexData();
        const clipper = this._getClipper(true);
        if (clipper) {
            const lines = this._splitContent();
            const font = this._getCachedFont();
            const lineHeight = (this.lineHeight >= 0 ? this.lineHeight : -this.lineHeight * font.maxHeight) | 0;
            const autoWrap = this.autoWrap;
            const charMargin = this.charMargin;
            const fontColor = this._getCachedFontColor();
            const uvMin = { x: 0, y: 0 };
            const uvMax = { x: 0, y: 0 };
            let y = this.style.getPaddingTop();
            for (const line of lines) {
                let start = 0;
                if (line.length === 0) {
                    y += lineHeight;
                }
                else {
                    while (start < line.length) {
                        let x = this.style.getPaddingLeft();
                        const n = autoWrap
                            ? Math.max(1, this._uiscene._clipStringToWidth(line, this._layout.clientRect.width, charMargin, start, font))
                            : line.length;
                        for (let i = start; i < start + n; i++) {
                            const glyph = this._uiscene._getGlyphInfo(line[i], font, fontColor);
                            if (glyph) {
                                const tex = this._uiscene._getGlyphTexture(glyph.atlasIndex);
                                uvMin.x = glyph.uMin;
                                uvMin.y = glyph.vMin;
                                uvMax.x = glyph.uMax;
                                uvMax.y = glyph.vMax;
                                this._batchList.addPrimitive(new RRectPrimitive(x, y, glyph.width, glyph.height, uvMin.x, uvMin.y, uvMax.x, uvMax.y), clipper, tex, fontColor);
                                x += glyph.width + charMargin;
                            }
                        }
                        start += n;
                        y += lineHeight;
                    }
                }
            }
        }
    }
    _decode(str) {
        const tmp = str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\s+/g, ' ');
        const div = document.createElement('div');
        div.innerHTML = tmp;
        return div.innerText;
    }
    _splitContent() {
        const content = this.actualContent || '';
        const tab2space = Array.from({ length: 4 })
            .map(() => ' ')
            .join('');
        return content.replace(/\t/g, tab2space).split('\n');
    }
    _findFirstTextNode() {
        let el = this;
        while (el.previousSibling?._isText() &&
            el.previousSibling?._getPseudo() === RNode.PSEUDO_NONE) {
            el = el.previousSibling;
        }
        return el;
    }
    _styleChange() {
        console.assert(!this.previousSibling || !this.previousSibling._isText(), 'Failed to execute _updateStyle: text node must be the first');
        this.style.display = 'flex';
        let content = this.textContent;
        for (let next = this.nextSibling; next && next._isText() && next._getPseudo() === RNode.PSEUDO_NONE; next = next.nextSibling) {
            content += next.textContent;
        }
        this.actualContent = content;
    }
}

export { RText };
//# sourceMappingURL=text.js.map
