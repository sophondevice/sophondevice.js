/** sophon base library */
import { Rectangle } from './geom/Rectangle.js';
import { MaxRectsBin } from './maxrects-bin.js';
import { OversizedElementBin } from './oversized-element-bin.js';

const EDGE_MAX_VALUE = 4096;
var PACKING_LOGIC;
(function (PACKING_LOGIC) {
    PACKING_LOGIC[PACKING_LOGIC["MAX_AREA"] = 0] = "MAX_AREA";
    PACKING_LOGIC[PACKING_LOGIC["MAX_EDGE"] = 1] = "MAX_EDGE";
})(PACKING_LOGIC || (PACKING_LOGIC = {}));
class MaxRectsPacker {
    width;
    height;
    padding;
    options;
    bins;
    constructor(width = EDGE_MAX_VALUE, height = EDGE_MAX_VALUE, padding = 0, options = {
        smart: true,
        pot: true,
        square: false,
        allowRotation: false,
        tag: false,
        border: 0,
        logic: PACKING_LOGIC.MAX_EDGE,
    }) {
        this.width = width;
        this.height = height;
        this.padding = padding;
        this.options = options;
        this.bins = [];
    }
    add(...args) {
        if (args.length === 1) {
            if (typeof args[0] !== 'object')
                throw new Error('MacrectsPacker.add(): Wrong parameters');
            const rect = args[0];
            if (rect.width > this.width || rect.height > this.height) {
                this.bins.push(new OversizedElementBin(rect));
            }
            else {
                const added = this.bins
                    .slice(this._currentBinIndex)
                    .find((bin) => bin.add(rect) !== undefined);
                if (!added) {
                    const bin = new MaxRectsBin(this.width, this.height, this.padding, this.options);
                    const tag = rect.data && rect.data.tag ? rect.data.tag : rect.tag ? rect.tag : undefined;
                    if (this.options.tag && tag)
                        bin.tag = tag;
                    bin.add(rect);
                    this.bins.push(bin);
                }
            }
            return rect;
        }
        else {
            const rect = new Rectangle(args[0], args[1]);
            if (args.length > 2)
                rect.data = args[2];
            if (rect.width > this.width || rect.height > this.height) {
                this.bins.push(new OversizedElementBin(rect));
            }
            else {
                const added = this.bins
                    .slice(this._currentBinIndex)
                    .find((bin) => bin.add(rect) !== undefined);
                if (!added) {
                    const bin = new MaxRectsBin(this.width, this.height, this.padding, this.options);
                    if (this.options.tag && rect.data.tag)
                        bin.tag = rect.data.tag;
                    bin.add(rect);
                    this.bins.push(bin);
                }
            }
            return rect;
        }
    }
    addArray(rects) {
        this.sort(rects, this.options.logic).forEach((rect) => this.add(rect));
    }
    reset() {
        this.bins = [];
        this._currentBinIndex = 0;
    }
    repack(quick = true) {
        if (quick) {
            const unpack = [];
            for (const bin of this.bins) {
                if (bin.dirty) {
                    const up = bin.repack();
                    if (up)
                        unpack.push(...up);
                }
            }
            this.addArray(unpack);
            return;
        }
        if (!this.dirty)
            return;
        const allRects = this.rects;
        this.reset();
        this.addArray(allRects);
    }
    next() {
        this._currentBinIndex = this.bins.length;
        return this._currentBinIndex;
    }
    load(bins) {
        bins.forEach((bin, index) => {
            if (bin.maxWidth > this.width || bin.maxHeight > this.height) {
                this.bins.push(new OversizedElementBin(bin.width, bin.height, {}));
            }
            else {
                const newBin = new MaxRectsBin(this.width, this.height, this.padding, bin.options);
                newBin.freeRects.splice(0);
                bin.freeRects.forEach((r) => {
                    newBin.freeRects.push(new Rectangle(r.width, r.height, r.x, r.y));
                });
                newBin.width = bin.width;
                newBin.height = bin.height;
                if (bin.tag)
                    newBin.tag = bin.tag;
                this.bins[index] = newBin;
            }
        }, this);
    }
    save() {
        const saveBins = [];
        this.bins.forEach((bin) => {
            let saveBin = {
                width: bin.width,
                height: bin.height,
                maxWidth: bin.maxWidth,
                maxHeight: bin.maxHeight,
                freeRects: [],
                rects: [],
                options: bin.options,
            };
            if (bin.tag)
                saveBin = { ...saveBin, tag: bin.tag };
            bin.freeRects.forEach((r) => {
                saveBin.freeRects.push({
                    x: r.x,
                    y: r.y,
                    width: r.width,
                    height: r.height,
                });
            });
            saveBins.push(saveBin);
        });
        return saveBins;
    }
    sort(rects, logic = PACKING_LOGIC.MAX_EDGE) {
        return rects.slice().sort((a, b) => {
            const result = logic === PACKING_LOGIC.MAX_EDGE
                ? Math.max(b.width, b.height) - Math.max(a.width, a.height)
                : b.width * b.height - a.width * a.height;
            if (result === 0 && a.hash && b.hash) {
                return a.hash > b.hash ? -1 : 1;
            }
            else
                return result;
        });
    }
    _currentBinIndex = 0;
    get currentBinIndex() {
        return this._currentBinIndex;
    }
    get dirty() {
        return this.bins.some((bin) => bin.dirty);
    }
    get rects() {
        const allRects = [];
        for (const bin of this.bins) {
            allRects.push(...bin.rects);
        }
        return allRects;
    }
}

export { EDGE_MAX_VALUE, MaxRectsPacker, PACKING_LOGIC };
//# sourceMappingURL=maxrects-packer.js.map
