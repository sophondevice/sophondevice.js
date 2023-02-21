import { StandardMaterial } from "./standard";
import { PBRLightModelMR, PBRLightModelSG } from "./lightmodel";
import type { Device } from "../../device";
export declare class PBRMetallicRoughnessMaterial extends StandardMaterial<PBRLightModelMR> {
    constructor(device: Device);
}
export declare class PBRSpecularGlossinessMaterial extends StandardMaterial<PBRLightModelSG> {
    constructor(device: Device);
}
