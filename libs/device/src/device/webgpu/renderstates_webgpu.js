import { CompareFunc } from '../base_types';
import { BlendEquation, BlendFunc, FaceMode, StencilOp } from '../render_states';
export class WebGPURenderState {
    static _defaultState;
    _hash;
    static get defaultState() {
        return this._defaultState;
    }
    constructor() {
        this._hash = null;
    }
    get hash() {
        return this._getHash(this.constructor);
    }
    invalidateHash() {
        this._hash = null;
    }
    _getHash(ctor) {
        if (this === ctor.defaultState) {
            return '';
        }
        else {
            if (this._hash === null) {
                this._hash = this.computeHash();
            }
            return this._hash;
        }
    }
}
export class WebGPUColorState extends WebGPURenderState {
    static _defaultState = new WebGPUColorState();
    _redMask;
    _greenMask;
    _blueMask;
    _alphaMask;
    constructor() {
        super();
        this._redMask = this._greenMask = this._blueMask = this._alphaMask = true;
    }
    get redMask() {
        return this._redMask;
    }
    set redMask(val) {
        if (this._redMask !== !!val) {
            this._redMask = !!val;
            this.invalidateHash();
        }
    }
    get greenMask() {
        return this._greenMask;
    }
    set greenMask(val) {
        if (this._greenMask !== !!val) {
            this._greenMask = !!val;
            this.invalidateHash();
        }
    }
    get blueMask() {
        return this._blueMask;
    }
    set blueMask(val) {
        if (this._blueMask !== !!val) {
            this._blueMask = !!val;
            this.invalidateHash();
        }
    }
    get alphaMask() {
        return this._alphaMask;
    }
    set alphaMask(val) {
        if (this._alphaMask !== !!val) {
            this._alphaMask = !!val;
            this.invalidateHash();
        }
    }
    setColorMask(r, g, b, a) {
        this.redMask = r;
        this.greenMask = g;
        this.blueMask = b;
        this.alphaMask = a;
        return this;
    }
    computeHash() {
        let val = 0;
        if (this.redMask) {
            val += (1 << 0);
        }
        if (this.greenMask) {
            val += (1 << 1);
        }
        if (this.blueMask) {
            val += (1 << 2);
        }
        if (this.alphaMask) {
            val += (1 << 3);
        }
        return String(val);
    }
}
export class WebGPUBlendingState extends WebGPURenderState {
    static _defaultState = new WebGPUBlendingState();
    _enabled;
    _srcBlendRGB;
    _dstBlendRGB;
    _srcBlendAlpha;
    _dstBlendAlpha;
    _rgbEquation;
    _alphaEquation;
    constructor() {
        super();
        this._enabled = false;
        this._srcBlendRGB = BlendFunc.ONE;
        this._dstBlendRGB = BlendFunc.ZERO;
        this._srcBlendAlpha = BlendFunc.ONE;
        this._dstBlendAlpha = BlendFunc.ZERO;
        this._rgbEquation = BlendEquation.ADD;
        this._alphaEquation = BlendEquation.ADD;
    }
    get enabled() {
        return this._enabled;
    }
    set enabled(val) {
        if (this._enabled !== !!val) {
            this._enabled = !!val;
            this.invalidateHash();
        }
    }
    get srcBlendRGB() {
        return this._srcBlendRGB;
    }
    set srcBlendRGB(val) {
        if (this._srcBlendRGB !== val) {
            this._srcBlendRGB = val;
            this.invalidateHash();
        }
    }
    get srcBlendAlpha() {
        return this._srcBlendAlpha;
    }
    set srcBlendAlpha(val) {
        if (this._srcBlendAlpha !== val) {
            this._srcBlendAlpha = val;
            this.invalidateHash();
        }
    }
    get dstBlendRGB() {
        return this._dstBlendRGB;
    }
    set dstBlendRGB(val) {
        if (this._dstBlendRGB !== val) {
            this._dstBlendRGB = val;
            this.invalidateHash();
        }
    }
    get dstBlendAlpha() {
        return this._dstBlendAlpha;
    }
    set dstBlendAlpha(val) {
        if (this._dstBlendAlpha !== val) {
            this._dstBlendAlpha = val;
            this.invalidateHash();
        }
    }
    get rgbEquation() {
        return this._rgbEquation;
    }
    set rgbEquation(val) {
        if (this._rgbEquation !== val) {
            this._rgbEquation = val;
            this.invalidateHash();
        }
    }
    get alphaEquation() {
        return this._alphaEquation;
    }
    set alphaEquation(val) {
        if (this._alphaEquation !== val) {
            this._alphaEquation = val;
            this.invalidateHash();
        }
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
    computeHash() {
        return this._enabled
            ? `${this._srcBlendRGB}-${this._srcBlendAlpha}-${this._dstBlendRGB}-${this._dstBlendAlpha}-${this._rgbEquation}-${this._alphaEquation}`
            : '';
    }
}
export class WebGPURasterizerState extends WebGPURenderState {
    static _defaultState = new WebGPURasterizerState();
    _cullMode;
    constructor() {
        super();
        this._cullMode = FaceMode.BACK;
    }
    get cullMode() {
        return this._cullMode;
    }
    set cullMode(val) {
        if (this._cullMode !== val) {
            this._cullMode = val;
            this.invalidateHash();
        }
    }
    setCullMode(mode) {
        this.cullMode = mode;
        return this;
    }
    computeHash() {
        return `${this._cullMode}`;
    }
}
export class WebGPUDepthState extends WebGPURenderState {
    static _defaultState = new WebGPUDepthState();
    _testEnabled;
    _writeEnabled;
    _compareFunc;
    constructor() {
        super();
        this._testEnabled = true;
        this._writeEnabled = true;
        this._compareFunc = CompareFunc.LessEqual;
    }
    get testEnabled() {
        return this._testEnabled;
    }
    set testEnabled(val) {
        if (this._testEnabled !== !!val) {
            this._testEnabled = val;
            this.invalidateHash();
        }
    }
    get writeEnabled() {
        return this._writeEnabled;
    }
    set writeEnabled(val) {
        if (this._writeEnabled !== !!val) {
            this._writeEnabled = val;
            this.invalidateHash();
        }
    }
    get compareFunc() {
        return this._compareFunc;
    }
    set compareFunc(val) {
        if (this._compareFunc !== val) {
            this._compareFunc = val;
            this.invalidateHash();
        }
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
    computeHash() {
        return `${Number(this._testEnabled)}-${Number(this._writeEnabled)}-${this.compareFunc}}`;
    }
}
export class WebGPUStencilState extends WebGPURenderState {
    static _defaultState = new WebGPUStencilState();
    _enabled;
    _enableTwoSided;
    _writeMask;
    _writeMaskBack;
    _failOp;
    _failOpBack;
    _zFailOp;
    _zFailOpBack;
    _passOp;
    _passOpBack;
    _func;
    _funcBack;
    _ref;
    _valueMask;
    _valueMaskBack;
    constructor() {
        super();
        this._enabled = false;
        this._enableTwoSided = false;
        this._writeMask = this.writeMaskBack = 0xffffffff;
        this._failOp = this.failOpBack = StencilOp.KEEP;
        this._zFailOp = this.zFailOpBack = StencilOp.KEEP;
        this._passOp = this.passOpBack = StencilOp.KEEP;
        this._func = this.funcBack = CompareFunc.Always;
        this._ref = 0;
        this._valueMask = this.valueMaskBack = 0xffffffff;
    }
    get enabled() {
        return this._enabled;
    }
    set enabled(val) {
        if (this._enabled !== !!val) {
            this._enabled = !!val;
            this.invalidateHash();
        }
    }
    get enableTwoSided() {
        return this._enableTwoSided;
    }
    set enableTwoSided(val) {
        if (this._enableTwoSided !== !!val) {
            this._enableTwoSided = !!val;
            this.invalidateHash();
        }
    }
    get writeMask() {
        return this._writeMask;
    }
    set writeMask(val) {
        if (this._writeMask !== val) {
            this._writeMask = val;
            this.invalidateHash();
        }
    }
    get writeMaskBack() {
        return this._writeMaskBack;
    }
    set writeMaskBack(val) {
        if (this._writeMaskBack !== val) {
            this._writeMaskBack = val;
            this.invalidateHash();
        }
    }
    get failOp() {
        return this._failOp;
    }
    set failOp(val) {
        if (this._failOp !== val) {
            this._failOp = val;
            this.invalidateHash();
        }
    }
    get failOpBack() {
        return this._failOpBack;
    }
    set failOpBack(val) {
        if (this._failOpBack !== val) {
            this._failOpBack = val;
            this.invalidateHash();
        }
    }
    get zFailOp() {
        return this._zFailOp;
    }
    set zFailOp(val) {
        if (this._zFailOp !== val) {
            this._zFailOp = val;
            this.invalidateHash();
        }
    }
    get zFailOpBack() {
        return this._zFailOpBack;
    }
    set zFailOpBack(val) {
        if (this._zFailOpBack !== val) {
            this._zFailOpBack = val;
            this.invalidateHash();
        }
    }
    get passOp() {
        return this._passOp;
    }
    set passOp(val) {
        if (this._passOp !== val) {
            this._passOp = val;
            this.invalidateHash();
        }
    }
    get passOpBack() {
        return this._passOpBack;
    }
    set passOpBack(val) {
        if (this._passOpBack !== val) {
            this._passOpBack = val;
            this.invalidateHash();
        }
    }
    get func() {
        return this._func;
    }
    set func(val) {
        if (this._func !== val) {
            this._func = val;
            this.invalidateHash();
        }
    }
    get funcBack() {
        return this._funcBack;
    }
    set funcBack(val) {
        if (this._funcBack !== val) {
            this._funcBack = val;
            this.invalidateHash();
        }
    }
    get ref() {
        return this._ref;
    }
    set ref(val) {
        if (this._ref !== val) {
            this._ref = val;
            this.invalidateHash();
        }
    }
    get valueMask() {
        return this._valueMask;
    }
    set valueMask(val) {
        if (this._valueMask !== val) {
            this._valueMask = val;
            this.invalidateHash();
        }
    }
    get valueMaskBack() {
        return this._valueMaskBack;
    }
    set valueMaskBack(val) {
        if (this._valueMaskBack !== val) {
            this._valueMaskBack = val;
            this.invalidateHash();
        }
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
    setFrontOp(fail, zfail, pass) {
        this.failOp = fail;
        this.zFailOp = zfail;
        this.passOp = pass;
        return this;
    }
    setBackOp(fail, zfail, pass) {
        this.failOpBack = fail;
        this.zFailOpBack = zfail;
        this.passOpBack = pass;
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
    computeHash() {
        return this._enabled ?
            this._enableTwoSided
                ? `${this.sideHash(false)}-${this.sideHash(true)}`
                : `${this.sideHash(false)}`
            : '';
    }
    sideHash(back) {
        return back
            ? `${this._failOpBack}-${this._zFailOpBack}-${this._passOpBack}-${this._funcBack}-${this._valueMaskBack}-${this._writeMaskBack}`
            : `${this._failOp}-${this._zFailOp}-${this._passOp}-${this._func}-${this._valueMask}-${this._writeMask}`;
    }
}
export class WebGPURenderStateSet {
    _device;
    _colorState;
    _blendingState;
    _rasterizerState;
    _depthState;
    _stencilState;
    constructor(device) {
        this._device = device;
        this.defaultColorState();
        this.defaultBlendingState();
        this.defaultRasterizerState();
        this.defaultDepthState();
        this.defaultStencilState();
    }
    get hash() {
        return `${this._colorState?.hash || ''}:${this._blendingState?.hash || ''}:${this._rasterizerState?.hash || ''}:${this.depthState?.hash || ''}:${this._stencilState?.hash || ''}`;
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
    useColorState() {
        if (!this._colorState) {
            this._colorState = new WebGPUColorState();
        }
        return this._colorState;
    }
    defaultColorState() {
        this._colorState = null;
    }
    useBlendingState() {
        if (!this._blendingState) {
            this._blendingState = new WebGPUBlendingState();
        }
        return this._blendingState;
    }
    defaultBlendingState() {
        this._blendingState = null;
    }
    useRasterizerState() {
        if (!this._rasterizerState) {
            this._rasterizerState = new WebGPURasterizerState();
        }
        return this._rasterizerState;
    }
    defaultRasterizerState() {
        this._rasterizerState = null;
    }
    useDepthState() {
        if (!this._depthState) {
            this._depthState = new WebGPUDepthState();
        }
        return this._depthState;
    }
    defaultDepthState() {
        this._depthState = null;
    }
    useStencilState() {
        if (!this._stencilState) {
            this._stencilState = new WebGPUStencilState();
        }
        return this._stencilState;
    }
    defaultStencilState() {
        this._stencilState = null;
    }
    apply(overridden, force) {
        this._device.setRenderStates(this);
        this._device.setRenderStatesOverridden(overridden);
    }
}
//# sourceMappingURL=renderstates_webgpu.js.map