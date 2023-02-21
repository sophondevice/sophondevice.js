import { StandardMaterial } from "./standard";
import { LambertLightModel } from "./lightmodel";
import type { Device } from "../../device";
export declare class LambertMaterial extends StandardMaterial<LambertLightModel> {
    constructor(device: Device);
}
