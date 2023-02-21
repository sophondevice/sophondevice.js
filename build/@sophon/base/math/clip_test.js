/** sophon base library */
var BoxSide;
(function (BoxSide) {
    BoxSide[BoxSide["LEFT"] = 0] = "LEFT";
    BoxSide[BoxSide["RIGHT"] = 1] = "RIGHT";
    BoxSide[BoxSide["BOTTOM"] = 2] = "BOTTOM";
    BoxSide[BoxSide["TOP"] = 3] = "TOP";
    BoxSide[BoxSide["FRONT"] = 4] = "FRONT";
    BoxSide[BoxSide["BACK"] = 5] = "BACK";
})(BoxSide || (BoxSide = {}));
var ClipState;
(function (ClipState) {
    ClipState[ClipState["NOT_CLIPPED"] = 0] = "NOT_CLIPPED";
    ClipState[ClipState["A_INSIDE_B"] = 1] = "A_INSIDE_B";
    ClipState[ClipState["B_INSIDE_A"] = 2] = "B_INSIDE_A";
    ClipState[ClipState["CLIPPED"] = 2] = "CLIPPED";
})(ClipState || (ClipState = {}));

export { BoxSide, ClipState };
//# sourceMappingURL=clip_test.js.map
