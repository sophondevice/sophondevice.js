/** sophon base library */
import { RElement } from '../element.js';

class Button extends RElement {
    constructor(uiscene) {
        super(uiscene);
    }
    _applyInlineStyles() {
        super._applyInlineStyles();
    }
    _init() { }
    _getDefaultStyleSheet() {
        const style = super._getDefaultStyleSheet();
        style.flexDirection = 'row';
        style.padding = '2';
        style.justifyContent = 'center';
        style.backgroundColor = '#1074e7';
        return style;
    }
}

export { Button };
//# sourceMappingURL=button.js.map
