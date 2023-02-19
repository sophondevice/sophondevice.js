import { StandardMaterial } from "./standard";
import { PBRLightModelMR, PBRLightModelSG } from "./lightmodel";
export class PBRMetallicRoughnessMaterial extends StandardMaterial {
    constructor(device) {
        super(device);
        this.lightModel = new PBRLightModelMR();
    }
}
export class PBRSpecularGlossinessMaterial extends StandardMaterial {
    constructor(device) {
        super(device);
        this.lightModel = new PBRLightModelSG();
    }
}
//# sourceMappingURL=pbr.js.map