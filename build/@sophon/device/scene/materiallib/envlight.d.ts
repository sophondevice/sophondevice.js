import { Vector4 } from "@sophon/base";
import type { BindGroup, ProgramBuilder, TextureCube } from "../../device";
export declare abstract class EnvironmentLighting {
    abstract initShaderBindings(pb: ProgramBuilder): void;
    abstract updateBindGroup(bg: BindGroup): void;
    isIBL(): this is EnvIBL;
    isConstant(): this is EnvConstantAmbient;
}
export declare class EnvIBL extends EnvironmentLighting {
    static readonly USAGE_IBL_RADIANCE_MAP = "usage_ibl_radiance_map";
    static readonly USAGE_IBL_RADIANCE_MAP_MAX_LOD = "usage_ibl_radiance_map_maxlod";
    static readonly USAGE_IBL_IRRADIANCE_MAP = "usage_ibl_irradiance_map";
    private _radianceMap;
    private _radianceMapSampler;
    private _irradianceMap;
    private _irradianceMapSampler;
    constructor(radianceMap?: TextureCube, irradianceMap?: TextureCube);
    get radianceMap(): TextureCube;
    set radianceMap(tex: TextureCube);
    get irradianceMap(): TextureCube;
    set irradianceMap(tex: TextureCube);
    initShaderBindings(pb: ProgramBuilder): void;
    updateBindGroup(bg: BindGroup): void;
    isIBL(): this is EnvIBL;
    private getMapSampler;
}
export declare class EnvConstantAmbient extends EnvironmentLighting {
    static readonly USAGE_CONSTANT_AMBIENT_LIGHTING = "usage_env_constant_ambient";
    static readonly funcNameGetAmbient = "lib_getConstantAmbient";
    private _ambientColor;
    constructor(ambientColor?: Vector4);
    get ambientColor(): Vector4;
    set ambientColor(ambientColor: Vector4);
    initShaderBindings(pb: ProgramBuilder): void;
    updateBindGroup(bg: BindGroup): void;
    isConstant(): this is EnvConstantAmbient;
}
