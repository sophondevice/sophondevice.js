/// <reference types="dist" />
import { TextureFormat } from '../base_types';
export declare const textureWrappingMap: {
    [k: number]: GPUAddressMode;
};
export declare const textureFilterMap: {
    [k: number]: GPUFilterMode;
};
export declare const compareFuncMap: {
    [k: number]: GPUCompareFunction;
};
export declare const stencilOpMap: {
    [k: number]: GPUStencilOperation;
};
export declare const primitiveTypeMap: {
    [k: number]: GPUPrimitiveTopology;
};
export declare const faceWindingMap: {
    [k: number]: GPUFrontFace;
};
export declare const faceModeMap: {
    [k: number]: GPUCullMode;
};
export declare const blendEquationMap: {
    [k: number]: GPUBlendOperation;
};
export declare const blendFuncMap: {
    [k: number]: GPUBlendFactor;
};
export declare const vertexFormatToHash: {
    [fmt: string]: string;
};
export declare const textureFormatMap: {
    [fmt: number]: GPUTextureFormat;
};
export declare const textureFormatInvMap: {
    [k: string]: TextureFormat;
};
export declare const hashToVertexFormat: {
    [hash: string]: string;
};
