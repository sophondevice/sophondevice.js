/** sophon base library */
import { Button } from './button.js';
import { Slider } from './slider.js';
import { RMouseEvent } from '../events.js';

class ScrollBar extends Slider {
    _buttonUp;
    _buttonDown;
    constructor(uiscene) {
        super(uiscene);
        this._buttonUp = new Button(uiscene);
        this._buttonUp._setInternal();
        this.appendChild(this._buttonUp);
        this._buttonUp.addDefaultEventListener(RMouseEvent.NAME_MOUSECLICK, () => {
            this.value -= this.stepValue;
        });
        this._buttonDown = new Button(uiscene);
        this._buttonDown._setInternal();
        this.appendChild(this._buttonDown);
        this._buttonDown.addDefaultEventListener(RMouseEvent.NAME_MOUSECLICK, () => {
            this.value += this.stepValue;
        });
        this._updateOrientationStyle();
    }
    get buttonSize() {
        return this._getNumberAttribute('buttonsize', 8);
    }
    set buttonSize(val) {
        this._setNumberAttribute('buttonsize', val);
    }
    _init() { }
    _getDefaultStyleSheet() {
        const style = super._getDefaultStyleSheet();
        style.overflow = 'visible';
        if (this.orientation === 'vertical') {
            style.paddingTop = String(this.buttonSize);
            style.paddingBottom = String(this.buttonSize);
        }
        else {
            style.paddingLeft = String(this.buttonSize);
            style.paddingRight = String(this.buttonSize);
        }
        return style;
    }
    _onAttributeChange(name) {
        name = name.toLowerCase();
        super._onAttributeChange(name);
        if (name === 'rangestart' || name === 'rangeend') {
            this._invalidateLayout();
        }
        else if (name === 'buttonsize' || name === 'orientation') {
            this._updateOrientationStyle();
            this._invalidateLayout();
        }
    }
    _updateScrollState() { }
    _updateOrientationStyle() {
        const vertical = this.orientation === 'vertical';
        this._buttonUp.setAttribute('style', vertical
            ? `position:absolute;left:0;right:0;top:0;height:${this.buttonSize};background-image:default.scrollbar.up`
            : `position:absolute;left:0;top:0;bottom:0;width:${this.buttonSize};background-image:default.scrollbar.left`);
        this._buttonDown.setAttribute('style', vertical
            ? `position:absolute;left:0;right:0;bottom:0;height:${this.buttonSize};background-image:default.scrollbar.down;`
            : `position:absolute;right:0;top:0;bottom:0;width:${this.buttonSize};background-image:default.scrollbar.right`);
        this._invalidateLayout();
        this._uiscene._markStyleRefreshForElement(this);
    }
}

export { ScrollBar };
//# sourceMappingURL=scrollbar.js.map
