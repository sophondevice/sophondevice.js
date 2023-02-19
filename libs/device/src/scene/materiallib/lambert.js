import { StandardMaterial } from "./standard";
import { LambertLightModel } from "./lightmodel";
export class LambertMaterial extends StandardMaterial {
    constructor(device) {
        super(device);
        this.lightModel = new LambertLightModel();
    }
}
//# sourceMappingURL=lambert.js.map