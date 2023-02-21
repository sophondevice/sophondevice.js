import { CompareFunc, TextureFilter } from '../base_types';
import { WebGLEnum } from './webgl_enum';
import { BlendEquation, BlendFunc, FaceMode, FaceWinding, StencilOp } from '../render_states';
export declare const blendEquationMap: {
    1: WebGLEnum;
    2: WebGLEnum;
    3: WebGLEnum;
    5: WebGLEnum;
    4: WebGLEnum;
};
export declare const blendEquationInvMap: {
    32774: BlendEquation;
    32778: BlendEquation;
    32779: BlendEquation;
    32776: BlendEquation;
    32775: BlendEquation;
};
export declare const blendFuncMap: {
    1: WebGLEnum;
    2: WebGLEnum;
    3: WebGLEnum;
    4: WebGLEnum;
    5: WebGLEnum;
    6: WebGLEnum;
    7: WebGLEnum;
    8: WebGLEnum;
    9: WebGLEnum;
    10: WebGLEnum;
    11: WebGLEnum;
    12: WebGLEnum;
    13: WebGLEnum;
    14: WebGLEnum;
    15: WebGLEnum;
};
export declare const blendFuncInvMap: {
    0: BlendFunc;
    1: BlendFunc;
    770: BlendFunc;
    771: BlendFunc;
    776: BlendFunc;
    772: BlendFunc;
    773: BlendFunc;
    768: BlendFunc;
    769: BlendFunc;
    774: BlendFunc;
    775: BlendFunc;
    32769: BlendFunc;
    32770: BlendFunc;
    32771: BlendFunc;
    32772: BlendFunc;
};
export declare const faceModeMap: {
    1: WebGLEnum;
    2: WebGLEnum;
    3: WebGLEnum;
};
export declare const faceModeInvMap: {
    0: FaceMode[];
    1028: FaceMode[];
    1029: FaceMode[];
};
export declare const faceWindingMap: {
    1: WebGLEnum;
    2: WebGLEnum;
};
export declare const faceWindingInvMap: {
    2304: FaceWinding[];
    2305: FaceWinding[];
};
export declare const stencilOpMap: {
    1: WebGLEnum;
    2: WebGLEnum;
    3: WebGLEnum;
    4: WebGLEnum;
    5: WebGLEnum;
    6: WebGLEnum;
    7: WebGLEnum;
    8: WebGLEnum;
};
export declare const stencilOpInvMap: {
    7680: StencilOp;
    0: StencilOp;
    7681: StencilOp;
    7682: StencilOp;
    34055: StencilOp;
    7683: StencilOp;
    34056: StencilOp;
    5386: StencilOp;
};
export declare const compareFuncMap: {
    0: WebGLEnum;
    1: WebGLEnum;
    2: WebGLEnum;
    3: WebGLEnum;
    4: WebGLEnum;
    5: WebGLEnum;
    6: WebGLEnum;
    7: WebGLEnum;
    8: WebGLEnum;
};
export declare const compareFuncInvMap: {
    0: CompareFunc;
    519: CompareFunc;
    515: CompareFunc;
    518: CompareFunc;
    513: CompareFunc;
    516: CompareFunc;
    514: CompareFunc;
    517: CompareFunc;
    512: CompareFunc;
};
export declare const textureWrappingMap: {
    1: WebGLEnum;
    2: WebGLEnum;
    3: WebGLEnum;
};
export declare const typeMap: {
    [x: number]: WebGLEnum;
};
export declare const primitiveTypeMap: {
    0: WebGLEnum;
    1: WebGLEnum;
    2: WebGLEnum;
    3: WebGLEnum;
    4: WebGLEnum;
    5: WebGLEnum;
};
export declare const textureTargetMap: {
    1: WebGLEnum;
    2: WebGLEnum;
    3: WebGLEnum;
    4: WebGLEnum;
};
export declare const CompareModeMap: {
    0: WebGLEnum;
    1: WebGLEnum;
};
export declare const cubeMapFaceMap: {
    0: WebGLEnum;
    1: WebGLEnum;
    2: WebGLEnum;
    3: WebGLEnum;
    4: WebGLEnum;
    5: WebGLEnum;
};
export declare function textureMagFilterToWebGL(magFilter: TextureFilter): WebGLEnum.POINTS | WebGLEnum.NEAREST | WebGLEnum.LINEAR;
export declare function textureMinFilterToWebGL(minFilter: TextureFilter, mipFilter: TextureFilter): WebGLEnum.POINTS | WebGLEnum.NEAREST | WebGLEnum.LINEAR | WebGLEnum.NEAREST_MIPMAP_NEAREST | WebGLEnum.LINEAR_MIPMAP_NEAREST | WebGLEnum.NEAREST_MIPMAP_LINEAR | WebGLEnum.LINEAR_MIPMAP_LINEAR;
