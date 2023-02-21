import { YGAlign, YGDimension, YGDirection, YGDisplay, YGEdge, YGExperimentalFeature, YGFlexDirection, YGJustify, YGLogLevel, YGMeasureMode, YGNodeType, YGOverflow, YGPositionType, YGUnit, YGWrap } from './enums';
import { YGNode } from './ygnode';
import { YGConfig } from './ygconfig';
export declare const ALIGN_AUTO = YGAlign.Auto;
export declare const ALIGN_FLEX_START = YGAlign.FlexStart;
export declare const ALIGN_CENTER = YGAlign.Center;
export declare const ALIGN_FLEX_END = YGAlign.FlexEnd;
export declare const ALIGN_STRETCH = YGAlign.Stretch;
export declare const ALIGN_BASELINE = YGAlign.Baseline;
export declare const ALIGN_SPACE_BETWEEN = YGAlign.SpaceBetween;
export declare const ALIGN_SPACE_AROUND = YGAlign.SpaceAround;
export declare const DIMENSION_WIDTH = YGDimension.Width;
export declare const DIMENSION_HEIGHT = YGDimension.Height;
export declare const DIRECTION_INHERIT = YGDirection.Inherit;
export declare const DIRECTION_LTR = YGDirection.LTR;
export declare const DIRECTION_RTL = YGDirection.RTL;
export declare const DISPLAY_FLEX = YGDisplay.Flex;
export declare const DISPLAY_NONE = YGDisplay.None;
export declare const EDGE_LEFT = YGEdge.Left;
export declare const EDGE_TOP = YGEdge.Top;
export declare const EDGE_RIGHT = YGEdge.Right;
export declare const EDGE_BOTTOM = YGEdge.Bottom;
export declare const EDGE_START = YGEdge.Start;
export declare const EDGE_END = YGEdge.End;
export declare const EDGE_HORIZONTAL = YGEdge.Horizontal;
export declare const EDGE_VERTICAL = YGEdge.Vertical;
export declare const EDGE_ALL = YGEdge.All;
export declare const EXPERIMENTALFEATURE_WEBFLEXBASIS = YGExperimentalFeature.WebFlexBasis;
export declare const FLEX_DIRECTION_COLUMN = YGFlexDirection.Column;
export declare const FLEX_DIRECTION_COLUMN_REVERSE = YGFlexDirection.ColumnReverse;
export declare const FLEX_DIRECTION_ROW = YGFlexDirection.Row;
export declare const FLEX_DIRECTION_ROW_REVERSE = YGFlexDirection.RowReverse;
export declare const JUSTIFY_FLEX_START = YGJustify.FlexStart;
export declare const JUSTIFY_CENTER = YGJustify.Center;
export declare const JUSTIFY_FLEX_END = YGJustify.FlexEnd;
export declare const JUSTIFY_SPACE_BETWEEN = YGJustify.SpaceBetween;
export declare const JUSTIFY_SPACE_AROUND = YGJustify.SpaceAround;
export declare const JUSTIFY_SPACE_EVENLY = YGJustify.SpaceEvenly;
export declare const LOGLEVEL_ERROR = YGLogLevel.Error;
export declare const LOGLEVEL_WARN = YGLogLevel.Warn;
export declare const LOGLEVEL_INFO = YGLogLevel.Info;
export declare const LOGLEVEL_DEBUG = YGLogLevel.Debug;
export declare const LOGLEVEL_VERBOSE = YGLogLevel.Verbose;
export declare const LOGLEVEL_FATAL = YGLogLevel.Fatal;
export declare const MEASURE_MODE_UNDEFINED = YGMeasureMode.Undefined;
export declare const MEASURE_MODE_EXACTLY = YGMeasureMode.Exactly;
export declare const MEASURE_MODE_AT_MOST = YGMeasureMode.AtMost;
export declare const NODE_TYPE_DEFAULT = YGNodeType.Default;
export declare const NODE_TYPE_TEXT = YGNodeType.Text;
export declare const OVERFLOW_VISIBLE = YGOverflow.Visible;
export declare const OVERFLOW_HIDDEN = YGOverflow.Hidden;
export declare const OVERFLOW_SCROLL = YGOverflow.Scroll;
export declare const POSITION_TYPE_RELATIVE = YGPositionType.Relative;
export declare const POSITION_TYPE_ABSOLUTE = YGPositionType.Absolute;
export declare const UNIT_UNDEFINED = YGUnit.Undefined;
export declare const UNIT_POINT = YGUnit.Point;
export declare const UNIT_PERCENT = YGUnit.Percent;
export declare const UNIT_AUTO = YGUnit.Auto;
export declare const WRAP_NO_WRAP = YGWrap.NoWrap;
export declare const WRAP_WRAP = YGWrap.Wrap;
export declare const WRAP_WRAP_REVERSE = YGWrap.WrapReverse;
export declare const UNDEFINED: number;
export declare class Layout {
    left: number;
    right: number;
    bottom: number;
    top: number;
    width: number;
    height: number;
}
export declare class Size {
    width: number;
    height: number;
    constructor(width?: number, height?: number);
    static fromJS(obj: {
        width: number;
        height: number;
    }): Size;
}
export declare class Value {
    unit: number;
    value: number;
    constructor(unit?: number, value?: number);
}
export declare class Config {
    config: YGConfig;
    static create(): Config;
    constructor();
    free(): void;
    setExperimentalFeatureEnabled(feature: number, enabled: boolean): void;
    setPointScaleFactor(pixelsInPoint: number): void;
    isExperimentalFeatureEnabled(feature: number): void;
}
export declare class Node {
    node: YGNode;
    static create(config?: Config): Node;
    static createDefault(): Node;
    static createWithConfig(config: Config): Node;
    constructor(config?: Config);
    calculateLayout(width?: number, height?: number, direction?: YGDirection): void;
    copyStyle(node: YGNode): void;
    free(): void;
    freeRecursive(): void;
    getAlignContent(): YGAlign;
    getAlignItems(): YGAlign;
    getAlignSelf(): YGAlign;
    getAspectRatio(): number;
    getBorder(edge: YGEdge): number;
    getChild(index: number): Node;
    getChildCount(): number;
    getComputedBorder(edge: YGEdge): number;
    getComputedBottom(): number;
    getComputedHeight(): number;
    getComputedLayout(): Layout;
    getComputedLeft(): number;
    getComputedMargin(edge: YGEdge): number;
    getComputedPadding(edge: YGEdge): number;
    getComputedRight(): number;
    getComputedTop(): number;
    getComputedWidth(): number;
    getDisplay(): YGDisplay;
    getFlexBasis(): Value;
    getFlexDirection(): YGFlexDirection;
    getFlexGrow(): number;
    getFlexShrink(): number;
    getFlexWrap(): YGWrap;
    getHeight(): Value;
    getJustifyContent(): YGJustify;
    getMargin(edge: YGEdge): Value;
    getMaxHeight(): Value;
    getMaxWidth(): Value;
    getMinHeight(): Value;
    getMinWidth(): Value;
    getOverflow(): YGOverflow;
    getPadding(edge: YGEdge): Value;
    getParent(): Node;
    getPosition(edge: YGEdge): Value;
    getPositionType(): YGPositionType;
    getWidth(): Value;
    insertChild(child: Node, index: number): void;
    isDirty(): boolean;
    markDirty(): void;
    removeChild(child: Node): void;
    reset(): void;
    setAlignContent(alignContent: YGAlign): void;
    setAlignItems(alignItems: YGAlign): void;
    setAlignSelf(alignSelf: YGAlign): void;
    setAspectRatio(aspectRatio: number): void;
    setBorder(edge: YGEdge, borderWidth: number): void;
    setDisplay(display: YGDisplay): void;
    setFlex(flex: number): void;
    setFlexBasis(flexBasis: number | string): void;
    setFlexBasisAuto(): void;
    setFlexBasisPercent(flexBasis: number): void;
    setFlexDirection(flexDirection: YGFlexDirection): void;
    setFlexGrow(flexGrow: number): void;
    setFlexShrink(flexShrink: number): void;
    setFlexWrap(flexWrap: YGWrap): void;
    setHeight(height: number | string): void;
    setHeightAuto(): void;
    setHeightPercent(height: number): void;
    setJustifyContent(justifyContent: YGJustify): void;
    setMargin(edge: YGEdge, margin: number | string): void;
    setMarginAuto(edge: YGEdge): void;
    setMarginPercent(edge: YGEdge, margin: number): void;
    setMaxHeight(maxHeight: number | string): void;
    setMaxHeightPercent(maxHeight: number): void;
    setMaxWidth(maxWidth: number | string): void;
    setMaxWidthPercent(maxWidth: number): void;
    setMeasureFunc(measureFunc: any): void;
    unsetMeasureFunc(): void;
    setMinHeight(minHeight: number | string): void;
    setMinHeightPercent(minHeight: number): void;
    setMinWidth(minWidth: number | string): void;
    setMinWidthPercent(minWidth: number): void;
    setOverflow(overflow: YGOverflow): void;
    setPadding(edge: YGEdge, padding: number | string): void;
    setPaddingPercent(edge: YGEdge, padding: number): void;
    setPosition(edge: YGEdge, position: number | string): void;
    setPositionPercent(edge: YGEdge, position: number): void;
    setPositionType(positionType: YGPositionType): void;
    setWidth(width: number | string): void;
    setWidthAuto(): void;
    setWidthPercent(width: number): void;
    unsetMeasureFun(): void;
}
export declare function getInstanceCount(): number;
