import { ShaderType } from '../base_types';
import { GPUProgram, BindGroupLayout } from '../gpuobject';
import { PBReflection } from './reflection';
import { PBShaderExp, ShaderTypeFunc } from './base';
import { PBStructLayout, PBStructTypeInfo } from './types';
import type { DeviceType, Device } from '../device';
import type { StorageTextureConstructor } from './constructors';
export type ExpValueNonArrayType = number | boolean | PBShaderExp;
export type ExpValueType = ExpValueNonArrayType | Array<ExpValueType>;
export declare namespace ProgramBuilder {
    type VertexAttribSet = {
        [attrib: number]: PBShaderExp;
    };
    type VaryingSet = {
        [name: string]: PBShaderExp;
    };
    type ColorOutputs = PBShaderExp[];
    type BuildRenderResult = [string, string, BindGroupLayout[], number[]];
    type BuildComputeResult = [string, BindGroupLayout[]];
    type RenderOptions = {
        label?: string;
        vertex: (this: PBGlobalScope) => void;
        fragment: (this: PBGlobalScope) => void;
    };
    type ComputeOptions = {
        label?: string;
        workgroupSize: [number, number, number];
        compute: (this: PBGlobalScope) => void;
    };
}
export interface ProgramBuilder {
    float: {
        (): PBShaderExp;
        (rhs: number): PBShaderExp;
        (rhs: boolean): PBShaderExp;
        (rhs: PBShaderExp): PBShaderExp;
        (name: string): PBShaderExp;
        ptr: ShaderTypeFunc;
        [dim: number]: ShaderTypeFunc;
    };
    int: {
        (): PBShaderExp;
        (rhs: number | boolean | PBShaderExp | string): PBShaderExp;
        ptr: ShaderTypeFunc;
        [dim: number]: ShaderTypeFunc;
    };
    uint: {
        (): PBShaderExp;
        (rhs: number | boolean | PBShaderExp | string): PBShaderExp;
        ptr: ShaderTypeFunc;
        [dim: number]: ShaderTypeFunc;
    };
    bool: {
        (): PBShaderExp;
        (rhs: number | boolean | PBShaderExp | string): PBShaderExp;
        ptr: ShaderTypeFunc;
        [dim: number]: ShaderTypeFunc;
    };
    vec2: {
        (): PBShaderExp;
        (rhs: number | PBShaderExp | string): PBShaderExp;
        (x: number | PBShaderExp, y: number | PBShaderExp): PBShaderExp;
        ptr: ShaderTypeFunc;
        [dim: number]: ShaderTypeFunc;
    };
    ivec2: {
        (): PBShaderExp;
        (rhs: number | PBShaderExp | string): PBShaderExp;
        (x: number | PBShaderExp, y: number | PBShaderExp): PBShaderExp;
        ptr: ShaderTypeFunc;
        [dim: number]: ShaderTypeFunc;
    };
    uvec2: {
        (): PBShaderExp;
        (rhs: number | PBShaderExp | string): PBShaderExp;
        (x: number | PBShaderExp, y: number | PBShaderExp): PBShaderExp;
        ptr: ShaderTypeFunc;
        [dim: number]: ShaderTypeFunc;
    };
    bvec2: {
        (): PBShaderExp;
        (rhs: number | boolean | PBShaderExp | string): PBShaderExp;
        (x: number | boolean | PBShaderExp, y: number | boolean | PBShaderExp): PBShaderExp;
        ptr: ShaderTypeFunc;
        [dim: number]: ShaderTypeFunc;
    };
    vec3: {
        (): PBShaderExp;
        (name: string): PBShaderExp;
        (x: number | PBShaderExp): PBShaderExp;
        (x: number | PBShaderExp, y: number | PBShaderExp, z: number | PBShaderExp): PBShaderExp;
        (x: number | PBShaderExp, yz: PBShaderExp): PBShaderExp;
        (xy: PBShaderExp, z: number | PBShaderExp): PBShaderExp;
        ptr: ShaderTypeFunc;
        [dim: number]: ShaderTypeFunc;
    };
    ivec3: {
        (): PBShaderExp;
        (name: string): PBShaderExp;
        (x: number | PBShaderExp): PBShaderExp;
        (x: number | PBShaderExp, y: number | PBShaderExp, z: number | PBShaderExp): PBShaderExp;
        (x: number | PBShaderExp, yz: PBShaderExp): PBShaderExp;
        (xy: PBShaderExp, z: number | PBShaderExp): PBShaderExp;
        ptr: ShaderTypeFunc;
        [dim: number]: ShaderTypeFunc;
    };
    uvec3: {
        (): PBShaderExp;
        (name: string): PBShaderExp;
        (x: number | PBShaderExp): PBShaderExp;
        (x: number | PBShaderExp, y: number | PBShaderExp, z: number | PBShaderExp): PBShaderExp;
        (x: number | PBShaderExp, yz: PBShaderExp): PBShaderExp;
        (xy: PBShaderExp, z: number | PBShaderExp): PBShaderExp;
        ptr: ShaderTypeFunc;
        [dim: number]: ShaderTypeFunc;
    };
    bvec3: {
        (): PBShaderExp;
        (name: string): PBShaderExp;
        (x: boolean | PBShaderExp): PBShaderExp;
        (x: boolean | PBShaderExp, y: boolean | PBShaderExp, z: boolean | PBShaderExp): PBShaderExp;
        (x: boolean | PBShaderExp, yz: PBShaderExp): PBShaderExp;
        (xy: PBShaderExp, z: boolean | PBShaderExp): PBShaderExp;
        ptr: ShaderTypeFunc;
        [dim: number]: ShaderTypeFunc;
    };
    vec4: {
        (): PBShaderExp;
        (name: string): PBShaderExp;
        (x: number | PBShaderExp): PBShaderExp;
        (x: number | PBShaderExp, y: number | PBShaderExp, z: number | PBShaderExp, w: number | PBShaderExp): PBShaderExp;
        (x: number | PBShaderExp, y: number | PBShaderExp, zw: PBShaderExp): PBShaderExp;
        (x: number | PBShaderExp, yz: PBShaderExp, w: number | PBShaderExp): PBShaderExp;
        (x: number | PBShaderExp, yzw: PBShaderExp): PBShaderExp;
        (xy: PBShaderExp, z: number | PBShaderExp, w: number | PBShaderExp): PBShaderExp;
        (xy: PBShaderExp, zw: PBShaderExp): PBShaderExp;
        (xyz: PBShaderExp, w: number | PBShaderExp): PBShaderExp;
        ptr: ShaderTypeFunc;
        [dim: number]: ShaderTypeFunc;
    };
    ivec4: {
        (): PBShaderExp;
        (name: string): PBShaderExp;
        (x: number | PBShaderExp): PBShaderExp;
        (x: number | PBShaderExp, y: number | PBShaderExp, z: number | PBShaderExp, w: number | PBShaderExp): PBShaderExp;
        (x: number | PBShaderExp, y: number | PBShaderExp, zw: PBShaderExp): PBShaderExp;
        (x: number | PBShaderExp, yz: PBShaderExp, w: number | PBShaderExp): PBShaderExp;
        (x: number | PBShaderExp, yzw: PBShaderExp): PBShaderExp;
        (xy: PBShaderExp, z: number | PBShaderExp, w: number | PBShaderExp): PBShaderExp;
        (xy: PBShaderExp, zw: PBShaderExp): PBShaderExp;
        (xyz: PBShaderExp, w: number | PBShaderExp): PBShaderExp;
        ptr: ShaderTypeFunc;
        [dim: number]: ShaderTypeFunc;
    };
    uvec4: {
        (): PBShaderExp;
        (name: string): PBShaderExp;
        (x: number | PBShaderExp): PBShaderExp;
        (x: number | PBShaderExp, y: number | PBShaderExp, z: number | PBShaderExp, w: number | PBShaderExp): PBShaderExp;
        (x: number | PBShaderExp, y: number | PBShaderExp, zw: PBShaderExp): PBShaderExp;
        (x: number | PBShaderExp, yz: PBShaderExp, w: number | PBShaderExp): PBShaderExp;
        (x: number | PBShaderExp, yzw: PBShaderExp): PBShaderExp;
        (xy: PBShaderExp, z: number | PBShaderExp, w: number | PBShaderExp): PBShaderExp;
        (xy: PBShaderExp, zw: PBShaderExp): PBShaderExp;
        (xyz: PBShaderExp, w: number | PBShaderExp): PBShaderExp;
        ptr: ShaderTypeFunc;
        [dim: number]: ShaderTypeFunc;
    };
    bvec4: {
        (): PBShaderExp;
        (name: string): PBShaderExp;
        (x: boolean | PBShaderExp): PBShaderExp;
        (x: boolean | PBShaderExp, y: boolean | PBShaderExp, z: boolean | PBShaderExp, w: boolean | PBShaderExp): PBShaderExp;
        (x: boolean | PBShaderExp, y: boolean | PBShaderExp, zw: PBShaderExp): PBShaderExp;
        (x: boolean | PBShaderExp, yz: PBShaderExp, w: boolean | PBShaderExp): PBShaderExp;
        (x: boolean | PBShaderExp, yzw: PBShaderExp): PBShaderExp;
        (xy: PBShaderExp, z: boolean | PBShaderExp, w: boolean | PBShaderExp): PBShaderExp;
        (xy: PBShaderExp, zw: PBShaderExp): PBShaderExp;
        (xyz: PBShaderExp, w: boolean | PBShaderExp): PBShaderExp;
        ptr: ShaderTypeFunc;
        [dim: number]: ShaderTypeFunc;
    };
    mat2: {
        (): PBShaderExp;
        (name: string): PBShaderExp;
        (m00: number | PBShaderExp, m01: number | PBShaderExp, m10: number | PBShaderExp, m11: number | PBShaderExp): PBShaderExp;
        (m0: PBShaderExp, m1: PBShaderExp): PBShaderExp;
        ptr: ShaderTypeFunc;
        [dim: number]: ShaderTypeFunc;
    };
    mat2x3: {
        (): PBShaderExp;
        (name: string): PBShaderExp;
        (m00: number | PBShaderExp, m01: number | PBShaderExp, m02: number | PBShaderExp, m10: number | PBShaderExp, m11: number | PBShaderExp, m12: number | PBShaderExp): PBShaderExp;
        (m0: PBShaderExp, m1: PBShaderExp): PBShaderExp;
        ptr: ShaderTypeFunc;
        [dim: number]: ShaderTypeFunc;
    };
    mat2x4: {
        (): PBShaderExp;
        (name: string): PBShaderExp;
        (m00: number | PBShaderExp, m01: number | PBShaderExp, m02: number | PBShaderExp, m03: number | PBShaderExp, m10: number | PBShaderExp, m11: number | PBShaderExp, m12: number | PBShaderExp, m13: number | PBShaderExp): PBShaderExp;
        (m0: PBShaderExp, m1: PBShaderExp): PBShaderExp;
        ptr: ShaderTypeFunc;
        [dim: number]: ShaderTypeFunc;
    };
    mat3: {
        (): PBShaderExp;
        (name: string): PBShaderExp;
        (m00: number | PBShaderExp, m01: number | PBShaderExp, m02: number | PBShaderExp, m10: number | PBShaderExp, m11: number | PBShaderExp, m12: number | PBShaderExp, m20: number | PBShaderExp, m21: number | PBShaderExp, m22: number | PBShaderExp): PBShaderExp;
        (m0: PBShaderExp, m1: PBShaderExp, m2: PBShaderExp): PBShaderExp;
        ptr: ShaderTypeFunc;
        [dim: number]: ShaderTypeFunc;
    };
    mat3x2: {
        (): PBShaderExp;
        (name: string): PBShaderExp;
        (m00: number | PBShaderExp, m01: number | PBShaderExp, m10: number | PBShaderExp, m11: number | PBShaderExp, m20: number | PBShaderExp, m21: number | PBShaderExp): PBShaderExp;
        (m0: PBShaderExp, m1: PBShaderExp, m2: PBShaderExp): PBShaderExp;
        ptr: ShaderTypeFunc;
        [dim: number]: ShaderTypeFunc;
    };
    mat3x4: {
        (): PBShaderExp;
        (name: string): PBShaderExp;
        (m00: number | PBShaderExp, m01: number | PBShaderExp, m02: number | PBShaderExp, m03: number | PBShaderExp, m10: number | PBShaderExp, m11: number | PBShaderExp, m12: number | PBShaderExp, m13: number | PBShaderExp, m20: number | PBShaderExp, m21: number | PBShaderExp, m22: number | PBShaderExp, m23: number | PBShaderExp): PBShaderExp;
        (m0: PBShaderExp, m1: PBShaderExp, m2: PBShaderExp): PBShaderExp;
        ptr: ShaderTypeFunc;
        [dim: number]: ShaderTypeFunc;
    };
    mat4: {
        (): PBShaderExp;
        (name: string): PBShaderExp;
        (m00: number | PBShaderExp, m01: number | PBShaderExp, m02: number | PBShaderExp, m03: number | PBShaderExp, m10: number | PBShaderExp, m11: number | PBShaderExp, m12: number | PBShaderExp, m13: number | PBShaderExp, m20: number | PBShaderExp, m21: number | PBShaderExp, m22: number | PBShaderExp, m23: number | PBShaderExp, m30: number | PBShaderExp, m31: number | PBShaderExp, m32: number | PBShaderExp, m33: number | PBShaderExp): PBShaderExp;
        (m0: PBShaderExp, m1: PBShaderExp, m2: PBShaderExp, m3: PBShaderExp): PBShaderExp;
        ptr: ShaderTypeFunc;
        [dim: number]: ShaderTypeFunc;
    };
    mat4x2: {
        (): PBShaderExp;
        (name: string): PBShaderExp;
        (m00: number | PBShaderExp, m01: number | PBShaderExp, m10: number | PBShaderExp, m11: number | PBShaderExp, m20: number | PBShaderExp, m21: number | PBShaderExp, m30: number | PBShaderExp, m31: number | PBShaderExp): PBShaderExp;
        (m0: PBShaderExp, m1: PBShaderExp, m2: PBShaderExp, m3: PBShaderExp): PBShaderExp;
        ptr: ShaderTypeFunc;
        [dim: number]: ShaderTypeFunc;
    };
    mat4x3: {
        (): PBShaderExp;
        (name: string): PBShaderExp;
        (m00: number | PBShaderExp, m01: number | PBShaderExp, m02: number | PBShaderExp, m10: number | PBShaderExp, m11: number | PBShaderExp, m12: number | PBShaderExp, m20: number | PBShaderExp, m21: number | PBShaderExp, m22: number | PBShaderExp, m30: number | PBShaderExp, m31: number | PBShaderExp, m32: number | PBShaderExp): PBShaderExp;
        (m0: PBShaderExp, m1: PBShaderExp, m2: PBShaderExp, m3: PBShaderExp): PBShaderExp;
        ptr: ShaderTypeFunc;
        [dim: number]: ShaderTypeFunc;
    };
    tex1D(rhs?: string): PBShaderExp;
    tex2D(rhs?: string): PBShaderExp;
    tex3D(rhs?: string): PBShaderExp;
    texCube(rhs?: string): PBShaderExp;
    texExternal(rhs?: string): PBShaderExp;
    tex2DShadow(rhs?: string): PBShaderExp;
    texCubeShadow(rhs?: string): PBShaderExp;
    tex2DArray(rhs?: string): PBShaderExp;
    tex2DArrayShadow(rhs?: string): PBShaderExp;
    itex1D(rhs?: string): PBShaderExp;
    itex2D(rhs?: string): PBShaderExp;
    itex3D(rhs?: string): PBShaderExp;
    itexCube(rhs?: string): PBShaderExp;
    itex2DArray(rhs?: string): PBShaderExp;
    utex1D(rhs?: string): PBShaderExp;
    utex2D(rhs?: string): PBShaderExp;
    utex3D(rhs?: string): PBShaderExp;
    utexCube(rhs?: string): PBShaderExp;
    utex2DArray(rhs?: string): PBShaderExp;
    texStorage1D: StorageTextureConstructor;
    texStorage2D: StorageTextureConstructor;
    texStorage2DArray: StorageTextureConstructor;
    texStorage3D: StorageTextureConstructor;
    sampler(rhs?: string): PBShaderExp;
    samplerComparison(rhs?: string): PBShaderExp;
    radians(val: number | PBShaderExp): PBShaderExp;
    degrees(val: number | PBShaderExp): PBShaderExp;
    sin(val: number | PBShaderExp): PBShaderExp;
    cos(val: number | PBShaderExp): PBShaderExp;
    tan(val: number | PBShaderExp): PBShaderExp;
    asin(val: number | PBShaderExp): PBShaderExp;
    acos(val: number | PBShaderExp): PBShaderExp;
    atan(val: number | PBShaderExp): PBShaderExp;
    atan2(y: number | PBShaderExp, x: number | PBShaderExp): PBShaderExp;
    sinh(val: number | PBShaderExp): PBShaderExp;
    cosh(val: number | PBShaderExp): PBShaderExp;
    tanh(val: number | PBShaderExp): PBShaderExp;
    asinh(val: number | PBShaderExp): PBShaderExp;
    acosh(val: number | PBShaderExp): PBShaderExp;
    atanh(val: number | PBShaderExp): PBShaderExp;
    pow(x: number | PBShaderExp, y: number | PBShaderExp): PBShaderExp;
    exp(val: number | PBShaderExp): PBShaderExp;
    exp2(val: number | PBShaderExp): PBShaderExp;
    log(val: number | PBShaderExp): PBShaderExp;
    log2(val: number | PBShaderExp): PBShaderExp;
    sqrt(val: number | PBShaderExp): PBShaderExp;
    inverseSqrt(val: number | PBShaderExp): PBShaderExp;
    abs(val: number | PBShaderExp): PBShaderExp;
    sign(val: number | PBShaderExp): PBShaderExp;
    floor(val: number | PBShaderExp): PBShaderExp;
    ceil(val: number | PBShaderExp): PBShaderExp;
    fract(val: number | PBShaderExp): PBShaderExp;
    mod(x: number | PBShaderExp, y: number | PBShaderExp): PBShaderExp;
    fma(x: number | PBShaderExp, y: number | PBShaderExp, z: number | PBShaderExp): PBShaderExp;
    round(val: number | PBShaderExp): PBShaderExp;
    trunc(val: number | PBShaderExp): PBShaderExp;
    min(x: number | PBShaderExp, y: number | PBShaderExp): PBShaderExp;
    max(x: number | PBShaderExp, y: number | PBShaderExp): PBShaderExp;
    clamp(x: number | PBShaderExp, y: number | PBShaderExp, z: number | PBShaderExp): PBShaderExp;
    mix(x: number | PBShaderExp, y: number | PBShaderExp, z: number | PBShaderExp): PBShaderExp;
    step(x: number | PBShaderExp, y: number | PBShaderExp): PBShaderExp;
    smoothStep(x: number | PBShaderExp, y: number | PBShaderExp, z: number | PBShaderExp): PBShaderExp;
    isnan(x: number | PBShaderExp): PBShaderExp;
    isinf(x: number | PBShaderExp): PBShaderExp;
    add_2(x: number | PBShaderExp, y: number | PBShaderExp): any;
    add(x: number | PBShaderExp, ...rest: (number | PBShaderExp)[]): any;
    sub(x: number | PBShaderExp, y: number | PBShaderExp): any;
    mul_2(x: number | PBShaderExp, y: number | PBShaderExp): any;
    mul(x: number | PBShaderExp, ...rest: (number | PBShaderExp)[]): any;
    div(x: number | PBShaderExp, y: number | PBShaderExp): any;
    length(x: number | PBShaderExp): PBShaderExp;
    distance(x: number | PBShaderExp, y: number | PBShaderExp): PBShaderExp;
    dot(x: PBShaderExp, y: PBShaderExp): PBShaderExp;
    cross(x: PBShaderExp, y: PBShaderExp): PBShaderExp;
    normalize(x: PBShaderExp): PBShaderExp;
    faceForward(x: PBShaderExp, y: PBShaderExp, z: PBShaderExp): PBShaderExp;
    reflect(x: PBShaderExp, y: PBShaderExp): PBShaderExp;
    refract(x: PBShaderExp, y: PBShaderExp, z: number | PBShaderExp): PBShaderExp;
    frexp(x: number | PBShaderExp): PBShaderExp;
    outerProduct(x: PBShaderExp, y: PBShaderExp): PBShaderExp;
    transpose(mat: PBShaderExp): PBShaderExp;
    determinant(mat: PBShaderExp): PBShaderExp;
    inverse(mat: PBShaderExp): PBShaderExp;
    lessThan(x: number | PBShaderExp, y: number | PBShaderExp): PBShaderExp;
    lessThanEqual(x: number | PBShaderExp, y: number | PBShaderExp): PBShaderExp;
    greaterThan(x: number | PBShaderExp, y: number | PBShaderExp): PBShaderExp;
    greaterThanEqual(x: number | PBShaderExp, y: number | PBShaderExp): PBShaderExp;
    compEqual(x: PBShaderExp, y: PBShaderExp): PBShaderExp;
    compNotEqual(x: PBShaderExp, y: PBShaderExp): PBShaderExp;
    equal(x: PBShaderExp | number, y: PBShaderExp | number): PBShaderExp;
    notEqual(x: PBShaderExp | number, y: PBShaderExp | number): PBShaderExp;
    and_2(x: PBShaderExp | number | boolean, y: PBShaderExp | number | boolean): PBShaderExp;
    and(x: PBShaderExp | number | boolean, ...rest: (PBShaderExp | number | boolean)[]): any;
    compAnd(x: PBShaderExp | number | boolean, y: PBShaderExp | number | boolean): PBShaderExp;
    or(x: PBShaderExp | number | boolean, y: PBShaderExp | number | boolean): PBShaderExp;
    compOr(x: PBShaderExp | number | boolean, y: PBShaderExp | number | boolean): PBShaderExp;
    any(x: PBShaderExp): PBShaderExp;
    all(x: PBShaderExp): PBShaderExp;
    not(x: boolean | PBShaderExp): PBShaderExp;
    neg(x: number | PBShaderExp): PBShaderExp;
    arrayLength(x: PBShaderExp): PBShaderExp;
    select(x: number | PBShaderExp, y: number | PBShaderExp, cond: boolean | PBShaderExp): PBShaderExp;
    floatBitsToInt(x: number | PBShaderExp): PBShaderExp;
    floatBitsToUint(x: number | PBShaderExp): PBShaderExp;
    intBitsToFloat(x: number | PBShaderExp): PBShaderExp;
    uintBitsToFloat(x: number | PBShaderExp): PBShaderExp;
    pack4x8snorm(x: PBShaderExp): PBShaderExp;
    unpack4x8snorm(x: number | PBShaderExp): PBShaderExp;
    pack4x8unorm(x: PBShaderExp): PBShaderExp;
    unpack4x8unorm(x: number | PBShaderExp): PBShaderExp;
    pack2x16snorm(x: PBShaderExp): PBShaderExp;
    unpack2x16snorm(x: number | PBShaderExp): PBShaderExp;
    pack2x16unorm(x: PBShaderExp): PBShaderExp;
    unpack2x16unorm(x: number | PBShaderExp): PBShaderExp;
    pack2x16float(x: PBShaderExp): PBShaderExp;
    unpack2x16float(x: number | PBShaderExp): PBShaderExp;
    matrixCompMult(x: PBShaderExp, y: PBShaderExp): PBShaderExp;
    dpdx(x: PBShaderExp): PBShaderExp;
    dpdy(x: PBShaderExp): PBShaderExp;
    fwidth(x: PBShaderExp): PBShaderExp;
    dpdxCoarse(x: PBShaderExp): PBShaderExp;
    dpdxFine(x: PBShaderExp): PBShaderExp;
    dpdyCoarse(x: PBShaderExp): PBShaderExp;
    dpdyFine(x: PBShaderExp): PBShaderExp;
    textureDimensions(tex: PBShaderExp, level?: number | PBShaderExp): PBShaderExp;
    textureGather(tex: PBShaderExp, sampler: PBShaderExp, coords: PBShaderExp): PBShaderExp;
    textureGather(component: number | PBShaderExp, tex: PBShaderExp, sampler: PBShaderExp, coords: PBShaderExp): PBShaderExp;
    textureArrayGather(tex: PBShaderExp, sampler: PBShaderExp, coords: PBShaderExp, arrayIndex: number | PBShaderExp): PBShaderExp;
    textureArrayGather(component: number | PBShaderExp, tex: PBShaderExp, sampler: PBShaderExp, coords: PBShaderExp, arrayIndex: number | PBShaderExp): PBShaderExp;
    textureGatherCompare(tex: PBShaderExp, samplerCompare: PBShaderExp, coords: PBShaderExp, depthRef: number | PBShaderExp): PBShaderExp;
    textureArrayGatherCompare(tex: PBShaderExp, samplerCompare: PBShaderExp, coords: PBShaderExp, arrayIndex: number | PBShaderExp, depthRef: number | PBShaderExp): PBShaderExp;
    textureLoad(tex: PBShaderExp, coords: number | PBShaderExp, levelOrSampleIndex: number | PBShaderExp): PBShaderExp;
    textureArrayLoad(tex: PBShaderExp, coords: number | PBShaderExp, arrayIndex: number | PBShaderExp, level: number | PBShaderExp): PBShaderExp;
    textureStore(tex: PBShaderExp, coords: number | PBShaderExp, value: PBShaderExp): void;
    textureArrayStore(tex: PBShaderExp, coords: PBShaderExp, arrayIndex: number | PBShaderExp, value: PBShaderExp): void;
    textureNumLayers(tex: PBShaderExp): PBShaderExp;
    textureNumLevels(tex: PBShaderExp): PBShaderExp;
    textureNumSamples(tex: PBShaderExp): PBShaderExp;
    textureSample(tex: PBShaderExp, coords: number | PBShaderExp): PBShaderExp;
    textureArraySample(tex: PBShaderExp, coords: PBShaderExp, arrayIndex: number | PBShaderExp): PBShaderExp;
    textureSampleBias(tex: PBShaderExp, coords: PBShaderExp, bias: number | PBShaderExp): PBShaderExp;
    textureArraySampleBias(tex: PBShaderExp, coords: PBShaderExp, arrayIndex: number | PBShaderExp, bias: number | PBShaderExp): PBShaderExp;
    textureSampleCompare(tex: PBShaderExp, coords: PBShaderExp, depthRef: number | PBShaderExp): PBShaderExp;
    textureArraySampleCompare(tex: PBShaderExp, coords: PBShaderExp, arrayIndex: number | PBShaderExp, depthRef: number | PBShaderExp): PBShaderExp;
    textureSampleLevel(tex: PBShaderExp, coords: PBShaderExp): PBShaderExp;
    textureSampleLevel(tex: PBShaderExp, coords: PBShaderExp, level: number | PBShaderExp): PBShaderExp;
    textureArraySampleLevel(tex: PBShaderExp, coords: PBShaderExp, arrayIndex: number | PBShaderExp, level: number | PBShaderExp): PBShaderExp;
    textureSampleCompareLevel(tex: PBShaderExp, coords: PBShaderExp, depthRef: number | PBShaderExp): PBShaderExp;
    textureArraySampleCompareLevel(tex: PBShaderExp, coords: PBShaderExp, arrayIndex: number | PBShaderExp, depthRef: number | PBShaderExp): PBShaderExp;
    textureSampleGrad(tex: PBShaderExp, coords: PBShaderExp, ddx: PBShaderExp, ddy: PBShaderExp): PBShaderExp;
    textureArraySampleGrad(tex: PBShaderExp, coords: PBShaderExp, arrayIndex: number | PBShaderExp, ddx: PBShaderExp, ddy: PBShaderExp): PBShaderExp;
    storageBarrier(): void;
    workgroupBarrier(): void;
}
export declare class ProgramBuilder {
    constructor(device: Device | DeviceType);
    get lastError(): string;
    get shaderType(): ShaderType;
    get globalScope(): PBGlobalScope;
    get builtinScope(): PBBuiltinScope;
    get inputScope(): PBInputScope;
    get outputScope(): PBOutputScope;
    get depthRangeCorrection(): boolean;
    set depthRangeCorrection(val: boolean);
    get emulateDepthClamp(): boolean;
    set emulateDepthClamp(val: boolean);
    get reflection(): PBReflection;
    get device(): Device;
    reset(): void;
    queryGlobal(name: string): PBShaderExp;
    isVertexShader(): boolean;
    isFragmentShader(): boolean;
    isComputeShader(): boolean;
    pushScope(scope: PBScope): void;
    popScope(): PBScope;
    currentScope(): PBScope;
    buildRender(options: ProgramBuilder.RenderOptions): ProgramBuilder.BuildRenderResult;
    buildCompute(options: ProgramBuilder.ComputeOptions): ProgramBuilder.BuildComputeResult;
    buildRenderProgram(options: ProgramBuilder.RenderOptions): GPUProgram;
    buildComputeProgram(options: ProgramBuilder.ComputeOptions): GPUProgram;
    getDeviceType(): DeviceType;
    addressOf(ref: PBShaderExp): PBShaderExp;
    referenceOf(ptr: PBShaderExp): PBShaderExp;
    struct(structName: string, instanceName: string): PBShaderExp;
    defineStruct(structName: string, layout: PBStructLayout, ...args: PBShaderExp[]): ShaderTypeFunc;
    defineStructByType(structType: PBStructTypeInfo): ShaderTypeFunc;
    discard(): void;
}
declare abstract class Proxiable<T> {
    constructor();
    get $thisProxy(): T;
}
export declare class PBScope extends Proxiable<PBScope> {
    [props: string]: any;
    get $builder(): ProgramBuilder;
    get $builtins(): PBBuiltinScope;
    get $inputs(): PBInputScope;
    get $outputs(): PBOutputScope;
    $getVertexAttrib(loc: number): PBShaderExp;
    get $l(): PBLocalScope;
    get $g(): PBGlobalScope;
    $local(variable: PBShaderExp, init?: ExpValueType): void;
    $touch(exp: PBShaderExp): void;
    $query(name: string): PBShaderExp;
}
export declare class PBLocalScope extends PBScope {
    [props: string]: any;
    constructor(scope: PBScope);
}
export interface PBBuiltinScope {
    position: PBShaderExp;
    pointSize: PBShaderExp;
    fragDepth: PBShaderExp;
    readonly fragCoord: PBShaderExp;
    readonly frontFacing: PBShaderExp;
    readonly vertexIndex: PBShaderExp;
    readonly instanceIndex: PBShaderExp;
    readonly localInvocationId: PBShaderExp;
    readonly globalInvocationId: PBShaderExp;
    readonly workGroupId: PBShaderExp;
    readonly numWorkGroups: PBShaderExp;
    readonly sampleMaskIn: PBShaderExp;
    sampleMaskOut: PBShaderExp;
    readonly sampleIndex: PBShaderExp;
}
export declare class PBBuiltinScope extends PBScope {
    constructor();
}
export declare class PBInputScope extends PBScope {
    constructor();
}
export declare class PBOutputScope extends PBScope {
    constructor();
}
export declare class PBGlobalScope extends PBScope {
    constructor();
    $mainFunc(this: PBGlobalScope, body?: (this: PBFunctionScope) => void): void;
    $function(this: PBGlobalScope, name: string, params: PBShaderExp[], body?: (this: PBFunctionScope) => void): void;
}
export declare class PBInsideFunctionScope extends PBScope {
    $return(retval?: ExpValueType): void;
    $scope(body: (this: PBInsideFunctionScope) => void): PBInsideFunctionScope;
    $if(condition: ExpValueNonArrayType, body: (this: PBIfScope) => void): PBIfScope;
    $break(): void;
    $continue(): void;
    $for(counter: PBShaderExp, init: number | PBShaderExp, count: number | PBShaderExp, body: (this: PBForScope) => void): void;
    $do(body: (this: PBDoWhileScope) => void): PBDoWhileScope;
    $while(condition: ExpValueNonArrayType, body: (this: PBWhileScope) => void): void;
}
export declare class PBFunctionScope extends PBInsideFunctionScope {
}
export declare class PBWhileScope extends PBInsideFunctionScope {
}
export declare class PBDoWhileScope extends PBInsideFunctionScope {
    $while(condition: ExpValueNonArrayType): void;
}
export declare class PBForScope extends PBInsideFunctionScope {
}
export declare class PBNakedScope extends PBInsideFunctionScope {
}
export declare class PBIfScope extends PBInsideFunctionScope {
    $elseif(condition: ExpValueNonArrayType, body: (this: PBIfScope) => void): PBIfScope;
    $else(body: (this: PBIfScope) => void): void;
}
export {};
