import { CompareFunc } from './base_types';
export interface ColorState {
    redMask: boolean;
    greenMask: boolean;
    blueMask: boolean;
    alphaMask: boolean;
    setColorMask(r: boolean, g: boolean, b: boolean, a: boolean): this;
}
export declare enum BlendEquation {
    ADD = 1,
    SUBTRACT = 2,
    REVERSE_SUBTRACT = 3,
    MIN = 4,
    MAX = 5
}
export declare enum BlendFunc {
    ZERO = 1,
    ONE = 2,
    SRC_ALPHA = 3,
    INV_SRC_ALPHA = 4,
    SRC_ALPHA_SATURATE = 5,
    DST_ALPHA = 6,
    INV_DST_ALPHA = 7,
    SRC_COLOR = 8,
    INV_SRC_COLOR = 9,
    DST_COLOR = 10,
    INV_DST_COLOR = 11,
    CONSTANT_COLOR = 12,
    INV_CONSTANT_COLOR = 13,
    CONSTANT_ALPHA = 14,
    INV_CONSTANT_ALPHA = 15
}
export interface BlendingState {
    enabled: boolean;
    srcBlendRGB: BlendFunc;
    dstBlendRGB: BlendFunc;
    srcBlendAlpha: BlendFunc;
    dstBlendAlpha: BlendFunc;
    rgbEquation: BlendEquation;
    alphaEquation: BlendEquation;
    enable(b: boolean): this;
    setBlendFunc(src: BlendFunc, dest: BlendFunc): this;
    setBlendFuncRGB(src: BlendFunc, dest: BlendFunc): this;
    setBlendFuncAlpha(src: BlendFunc, dest: BlendFunc): this;
    setBlendEquation(rgb: BlendEquation, alpha: BlendEquation): this;
}
export declare enum FaceMode {
    NONE = 1,
    FRONT = 2,
    BACK = 3
}
export declare enum FaceWinding {
    CW = 1,
    CCW = 2
}
export interface RasterizerState {
    cullMode: FaceMode;
    setCullMode(mode: FaceMode): this;
}
export interface DepthState {
    testEnabled: boolean;
    writeEnabled: boolean;
    compareFunc: CompareFunc;
    enableTest(b: boolean): this;
    enableWrite(b: boolean): this;
    setCompareFunc(func: CompareFunc): this;
}
export declare enum StencilOp {
    KEEP = 1,
    ZERO = 2,
    REPLACE = 3,
    INCR = 4,
    INCR_WRAP = 5,
    DECR = 6,
    DECR_WRAP = 7,
    INVERT = 8
}
export interface StencilState {
    enabled: boolean;
    enableTwoSided: boolean;
    writeMask: number;
    writeMaskBack: number;
    failOp: StencilOp;
    failOpBack: StencilOp;
    zFailOp: StencilOp;
    zFailOpBack: StencilOp;
    passOp: StencilOp;
    passOpBack: StencilOp;
    func: CompareFunc;
    funcBack: CompareFunc;
    ref: number;
    valueMask: number;
    valueMaskBack: number;
    enable(b: boolean): this;
    enableStencilTwoside(b: boolean): this;
    setFrontWriteMask(mask: number): this;
    setBackWriteMask(mask: number): this;
    setFrontOp(fail: StencilOp, zfail: StencilOp, pass: StencilOp): this;
    setBackOp(fail: StencilOp, zfail: StencilOp, pass: StencilOp): this;
    setFrontCompareFunc(func: CompareFunc): this;
    setBackCompareFunc(func: CompareFunc): this;
    setReference(ref: number): this;
    setFrontValueMask(mask: number): this;
    setBackValueMask(mask: number): this;
}
export interface RenderStateSet {
    readonly colorState: ColorState;
    readonly blendingState: BlendingState;
    readonly rasterizerState: RasterizerState;
    readonly depthState: DepthState;
    readonly stencilState: StencilState;
    useColorState(): ColorState;
    defaultColorState(): void;
    useBlendingState(): BlendingState;
    defaultBlendingState(): void;
    useRasterizerState(): RasterizerState;
    defaultRasterizerState(): void;
    useDepthState(): DepthState;
    defaultDepthState(): void;
    useStencilState(): StencilState;
    defaultStencilState(): void;
    apply(overridden: RenderStateSet, force?: boolean): void;
}
