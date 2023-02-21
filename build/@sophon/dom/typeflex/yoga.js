/** sophon base library */
import { YGFlexDirection, YGAlign, YGUnit, YGDimension, YGEdge, YGDirection, YGMeasureMode, YGLogLevel, YGMeasureModeCount, YGNodeType, YGWrap, YGDisplay, YGPositionType, YGOverflow, YGJustify, YGExperimentalFeature } from './enums.js';
import { YGNode } from './ygnode.js';
import { YGConfig } from './ygconfig.js';
import { YGLayout } from './yglayout.js';
import { YGFloatOptional } from './ygfloatoptional.js';
import { YGValue } from './ygvalue.js';
import { YGFloatSanitize, YGUnwrapFloatOptional, YGResolveValue, YGFloatsEqual, YGResolveFlexDirection, YGFlexDirectionCross, YGFlexDirectionIsRow, YGFloatMax, YGFloatMin, YGFlexDirectionIsColumn, YGFloatOptionalMax, YGCollectFlexItemsRowValues } from './utils.js';
import { kDefaultFlexGrow, kWebDefaultFlexShrink, kDefaultFlexShrink, dim, YG_MAX_CACHED_RESULT_COUNT, pos, trailing, leading } from './internal.js';

class YGSize {
    width;
    height;
}
const YGUndefined = undefined;
const YGValueUndefined = function () {
    return new YGValue(YGUndefined, YGUnit.Undefined);
};
const YGValueAuto = function () {
    return new YGValue(YGUndefined, YGUnit.Auto);
};
const YGValueZero = function () {
    return new YGValue(0, YGUnit.Point);
};
function formatToString(format, args) {
    let ret = format;
    for (const arg of args[0][0]) {
        ret = ret.replace(/%[d|s|f]/, arg);
    }
    return ret;
}
function YGDefaultLog(config, node, level, format, ...args) {
    switch (level) {
        case YGLogLevel.Error:
        case YGLogLevel.Fatal:
            return console.error(formatToString(format, args));
        case YGLogLevel.Warn:
        case YGLogLevel.Info:
        case YGLogLevel.Debug:
        case YGLogLevel.Verbose:
        default:
            return console.log(formatToString(format, args));
    }
}
function YGFloatIsUndefined(value) {
    if (value === undefined || isNaN(value)) {
        return true;
    }
    return false;
}
function YGComputedEdgeValue(edges, edge, defaultValue) {
    if (edges[edge].unit != YGUnit.Undefined) {
        return edges[edge];
    }
    if ((edge == YGEdge.Top || edge == YGEdge.Bottom) &&
        edges[YGEdge.Vertical].unit != YGUnit.Undefined) {
        return edges[YGEdge.Vertical];
    }
    if ((edge == YGEdge.Left || edge == YGEdge.Right || edge == YGEdge.Start || edge == YGEdge.End) &&
        edges[YGEdge.Horizontal].unit != YGUnit.Undefined) {
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
function YGNodeGetContext(node) {
    return node.getContext();
}
function YGNodeSetContext(node, context) {
    return node.setContext(context);
}
function YGNodeSetMeasureFunc(node, measureFunc) {
    node.setMeasureFunc(measureFunc);
}
function YGNodeIsDirty(node) {
    return node.isDirty();
}
function YGNodeNewWithConfig(config) {
    const node = new YGNode();
    if (config.useWebDefaults) {
        node.setStyleFlexDirection(YGFlexDirection.Row);
        node.setStyleAlignContent(YGAlign.Stretch);
    }
    node.setConfig(config);
    return node;
}
function YGConfigGetDefault() {
    return YGConfigNew();
}
function YGNodeNew() {
    return YGNodeNewWithConfig(YGConfigGetDefault());
}
function YGNodeClone(oldNode) {
    console.log('clone?');
    const node = new YGNode(oldNode);
    node.setOwner(null);
    return node;
}
function YGConfigClone(oldConfig) {
    const config = new YGConfig(oldConfig.logger);
    return config;
}
function YGNodeDeepClone(oldNode) {
    const node = YGNodeClone(oldNode);
    const vec = new Array(oldNode.getChildren().length);
    let childNode = null;
    for (let i = 0; i < oldNode.getChildren().length; ++i) {
        const item = oldNode.getChild(i);
        childNode = YGNodeDeepClone(item);
        childNode.setOwner(node);
        vec.push(childNode);
    }
    node.setChildren(vec);
    if (oldNode.getConfig() != null) {
        node.setConfig(YGConfigClone(oldNode.getConfig()));
    }
    return node;
}
function YGNodeFree(node) {
    const owner = node.getOwner();
    if (owner != null) {
        owner.removeChild(node);
        node.setOwner(null);
    }
    const childCount = YGNodeGetChildCount(node);
    for (let i = 0; i < childCount; i++) {
        const child = YGNodeGetChild(node, i);
        child.setOwner(null);
    }
    node.clearChildren();
}
function YGConfigFreeRecursive(root) {
    if (root.getConfig() != null) {
        root.setConfig(null);
    }
    for (let i = 0; i < root.getChildrenCount(); ++i) {
        YGConfigFreeRecursive(root.getChild(i));
    }
}
function YGNodeFreeRecursive(root) {
    while (YGNodeGetChildCount(root) > 0) {
        const child = YGNodeGetChild(root, 0);
        if (child.getOwner() != root) {
            break;
        }
        YGNodeRemoveChild(root, child);
        YGNodeFreeRecursive(child);
    }
    YGNodeFree(root);
}
function YGNodeReset(node) {
    YGAssertWithNode(node, YGNodeGetChildCount(node) == 0, 'Cannot reset a node which still has children attached');
    YGAssertWithNode(node, node.getOwner() == null, 'Cannot reset a node still attached to a owner');
    node.clearChildren();
    const config = node.getConfig();
    node.fromNode(new YGNode());
    if (config.useWebDefaults) {
        node.setStyleFlexDirection(YGFlexDirection.Row);
        node.setStyleAlignContent(YGAlign.Stretch);
    }
    node.setConfig(config);
}
function YGConfigNew() {
    const config = new YGConfig(YGDefaultLog);
    return config;
}
function YGConfigFree(config) {
}
function YGNodeInsertChild(node, child, index) {
    YGAssertWithNode(node, child.getOwner() == null, 'Child already has a owner, it must be removed first.');
    YGAssertWithNode(node, node.getMeasure() == null, 'Cannot add child: Nodes with measure functions cannot have children.');
    node.cloneChildrenIfNeeded();
    node.insertChildIndex(child, index);
    const owner = child.getOwner() ? null : node;
    child.setOwner(owner);
    node.markDirtyAndPropogate();
}
function YGNodeRemoveChild(owner, excludedChild) {
    const childCount = YGNodeGetChildCount(owner);
    if (childCount == 0) {
        return;
    }
    const firstChild = YGNodeGetChild(owner, 0);
    if (firstChild.getOwner() == owner) {
        if (owner.removeChild(excludedChild)) {
            excludedChild.setLayout(new YGLayout());
            excludedChild.setOwner(null);
            owner.markDirtyAndPropogate();
        }
        return;
    }
    const cloneNodeCallback = owner.getConfig().cloneNodeCallback;
    let nextInsertIndex = 0;
    for (let i = 0; i < childCount; i++) {
        const oldChild = owner.getChild(i);
        if (excludedChild == oldChild) {
            owner.markDirtyAndPropogate();
            continue;
        }
        let newChild = null;
        if (cloneNodeCallback) {
            newChild = cloneNodeCallback(oldChild, owner, nextInsertIndex);
        }
        if (newChild == null) {
            newChild = YGNodeClone(oldChild);
        }
        owner.replaceChildIndex(newChild, nextInsertIndex);
        newChild.setOwner(owner);
        nextInsertIndex++;
    }
    while (nextInsertIndex < childCount) {
        owner.removeChildIndex(nextInsertIndex);
        nextInsertIndex++;
    }
}
function YGNodeGetChild(node, index) {
    const children = node.getChildren();
    if (index < children.length) {
        return children[index];
    }
    return null;
}
function YGNodeGetChildCount(node) {
    return node.getChildrenCount();
}
function YGNodeGetParent(node) {
    return node.getOwner();
}
function YGNodeMarkDirty(node) {
    YGAssertWithNode(node, node.getMeasure() != null, 'Only leaf nodes with custom measure functions should manually mark themselves as dirty');
    node.markDirtyAndPropogate();
}
function YGNodeCopyStyle(dstNode, srcNode) {
    if (!dstNode.getStyle().isEqual(srcNode.getStyle())) {
        dstNode.setStyle(srcNode.getStyle());
        dstNode.markDirtyAndPropogate();
    }
}
function YGNodeStyleGetFlexGrow(node) {
    return node.getStyle().flexGrow.isUndefined()
        ? kDefaultFlexGrow
        : node.getStyle().flexGrow.getValue();
}
function YGNodeStyleGetFlexShrink(node) {
    return node.getStyle().flexShrink.isUndefined()
        ? node.getConfig().useWebDefaults
            ? kWebDefaultFlexShrink
            : kDefaultFlexShrink
        : node.getStyle().flexShrink.getValue();
}
function YGNodeStyleSetFlexDirection(node, flexDirection) {
    if (node.getStyle().flexDirection != flexDirection) {
        const style = node.getStyle();
        style.flexDirection = flexDirection;
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleGetFlexDirection(node) {
    return node.getStyle().flexDirection;
}
function YGNodeStyleSetJustifyContent(node, justifyContent) {
    if (node.getStyle().justifyContent != justifyContent) {
        const style = node.getStyle();
        style.justifyContent = justifyContent;
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleGetJustifyContent(node) {
    return node.getStyle().justifyContent;
}
function YGNodeStyleSetAlignContent(node, alignContent) {
    if (node.getStyle().alignContent != alignContent) {
        const style = node.getStyle();
        style.alignContent = alignContent;
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleGetAlignContent(node) {
    return node.getStyle().alignContent;
}
function YGNodeStyleSetAlignItems(node, alignItems) {
    if (node.getStyle().alignItems != alignItems) {
        const style = node.getStyle();
        style.alignItems = alignItems;
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleGetAlignItems(node) {
    return node.getStyle().alignItems;
}
function YGNodeStyleSetAlignSelf(node, alignSelf) {
    if (node.getStyle().alignSelf != alignSelf) {
        const style = node.getStyle();
        style.alignSelf = alignSelf;
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleGetAlignSelf(node) {
    return node.getStyle().alignSelf;
}
function YGNodeStyleSetPositionType(node, positionType) {
    if (node.getStyle().positionType != positionType) {
        const style = node.getStyle();
        style.positionType = positionType;
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleGetPositionType(node) {
    return node.getStyle().positionType;
}
function YGNodeStyleSetFlexWrap(node, flexWrap) {
    if (node.getStyle().flexWrap != flexWrap) {
        const style = node.getStyle();
        style.flexWrap = flexWrap;
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleGetFlexWrap(node) {
    return node.getStyle().flexWrap;
}
function YGNodeStyleSetOverflow(node, overflow) {
    if (node.getStyle().overflow != overflow) {
        const style = node.getStyle();
        style.overflow = overflow;
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleGetOverflow(node) {
    return node.getStyle().overflow;
}
function YGNodeStyleSetDisplay(node, display) {
    if (node.getStyle().display != display) {
        const style = node.getStyle();
        style.display = display;
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleGetDisplay(node) {
    return node.getStyle().display;
}
function YGNodeStyleSetPosition(node, edge, position) {
    const value = new YGValue(YGFloatSanitize(position), YGFloatIsUndefined(position) ? YGUnit.Undefined : YGUnit.Point);
    if ((node.getStyle().position[edge].value != value.value && value.unit != YGUnit.Undefined) ||
        node.getStyle().position[edge].unit != value.unit) {
        const style = node.getStyle();
        style.position[edge] = value;
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleSetPositionPercent(node, edge, position) {
    const value = new YGValue(YGFloatSanitize(position), YGFloatIsUndefined(position) ? YGUnit.Undefined : YGUnit.Percent);
    if ((node.getStyle().position[edge].value != value.value && value.unit != YGUnit.Undefined) ||
        node.getStyle().position[edge].unit != value.unit) {
        const style = node.getStyle();
        style.position[edge] = value;
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleGetPosition(node, edge) {
    const value = node.getStyle().position[edge];
    if (value.unit == YGUnit.Undefined || value.unit == YGUnit.Auto) {
        value.value = YGUndefined;
    }
    return value;
}
function YGNodeStyleSetMargin(node, edge, margin) {
    const value = new YGValue(YGFloatSanitize(margin), YGFloatIsUndefined(margin) ? YGUnit.Undefined : YGUnit.Point);
    if ((node.getStyle().margin[edge].value != value.value && value.unit != YGUnit.Undefined) ||
        node.getStyle().margin[edge].unit != value.unit) {
        const style = node.getStyle();
        style.margin[edge] = value;
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleSetMarginPercent(node, edge, margin) {
    const value = new YGValue(YGFloatSanitize(margin), YGFloatIsUndefined(margin) ? YGUnit.Undefined : YGUnit.Percent);
    if ((node.getStyle().margin[edge].value != value.value && value.unit != YGUnit.Undefined) ||
        node.getStyle().margin[edge].unit != value.unit) {
        const style = node.getStyle();
        style.margin[edge] = value;
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleGetMargin(node, edge) {
    const value = node.getStyle().margin[edge];
    if (value.unit == YGUnit.Undefined || value.unit == YGUnit.Auto) {
        value.value = YGUndefined;
    }
    return value;
}
function YGNodeStyleSetPadding(node, edge, padding) {
    const value = new YGValue(YGFloatSanitize(padding), YGFloatIsUndefined(padding) ? YGUnit.Undefined : YGUnit.Point);
    if ((node.getStyle().padding[edge].value != value.value && value.unit != YGUnit.Undefined) ||
        node.getStyle().padding[edge].unit != value.unit) {
        const style = node.getStyle();
        style.padding[edge] = value;
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleSetPaddingPercent(node, edge, padding) {
    const value = new YGValue(YGFloatSanitize(padding), YGFloatIsUndefined(padding) ? YGUnit.Undefined : YGUnit.Percent);
    if ((node.getStyle().padding[edge].value != value.value && value.unit != YGUnit.Undefined) ||
        node.getStyle().padding[edge].unit != value.unit) {
        const style = node.getStyle();
        style.padding[edge] = value;
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleGetPadding(node, edge) {
    const value = node.getStyle().padding[edge];
    if (value.unit == YGUnit.Undefined || value.unit == YGUnit.Auto) {
        value.value = YGUndefined;
    }
    return value;
}
function YGNodeStyleSetMarginAuto(node, edge) {
    if (node.getStyle().margin[edge].unit != YGUnit.Auto) {
        const style = node.getStyle();
        style.margin[edge].value = 0;
        style.margin[edge].unit = YGUnit.Auto;
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleSetWidth(node, width) {
    const value = new YGValue(YGFloatSanitize(width), YGFloatIsUndefined(width) ? YGUnit.Undefined : YGUnit.Point);
    if ((node.getStyle().dimensions[YGDimension.Width].value != value.value &&
        value.unit != YGUnit.Undefined) ||
        node.getStyle().dimensions[YGDimension.Width].unit != value.unit) {
        const style = node.getStyle();
        style.dimensions[YGDimension.Width] = value;
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleSetWidthPercent(node, width) {
    if (node.getStyle().dimensions[YGDimension.Width].value != YGFloatSanitize(width) ||
        node.getStyle().dimensions[YGDimension.Width].unit != YGUnit.Percent) {
        const style = node.getStyle();
        style.dimensions[YGDimension.Width].value = YGFloatSanitize(width);
        style.dimensions[YGDimension.Width].unit = YGFloatIsUndefined(width)
            ? YGUnit.Auto
            : YGUnit.Percent;
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleSetWidthAuto(node) {
    if (node.getStyle().dimensions[YGDimension.Width].unit != YGUnit.Auto) {
        const style = node.getStyle();
        style.dimensions[YGDimension.Width].value = 0;
        style.dimensions[YGDimension.Width].unit = YGUnit.Auto;
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleGetWidth(node) {
    const value = node.getStyle().dimensions[YGDimension.Width];
    if (value.unit == YGUnit.Undefined || value.unit == YGUnit.Auto) {
        value.value = YGUndefined;
    }
    return value;
}
function YGNodeStyleSetHeight(node, height) {
    const value = new YGValue(YGFloatSanitize(height), YGFloatIsUndefined(height) ? YGUnit.Undefined : YGUnit.Point);
    if ((node.getStyle().dimensions[YGDimension.Height].value != value.value &&
        value.unit != YGUnit.Undefined) ||
        node.getStyle().dimensions[YGDimension.Height].unit != value.unit) {
        const style = node.getStyle();
        style.dimensions[YGDimension.Height] = value;
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleSetHeightPercent(node, height) {
    if (node.getStyle().dimensions[YGDimension.Height].value != YGFloatSanitize(height) ||
        node.getStyle().dimensions[YGDimension.Height].unit != YGUnit.Percent) {
        const style = node.getStyle();
        style.dimensions[YGDimension.Height].value = YGFloatSanitize(height);
        style.dimensions[YGDimension.Height].unit = YGFloatIsUndefined(height)
            ? YGUnit.Auto
            : YGUnit.Percent;
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleSetHeightAuto(node) {
    if (node.getStyle().dimensions[YGDimension.Height].unit != YGUnit.Auto) {
        const style = node.getStyle();
        style.dimensions[YGDimension.Height].value = 0;
        style.dimensions[YGDimension.Height].unit = YGUnit.Auto;
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleGetHeight(node) {
    const value = node.getStyle().dimensions[YGDimension.Height];
    if (value.unit == YGUnit.Undefined || value.unit == YGUnit.Auto) {
        value.value = YGUndefined;
    }
    return value;
}
function YGNodeStyleSetMinWidth(node, minWidth) {
    const value = new YGValue(YGFloatSanitize(minWidth), YGFloatIsUndefined(minWidth) ? YGUnit.Undefined : YGUnit.Point);
    if ((node.getStyle().minDimensions[YGDimension.Width].value != value.value &&
        value.unit != YGUnit.Undefined) ||
        node.getStyle().minDimensions[YGDimension.Width].unit != value.unit) {
        const style = node.getStyle();
        style.minDimensions[YGDimension.Width] = value;
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleSetMinWidthPercent(node, minWidth) {
    const value = new YGValue(YGFloatSanitize(minWidth), YGFloatIsUndefined(minWidth) ? YGUnit.Undefined : YGUnit.Percent);
    if ((node.getStyle().minDimensions[YGDimension.Width].value != value.value &&
        value.unit != YGUnit.Undefined) ||
        node.getStyle().minDimensions[YGDimension.Width].unit != value.unit) {
        const style = node.getStyle();
        style.minDimensions[YGDimension.Width] = value;
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleGetMinWidth(node) {
    const value = node.getStyle().minDimensions[YGDimension.Width];
    if (value.unit == YGUnit.Undefined || value.unit == YGUnit.Auto) {
        value.value = YGUndefined;
    }
    return value;
}
function YGNodeStyleSetMinHeight(node, minHeight) {
    const value = new YGValue(YGFloatSanitize(minHeight), YGFloatIsUndefined(minHeight) ? YGUnit.Undefined : YGUnit.Point);
    if ((node.getStyle().minDimensions[YGDimension.Height].value != value.value &&
        value.unit != YGUnit.Undefined) ||
        node.getStyle().minDimensions[YGDimension.Height].unit != value.unit) {
        const style = node.getStyle();
        style.minDimensions[YGDimension.Height] = value;
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleSetMinHeightPercent(node, minHeight) {
    const value = new YGValue(YGFloatSanitize(minHeight), YGFloatIsUndefined(minHeight) ? YGUnit.Undefined : YGUnit.Percent);
    if ((node.getStyle().minDimensions[YGDimension.Height].value != value.value &&
        value.unit != YGUnit.Undefined) ||
        node.getStyle().minDimensions[YGDimension.Height].unit != value.unit) {
        const style = node.getStyle();
        style.minDimensions[YGDimension.Height] = value;
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleGetMinHeight(node) {
    const value = node.getStyle().minDimensions[YGDimension.Height];
    if (value.unit == YGUnit.Undefined || value.unit == YGUnit.Auto) {
        value.value = YGUndefined;
    }
    return value;
}
function YGNodeStyleSetMaxWidth(node, maxWidth) {
    const value = new YGValue(YGFloatSanitize(maxWidth), YGFloatIsUndefined(maxWidth) ? YGUnit.Undefined : YGUnit.Point);
    if ((node.getStyle().maxDimensions[YGDimension.Width].value != value.value &&
        value.unit != YGUnit.Undefined) ||
        node.getStyle().maxDimensions[YGDimension.Width].unit != value.unit) {
        const style = node.getStyle();
        style.maxDimensions[YGDimension.Width] = value;
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleSetMaxWidthPercent(node, maxWidth) {
    const value = new YGValue(YGFloatSanitize(maxWidth), YGFloatIsUndefined(maxWidth) ? YGUnit.Undefined : YGUnit.Percent);
    if ((node.getStyle().maxDimensions[YGDimension.Width].value != value.value &&
        value.unit != YGUnit.Undefined) ||
        node.getStyle().maxDimensions[YGDimension.Width].unit != value.unit) {
        const style = node.getStyle();
        style.maxDimensions[YGDimension.Width] = value;
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleGetMaxWidth(node) {
    const value = node.getStyle().maxDimensions[YGDimension.Width];
    if (value.unit == YGUnit.Undefined || value.unit == YGUnit.Auto) {
        value.value = YGUndefined;
    }
    return value;
}
function YGNodeStyleSetMaxHeight(node, maxHeight) {
    const value = new YGValue(YGFloatSanitize(maxHeight), YGFloatIsUndefined(maxHeight) ? YGUnit.Undefined : YGUnit.Point);
    if ((node.getStyle().maxDimensions[YGDimension.Height].value != value.value &&
        value.unit != YGUnit.Undefined) ||
        node.getStyle().maxDimensions[YGDimension.Height].unit != value.unit) {
        const style = node.getStyle();
        style.maxDimensions[YGDimension.Height] = value;
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleSetMaxHeightPercent(node, maxHeight) {
    const value = new YGValue(YGFloatSanitize(maxHeight), YGFloatIsUndefined(maxHeight) ? YGUnit.Undefined : YGUnit.Percent);
    if ((node.getStyle().maxDimensions[YGDimension.Height].value != value.value &&
        value.unit != YGUnit.Undefined) ||
        node.getStyle().maxDimensions[YGDimension.Height].unit != value.unit) {
        const style = node.getStyle();
        style.maxDimensions[YGDimension.Height] = value;
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleGetMaxHeight(node) {
    const value = node.getStyle().maxDimensions[YGDimension.Height];
    if (value.unit == YGUnit.Undefined || value.unit == YGUnit.Auto) {
        value.value = YGUndefined;
    }
    return value;
}
function YGNodeLayoutGetLeft(node) {
    return node.getLayout().position[YGEdge.Left];
}
function YGNodeLayoutGetTop(node) {
    return node.getLayout().position[YGEdge.Top];
}
function YGNodeLayoutGetRight(node) {
    return node.getLayout().position[YGEdge.Right];
}
function YGNodeLayoutGetBottom(node) {
    return node.getLayout().position[YGEdge.Bottom];
}
function YGNodeLayoutGetWidth(node) {
    return node.getLayout().dimensions[YGDimension.Width];
}
function YGNodeLayoutGetHeight(node) {
    return node.getLayout().dimensions[YGDimension.Height];
}
function YGNodeLayoutGetMargin(node, edge) {
    YGAssertWithNode(node, edge <= YGEdge.End, 'Cannot get layout properties of multi-edge shorthands');
    if (edge == YGEdge.Left) {
        if (node.getLayout().direction == YGDirection.RTL) {
            return node.getLayout().margin[YGEdge.End];
        }
        else {
            return node.getLayout().margin[YGEdge.Start];
        }
    }
    if (edge == YGEdge.Right) {
        if (node.getLayout().direction == YGDirection.RTL) {
            return node.getLayout().margin[YGEdge.Start];
        }
        else {
            return node.getLayout().margin[YGEdge.End];
        }
    }
    return node.getLayout().margin[edge];
}
function YGNodeLayoutGetBorder(node, edge) {
    YGAssertWithNode(node, edge <= YGEdge.End, 'Cannot get layout properties of multi-edge shorthands');
    if (edge == YGEdge.Left) {
        if (node.getLayout().direction == YGDirection.RTL) {
            return node.getLayout().border[YGEdge.End];
        }
        else {
            return node.getLayout().border[YGEdge.Start];
        }
    }
    if (edge == YGEdge.Right) {
        if (node.getLayout().direction == YGDirection.RTL) {
            return node.getLayout().border[YGEdge.Start];
        }
        else {
            return node.getLayout().border[YGEdge.End];
        }
    }
    return node.getLayout().border[edge];
}
function YGNodeLayoutGetPadding(node, edge) {
    YGAssertWithNode(node, edge <= YGEdge.End, 'Cannot get layout properties of multi-edge shorthands');
    if (edge == YGEdge.Left) {
        if (node.getLayout().direction == YGDirection.RTL) {
            return node.getLayout().padding[YGEdge.End];
        }
        else {
            return node.getLayout().padding[YGEdge.Start];
        }
    }
    if (edge == YGEdge.Right) {
        if (node.getLayout().direction == YGDirection.RTL) {
            return node.getLayout().padding[YGEdge.Start];
        }
        else {
            return node.getLayout().padding[YGEdge.End];
        }
    }
    return node.getLayout().padding[edge];
}
function YGNodeStyleSetFlex(node, flex) {
    if (node.getStyle().flex.isDiffValue(flex)) {
        const style = node.getStyle();
        if (YGFloatIsUndefined(flex)) {
            style.flex = new YGFloatOptional();
        }
        else {
            style.flex = new YGFloatOptional(flex);
        }
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleSetFlexGrow(node, flexGrow) {
    if (node.getStyle().flexGrow.isDiffValue(flexGrow)) {
        const style = node.getStyle();
        if (YGFloatIsUndefined(flexGrow)) {
            style.flexGrow = new YGFloatOptional();
        }
        else {
            style.flexGrow = new YGFloatOptional(flexGrow);
        }
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleSetFlexShrink(node, flexShrink) {
    if (node.getStyle().flexShrink.isDiffValue(flexShrink)) {
        const style = node.getStyle();
        if (YGFloatIsUndefined(flexShrink)) {
            style.flexShrink = new YGFloatOptional();
        }
        else {
            style.flexShrink = new YGFloatOptional(flexShrink);
        }
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleGetFlexBasis(node) {
    const flexBasis = node.getStyle().flexBasis;
    if (flexBasis.unit == YGUnit.Undefined || flexBasis.unit == YGUnit.Auto) {
        flexBasis.value = YGUndefined;
    }
    return flexBasis;
}
function YGNodeStyleSetFlexBasis(node, flexBasis) {
    const value = new YGValue(YGFloatSanitize(flexBasis), YGFloatIsUndefined(flexBasis) ? YGUnit.Undefined : YGUnit.Point);
    if ((node.getStyle().flexBasis.value != value.value && value.unit != YGUnit.Undefined) ||
        node.getStyle().flexBasis.unit != value.unit) {
        const style = node.getStyle();
        style.flexBasis = value;
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleSetFlexBasisPercent(node, flexBasisPercent) {
    if (node.getStyle().flexBasis.value != flexBasisPercent ||
        node.getStyle().flexBasis.unit != YGUnit.Percent) {
        const style = node.getStyle();
        style.flexBasis.value = YGFloatSanitize(flexBasisPercent);
        style.flexBasis.unit = YGFloatIsUndefined(flexBasisPercent) ? YGUnit.Auto : YGUnit.Percent;
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleSetFlexBasisAuto(node) {
    if (node.getStyle().flexBasis.unit != YGUnit.Auto) {
        const style = node.getStyle();
        style.flexBasis.value = 0;
        style.flexBasis.unit = YGUnit.Auto;
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleSetBorder(node, edge, border) {
    const value = new YGValue(YGFloatSanitize(border), YGFloatIsUndefined(border) ? YGUnit.Undefined : YGUnit.Point);
    if ((node.getStyle().border[edge].value != value.value && value.unit != YGUnit.Undefined) ||
        node.getStyle().border[edge].unit != value.unit) {
        const style = node.getStyle();
        style.border[edge] = value;
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
function YGNodeStyleGetBorder(node, edge) {
    if (node.getStyle().border[edge].unit == YGUnit.Undefined ||
        node.getStyle().border[edge].unit == YGUnit.Auto) {
        return YGUndefined;
    }
    return node.getStyle().border[edge].value;
}
function YGNodeStyleGetAspectRatio(node) {
    const op = node.getStyle().aspectRatio;
    return op.isUndefined() ? YGUndefined : op.getValue();
}
function YGNodeStyleSetAspectRatio(node, aspectRatio) {
    if (node.getStyle().aspectRatio.isDiffValue(aspectRatio)) {
        const style = node.getStyle();
        style.aspectRatio = new YGFloatOptional(aspectRatio);
        node.setStyle(style);
        node.markDirtyAndPropogate();
    }
}
let gCurrentGenerationCount = 0;
function YGNodePaddingAndBorderForAxis(node, axis, widthSize) {
    return YGUnwrapFloatOptional(node
        .getLeadingPaddingAndBorder(axis, widthSize)
        .add(node.getTrailingPaddingAndBorder(axis, widthSize)));
}
function YGNodeAlignItem(node, child) {
    const align = child.getStyle().alignSelf == YGAlign.Auto
        ? node.getStyle().alignItems
        : child.getStyle().alignSelf;
    if (align == YGAlign.Baseline && YGFlexDirectionIsColumn(node.getStyle().flexDirection)) {
        return YGAlign.FlexStart;
    }
    return align;
}
function YGBaseline(node) {
    if (node.getBaseline() != null) {
        const baseline = node.getBaseline()(node, node.getLayout().measuredDimensions[YGDimension.Width], node.getLayout().measuredDimensions[YGDimension.Height]);
        YGAssertWithNode(node, !YGFloatIsUndefined(baseline), 'Expect custom baseline function to not return NaN');
        return baseline;
    }
    let baselineChild = null;
    const childCount = YGNodeGetChildCount(node);
    for (let i = 0; i < childCount; i++) {
        const child = YGNodeGetChild(node, i);
        if (child.getLineIndex() > 0) {
            break;
        }
        if (child.getStyle().positionType == YGPositionType.Absolute) {
            continue;
        }
        if (YGNodeAlignItem(node, child) == YGAlign.Baseline) {
            baselineChild = child;
            break;
        }
        if (baselineChild == null) {
            baselineChild = child;
        }
    }
    if (baselineChild == null) {
        return node.getLayout().measuredDimensions[YGDimension.Height];
    }
    const baseline = YGBaseline(baselineChild);
    return baseline + baselineChild.getLayout().position[YGEdge.Top];
}
function YGIsBaselineLayout(node) {
    if (YGFlexDirectionIsColumn(node.getStyle().flexDirection)) {
        return false;
    }
    if (node.getStyle().alignItems == YGAlign.Baseline) {
        return true;
    }
    const childCount = YGNodeGetChildCount(node);
    for (let i = 0; i < childCount; i++) {
        const child = YGNodeGetChild(node, i);
        if (child.getStyle().positionType == YGPositionType.Relative &&
            child.getStyle().alignSelf == YGAlign.Baseline) {
            return true;
        }
    }
    return false;
}
function YGNodeDimWithMargin(node, axis, widthSize) {
    return (node.getLayout().measuredDimensions[dim[axis]] +
        YGUnwrapFloatOptional(node.getLeadingMargin(axis, widthSize).add(node.getTrailingMargin(axis, widthSize))));
}
function YGNodeIsStyleDimDefined(node, axis, ownerSize) {
    const isUndefined = YGFloatIsUndefined(node.getResolvedDimension(dim[axis]).value);
    return !(node.getResolvedDimension(dim[axis]).unit == YGUnit.Auto ||
        node.getResolvedDimension(dim[axis]).unit == YGUnit.Undefined ||
        (node.getResolvedDimension(dim[axis]).unit == YGUnit.Point &&
            !isUndefined &&
            node.getResolvedDimension(dim[axis]).value < 0.0) ||
        (node.getResolvedDimension(dim[axis]).unit == YGUnit.Percent &&
            !isUndefined &&
            (node.getResolvedDimension(dim[axis]).value < 0.0 || YGFloatIsUndefined(ownerSize))));
}
function YGNodeIsLayoutDimDefined(node, axis) {
    const value = node.getLayout().measuredDimensions[dim[axis]];
    return !YGFloatIsUndefined(value) && value >= 0.0;
}
function YGNodeBoundAxisWithinMinAndMax(node, axis, value, axisSize) {
    let min;
    let max;
    if (YGFlexDirectionIsColumn(axis)) {
        min = YGResolveValue(node.getStyle().minDimensions[YGDimension.Height], axisSize);
        max = YGResolveValue(node.getStyle().maxDimensions[YGDimension.Height], axisSize);
    }
    else if (YGFlexDirectionIsRow(axis)) {
        min = YGResolveValue(node.getStyle().minDimensions[YGDimension.Width], axisSize);
        max = YGResolveValue(node.getStyle().maxDimensions[YGDimension.Width], axisSize);
    }
    if (!max.isUndefined() && max.getValue() >= 0 && value > max.getValue()) {
        return max;
    }
    if (!min.isUndefined() && min.getValue() >= 0 && value < min.getValue()) {
        return min;
    }
    return new YGFloatOptional(value);
}
function YGNodeBoundAxis(node, axis, value, axisSize, widthSize) {
    return YGFloatMax(YGUnwrapFloatOptional(YGNodeBoundAxisWithinMinAndMax(node, axis, value, axisSize)), YGNodePaddingAndBorderForAxis(node, axis, widthSize));
}
function YGNodeSetChildTrailingPosition(node, child, axis) {
    const size = child.getLayout().measuredDimensions[dim[axis]];
    child.setLayoutPosition(node.getLayout().measuredDimensions[dim[axis]] -
        size -
        child.getLayout().position[pos[axis]], trailing[axis]);
}
function YGConstrainMaxSizeForMode(node, axis, ownerAxisSize, ownerWidth, mode, size) {
    const maxSize = YGResolveValue(node.getStyle().maxDimensions[dim[axis]], ownerAxisSize).add(node.getMarginForAxis(axis, ownerWidth));
    switch (mode.value) {
        case YGMeasureMode.Exactly:
        case YGMeasureMode.AtMost:
            size.value =
                maxSize.isUndefined() || size.value < maxSize.getValue() ? size.value : maxSize.getValue();
            break;
        case YGMeasureMode.Undefined:
            if (!maxSize.isUndefined()) {
                mode.value = YGMeasureMode.AtMost;
                size.value = maxSize.getValue();
            }
            break;
    }
}
function YGNodeComputeFlexBasisForChild(node, child, width, widthMode, height, ownerWidth, ownerHeight, heightMode, direction, config) {
    const mainAxis = YGResolveFlexDirection(node.getStyle().flexDirection, direction);
    const isMainAxisRow = YGFlexDirectionIsRow(mainAxis);
    const mainAxisSize = isMainAxisRow ? width : height;
    const mainAxisownerSize = isMainAxisRow ? ownerWidth : ownerHeight;
    let childWidth;
    let childHeight;
    let childWidthMeasureMode;
    let childHeightMeasureMode;
    const resolvedFlexBasis = YGResolveValue(child.resolveFlexBasisPtr(), mainAxisownerSize);
    const isRowStyleDimDefined = YGNodeIsStyleDimDefined(child, YGFlexDirection.Row, ownerWidth);
    const isColumnStyleDimDefined = YGNodeIsStyleDimDefined(child, YGFlexDirection.Column, ownerHeight);
    if (!resolvedFlexBasis.isUndefined() && !YGFloatIsUndefined(mainAxisSize)) {
        if (child.getLayout().computedFlexBasis.isUndefined() ||
            (YGConfigIsExperimentalFeatureEnabled(child.getConfig(), YGExperimentalFeature.WebFlexBasis) &&
                child.getLayout().computedFlexBasisGeneration != gCurrentGenerationCount)) {
            const paddingAndBorder = new YGFloatOptional(YGNodePaddingAndBorderForAxis(child, mainAxis, ownerWidth));
            child.setLayoutComputedFlexBasis(YGFloatOptionalMax(resolvedFlexBasis, paddingAndBorder));
        }
    }
    else if (isMainAxisRow && isRowStyleDimDefined) {
        const paddingAndBorder = new YGFloatOptional(YGNodePaddingAndBorderForAxis(child, YGFlexDirection.Row, ownerWidth));
        child.setLayoutComputedFlexBasis(YGFloatOptionalMax(YGResolveValue(child.getResolvedDimension(YGDimension.Width), ownerWidth), paddingAndBorder));
    }
    else if (!isMainAxisRow && isColumnStyleDimDefined) {
        const paddingAndBorder = new YGFloatOptional(YGNodePaddingAndBorderForAxis(child, YGFlexDirection.Column, ownerWidth));
        child.setLayoutComputedFlexBasis(YGFloatOptionalMax(YGResolveValue(child.getResolvedDimension(YGDimension.Height), ownerHeight), paddingAndBorder));
    }
    else {
        childWidth = YGUndefined;
        childHeight = YGUndefined;
        childWidthMeasureMode = YGMeasureMode.Undefined;
        childHeightMeasureMode = YGMeasureMode.Undefined;
        const marginRow = YGUnwrapFloatOptional(child.getMarginForAxis(YGFlexDirection.Row, ownerWidth));
        const marginColumn = YGUnwrapFloatOptional(child.getMarginForAxis(YGFlexDirection.Column, ownerWidth));
        if (isRowStyleDimDefined) {
            childWidth =
                YGUnwrapFloatOptional(YGResolveValue(child.getResolvedDimension(YGDimension.Width), ownerWidth)) + marginRow;
            childWidthMeasureMode = YGMeasureMode.Exactly;
        }
        if (isColumnStyleDimDefined) {
            childHeight =
                YGUnwrapFloatOptional(YGResolveValue(child.getResolvedDimension(YGDimension.Height), ownerHeight)) + marginColumn;
            childHeightMeasureMode = YGMeasureMode.Exactly;
        }
        if ((!isMainAxisRow && node.getStyle().overflow == YGOverflow.Scroll) ||
            node.getStyle().overflow != YGOverflow.Scroll) {
            if (YGFloatIsUndefined(childWidth) && !YGFloatIsUndefined(width)) {
                childWidth = width;
                childWidthMeasureMode = YGMeasureMode.AtMost;
            }
        }
        if ((isMainAxisRow && node.getStyle().overflow == YGOverflow.Scroll) ||
            node.getStyle().overflow != YGOverflow.Scroll) {
            if (YGFloatIsUndefined(childHeight) && !YGFloatIsUndefined(height)) {
                childHeight = height;
                childHeightMeasureMode = YGMeasureMode.AtMost;
            }
        }
        if (!child.getStyle().aspectRatio.isUndefined()) {
            if (!isMainAxisRow && childWidthMeasureMode == YGMeasureMode.Exactly) {
                childHeight =
                    marginColumn + (childWidth - marginRow) / child.getStyle().aspectRatio.getValue();
                childHeightMeasureMode = YGMeasureMode.Exactly;
            }
            else if (isMainAxisRow && childHeightMeasureMode == YGMeasureMode.Exactly) {
                childWidth =
                    marginRow + (childHeight - marginColumn) * child.getStyle().aspectRatio.getValue();
                childWidthMeasureMode = YGMeasureMode.Exactly;
            }
        }
        const hasExactWidth = !YGFloatIsUndefined(width) && widthMode == YGMeasureMode.Exactly;
        const childWidthStretch = YGNodeAlignItem(node, child) == YGAlign.Stretch &&
            childWidthMeasureMode != YGMeasureMode.Exactly;
        if (!isMainAxisRow && !isRowStyleDimDefined && hasExactWidth && childWidthStretch) {
            childWidth = width;
            childWidthMeasureMode = YGMeasureMode.Exactly;
            if (!child.getStyle().aspectRatio.isUndefined()) {
                childHeight = (childWidth - marginRow) / child.getStyle().aspectRatio.getValue();
                childHeightMeasureMode = YGMeasureMode.Exactly;
            }
        }
        const hasExactHeight = !YGFloatIsUndefined(height) && heightMode == YGMeasureMode.Exactly;
        const childHeightStretch = YGNodeAlignItem(node, child) == YGAlign.Stretch &&
            childHeightMeasureMode != YGMeasureMode.Exactly;
        if (isMainAxisRow && !isColumnStyleDimDefined && hasExactHeight && childHeightStretch) {
            childHeight = height;
            childHeightMeasureMode = YGMeasureMode.Exactly;
            if (!child.getStyle().aspectRatio.isUndefined()) {
                childWidth = (childHeight - marginColumn) * child.getStyle().aspectRatio.getValue();
                childWidthMeasureMode = YGMeasureMode.Exactly;
            }
        }
        const childWidthMeasureModeRef = { value: childWidthMeasureMode };
        const childWidthRef = { value: childWidth };
        const childHeightMeasureModeRef = { value: childHeightMeasureMode };
        const childHeightRef = { value: childHeight };
        YGConstrainMaxSizeForMode(child, YGFlexDirection.Row, ownerWidth, ownerWidth, childWidthMeasureModeRef, childWidthRef);
        YGConstrainMaxSizeForMode(child, YGFlexDirection.Column, ownerHeight, ownerWidth, childHeightMeasureModeRef, childHeightRef);
        YGLayoutNodeInternal(child, childWidthRef.value, childHeightRef.value, direction, childWidthMeasureModeRef.value, childHeightMeasureModeRef.value, ownerWidth, ownerHeight, false, 'measure', config);
        child.setLayoutComputedFlexBasis(new YGFloatOptional(YGFloatMax(child.getLayout().measuredDimensions[dim[mainAxis]], YGNodePaddingAndBorderForAxis(child, mainAxis, ownerWidth))));
    }
    child.setLayoutComputedFlexBasisGeneration(gCurrentGenerationCount);
}
function YGNodeAbsoluteLayoutChild(node, child, width, widthMode, height, direction, config) {
    const mainAxis = YGResolveFlexDirection(node.getStyle().flexDirection, direction);
    const crossAxis = YGFlexDirectionCross(mainAxis, direction);
    const isMainAxisRow = YGFlexDirectionIsRow(mainAxis);
    let childWidth = YGUndefined;
    let childHeight = YGUndefined;
    let childWidthMeasureMode = YGMeasureMode.Undefined;
    let childHeightMeasureMode = YGMeasureMode.Undefined;
    const marginRow = YGUnwrapFloatOptional(child.getMarginForAxis(YGFlexDirection.Row, width));
    const marginColumn = YGUnwrapFloatOptional(child.getMarginForAxis(YGFlexDirection.Column, width));
    if (YGNodeIsStyleDimDefined(child, YGFlexDirection.Row, width)) {
        childWidth =
            YGUnwrapFloatOptional(YGResolveValue(child.getResolvedDimension(YGDimension.Width), width)) +
                marginRow;
    }
    else {
        if (child.isLeadingPositionDefined(YGFlexDirection.Row) &&
            child.isTrailingPosDefined(YGFlexDirection.Row)) {
            childWidth =
                node.getLayout().measuredDimensions[YGDimension.Width] -
                    (node.getLeadingBorder(YGFlexDirection.Row) + node.getTrailingBorder(YGFlexDirection.Row)) -
                    YGUnwrapFloatOptional(child
                        .getLeadingPosition(YGFlexDirection.Row, width)
                        .add(child.getTrailingPosition(YGFlexDirection.Row, width)));
            childWidth = YGNodeBoundAxis(child, YGFlexDirection.Row, childWidth, width, width);
        }
    }
    if (YGNodeIsStyleDimDefined(child, YGFlexDirection.Column, height)) {
        childHeight =
            YGUnwrapFloatOptional(YGResolveValue(child.getResolvedDimension(YGDimension.Height), height)) + marginColumn;
    }
    else {
        if (child.isLeadingPositionDefined(YGFlexDirection.Column) &&
            child.isTrailingPosDefined(YGFlexDirection.Column)) {
            childHeight =
                node.getLayout().measuredDimensions[YGDimension.Height] -
                    (node.getLeadingBorder(YGFlexDirection.Column) +
                        node.getTrailingBorder(YGFlexDirection.Column)) -
                    YGUnwrapFloatOptional(child
                        .getLeadingPosition(YGFlexDirection.Column, height)
                        .add(child.getTrailingPosition(YGFlexDirection.Column, height)));
            childHeight = YGNodeBoundAxis(child, YGFlexDirection.Column, childHeight, height, width);
        }
    }
    if (YGFloatIsUndefined(childWidth)
        ? !YGFloatIsUndefined(childHeight)
        : YGFloatIsUndefined(childHeight)) {
        if (!child.getStyle().aspectRatio.isUndefined()) {
            if (YGFloatIsUndefined(childWidth)) {
                childWidth =
                    marginRow + (childHeight - marginColumn) * child.getStyle().aspectRatio.getValue();
            }
            else if (YGFloatIsUndefined(childHeight)) {
                childHeight =
                    marginColumn + (childWidth - marginRow) / child.getStyle().aspectRatio.getValue();
            }
        }
    }
    if (YGFloatIsUndefined(childWidth) || YGFloatIsUndefined(childHeight)) {
        childWidthMeasureMode = YGFloatIsUndefined(childWidth)
            ? YGMeasureMode.Undefined
            : YGMeasureMode.Exactly;
        childHeightMeasureMode = YGFloatIsUndefined(childHeight)
            ? YGMeasureMode.Undefined
            : YGMeasureMode.Exactly;
        if (!isMainAxisRow &&
            YGFloatIsUndefined(childWidth) &&
            widthMode != YGMeasureMode.Undefined &&
            !YGFloatIsUndefined(width) &&
            width > 0) {
            childWidth = width;
            childWidthMeasureMode = YGMeasureMode.AtMost;
        }
        YGLayoutNodeInternal(child, childWidth, childHeight, direction, childWidthMeasureMode, childHeightMeasureMode, childWidth, childHeight, false, 'abs-measure', config);
        childWidth =
            child.getLayout().measuredDimensions[YGDimension.Width] +
                YGUnwrapFloatOptional(child.getMarginForAxis(YGFlexDirection.Row, width));
        childHeight =
            child.getLayout().measuredDimensions[YGDimension.Height] +
                YGUnwrapFloatOptional(child.getMarginForAxis(YGFlexDirection.Column, width));
    }
    YGLayoutNodeInternal(child, childWidth, childHeight, direction, YGMeasureMode.Exactly, YGMeasureMode.Exactly, childWidth, childHeight, true, 'abs-layout', config);
    if (child.isTrailingPosDefined(mainAxis) && !child.isLeadingPositionDefined(mainAxis)) {
        child.setLayoutPosition(node.getLayout().measuredDimensions[dim[mainAxis]] -
            child.getLayout().measuredDimensions[dim[mainAxis]] -
            node.getTrailingBorder(mainAxis) -
            YGUnwrapFloatOptional(child.getTrailingMargin(mainAxis, width)) -
            YGUnwrapFloatOptional(child.getTrailingPosition(mainAxis, isMainAxisRow ? width : height)), leading[mainAxis]);
    }
    else if (!child.isLeadingPositionDefined(mainAxis) &&
        node.getStyle().justifyContent == YGJustify.Center) {
        child.setLayoutPosition((node.getLayout().measuredDimensions[dim[mainAxis]] -
            child.getLayout().measuredDimensions[dim[mainAxis]]) /
            2.0, leading[mainAxis]);
    }
    else if (!child.isLeadingPositionDefined(mainAxis) &&
        node.getStyle().justifyContent == YGJustify.FlexEnd) {
        child.setLayoutPosition(node.getLayout().measuredDimensions[dim[mainAxis]] -
            child.getLayout().measuredDimensions[dim[mainAxis]], leading[mainAxis]);
    }
    if (child.isTrailingPosDefined(crossAxis) && !child.isLeadingPositionDefined(crossAxis)) {
        child.setLayoutPosition(node.getLayout().measuredDimensions[dim[crossAxis]] -
            child.getLayout().measuredDimensions[dim[crossAxis]] -
            node.getTrailingBorder(crossAxis) -
            YGUnwrapFloatOptional(child.getTrailingMargin(crossAxis, width)) -
            YGUnwrapFloatOptional(child.getTrailingPosition(crossAxis, isMainAxisRow ? height : width)), leading[crossAxis]);
    }
    else if (!child.isLeadingPositionDefined(crossAxis) &&
        YGNodeAlignItem(node, child) == YGAlign.Center) {
        child.setLayoutPosition((node.getLayout().measuredDimensions[dim[crossAxis]] -
            child.getLayout().measuredDimensions[dim[crossAxis]]) /
            2.0, leading[crossAxis]);
    }
    else if (!child.isLeadingPositionDefined(crossAxis) &&
        (YGNodeAlignItem(node, child) == YGAlign.FlexEnd
            ? !(node.getStyle().flexWrap == YGWrap.WrapReverse)
            : node.getStyle().flexWrap == YGWrap.WrapReverse)) {
        child.setLayoutPosition(node.getLayout().measuredDimensions[dim[crossAxis]] -
            child.getLayout().measuredDimensions[dim[crossAxis]], leading[crossAxis]);
    }
}
function YGNodeWithMeasureFuncSetMeasuredDimensions(node, availableWidth, availableHeight, widthMeasureMode, heightMeasureMode, ownerWidth, ownerHeight) {
    YGAssertWithNode(node, node.getMeasure() != null, 'Expected node to have custom measure function');
    const paddingAndBorderAxisRow = YGNodePaddingAndBorderForAxis(node, YGFlexDirection.Row, availableWidth);
    const paddingAndBorderAxisColumn = YGNodePaddingAndBorderForAxis(node, YGFlexDirection.Column, availableWidth);
    const marginAxisRow = YGUnwrapFloatOptional(node.getMarginForAxis(YGFlexDirection.Row, availableWidth));
    const marginAxisColumn = YGUnwrapFloatOptional(node.getMarginForAxis(YGFlexDirection.Column, availableWidth));
    const innerWidth = YGFloatIsUndefined(availableWidth)
        ? availableWidth
        : YGFloatMax(0, availableWidth - marginAxisRow - paddingAndBorderAxisRow);
    const innerHeight = YGFloatIsUndefined(availableHeight)
        ? availableHeight
        : YGFloatMax(0, availableHeight - marginAxisColumn - paddingAndBorderAxisColumn);
    if (widthMeasureMode == YGMeasureMode.Exactly && heightMeasureMode == YGMeasureMode.Exactly) {
        node.setLayoutMeasuredDimension(YGNodeBoundAxis(node, YGFlexDirection.Row, availableWidth - marginAxisRow, ownerWidth, ownerWidth), YGDimension.Width);
        node.setLayoutMeasuredDimension(YGNodeBoundAxis(node, YGFlexDirection.Column, availableHeight - marginAxisColumn, ownerHeight, ownerWidth), YGDimension.Height);
    }
    else {
        const measuredSize = node.getMeasure()(node, innerWidth, widthMeasureMode, innerHeight, heightMeasureMode);
        node.setLayoutMeasuredDimension(YGNodeBoundAxis(node, YGFlexDirection.Row, widthMeasureMode == YGMeasureMode.Undefined || widthMeasureMode == YGMeasureMode.AtMost
            ? measuredSize.width + paddingAndBorderAxisRow
            : availableWidth - marginAxisRow, ownerWidth, ownerWidth), YGDimension.Width);
        node.setLayoutMeasuredDimension(YGNodeBoundAxis(node, YGFlexDirection.Column, heightMeasureMode == YGMeasureMode.Undefined || heightMeasureMode == YGMeasureMode.AtMost
            ? measuredSize.height + paddingAndBorderAxisColumn
            : availableHeight - marginAxisColumn, ownerHeight, ownerWidth), YGDimension.Height);
    }
}
function YGNodeEmptyContainerSetMeasuredDimensions(node, availableWidth, availableHeight, widthMeasureMode, heightMeasureMode, ownerWidth, ownerHeight) {
    const paddingAndBorderAxisRow = YGNodePaddingAndBorderForAxis(node, YGFlexDirection.Row, ownerWidth);
    const paddingAndBorderAxisColumn = YGNodePaddingAndBorderForAxis(node, YGFlexDirection.Column, ownerWidth);
    const marginAxisRow = YGUnwrapFloatOptional(node.getMarginForAxis(YGFlexDirection.Row, ownerWidth));
    const marginAxisColumn = YGUnwrapFloatOptional(node.getMarginForAxis(YGFlexDirection.Column, ownerWidth));
    node.setLayoutMeasuredDimension(YGNodeBoundAxis(node, YGFlexDirection.Row, widthMeasureMode == YGMeasureMode.Undefined || widthMeasureMode == YGMeasureMode.AtMost
        ? paddingAndBorderAxisRow
        : availableWidth - marginAxisRow, ownerWidth, ownerWidth), YGDimension.Width);
    node.setLayoutMeasuredDimension(YGNodeBoundAxis(node, YGFlexDirection.Column, heightMeasureMode == YGMeasureMode.Undefined || heightMeasureMode == YGMeasureMode.AtMost
        ? paddingAndBorderAxisColumn
        : availableHeight - marginAxisColumn, ownerHeight, ownerWidth), YGDimension.Height);
}
function YGNodeFixedSizeSetMeasuredDimensions(node, availableWidth, availableHeight, widthMeasureMode, heightMeasureMode, ownerWidth, ownerHeight) {
    if ((!YGFloatIsUndefined(availableWidth) &&
        widthMeasureMode == YGMeasureMode.AtMost &&
        availableWidth <= 0) ||
        (!YGFloatIsUndefined(availableHeight) &&
            heightMeasureMode == YGMeasureMode.AtMost &&
            availableHeight <= 0) ||
        (widthMeasureMode == YGMeasureMode.Exactly && heightMeasureMode == YGMeasureMode.Exactly)) {
        const marginAxisColumn = YGUnwrapFloatOptional(node.getMarginForAxis(YGFlexDirection.Column, ownerWidth));
        const marginAxisRow = YGUnwrapFloatOptional(node.getMarginForAxis(YGFlexDirection.Row, ownerWidth));
        node.setLayoutMeasuredDimension(YGNodeBoundAxis(node, YGFlexDirection.Row, YGFloatIsUndefined(availableWidth) ||
            (widthMeasureMode == YGMeasureMode.AtMost && availableWidth < 0)
            ? 0
            : availableWidth - marginAxisRow, ownerWidth, ownerWidth), YGDimension.Width);
        node.setLayoutMeasuredDimension(YGNodeBoundAxis(node, YGFlexDirection.Column, YGFloatIsUndefined(availableHeight) ||
            (heightMeasureMode == YGMeasureMode.AtMost && availableHeight < 0)
            ? 0
            : availableHeight - marginAxisColumn, ownerHeight, ownerWidth), YGDimension.Height);
        return true;
    }
    return false;
}
function YGZeroOutLayoutRecursivly(node) {
    node.getLayout().clean();
    node.setHasNewLayout(true);
    node.cloneChildrenIfNeeded();
    const childCount = YGNodeGetChildCount(node);
    for (let i = 0; i < childCount; i++) {
        const child = node.getChild(i);
        YGZeroOutLayoutRecursivly(child);
    }
}
function YGNodeCalculateAvailableInnerDim(node, axis, availableDim, ownerDim) {
    const direction = YGFlexDirectionIsRow(axis)
        ? YGFlexDirection.Row
        : YGFlexDirection.Column;
    const dimension = YGFlexDirectionIsRow(axis)
        ? YGDimension.Width
        : YGDimension.Height;
    const margin = YGUnwrapFloatOptional(node.getMarginForAxis(direction, ownerDim));
    const paddingAndBorder = YGNodePaddingAndBorderForAxis(node, direction, ownerDim);
    let availableInnerDim = availableDim - margin - paddingAndBorder;
    if (!YGFloatIsUndefined(availableInnerDim)) {
        const minDimensionOptional = YGResolveValue(node.getStyle().minDimensions[dimension], ownerDim);
        const minInnerDim = minDimensionOptional.isUndefined()
            ? 0.0
            : minDimensionOptional.getValue() - paddingAndBorder;
        const maxDimensionOptional = YGResolveValue(node.getStyle().maxDimensions[dimension], ownerDim);
        const maxInnerDim = maxDimensionOptional.isUndefined()
            ? Number.MAX_VALUE
            : maxDimensionOptional.getValue() - paddingAndBorder;
        availableInnerDim = YGFloatMax(YGFloatMin(availableInnerDim, maxInnerDim), minInnerDim);
    }
    return availableInnerDim;
}
function YGNodeComputeFlexBasisForChildren(node, availableInnerWidth, availableInnerHeight, widthMeasureMode, heightMeasureMode, direction, mainAxis, config, performLayout, totalOuterFlexBasisRef) {
    let singleFlexChild = null;
    const children = node.getChildren();
    const measureModeMainDim = YGFlexDirectionIsRow(mainAxis)
        ? widthMeasureMode
        : heightMeasureMode;
    if (measureModeMainDim == YGMeasureMode.Exactly) {
        for (let i = 0; i < children.length; ++i) {
            const child = children[i];
            if (child.isNodeFlexible()) {
                if (singleFlexChild != null ||
                    YGFloatsEqual(child.resolveFlexGrow(), 0.0) ||
                    YGFloatsEqual(child.resolveFlexShrink(), 0.0)) {
                    singleFlexChild = null;
                    break;
                }
                else {
                    singleFlexChild = child;
                }
            }
        }
    }
    for (let i = 0; i < children.length; ++i) {
        const child = children[i];
        child.resolveDimension();
        if (child.getStyle().display == YGDisplay.None) {
            YGZeroOutLayoutRecursivly(child);
            child.setHasNewLayout(true);
            child.setDirty(false);
            continue;
        }
        if (performLayout) {
            const childDirection = child.resolveDirection(direction);
            const mainDim = YGFlexDirectionIsRow(mainAxis)
                ? availableInnerWidth
                : availableInnerHeight;
            const crossDim = YGFlexDirectionIsRow(mainAxis)
                ? availableInnerHeight
                : availableInnerWidth;
            child.setPosition(childDirection, mainDim, crossDim, availableInnerWidth);
        }
        if (child.getStyle().positionType == YGPositionType.Absolute) {
            continue;
        }
        if (child == singleFlexChild) {
            child.setLayoutComputedFlexBasisGeneration(gCurrentGenerationCount);
            child.setLayoutComputedFlexBasis(new YGFloatOptional(0));
        }
        else {
            YGNodeComputeFlexBasisForChild(node, child, availableInnerWidth, widthMeasureMode, availableInnerHeight, availableInnerWidth, availableInnerHeight, heightMeasureMode, direction, config);
        }
        totalOuterFlexBasisRef.value += YGUnwrapFloatOptional(child
            .getLayout()
            .computedFlexBasis.add(child.getMarginForAxis(mainAxis, availableInnerWidth)));
    }
}
function YGCalculateCollectFlexItemsRowValues(node, ownerDirection, mainAxisownerSize, availableInnerWidth, availableInnerMainDim, startOfLineIndex, lineCount) {
    const flexAlgoRowMeasurement = new YGCollectFlexItemsRowValues();
    let sizeConsumedOnCurrentLineIncludingMinConstraint = 0;
    const mainAxis = YGResolveFlexDirection(node.getStyle().flexDirection, node.resolveDirection(ownerDirection));
    const isNodeFlexWrap = node.getStyle().flexWrap != YGWrap.NoWrap;
    let endOfLineIndex = startOfLineIndex;
    for (; endOfLineIndex < node.getChildrenCount(); endOfLineIndex++) {
        const child = node.getChild(endOfLineIndex);
        if (child.getStyle().display == YGDisplay.None ||
            child.getStyle().positionType == YGPositionType.Absolute) {
            continue;
        }
        child.setLineIndex(lineCount);
        const childMarginMainAxis = YGUnwrapFloatOptional(child.getMarginForAxis(mainAxis, availableInnerWidth));
        const flexBasisWithMinAndMaxConstraints = YGUnwrapFloatOptional(YGNodeBoundAxisWithinMinAndMax(child, mainAxis, YGUnwrapFloatOptional(child.getLayout().computedFlexBasis), mainAxisownerSize));
        if (sizeConsumedOnCurrentLineIncludingMinConstraint +
            flexBasisWithMinAndMaxConstraints +
            childMarginMainAxis >
            availableInnerMainDim &&
            isNodeFlexWrap &&
            flexAlgoRowMeasurement.itemsOnLine > 0) {
            break;
        }
        sizeConsumedOnCurrentLineIncludingMinConstraint +=
            flexBasisWithMinAndMaxConstraints + childMarginMainAxis;
        flexAlgoRowMeasurement.sizeConsumedOnCurrentLine +=
            flexBasisWithMinAndMaxConstraints + childMarginMainAxis;
        flexAlgoRowMeasurement.itemsOnLine++;
        if (child.isNodeFlexible()) {
            flexAlgoRowMeasurement.totalFlexGrowFactors += child.resolveFlexGrow();
            flexAlgoRowMeasurement.totalFlexShrinkScaledFactors +=
                -child.resolveFlexShrink() * YGUnwrapFloatOptional(child.getLayout().computedFlexBasis);
        }
        flexAlgoRowMeasurement.relativeChildren.push(child);
    }
    if (flexAlgoRowMeasurement.totalFlexGrowFactors > 0 &&
        flexAlgoRowMeasurement.totalFlexGrowFactors < 1) {
        flexAlgoRowMeasurement.totalFlexGrowFactors = 1;
    }
    if (flexAlgoRowMeasurement.totalFlexShrinkScaledFactors > 0 &&
        flexAlgoRowMeasurement.totalFlexShrinkScaledFactors < 1) {
        flexAlgoRowMeasurement.totalFlexShrinkScaledFactors = 1;
    }
    flexAlgoRowMeasurement.endOfLineIndex = endOfLineIndex;
    return flexAlgoRowMeasurement;
}
function YGDistributeFreeSpaceSecondPass(collectedFlexItemsValues, node, mainAxis, crossAxis, mainAxisownerSize, availableInnerMainDim, availableInnerCrossDim, availableInnerWidth, availableInnerHeight, flexBasisOverflows, measureModeCrossDim, performLayout, config) {
    let childFlexBasis = 0;
    let flexShrinkScaledFactor = 0;
    let flexGrowFactor = 0;
    let deltaFreeSpace = 0;
    const isMainAxisRow = YGFlexDirectionIsRow(mainAxis);
    const isNodeFlexWrap = node.getStyle().flexWrap != YGWrap.NoWrap;
    for (let i = 0; i < collectedFlexItemsValues.relativeChildren.length; ++i) {
        const currentRelativeChild = collectedFlexItemsValues.relativeChildren[i];
        childFlexBasis = YGUnwrapFloatOptional(YGNodeBoundAxisWithinMinAndMax(currentRelativeChild, mainAxis, YGUnwrapFloatOptional(currentRelativeChild.getLayout().computedFlexBasis), mainAxisownerSize));
        let updatedMainSize = childFlexBasis;
        if (!YGFloatIsUndefined(collectedFlexItemsValues.remainingFreeSpace) &&
            collectedFlexItemsValues.remainingFreeSpace < 0) {
            flexShrinkScaledFactor = -currentRelativeChild.resolveFlexShrink() * childFlexBasis;
            if (flexShrinkScaledFactor != 0) {
                let childSize;
                if (!YGFloatIsUndefined(collectedFlexItemsValues.totalFlexShrinkScaledFactors) &&
                    collectedFlexItemsValues.totalFlexShrinkScaledFactors == 0) {
                    childSize = childFlexBasis + flexShrinkScaledFactor;
                }
                else {
                    childSize =
                        childFlexBasis +
                            (collectedFlexItemsValues.remainingFreeSpace /
                                collectedFlexItemsValues.totalFlexShrinkScaledFactors) *
                                flexShrinkScaledFactor;
                }
                updatedMainSize = YGNodeBoundAxis(currentRelativeChild, mainAxis, childSize, availableInnerMainDim, availableInnerWidth);
            }
        }
        else if (!YGFloatIsUndefined(collectedFlexItemsValues.remainingFreeSpace) &&
            collectedFlexItemsValues.remainingFreeSpace > 0) {
            flexGrowFactor = currentRelativeChild.resolveFlexGrow();
            if (!YGFloatIsUndefined(flexGrowFactor) && flexGrowFactor != 0) {
                updatedMainSize = YGNodeBoundAxis(currentRelativeChild, mainAxis, childFlexBasis +
                    (collectedFlexItemsValues.remainingFreeSpace /
                        collectedFlexItemsValues.totalFlexGrowFactors) *
                        flexGrowFactor, availableInnerMainDim, availableInnerWidth);
            }
        }
        deltaFreeSpace += updatedMainSize - childFlexBasis;
        const marginMain = YGUnwrapFloatOptional(currentRelativeChild.getMarginForAxis(mainAxis, availableInnerWidth));
        const marginCross = YGUnwrapFloatOptional(currentRelativeChild.getMarginForAxis(crossAxis, availableInnerWidth));
        let childCrossSize;
        let childMainSize = updatedMainSize + marginMain;
        let childCrossMeasureMode;
        let childMainMeasureMode = YGMeasureMode.Exactly;
        if (!currentRelativeChild.getStyle().aspectRatio.isUndefined()) {
            childCrossSize = isMainAxisRow
                ? (childMainSize - marginMain) / currentRelativeChild.getStyle().aspectRatio.getValue()
                : (childMainSize - marginMain) * currentRelativeChild.getStyle().aspectRatio.getValue();
            childCrossMeasureMode = YGMeasureMode.Exactly;
            childCrossSize += marginCross;
        }
        else if (!YGFloatIsUndefined(availableInnerCrossDim) &&
            !YGNodeIsStyleDimDefined(currentRelativeChild, crossAxis, availableInnerCrossDim) &&
            measureModeCrossDim == YGMeasureMode.Exactly &&
            !(isNodeFlexWrap && flexBasisOverflows) &&
            YGNodeAlignItem(node, currentRelativeChild) == YGAlign.Stretch &&
            currentRelativeChild.marginLeadingValue(crossAxis).unit != YGUnit.Auto &&
            currentRelativeChild.marginTrailingValue(crossAxis).unit != YGUnit.Auto) {
            childCrossSize = availableInnerCrossDim;
            childCrossMeasureMode = YGMeasureMode.Exactly;
        }
        else if (!YGNodeIsStyleDimDefined(currentRelativeChild, crossAxis, availableInnerCrossDim)) {
            childCrossSize = availableInnerCrossDim;
            childCrossMeasureMode = YGFloatIsUndefined(childCrossSize)
                ? YGMeasureMode.Undefined
                : YGMeasureMode.AtMost;
        }
        else {
            childCrossSize =
                YGUnwrapFloatOptional(YGResolveValue(currentRelativeChild.getResolvedDimension(dim[crossAxis]), availableInnerCrossDim)) + marginCross;
            const isLoosePercentageMeasurement = currentRelativeChild.getResolvedDimension(dim[crossAxis]).unit == YGUnit.Percent &&
                measureModeCrossDim != YGMeasureMode.Exactly;
            childCrossMeasureMode =
                YGFloatIsUndefined(childCrossSize) || isLoosePercentageMeasurement
                    ? YGMeasureMode.Undefined
                    : YGMeasureMode.Exactly;
        }
        const childMainMeasureModeRef = { value: childMainMeasureMode };
        const childMainSizeRef = { value: childMainSize };
        const childCrossMeasureModeRef = { value: childCrossMeasureMode };
        const childCrossSizeRef = { value: childCrossSize };
        YGConstrainMaxSizeForMode(currentRelativeChild, mainAxis, availableInnerMainDim, availableInnerWidth, childMainMeasureModeRef, childMainSizeRef);
        YGConstrainMaxSizeForMode(currentRelativeChild, crossAxis, availableInnerCrossDim, availableInnerWidth, childCrossMeasureModeRef, childCrossSizeRef);
        childMainMeasureMode = childMainMeasureModeRef.value;
        childMainSize = childMainSizeRef.value;
        childCrossMeasureMode = childCrossMeasureModeRef.value;
        childCrossSize = childCrossSizeRef.value;
        const requiresStretchLayout = !YGNodeIsStyleDimDefined(currentRelativeChild, crossAxis, availableInnerCrossDim) &&
            YGNodeAlignItem(node, currentRelativeChild) == YGAlign.Stretch &&
            currentRelativeChild.marginLeadingValue(crossAxis).unit != YGUnit.Auto &&
            currentRelativeChild.marginTrailingValue(crossAxis).unit != YGUnit.Auto;
        const childWidth = isMainAxisRow ? childMainSize : childCrossSize;
        const childHeight = !isMainAxisRow ? childMainSize : childCrossSize;
        const childWidthMeasureMode = isMainAxisRow
            ? childMainMeasureMode
            : childCrossMeasureMode;
        const childHeightMeasureMode = !isMainAxisRow
            ? childMainMeasureMode
            : childCrossMeasureMode;
        YGLayoutNodeInternal(currentRelativeChild, childWidth, childHeight, node.getLayout().direction, childWidthMeasureMode, childHeightMeasureMode, availableInnerWidth, availableInnerHeight, performLayout && !requiresStretchLayout, 'flex', config);
        node.setLayoutHadOverflow(node.getLayout().hadOverflow || currentRelativeChild.getLayout().hadOverflow);
    }
    return deltaFreeSpace;
}
function YGDistributeFreeSpaceFirstPass(collectedFlexItemsValues, mainAxis, mainAxisownerSize, availableInnerMainDim, availableInnerWidth) {
    let flexShrinkScaledFactor = 0;
    let flexGrowFactor = 0;
    let baseMainSize = 0;
    let boundMainSize = 0;
    let deltaFreeSpace = 0;
    for (let i = 0; i < collectedFlexItemsValues.relativeChildren.length; ++i) {
        const currentRelativeChild = collectedFlexItemsValues.relativeChildren[i];
        const childFlexBasis = YGUnwrapFloatOptional(YGNodeBoundAxisWithinMinAndMax(currentRelativeChild, mainAxis, YGUnwrapFloatOptional(currentRelativeChild.getLayout().computedFlexBasis), mainAxisownerSize));
        if (collectedFlexItemsValues.remainingFreeSpace < 0) {
            flexShrinkScaledFactor = -currentRelativeChild.resolveFlexShrink() * childFlexBasis;
            if (!YGFloatIsUndefined(flexShrinkScaledFactor) && flexShrinkScaledFactor != 0) {
                baseMainSize =
                    childFlexBasis +
                        (collectedFlexItemsValues.remainingFreeSpace /
                            collectedFlexItemsValues.totalFlexShrinkScaledFactors) *
                            flexShrinkScaledFactor;
                boundMainSize = YGNodeBoundAxis(currentRelativeChild, mainAxis, baseMainSize, availableInnerMainDim, availableInnerWidth);
                if (!YGFloatIsUndefined(baseMainSize) &&
                    !YGFloatIsUndefined(boundMainSize) &&
                    baseMainSize != boundMainSize) {
                    deltaFreeSpace += boundMainSize - childFlexBasis;
                    collectedFlexItemsValues.totalFlexShrinkScaledFactors -= flexShrinkScaledFactor;
                }
            }
        }
        else if (!YGFloatIsUndefined(collectedFlexItemsValues.remainingFreeSpace) &&
            collectedFlexItemsValues.remainingFreeSpace > 0) {
            flexGrowFactor = currentRelativeChild.resolveFlexGrow();
            if (!YGFloatIsUndefined(flexGrowFactor) && flexGrowFactor != 0) {
                baseMainSize =
                    childFlexBasis +
                        (collectedFlexItemsValues.remainingFreeSpace /
                            collectedFlexItemsValues.totalFlexGrowFactors) *
                            flexGrowFactor;
                boundMainSize = YGNodeBoundAxis(currentRelativeChild, mainAxis, baseMainSize, availableInnerMainDim, availableInnerWidth);
                if (!YGFloatIsUndefined(baseMainSize) &&
                    !YGFloatIsUndefined(boundMainSize) &&
                    baseMainSize != boundMainSize) {
                    deltaFreeSpace += boundMainSize - childFlexBasis;
                    collectedFlexItemsValues.totalFlexGrowFactors -= flexGrowFactor;
                }
            }
        }
    }
    collectedFlexItemsValues.remainingFreeSpace -= deltaFreeSpace;
}
function YGResolveFlexibleLength(node, collectedFlexItemsValues, mainAxis, crossAxis, mainAxisownerSize, availableInnerMainDim, availableInnerCrossDim, availableInnerWidth, availableInnerHeight, flexBasisOverflows, measureModeCrossDim, performLayout, config) {
    const originalFreeSpace = collectedFlexItemsValues.remainingFreeSpace;
    YGDistributeFreeSpaceFirstPass(collectedFlexItemsValues, mainAxis, mainAxisownerSize, availableInnerMainDim, availableInnerWidth);
    const distributedFreeSpace = YGDistributeFreeSpaceSecondPass(collectedFlexItemsValues, node, mainAxis, crossAxis, mainAxisownerSize, availableInnerMainDim, availableInnerCrossDim, availableInnerWidth, availableInnerHeight, flexBasisOverflows, measureModeCrossDim, performLayout, config);
    collectedFlexItemsValues.remainingFreeSpace = originalFreeSpace - distributedFreeSpace;
}
function YGJustifyMainAxis(node, collectedFlexItemsValues, startOfLineIndex, mainAxis, crossAxis, measureModeMainDim, measureModeCrossDim, mainAxisownerSize, ownerWidth, availableInnerMainDim, availableInnerCrossDim, availableInnerWidth, performLayout) {
    const style = node.getStyle();
    if (measureModeMainDim == YGMeasureMode.AtMost &&
        collectedFlexItemsValues.remainingFreeSpace > 0) {
        if (style.minDimensions[dim[mainAxis]].unit != YGUnit.Undefined &&
            !YGResolveValue(style.minDimensions[dim[mainAxis]], mainAxisownerSize).isUndefined()) {
            collectedFlexItemsValues.remainingFreeSpace = YGFloatMax(0, YGUnwrapFloatOptional(YGResolveValue(style.minDimensions[dim[mainAxis]], mainAxisownerSize)) -
                (availableInnerMainDim - collectedFlexItemsValues.remainingFreeSpace));
        }
        else {
            collectedFlexItemsValues.remainingFreeSpace = 0;
        }
    }
    let numberOfAutoMarginsOnCurrentLine = 0;
    for (let i = startOfLineIndex; i < collectedFlexItemsValues.endOfLineIndex; i++) {
        const child = node.getChild(i);
        if (child.getStyle().positionType == YGPositionType.Relative) {
            if (child.marginLeadingValue(mainAxis).unit == YGUnit.Auto) {
                numberOfAutoMarginsOnCurrentLine++;
            }
            if (child.marginTrailingValue(mainAxis).unit == YGUnit.Auto) {
                numberOfAutoMarginsOnCurrentLine++;
            }
        }
    }
    let leadingMainDim = 0;
    let betweenMainDim = 0;
    const justifyContent = node.getStyle().justifyContent;
    if (numberOfAutoMarginsOnCurrentLine == 0) {
        switch (justifyContent) {
            case YGJustify.Center:
                leadingMainDim = collectedFlexItemsValues.remainingFreeSpace / 2;
                break;
            case YGJustify.FlexEnd:
                leadingMainDim = collectedFlexItemsValues.remainingFreeSpace;
                break;
            case YGJustify.SpaceBetween:
                if (collectedFlexItemsValues.itemsOnLine > 1) {
                    betweenMainDim =
                        YGFloatMax(collectedFlexItemsValues.remainingFreeSpace, 0) /
                            (collectedFlexItemsValues.itemsOnLine - 1);
                }
                else {
                    betweenMainDim = 0;
                }
                break;
            case YGJustify.SpaceEvenly:
                betweenMainDim =
                    collectedFlexItemsValues.remainingFreeSpace / (collectedFlexItemsValues.itemsOnLine + 1);
                leadingMainDim = betweenMainDim;
                break;
            case YGJustify.SpaceAround:
                betweenMainDim =
                    collectedFlexItemsValues.remainingFreeSpace / collectedFlexItemsValues.itemsOnLine;
                leadingMainDim = betweenMainDim / 2;
                break;
            case YGJustify.FlexStart:
                break;
        }
    }
    const leadingPaddingAndBorderMain = YGUnwrapFloatOptional(node.getLeadingPaddingAndBorder(mainAxis, ownerWidth));
    collectedFlexItemsValues.mainDim = leadingPaddingAndBorderMain + leadingMainDim;
    collectedFlexItemsValues.crossDim = 0;
    for (let i = startOfLineIndex; i < collectedFlexItemsValues.endOfLineIndex; i++) {
        const child = node.getChild(i);
        const childStyle = child.getStyle();
        const childLayout = child.getLayout();
        if (childStyle.display == YGDisplay.None) {
            continue;
        }
        if (childStyle.positionType == YGPositionType.Absolute &&
            child.isLeadingPositionDefined(mainAxis)) {
            if (performLayout) {
                child.setLayoutPosition(YGUnwrapFloatOptional(child.getLeadingPosition(mainAxis, availableInnerMainDim)) +
                    node.getLeadingBorder(mainAxis) +
                    YGUnwrapFloatOptional(child.getLeadingMargin(mainAxis, availableInnerWidth)), pos[mainAxis]);
            }
        }
        else {
            if (childStyle.positionType == YGPositionType.Relative) {
                if (child.marginLeadingValue(mainAxis).unit == YGUnit.Auto) {
                    collectedFlexItemsValues.mainDim +=
                        collectedFlexItemsValues.remainingFreeSpace / numberOfAutoMarginsOnCurrentLine;
                }
                if (performLayout) {
                    child.setLayoutPosition(childLayout.position[pos[mainAxis]] + collectedFlexItemsValues.mainDim, pos[mainAxis]);
                }
                if (child.marginTrailingValue(mainAxis).unit == YGUnit.Auto) {
                    collectedFlexItemsValues.mainDim +=
                        collectedFlexItemsValues.remainingFreeSpace / numberOfAutoMarginsOnCurrentLine;
                }
                const canSkipFlex = !performLayout && measureModeCrossDim == YGMeasureMode.Exactly;
                if (canSkipFlex) {
                    collectedFlexItemsValues.mainDim +=
                        betweenMainDim +
                            YGUnwrapFloatOptional(child.getMarginForAxis(mainAxis, availableInnerWidth)) +
                            YGUnwrapFloatOptional(childLayout.computedFlexBasis);
                    collectedFlexItemsValues.crossDim = availableInnerCrossDim;
                }
                else {
                    collectedFlexItemsValues.mainDim +=
                        betweenMainDim + YGNodeDimWithMargin(child, mainAxis, availableInnerWidth);
                    collectedFlexItemsValues.crossDim = YGFloatMax(collectedFlexItemsValues.crossDim, YGNodeDimWithMargin(child, crossAxis, availableInnerWidth));
                }
            }
            else if (performLayout) {
                child.setLayoutPosition(childLayout.position[pos[mainAxis]] +
                    node.getLeadingBorder(mainAxis) +
                    leadingMainDim, pos[mainAxis]);
            }
        }
    }
    collectedFlexItemsValues.mainDim += YGUnwrapFloatOptional(node.getTrailingPaddingAndBorder(mainAxis, ownerWidth));
}
function YGNodelayoutImpl(node, availableWidth, availableHeight, ownerDirection, widthMeasureMode, heightMeasureMode, ownerWidth, ownerHeight, performLayout, config) {
    YGAssertWithNode(node, YGFloatIsUndefined(availableWidth) ? widthMeasureMode == YGMeasureMode.Undefined : true, 'availableWidth is indefinite so widthMeasureMode must be YGMeasureMode.Undefined');
    YGAssertWithNode(node, YGFloatIsUndefined(availableHeight) ? heightMeasureMode == YGMeasureMode.Undefined : true, 'availableHeight is indefinite so heightMeasureMode must be YGMeasureMode.Undefined');
    const direction = node.resolveDirection(ownerDirection);
    node.setLayoutDirection(direction);
    const flexRowDirection = YGResolveFlexDirection(YGFlexDirection.Row, direction);
    const flexColumnDirection = YGResolveFlexDirection(YGFlexDirection.Column, direction);
    node.setLayoutMargin(YGUnwrapFloatOptional(node.getLeadingMargin(flexRowDirection, ownerWidth)), YGEdge.Start);
    node.setLayoutMargin(YGUnwrapFloatOptional(node.getTrailingMargin(flexRowDirection, ownerWidth)), YGEdge.End);
    node.setLayoutMargin(YGUnwrapFloatOptional(node.getLeadingMargin(flexColumnDirection, ownerWidth)), YGEdge.Top);
    node.setLayoutMargin(YGUnwrapFloatOptional(node.getTrailingMargin(flexColumnDirection, ownerWidth)), YGEdge.Bottom);
    node.setLayoutBorder(node.getLeadingBorder(flexRowDirection), YGEdge.Start);
    node.setLayoutBorder(node.getTrailingBorder(flexRowDirection), YGEdge.End);
    node.setLayoutBorder(node.getLeadingBorder(flexColumnDirection), YGEdge.Top);
    node.setLayoutBorder(node.getTrailingBorder(flexColumnDirection), YGEdge.Bottom);
    node.setLayoutPadding(YGUnwrapFloatOptional(node.getLeadingPadding(flexRowDirection, ownerWidth)), YGEdge.Start);
    node.setLayoutPadding(YGUnwrapFloatOptional(node.getTrailingPadding(flexRowDirection, ownerWidth)), YGEdge.End);
    node.setLayoutPadding(YGUnwrapFloatOptional(node.getLeadingPadding(flexColumnDirection, ownerWidth)), YGEdge.Top);
    node.setLayoutPadding(YGUnwrapFloatOptional(node.getTrailingPadding(flexColumnDirection, ownerWidth)), YGEdge.Bottom);
    if (node.getMeasure() != null) {
        YGNodeWithMeasureFuncSetMeasuredDimensions(node, availableWidth, availableHeight, widthMeasureMode, heightMeasureMode, ownerWidth, ownerHeight);
        return;
    }
    const childCount = YGNodeGetChildCount(node);
    if (childCount == 0) {
        YGNodeEmptyContainerSetMeasuredDimensions(node, availableWidth, availableHeight, widthMeasureMode, heightMeasureMode, ownerWidth, ownerHeight);
        return;
    }
    if (!performLayout &&
        YGNodeFixedSizeSetMeasuredDimensions(node, availableWidth, availableHeight, widthMeasureMode, heightMeasureMode, ownerWidth, ownerHeight)) {
        return;
    }
    node.cloneChildrenIfNeeded();
    node.setLayoutHadOverflow(false);
    const mainAxis = YGResolveFlexDirection(node.getStyle().flexDirection, direction);
    const crossAxis = YGFlexDirectionCross(mainAxis, direction);
    const isMainAxisRow = YGFlexDirectionIsRow(mainAxis);
    const isNodeFlexWrap = node.getStyle().flexWrap != YGWrap.NoWrap;
    const mainAxisownerSize = isMainAxisRow ? ownerWidth : ownerHeight;
    const crossAxisownerSize = isMainAxisRow ? ownerHeight : ownerWidth;
    const leadingPaddingAndBorderCross = YGUnwrapFloatOptional(node.getLeadingPaddingAndBorder(crossAxis, ownerWidth));
    const paddingAndBorderAxisMain = YGNodePaddingAndBorderForAxis(node, mainAxis, ownerWidth);
    const paddingAndBorderAxisCross = YGNodePaddingAndBorderForAxis(node, crossAxis, ownerWidth);
    let measureModeMainDim = isMainAxisRow ? widthMeasureMode : heightMeasureMode;
    const measureModeCrossDim = isMainAxisRow ? heightMeasureMode : widthMeasureMode;
    const paddingAndBorderAxisRow = isMainAxisRow
        ? paddingAndBorderAxisMain
        : paddingAndBorderAxisCross;
    const paddingAndBorderAxisColumn = isMainAxisRow
        ? paddingAndBorderAxisCross
        : paddingAndBorderAxisMain;
    const marginAxisRow = YGUnwrapFloatOptional(node.getMarginForAxis(YGFlexDirection.Row, ownerWidth));
    const marginAxisColumn = YGUnwrapFloatOptional(node.getMarginForAxis(YGFlexDirection.Column, ownerWidth));
    const minInnerWidth = YGUnwrapFloatOptional(YGResolveValue(node.getStyle().minDimensions[YGDimension.Width], ownerWidth)) - paddingAndBorderAxisRow;
    const maxInnerWidth = YGUnwrapFloatOptional(YGResolveValue(node.getStyle().maxDimensions[YGDimension.Width], ownerWidth)) - paddingAndBorderAxisRow;
    const minInnerHeight = YGUnwrapFloatOptional(YGResolveValue(node.getStyle().minDimensions[YGDimension.Height], ownerHeight)) - paddingAndBorderAxisColumn;
    const maxInnerHeight = YGUnwrapFloatOptional(YGResolveValue(node.getStyle().maxDimensions[YGDimension.Height], ownerHeight)) - paddingAndBorderAxisColumn;
    const minInnerMainDim = isMainAxisRow ? minInnerWidth : minInnerHeight;
    const maxInnerMainDim = isMainAxisRow ? maxInnerWidth : maxInnerHeight;
    const availableInnerWidth = YGNodeCalculateAvailableInnerDim(node, YGFlexDirection.Row, availableWidth, ownerWidth);
    const availableInnerHeight = YGNodeCalculateAvailableInnerDim(node, YGFlexDirection.Column, availableHeight, ownerHeight);
    let availableInnerMainDim = isMainAxisRow ? availableInnerWidth : availableInnerHeight;
    const availableInnerCrossDim = isMainAxisRow ? availableInnerHeight : availableInnerWidth;
    const totalOuterFlexBasis = { value: 0 };
    YGNodeComputeFlexBasisForChildren(node, availableInnerWidth, availableInnerHeight, widthMeasureMode, heightMeasureMode, direction, mainAxis, config, performLayout, totalOuterFlexBasis);
    const flexBasisOverflows = measureModeMainDim == YGMeasureMode.Undefined
        ? false
        : totalOuterFlexBasis.value > availableInnerMainDim;
    if (isNodeFlexWrap && flexBasisOverflows && measureModeMainDim == YGMeasureMode.AtMost) {
        measureModeMainDim = YGMeasureMode.Exactly;
    }
    let startOfLineIndex = 0;
    let endOfLineIndex = 0;
    let lineCount = 0;
    let totalLineCrossDim = 0;
    let maxLineMainDim = 0;
    let collectedFlexItemsValues;
    for (; endOfLineIndex < childCount; lineCount++, startOfLineIndex = endOfLineIndex) {
        collectedFlexItemsValues = YGCalculateCollectFlexItemsRowValues(node, ownerDirection, mainAxisownerSize, availableInnerWidth, availableInnerMainDim, startOfLineIndex, lineCount);
        endOfLineIndex = collectedFlexItemsValues.endOfLineIndex;
        const canSkipFlex = !performLayout && measureModeCrossDim == YGMeasureMode.Exactly;
        let sizeBasedOnContent = false;
        if (measureModeMainDim != YGMeasureMode.Exactly) {
            if (!YGFloatIsUndefined(minInnerMainDim) &&
                collectedFlexItemsValues.sizeConsumedOnCurrentLine < minInnerMainDim) {
                availableInnerMainDim = minInnerMainDim;
            }
            else if (!YGFloatIsUndefined(maxInnerMainDim) &&
                collectedFlexItemsValues.sizeConsumedOnCurrentLine > maxInnerMainDim) {
                availableInnerMainDim = maxInnerMainDim;
            }
            else {
                if (!node.getConfig().useLegacyStretchBehaviour &&
                    ((YGFloatIsUndefined(collectedFlexItemsValues.totalFlexGrowFactors) &&
                        collectedFlexItemsValues.totalFlexGrowFactors == 0) ||
                        (YGFloatIsUndefined(node.resolveFlexGrow()) && node.resolveFlexGrow() == 0))) {
                    availableInnerMainDim = collectedFlexItemsValues.sizeConsumedOnCurrentLine;
                }
                if (node.getConfig().useLegacyStretchBehaviour) {
                    node.setLayoutDidUseLegacyFlag(true);
                }
                sizeBasedOnContent = !node.getConfig().useLegacyStretchBehaviour;
            }
        }
        if (!sizeBasedOnContent && !YGFloatIsUndefined(availableInnerMainDim)) {
            collectedFlexItemsValues.remainingFreeSpace =
                availableInnerMainDim - collectedFlexItemsValues.sizeConsumedOnCurrentLine;
        }
        else if (collectedFlexItemsValues.sizeConsumedOnCurrentLine < 0) {
            collectedFlexItemsValues.remainingFreeSpace =
                -collectedFlexItemsValues.sizeConsumedOnCurrentLine;
        }
        if (!canSkipFlex) {
            YGResolveFlexibleLength(node, collectedFlexItemsValues, mainAxis, crossAxis, mainAxisownerSize, availableInnerMainDim, availableInnerCrossDim, availableInnerWidth, availableInnerHeight, flexBasisOverflows, measureModeCrossDim, performLayout, config);
        }
        node.setLayoutHadOverflow(node.getLayout().hadOverflow || collectedFlexItemsValues.remainingFreeSpace < 0);
        YGJustifyMainAxis(node, collectedFlexItemsValues, startOfLineIndex, mainAxis, crossAxis, measureModeMainDim, measureModeCrossDim, mainAxisownerSize, ownerWidth, availableInnerMainDim, availableInnerCrossDim, availableInnerWidth, performLayout);
        let containerCrossAxis = availableInnerCrossDim;
        if (measureModeCrossDim == YGMeasureMode.Undefined ||
            measureModeCrossDim == YGMeasureMode.AtMost) {
            containerCrossAxis =
                YGNodeBoundAxis(node, crossAxis, collectedFlexItemsValues.crossDim + paddingAndBorderAxisCross, crossAxisownerSize, ownerWidth) - paddingAndBorderAxisCross;
        }
        if (!isNodeFlexWrap && measureModeCrossDim == YGMeasureMode.Exactly) {
            collectedFlexItemsValues.crossDim = availableInnerCrossDim;
        }
        collectedFlexItemsValues.crossDim =
            YGNodeBoundAxis(node, crossAxis, collectedFlexItemsValues.crossDim + paddingAndBorderAxisCross, crossAxisownerSize, ownerWidth) - paddingAndBorderAxisCross;
        if (performLayout) {
            for (let i = startOfLineIndex; i < endOfLineIndex; i++) {
                const child = node.getChild(i);
                if (child.getStyle().display == YGDisplay.None) {
                    continue;
                }
                if (child.getStyle().positionType == YGPositionType.Absolute) {
                    const isChildLeadingPosDefined = child.isLeadingPositionDefined(crossAxis);
                    if (isChildLeadingPosDefined) {
                        child.setLayoutPosition(YGUnwrapFloatOptional(child.getLeadingPosition(crossAxis, availableInnerCrossDim)) +
                            node.getLeadingBorder(crossAxis) +
                            YGUnwrapFloatOptional(child.getLeadingMargin(crossAxis, availableInnerWidth)), pos[crossAxis]);
                    }
                    if (!isChildLeadingPosDefined ||
                        YGFloatIsUndefined(child.getLayout().position[pos[crossAxis]])) {
                        child.setLayoutPosition(node.getLeadingBorder(crossAxis) +
                            YGUnwrapFloatOptional(child.getLeadingMargin(crossAxis, availableInnerWidth)), pos[crossAxis]);
                    }
                }
                else {
                    let leadingCrossDim = leadingPaddingAndBorderCross;
                    const alignItem = YGNodeAlignItem(node, child);
                    if (alignItem == YGAlign.Stretch &&
                        child.marginLeadingValue(crossAxis).unit != YGUnit.Auto &&
                        child.marginTrailingValue(crossAxis).unit != YGUnit.Auto) {
                        if (!YGNodeIsStyleDimDefined(child, crossAxis, availableInnerCrossDim)) {
                            let childMainSize = child.getLayout().measuredDimensions[dim[mainAxis]];
                            let childCrossSize = !child.getStyle().aspectRatio.isUndefined()
                                ? YGUnwrapFloatOptional(child.getMarginForAxis(crossAxis, availableInnerWidth)) +
                                    (isMainAxisRow
                                        ? childMainSize / child.getStyle().aspectRatio.getValue()
                                        : childMainSize * child.getStyle().aspectRatio.getValue())
                                : collectedFlexItemsValues.crossDim;
                            childMainSize += YGUnwrapFloatOptional(child.getMarginForAxis(mainAxis, availableInnerWidth));
                            let childMainMeasureMode = YGMeasureMode.Exactly;
                            let childCrossMeasureMode = YGMeasureMode.Exactly;
                            const childMainMeasureModeRef = { value: childMainMeasureMode };
                            const childMainSizeRef = { value: childMainSize };
                            const childCrossMeasureModeRef = { value: childCrossMeasureMode };
                            const childCrossSizeRef = { value: childCrossSize };
                            YGConstrainMaxSizeForMode(child, mainAxis, availableInnerMainDim, availableInnerWidth, childMainMeasureModeRef, childMainSizeRef);
                            YGConstrainMaxSizeForMode(child, crossAxis, availableInnerCrossDim, availableInnerWidth, childCrossMeasureModeRef, childCrossSizeRef);
                            childMainMeasureMode = childMainMeasureModeRef.value;
                            childMainSize = childMainSizeRef.value;
                            childCrossMeasureMode = childCrossMeasureModeRef.value;
                            childCrossSize = childCrossSizeRef.value;
                            const childWidth = isMainAxisRow ? childMainSize : childCrossSize;
                            const childHeight = !isMainAxisRow ? childMainSize : childCrossSize;
                            const childWidthMeasureMode = YGFloatIsUndefined(childWidth)
                                ? YGMeasureMode.Undefined
                                : YGMeasureMode.Exactly;
                            const childHeightMeasureMode = YGFloatIsUndefined(childHeight)
                                ? YGMeasureMode.Undefined
                                : YGMeasureMode.Exactly;
                            YGLayoutNodeInternal(child, childWidth, childHeight, direction, childWidthMeasureMode, childHeightMeasureMode, availableInnerWidth, availableInnerHeight, true, 'stretch', config);
                        }
                    }
                    else {
                        const remainingCrossDim = containerCrossAxis - YGNodeDimWithMargin(child, crossAxis, availableInnerWidth);
                        if (child.marginLeadingValue(crossAxis).unit == YGUnit.Auto &&
                            child.marginTrailingValue(crossAxis).unit == YGUnit.Auto) {
                            leadingCrossDim += YGFloatMax(0.0, remainingCrossDim / 2);
                        }
                        else if (child.marginTrailingValue(crossAxis).unit == YGUnit.Auto) ;
                        else if (child.marginLeadingValue(crossAxis).unit == YGUnit.Auto) {
                            leadingCrossDim += YGFloatMax(0.0, remainingCrossDim);
                        }
                        else if (alignItem == YGAlign.FlexStart) ;
                        else if (alignItem == YGAlign.Center) {
                            leadingCrossDim += remainingCrossDim / 2;
                        }
                        else {
                            leadingCrossDim += remainingCrossDim;
                        }
                    }
                    child.setLayoutPosition(child.getLayout().position[pos[crossAxis]] +
                        totalLineCrossDim +
                        leadingCrossDim, pos[crossAxis]);
                }
            }
        }
        totalLineCrossDim += collectedFlexItemsValues.crossDim;
        maxLineMainDim = YGFloatMax(maxLineMainDim, collectedFlexItemsValues.mainDim);
    }
    if (performLayout &&
        (lineCount > 1 || YGIsBaselineLayout(node)) &&
        !YGFloatIsUndefined(availableInnerCrossDim)) {
        const remainingAlignContentDim = availableInnerCrossDim - totalLineCrossDim;
        let crossDimLead = 0;
        let currentLead = leadingPaddingAndBorderCross;
        switch (node.getStyle().alignContent) {
            case YGAlign.FlexEnd:
                currentLead += remainingAlignContentDim;
                break;
            case YGAlign.Center:
                currentLead += remainingAlignContentDim / 2;
                break;
            case YGAlign.Stretch:
                if (availableInnerCrossDim > totalLineCrossDim) {
                    crossDimLead = remainingAlignContentDim / lineCount;
                }
                break;
            case YGAlign.SpaceAround:
                if (availableInnerCrossDim > totalLineCrossDim) {
                    currentLead += remainingAlignContentDim / (2 * lineCount);
                    if (lineCount > 1) {
                        crossDimLead = remainingAlignContentDim / lineCount;
                    }
                }
                else {
                    currentLead += remainingAlignContentDim / 2;
                }
                break;
            case YGAlign.SpaceBetween:
                if (availableInnerCrossDim > totalLineCrossDim && lineCount > 1) {
                    crossDimLead = remainingAlignContentDim / (lineCount - 1);
                }
                break;
            case YGAlign.Auto:
            case YGAlign.FlexStart:
            case YGAlign.Baseline:
                break;
        }
        let endIndex = 0;
        for (let i = 0; i < lineCount; i++) {
            const startIndex = endIndex;
            let ii;
            let lineHeight = 0;
            let maxAscentForCurrentLine = 0;
            let maxDescentForCurrentLine = 0;
            for (ii = startIndex; ii < childCount; ii++) {
                const child = node.getChild(ii);
                if (child.getStyle().display == YGDisplay.None) {
                    continue;
                }
                if (child.getStyle().positionType == YGPositionType.Relative) {
                    if (child.getLineIndex() != i) {
                        break;
                    }
                    if (YGNodeIsLayoutDimDefined(child, crossAxis)) {
                        lineHeight = YGFloatMax(lineHeight, child.getLayout().measuredDimensions[dim[crossAxis]] +
                            YGUnwrapFloatOptional(child.getMarginForAxis(crossAxis, availableInnerWidth)));
                    }
                    if (YGNodeAlignItem(node, child) == YGAlign.Baseline) {
                        const ascent = YGBaseline(child) +
                            YGUnwrapFloatOptional(child.getLeadingMargin(YGFlexDirection.Column, availableInnerWidth));
                        const descent = child.getLayout().measuredDimensions[YGDimension.Height] +
                            YGUnwrapFloatOptional(child.getMarginForAxis(YGFlexDirection.Column, availableInnerWidth)) -
                            ascent;
                        maxAscentForCurrentLine = YGFloatMax(maxAscentForCurrentLine, ascent);
                        maxDescentForCurrentLine = YGFloatMax(maxDescentForCurrentLine, descent);
                        lineHeight = YGFloatMax(lineHeight, maxAscentForCurrentLine + maxDescentForCurrentLine);
                    }
                }
            }
            endIndex = ii;
            lineHeight += crossDimLead;
            if (performLayout) {
                for (ii = startIndex; ii < endIndex; ii++) {
                    const child = node.getChild(ii);
                    if (child.getStyle().display == YGDisplay.None) {
                        continue;
                    }
                    if (child.getStyle().positionType == YGPositionType.Relative) {
                        switch (YGNodeAlignItem(node, child)) {
                            case YGAlign.FlexStart: {
                                child.setLayoutPosition(currentLead +
                                    YGUnwrapFloatOptional(child.getLeadingMargin(crossAxis, availableInnerWidth)), pos[crossAxis]);
                                break;
                            }
                            case YGAlign.FlexEnd: {
                                child.setLayoutPosition(currentLead +
                                    lineHeight -
                                    YGUnwrapFloatOptional(child.getTrailingMargin(crossAxis, availableInnerWidth)) -
                                    child.getLayout().measuredDimensions[dim[crossAxis]], pos[crossAxis]);
                                break;
                            }
                            case YGAlign.Center: {
                                const childHeight = child.getLayout().measuredDimensions[dim[crossAxis]];
                                child.setLayoutPosition(currentLead + (lineHeight - childHeight) / 2, pos[crossAxis]);
                                break;
                            }
                            case YGAlign.Stretch: {
                                child.setLayoutPosition(currentLead +
                                    YGUnwrapFloatOptional(child.getLeadingMargin(crossAxis, availableInnerWidth)), pos[crossAxis]);
                                if (!YGNodeIsStyleDimDefined(child, crossAxis, availableInnerCrossDim)) {
                                    const childWidth = isMainAxisRow
                                        ? child.getLayout().measuredDimensions[YGDimension.Width] +
                                            YGUnwrapFloatOptional(child.getMarginForAxis(mainAxis, availableInnerWidth))
                                        : lineHeight;
                                    const childHeight = !isMainAxisRow
                                        ? child.getLayout().measuredDimensions[YGDimension.Height] +
                                            YGUnwrapFloatOptional(child.getMarginForAxis(crossAxis, availableInnerWidth))
                                        : lineHeight;
                                    if (!(YGFloatsEqual(childWidth, child.getLayout().measuredDimensions[YGDimension.Width]) &&
                                        YGFloatsEqual(childHeight, child.getLayout().measuredDimensions[YGDimension.Height]))) {
                                        YGLayoutNodeInternal(child, childWidth, childHeight, direction, YGMeasureMode.Exactly, YGMeasureMode.Exactly, availableInnerWidth, availableInnerHeight, true, 'multiline-stretch', config);
                                    }
                                }
                                break;
                            }
                            case YGAlign.Baseline: {
                                child.setLayoutPosition(currentLead +
                                    maxAscentForCurrentLine -
                                    YGBaseline(child) +
                                    YGUnwrapFloatOptional(child.getLeadingPosition(YGFlexDirection.Column, availableInnerCrossDim)), YGEdge.Top);
                                break;
                            }
                            case YGAlign.Auto:
                            case YGAlign.SpaceBetween:
                            case YGAlign.SpaceAround:
                                break;
                        }
                    }
                }
            }
            currentLead += lineHeight;
        }
    }
    node.setLayoutMeasuredDimension(YGNodeBoundAxis(node, YGFlexDirection.Row, availableWidth - marginAxisRow, ownerWidth, ownerWidth), YGDimension.Width);
    node.setLayoutMeasuredDimension(YGNodeBoundAxis(node, YGFlexDirection.Column, availableHeight - marginAxisColumn, ownerHeight, ownerWidth), YGDimension.Height);
    if (measureModeMainDim == YGMeasureMode.Undefined ||
        (node.getStyle().overflow != YGOverflow.Scroll && measureModeMainDim == YGMeasureMode.AtMost)) {
        node.setLayoutMeasuredDimension(YGNodeBoundAxis(node, mainAxis, maxLineMainDim, mainAxisownerSize, ownerWidth), dim[mainAxis]);
    }
    else if (measureModeMainDim == YGMeasureMode.AtMost &&
        node.getStyle().overflow == YGOverflow.Scroll) {
        node.setLayoutMeasuredDimension(YGFloatMax(YGFloatMin(availableInnerMainDim + paddingAndBorderAxisMain, YGUnwrapFloatOptional(YGNodeBoundAxisWithinMinAndMax(node, mainAxis, maxLineMainDim, mainAxisownerSize))), paddingAndBorderAxisMain), dim[mainAxis]);
    }
    if (measureModeCrossDim == YGMeasureMode.Undefined ||
        (node.getStyle().overflow != YGOverflow.Scroll && measureModeCrossDim == YGMeasureMode.AtMost)) {
        node.setLayoutMeasuredDimension(YGNodeBoundAxis(node, crossAxis, totalLineCrossDim + paddingAndBorderAxisCross, crossAxisownerSize, ownerWidth), dim[crossAxis]);
    }
    else if (measureModeCrossDim == YGMeasureMode.AtMost &&
        node.getStyle().overflow == YGOverflow.Scroll) {
        node.setLayoutMeasuredDimension(YGFloatMax(YGFloatMin(availableInnerCrossDim + paddingAndBorderAxisCross, YGUnwrapFloatOptional(YGNodeBoundAxisWithinMinAndMax(node, crossAxis, totalLineCrossDim + paddingAndBorderAxisCross, crossAxisownerSize))), paddingAndBorderAxisCross), dim[crossAxis]);
    }
    if (performLayout && node.getStyle().flexWrap == YGWrap.WrapReverse) {
        for (let i = 0; i < childCount; i++) {
            const child = YGNodeGetChild(node, i);
            if (child.getStyle().positionType == YGPositionType.Relative) {
                child.setLayoutPosition(node.getLayout().measuredDimensions[dim[crossAxis]] -
                    child.getLayout().position[pos[crossAxis]] -
                    child.getLayout().measuredDimensions[dim[crossAxis]], pos[crossAxis]);
            }
        }
    }
    if (performLayout) {
        const children = node.getChildren();
        for (let i = 0; i < children.length; ++i) {
            const child = children[i];
            if (child.getStyle().positionType != YGPositionType.Absolute) {
                continue;
            }
            YGNodeAbsoluteLayoutChild(node, child, availableInnerWidth, isMainAxisRow ? measureModeMainDim : measureModeCrossDim, availableInnerHeight, direction, config);
        }
        const needsMainTrailingPos = mainAxis == YGFlexDirection.RowReverse || mainAxis == YGFlexDirection.ColumnReverse;
        const needsCrossTrailingPos = crossAxis == YGFlexDirection.RowReverse || crossAxis == YGFlexDirection.ColumnReverse;
        if (needsMainTrailingPos || needsCrossTrailingPos) {
            for (let i = 0; i < childCount; i++) {
                const child = node.getChild(i);
                if (child.getStyle().display == YGDisplay.None) {
                    continue;
                }
                if (needsMainTrailingPos) {
                    YGNodeSetChildTrailingPosition(node, child, mainAxis);
                }
                if (needsCrossTrailingPos) {
                    YGNodeSetChildTrailingPosition(node, child, crossAxis);
                }
            }
        }
    }
}
function YGMeasureModeSizeIsExactAndMatchesOldMeasuredSize(sizeMode, size, lastComputedSize) {
    return sizeMode == YGMeasureMode.Exactly && YGFloatsEqual(size, lastComputedSize);
}
function YGMeasureModeOldSizeIsUnspecifiedAndStillFits(sizeMode, size, lastSizeMode, lastComputedSize) {
    return (sizeMode == YGMeasureMode.AtMost &&
        lastSizeMode == YGMeasureMode.Undefined &&
        (size >= lastComputedSize || YGFloatsEqual(size, lastComputedSize)));
}
function YGMeasureModeNewMeasureSizeIsStricterAndStillValid(sizeMode, size, lastSizeMode, lastSize, lastComputedSize) {
    return (lastSizeMode == YGMeasureMode.AtMost &&
        sizeMode == YGMeasureMode.AtMost &&
        !YGFloatIsUndefined(lastSize) &&
        !YGFloatIsUndefined(size) &&
        !YGFloatIsUndefined(lastComputedSize) &&
        lastSize > size &&
        (lastComputedSize <= size || YGFloatsEqual(size, lastComputedSize)));
}
function YGRoundValueToPixelGrid(value, pointScaleFactor, forceCeil, forceFloor) {
    let scaledValue = value * pointScaleFactor;
    const fractial = scaledValue % 1.0;
    if (YGFloatsEqual(fractial, 0)) {
        scaledValue = scaledValue - fractial;
    }
    else if (YGFloatsEqual(fractial, 1.0)) {
        scaledValue = scaledValue - fractial + 1.0;
    }
    else if (forceCeil) {
        scaledValue = scaledValue - fractial + 1.0;
    }
    else if (forceFloor) {
        scaledValue = scaledValue - fractial;
    }
    else {
        scaledValue =
            scaledValue -
                fractial +
                (!YGFloatIsUndefined(fractial) && (fractial > 0.5 || YGFloatsEqual(fractial, 0.5))
                    ? 1.0
                    : 0.0);
    }
    return YGFloatIsUndefined(scaledValue) || YGFloatIsUndefined(pointScaleFactor)
        ? YGUndefined
        : scaledValue / pointScaleFactor;
}
function YGNodeCanUseCachedMeasurement(widthMode, width, heightMode, height, lastWidthMode, lastWidth, lastHeightMode, lastHeight, lastComputedWidth, lastComputedHeight, marginRow, marginColumn, config) {
    if ((!YGFloatIsUndefined(lastComputedHeight) && lastComputedHeight < 0) ||
        (!YGFloatIsUndefined(lastComputedWidth) && lastComputedWidth < 0)) {
        return false;
    }
    const useRoundedComparison = config != null && config.pointScaleFactor != 0;
    const effectiveWidth = useRoundedComparison
        ? YGRoundValueToPixelGrid(width, config.pointScaleFactor, false, false)
        : width;
    const effectiveHeight = useRoundedComparison
        ? YGRoundValueToPixelGrid(height, config.pointScaleFactor, false, false)
        : height;
    const effectiveLastWidth = useRoundedComparison
        ? YGRoundValueToPixelGrid(lastWidth, config.pointScaleFactor, false, false)
        : lastWidth;
    const effectiveLastHeight = useRoundedComparison
        ? YGRoundValueToPixelGrid(lastHeight, config.pointScaleFactor, false, false)
        : lastHeight;
    const hasSameWidthSpec = lastWidthMode == widthMode && YGFloatsEqual(effectiveLastWidth, effectiveWidth);
    const hasSameHeightSpec = lastHeightMode == heightMode && YGFloatsEqual(effectiveLastHeight, effectiveHeight);
    const widthIsCompatible = hasSameWidthSpec ||
        YGMeasureModeSizeIsExactAndMatchesOldMeasuredSize(widthMode, width - marginRow, lastComputedWidth) ||
        YGMeasureModeOldSizeIsUnspecifiedAndStillFits(widthMode, width - marginRow, lastWidthMode, lastComputedWidth) ||
        YGMeasureModeNewMeasureSizeIsStricterAndStillValid(widthMode, width - marginRow, lastWidthMode, lastWidth, lastComputedWidth);
    const heightIsCompatible = hasSameHeightSpec ||
        YGMeasureModeSizeIsExactAndMatchesOldMeasuredSize(heightMode, height - marginColumn, lastComputedHeight) ||
        YGMeasureModeOldSizeIsUnspecifiedAndStillFits(heightMode, height - marginColumn, lastHeightMode, lastComputedHeight) ||
        YGMeasureModeNewMeasureSizeIsStricterAndStillValid(heightMode, height - marginColumn, lastHeightMode, lastHeight, lastComputedHeight);
    return widthIsCompatible && heightIsCompatible;
}
function YGLayoutNodeInternal(node, availableWidth, availableHeight, ownerDirection, widthMeasureMode, heightMeasureMode, ownerWidth, ownerHeight, performLayout, reason, config) {
    const layout = node.getLayout();
    const needToVisitNode = (node.isDirty() && layout.generationCount != gCurrentGenerationCount) ||
        layout.lastOwnerDirection != ownerDirection;
    if (needToVisitNode) {
        layout.nextCachedMeasurementsIndex = 0;
        layout.cachedLayout.widthMeasureMode = YGMeasureModeCount - 1;
        layout.cachedLayout.heightMeasureMode = YGMeasureModeCount - 1;
        layout.cachedLayout.computedWidth = -1;
        layout.cachedLayout.computedHeight = -1;
    }
    let cachedResults = null;
    if (node.getMeasure() != null) {
        const marginAxisRow = YGUnwrapFloatOptional(node.getMarginForAxis(YGFlexDirection.Row, ownerWidth));
        const marginAxisColumn = YGUnwrapFloatOptional(node.getMarginForAxis(YGFlexDirection.Column, ownerWidth));
        if (YGNodeCanUseCachedMeasurement(widthMeasureMode, availableWidth, heightMeasureMode, availableHeight, layout.cachedLayout.widthMeasureMode, layout.cachedLayout.availableWidth, layout.cachedLayout.heightMeasureMode, layout.cachedLayout.availableHeight, layout.cachedLayout.computedWidth, layout.cachedLayout.computedHeight, marginAxisRow, marginAxisColumn, config)) {
            cachedResults = layout.cachedLayout;
        }
        else {
            for (let i = 0; i < layout.nextCachedMeasurementsIndex; i++) {
                if (YGNodeCanUseCachedMeasurement(widthMeasureMode, availableWidth, heightMeasureMode, availableHeight, layout.cachedMeasurements[i].widthMeasureMode, layout.cachedMeasurements[i].availableWidth, layout.cachedMeasurements[i].heightMeasureMode, layout.cachedMeasurements[i].availableHeight, layout.cachedMeasurements[i].computedWidth, layout.cachedMeasurements[i].computedHeight, marginAxisRow, marginAxisColumn, config)) {
                    cachedResults = layout.cachedMeasurements[i];
                    break;
                }
            }
        }
    }
    else if (performLayout) {
        if (YGFloatsEqual(layout.cachedLayout.availableWidth, availableWidth) &&
            YGFloatsEqual(layout.cachedLayout.availableHeight, availableHeight) &&
            layout.cachedLayout.widthMeasureMode == widthMeasureMode &&
            layout.cachedLayout.heightMeasureMode == heightMeasureMode) {
            cachedResults = layout.cachedLayout;
        }
    }
    else {
        for (let i = 0; i < layout.nextCachedMeasurementsIndex; i++) {
            if (YGFloatsEqual(layout.cachedMeasurements[i].availableWidth, availableWidth) &&
                YGFloatsEqual(layout.cachedMeasurements[i].availableHeight, availableHeight) &&
                layout.cachedMeasurements[i].widthMeasureMode == widthMeasureMode &&
                layout.cachedMeasurements[i].heightMeasureMode == heightMeasureMode) {
                cachedResults = layout.cachedMeasurements[i];
                break;
            }
        }
    }
    if (!needToVisitNode && cachedResults != null) {
        layout.measuredDimensions[YGDimension.Width] = cachedResults.computedWidth;
        layout.measuredDimensions[YGDimension.Height] = cachedResults.computedHeight;
    }
    else {
        YGNodelayoutImpl(node, availableWidth, availableHeight, ownerDirection, widthMeasureMode, heightMeasureMode, ownerWidth, ownerHeight, performLayout, config);
        layout.lastOwnerDirection = ownerDirection;
        if (cachedResults == null) {
            if (layout.nextCachedMeasurementsIndex == YG_MAX_CACHED_RESULT_COUNT) {
                layout.nextCachedMeasurementsIndex = 0;
            }
            let newCacheEntry;
            if (performLayout) {
                newCacheEntry = layout.cachedLayout;
            }
            else {
                newCacheEntry = layout.cachedMeasurements[layout.nextCachedMeasurementsIndex];
                layout.nextCachedMeasurementsIndex++;
            }
            newCacheEntry.availableWidth = availableWidth;
            newCacheEntry.availableHeight = availableHeight;
            newCacheEntry.widthMeasureMode = widthMeasureMode;
            newCacheEntry.heightMeasureMode = heightMeasureMode;
            newCacheEntry.computedWidth = layout.measuredDimensions[YGDimension.Width];
            newCacheEntry.computedHeight = layout.measuredDimensions[YGDimension.Height];
        }
    }
    if (performLayout) {
        node.setLayoutDimension(node.getLayout().measuredDimensions[YGDimension.Width], YGDimension.Width);
        node.setLayoutDimension(node.getLayout().measuredDimensions[YGDimension.Height], YGDimension.Height);
        node.setHasNewLayout(true);
        node.setDirty(false);
    }
    layout.generationCount = gCurrentGenerationCount;
    return needToVisitNode || cachedResults == null;
}
function YGConfigSetPointScaleFactor(config, pixelsInPoint) {
    YGAssertWithConfig(config, pixelsInPoint >= 0.0, 'Scale factor should not be less than zero');
    if (pixelsInPoint == 0.0) {
        config.pointScaleFactor = 0.0;
    }
    else {
        config.pointScaleFactor = pixelsInPoint;
    }
}
function fmodf(x, y) {
    return x % y;
}
function YGRoundToPixelGrid(node, pointScaleFactor, absoluteLeft, absoluteTop) {
    if (pointScaleFactor == 0.0) {
        return;
    }
    const nodeLeft = node.getLayout().position[YGEdge.Left];
    const nodeTop = node.getLayout().position[YGEdge.Top];
    const nodeWidth = node.getLayout().dimensions[YGDimension.Width];
    const nodeHeight = node.getLayout().dimensions[YGDimension.Height];
    const absoluteNodeLeft = absoluteLeft + nodeLeft;
    const absoluteNodeTop = absoluteTop + nodeTop;
    const absoluteNodeRight = absoluteNodeLeft + nodeWidth;
    const absoluteNodeBottom = absoluteNodeTop + nodeHeight;
    const textRounding = node.getNodeType() == YGNodeType.Text;
    node.setLayoutPosition(YGRoundValueToPixelGrid(nodeLeft, pointScaleFactor, false, textRounding), YGEdge.Left);
    node.setLayoutPosition(YGRoundValueToPixelGrid(nodeTop, pointScaleFactor, false, textRounding), YGEdge.Top);
    const hasFractionalWidth = !YGFloatsEqual(fmodf(nodeWidth * pointScaleFactor, 1.0), 0) &&
        !YGFloatsEqual(fmodf(nodeWidth * pointScaleFactor, 1.0), 1.0);
    const hasFractionalHeight = !YGFloatsEqual(fmodf(nodeHeight * pointScaleFactor, 1.0), 0) &&
        !YGFloatsEqual(fmodf(nodeHeight * pointScaleFactor, 1.0), 1.0);
    node.setLayoutDimension(YGRoundValueToPixelGrid(absoluteNodeRight, pointScaleFactor, textRounding && hasFractionalWidth, textRounding && !hasFractionalWidth) - YGRoundValueToPixelGrid(absoluteNodeLeft, pointScaleFactor, false, textRounding), YGDimension.Width);
    node.setLayoutDimension(YGRoundValueToPixelGrid(absoluteNodeBottom, pointScaleFactor, textRounding && hasFractionalHeight, textRounding && !hasFractionalHeight) - YGRoundValueToPixelGrid(absoluteNodeTop, pointScaleFactor, false, textRounding), YGDimension.Height);
    const childCount = YGNodeGetChildCount(node);
    for (let i = 0; i < childCount; i++) {
        YGRoundToPixelGrid(YGNodeGetChild(node, i), pointScaleFactor, absoluteNodeLeft, absoluteNodeTop);
    }
}
function YGNodeCalculateLayout(node, ownerWidth, ownerHeight, ownerDirection) {
    gCurrentGenerationCount++;
    node.resolveDimension();
    let width = YGUndefined;
    let widthMeasureMode = YGMeasureMode.Undefined;
    if (YGNodeIsStyleDimDefined(node, YGFlexDirection.Row, ownerWidth)) {
        width = YGUnwrapFloatOptional(YGResolveValue(node.getResolvedDimension(dim[YGFlexDirection.Row]), ownerWidth).add(node.getMarginForAxis(YGFlexDirection.Row, ownerWidth)));
        widthMeasureMode = YGMeasureMode.Exactly;
    }
    else if (!YGResolveValue(node.getStyle().maxDimensions[YGDimension.Width], ownerWidth).isUndefined()) {
        width = YGUnwrapFloatOptional(YGResolveValue(node.getStyle().maxDimensions[YGDimension.Width], ownerWidth));
        widthMeasureMode = YGMeasureMode.AtMost;
    }
    else {
        width = ownerWidth;
        widthMeasureMode = YGFloatIsUndefined(width) ? YGMeasureMode.Undefined : YGMeasureMode.Exactly;
    }
    let height = YGUndefined;
    let heightMeasureMode = YGMeasureMode.Undefined;
    if (YGNodeIsStyleDimDefined(node, YGFlexDirection.Column, ownerHeight)) {
        height = YGUnwrapFloatOptional(YGResolveValue(node.getResolvedDimension(dim[YGFlexDirection.Column]), ownerHeight).add(node.getMarginForAxis(YGFlexDirection.Column, ownerWidth)));
        heightMeasureMode = YGMeasureMode.Exactly;
    }
    else if (!YGResolveValue(node.getStyle().maxDimensions[YGDimension.Height], ownerHeight).isUndefined()) {
        height = YGUnwrapFloatOptional(YGResolveValue(node.getStyle().maxDimensions[YGDimension.Height], ownerHeight));
        heightMeasureMode = YGMeasureMode.AtMost;
    }
    else {
        height = ownerHeight;
        heightMeasureMode = YGFloatIsUndefined(height)
            ? YGMeasureMode.Undefined
            : YGMeasureMode.Exactly;
    }
    if (YGLayoutNodeInternal(node, width, height, ownerDirection, widthMeasureMode, heightMeasureMode, ownerWidth, ownerHeight, true, 'initial', node.getConfig())) {
        node.setPosition(node.getLayout().direction, ownerWidth, ownerHeight, ownerWidth);
        YGRoundToPixelGrid(node, node.getConfig().pointScaleFactor, 0.0, 0.0);
    }
    if (node.getConfig().shouldDiffLayoutWithoutLegacyStretchBehaviour && node.didUseLegacyFlag()) {
        console.log('legacy config');
        const originalNode = YGNodeDeepClone(node);
        originalNode.resolveDimension();
        originalNode.markDirtyAndPropogateDownwards();
        gCurrentGenerationCount++;
        originalNode.setAndPropogateUseLegacyFlag(false);
        if (YGLayoutNodeInternal(originalNode, width, height, ownerDirection, widthMeasureMode, heightMeasureMode, ownerWidth, ownerHeight, true, 'initial', originalNode.getConfig())) {
            originalNode.setPosition(originalNode.getLayout().direction, ownerWidth, ownerHeight, ownerWidth);
            YGRoundToPixelGrid(originalNode, originalNode.getConfig().pointScaleFactor, 0.0, 0.0);
            node.setLayoutDoesLegacyFlagAffectsLayout(!originalNode.isLayoutTreeEqualToNode(node));
        }
        YGConfigFreeRecursive(originalNode);
        YGNodeFreeRecursive(originalNode);
    }
}
function YGVLog(config, node, level, format, ...args) {
    const logConfig = config != null ? config : YGConfigGetDefault();
    logConfig.logger(logConfig, node, level, format, args);
    if (level == YGLogLevel.Fatal) {
        throw new Error('Abort Yoga');
    }
}
function YGLogWithConfig(config, level, format, ...args) {
    YGVLog(config, null, level, format, args);
}
function YGLog(node, level, format, ...args) {
    YGVLog(node == null ? null : node.getConfig(), node, level, format, args);
}
function YGAssertWithNode(node, condition, message) {
    if (!condition) {
        YGLog(node, YGLogLevel.Fatal, '%s\n', message);
    }
}
function YGAssertWithConfig(config, condition, message) {
    if (!condition) {
        YGLogWithConfig(config, YGLogLevel.Fatal, '%s\n', message);
    }
}
function YGConfigSetExperimentalFeatureEnabled(config, feature, enabled) {
    config.experimentalFeatures[feature] = enabled;
}
function YGConfigIsExperimentalFeatureEnabled(config, feature) {
    return config.experimentalFeatures[feature];
}

export { YGAssertWithConfig, YGAssertWithNode, YGBaseline, YGCalculateCollectFlexItemsRowValues, YGComputedEdgeValue, YGConfigClone, YGConfigFree, YGConfigFreeRecursive, YGConfigGetDefault, YGConfigIsExperimentalFeatureEnabled, YGConfigNew, YGConfigSetExperimentalFeatureEnabled, YGConfigSetPointScaleFactor, YGConstrainMaxSizeForMode, YGDistributeFreeSpaceFirstPass, YGDistributeFreeSpaceSecondPass, YGFloatIsUndefined, YGIsBaselineLayout, YGJustifyMainAxis, YGLayoutNodeInternal, YGLog, YGLogWithConfig, YGMeasureModeNewMeasureSizeIsStricterAndStillValid, YGMeasureModeOldSizeIsUnspecifiedAndStillFits, YGMeasureModeSizeIsExactAndMatchesOldMeasuredSize, YGNodeAbsoluteLayoutChild, YGNodeAlignItem, YGNodeBoundAxis, YGNodeBoundAxisWithinMinAndMax, YGNodeCalculateAvailableInnerDim, YGNodeCalculateLayout, YGNodeCanUseCachedMeasurement, YGNodeClone, YGNodeComputeFlexBasisForChild, YGNodeComputeFlexBasisForChildren, YGNodeCopyStyle, YGNodeDeepClone, YGNodeDimWithMargin, YGNodeEmptyContainerSetMeasuredDimensions, YGNodeFixedSizeSetMeasuredDimensions, YGNodeFree, YGNodeFreeRecursive, YGNodeGetChild, YGNodeGetChildCount, YGNodeGetContext, YGNodeGetParent, YGNodeInsertChild, YGNodeIsDirty, YGNodeIsLayoutDimDefined, YGNodeIsStyleDimDefined, YGNodeLayoutGetBorder, YGNodeLayoutGetBottom, YGNodeLayoutGetHeight, YGNodeLayoutGetLeft, YGNodeLayoutGetMargin, YGNodeLayoutGetPadding, YGNodeLayoutGetRight, YGNodeLayoutGetTop, YGNodeLayoutGetWidth, YGNodeMarkDirty, YGNodeNew, YGNodeNewWithConfig, YGNodePaddingAndBorderForAxis, YGNodeRemoveChild, YGNodeReset, YGNodeSetChildTrailingPosition, YGNodeSetContext, YGNodeSetMeasureFunc, YGNodeStyleGetAlignContent, YGNodeStyleGetAlignItems, YGNodeStyleGetAlignSelf, YGNodeStyleGetAspectRatio, YGNodeStyleGetBorder, YGNodeStyleGetDisplay, YGNodeStyleGetFlexBasis, YGNodeStyleGetFlexDirection, YGNodeStyleGetFlexGrow, YGNodeStyleGetFlexShrink, YGNodeStyleGetFlexWrap, YGNodeStyleGetHeight, YGNodeStyleGetJustifyContent, YGNodeStyleGetMargin, YGNodeStyleGetMaxHeight, YGNodeStyleGetMaxWidth, YGNodeStyleGetMinHeight, YGNodeStyleGetMinWidth, YGNodeStyleGetOverflow, YGNodeStyleGetPadding, YGNodeStyleGetPosition, YGNodeStyleGetPositionType, YGNodeStyleGetWidth, YGNodeStyleSetAlignContent, YGNodeStyleSetAlignItems, YGNodeStyleSetAlignSelf, YGNodeStyleSetAspectRatio, YGNodeStyleSetBorder, YGNodeStyleSetDisplay, YGNodeStyleSetFlex, YGNodeStyleSetFlexBasis, YGNodeStyleSetFlexBasisAuto, YGNodeStyleSetFlexBasisPercent, YGNodeStyleSetFlexDirection, YGNodeStyleSetFlexGrow, YGNodeStyleSetFlexShrink, YGNodeStyleSetFlexWrap, YGNodeStyleSetHeight, YGNodeStyleSetHeightAuto, YGNodeStyleSetHeightPercent, YGNodeStyleSetJustifyContent, YGNodeStyleSetMargin, YGNodeStyleSetMarginAuto, YGNodeStyleSetMarginPercent, YGNodeStyleSetMaxHeight, YGNodeStyleSetMaxHeightPercent, YGNodeStyleSetMaxWidth, YGNodeStyleSetMaxWidthPercent, YGNodeStyleSetMinHeight, YGNodeStyleSetMinHeightPercent, YGNodeStyleSetMinWidth, YGNodeStyleSetMinWidthPercent, YGNodeStyleSetOverflow, YGNodeStyleSetPadding, YGNodeStyleSetPaddingPercent, YGNodeStyleSetPosition, YGNodeStyleSetPositionPercent, YGNodeStyleSetPositionType, YGNodeStyleSetWidth, YGNodeStyleSetWidthAuto, YGNodeStyleSetWidthPercent, YGNodeWithMeasureFuncSetMeasuredDimensions, YGNodelayoutImpl, YGResolveFlexibleLength, YGRoundToPixelGrid, YGRoundValueToPixelGrid, YGSize, YGUndefined, YGVLog, YGValueAuto, YGValueUndefined, YGValueZero, YGZeroOutLayoutRecursivly };
//# sourceMappingURL=yoga.js.map
