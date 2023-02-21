/** sophon base library */
import { StandardMaterial } from './standard.js';
import { PBRLightModelMR, PBRLightModelSG } from './lightmodel.js';

class PBRMetallicRoughnessMaterial extends StandardMaterial {
    constructor(device) {
        super(device);
        this.lightModel = new PBRLightModelMR();
    }
}
class PBRSpecularGlossinessMaterial extends StandardMaterial {
    constructor(device) {
        super(device);
        this.lightModel = new PBRLightModelSG();
    }
}

export { PBRMetallicRoughnessMaterial, PBRSpecularGlossinessMaterial };
//# sourceMappingURL=pbr.js.map
