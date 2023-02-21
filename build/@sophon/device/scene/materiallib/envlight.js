/** sophon base library */
import { Vector4 } from '@sophon/base';

class EnvironmentLighting {
    isIBL() {
        return false;
    }
    isConstant() {
        return false;
    }
}
class EnvIBL extends EnvironmentLighting {
    static USAGE_IBL_RADIANCE_MAP = 'usage_ibl_radiance_map';
    static USAGE_IBL_RADIANCE_MAP_MAX_LOD = 'usage_ibl_radiance_map_maxlod';
    static USAGE_IBL_IRRADIANCE_MAP = 'usage_ibl_irradiance_map';
    _radianceMap;
    _radianceMapSampler;
    _irradianceMap;
    _irradianceMapSampler;
    constructor(radianceMap, irradianceMap) {
        super();
        this._radianceMap = radianceMap || null;
        this._radianceMapSampler = radianceMap?.getDefaultSampler(false) || null;
        this._irradianceMap = irradianceMap || null;
        this._irradianceMapSampler = irradianceMap?.getDefaultSampler(false) || null;
    }
    get radianceMap() {
        return this._radianceMap;
    }
    set radianceMap(tex) {
        this._radianceMap = tex;
        if (!this._radianceMapSampler && tex) {
            this._radianceMapSampler = tex.getDefaultSampler(false) || null;
        }
    }
    get irradianceMap() {
        return this._irradianceMap;
    }
    set irradianceMap(tex) {
        this._irradianceMap = tex;
        if (!this._irradianceMapSampler && tex) {
            this._irradianceMapSampler = tex.getDefaultSampler(false);
        }
    }
    initShaderBindings(pb) {
        pb.globalScope.iblRadianceMap = pb.texCube().uniform(0).tag(EnvIBL.USAGE_IBL_RADIANCE_MAP);
        pb.globalScope.iblIrradianceMap = pb.texCube().uniform(0).tag(EnvIBL.USAGE_IBL_IRRADIANCE_MAP);
        pb.globalScope.iblParams = pb.defineStruct(null, 'std140', pb.float('radianceMaxLod'))().uniform(0).tag({ radianceMaxLod: EnvIBL.USAGE_IBL_RADIANCE_MAP_MAX_LOD });
    }
    updateBindGroup(bg) {
        bg.setValue('iblParams', { radianceMaxLod: this._radianceMap ? this._radianceMap.mipLevelCount - 1 : 0 });
        bg.setTexture('iblRadianceMap', this._radianceMap, this._radianceMapSampler);
        bg.setTexture('iblIrradianceMap', this._irradianceMap, this._irradianceMapSampler);
    }
    isIBL() {
        return true;
    }
    getMapSampler(tex) {
        return tex.getDefaultSampler(false);
    }
}
class EnvConstantAmbient extends EnvironmentLighting {
    static USAGE_CONSTANT_AMBIENT_LIGHTING = 'usage_env_constant_ambient';
    static funcNameGetAmbient = 'lib_getConstantAmbient';
    _ambientColor;
    constructor(ambientColor) {
        super();
        this._ambientColor = ambientColor ? new Vector4(ambientColor) : new Vector4(0, 0, 0, 1);
    }
    get ambientColor() {
        return this._ambientColor;
    }
    set ambientColor(ambientColor) {
        if (ambientColor) {
            this._ambientColor.assign(ambientColor.getArray());
        }
    }
    initShaderBindings(pb) {
        pb.globalScope.envLight = pb.defineStruct(null, 'std140', pb.vec4('ambient'))().uniform(0).tag({ ambient: EnvConstantAmbient.USAGE_CONSTANT_AMBIENT_LIGHTING });
    }
    updateBindGroup(bg) {
        bg.setValue('envLight', { ambient: this._ambientColor });
    }
    isConstant() {
        return true;
    }
}

export { EnvConstantAmbient, EnvIBL, EnvironmentLighting };
//# sourceMappingURL=envlight.js.map
