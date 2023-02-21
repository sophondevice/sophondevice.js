/** sophon base library */
import { StandardMaterial } from './standard.js';
import { LambertLightModel } from './lightmodel.js';

class LambertMaterial extends StandardMaterial {
    constructor(device) {
        super(device);
        this.lightModel = new LambertLightModel();
    }
}

export { LambertMaterial };
//# sourceMappingURL=lambert.js.map
