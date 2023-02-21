import { TextureFormat } from '../base_types';
import { DeviceType } from '../device';
import type { UniformBufferLayout } from '../gpuobject';
export declare const F16_BITMASK = 1;
export declare const F32_BITMASK = 2;
export declare const BOOL_BITMASK = 3;
export declare const I8_BITMASK = 4;
export declare const I16_BITMASK = 5;
export declare const I32_BITMASK = 6;
export declare const U8_BITMASK = 7;
export declare const U16_BITMASK = 8;
export declare const U32_BITMASK = 9;
export declare const SCALAR_TYPE_BITMASK = 15;
export declare const ROWS_BITMASK = 7;
export declare const ROWS_BITSHIFT = 4;
export declare const COLS_BITMASK = 7;
export declare const COLS_BITSHIFT = 7;
export declare const NORM_BITMASK = 1;
export declare const NORM_BITSHIFT = 10;
export interface ILayoutableType {
    getLayoutAlignment(layout: PBStructLayout): number;
    getLayoutSize(layout: PBStructLayout): number;
}
export declare function makePrimitiveType(scalarTypeMask: number, rows: number, cols: number, norm: 0 | 1): PBPrimitiveType;
export type PBStructLayout = 'default' | 'std140' | 'packed';
export declare enum PBPrimitiveType {
    NONE = 0,
    F16,
    F16VEC2,
    F16VEC3,
    F16VEC4,
    F32,
    F32VEC2,
    F32VEC3,
    F32VEC4,
    BOOL,
    BVEC2,
    BVEC3,
    BVEC4,
    I8,
    I8VEC2,
    I8VEC3,
    I8VEC4,
    I8_NORM,
    I8VEC2_NORM,
    I8VEC3_NORM,
    I8VEC4_NORM,
    I16,
    I16VEC2,
    I16VEC3,
    I16VEC4,
    I16_NORM,
    I16VEC2_NORM,
    I16VEC3_NORM,
    I16VEC4_NORM,
    I32,
    I32VEC2,
    I32VEC3,
    I32VEC4,
    I32_NORM,
    I32VEC2_NORM,
    I32VEC3_NORM,
    I32VEC4_NORM,
    U8,
    U8VEC2,
    U8VEC3,
    U8VEC4,
    U8_NORM,
    U8VEC2_NORM,
    U8VEC3_NORM,
    U8VEC4_NORM,
    U16,
    U16VEC2,
    U16VEC3,
    U16VEC4,
    U16_NORM,
    U16VEC2_NORM,
    U16VEC3_NORM,
    U16VEC4_NORM,
    U32,
    U32VEC2,
    U32VEC3,
    U32VEC4,
    U32_NORM,
    U32VEC2_NORM,
    U32VEC3_NORM,
    U32VEC4_NORM,
    MAT2,
    MAT2x3,
    MAT2x4,
    MAT3x2,
    MAT3,
    MAT3x4,
    MAT4x2,
    MAT4x3,
    MAT4
}
export declare enum PBTextureType {
    TEX_1D,
    ITEX_1D,
    UTEX_1D,
    TEX_2D,
    ITEX_2D,
    UTEX_2D,
    TEX_2D_ARRAY,
    ITEX_2D_ARRAY,
    UTEX_2D_ARRAY,
    TEX_3D,
    ITEX_3D,
    UTEX_3D,
    TEX_CUBE,
    ITEX_CUBE,
    UTEX_CUBE,
    TEX_CUBE_ARRAY,
    ITEX_CUBE_ARRAY,
    UTEX_CUBE_ARRAY,
    TEX_MULTISAMPLED_2D,
    ITEX_MULTISAMPLED_2D,
    UTEX_MULTISAMPLED_2D,
    TEX_STORAGE_1D,
    TEX_STORAGE_2D,
    TEX_STORAGE_2D_ARRAY,
    TEX_STORAGE_3D,
    TEX_DEPTH_2D,
    TEX_DEPTH_2D_ARRAY,
    TEX_DEPTH_CUBE,
    TEX_DEPTH_CUBE_ARRAY,
    TEX_DEPTH_MULTISAMPLED_2D,
    TEX_EXTERNAL
}
export declare enum PBSamplerAccessMode {
    UNKNOWN = 0,
    SAMPLE = 1,
    COMPARISON = 2
}
export declare enum PBAddressSpace {
    UNKNOWN = "unknown",
    FUNCTION = "function",
    PRIVATE = "private",
    WORKGROUP = "workgroup",
    UNIFORM = "uniform",
    STORAGE = "storage"
}
export declare enum PBTypeClass {
    UNKNOWN = 0,
    PLAIN = 1,
    ARRAY = 2,
    POINTER = 3,
    ATOMIC = 4,
    TEXTURE = 5,
    SAMPLER = 6,
    FUNCTION = 7,
    VOID = 8
}
export type TypeInfo = PrimitiveTypeDetail | StructTypeDetail | ArrayTypeDetail | PointerTypeDetail | AtomicTypeInfoDetail | SamplerTypeDetail | TextureTypeDetail | FunctionTypeDetail | null;
export interface PrimitiveTypeDetail {
    primitiveType?: PBPrimitiveType;
}
export interface StructTypeDetail {
    layout: PBStructLayout;
    structName?: string;
    structMembers?: {
        name: string;
        type: PBPrimitiveTypeInfo | PBArrayTypeInfo | PBStructTypeInfo;
        alignment: number;
        size: number;
        defaultAlignment: number;
        defaultSize: number;
    }[];
}
export interface ArrayTypeDetail {
    elementType: PBPrimitiveTypeInfo | PBArrayTypeInfo | PBStructTypeInfo;
    dimension: number;
}
export interface PointerTypeDetail {
    pointerType: PBTypeInfo;
    addressSpace: PBAddressSpace;
}
export interface AtomicTypeInfoDetail {
    type: PBPrimitiveType;
}
export interface SamplerTypeDetail {
    accessMode: PBSamplerAccessMode;
}
export interface TextureTypeDetail {
    textureType: PBTextureType;
    storageTexelFormat: TextureFormat;
    readable: boolean;
    writable: boolean;
}
export interface FunctionTypeDetail {
    name: string;
    returnType: PBTypeInfo;
    argTypes: {
        type: PBTypeInfo;
        byRef?: boolean;
    }[];
}
export declare abstract class PBTypeInfo<DetailType extends TypeInfo = TypeInfo> {
    constructor(cls: PBTypeClass, detail: DetailType);
    get typeId(): string;
    isVoidType(): this is PBVoidTypeInfo;
    isPrimitiveType(): this is PBPrimitiveTypeInfo;
    isStructType(): this is PBStructTypeInfo;
    isArrayType(): this is PBArrayTypeInfo;
    isPointerType(): this is PBPointerTypeInfo;
    isAtomicType(): this is PBAtomicTypeInfo;
    isSamplerType(): this is PBSamplerTypeInfo;
    isTextureType(): this is PBTextureTypeInfo;
    isHostSharable(): boolean;
    isConstructible(): boolean;
    isStorable(): boolean;
    getConstructorOverloads(deviceType: DeviceType): PBFunctionTypeInfo[];
    abstract toBufferLayout(offset: number, layout: PBStructLayout): UniformBufferLayout;
    abstract toTypeName(deviceType: DeviceType, varName?: string): string;
}
export declare class PBVoidTypeInfo extends PBTypeInfo<null> {
    constructor();
    isVoidType(): this is PBVoidTypeInfo;
    toTypeName(deviceType: DeviceType, varName?: string): string;
    toBufferLayout(offset: number): UniformBufferLayout;
}
export declare class PBPrimitiveTypeInfo extends PBTypeInfo<PrimitiveTypeDetail> implements ILayoutableType {
    constructor(type: PBPrimitiveType);
    static getCachedTypeInfo(primitiveType: PBPrimitiveType): PBPrimitiveTypeInfo;
    static getCachedOverloads(deviceType: DeviceType, primitiveType: PBPrimitiveType): PBFunctionTypeInfo[];
    get primitiveType(): PBPrimitiveType;
    get scalarType(): PBPrimitiveType;
    get rows(): number;
    get cols(): number;
    get normalized(): boolean;
    getLayoutAlignment(layout: PBStructLayout): number;
    getLayoutSize(): number;
    getSize(): number;
    resizeType(rows: number, cols: number): PBPrimitiveType;
    isScalarType(): boolean;
    isVectorType(): boolean;
    isMatrixType(): boolean;
    isPrimitiveType(): this is PBPrimitiveTypeInfo;
    isHostSharable(): boolean;
    isConstructible(): boolean;
    isStorable(): boolean;
    getConstructorOverloads(deviceType: DeviceType): PBFunctionTypeInfo[];
    toTypeName(deviceType: DeviceType, varName?: string): string;
    toBufferLayout(offset: number): UniformBufferLayout;
}
export declare class PBStructTypeInfo extends PBTypeInfo<StructTypeDetail> implements ILayoutableType {
    constructor(name: string, layout: PBStructLayout, members: {
        name: string;
        type: PBPrimitiveTypeInfo | PBArrayTypeInfo | PBStructTypeInfo;
    }[]);
    get layout(): PBStructLayout;
    get structName(): string;
    set structName(val: string);
    get structMembers(): {
        name: string;
        type: PBPrimitiveTypeInfo | PBArrayTypeInfo | PBStructTypeInfo;
        alignment: number;
        size: number;
        defaultAlignment: number;
        defaultSize: number;
    }[];
    extends(name: string, members: {
        name: string;
        type: PBPrimitiveTypeInfo | PBArrayTypeInfo | PBStructTypeInfo;
    }[]): PBStructTypeInfo;
    isStructType(): this is PBStructTypeInfo;
    isHostSharable(): boolean;
    isConstructible(): boolean;
    isStorable(): boolean;
    getConstructorOverloads(): PBFunctionTypeInfo[];
    toTypeName(deviceType: DeviceType, varName?: string): string;
    getLayoutAlignment(layout: PBStructLayout): number;
    getLayoutSize(layout: PBStructLayout): number;
    toBufferLayout(offset: number, layout: PBStructLayout): UniformBufferLayout;
    clone(newName?: string): PBStructTypeInfo;
    reset(name: string, layout: PBStructLayout, members: {
        name: string;
        type: PBPrimitiveTypeInfo | PBArrayTypeInfo | PBStructTypeInfo;
    }[]): void;
}
export declare class PBArrayTypeInfo extends PBTypeInfo<ArrayTypeDetail> implements ILayoutableType {
    constructor(elementType: PBPrimitiveTypeInfo | PBArrayTypeInfo | PBStructTypeInfo, dimension?: number);
    get elementType(): PBPrimitiveTypeInfo | PBArrayTypeInfo | PBStructTypeInfo;
    get dimension(): number;
    isArrayType(): this is PBArrayTypeInfo;
    isHostSharable(): boolean;
    isConstructible(): boolean;
    isStorable(): boolean;
    getConstructorOverloads(deviceType: DeviceType): PBFunctionTypeInfo[];
    toTypeName(deviceType: DeviceType, varName?: string): string;
    getLayoutAlignment(layout: PBStructLayout): number;
    getLayoutSize(layout: PBStructLayout): number;
    toBufferLayout(offset: number): UniformBufferLayout;
}
export declare class PBPointerTypeInfo extends PBTypeInfo<PointerTypeDetail> {
    constructor(pointerType: PBTypeInfo, addressSpace: PBAddressSpace);
    get pointerType(): PBTypeInfo;
    get addressSpace(): PBAddressSpace;
    set addressSpace(val: PBAddressSpace);
    isPointerType(): this is PBPointerTypeInfo;
    toTypeName(device: DeviceType, varName?: string): string;
    toBufferLayout(offset: number): UniformBufferLayout;
}
export declare class PBAtomicTypeInfo extends PBTypeInfo<AtomicTypeInfoDetail> {
    constructor(type: PBPrimitiveType);
    get type(): PBPrimitiveType;
    isAtomicType(): this is PBAtomicTypeInfo;
    isHostSharable(): boolean;
    isStorable(): boolean;
    toTypeName(deviceType: DeviceType, varName?: string): string;
    toBufferLayout(offset: number): UniformBufferLayout;
}
export declare class PBSamplerTypeInfo extends PBTypeInfo<SamplerTypeDetail> {
    constructor(accessMode: PBSamplerAccessMode);
    get accessMode(): PBSamplerAccessMode;
    isSamplerType(): this is PBSamplerTypeInfo;
    isStorable(): boolean;
    toTypeName(deviceType: DeviceType, varName?: string): string;
    toBufferLayout(offset: number): UniformBufferLayout;
}
export declare class PBTextureTypeInfo extends PBTypeInfo<TextureTypeDetail> {
    constructor(textureType: PBTextureType, texelFormat?: TextureFormat, readable?: boolean, writable?: boolean);
    get textureType(): PBTextureType;
    get storageTexelFormat(): TextureFormat;
    get readable(): boolean;
    get writable(): boolean;
    isStorable(): boolean;
    is1DTexture(): boolean;
    is2DTexture(): boolean;
    is3DTexture(): boolean;
    isCubeTexture(): boolean;
    isArrayTexture(): boolean;
    isStorageTexture(): boolean;
    isDepthTexture(): boolean;
    isMultisampledTexture(): boolean;
    isExternalTexture(): boolean;
    isIntTexture(): boolean;
    isUIntTexture(): boolean;
    isTextureType(): this is PBTextureTypeInfo;
    toTypeName(deviceType: DeviceType, varName?: string): string;
    toBufferLayout(offset: number): UniformBufferLayout;
}
export declare class PBFunctionTypeInfo extends PBTypeInfo<FunctionTypeDetail> {
    constructor(name: string, returnType: PBTypeInfo, argTypes: {
        type: PBTypeInfo;
        byRef?: boolean;
    }[]);
    get name(): string;
    get returnType(): PBTypeInfo;
    get argTypes(): {
        type: PBTypeInfo;
        byRef?: boolean;
    }[];
    toBufferLayout(offset: number): UniformBufferLayout;
    toTypeName(deviceType: DeviceType, varName?: string): string;
}
export declare const typeF16: PBPrimitiveTypeInfo;
export declare const typeF16Vec2: PBPrimitiveTypeInfo;
export declare const typeF16Vec3: PBPrimitiveTypeInfo;
export declare const typeF16Vec4: PBPrimitiveTypeInfo;
export declare const typeF32: PBPrimitiveTypeInfo;
export declare const typeF32Vec2: PBPrimitiveTypeInfo;
export declare const typeF32Vec3: PBPrimitiveTypeInfo;
export declare const typeF32Vec4: PBPrimitiveTypeInfo;
export declare const typeI8: PBPrimitiveTypeInfo;
export declare const typeI8Vec2: PBPrimitiveTypeInfo;
export declare const typeI8Vec3: PBPrimitiveTypeInfo;
export declare const typeI8Vec4: PBPrimitiveTypeInfo;
export declare const typeI8_Norm: PBPrimitiveTypeInfo;
export declare const typeI8Vec2_Norm: PBPrimitiveTypeInfo;
export declare const typeI8Vec3_Norm: PBPrimitiveTypeInfo;
export declare const typeI8Vec4_Norm: PBPrimitiveTypeInfo;
export declare const typeI16: PBPrimitiveTypeInfo;
export declare const typeI16Vec2: PBPrimitiveTypeInfo;
export declare const typeI16Vec3: PBPrimitiveTypeInfo;
export declare const typeI16Vec4: PBPrimitiveTypeInfo;
export declare const typeI16_Norm: PBPrimitiveTypeInfo;
export declare const typeI16Vec2_Norm: PBPrimitiveTypeInfo;
export declare const typeI16Vec3_Norm: PBPrimitiveTypeInfo;
export declare const typeI16Vec4_Norm: PBPrimitiveTypeInfo;
export declare const typeI32: PBPrimitiveTypeInfo;
export declare const typeI32Vec2: PBPrimitiveTypeInfo;
export declare const typeI32Vec3: PBPrimitiveTypeInfo;
export declare const typeI32Vec4: PBPrimitiveTypeInfo;
export declare const typeI32_Norm: PBPrimitiveTypeInfo;
export declare const typeI32Vec2_Norm: PBPrimitiveTypeInfo;
export declare const typeI32Vec3_Norm: PBPrimitiveTypeInfo;
export declare const typeI32Vec4_Norm: PBPrimitiveTypeInfo;
export declare const typeU8: PBPrimitiveTypeInfo;
export declare const typeU8Vec2: PBPrimitiveTypeInfo;
export declare const typeU8Vec3: PBPrimitiveTypeInfo;
export declare const typeU8Vec4: PBPrimitiveTypeInfo;
export declare const typeU8_Norm: PBPrimitiveTypeInfo;
export declare const typeU8Vec2_Norm: PBPrimitiveTypeInfo;
export declare const typeU8Vec3_Norm: PBPrimitiveTypeInfo;
export declare const typeU8Vec4_Norm: PBPrimitiveTypeInfo;
export declare const typeU16: PBPrimitiveTypeInfo;
export declare const typeU16Vec2: PBPrimitiveTypeInfo;
export declare const typeU16Vec3: PBPrimitiveTypeInfo;
export declare const typeU16Vec4: PBPrimitiveTypeInfo;
export declare const typeU16_Norm: PBPrimitiveTypeInfo;
export declare const typeU16Vec2_Norm: PBPrimitiveTypeInfo;
export declare const typeU16Vec3_Norm: PBPrimitiveTypeInfo;
export declare const typeU16Vec4_Norm: PBPrimitiveTypeInfo;
export declare const typeU32: PBPrimitiveTypeInfo;
export declare const typeU32Vec2: PBPrimitiveTypeInfo;
export declare const typeU32Vec3: PBPrimitiveTypeInfo;
export declare const typeU32Vec4: PBPrimitiveTypeInfo;
export declare const typeU32_Norm: PBPrimitiveTypeInfo;
export declare const typeU32Vec2_Norm: PBPrimitiveTypeInfo;
export declare const typeU32Vec3_Norm: PBPrimitiveTypeInfo;
export declare const typeU32Vec4_Norm: PBPrimitiveTypeInfo;
export declare const typeBool: PBPrimitiveTypeInfo;
export declare const typeBVec2: PBPrimitiveTypeInfo;
export declare const typeBVec3: PBPrimitiveTypeInfo;
export declare const typeBVec4: PBPrimitiveTypeInfo;
export declare const typeMat2: PBPrimitiveTypeInfo;
export declare const typeMat2x3: PBPrimitiveTypeInfo;
export declare const typeMat2x4: PBPrimitiveTypeInfo;
export declare const typeMat3x2: PBPrimitiveTypeInfo;
export declare const typeMat3: PBPrimitiveTypeInfo;
export declare const typeMat3x4: PBPrimitiveTypeInfo;
export declare const typeMat4x2: PBPrimitiveTypeInfo;
export declare const typeMat4x3: PBPrimitiveTypeInfo;
export declare const typeMat4: PBPrimitiveTypeInfo;
export declare const typeTex1D: PBTextureTypeInfo;
export declare const typeITex1D: PBTextureTypeInfo;
export declare const typeUTex1D: PBTextureTypeInfo;
export declare const typeTex2D: PBTextureTypeInfo;
export declare const typeITex2D: PBTextureTypeInfo;
export declare const typeUTex2D: PBTextureTypeInfo;
export declare const typeTex2DArray: PBTextureTypeInfo;
export declare const typeITex2DArray: PBTextureTypeInfo;
export declare const typeUTex2DArray: PBTextureTypeInfo;
export declare const typeTex3D: PBTextureTypeInfo;
export declare const typeITex3D: PBTextureTypeInfo;
export declare const typeUTex3D: PBTextureTypeInfo;
export declare const typeTexCube: PBTextureTypeInfo;
export declare const typeITexCube: PBTextureTypeInfo;
export declare const typeUTexCube: PBTextureTypeInfo;
export declare const typeTexExternal: PBTextureTypeInfo;
export declare const typeTexCubeArray: PBTextureTypeInfo;
export declare const typeITexCubeArray: PBTextureTypeInfo;
export declare const typeUTexCubeArray: PBTextureTypeInfo;
export declare const typeTexMultisampled2D: PBTextureTypeInfo;
export declare const typeITexMultisampled2D: PBTextureTypeInfo;
export declare const typeUTexMultisampled2D: PBTextureTypeInfo;
export declare const typeTexStorage1D_rgba8unorm: PBTextureTypeInfo;
export declare const typeTexStorage1D_rgba8snorm: PBTextureTypeInfo;
export declare const typeTexStorage1D_bgra8unorm: PBTextureTypeInfo;
export declare const typeTexStorage1D_rgba8uint: PBTextureTypeInfo;
export declare const typeTexStorage1D_rgba8sint: PBTextureTypeInfo;
export declare const typeTexStorage1D_rgba16uint: PBTextureTypeInfo;
export declare const typeTexStorage1D_rgba16sint: PBTextureTypeInfo;
export declare const typeTexStorage1D_rgba16float: PBTextureTypeInfo;
export declare const typeTexStorage1D_rgba32uint: PBTextureTypeInfo;
export declare const typeTexStorage1D_rgba32sint: PBTextureTypeInfo;
export declare const typeTexStorage1D_rgba32float: PBTextureTypeInfo;
export declare const typeTexStorage1D_rg32uint: PBTextureTypeInfo;
export declare const typeTexStorage1D_rg32sint: PBTextureTypeInfo;
export declare const typeTexStorage1D_rg32float: PBTextureTypeInfo;
export declare const typeTexStorage1D_r32uint: PBTextureTypeInfo;
export declare const typeTexStorage1D_r32sint: PBTextureTypeInfo;
export declare const typeTexStorage1D_r32float: PBTextureTypeInfo;
export declare const typeTexStorage2D_rgba8unorm: PBTextureTypeInfo;
export declare const typeTexStorage2D_rgba8snorm: PBTextureTypeInfo;
export declare const typeTexStorage2D_bgra8unorm: PBTextureTypeInfo;
export declare const typeTexStorage2D_rgba8uint: PBTextureTypeInfo;
export declare const typeTexStorage2D_rgba8sint: PBTextureTypeInfo;
export declare const typeTexStorage2D_rgba16uint: PBTextureTypeInfo;
export declare const typeTexStorage2D_rgba16sint: PBTextureTypeInfo;
export declare const typeTexStorage2D_rgba16float: PBTextureTypeInfo;
export declare const typeTexStorage2D_rgba32uint: PBTextureTypeInfo;
export declare const typeTexStorage2D_rgba32sint: PBTextureTypeInfo;
export declare const typeTexStorage2D_rgba32float: PBTextureTypeInfo;
export declare const typeTexStorage2D_rg32uint: PBTextureTypeInfo;
export declare const typeTexStorage2D_rg32sint: PBTextureTypeInfo;
export declare const typeTexStorage2D_rg32float: PBTextureTypeInfo;
export declare const typeTexStorage2D_r32uint: PBTextureTypeInfo;
export declare const typeTexStorage2D_r32sint: PBTextureTypeInfo;
export declare const typeTexStorage2D_r32float: PBTextureTypeInfo;
export declare const typeTexStorage2DArray_rgba8unorm: PBTextureTypeInfo;
export declare const typeTexStorage2DArray_rgba8snorm: PBTextureTypeInfo;
export declare const typeTexStorage2DArray_bgra8unorm: PBTextureTypeInfo;
export declare const typeTexStorage2DArray_rgba8uint: PBTextureTypeInfo;
export declare const typeTexStorage2DArray_rgba8sint: PBTextureTypeInfo;
export declare const typeTexStorage2DArray_rgba16uint: PBTextureTypeInfo;
export declare const typeTexStorage2DArray_rgba16sint: PBTextureTypeInfo;
export declare const typeTexStorage2DArray_rgba16float: PBTextureTypeInfo;
export declare const typeTexStorage2DArray_rgba32uint: PBTextureTypeInfo;
export declare const typeTexStorage2DArray_rgba32sint: PBTextureTypeInfo;
export declare const typeTexStorage2DArray_rgba32float: PBTextureTypeInfo;
export declare const typeTexStorage2DArray_rg32uint: PBTextureTypeInfo;
export declare const typeTexStorage2DArray_rg32sint: PBTextureTypeInfo;
export declare const typeTexStorage2DArray_rg32float: PBTextureTypeInfo;
export declare const typeTexStorage2DArray_r32uint: PBTextureTypeInfo;
export declare const typeTexStorage2DArray_r32sint: PBTextureTypeInfo;
export declare const typeTexStorage2DArray_r32float: PBTextureTypeInfo;
export declare const typeTexStorage3D_rgba8unorm: PBTextureTypeInfo;
export declare const typeTexStorage3D_rgba8snorm: PBTextureTypeInfo;
export declare const typeTexStorage3D_bgra8unorm: PBTextureTypeInfo;
export declare const typeTexStorage3D_rgba8uint: PBTextureTypeInfo;
export declare const typeTexStorage3D_rgba8sint: PBTextureTypeInfo;
export declare const typeTexStorage3D_rgba16uint: PBTextureTypeInfo;
export declare const typeTexStorage3D_rgba16sint: PBTextureTypeInfo;
export declare const typeTexStorage3D_rgba16float: PBTextureTypeInfo;
export declare const typeTexStorage3D_rgba32uint: PBTextureTypeInfo;
export declare const typeTexStorage3D_rgba32sint: PBTextureTypeInfo;
export declare const typeTexStorage3D_rgba32float: PBTextureTypeInfo;
export declare const typeTexStorage3D_rg32uint: PBTextureTypeInfo;
export declare const typeTexStorage3D_rg32sint: PBTextureTypeInfo;
export declare const typeTexStorage3D_rg32float: PBTextureTypeInfo;
export declare const typeTexStorage3D_r32uint: PBTextureTypeInfo;
export declare const typeTexStorage3D_r32sint: PBTextureTypeInfo;
export declare const typeTexStorage3D_r32float: PBTextureTypeInfo;
export declare const typeTexDepth2D: PBTextureTypeInfo;
export declare const typeTexDepth2DArray: PBTextureTypeInfo;
export declare const typeTexDepthCube: PBTextureTypeInfo;
export declare const typeTexDepthCubeArray: PBTextureTypeInfo;
export declare const typeTexDepthMultisampled2D: PBTextureTypeInfo;
export declare const typeSampler: PBSamplerTypeInfo;
export declare const typeSamplerComparison: PBSamplerTypeInfo;
export declare const typeVoid: PBVoidTypeInfo;
export declare const typeFrexpResult: PBStructTypeInfo;
export declare const typeFrexpResultVec2: PBStructTypeInfo;
export declare const typeFrexpResultVec3: PBStructTypeInfo;
export declare const typeFrexpResultVec4: PBStructTypeInfo;
