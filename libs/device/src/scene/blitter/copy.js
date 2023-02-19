import { Blitter } from "./blitter";
export class CopyBlitter extends Blitter {
    filter(scope, type, srcTex, srcUV, srcLayer) {
        return this.readTexel(scope, type, srcTex, srcUV, srcLayer);
    }
    calcHash() {
        return '';
    }
}
//# sourceMappingURL=copy.js.map