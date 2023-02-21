/** sophon base library */
import { StandardMaterial } from './standard.js';
import { UnlitLightModel } from './lightmodel.js';

class UnlitMaterial extends StandardMaterial {
    constructor(device) {
        super(device);
        this.lightModel = new UnlitLightModel();
    }
}

export { UnlitMaterial };
//# sourceMappingURL=unlit.js.map
