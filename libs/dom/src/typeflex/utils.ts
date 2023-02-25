import { YGUnit, YGEdge, YGFlexDirection, YGDirection } from './enums';
import { YGValue } from './ygvalue';
import type { YGNode } from './yoga';

export const YGUndefined: number = undefined;
export function YGFloatIsUndefined(value: number) {
  if (value === undefined || isNaN(value)) {
    return true;
  }
  return false;
  // return value >= 10E8 || value <= -10E8;
}

export class YGCollectFlexItemsRowValues {
  public itemsOnLine = 0;
  public sizeConsumedOnCurrentLine = 0;
  public totalFlexGrowFactors = 0;
  public totalFlexShrinkScaledFactors = 0;
  public endOfLineIndex = 0;
  public relativeChildren: Array<YGNode> = [];
  public remainingFreeSpace = 0;
  public mainDim = 0;
  public crossDim = 0;
}

export function YGValueEqual(a: YGValue, b: YGValue): boolean {
  if (a.unit != b.unit) {
    return false;
  }

  if (a.unit == YGUnit.Undefined || (YGFloatIsUndefined(a.value) && YGFloatIsUndefined(b.value))) {
    return true;
  }

  return Math.abs(a.value - b.value) < 0.0001;
}

export function YGFloatsEqual(a: number, b: number): boolean {
  if (!YGFloatIsUndefined(a) && !YGFloatIsUndefined(b)) {
    return Math.abs(a - b) < 0.0001;
  }
  return YGFloatIsUndefined(a) && YGFloatIsUndefined(b);
}

export function YGFloatMax(a: number, b: number): number {
  if (!YGFloatIsUndefined(a) && !YGFloatIsUndefined(b)) {
    return Math.max(a, b);
  }
  return YGFloatIsUndefined(a) ? b : a;
}

export function YGFloatOptionalMax(op1: YGFloatOptional, op2: YGFloatOptional): YGFloatOptional {
  if (!op1.isUndefined() && !op2.isUndefined()) {
    return op1.getValue() > op2.getValue() ? op1 : op2;
  }

  return op1.isUndefined() ? op2 : op1;
}

export function YGFloatMin(a: number, b: number): number {
  if (!YGFloatIsUndefined(a) && !YGFloatIsUndefined(b)) {
    return Math.min(a, b);
  }
  return YGFloatIsUndefined(a) ? b : a;
}

export function YGFloatArrayEqual(val1: Array<number>, val2: Array<number>) {
  let areEqual = true;
  for (let i = 0; i < val1.length && areEqual; ++i) {
    areEqual = YGFloatsEqual(val1[i], val2[i]);
  }
  return areEqual;
}

export function YGValueArrayEqual(val1: Array<YGValue>, val2: Array<YGValue>) {
  let areEqual = true;
  for (let i = 0; i < val1.length && areEqual; ++i) {
    areEqual = YGValueEqual(val1[i], val2[i]);
  }
  return areEqual;
}

export function YGFloatSanitize(val: number): number {
  return YGFloatIsUndefined(val) ? 0 : val;
}

export function YGUnwrapFloatOptional(op: YGFloatOptional): number {
  return op.isUndefined() ? YGUndefined : op.getValue();
}

export function YGFlexDirectionCross(
  flexDirection: YGFlexDirection,
  direction: YGDirection
): YGFlexDirection {
  return YGFlexDirectionIsColumn(flexDirection)
    ? YGResolveFlexDirection(YGFlexDirection.Row, direction)
    : YGFlexDirection.Column;
}

export function YGFlexDirectionIsRow(flexDirection: YGFlexDirection): boolean {
  return flexDirection == YGFlexDirection.Row || flexDirection == YGFlexDirection.RowReverse;
}

export function YGResolveValue(value: YGValue, ownerSize: number): YGFloatOptional {
  switch (value.unit) {
    case YGUnit.Undefined:
    case YGUnit.Auto:
      return new YGFloatOptional();
    case YGUnit.Point:
      return new YGFloatOptional(value.value);
    case YGUnit.Percent:
      return new YGFloatOptional(value.value * ownerSize * 0.01);
  }
  return new YGFloatOptional();
}

export function YGFlexDirectionIsColumn(flexDirection: YGFlexDirection): boolean {
  return flexDirection == YGFlexDirection.Column || flexDirection == YGFlexDirection.ColumnReverse;
}

export function YGResolveFlexDirection(
  flexDirection: YGFlexDirection,
  direction: YGDirection
): YGFlexDirection {
  if (direction == YGDirection.RTL) {
    if (flexDirection == YGFlexDirection.Row) {
      return YGFlexDirection.RowReverse;
    } else if (flexDirection == YGFlexDirection.RowReverse) {
      return YGFlexDirection.Row;
    }
  }
  return flexDirection;
}

export function YGResolveValueMargin(value: YGValue, ownerSize: number): YGFloatOptional {
  return value.unit == YGUnit.Auto ? new YGFloatOptional(0) : YGResolveValue(value, ownerSize);
}

export function cloneYGValueArray(array: Array<YGValue>): Array<YGValue> {
  const ret = new Array(array.length);
  for (let i = 0; i < array.length; i++) {
    ret[i] = array[i].clone();
  }
  return ret;
}

export class YGFloatOptional {
  private value_: number;
  private isUndefined_: boolean;

  constructor(value: number | YGFloatOptional = undefined) {
    if (value instanceof YGFloatOptional) {
      this.value_ = value.getValue();
      this.isUndefined_ = value.isUndefined();
      return;
    }

    if (YGFloatIsUndefined(value)) {
      this.value_ = 0;
      this.isUndefined_ = true;
    } else {
      this.value_ = value;
      this.isUndefined_ = false;
    }
  }

  clone(): YGFloatOptional {
    return new YGFloatOptional(this.isUndefined_ ? undefined : this.value_);
  }

  getValue(): number {
    if (this.isUndefined_) {
      throw 'Tried to get value of an undefined YGFloatOptional';
    }

    return this.value_;
  }

  setValue(value: number) {
    this.value_ = value;
    this.isUndefined_ = false;
  }

  isUndefined(): boolean {
    return this.isUndefined_;
  }

  add(op: YGFloatOptional): YGFloatOptional {
    if (!this.isUndefined_ && !op.isUndefined()) {
      return new YGFloatOptional(this.value_ + op.getValue());
    }
    return new YGFloatOptional();
  }

  isBigger(op: YGFloatOptional): boolean {
    if (this.isUndefined_ || op.isUndefined()) {
      return false;
    }

    return this.value_ > op.getValue();
  }

  isSmaller(op: YGFloatOptional): boolean {
    if (this.isUndefined_ || op.isUndefined()) {
      return false;
    }

    return this.value_ < op.getValue();
  }

  isBiggerEqual(op: YGFloatOptional): boolean {
    return this.isEqual(op) ? true : this.isBigger(op);
  }

  isSmallerEqual(op: YGFloatOptional): boolean {
    return this.isEqual(op) ? true : this.isSmaller(op);
  }

  isEqual(op: YGFloatOptional): boolean {
    if (this.isUndefined_ == op.isUndefined()) {
      return this.isUndefined_ ? true : this.value_ == op.getValue();
    }
    return false;
  }

  isDiff(op: YGFloatOptional): boolean {
    return !this.isEqual(op);
  }

  isEqualValue(val: number): boolean {
    if (YGFloatIsUndefined(val) == this.isUndefined_) {
      return this.isUndefined_ || val == this.value_;
    }
    return false;
  }

  isDiffValue(val: number): boolean {
    return !this.isEqualValue(val);
  }
}

export const YGValueUndefined: () => YGValue = function () {
  return new YGValue(YGUndefined, YGUnit.Undefined);
};

export const YGValueAuto: () => YGValue = function () {
  return new YGValue(YGUndefined, YGUnit.Auto);
};

export const YGValueZero: () => YGValue = function () {
  return new YGValue(0, YGUnit.Point);
};

export function YGComputedEdgeValue(edges: Array<YGValue>, edge: YGEdge, defaultValue: YGValue): YGValue {
  if (edges[edge].unit != YGUnit.Undefined) {
    return edges[edge];
  }

  if ((edge == YGEdge.Top || edge == YGEdge.Bottom) && edges[YGEdge.Vertical].unit != YGUnit.Undefined) {
    return edges[YGEdge.Vertical];
  }

  if (
    (edge == YGEdge.Left || edge == YGEdge.Right || edge == YGEdge.Start || edge == YGEdge.End) &&
    edges[YGEdge.Horizontal].unit != YGUnit.Undefined
  ) {
    return edges[YGEdge.Horizontal];
  }

  if (edges[YGEdge.All].unit != YGUnit.Undefined) {
    return edges[YGEdge.All];
  }

  if (edge == YGEdge.Start || edge == YGEdge.End) {
    return YGValueUndefined();
  }

  return defaultValue;
}
