/** sophon base library */
import { RElement } from './element.js';

class RFlowElement extends RElement {
    constructor(uiscene) {
        super(uiscene);
    }
    _getDefaultStyleSheet() {
        const style = {};
        style.width = '100%';
        style.height = 'auto';
        style.flexDirection = 'column';
        style.justifyContent = 'flex-start';
        style.alignItems = 'stretch';
        style.flex = '0 0 auto';
        style.overflow = 'auto';
        return style;
    }
}

export { RFlowElement };
//# sourceMappingURL=flow_element.js.map
