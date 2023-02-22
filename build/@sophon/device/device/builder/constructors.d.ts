import { TextureFormat } from '../base_types';
import { PBShaderExp } from './base';
declare const StorageTextureFormatMap: {
    rgba8unorm: TextureFormat;
    rgba8snorm: TextureFormat;
    rgba8uint: TextureFormat;
    rgba8sint: TextureFormat;
    rgba16uint: TextureFormat;
    rgba16sint: TextureFormat;
    rgba16float: TextureFormat;
    r32float: TextureFormat;
    r32uint: TextureFormat;
    r32sint: TextureFormat;
    rg32float: TextureFormat;
    rg32uint: TextureFormat;
    rg32sint: TextureFormat;
    rgba32float: TextureFormat;
    rgba32uint: TextureFormat;
    rgba32sint: TextureFormat;
};
export type StorageTextureConstructor = {
    [k in keyof typeof StorageTextureFormatMap]: (s?: string) => PBShaderExp;
};
export {};
