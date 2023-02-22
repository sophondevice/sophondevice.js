import type { VertexSemantic } from "../gpuobject";
export interface ShaderExpTagRecord {
    [name: string]: ShaderExpTagValue;
}
export type ShaderExpTagValue = string[] | string | ShaderExpTagRecord;
export type ShaderTypeFunc = {
    (...args: any[]): PBShaderExp;
    ptr: ShaderTypeFunc;
    [dim: number]: ShaderTypeFunc;
};
export declare abstract class Proxiable<T> {
    constructor();
    get $thisProxy(): T;
}
export declare class PBShaderExp extends Proxiable<PBShaderExp> {
    [name: string]: any;
    uniform(group: number): PBShaderExp;
    workgroup(): PBShaderExp;
    storage(group: number): PBShaderExp;
    attrib(attr: VertexSemantic): PBShaderExp;
    tag(...args: ShaderExpTagValue[]): PBShaderExp;
    sampleType(type: 'float' | 'unfilterable-float' | 'sint' | 'uint' | 'depth'): PBShaderExp;
    at(index: number | PBShaderExp): PBShaderExp;
    setAt(index: number | PBShaderExp, val: number | boolean | PBShaderExp): void;
    highp(): PBShaderExp;
    mediump(): PBShaderExp;
    lowp(): PBShaderExp;
    isVector(): boolean;
    numComponents(): number;
    getTypeName(): string;
}
