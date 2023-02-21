/** sophon base library */
import { Blitter } from './blitter.js';

class CopyBlitter extends Blitter {
    filter(scope, type, srcTex, srcUV, srcLayer) {
        return this.readTexel(scope, type, srcTex, srcUV, srcLayer);
    }
    calcHash() {
        return '';
    }
}

export { CopyBlitter };
//# sourceMappingURL=copy.js.map
