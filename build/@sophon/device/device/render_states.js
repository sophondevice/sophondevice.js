/** sophon base library */
var BlendEquation;
(function (BlendEquation) {
    BlendEquation[BlendEquation["ADD"] = 1] = "ADD";
    BlendEquation[BlendEquation["SUBTRACT"] = 2] = "SUBTRACT";
    BlendEquation[BlendEquation["REVERSE_SUBTRACT"] = 3] = "REVERSE_SUBTRACT";
    BlendEquation[BlendEquation["MIN"] = 4] = "MIN";
    BlendEquation[BlendEquation["MAX"] = 5] = "MAX";
})(BlendEquation || (BlendEquation = {}));
var BlendFunc;
(function (BlendFunc) {
    BlendFunc[BlendFunc["ZERO"] = 1] = "ZERO";
    BlendFunc[BlendFunc["ONE"] = 2] = "ONE";
    BlendFunc[BlendFunc["SRC_ALPHA"] = 3] = "SRC_ALPHA";
    BlendFunc[BlendFunc["INV_SRC_ALPHA"] = 4] = "INV_SRC_ALPHA";
    BlendFunc[BlendFunc["SRC_ALPHA_SATURATE"] = 5] = "SRC_ALPHA_SATURATE";
    BlendFunc[BlendFunc["DST_ALPHA"] = 6] = "DST_ALPHA";
    BlendFunc[BlendFunc["INV_DST_ALPHA"] = 7] = "INV_DST_ALPHA";
    BlendFunc[BlendFunc["SRC_COLOR"] = 8] = "SRC_COLOR";
    BlendFunc[BlendFunc["INV_SRC_COLOR"] = 9] = "INV_SRC_COLOR";
    BlendFunc[BlendFunc["DST_COLOR"] = 10] = "DST_COLOR";
    BlendFunc[BlendFunc["INV_DST_COLOR"] = 11] = "INV_DST_COLOR";
    BlendFunc[BlendFunc["CONSTANT_COLOR"] = 12] = "CONSTANT_COLOR";
    BlendFunc[BlendFunc["INV_CONSTANT_COLOR"] = 13] = "INV_CONSTANT_COLOR";
    BlendFunc[BlendFunc["CONSTANT_ALPHA"] = 14] = "CONSTANT_ALPHA";
    BlendFunc[BlendFunc["INV_CONSTANT_ALPHA"] = 15] = "INV_CONSTANT_ALPHA";
})(BlendFunc || (BlendFunc = {}));
var FaceMode;
(function (FaceMode) {
    FaceMode[FaceMode["NONE"] = 1] = "NONE";
    FaceMode[FaceMode["FRONT"] = 2] = "FRONT";
    FaceMode[FaceMode["BACK"] = 3] = "BACK";
})(FaceMode || (FaceMode = {}));
var FaceWinding;
(function (FaceWinding) {
    FaceWinding[FaceWinding["CW"] = 1] = "CW";
    FaceWinding[FaceWinding["CCW"] = 2] = "CCW";
})(FaceWinding || (FaceWinding = {}));
var StencilOp;
(function (StencilOp) {
    StencilOp[StencilOp["KEEP"] = 1] = "KEEP";
    StencilOp[StencilOp["ZERO"] = 2] = "ZERO";
    StencilOp[StencilOp["REPLACE"] = 3] = "REPLACE";
    StencilOp[StencilOp["INCR"] = 4] = "INCR";
    StencilOp[StencilOp["INCR_WRAP"] = 5] = "INCR_WRAP";
    StencilOp[StencilOp["DECR"] = 6] = "DECR";
    StencilOp[StencilOp["DECR_WRAP"] = 7] = "DECR_WRAP";
    StencilOp[StencilOp["INVERT"] = 8] = "INVERT";
})(StencilOp || (StencilOp = {}));

export { BlendEquation, BlendFunc, FaceMode, FaceWinding, StencilOp };
//# sourceMappingURL=render_states.js.map
