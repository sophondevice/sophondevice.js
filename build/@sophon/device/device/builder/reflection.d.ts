import type { PBGlobalScope, ProgramBuilder } from './programbuilder';
import type { PBShaderExp } from './base';
export type PBReflectionTagGetter = (scope: PBGlobalScope) => PBShaderExp;
export declare class PBReflection {
    constructor(builder: ProgramBuilder);
    get vertexAttributes(): number[];
    hasVertexAttribute(attrib: number): boolean;
    clear(): void;
    tag(name: string): PBShaderExp;
    tag(name: string, getter: PBReflectionTagGetter): void;
    tag(values: Record<string, PBReflectionTagGetter>): void;
    attribute(attrib: number): PBShaderExp;
}
