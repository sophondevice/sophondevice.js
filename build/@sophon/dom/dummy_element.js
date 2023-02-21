/** sophon base library */
import { RElement } from './element.js';

class DummyElement extends RElement {
    constructor(uiscene) {
        super(uiscene);
    }
    _getDefaultStyleSheet() {
        return { display: 'none' };
    }
}

export { DummyElement };
//# sourceMappingURL=dummy_element.js.map
