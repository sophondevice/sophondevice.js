import { StandardMaterial } from "./standard";
import { UnlitLightModel } from "./lightmodel";
export class UnlitMaterial extends StandardMaterial {
    constructor(device) {
        super(device);
        this.lightModel = new UnlitLightModel();
    }
}
//# sourceMappingURL=unlit.js.map