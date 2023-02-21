import type { BindGroup, FrameBuffer, GPUProgram, Texture2D, Texture2DArray, TextureCube, TextureSampler } from '../../device/gpuobject';
import type { PBGlobalScope, PBInsideFunctionScope, PBShaderExp } from "../../device/builder";
export type BlitType = '2d' | '2d-array' | 'cube';
export type BlitProgramInfo = {
    program: GPUProgram;
    bindGroup: BindGroup;
};
export declare abstract class Blitter {
    constructor();
    get hash(): string;
    invalidateHash(): void;
    readTexel(scope: PBInsideFunctionScope, type: BlitType, srcTex: PBShaderExp, srcUV: PBShaderExp, srcLayer: PBShaderExp): PBShaderExp;
    writeTexel(scope: PBInsideFunctionScope, type: BlitType, srcUV: PBShaderExp, texel: PBShaderExp): PBShaderExp;
    setup(scope: PBGlobalScope, type: BlitType): void;
    setUniforms(bindGroup: BindGroup): void;
    abstract filter(scope: PBInsideFunctionScope, type: BlitType, srcTex: PBShaderExp, srcUV: PBShaderExp, srcLayer: PBShaderExp): PBShaderExp;
    blit(source: Texture2D, dest: Texture2D | FrameBuffer, sampler?: TextureSampler): void;
    blit(source: Texture2D, dest: Texture2DArray, layer: number, sampler?: TextureSampler): void;
    blit(source: Texture2DArray, dest: Texture2DArray, sampler?: TextureSampler): void;
    blit(source: Texture2DArray, dest: Texture2D | FrameBuffer, layer: number, sampler?: TextureSampler): void;
    blit(source: TextureCube, dest: TextureCube, sampler?: TextureSampler): void;
    blit(source: TextureCube, dest: Texture2D | FrameBuffer, layer: number, sampler?: TextureSampler): void;
}
