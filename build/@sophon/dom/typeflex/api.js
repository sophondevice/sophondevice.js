/** sophon base library */
import { YGAlign, YGDimension, YGDirection, YGDisplay, YGEdge, YGExperimentalFeature, YGFlexDirection, YGJustify, YGLogLevel, YGMeasureMode, YGNodeType, YGOverflow, YGPositionType, YGUnit, YGWrap } from './enums.js';
import { YGConfigNew, YGConfigFree, YGConfigSetExperimentalFeatureEnabled, YGConfigSetPointScaleFactor, YGConfigIsExperimentalFeatureEnabled, YGNodeNew, YGNodeNewWithConfig, YGNodeSetContext, YGNodeCalculateLayout, YGNodeCopyStyle, YGNodeFree, YGNodeFreeRecursive, YGNodeStyleGetAlignContent, YGNodeStyleGetAlignItems, YGNodeStyleGetAlignSelf, YGNodeStyleGetAspectRatio, YGNodeStyleGetBorder, YGNodeGetChild, YGNodeGetChildCount, YGNodeLayoutGetBorder, YGNodeLayoutGetBottom, YGNodeLayoutGetHeight, YGNodeLayoutGetLeft, YGNodeLayoutGetRight, YGNodeLayoutGetTop, YGNodeLayoutGetWidth, YGNodeLayoutGetMargin, YGNodeLayoutGetPadding, YGNodeStyleGetDisplay, YGNodeStyleGetFlexBasis, YGNodeStyleGetFlexDirection, YGNodeStyleGetFlexGrow, YGNodeStyleGetFlexShrink, YGNodeStyleGetFlexWrap, YGNodeStyleGetHeight, YGNodeStyleGetJustifyContent, YGNodeStyleGetMargin, YGNodeStyleGetMaxHeight, YGNodeStyleGetMaxWidth, YGNodeStyleGetMinHeight, YGNodeStyleGetMinWidth, YGNodeStyleGetOverflow, YGNodeStyleGetPadding, YGNodeGetParent, YGNodeStyleGetPosition, YGNodeStyleGetPositionType, YGNodeStyleGetWidth, YGNodeInsertChild, YGNodeIsDirty, YGNodeMarkDirty, YGNodeRemoveChild, YGNodeReset, YGNodeStyleSetAlignContent, YGNodeStyleSetAlignItems, YGNodeStyleSetAlignSelf, YGNodeStyleSetAspectRatio, YGNodeStyleSetBorder, YGNodeStyleSetDisplay, YGNodeStyleSetFlex, YGNodeStyleSetFlexBasis, YGNodeStyleSetFlexBasisAuto, YGNodeStyleSetFlexBasisPercent, YGNodeStyleSetFlexDirection, YGNodeStyleSetFlexGrow, YGNodeStyleSetFlexShrink, YGNodeStyleSetFlexWrap, YGNodeStyleSetHeight, YGNodeStyleSetHeightAuto, YGNodeStyleSetHeightPercent, YGNodeStyleSetJustifyContent, YGNodeStyleSetMargin, YGNodeStyleSetMarginAuto, YGNodeStyleSetMarginPercent, YGNodeStyleSetMaxHeight, YGNodeStyleSetMaxHeightPercent, YGNodeStyleSetMaxWidth, YGNodeStyleSetMaxWidthPercent, YGNodeSetMeasureFunc, YGNodeStyleSetMinHeight, YGNodeStyleSetMinHeightPercent, YGNodeStyleSetMinWidth, YGNodeStyleSetMinWidthPercent, YGNodeStyleSetOverflow, YGNodeStyleSetPadding, YGNodeStyleSetPaddingPercent, YGNodeStyleSetPosition, YGNodeStyleSetPositionPercent, YGNodeStyleSetPositionType, YGNodeStyleSetWidth, YGNodeStyleSetWidthAuto, YGNodeStyleSetWidthPercent, YGNodeGetContext } from './yoga.js';
import { YGFloatSanitize } from './utils.js';

const ALIGN_AUTO = YGAlign.Auto;
const ALIGN_FLEX_START = YGAlign.FlexStart;
const ALIGN_CENTER = YGAlign.Center;
const ALIGN_FLEX_END = YGAlign.FlexEnd;
const ALIGN_STRETCH = YGAlign.Stretch;
const ALIGN_BASELINE = YGAlign.Baseline;
const ALIGN_SPACE_BETWEEN = YGAlign.SpaceBetween;
const ALIGN_SPACE_AROUND = YGAlign.SpaceAround;
YGDimension.Width;
YGDimension.Height;
YGDirection.Inherit;
const DIRECTION_LTR = YGDirection.LTR;
YGDirection.RTL;
const DISPLAY_FLEX = YGDisplay.Flex;
const DISPLAY_NONE = YGDisplay.None;
const EDGE_LEFT = YGEdge.Left;
const EDGE_TOP = YGEdge.Top;
const EDGE_RIGHT = YGEdge.Right;
const EDGE_BOTTOM = YGEdge.Bottom;
YGEdge.Start;
YGEdge.End;
YGEdge.Horizontal;
YGEdge.Vertical;
YGEdge.All;
YGExperimentalFeature.WebFlexBasis;
const FLEX_DIRECTION_COLUMN = YGFlexDirection.Column;
const FLEX_DIRECTION_COLUMN_REVERSE = YGFlexDirection.ColumnReverse;
const FLEX_DIRECTION_ROW = YGFlexDirection.Row;
const FLEX_DIRECTION_ROW_REVERSE = YGFlexDirection.RowReverse;
const JUSTIFY_FLEX_START = YGJustify.FlexStart;
const JUSTIFY_CENTER = YGJustify.Center;
const JUSTIFY_FLEX_END = YGJustify.FlexEnd;
const JUSTIFY_SPACE_BETWEEN = YGJustify.SpaceBetween;
const JUSTIFY_SPACE_AROUND = YGJustify.SpaceAround;
const JUSTIFY_SPACE_EVENLY = YGJustify.SpaceEvenly;
YGLogLevel.Error;
YGLogLevel.Warn;
YGLogLevel.Info;
YGLogLevel.Debug;
YGLogLevel.Verbose;
YGLogLevel.Fatal;
YGMeasureMode.Undefined;
YGMeasureMode.Exactly;
YGMeasureMode.AtMost;
YGNodeType.Default;
YGNodeType.Text;
YGOverflow.Visible;
YGOverflow.Hidden;
YGOverflow.Scroll;
const POSITION_TYPE_RELATIVE = YGPositionType.Relative;
const POSITION_TYPE_ABSOLUTE = YGPositionType.Absolute;
YGUnit.Undefined;
YGUnit.Point;
YGUnit.Percent;
YGUnit.Auto;
const WRAP_NO_WRAP = YGWrap.NoWrap;
const WRAP_WRAP = YGWrap.Wrap;
const WRAP_WRAP_REVERSE = YGWrap.WrapReverse;
const UNDEFINED = undefined;
class Layout {
    left;
    right;
    bottom;
    top;
    width;
    height;
}
class Value {
    unit;
    value;
    constructor(unit, value) {
        if (unit) {
            this.unit = unit;
            this.value = value;
        }
        else {
            this.unit = YGUnit.Undefined;
            this.value = 0;
        }
    }
}
class Config {
    config;
    static create() {
        return new Config();
    }
    constructor() {
        this.config = YGConfigNew();
    }
    free() {
        YGConfigFree(this.config);
    }
    setExperimentalFeatureEnabled(feature, enabled) {
        YGConfigSetExperimentalFeatureEnabled(this.config, feature, enabled);
    }
    setPointScaleFactor(pixelsInPoint) {
        YGConfigSetPointScaleFactor(this.config, pixelsInPoint);
    }
    isExperimentalFeatureEnabled(feature) {
        YGConfigIsExperimentalFeatureEnabled(this.config, feature);
    }
}
function fromYGNode(node) {
    return YGNodeGetContext(node);
}
function fromYGValue(val) {
    return new Value(val.unit, val.value);
}
class Node {
    node;
    static create(config) {
        if (config) {
            return new Node(config);
        }
        else {
            return new Node();
        }
    }
    static createDefault() {
        return new Node(undefined);
    }
    static createWithConfig(config) {
        return new Node(config);
    }
    constructor(config) {
        if (!config) {
            this.node = YGNodeNew();
        }
        else {
            this.node = YGNodeNewWithConfig(config.config);
        }
        YGNodeSetContext(this.node, this);
    }
    calculateLayout(width, height, direction) {
        YGNodeCalculateLayout(this.node, width, height, direction);
    }
    copyStyle(node) {
        YGNodeCopyStyle(this.node, node);
    }
    free() {
        YGNodeFree(this.node);
    }
    freeRecursive() {
        YGNodeFreeRecursive(this.node);
    }
    getAlignContent() {
        return YGNodeStyleGetAlignContent(this.node);
    }
    getAlignItems() {
        return YGNodeStyleGetAlignItems(this.node);
    }
    getAlignSelf() {
        return YGNodeStyleGetAlignSelf(this.node);
    }
    getAspectRatio() {
        return YGNodeStyleGetAspectRatio(this.node);
    }
    getBorder(edge) {
        return YGNodeStyleGetBorder(this.node, edge);
    }
    getChild(index) {
        return fromYGNode(YGNodeGetChild(this.node, index));
    }
    getChildCount() {
        return YGNodeGetChildCount(this.node);
    }
    getComputedBorder(edge) {
        return YGNodeLayoutGetBorder(this.node, edge);
    }
    getComputedBottom() {
        return YGNodeLayoutGetBottom(this.node);
    }
    getComputedHeight() {
        return YGFloatSanitize(YGNodeLayoutGetHeight(this.node));
    }
    getComputedLayout() {
        const layout = new Layout();
        layout.left = YGNodeLayoutGetLeft(this.node);
        layout.right = YGNodeLayoutGetRight(this.node);
        layout.top = YGNodeLayoutGetTop(this.node);
        layout.bottom = YGNodeLayoutGetBottom(this.node);
        layout.width = YGNodeLayoutGetWidth(this.node);
        layout.height = YGNodeLayoutGetHeight(this.node);
        return layout;
    }
    getComputedLeft() {
        return YGFloatSanitize(YGNodeLayoutGetLeft(this.node));
    }
    getComputedMargin(edge) {
        return YGFloatSanitize(YGNodeLayoutGetMargin(this.node, edge));
    }
    getComputedPadding(edge) {
        return YGFloatSanitize(YGNodeLayoutGetPadding(this.node, edge));
    }
    getComputedRight() {
        return YGFloatSanitize(YGNodeLayoutGetRight(this.node));
    }
    getComputedTop() {
        return YGFloatSanitize(YGNodeLayoutGetTop(this.node));
    }
    getComputedWidth() {
        return YGFloatSanitize(YGNodeLayoutGetWidth(this.node));
    }
    getDisplay() {
        return YGNodeStyleGetDisplay(this.node);
    }
    getFlexBasis() {
        return fromYGValue(YGNodeStyleGetFlexBasis(this.node));
    }
    getFlexDirection() {
        return YGNodeStyleGetFlexDirection(this.node);
    }
    getFlexGrow() {
        return YGNodeStyleGetFlexGrow(this.node);
    }
    getFlexShrink() {
        return YGNodeStyleGetFlexShrink(this.node);
    }
    getFlexWrap() {
        return YGNodeStyleGetFlexWrap(this.node);
    }
    getHeight() {
        return fromYGValue(YGNodeStyleGetHeight(this.node));
    }
    getJustifyContent() {
        return YGNodeStyleGetJustifyContent(this.node);
    }
    getMargin(edge) {
        return fromYGValue(YGNodeStyleGetMargin(this.node, edge));
    }
    getMaxHeight() {
        return fromYGValue(YGNodeStyleGetMaxHeight(this.node));
    }
    getMaxWidth() {
        return fromYGValue(YGNodeStyleGetMaxWidth(this.node));
    }
    getMinHeight() {
        return fromYGValue(YGNodeStyleGetMinHeight(this.node));
    }
    getMinWidth() {
        return fromYGValue(YGNodeStyleGetMinWidth(this.node));
    }
    getOverflow() {
        return YGNodeStyleGetOverflow(this.node);
    }
    getPadding(edge) {
        return fromYGValue(YGNodeStyleGetPadding(this.node, edge));
    }
    getParent() {
        const parent = YGNodeGetParent(this.node);
        if (!parent) {
            return undefined;
        }
        return fromYGNode(parent);
    }
    getPosition(edge) {
        return fromYGValue(YGNodeStyleGetPosition(this.node, edge));
    }
    getPositionType() {
        return YGNodeStyleGetPositionType(this.node);
    }
    getWidth() {
        return fromYGValue(YGNodeStyleGetWidth(this.node));
    }
    insertChild(child, index) {
        YGNodeInsertChild(this.node, child.node, index);
    }
    isDirty() {
        return YGNodeIsDirty(this.node);
    }
    markDirty() {
        YGNodeMarkDirty(this.node);
    }
    removeChild(child) {
        YGNodeRemoveChild(this.node, child.node);
    }
    reset() {
        YGNodeReset(this.node);
    }
    setAlignContent(alignContent) {
        YGNodeStyleSetAlignContent(this.node, alignContent);
    }
    setAlignItems(alignItems) {
        YGNodeStyleSetAlignItems(this.node, alignItems);
    }
    setAlignSelf(alignSelf) {
        YGNodeStyleSetAlignSelf(this.node, alignSelf);
    }
    setAspectRatio(aspectRatio) {
        YGNodeStyleSetAspectRatio(this.node, aspectRatio);
    }
    setBorder(edge, borderWidth) {
        YGNodeStyleSetBorder(this.node, edge, borderWidth);
    }
    setDisplay(display) {
        YGNodeStyleSetDisplay(this.node, display);
    }
    setFlex(flex) {
        YGNodeStyleSetFlex(this.node, flex);
    }
    setFlexBasis(flexBasis) {
        if (typeof flexBasis === 'string') {
            if (flexBasis === 'auto') {
                this.setFlexBasisAuto();
            }
            else if (flexBasis[flexBasis.length - 1] === '%') {
                this.setFlexBasisPercent(parseFloat(flexBasis));
            }
            else {
                return;
            }
        }
        else if (typeof flexBasis === 'number') {
            YGNodeStyleSetFlexBasis(this.node, flexBasis);
        }
    }
    setFlexBasisAuto() {
        YGNodeStyleSetFlexBasisAuto(this.node);
    }
    setFlexBasisPercent(flexBasis) {
        YGNodeStyleSetFlexBasisPercent(this.node, flexBasis);
    }
    setFlexDirection(flexDirection) {
        YGNodeStyleSetFlexDirection(this.node, flexDirection);
    }
    setFlexGrow(flexGrow) {
        YGNodeStyleSetFlexGrow(this.node, flexGrow);
    }
    setFlexShrink(flexShrink) {
        YGNodeStyleSetFlexShrink(this.node, flexShrink);
    }
    setFlexWrap(flexWrap) {
        YGNodeStyleSetFlexWrap(this.node, flexWrap);
    }
    setHeight(height) {
        if (typeof height === 'string') {
            if (height === 'auto') {
                this.setHeightAuto();
            }
            else if (height[height.length - 1] === '%') {
                this.setHeightPercent(parseFloat(height));
            }
            else {
                throw new Error('Invalid input type.');
            }
        }
        else {
            YGNodeStyleSetHeight(this.node, height);
        }
    }
    setHeightAuto() {
        YGNodeStyleSetHeightAuto(this.node);
    }
    setHeightPercent(height) {
        YGNodeStyleSetHeightPercent(this.node, height);
    }
    setJustifyContent(justifyContent) {
        YGNodeStyleSetJustifyContent(this.node, justifyContent);
    }
    setMargin(edge, margin) {
        if (typeof margin === 'string') {
            if (margin === 'auto') {
                this.setMarginAuto(edge);
            }
            else if (margin[margin.length - 1] === '%') {
                this.setMarginPercent(edge, parseFloat(margin));
            }
            else {
                throw new Error('Invalid input type.');
            }
        }
        else {
            YGNodeStyleSetMargin(this.node, edge, margin);
        }
    }
    setMarginAuto(edge) {
        YGNodeStyleSetMarginAuto(this.node, edge);
    }
    setMarginPercent(edge, margin) {
        YGNodeStyleSetMarginPercent(this.node, edge, margin);
    }
    setMaxHeight(maxHeight) {
        if (typeof maxHeight === 'string') {
            if (maxHeight[maxHeight.length - 1] === '%') {
                this.setMaxHeightPercent(parseFloat(maxHeight));
            }
            else {
                throw new Error('Invalid input type.');
            }
        }
        else {
            YGNodeStyleSetMaxHeight(this.node, maxHeight);
        }
    }
    setMaxHeightPercent(maxHeight) {
        YGNodeStyleSetMaxHeightPercent(this.node, maxHeight);
    }
    setMaxWidth(maxWidth) {
        if (typeof maxWidth === 'string') {
            if (maxWidth[maxWidth.length - 1] === '%') {
                this.setMaxWidthPercent(parseFloat(maxWidth));
            }
            else {
                throw new Error('Invalid input type.');
            }
        }
        else {
            YGNodeStyleSetMaxWidth(this.node, maxWidth);
        }
    }
    setMaxWidthPercent(maxWidth) {
        YGNodeStyleSetMaxWidthPercent(this.node, maxWidth);
    }
    setMeasureFunc(measureFunc) {
        if (measureFunc == null) {
            this.unsetMeasureFunc();
        }
        else {
            YGNodeSetMeasureFunc(this.node, measureFunc);
        }
    }
    unsetMeasureFunc() {
        YGNodeSetMeasureFunc(this.node, null);
    }
    setMinHeight(minHeight) {
        if (typeof minHeight === 'string') {
            if (minHeight[minHeight.length - 1] === '%') {
                this.setMinHeightPercent(parseFloat(minHeight));
            }
            else {
                throw new Error('Invalid input type.');
            }
        }
        else {
            YGNodeStyleSetMinHeight(this.node, minHeight);
        }
    }
    setMinHeightPercent(minHeight) {
        YGNodeStyleSetMinHeightPercent(this.node, minHeight);
    }
    setMinWidth(minWidth) {
        if (typeof minWidth === 'string') {
            if (minWidth[minWidth.length - 1] === '%') {
                this.setMinWidthPercent(parseFloat(minWidth));
            }
            else {
                throw new Error('Invalid input type.');
            }
        }
        else {
            YGNodeStyleSetMinWidth(this.node, minWidth);
        }
    }
    setMinWidthPercent(minWidth) {
        YGNodeStyleSetMinWidthPercent(this.node, minWidth);
    }
    setOverflow(overflow) {
        YGNodeStyleSetOverflow(this.node, overflow);
    }
    setPadding(edge, padding) {
        if (typeof padding === 'string') {
            if (padding[padding.length - 1] === '%') {
                this.setPaddingPercent(edge, parseFloat(padding));
            }
            else {
                throw new Error('Invalid input type.');
            }
        }
        else {
            YGNodeStyleSetPadding(this.node, edge, padding);
        }
    }
    setPaddingPercent(edge, padding) {
        YGNodeStyleSetPaddingPercent(this.node, edge, padding);
    }
    setPosition(edge, position) {
        if (typeof position === 'string') {
            if (position[position.length - 1] === '%') {
                this.setPositionPercent(edge, parseFloat(position));
            }
            else {
                throw new Error('Invalid input type.');
            }
        }
        else {
            YGNodeStyleSetPosition(this.node, edge, position);
        }
    }
    setPositionPercent(edge, position) {
        YGNodeStyleSetPositionPercent(this.node, edge, position);
    }
    setPositionType(positionType) {
        YGNodeStyleSetPositionType(this.node, positionType);
    }
    setWidth(width) {
        if (typeof width === 'string') {
            if (width[width.length - 1] === '%') {
                this.setWidthPercent(parseFloat(width));
            }
            else if (width === 'auto') {
                this.setWidthAuto();
            }
            else {
                throw new Error('Invalid input type.');
            }
        }
        else {
            YGNodeStyleSetWidth(this.node, width);
        }
    }
    setWidthAuto() {
        YGNodeStyleSetWidthAuto(this.node);
    }
    setWidthPercent(width) {
        YGNodeStyleSetWidthPercent(this.node, width);
    }
    unsetMeasureFun() {
        YGNodeSetMeasureFunc(this.node, undefined);
    }
}

export { ALIGN_AUTO, ALIGN_BASELINE, ALIGN_CENTER, ALIGN_FLEX_END, ALIGN_FLEX_START, ALIGN_SPACE_AROUND, ALIGN_SPACE_BETWEEN, ALIGN_STRETCH, Config, DIRECTION_LTR, DISPLAY_FLEX, DISPLAY_NONE, EDGE_BOTTOM, EDGE_LEFT, EDGE_RIGHT, EDGE_TOP, FLEX_DIRECTION_COLUMN, FLEX_DIRECTION_COLUMN_REVERSE, FLEX_DIRECTION_ROW, FLEX_DIRECTION_ROW_REVERSE, JUSTIFY_CENTER, JUSTIFY_FLEX_END, JUSTIFY_FLEX_START, JUSTIFY_SPACE_AROUND, JUSTIFY_SPACE_BETWEEN, JUSTIFY_SPACE_EVENLY, Layout, Node, POSITION_TYPE_ABSOLUTE, POSITION_TYPE_RELATIVE, UNDEFINED, Value, WRAP_NO_WRAP, WRAP_WRAP, WRAP_WRAP_REVERSE };
//# sourceMappingURL=api.js.map
