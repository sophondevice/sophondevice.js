import { Blitter } from "./blitter";
import { ShaderType } from "../../device/base_types";
export class GammaBlitter extends Blitter {
    _gamma;
    constructor(gamma) {
        super();
        this._gamma = gamma ?? 2.2;
    }
    setup(scope, type) {
        const pb = scope.$builder;
        if (pb.shaderType === ShaderType.Fragment) {
            scope.gamma = pb.float().uniform(0);
        }
    }
    setUniforms(bindGroup) {
        bindGroup.setValue('gamma', this._gamma);
    }
    filter(scope, type, srcTex, srcUV, srcLayer) {
        const pb = scope.$builder;
        return pb.pow(this.readTexel(scope, type, srcTex, srcUV, srcLayer), pb.vec4(pb.vec3(scope.gamma), 1));
    }
    calcHash() {
        return '';
    }
}
//# sourceMappingURL=gamma.js.map