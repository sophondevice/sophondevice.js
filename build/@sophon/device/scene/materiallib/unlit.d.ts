import { StandardMaterial } from "./standard";
import { UnlitLightModel } from "./lightmodel";
import type { Device } from "../../device";
export declare class UnlitMaterial extends StandardMaterial<UnlitLightModel> {
    constructor(device: Device);
}
