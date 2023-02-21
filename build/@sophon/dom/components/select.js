/** sophon base library */
import { RText } from './text.js';
import { RElementLayoutEvent, RTextEvent, RChangeEvent } from '../events.js';
import { RNode } from '../node.js';
import { RElement } from '../element.js';

class Option extends RElement {
    _hiddenOption;
    constructor(uiscene) {
        super(uiscene);
        this._hiddenOption = document.createElement('option');
    }
    _getHiddenOption() {
        return this._hiddenOption;
    }
    _getDefaultStyleSheet() {
        const style = super._getDefaultStyleSheet();
        style.width = '0px';
        style.height = '0px';
        style.backgroundColor = 'transparent';
        style.display = 'none';
        return style;
    }
    setAttribute(k, v) {
        this._hiddenOption.setAttribute(k, v || '');
        super.setAttribute(k, v);
    }
    _reparent(p, at) {
        if (p.nodeType === RNode.ELEMENT_NODE && p.tagName === 'select') {
            let nextOption;
            for (nextOption = this._getNextSibling(true); nextOption && nextOption.tagName !== 'option'; nextOption = nextOption._getNextSibling(true))
                ;
            if (nextOption) {
                p
                    ._getHiddenInput()
                    .insertBefore(this._hiddenOption, nextOption._getHiddenOption());
            }
            else {
                p._getHiddenInput().appendChild(this._hiddenOption);
            }
        }
        return super._reparent(p, at);
    }
    _remove() {
        if (this._parent &&
            this._parent.nodeType === RNode.ELEMENT_NODE &&
            this._parent.tagName === 'select') {
            this._parent._getHiddenInput().removeChild(this._hiddenOption);
        }
        return super._remove();
    }
    _insertChild(child, index) {
        super._insertChild(child, index);
        this._hiddenOption.textContent = this.textContent;
    }
    _removeChild(index) {
        super._removeChild(index);
        this._hiddenOption.textContent = this.textContent;
    }
}
class Select extends RElement {
    _hiddenInput;
    _text;
    constructor(uiscene) {
        super(uiscene);
        this._text = new RText(this._uiscene);
        this._text._setInternal();
        this._text.style.backgroundColor = 'transparent';
        this._text.style.flex = '1 0 auto';
        this.appendChild(this._text);
        this._hiddenInput = document.createElement('select');
        this._hiddenInput.style.position = 'absolute';
        this._hiddenInput.style.boxSizing = 'border-box';
        this._hiddenInput.style.opacity = '0';
        this._hiddenInput.style.outline = 'none';
        this._hiddenInput.style.pointerEvents = 'none';
        this._hiddenInput.style.zIndex = '0';
        this._hiddenInput.style.transform = 'scaleY(0)';
        this._hiddenInput.style.transformOrigin = 'top';
        this._updateHiddenInput();
        document.body.appendChild(this._hiddenInput);
        this.addDefaultEventListener(RElementLayoutEvent.NAME, function () {
            this._updateHiddenInput();
        });
        this.addDefaultEventListener(RTextEvent.NAME_FONT_CHANGE, function () {
            that._updateHiddenInput();
        });
        const that = this;
        this._hiddenInput.addEventListener('input', function () {
            that._oninput();
        });
        this._hiddenInput.addEventListener('change', function () {
            console.log(`select change: ${that._hiddenInput.value}`);
            that.dispatchEvent(new RChangeEvent());
        });
    }
    get value() {
        return this._hiddenInput.value;
    }
    _oninput() {
        this._text.textContent = this._hiddenInput.options[this._hiddenInput.selectedIndex].textContent;
    }
    _init() {
    }
    _getDefaultStyleSheet() {
        const style = super._getDefaultStyleSheet();
        style.width = 'auto';
        style.height = 'auto';
        style.color = '#000000';
        style.padding = '5';
        style.justifyContent = 'flex-start';
        style.backgroundColor = '#fff';
        style.borderWidth = '1px';
        style.borderColor = '#000';
        style.overflow = 'hidden';
        return style;
    }
    _getHiddenInput() {
        return this._hiddenInput;
    }
    _updateHiddenInput() {
        let el = this._uiscene.renderer.getCanvas();
        const v = this.toAbsolute({ x: 0, y: 0 });
        let t = v.y;
        let l = v.x;
        if (el instanceof HTMLCanvasElement) {
            t += el.offsetTop;
            l += el.offsetLeft;
            while ((el = el.offsetParent)) {
                t += el.offsetTop;
                l += el.offsetLeft;
            }
        }
        this._hiddenInput.style.transform = '';
        this._hiddenInput.style.pointerEvents = 'auto';
        this._hiddenInput.style.left = `${l}px`;
        this._hiddenInput.style.top = `${t}px`;
        this._hiddenInput.style.width = `${this.getRect().width}px`;
        this._hiddenInput.style.height = `${this.getRect().height}px`;
        this._hiddenInput.style.font = `${this._getCachedFont().size}px ${this._getCachedFont().family}`;
    }
    _insertChild(child, index) {
        super._insertChild(child, index);
        this._text.textContent = this._hiddenInput?.options
            ? this._hiddenInput.options[this._hiddenInput.selectedIndex]?.textContent
            : '';
    }
    _removeChild(index) {
        super._removeChild(index);
        this._text.textContent = this._hiddenInput?.options
            ? this._hiddenInput.options[this._hiddenInput.selectedIndex]?.textContent
            : '';
    }
}

export { Option, Select };
//# sourceMappingURL=select.js.map
