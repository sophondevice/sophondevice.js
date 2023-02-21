/** sophon base library */
import { YGNodeType, YGEdge, YGUnit, YGDirection, YGDimension, YGDimensionCount, YGPositionType } from './enums.js';
import { YGFloatOptional } from './ygfloatoptional.js';
import { YGConfig } from './ygconfig.js';
import { YGFlexDirectionIsRow, YGResolveValue, YGResolveValueMargin, YGFloatMax, YGFloatOptionalMax, YGResolveFlexDirection, YGFlexDirectionCross, YGUnwrapFloatOptional, YGValueEqual } from './utils.js';
import { YGLayout } from './yglayout.js';
import { YGStyle } from './ygstyle.js';
import { leading, trailing, kDefaultFlexGrow, kWebDefaultFlexShrink, kDefaultFlexShrink } from './internal.js';
import { YGValueUndefined, YGComputedEdgeValue, YGValueZero, YGFloatIsUndefined, YGValueAuto, YGNodeClone } from './yoga.js';

class YGNode {
    context_;
    print_;
    hasNewLayout_;
    nodeType_;
    measure_;
    baseline_;
    dirtied_;
    style_;
    layout_;
    lineIndex_;
    owner_;
    children_;
    config_;
    isDirty_;
    resolvedDimensions_;
    relativePosition(axis, axisSize) {
        if (this.isLeadingPositionDefined(axis)) {
            return this.getLeadingPosition(axis, axisSize);
        }
        const trailingPosition = this.getTrailingPosition(axis, axisSize);
        if (!trailingPosition.isUndefined()) {
            trailingPosition.setValue(-1 * trailingPosition.getValue());
        }
        return trailingPosition;
    }
    constructor(contextOrNodeOrConfig = null, print = null, hasNewLayout = true, nodeType = YGNodeType.Default, measure = null, baseline = null, dirtied = null, style = new YGStyle(), layout = new YGLayout(), lineIndex = 0, owner = null, children = [], config = null, isDirty = false, resolvedDimensions = [YGValueUndefined(), YGValueUndefined()]) {
        if (contextOrNodeOrConfig instanceof YGNode) {
            console.log('from node');
            this.fromNode(contextOrNodeOrConfig);
            return;
        }
        this.print_ = print;
        this.hasNewLayout_ = hasNewLayout;
        this.nodeType_ = nodeType;
        this.measure_ = measure;
        this.baseline_ = baseline;
        this.dirtied_ = dirtied;
        this.style_ = style;
        this.layout_ = layout;
        this.lineIndex_ = lineIndex;
        this.owner_ = owner;
        this.children_ = children;
        this.config_ = config;
        this.isDirty_ = isDirty;
        this.resolvedDimensions_ = resolvedDimensions;
        if (contextOrNodeOrConfig instanceof YGConfig) {
            this.config_ = contextOrNodeOrConfig;
            this.context_ = null;
        }
        else {
            this.context_ = contextOrNodeOrConfig;
        }
    }
    operatorAtrib(node) {
        if (node == this) {
            return this;
        }
        this.clearChildren();
        this.fromNode(node);
        return this;
    }
    fromNode(node) {
        console.log(node);
        this.context_ = node.context_;
        this.print_ = node.print_;
        this.hasNewLayout_ = node.hasNewLayout_;
        this.nodeType_ = node.nodeType_;
        this.measure_ = node.measure_;
        this.baseline_ = node.baseline_;
        this.dirtied_ = node.dirtied_;
        this.style_ = node.style_;
        this.layout_ = node.layout_;
        this.lineIndex_ = node.lineIndex_;
        this.owner_ = node.owner_;
        this.children_ = node.children_;
        this.config_ = node.config_;
        this.isDirty_ = node.isDirty_;
        this.resolvedDimensions_ = node.resolvedDimensions_;
    }
    getContext() {
        return this.context_;
    }
    getPrintFunc() {
        return this.print_;
    }
    getHasNewLayout() {
        return this.hasNewLayout_;
    }
    getNodeType() {
        return this.nodeType_;
    }
    getMeasure() {
        return this.measure_;
    }
    getBaseline() {
        return this.baseline_;
    }
    getDirtied() {
        return this.dirtied_;
    }
    getStyle() {
        return this.style_;
    }
    getLayout() {
        return this.layout_;
    }
    getLineIndex() {
        return this.lineIndex_;
    }
    getOwner() {
        return this.owner_;
    }
    getParent() {
        return this.getOwner();
    }
    getChildren() {
        return this.children_;
    }
    getChildrenCount() {
        return this.children_.length;
    }
    getChild(index) {
        return this.children_[index];
    }
    getConfig() {
        return this.config_;
    }
    isDirty() {
        return this.isDirty_;
    }
    getResolvedDimensions() {
        return this.resolvedDimensions_;
    }
    getResolvedDimension(index) {
        return this.resolvedDimensions_[index];
    }
    getLeadingPosition(axis, axisSize) {
        if (YGFlexDirectionIsRow(axis)) {
            const leadingPosition = YGComputedEdgeValue(this.style_.position, YGEdge.Start, YGValueUndefined());
            if (leadingPosition.unit != YGUnit.Undefined) {
                return YGResolveValue(leadingPosition, axisSize);
            }
        }
        const leadingPosition = YGComputedEdgeValue(this.style_.position, leading[axis], YGValueUndefined());
        return leadingPosition.unit == YGUnit.Undefined
            ? new YGFloatOptional(0)
            : YGResolveValue(leadingPosition, axisSize);
    }
    isLeadingPositionDefined(axis) {
        return ((YGFlexDirectionIsRow(axis) &&
            YGComputedEdgeValue(this.style_.position, YGEdge.Start, YGValueUndefined()).unit !=
                YGUnit.Undefined) ||
            YGComputedEdgeValue(this.style_.position, leading[axis], YGValueUndefined()).unit !=
                YGUnit.Undefined);
    }
    isTrailingPosDefined(axis) {
        return ((YGFlexDirectionIsRow(axis) &&
            YGComputedEdgeValue(this.style_.position, YGEdge.End, YGValueUndefined()).unit !=
                YGUnit.Undefined) ||
            YGComputedEdgeValue(this.style_.position, trailing[axis], YGValueUndefined()).unit !=
                YGUnit.Undefined);
    }
    getTrailingPosition(axis, axisSize) {
        if (YGFlexDirectionIsRow(axis)) {
            const trailingPosition = YGComputedEdgeValue(this.style_.position, YGEdge.End, YGValueUndefined());
            if (trailingPosition.unit != YGUnit.Undefined) {
                return YGResolveValue(trailingPosition, axisSize);
            }
        }
        const trailingPosition = YGComputedEdgeValue(this.style_.position, trailing[axis], YGValueUndefined());
        return trailingPosition.unit == YGUnit.Undefined
            ? new YGFloatOptional(0)
            : YGResolveValue(trailingPosition, axisSize);
    }
    getLeadingMargin(axis, widthSize) {
        if (YGFlexDirectionIsRow(axis) && this.style_.margin[YGEdge.Start].unit != YGUnit.Undefined) {
            return YGResolveValueMargin(this.style_.margin[YGEdge.Start], widthSize);
        }
        return YGResolveValueMargin(YGComputedEdgeValue(this.style_.margin, leading[axis], YGValueZero()), widthSize);
    }
    getTrailingMargin(axis, widthSize) {
        if (YGFlexDirectionIsRow(axis) && this.style_.margin[YGEdge.End].unit != YGUnit.Undefined) {
            return YGResolveValueMargin(this.style_.margin[YGEdge.End], widthSize);
        }
        return YGResolveValueMargin(YGComputedEdgeValue(this.style_.margin, trailing[axis], YGValueZero()), widthSize);
    }
    getLeadingBorder(axis) {
        if (YGFlexDirectionIsRow(axis) &&
            this.style_.border[YGEdge.Start].unit != YGUnit.Undefined &&
            !YGFloatIsUndefined(this.style_.border[YGEdge.Start].value) &&
            this.style_.border[YGEdge.Start].value >= 0.0) {
            return this.style_.border[YGEdge.Start].value;
        }
        const computedEdgeValue = YGComputedEdgeValue(this.style_.border, leading[axis], YGValueZero()).value;
        return YGFloatMax(computedEdgeValue, 0.0);
    }
    getTrailingBorder(axis) {
        if (YGFlexDirectionIsRow(axis) &&
            this.style_.border[YGEdge.End].unit != YGUnit.Undefined &&
            !YGFloatIsUndefined(this.style_.border[YGEdge.End].value) &&
            this.style_.border[YGEdge.End].value >= 0.0) {
            return this.style_.border[YGEdge.End].value;
        }
        const computedEdgeValue = YGComputedEdgeValue(this.style_.border, trailing[axis], YGValueZero()).value;
        return YGFloatMax(computedEdgeValue, 0.0);
    }
    getLeadingPadding(axis, widthSize) {
        const paddingEdgeStart = YGResolveValue(this.style_.padding[YGEdge.Start], widthSize);
        if (YGFlexDirectionIsRow(axis) &&
            this.style_.padding[YGEdge.Start].unit != YGUnit.Undefined &&
            !paddingEdgeStart.isUndefined() &&
            paddingEdgeStart.getValue() > 0.0) {
            return paddingEdgeStart;
        }
        const resolvedValue = YGResolveValue(YGComputedEdgeValue(this.style_.padding, leading[axis], YGValueZero()), widthSize);
        return YGFloatOptionalMax(resolvedValue, new YGFloatOptional(0.0));
    }
    getTrailingPadding(axis, widthSize) {
        const paddingEdgeEnd = YGResolveValue(this.style_.padding[YGEdge.End], widthSize);
        if (YGFlexDirectionIsRow(axis) &&
            this.style_.padding[YGEdge.End].unit != YGUnit.Undefined &&
            !paddingEdgeEnd.isUndefined() &&
            paddingEdgeEnd.getValue() >= 0.0) {
            return paddingEdgeEnd;
        }
        const resolvedValue = YGResolveValue(YGComputedEdgeValue(this.style_.padding, trailing[axis], YGValueZero()), widthSize);
        return YGFloatOptionalMax(resolvedValue, new YGFloatOptional(0.0));
    }
    getLeadingPaddingAndBorder(axis, widthSize) {
        return this.getLeadingPadding(axis, widthSize).add(new YGFloatOptional(this.getLeadingBorder(axis)));
    }
    getTrailingPaddingAndBorder(axis, widthSize) {
        return this.getTrailingPadding(axis, widthSize).add(new YGFloatOptional(this.getTrailingBorder(axis)));
    }
    getMarginForAxis(axis, widthSize) {
        return this.getLeadingMargin(axis, widthSize).add(this.getTrailingMargin(axis, widthSize));
    }
    setContext(context) {
        this.context_ = context;
    }
    setPrintFunc(printFunc) {
        this.print_ = printFunc;
    }
    setHasNewLayout(hasNewLayout) {
        this.hasNewLayout_ = hasNewLayout;
    }
    setNodeType(nodeType) {
        this.nodeType_ = nodeType;
    }
    setMeasureFunc(measureFunc) {
        if (measureFunc == null) {
            this.measure_ = null;
            this.nodeType_ = YGNodeType.Default;
        }
        else {
            if (this.children_.length != 0) {
                console.error('Cannot set measure function: Nodes with measure functions cannot have children.');
            }
            this.measure_ = measureFunc;
            this.setNodeType(YGNodeType.Text);
        }
        this.measure_ = measureFunc;
    }
    setBaseLineFunc(baseLineFunc) {
        this.baseline_ = baseLineFunc;
    }
    setDirtiedFunc(dirtiedFunc) {
        this.dirtied_ = dirtiedFunc;
    }
    setStyle(style) {
        this.style_ = style;
    }
    setStyleFlexDirection(direction) {
        this.style_.flexDirection = direction;
    }
    setStyleAlignContent(alignContent) {
        this.style_.alignContent = alignContent;
    }
    setLayout(layout) {
        this.layout_ = layout;
    }
    setLineIndex(lineIndex) {
        this.lineIndex_ = lineIndex;
    }
    setOwner(owner) {
        this.owner_ = owner;
    }
    setChildren(children) {
        this.children_ = children;
    }
    setConfig(config) {
        this.config_ = config;
    }
    setDirty(isDirty) {
        this.isDirty_ = isDirty;
    }
    setLayoutLastOwnerDirection(direction) {
        this.layout_.lastOwnerDirection = direction;
    }
    setLayoutComputedFlexBasis(computedFlexBasis) {
        this.layout_.computedFlexBasis = computedFlexBasis;
    }
    setLayoutComputedFlexBasisGeneration(computedFlexBasisGeneration) {
        this.layout_.computedFlexBasisGeneration = computedFlexBasisGeneration;
    }
    setLayoutMeasuredDimension(measuredDimension, index) {
        this.layout_.measuredDimensions[index] = measuredDimension;
    }
    setLayoutHadOverflow(hadOverflow) {
        this.layout_.hadOverflow = hadOverflow;
    }
    setLayoutDimension(dimension, index) {
        this.layout_.dimensions[index] = dimension;
    }
    setLayoutDirection(direction) {
        this.layout_.direction = direction;
    }
    setLayoutMargin(margin, index) {
        this.layout_.margin[index] = margin;
    }
    setLayoutBorder(border, index) {
        this.layout_.border[index] = border;
    }
    setLayoutPadding(padding, index) {
        this.layout_.padding[index] = padding;
    }
    setLayoutPosition(position, index) {
        this.layout_.position[index] = position;
    }
    setPosition(direction, mainSize, crossSize, ownerWidth) {
        const directionRespectingRoot = this.owner_ != null ? direction : YGDirection.LTR;
        const mainAxis = YGResolveFlexDirection(this.style_.flexDirection, directionRespectingRoot);
        const crossAxis = YGFlexDirectionCross(mainAxis, directionRespectingRoot);
        const relativePositionMain = this.relativePosition(mainAxis, mainSize);
        const relativePositionCross = this.relativePosition(crossAxis, crossSize);
        this.setLayoutPosition(YGUnwrapFloatOptional(this.getLeadingMargin(mainAxis, ownerWidth).add(relativePositionMain)), leading[mainAxis]);
        this.setLayoutPosition(YGUnwrapFloatOptional(this.getTrailingMargin(mainAxis, ownerWidth).add(relativePositionMain)), trailing[mainAxis]);
        this.setLayoutPosition(YGUnwrapFloatOptional(this.getLeadingMargin(crossAxis, ownerWidth).add(relativePositionCross)), leading[crossAxis]);
        this.setLayoutPosition(YGUnwrapFloatOptional(this.getTrailingMargin(crossAxis, ownerWidth).add(relativePositionCross)), trailing[crossAxis]);
    }
    setAndPropogateUseLegacyFlag(useLegacyFlag) {
        this.config_.useLegacyStretchBehaviour = useLegacyFlag;
        for (let i = 0; i < this.children_.length; i++) {
            this.children_[i].getConfig().useLegacyStretchBehaviour = useLegacyFlag;
        }
    }
    setLayoutDoesLegacyFlagAffectsLayout(doesLegacyFlagAffectsLayout) {
        this.layout_.doesLegacyStretchFlagAffectsLayout = doesLegacyFlagAffectsLayout;
    }
    setLayoutDidUseLegacyFlag(didUseLegacyFlag) {
        this.layout_.didUseLegacyFlag = didUseLegacyFlag;
    }
    markDirtyAndPropogateDownwards() {
        this.isDirty_ = true;
        for (let i = 0; i < this.children_.length; i++) {
            this.children_[i].markDirtyAndPropogateDownwards();
        }
    }
    marginLeadingValue(axis) {
        if (YGFlexDirectionIsRow(axis) && this.style_.margin[YGEdge.Start].unit != YGUnit.Undefined) {
            return this.style_.margin[YGEdge.Start];
        }
        else {
            return this.style_.margin[leading[axis]];
        }
    }
    marginTrailingValue(axis) {
        if (YGFlexDirectionIsRow(axis) && this.style_.margin[YGEdge.End].unit != YGUnit.Undefined) {
            return this.style_.margin[YGEdge.End];
        }
        else {
            return this.style_.margin[trailing[axis]];
        }
    }
    resolveFlexBasisPtr() {
        const flexBasis = this.style_.flexBasis;
        if (flexBasis.unit != YGUnit.Auto && flexBasis.unit != YGUnit.Undefined) {
            return flexBasis;
        }
        if (!this.style_.flex.isUndefined() && this.style_.flex.getValue() > 0.0) {
            return this.config_.useWebDefaults ? YGValueAuto() : YGValueZero();
        }
        return YGValueAuto();
    }
    resolveDimension() {
        for (let dim = YGDimension.Width; dim < YGDimensionCount; ++dim) {
            if (this.style_.maxDimensions[dim].unit != YGUnit.Undefined &&
                YGValueEqual(this.style_.maxDimensions[dim], this.style_.minDimensions[dim])) {
                this.resolvedDimensions_[dim] = this.style_.maxDimensions[dim];
            }
            else {
                this.resolvedDimensions_[dim] = this.style_.dimensions[dim];
            }
        }
    }
    resolveDirection(ownerDirection) {
        if (this.style_.direction == YGDirection.Inherit) {
            return ownerDirection > YGDirection.Inherit ? ownerDirection : YGDirection.LTR;
        }
        else {
            return this.style_.direction;
        }
    }
    clearChildren() {
        while (this.children_.length > 0) {
            this.children_.pop();
        }
    }
    replaceChild(oldChild, newChild) {
        const index = this.children_.indexOf(oldChild);
        if (index >= 0) {
            this.children_[index] = newChild;
        }
    }
    replaceChildIndex(child, index) {
        this.children_[index] = child;
    }
    insertChildIndex(child, index) {
        this.children_.splice(index, 0, child);
    }
    removeChild(child) {
        const index = this.children_.indexOf(child);
        if (index >= 0) {
            this.children_.splice(index, 1);
            return true;
        }
        return false;
    }
    removeChildIndex(index) {
        this.children_.splice(index, 1);
    }
    cloneChildrenIfNeeded() {
        const childCount = this.children_.length;
        if (childCount == 0) {
            return;
        }
        const firstChild = this.children_[0];
        if (firstChild.getOwner() == this) {
            return;
        }
        const cloneNodeCallback = this.config_.cloneNodeCallback;
        for (let i = 0; i < childCount; ++i) {
            const oldChild = this.children_[i];
            let newChild = null;
            if (cloneNodeCallback) {
                newChild = cloneNodeCallback(oldChild, this, i);
            }
            if (newChild == null) {
                newChild = YGNodeClone(oldChild);
            }
            this.replaceChildIndex(newChild, i);
            newChild.setOwner(this);
        }
    }
    markDirtyAndPropogate() {
        if (!this.isDirty_) {
            this.setDirty(true);
            this.setLayoutComputedFlexBasis(new YGFloatOptional());
            if (this.owner_) {
                this.owner_.markDirtyAndPropogate();
            }
        }
    }
    resolveFlexGrow() {
        if (this.owner_ == null) {
            return 0.0;
        }
        if (!this.style_.flexGrow.isUndefined()) {
            return this.style_.flexGrow.getValue();
        }
        if (!this.style_.flex.isUndefined() && this.style_.flex.getValue() > 0.0) {
            return this.style_.flex.getValue();
        }
        return kDefaultFlexGrow;
    }
    resolveFlexShrink() {
        if (this.owner_ == null) {
            return 0.0;
        }
        if (!this.style_.flexShrink.isUndefined()) {
            return this.style_.flexShrink.getValue();
        }
        if (!this.config_.useWebDefaults &&
            !this.style_.flex.isUndefined() &&
            this.style_.flex.getValue() < 0.0) {
            return -this.style_.flex.getValue();
        }
        return this.config_.useWebDefaults ? kWebDefaultFlexShrink : kDefaultFlexShrink;
    }
    isNodeFlexible() {
        return (this.style_.positionType == YGPositionType.Relative &&
            (this.resolveFlexGrow() != 0 || this.resolveFlexShrink() != 0));
    }
    didUseLegacyFlag() {
        let didUseLegacyFlag = this.layout_.didUseLegacyFlag;
        if (didUseLegacyFlag) {
            return true;
        }
        for (let i = 0; i < this.children_.length; i++) {
            if (this.children_[i].getLayout().didUseLegacyFlag) {
                didUseLegacyFlag = true;
                break;
            }
        }
        return didUseLegacyFlag;
    }
    isLayoutTreeEqualToNode(node) {
        if (this.children_.length != node.getChildren().length) {
            return false;
        }
        if (this.layout_.diff(node.getLayout())) {
            return false;
        }
        if (this.children_.length == 0) {
            return true;
        }
        let isLayoutTreeEqual = true;
        for (let i = 0; i < this.children_.length; ++i) {
            const otherNodeChildren = node.getChild(i);
            isLayoutTreeEqual = this.children_[i].isLayoutTreeEqualToNode(otherNodeChildren);
            if (!isLayoutTreeEqual) {
                return false;
            }
        }
        return isLayoutTreeEqual;
    }
}

export { YGNode };
//# sourceMappingURL=ygnode.js.map
