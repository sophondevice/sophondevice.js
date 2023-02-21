/** sophon base library */
import { CompareFunc } from '../base_types.js';
import { WebGLEnum } from './webgl_enum.js';
import { BlendFunc, BlendEquation, FaceMode, StencilOp } from '../render_states.js';
import { blendFuncInvMap, blendFuncMap, blendEquationInvMap, blendEquationMap, faceModeInvMap, faceModeMap, compareFuncInvMap, compareFuncMap, stencilOpInvMap, stencilOpMap } from './constants_webgl.js';

class WebGLRenderState {
    static _defaultState;
    static _currentState;
    apply(gl, force) {
        const c = this.constructor;
        if (force || c._currentState !== this) {
            this._apply(gl);
        }
        c._currentState = this;
    }
    static get defaultState() {
        return WebGLRenderState._defaultState;
    }
    static applyDefaults(gl, force) {
        if (force || this._currentState !== this._defaultState) {
            this._defaultState.apply(gl, force);
        }
    }
}
class WebGLColorState extends WebGLRenderState {
    static _defaultState = new WebGLColorState();
    static _currentState = null;
    redMask;
    greenMask;
    blueMask;
    alphaMask;
    constructor() {
        super();
        this.redMask = this.greenMask = this.blueMask = this.alphaMask = true;
    }
    setColorMask(r, g, b, a) {
        this.redMask = r;
        this.greenMask = g;
        this.blueMask = b;
        this.alphaMask = a;
        return this;
    }
    _apply(gl) {
        gl.colorMask(this.redMask, this.greenMask, this.blueMask, this.alphaMask);
    }
}
class WebGLBlendingState extends WebGLRenderState {
    static _defaultState = new WebGLBlendingState();
    static _currentState = null;
    _srcBlendRGB;
    _dstBlendRGB;
    _srcBlendAlpha;
    _dstBlendAlpha;
    _rgbEquation;
    _alphaEquation;
    enabled;
    constructor() {
        super();
        this.enabled = false;
        this.srcBlendRGB = BlendFunc.ONE;
        this.dstBlendRGB = BlendFunc.ZERO;
        this.srcBlendAlpha = BlendFunc.ONE;
        this.dstBlendAlpha = BlendFunc.ZERO;
        this.rgbEquation = BlendEquation.ADD;
        this.alphaEquation = BlendEquation.ADD;
    }
    get srcBlendRGB() {
        return blendFuncInvMap[this._srcBlendRGB];
    }
    set srcBlendRGB(val) {
        this._srcBlendRGB = blendFuncMap[val];
    }
    get dstBlendRGB() {
        return blendFuncInvMap[this._dstBlendRGB];
    }
    set dstBlendRGB(val) {
        this._dstBlendRGB = blendFuncMap[val];
    }
    get srcBlendAlpha() {
        return blendFuncInvMap[this._srcBlendAlpha];
    }
    set srcBlendAlpha(val) {
        this._srcBlendAlpha = blendFuncMap[val];
    }
    get dstBlendAlpha() {
        return blendFuncInvMap[this._dstBlendAlpha];
    }
    set dstBlendAlpha(val) {
        this._dstBlendAlpha = blendFuncMap[val];
    }
    get rgbEquation() {
        return blendEquationInvMap[this._rgbEquation];
    }
    set rgbEquation(val) {
        this._rgbEquation = blendEquationMap[val];
    }
    get alphaEquation() {
        return blendEquationInvMap[this._alphaEquation];
    }
    set alphaEquation(val) {
        this._alphaEquation = blendEquationMap[val];
    }
    enable(b) {
        this.enabled = b;
        return this;
    }
    setBlendFunc(src, dest) {
        this.srcBlendRGB = src;
        this.dstBlendRGB = dest;
        this.srcBlendAlpha = src;
        this.dstBlendAlpha = dest;
        return this;
    }
    setBlendFuncRGB(src, dest) {
        this.srcBlendRGB = src;
        this.dstBlendRGB = dest;
        return this;
    }
    setBlendFuncAlpha(src, dest) {
        this.srcBlendAlpha = src;
        this.dstBlendAlpha = dest;
        return this;
    }
    setBlendEquation(rgb, alpha) {
        this.rgbEquation = rgb;
        this.alphaEquation = alpha;
        return this;
    }
    _apply(gl) {
        if (this.enabled) {
            gl.enable(WebGLEnum.BLEND);
            gl.blendEquationSeparate(this._rgbEquation, this._alphaEquation);
            if (this._srcBlendRGB === this._srcBlendAlpha && this._dstBlendRGB === this._dstBlendAlpha) {
                gl.blendFunc(this._srcBlendRGB, this._dstBlendRGB);
            }
            else {
                gl.blendFuncSeparate(this._srcBlendRGB, this._dstBlendRGB, this._srcBlendAlpha, this._dstBlendAlpha);
            }
        }
        else {
            gl.disable(WebGLEnum.BLEND);
        }
    }
}
class WebGLRasterizerState extends WebGLRenderState {
    static _defaultState = new WebGLRasterizerState();
    static _currentState = null;
    _cullMode;
    constructor() {
        super();
        this.cullMode = FaceMode.BACK;
    }
    get cullMode() {
        return faceModeInvMap[this._cullMode];
    }
    set cullMode(val) {
        this._cullMode = faceModeMap[val];
    }
    setCullMode(mode) {
        this.cullMode = mode;
        return this;
    }
    _apply(gl) {
        if (this.cullMode == FaceMode.NONE) {
            gl.disable(WebGLEnum.CULL_FACE);
        }
        else {
            gl.enable(WebGLEnum.CULL_FACE);
            gl.cullFace(this._cullMode);
        }
    }
}
class WebGLDepthState extends WebGLRenderState {
    static _defaultState = new WebGLDepthState();
    static _currentState = null;
    testEnabled;
    writeEnabled;
    _compareFunc;
    constructor() {
        super();
        this.testEnabled = true;
        this.writeEnabled = true;
        this.compareFunc = CompareFunc.LessEqual;
    }
    get compareFunc() {
        return compareFuncInvMap[this._compareFunc];
    }
    set compareFunc(val) {
        this._compareFunc = compareFuncMap[val];
    }
    enableTest(b) {
        this.testEnabled = b;
        return this;
    }
    enableWrite(b) {
        this.writeEnabled = b;
        return this;
    }
    setCompareFunc(func) {
        this.compareFunc = func;
        return this;
    }
    _apply(gl) {
        if (this.testEnabled) {
            gl.enable(WebGLEnum.DEPTH_TEST);
            gl.depthFunc(this._compareFunc);
        }
        else {
            gl.disable(WebGLEnum.DEPTH_TEST);
        }
        gl.depthMask(this.writeEnabled);
    }
}
class WebGLStencilState extends WebGLRenderState {
    static _defaultState = new WebGLStencilState();
    static _currentState = null;
    enabled;
    enableTwoSided;
    writeMask;
    writeMaskBack;
    ref;
    valueMask;
    valueMaskBack;
    _failOp;
    _failOpBack;
    _zFailOp;
    _zFailOpBack;
    _passOp;
    _passOpBack;
    _func;
    _funcBack;
    constructor() {
        super();
        this.enabled = false;
        this.enableTwoSided = false;
        this.writeMask = this.writeMaskBack = 0xffffffff;
        this.failOp = this.failOpBack = StencilOp.KEEP;
        this.zFailOp = this.zFailOpBack = StencilOp.KEEP;
        this.passOp = this.passOpBack = StencilOp.KEEP;
        this.func = this.funcBack = CompareFunc.Always;
        this.ref = 0;
        this.valueMask = this.valueMaskBack = 0xffffffff;
    }
    get failOp() {
        return stencilOpInvMap[this._failOp];
    }
    set failOp(val) {
        this._failOp = stencilOpMap[val];
    }
    get failOpBack() {
        return stencilOpInvMap[this._failOpBack];
    }
    set failOpBack(val) {
        this._failOpBack = stencilOpMap[val];
    }
    get zFailOp() {
        return stencilOpInvMap[this._zFailOp];
    }
    set zFailOp(val) {
        this._zFailOp = stencilOpMap[val];
    }
    get zFailOpBack() {
        return stencilOpInvMap[this._zFailOpBack];
    }
    set zFailOpBack(val) {
        this._zFailOpBack = stencilOpMap[val];
    }
    get passOp() {
        return stencilOpInvMap[this._passOp];
    }
    set passOp(val) {
        this._passOp = stencilOpMap[val];
    }
    get passOpBack() {
        return stencilOpInvMap[this._passOpBack];
    }
    set passOpBack(val) {
        this._passOpBack = stencilOpMap[val];
    }
    get func() {
        return compareFuncInvMap[this._func];
    }
    set func(val) {
        this._func = compareFuncMap[val];
    }
    get funcBack() {
        return compareFuncInvMap[this._funcBack];
    }
    set funcBack(val) {
        this._funcBack = compareFuncMap[val];
    }
    enable(b) {
        this.enabled = b;
        return this;
    }
    enableStencilTwoside(b) {
        this.enableTwoSided = b;
        return this;
    }
    setFrontWriteMask(mask) {
        this.writeMask = mask;
        return this;
    }
    setBackWriteMask(mask) {
        this.writeMaskBack = mask;
        return this;
    }
    setFrontOp(fail, zfail, zpass) {
        this.failOp = fail;
        this.zFailOp = zfail;
        this.passOp = zpass;
        return this;
    }
    setBackOp(fail, zfail, zpass) {
        this.failOpBack = fail;
        this.zFailOpBack = zfail;
        this.passOpBack = zpass;
        return this;
    }
    setFrontCompareFunc(func) {
        this.func = func;
        return this;
    }
    setBackCompareFunc(func) {
        this.funcBack = func;
        return this;
    }
    setReference(ref) {
        this.ref = ref;
        return this;
    }
    setFrontValueMask(mask) {
        this.valueMask = mask;
        return this;
    }
    setBackValueMask(mask) {
        this.valueMaskBack = mask;
        return this;
    }
    _apply(gl) {
        if (this.enabled) {
            gl.enable(WebGLEnum.STENCIL_TEST);
            if (this.enableTwoSided) {
                gl.stencilMaskSeparate(WebGLEnum.FRONT, this.writeMask);
                gl.stencilMaskSeparate(WebGLEnum.BACK, this.writeMaskBack);
                gl.stencilFuncSeparate(WebGLEnum.FRONT, this._func, this.ref, this.valueMask);
                gl.stencilFuncSeparate(WebGLEnum.BACK, this._funcBack, this.ref, this.valueMaskBack);
                gl.stencilOpSeparate(WebGLEnum.FRONT, this._failOp, this._zFailOp, this._passOp);
                gl.stencilOpSeparate(WebGLEnum.BACK, this._failOpBack, this._zFailOpBack, this._passOpBack);
            }
            else {
                gl.stencilMask(this.writeMask);
                gl.stencilFunc(this._func, this.ref, this.valueMask);
                gl.stencilOp(this._failOp, this._zFailOp, this._passOp);
            }
        }
        else {
            gl.disable(WebGLEnum.STENCIL_TEST);
        }
    }
}
class WebGLRenderStateSet {
    _gl;
    _colorState;
    _blendingState;
    _rasterizerState;
    _depthState;
    _stencilState;
    constructor(gl) {
        this._gl = gl;
        this.defaultColorState();
        this.defaultBlendingState();
        this.defaultRasterizerState();
        this.defaultDepthState();
        this.defaultStencilState();
    }
    get colorState() {
        return this._colorState;
    }
    get blendingState() {
        return this._blendingState;
    }
    get rasterizerState() {
        return this._rasterizerState;
    }
    get depthState() {
        return this._depthState;
    }
    get stencilState() {
        return this._stencilState;
    }
    apply(overridden, force) {
        const gl = this._gl;
        if (overridden?._colorState) {
            overridden._colorState.apply(gl, force);
        }
        else if (this._colorState) {
            this._colorState.apply(gl, force);
        }
        else {
            WebGLColorState.applyDefaults(gl, force);
        }
        if (overridden?._blendingState) {
            overridden._blendingState.apply(gl, force);
        }
        else if (this._blendingState) {
            this._blendingState.apply(gl, force);
        }
        else {
            WebGLBlendingState.applyDefaults(gl, force);
        }
        if (overridden?._rasterizerState) {
            overridden._rasterizerState.apply(gl, force);
        }
        else if (this._rasterizerState) {
            this._rasterizerState.apply(gl, force);
        }
        else {
            WebGLRasterizerState.applyDefaults(gl, force);
        }
        if (overridden?._depthState) {
            overridden._depthState.apply(gl, force);
        }
        else if (this._depthState) {
            this._depthState.apply(gl, force);
        }
        else {
            WebGLDepthState.applyDefaults(gl, force);
        }
        if (overridden?._stencilState) {
            overridden._stencilState.apply(gl, force);
        }
        else if (this._stencilState) {
            this._stencilState.apply(gl, force);
        }
        else {
            WebGLStencilState.applyDefaults(gl, force);
        }
    }
    useColorState() {
        if (!this._colorState) {
            this._colorState = new WebGLColorState();
        }
        return this._colorState;
    }
    defaultColorState() {
        this._colorState = null;
    }
    useBlendingState() {
        if (!this._blendingState) {
            this._blendingState = new WebGLBlendingState();
        }
        return this._blendingState;
    }
    defaultBlendingState() {
        this._blendingState = null;
    }
    useRasterizerState() {
        if (!this._rasterizerState) {
            this._rasterizerState = new WebGLRasterizerState();
        }
        return this._rasterizerState;
    }
    defaultRasterizerState() {
        this._rasterizerState = null;
    }
    useDepthState() {
        if (!this._depthState) {
            this._depthState = new WebGLDepthState();
        }
        return this._depthState;
    }
    defaultDepthState() {
        this._depthState = null;
    }
    useStencilState() {
        if (!this._stencilState) {
            this._stencilState = new WebGLStencilState();
        }
        return this._stencilState;
    }
    defaultStencilState() {
        this._stencilState = null;
    }
    static applyDefaults(gl, force) {
        WebGLColorState.applyDefaults(gl, force);
        WebGLBlendingState.applyDefaults(gl, force);
        WebGLRasterizerState.applyDefaults(gl, force);
        WebGLDepthState.applyDefaults(gl, force);
        WebGLStencilState.applyDefaults(gl, force);
    }
}

export { WebGLBlendingState, WebGLColorState, WebGLDepthState, WebGLRasterizerState, WebGLRenderState, WebGLRenderStateSet, WebGLStencilState };
//# sourceMappingURL=renderstate_webgl.js.map
