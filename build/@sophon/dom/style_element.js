/** sophon base library */
import { RElement } from './element.js';
import { RTextContentChangeEvent } from './events.js';

class StyleElement extends RElement {
    _definitions;
    constructor(uiscene) {
        super(uiscene);
        this._definitions = [];
        this.addDefaultEventListener(RTextContentChangeEvent.NAME, () => {
            this._update();
        });
    }
    get definitions() {
        return this._definitions;
    }
    _update() {
        this._definitions = this._uiscene._parseStyleContent(this.textContent);
        if (this._isSucceedingOf(this._uiscene.document)) {
            this._uiscene.requireFullStyleRefresh();
        }
    }
    _getDefaultStyleSheet() {
        const style = {};
        style.display = 'none';
        return style;
    }
}

export { StyleElement };
//# sourceMappingURL=style_element.js.map
