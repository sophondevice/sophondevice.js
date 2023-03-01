import type { CompareFunc } from './base_types';

export interface ColorState {
  redMask: boolean;
  greenMask: boolean;
  blueMask: boolean;
  alphaMask: boolean;
  setColorMask(r: boolean, g: boolean, b: boolean, a: boolean): this;
}

export type BlendEquation = 'add' | 'subtract' | 'reverse-subtract' | 'min' | 'max';
export type BlendFunc =
  | 'zero'
  | 'one'
  | 'src-alpha'
  | 'inv-src-alpha'
  | 'src-alpha-saturate'
  | 'dst-alpha'
  | 'inv-dst-alpha'
  | 'src-color'
  | 'inv-src-color'
  | 'dst-color'
  | 'inv-dst-color'
  | 'const-color'
  | 'inv-const-color'
  | 'const-alpha'
  | 'inv-const-alpha';

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

export type FaceMode = 'none'|'front'|'back';
export type FaceWinding = 'cw'|'ccw';

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

export type StencilOp = 'keep'|'zero'|'replace'|'incr'|'incr-wrap'|'decr'|'decr-wrap'|'invert';

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
