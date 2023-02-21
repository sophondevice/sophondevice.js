/** sophon base library */
import { Rectangle } from './geom/Rectangle.js';
import { Bin } from './abstract-bin.js';

class OversizedElementBin extends Bin {
    rects = [];
    constructor(...args) {
        super();
        if (args.length === 1) {
            if (typeof args[0] !== 'object')
                throw new Error('OversizedElementBin: Wrong parameters');
            const rect = args[0];
            this.rects = [rect];
            this.width = rect.width;
            this.height = rect.height;
            this.data = rect.data;
            rect.oversized = true;
        }
        else {
            this.width = args[0];
            this.height = args[1];
            this.data = args.length > 2 ? args[2] : null;
            const rect = new Rectangle(this.width, this.height);
            rect.oversized = true;
            rect.data = this.data;
            this.rects.push(rect);
        }
        this.freeRects = [];
        this.maxWidth = this.width;
        this.maxHeight = this.height;
        this.options = { smart: false, pot: false, square: false };
    }
    add() {
        return undefined;
    }
    reset(deepReset = false) {
    }
    repack() {
        return undefined;
    }
}

export { OversizedElementBin };
//# sourceMappingURL=oversized-element-bin.js.map
