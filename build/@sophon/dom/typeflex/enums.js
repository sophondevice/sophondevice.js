/** sophon base library */
var YGAlign;
(function (YGAlign) {
    YGAlign[YGAlign["Auto"] = 0] = "Auto";
    YGAlign[YGAlign["FlexStart"] = 1] = "FlexStart";
    YGAlign[YGAlign["Center"] = 2] = "Center";
    YGAlign[YGAlign["FlexEnd"] = 3] = "FlexEnd";
    YGAlign[YGAlign["Stretch"] = 4] = "Stretch";
    YGAlign[YGAlign["Baseline"] = 5] = "Baseline";
    YGAlign[YGAlign["SpaceBetween"] = 6] = "SpaceBetween";
    YGAlign[YGAlign["SpaceAround"] = 7] = "SpaceAround";
})(YGAlign || (YGAlign = {}));
const YGDimensionCount = 2;
var YGDimension;
(function (YGDimension) {
    YGDimension[YGDimension["Width"] = 0] = "Width";
    YGDimension[YGDimension["Height"] = 1] = "Height";
})(YGDimension || (YGDimension = {}));
var YGDirection;
(function (YGDirection) {
    YGDirection[YGDirection["Inherit"] = 0] = "Inherit";
    YGDirection[YGDirection["LTR"] = 1] = "LTR";
    YGDirection[YGDirection["RTL"] = 2] = "RTL";
})(YGDirection || (YGDirection = {}));
var YGDisplay;
(function (YGDisplay) {
    YGDisplay[YGDisplay["Flex"] = 0] = "Flex";
    YGDisplay[YGDisplay["None"] = 1] = "None";
})(YGDisplay || (YGDisplay = {}));
const YGEdgeCount = 9;
var YGEdge;
(function (YGEdge) {
    YGEdge[YGEdge["Left"] = 0] = "Left";
    YGEdge[YGEdge["Top"] = 1] = "Top";
    YGEdge[YGEdge["Right"] = 2] = "Right";
    YGEdge[YGEdge["Bottom"] = 3] = "Bottom";
    YGEdge[YGEdge["Start"] = 4] = "Start";
    YGEdge[YGEdge["End"] = 5] = "End";
    YGEdge[YGEdge["Horizontal"] = 6] = "Horizontal";
    YGEdge[YGEdge["Vertical"] = 7] = "Vertical";
    YGEdge[YGEdge["All"] = 8] = "All";
})(YGEdge || (YGEdge = {}));
var YGExperimentalFeature;
(function (YGExperimentalFeature) {
    YGExperimentalFeature[YGExperimentalFeature["WebFlexBasis"] = 0] = "WebFlexBasis";
})(YGExperimentalFeature || (YGExperimentalFeature = {}));
var YGFlexDirection;
(function (YGFlexDirection) {
    YGFlexDirection[YGFlexDirection["Column"] = 0] = "Column";
    YGFlexDirection[YGFlexDirection["ColumnReverse"] = 1] = "ColumnReverse";
    YGFlexDirection[YGFlexDirection["Row"] = 2] = "Row";
    YGFlexDirection[YGFlexDirection["RowReverse"] = 3] = "RowReverse";
})(YGFlexDirection || (YGFlexDirection = {}));
var YGJustify;
(function (YGJustify) {
    YGJustify[YGJustify["FlexStart"] = 0] = "FlexStart";
    YGJustify[YGJustify["Center"] = 1] = "Center";
    YGJustify[YGJustify["FlexEnd"] = 2] = "FlexEnd";
    YGJustify[YGJustify["SpaceBetween"] = 3] = "SpaceBetween";
    YGJustify[YGJustify["SpaceAround"] = 4] = "SpaceAround";
    YGJustify[YGJustify["SpaceEvenly"] = 5] = "SpaceEvenly";
})(YGJustify || (YGJustify = {}));
var YGLogLevel;
(function (YGLogLevel) {
    YGLogLevel[YGLogLevel["Error"] = 0] = "Error";
    YGLogLevel[YGLogLevel["Warn"] = 1] = "Warn";
    YGLogLevel[YGLogLevel["Info"] = 2] = "Info";
    YGLogLevel[YGLogLevel["Debug"] = 3] = "Debug";
    YGLogLevel[YGLogLevel["Verbose"] = 4] = "Verbose";
    YGLogLevel[YGLogLevel["Fatal"] = 5] = "Fatal";
})(YGLogLevel || (YGLogLevel = {}));
const YGMeasureModeCount = 3;
var YGMeasureMode;
(function (YGMeasureMode) {
    YGMeasureMode[YGMeasureMode["Undefined"] = 0] = "Undefined";
    YGMeasureMode[YGMeasureMode["Exactly"] = 1] = "Exactly";
    YGMeasureMode[YGMeasureMode["AtMost"] = 2] = "AtMost";
})(YGMeasureMode || (YGMeasureMode = {}));
var YGNodeType;
(function (YGNodeType) {
    YGNodeType[YGNodeType["Default"] = 0] = "Default";
    YGNodeType[YGNodeType["Text"] = 1] = "Text";
})(YGNodeType || (YGNodeType = {}));
var YGOverflow;
(function (YGOverflow) {
    YGOverflow[YGOverflow["Visible"] = 0] = "Visible";
    YGOverflow[YGOverflow["Hidden"] = 1] = "Hidden";
    YGOverflow[YGOverflow["Scroll"] = 2] = "Scroll";
})(YGOverflow || (YGOverflow = {}));
var YGPositionType;
(function (YGPositionType) {
    YGPositionType[YGPositionType["Relative"] = 0] = "Relative";
    YGPositionType[YGPositionType["Absolute"] = 1] = "Absolute";
})(YGPositionType || (YGPositionType = {}));
var YGPrintOptions;
(function (YGPrintOptions) {
    YGPrintOptions[YGPrintOptions["Layout"] = 1] = "Layout";
    YGPrintOptions[YGPrintOptions["Style"] = 2] = "Style";
    YGPrintOptions[YGPrintOptions["Children"] = 4] = "Children";
})(YGPrintOptions || (YGPrintOptions = {}));
var YGUnit;
(function (YGUnit) {
    YGUnit[YGUnit["Undefined"] = 0] = "Undefined";
    YGUnit[YGUnit["Point"] = 1] = "Point";
    YGUnit[YGUnit["Percent"] = 2] = "Percent";
    YGUnit[YGUnit["Auto"] = 3] = "Auto";
})(YGUnit || (YGUnit = {}));
var YGWrap;
(function (YGWrap) {
    YGWrap[YGWrap["NoWrap"] = 0] = "NoWrap";
    YGWrap[YGWrap["Wrap"] = 1] = "Wrap";
    YGWrap[YGWrap["WrapReverse"] = 2] = "WrapReverse";
})(YGWrap || (YGWrap = {}));

export { YGAlign, YGDimension, YGDimensionCount, YGDirection, YGDisplay, YGEdge, YGEdgeCount, YGExperimentalFeature, YGFlexDirection, YGJustify, YGLogLevel, YGMeasureMode, YGMeasureModeCount, YGNodeType, YGOverflow, YGPositionType, YGPrintOptions, YGUnit, YGWrap };
//# sourceMappingURL=enums.js.map
