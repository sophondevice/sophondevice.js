/* eslint-disable @typescript-eslint/no-explicit-any */
import { IRectangle, Rectangle } from './geom/Rectangle';
import { Bin } from './abstract-bin';

export class OversizedElementBin<T extends IRectangle = Rectangle> extends Bin<T> {
  public rects: T[] = [];

  constructor(rect: T);
  constructor(width: number, height: number, data: any);
  constructor(...args: any[]) {
    super();
    if (args.length === 1) {
      if (typeof args[0] !== 'object') throw new Error('OversizedElementBin: Wrong parameters');
      const rect = args[0];
      this.rects = [rect];
      this.width = rect.width;
      this.height = rect.height;
      this.data = rect.data;
      rect.oversized = true;
    } else {
      this.width = args[0];
      this.height = args[1];
      this.data = args.length > 2 ? args[2] : null;
      const rect: IRectangle = new Rectangle(this.width, this.height);
      rect.oversized = true;
      rect.data = this.data;
      this.rects.push(rect as T);
    }
    this.freeRects = [];
    this.maxWidth = this.width;
    this.maxHeight = this.height;
    this.options = { smart: false, pot: false, square: false };
  }

  add() {
    return undefined;
  }
  reset(deepReset = false): void {
    // nothing to do here
  }
  repack(): T[] | undefined {
    return undefined;
  }
}
