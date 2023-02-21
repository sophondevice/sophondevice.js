import { WebGLContext, CompareFunc } from '../base_types';
import { ColorState, BlendEquation, BlendFunc, BlendingState, FaceMode, RasterizerState, DepthState, StencilOp, StencilState, RenderStateSet } from '../render_states';
export declare abstract class WebGLRenderState {
    protected static _defaultState: WebGLRenderState;
    protected static _currentState: WebGLRenderState;
    apply(gl: WebGLContext, force?: boolean): void;
    static get defaultState(): WebGLRenderState;
    static applyDefaults(gl: WebGLContext, force?: boolean): void;
    protected abstract _apply(gl: WebGLContext): void;
}
export declare class WebGLColorState extends WebGLRenderState implements ColorState {
    protected static _defaultState: WebGLColorState;
    protected static _currentState: WebGLColorState;
    redMask: boolean;
    greenMask: boolean;
    blueMask: boolean;
    alphaMask: boolean;
    constructor();
    setColorMask(r: boolean, g: boolean, b: boolean, a: boolean): this;
    protected _apply(gl: WebGLContext): void;
}
export declare class WebGLBlendingState extends WebGLRenderState implements BlendingState {
    protected static _defaultState: WebGLBlendingState;
    protected static _currentState: WebGLBlendingState;
    private _srcBlendRGB;
    private _dstBlendRGB;
    private _srcBlendAlpha;
    private _dstBlendAlpha;
    private _rgbEquation;
    private _alphaEquation;
    enabled: boolean;
    constructor();
    get srcBlendRGB(): BlendFunc;
    set srcBlendRGB(val: BlendFunc);
    get dstBlendRGB(): BlendFunc;
    set dstBlendRGB(val: BlendFunc);
    get srcBlendAlpha(): BlendFunc;
    set srcBlendAlpha(val: BlendFunc);
    get dstBlendAlpha(): BlendFunc;
    set dstBlendAlpha(val: BlendFunc);
    get rgbEquation(): BlendEquation;
    set rgbEquation(val: BlendEquation);
    get alphaEquation(): BlendEquation;
    set alphaEquation(val: BlendEquation);
    enable(b: boolean): this;
    setBlendFunc(src: BlendFunc, dest: BlendFunc): this;
    setBlendFuncRGB(src: BlendFunc, dest: BlendFunc): this;
    setBlendFuncAlpha(src: BlendFunc, dest: BlendFunc): this;
    setBlendEquation(rgb: BlendEquation, alpha: BlendEquation): this;
    protected _apply(gl: WebGLContext): void;
}
export declare class WebGLRasterizerState extends WebGLRenderState implements RasterizerState {
    protected static _defaultState: WebGLRasterizerState;
    protected static _currentState: WebGLRasterizerState;
    private _cullMode;
    constructor();
    get cullMode(): FaceMode;
    set cullMode(val: FaceMode);
    setCullMode(mode: FaceMode): this;
    protected _apply(gl: WebGLContext): void;
}
export declare class WebGLDepthState extends WebGLRenderState implements DepthState {
    protected static _defaultState: WebGLDepthState;
    protected static _currentState: WebGLDepthState;
    testEnabled: boolean;
    writeEnabled: boolean;
    private _compareFunc;
    constructor();
    get compareFunc(): CompareFunc;
    set compareFunc(val: CompareFunc);
    enableTest(b: boolean): this;
    enableWrite(b: boolean): this;
    setCompareFunc(func: CompareFunc): this;
    protected _apply(gl: WebGLContext): void;
}
export declare class WebGLStencilState extends WebGLRenderState implements StencilState {
    protected static _defaultState: WebGLStencilState;
    protected static _currentState: WebGLStencilState;
    enabled: boolean;
    enableTwoSided: boolean;
    writeMask: number;
    writeMaskBack: number;
    ref: number;
    valueMask: number;
    valueMaskBack: number;
    private _failOp;
    private _failOpBack;
    private _zFailOp;
    private _zFailOpBack;
    private _passOp;
    private _passOpBack;
    private _func;
    private _funcBack;
    constructor();
    get failOp(): StencilOp;
    set failOp(val: StencilOp);
    get failOpBack(): StencilOp;
    set failOpBack(val: StencilOp);
    get zFailOp(): StencilOp;
    set zFailOp(val: StencilOp);
    get zFailOpBack(): StencilOp;
    set zFailOpBack(val: StencilOp);
    get passOp(): StencilOp;
    set passOp(val: StencilOp);
    get passOpBack(): StencilOp;
    set passOpBack(val: StencilOp);
    get func(): CompareFunc;
    set func(val: CompareFunc);
    get funcBack(): CompareFunc;
    set funcBack(val: CompareFunc);
    enable(b: boolean): this;
    enableStencilTwoside(b: boolean): this;
    setFrontWriteMask(mask: number): this;
    setBackWriteMask(mask: number): this;
    setFrontOp(fail: StencilOp, zfail: StencilOp, zpass: StencilOp): this;
    setBackOp(fail: StencilOp, zfail: StencilOp, zpass: StencilOp): this;
    setFrontCompareFunc(func: CompareFunc): this;
    setBackCompareFunc(func: CompareFunc): this;
    setReference(ref: number): this;
    setFrontValueMask(mask: number): this;
    setBackValueMask(mask: number): this;
    protected _apply(gl: WebGLContext): void;
}
export declare class WebGLRenderStateSet implements RenderStateSet {
    private _gl;
    private _colorState;
    private _blendingState;
    private _rasterizerState;
    private _depthState;
    private _stencilState;
    constructor(gl: WebGLContext);
    get colorState(): WebGLColorState;
    get blendingState(): WebGLBlendingState;
    get rasterizerState(): WebGLRasterizerState;
    get depthState(): WebGLDepthState;
    get stencilState(): WebGLStencilState;
    apply(overridden: WebGLRenderStateSet, force?: boolean): void;
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
    static applyDefaults(gl: WebGLContext, force?: boolean): void;
}
