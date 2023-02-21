import { VectorBase, CubeFace } from '@sophon/base';
import { ShaderType, PrimitiveType, TextureTarget, TextureFormat, TextureWrapping, TextureFilter, CompareFunc } from './base_types';
import { PBTypeInfo, PBPrimitiveTypeInfo, PBStructTypeInfo, PBPrimitiveType } from './builder/types';
import type { TypedArray } from '../misc';
import type { Device } from './device';
export type TextureImageElement = ImageBitmap | HTMLCanvasElement;
declare const vertexAttribFormatMap: {
    readonly position_u8normx2: readonly [0, PBPrimitiveType, 2];
    readonly position_u8normx4: readonly [0, PBPrimitiveType, 4];
    readonly position_i8normx2: readonly [0, PBPrimitiveType, 2];
    readonly position_i8normx4: readonly [0, PBPrimitiveType, 4];
    readonly position_u16x2: readonly [0, PBPrimitiveType, 4];
    readonly position_u16x4: readonly [0, PBPrimitiveType, 8];
    readonly position_i16x2: readonly [0, PBPrimitiveType, 4];
    readonly position_i16x4: readonly [0, PBPrimitiveType, 8];
    readonly position_u16normx2: readonly [0, PBPrimitiveType, 4];
    readonly position_u16normx4: readonly [0, PBPrimitiveType, 8];
    readonly position_i16normx2: readonly [0, PBPrimitiveType, 4];
    readonly position_i16normx4: readonly [0, PBPrimitiveType, 8];
    readonly position_f16x2: readonly [0, PBPrimitiveType, 4];
    readonly position_f16x4: readonly [0, PBPrimitiveType, 8];
    readonly position_f32: readonly [0, PBPrimitiveType, 4];
    readonly position_f32x2: readonly [0, PBPrimitiveType, 8];
    readonly position_f32x3: readonly [0, PBPrimitiveType, 12];
    readonly position_f32x4: readonly [0, PBPrimitiveType, 16];
    readonly position_i32: readonly [0, PBPrimitiveType, 4];
    readonly position_i32x2: readonly [0, PBPrimitiveType, 8];
    readonly position_i32x3: readonly [0, PBPrimitiveType, 12];
    readonly position_i32x4: readonly [0, PBPrimitiveType, 16];
    readonly position_u32: readonly [0, PBPrimitiveType, 4];
    readonly position_u32x2: readonly [0, PBPrimitiveType, 8];
    readonly position_u32x3: readonly [0, PBPrimitiveType, 12];
    readonly position_u32x4: readonly [0, PBPrimitiveType, 16];
    readonly normal_f16x4: readonly [1, PBPrimitiveType, 8];
    readonly normal_f32x3: readonly [1, PBPrimitiveType, 12];
    readonly normal_f32x4: readonly [1, PBPrimitiveType, 16];
    readonly diffuse_u8normx4: readonly [2, PBPrimitiveType, 4];
    readonly diffuse_u16x4: readonly [2, PBPrimitiveType, 8];
    readonly diffuse_u16normx4: readonly [2, PBPrimitiveType, 8];
    readonly diffuse_f16x4: readonly [2, PBPrimitiveType, 8];
    readonly diffuse_f32x3: readonly [2, PBPrimitiveType, 12];
    readonly diffuse_f32x4: readonly [2, PBPrimitiveType, 16];
    readonly diffuse_u32x3: readonly [2, PBPrimitiveType, 12];
    readonly diffuse_u32x4: readonly [2, PBPrimitiveType, 16];
    readonly tangent_f16x4: readonly [3, PBPrimitiveType, 8];
    readonly tangent_f32x3: readonly [3, PBPrimitiveType, 12];
    readonly tangent_f32x4: readonly [3, PBPrimitiveType, 16];
    readonly tex0_u8normx2: readonly [4, PBPrimitiveType, 2];
    readonly tex0_u8normx4: readonly [4, PBPrimitiveType, 4];
    readonly tex0_i8normx2: readonly [4, PBPrimitiveType, 2];
    readonly tex0_i8normx4: readonly [4, PBPrimitiveType, 4];
    readonly tex0_u16x2: readonly [4, PBPrimitiveType, 4];
    readonly tex0_u16x4: readonly [4, PBPrimitiveType, 8];
    readonly tex0_i16x2: readonly [4, PBPrimitiveType, 4];
    readonly tex0_i16x4: readonly [4, PBPrimitiveType, 8];
    readonly tex0_u16normx2: readonly [4, PBPrimitiveType, 4];
    readonly tex0_u16normx4: readonly [4, PBPrimitiveType, 8];
    readonly tex0_i16normx2: readonly [4, PBPrimitiveType, 4];
    readonly tex0_i16normx4: readonly [4, PBPrimitiveType, 8];
    readonly tex0_f16x2: readonly [4, PBPrimitiveType, 4];
    readonly tex0_f16x4: readonly [4, PBPrimitiveType, 8];
    readonly tex0_f32: readonly [4, PBPrimitiveType, 4];
    readonly tex0_f32x2: readonly [4, PBPrimitiveType, 8];
    readonly tex0_f32x3: readonly [4, PBPrimitiveType, 12];
    readonly tex0_f32x4: readonly [4, PBPrimitiveType, 16];
    readonly tex0_i32: readonly [4, PBPrimitiveType, 4];
    readonly tex0_i32x2: readonly [4, PBPrimitiveType, 8];
    readonly tex0_i32x3: readonly [4, PBPrimitiveType, 12];
    readonly tex0_i32x4: readonly [4, PBPrimitiveType, 16];
    readonly tex0_u32: readonly [4, PBPrimitiveType, 4];
    readonly tex0_u32x2: readonly [4, PBPrimitiveType, 8];
    readonly tex0_u32x3: readonly [4, PBPrimitiveType, 12];
    readonly tex0_u32x4: readonly [4, PBPrimitiveType, 16];
    readonly tex1_u8normx2: readonly [5, PBPrimitiveType, 2];
    readonly tex1_u8normx4: readonly [5, PBPrimitiveType, 4];
    readonly tex1_i8normx2: readonly [5, PBPrimitiveType, 2];
    readonly tex1_i8normx4: readonly [5, PBPrimitiveType, 4];
    readonly tex1_u16x2: readonly [5, PBPrimitiveType, 4];
    readonly tex1_u16x4: readonly [5, PBPrimitiveType, 8];
    readonly tex1_i16x2: readonly [5, PBPrimitiveType, 4];
    readonly tex1_i16x4: readonly [5, PBPrimitiveType, 8];
    readonly tex1_u16normx2: readonly [5, PBPrimitiveType, 4];
    readonly tex1_u16normx4: readonly [5, PBPrimitiveType, 8];
    readonly tex1_i16normx2: readonly [5, PBPrimitiveType, 4];
    readonly tex1_i16normx4: readonly [5, PBPrimitiveType, 8];
    readonly tex1_f16x2: readonly [5, PBPrimitiveType, 4];
    readonly tex1_f16x4: readonly [5, PBPrimitiveType, 8];
    readonly tex1_f32: readonly [5, PBPrimitiveType, 4];
    readonly tex1_f32x2: readonly [5, PBPrimitiveType, 8];
    readonly tex1_f32x3: readonly [5, PBPrimitiveType, 12];
    readonly tex1_f32x4: readonly [5, PBPrimitiveType, 16];
    readonly tex1_i32: readonly [5, PBPrimitiveType, 4];
    readonly tex1_i32x2: readonly [5, PBPrimitiveType, 8];
    readonly tex1_i32x3: readonly [5, PBPrimitiveType, 12];
    readonly tex1_i32x4: readonly [5, PBPrimitiveType, 16];
    readonly tex1_u32: readonly [5, PBPrimitiveType, 4];
    readonly tex1_u32x2: readonly [5, PBPrimitiveType, 8];
    readonly tex1_u32x3: readonly [5, PBPrimitiveType, 12];
    readonly tex1_u32x4: readonly [5, PBPrimitiveType, 16];
    readonly tex2_u8normx2: readonly [6, PBPrimitiveType, 2];
    readonly tex2_u8normx4: readonly [6, PBPrimitiveType, 4];
    readonly tex2_i8normx2: readonly [6, PBPrimitiveType, 2];
    readonly tex2_i8normx4: readonly [6, PBPrimitiveType, 4];
    readonly tex2_u16x2: readonly [6, PBPrimitiveType, 4];
    readonly tex2_u16x4: readonly [6, PBPrimitiveType, 8];
    readonly tex2_i16x2: readonly [6, PBPrimitiveType, 4];
    readonly tex2_i16x4: readonly [6, PBPrimitiveType, 8];
    readonly tex2_u16normx2: readonly [6, PBPrimitiveType, 4];
    readonly tex2_u16normx4: readonly [6, PBPrimitiveType, 8];
    readonly tex2_i16normx2: readonly [6, PBPrimitiveType, 4];
    readonly tex2_i16normx4: readonly [6, PBPrimitiveType, 8];
    readonly tex2_f16x2: readonly [6, PBPrimitiveType, 4];
    readonly tex2_f16x4: readonly [6, PBPrimitiveType, 8];
    readonly tex2_f32: readonly [6, PBPrimitiveType, 4];
    readonly tex2_f32x2: readonly [6, PBPrimitiveType, 8];
    readonly tex2_f32x3: readonly [6, PBPrimitiveType, 12];
    readonly tex2_f32x4: readonly [6, PBPrimitiveType, 16];
    readonly tex2_i32: readonly [6, PBPrimitiveType, 4];
    readonly tex2_i32x2: readonly [6, PBPrimitiveType, 8];
    readonly tex2_i32x3: readonly [6, PBPrimitiveType, 12];
    readonly tex2_i32x4: readonly [6, PBPrimitiveType, 16];
    readonly tex2_u32: readonly [6, PBPrimitiveType, 4];
    readonly tex2_u32x2: readonly [6, PBPrimitiveType, 8];
    readonly tex2_u32x3: readonly [6, PBPrimitiveType, 12];
    readonly tex2_u32x4: readonly [6, PBPrimitiveType, 16];
    readonly tex3_u8normx2: readonly [7, PBPrimitiveType, 2];
    readonly tex3_u8normx4: readonly [7, PBPrimitiveType, 4];
    readonly tex3_i8normx2: readonly [7, PBPrimitiveType, 2];
    readonly tex3_i8normx4: readonly [7, PBPrimitiveType, 4];
    readonly tex3_u16x2: readonly [7, PBPrimitiveType, 4];
    readonly tex3_u16x4: readonly [7, PBPrimitiveType, 8];
    readonly tex3_i16x2: readonly [7, PBPrimitiveType, 4];
    readonly tex3_i16x4: readonly [7, PBPrimitiveType, 8];
    readonly tex3_u16normx2: readonly [7, PBPrimitiveType, 4];
    readonly tex3_u16normx4: readonly [7, PBPrimitiveType, 8];
    readonly tex3_i16normx2: readonly [7, PBPrimitiveType, 4];
    readonly tex3_i16normx4: readonly [7, PBPrimitiveType, 8];
    readonly tex3_f16x2: readonly [7, PBPrimitiveType, 4];
    readonly tex3_f16x4: readonly [7, PBPrimitiveType, 8];
    readonly tex3_f32: readonly [7, PBPrimitiveType, 4];
    readonly tex3_f32x2: readonly [7, PBPrimitiveType, 8];
    readonly tex3_f32x3: readonly [7, PBPrimitiveType, 12];
    readonly tex3_f32x4: readonly [7, PBPrimitiveType, 16];
    readonly tex3_i32: readonly [7, PBPrimitiveType, 4];
    readonly tex3_i32x2: readonly [7, PBPrimitiveType, 8];
    readonly tex3_i32x3: readonly [7, PBPrimitiveType, 12];
    readonly tex3_i32x4: readonly [7, PBPrimitiveType, 16];
    readonly tex3_u32: readonly [7, PBPrimitiveType, 4];
    readonly tex3_u32x2: readonly [7, PBPrimitiveType, 8];
    readonly tex3_u32x3: readonly [7, PBPrimitiveType, 12];
    readonly tex3_u32x4: readonly [7, PBPrimitiveType, 16];
    readonly tex4_u8normx2: readonly [8, PBPrimitiveType, 2];
    readonly tex4_u8normx4: readonly [8, PBPrimitiveType, 4];
    readonly tex4_i8normx2: readonly [8, PBPrimitiveType, 2];
    readonly tex4_i8normx4: readonly [8, PBPrimitiveType, 4];
    readonly tex4_u16x2: readonly [8, PBPrimitiveType, 4];
    readonly tex4_u16x4: readonly [8, PBPrimitiveType, 8];
    readonly tex4_i16x2: readonly [8, PBPrimitiveType, 4];
    readonly tex4_i16x4: readonly [8, PBPrimitiveType, 8];
    readonly tex4_u16normx2: readonly [8, PBPrimitiveType, 4];
    readonly tex4_u16normx4: readonly [8, PBPrimitiveType, 8];
    readonly tex4_i16normx2: readonly [8, PBPrimitiveType, 4];
    readonly tex4_i16normx4: readonly [8, PBPrimitiveType, 8];
    readonly tex4_f16x2: readonly [8, PBPrimitiveType, 4];
    readonly tex4_f16x4: readonly [8, PBPrimitiveType, 8];
    readonly tex4_f32: readonly [8, PBPrimitiveType, 4];
    readonly tex4_f32x2: readonly [8, PBPrimitiveType, 8];
    readonly tex4_f32x3: readonly [8, PBPrimitiveType, 12];
    readonly tex4_f32x4: readonly [8, PBPrimitiveType, 16];
    readonly tex4_i32: readonly [8, PBPrimitiveType, 4];
    readonly tex4_i32x2: readonly [8, PBPrimitiveType, 8];
    readonly tex4_i32x3: readonly [8, PBPrimitiveType, 12];
    readonly tex4_i32x4: readonly [8, PBPrimitiveType, 16];
    readonly tex4_u32: readonly [8, PBPrimitiveType, 4];
    readonly tex4_u32x2: readonly [8, PBPrimitiveType, 8];
    readonly tex4_u32x3: readonly [8, PBPrimitiveType, 12];
    readonly tex4_u32x4: readonly [8, PBPrimitiveType, 16];
    readonly tex5_u8normx2: readonly [9, PBPrimitiveType, 2];
    readonly tex5_u8normx4: readonly [9, PBPrimitiveType, 4];
    readonly tex5_i8normx2: readonly [9, PBPrimitiveType, 2];
    readonly tex5_i8normx4: readonly [9, PBPrimitiveType, 4];
    readonly tex5_u16x2: readonly [9, PBPrimitiveType, 4];
    readonly tex5_u16x4: readonly [9, PBPrimitiveType, 8];
    readonly tex5_i16x2: readonly [9, PBPrimitiveType, 4];
    readonly tex5_i16x4: readonly [9, PBPrimitiveType, 8];
    readonly tex5_u16normx2: readonly [9, PBPrimitiveType, 4];
    readonly tex5_u16normx4: readonly [9, PBPrimitiveType, 8];
    readonly tex5_i16normx2: readonly [9, PBPrimitiveType, 4];
    readonly tex5_i16normx4: readonly [9, PBPrimitiveType, 8];
    readonly tex5_f16x2: readonly [9, PBPrimitiveType, 4];
    readonly tex5_f16x4: readonly [9, PBPrimitiveType, 8];
    readonly tex5_f32: readonly [9, PBPrimitiveType, 4];
    readonly tex5_f32x2: readonly [9, PBPrimitiveType, 8];
    readonly tex5_f32x3: readonly [9, PBPrimitiveType, 12];
    readonly tex5_f32x4: readonly [9, PBPrimitiveType, 16];
    readonly tex5_i32: readonly [9, PBPrimitiveType, 4];
    readonly tex5_i32x2: readonly [9, PBPrimitiveType, 8];
    readonly tex5_i32x3: readonly [9, PBPrimitiveType, 12];
    readonly tex5_i32x4: readonly [9, PBPrimitiveType, 16];
    readonly tex5_u32: readonly [9, PBPrimitiveType, 4];
    readonly tex5_u32x2: readonly [9, PBPrimitiveType, 8];
    readonly tex5_u32x3: readonly [9, PBPrimitiveType, 12];
    readonly tex5_u32x4: readonly [9, PBPrimitiveType, 16];
    readonly tex6_u8normx2: readonly [10, PBPrimitiveType, 2];
    readonly tex6_u8normx4: readonly [10, PBPrimitiveType, 4];
    readonly tex6_i8normx2: readonly [10, PBPrimitiveType, 2];
    readonly tex6_i8normx4: readonly [10, PBPrimitiveType, 4];
    readonly tex6_u16x2: readonly [10, PBPrimitiveType, 4];
    readonly tex6_u16x4: readonly [10, PBPrimitiveType, 8];
    readonly tex6_i16x2: readonly [10, PBPrimitiveType, 4];
    readonly tex6_i16x4: readonly [10, PBPrimitiveType, 8];
    readonly tex6_u16normx2: readonly [10, PBPrimitiveType, 4];
    readonly tex6_u16normx4: readonly [10, PBPrimitiveType, 8];
    readonly tex6_i16normx2: readonly [10, PBPrimitiveType, 4];
    readonly tex6_i16normx4: readonly [10, PBPrimitiveType, 8];
    readonly tex6_f16x2: readonly [10, PBPrimitiveType, 4];
    readonly tex6_f16x4: readonly [10, PBPrimitiveType, 8];
    readonly tex6_f32: readonly [10, PBPrimitiveType, 4];
    readonly tex6_f32x2: readonly [10, PBPrimitiveType, 8];
    readonly tex6_f32x3: readonly [10, PBPrimitiveType, 12];
    readonly tex6_f32x4: readonly [10, PBPrimitiveType, 16];
    readonly tex6_i32: readonly [10, PBPrimitiveType, 4];
    readonly tex6_i32x2: readonly [10, PBPrimitiveType, 8];
    readonly tex6_i32x3: readonly [10, PBPrimitiveType, 12];
    readonly tex6_i32x4: readonly [10, PBPrimitiveType, 16];
    readonly tex6_u32: readonly [10, PBPrimitiveType, 4];
    readonly tex6_u32x2: readonly [10, PBPrimitiveType, 8];
    readonly tex6_u32x3: readonly [10, PBPrimitiveType, 12];
    readonly tex6_u32x4: readonly [10, PBPrimitiveType, 16];
    readonly tex7_u8normx2: readonly [11, PBPrimitiveType, 2];
    readonly tex7_u8normx4: readonly [11, PBPrimitiveType, 4];
    readonly tex7_i8normx2: readonly [11, PBPrimitiveType, 2];
    readonly tex7_i8normx4: readonly [11, PBPrimitiveType, 4];
    readonly tex7_u16x2: readonly [11, PBPrimitiveType, 4];
    readonly tex7_u16x4: readonly [11, PBPrimitiveType, 8];
    readonly tex7_i16x2: readonly [11, PBPrimitiveType, 4];
    readonly tex7_i16x4: readonly [11, PBPrimitiveType, 8];
    readonly tex7_u16normx2: readonly [11, PBPrimitiveType, 4];
    readonly tex7_u16normx4: readonly [11, PBPrimitiveType, 8];
    readonly tex7_i16normx2: readonly [11, PBPrimitiveType, 4];
    readonly tex7_i16normx4: readonly [11, PBPrimitiveType, 8];
    readonly tex7_f16x2: readonly [11, PBPrimitiveType, 4];
    readonly tex7_f16x4: readonly [11, PBPrimitiveType, 8];
    readonly tex7_f32: readonly [11, PBPrimitiveType, 4];
    readonly tex7_f32x2: readonly [11, PBPrimitiveType, 8];
    readonly tex7_f32x3: readonly [11, PBPrimitiveType, 12];
    readonly tex7_f32x4: readonly [11, PBPrimitiveType, 16];
    readonly tex7_i32: readonly [11, PBPrimitiveType, 4];
    readonly tex7_i32x2: readonly [11, PBPrimitiveType, 8];
    readonly tex7_i32x3: readonly [11, PBPrimitiveType, 12];
    readonly tex7_i32x4: readonly [11, PBPrimitiveType, 16];
    readonly tex7_u32: readonly [11, PBPrimitiveType, 4];
    readonly tex7_u32x2: readonly [11, PBPrimitiveType, 8];
    readonly tex7_u32x3: readonly [11, PBPrimitiveType, 12];
    readonly tex7_u32x4: readonly [11, PBPrimitiveType, 16];
    readonly blendweights_f16x4: readonly [12, PBPrimitiveType, 8];
    readonly blendweights_f32x4: readonly [12, PBPrimitiveType, 16];
    readonly blendindices_u16x4: readonly [13, PBPrimitiveType, 8];
    readonly blendindices_f16x4: readonly [13, PBPrimitiveType, 8];
    readonly blendindices_f32x4: readonly [13, PBPrimitiveType, 16];
    readonly blendindices_u32x4: readonly [13, PBPrimitiveType, 16];
    readonly custom0_u8normx2: readonly [14, PBPrimitiveType, 2];
    readonly custom0_u8normx4: readonly [14, PBPrimitiveType, 4];
    readonly custom0_i8normx2: readonly [14, PBPrimitiveType, 2];
    readonly custom0_i8normx4: readonly [14, PBPrimitiveType, 4];
    readonly custom0_u16x2: readonly [14, PBPrimitiveType, 4];
    readonly custom0_u16x4: readonly [14, PBPrimitiveType, 8];
    readonly custom0_i16x2: readonly [14, PBPrimitiveType, 4];
    readonly custom0_i16x4: readonly [14, PBPrimitiveType, 8];
    readonly custom0_u16normx2: readonly [14, PBPrimitiveType, 4];
    readonly custom0_u16normx4: readonly [14, PBPrimitiveType, 8];
    readonly custom0_i16normx2: readonly [14, PBPrimitiveType, 4];
    readonly custom0_i16normx4: readonly [14, PBPrimitiveType, 8];
    readonly custom0_f16x2: readonly [14, PBPrimitiveType, 4];
    readonly custom0_f16x4: readonly [14, PBPrimitiveType, 8];
    readonly custom0_f32: readonly [14, PBPrimitiveType, 4];
    readonly custom0_f32x2: readonly [14, PBPrimitiveType, 8];
    readonly custom0_f32x3: readonly [14, PBPrimitiveType, 12];
    readonly custom0_f32x4: readonly [14, PBPrimitiveType, 16];
    readonly custom0_i32: readonly [14, PBPrimitiveType, 4];
    readonly custom0_i32x2: readonly [14, PBPrimitiveType, 8];
    readonly custom0_i32x3: readonly [14, PBPrimitiveType, 12];
    readonly custom0_i32x4: readonly [14, PBPrimitiveType, 16];
    readonly custom0_u32: readonly [14, PBPrimitiveType, 4];
    readonly custom0_u32x2: readonly [14, PBPrimitiveType, 8];
    readonly custom0_u32x3: readonly [14, PBPrimitiveType, 12];
    readonly custom0_u32x4: readonly [14, PBPrimitiveType, 16];
    readonly custom1_u8normx2: readonly [15, PBPrimitiveType, 2];
    readonly custom1_u8normx4: readonly [15, PBPrimitiveType, 4];
    readonly custom1_i8normx2: readonly [15, PBPrimitiveType, 2];
    readonly custom1_i8normx4: readonly [15, PBPrimitiveType, 4];
    readonly custom1_u16x2: readonly [15, PBPrimitiveType, 4];
    readonly custom1_u16x4: readonly [15, PBPrimitiveType, 8];
    readonly custom1_i16x2: readonly [15, PBPrimitiveType, 4];
    readonly custom1_i16x4: readonly [15, PBPrimitiveType, 8];
    readonly custom1_u16normx2: readonly [15, PBPrimitiveType, 4];
    readonly custom1_u16normx4: readonly [15, PBPrimitiveType, 8];
    readonly custom1_i16normx2: readonly [15, PBPrimitiveType, 4];
    readonly custom1_i16normx4: readonly [15, PBPrimitiveType, 8];
    readonly custom1_f16x2: readonly [15, PBPrimitiveType, 4];
    readonly custom1_f16x4: readonly [15, PBPrimitiveType, 8];
    readonly custom1_f32: readonly [15, PBPrimitiveType, 4];
    readonly custom1_f32x2: readonly [15, PBPrimitiveType, 8];
    readonly custom1_f32x3: readonly [15, PBPrimitiveType, 12];
    readonly custom1_f32x4: readonly [15, PBPrimitiveType, 16];
    readonly custom1_i32: readonly [15, PBPrimitiveType, 4];
    readonly custom1_i32x2: readonly [15, PBPrimitiveType, 8];
    readonly custom1_i32x3: readonly [15, PBPrimitiveType, 12];
    readonly custom1_i32x4: readonly [15, PBPrimitiveType, 16];
    readonly custom1_u32: readonly [15, PBPrimitiveType, 4];
    readonly custom1_u32x2: readonly [15, PBPrimitiveType, 8];
    readonly custom1_u32x3: readonly [15, PBPrimitiveType, 12];
    readonly custom1_u32x4: readonly [15, PBPrimitiveType, 16];
};
export type VertexAttribFormat = keyof typeof vertexAttribFormatMap;
declare const vertexAttribNameMap: {
    readonly position: 0;
    readonly normal: 1;
    readonly diffuse: 2;
    readonly tangent: 3;
    readonly blendIndices: 13;
    readonly blendWeights: 12;
    readonly texCoord0: 4;
    readonly texCoord1: 5;
    readonly texCoord2: 6;
    readonly texCoord3: 7;
    readonly texCoord4: 8;
    readonly texCoord5: 9;
    readonly texCoord6: 10;
    readonly texCoord7: 11;
    readonly custom0: 14;
    readonly custom1: 15;
};
export type VertexSemantic = keyof typeof vertexAttribNameMap;
export type TextureColorSpace = 'srgb' | 'linear';
export type BufferUsage = 'vertex' | 'index' | 'uniform' | 'read' | 'write';
export interface BaseCreationOptions {
    dynamic?: boolean;
    managed?: boolean;
}
export interface TextureCreationOptions extends BaseCreationOptions {
    colorSpace?: TextureColorSpace;
    noMipmap?: boolean;
    writable?: boolean;
    texture?: BaseTexture;
}
export interface BufferCreationOptions extends BaseCreationOptions {
    usage?: BufferUsage;
    storage?: boolean;
}
export declare function getVertexAttribByName(name: VertexSemantic): number;
export declare function getVertexAttribName(attrib: number): VertexSemantic;
export declare function getVertexFormatSize(fmt: VertexAttribFormat): number;
export declare function getVertexBufferLength(vertexBufferType: PBStructTypeInfo): number;
export declare function getVertexBufferStride(vertexBufferType: PBStructTypeInfo): number;
export declare function getVertexBufferAttribType(vertexBufferType: PBStructTypeInfo, attrib: number): PBPrimitiveTypeInfo;
export declare function makeVertexBufferType(length: number, ...attributes: VertexAttribFormat[]): PBStructTypeInfo;
export type VertexStepMode = 'vertex' | 'instance';
export declare const semanticList: string[];
export declare function semanticToAttrib(semantic: number): string;
export interface TextureMipmapLevelData {
    data: TypedArray;
    width: number;
    height: number;
}
export declare class TextureLoadEvent {
    static readonly NAME = "textureLoad";
    texture: BaseTexture;
    constructor(texture: BaseTexture);
}
export interface TextureMipmapData {
    width: number;
    height: number;
    depth: number;
    isCubemap: boolean;
    isVolume: boolean;
    isCompressed: boolean;
    arraySize: number;
    mipLevels: number;
    format: TextureFormat;
    mipDatas: TextureMipmapLevelData[][];
}
export interface IFrameBufferTextureAttachment {
    texture?: BaseTexture;
    face?: number;
    layer?: number;
    level?: number;
}
export interface IFrameBufferOptions {
    colorAttachments?: IFrameBufferTextureAttachment[];
    depthAttachment?: IFrameBufferTextureAttachment;
}
export interface UniformBufferLayout {
    byteSize: number;
    entries: UniformLayout[];
}
export interface UniformLayout {
    name: string;
    offset: number;
    byteSize: number;
    arraySize: number;
    type: PBPrimitiveType;
    subLayout: UniformBufferLayout;
}
export interface BufferBindingLayout {
    type?: 'uniform' | 'storage' | 'read-only-storage';
    hasDynamicOffset: boolean;
    uniformLayout: UniformBufferLayout;
    minBindingSize?: number;
}
export interface SamplerBindingLayout {
    type: 'filtering' | 'non-filtering' | 'comparison';
}
export interface TextureBindingLayout {
    sampleType: 'float' | 'unfilterable-float' | 'depth' | 'sint' | 'uint';
    viewDimension: '1d' | '2d' | '2d-array' | 'cube' | 'cube-array' | '3d';
    multisampled: boolean;
    autoBindSampler: string;
    autoBindSamplerComparison: string;
}
export interface StorageTextureBindingLayout {
    access: 'write-only';
    format: TextureFormat;
    viewDimension: '1d' | '2d';
}
export interface ExternalTextureBindingLayout {
    autoBindSampler: string;
}
export interface BindGroupLayoutEntry {
    binding: number;
    name: string;
    visibility: number;
    type: PBTypeInfo;
    buffer?: BufferBindingLayout;
    sampler?: SamplerBindingLayout;
    texture?: TextureBindingLayout;
    storageTexture?: StorageTextureBindingLayout;
    externalTexture?: ExternalTextureBindingLayout;
}
export interface BindGroupLayout {
    label?: string;
    nameMap?: {
        [name: string]: string;
    };
    entries: BindGroupLayoutEntry[];
}
export interface BindPointInfo {
    group: number;
    binding: number;
    type: PBTypeInfo;
}
export interface SamplerOptions {
    addressU?: TextureWrapping;
    addressV?: TextureWrapping;
    addressW?: TextureWrapping;
    magFilter?: TextureFilter;
    minFilter?: TextureFilter;
    mipFilter?: TextureFilter;
    lodMin?: number;
    lodMax?: number;
    compare?: CompareFunc;
    maxAnisotropy?: number;
}
export interface GPUObject<T = unknown> {
    readonly device: Device;
    readonly object: T;
    readonly uid: number;
    readonly cid: number;
    readonly disposed: boolean;
    name: string;
    restoreHandler: (tex: GPUObject) => Promise<void>;
    isVAO(): this is VertexInputLayout;
    isFramebuffer(): this is FrameBuffer;
    isSampler(): this is TextureSampler;
    isTexture(): this is BaseTexture;
    isTexture2D(): this is Texture2D;
    isTexture2DArray(): this is Texture2DArray;
    isTexture3D(): this is Texture3D;
    isTextureCube(): this is TextureCube;
    isTextureVideo(): this is TextureVideo;
    isProgram(): this is GPUProgram;
    isBuffer(): this is GPUDataBuffer;
    isBindGroup(): this is BindGroup;
    dispose(): void;
    reload(): Promise<void>;
    destroy(): void;
    restore(): Promise<void>;
}
export interface TextureSampler<T = unknown> extends GPUObject<T> {
    readonly addressModeU: TextureWrapping;
    readonly addressModeV: TextureWrapping;
    readonly addressModeW: TextureWrapping;
    readonly magFilter: TextureFilter;
    readonly minFilter: TextureFilter;
    readonly mipFilter: TextureFilter;
    readonly lodMin: number;
    readonly lodMax: number;
    readonly compare: CompareFunc;
    readonly maxAnisotropy: number;
}
export interface BaseTexture<T = unknown> extends GPUObject<T> {
    readonly target: TextureTarget;
    readonly linearColorSpace: boolean;
    readonly width: number;
    readonly height: number;
    readonly depth: number;
    readonly format: TextureFormat;
    readonly mipLevelCount: number;
    init(): void;
    generateMipmaps(): void;
    isFloatFormat(): boolean;
    isIntegerFormat(): boolean;
    isSignedFormat(): boolean;
    isCompressedFormat(): boolean;
    isFilterable(): boolean;
    isDepth(): boolean;
    getDefaultSampler(comparison: boolean): TextureSampler;
}
export interface Texture2D<T = unknown> extends BaseTexture<T> {
    update(data: TypedArray, xOffset: number, yOffset: number, width: number, height: number): void;
    updateFromElement(data: TextureImageElement, xOffset: number, yOffset: number, x: number, y: number, width: number, height: number): void;
    loadFromElement(element: TextureImageElement, creationFlags?: number): void;
    createWithMipmapData(data: TextureMipmapData, creationFlags?: number): void;
    readPixels(x: number, y: number, w: number, h: number, buffer: TypedArray): Promise<void>;
    readPixelsToBuffer(x: number, y: number, w: number, h: number, buffer: GPUDataBuffer): void;
}
export interface Texture2DArray<T = unknown> extends BaseTexture<T> {
    update(data: TypedArray, xOffset: number, yOffset: number, zOffset: number, width: number, height: number, depth: number): void;
    updateFromElement(data: TextureImageElement, xOffset: number, yOffset: number, layerIndex: number, x: number, y: number, width: number, height: number): void;
    readPixels(layer: number, x: number, y: number, w: number, h: number, buffer: TypedArray): Promise<void>;
    readPixelsToBuffer(layer: number, x: number, y: number, w: number, h: number, buffer: GPUDataBuffer): void;
}
export interface Texture3D<T = unknown> extends BaseTexture<T> {
    update(data: TypedArray, xOffset: number, yOffset: number, zOffset: number, width: number, height: number, depth: number): void;
    readPixels(layer: number, x: number, y: number, w: number, h: number, buffer: TypedArray): Promise<void>;
    readPixelsToBuffer(layer: number, x: number, y: number, w: number, h: number, buffer: GPUDataBuffer): void;
}
export interface TextureCube<T = unknown> extends BaseTexture<T> {
    update(data: TypedArray, xOffset: number, yOffset: number, width: number, height: number, face: CubeFace): void;
    updateFromElement(data: TextureImageElement, xOffset: number, yOffset: number, face: number, x: number, y: number, width: number, height: number): void;
    createWithMipmapData(data: TextureMipmapData, creationFlags?: number): void;
    readPixels(face: number, x: number, y: number, w: number, h: number, buffer: TypedArray): Promise<void>;
    readPixelsToBuffer(face: number, x: number, y: number, w: number, h: number, buffer: GPUDataBuffer): void;
}
export interface TextureVideo<T = unknown> extends BaseTexture<T> {
    readonly source: HTMLVideoElement;
    updateVideoFrame(): boolean;
}
export interface GPUDataBuffer<T = unknown> extends GPUObject<T> {
    readonly byteLength: number;
    readonly usage: number;
    bufferSubData(dstByteOffset: number, data: TypedArray, srcOffset?: number, srcLength?: number): void;
    getBufferSubData(dstBuffer?: Uint8Array, offsetInBytes?: number, sizeInBytes?: number): Promise<Uint8Array>;
}
export interface IndexBuffer<T = unknown> extends GPUDataBuffer<T> {
    readonly indexType: PBPrimitiveTypeInfo;
    readonly length: number;
}
export interface StructuredBuffer<T = unknown> extends GPUDataBuffer<T> {
    structure: PBStructTypeInfo;
    set(name: string, value: StructuredValue): any;
}
export interface VertexInputLayout<T = unknown> extends GPUObject<T> {
    readonly vertexBuffers: {
        [semantic: number]: {
            buffer: GPUDataBuffer;
            offset: number;
        };
    };
    readonly indexBuffer: IndexBuffer;
    getDrawOffset(): number;
    getVertexBuffer(semantic: VertexSemantic): StructuredBuffer;
    getIndexBuffer(): IndexBuffer;
    bind(): void;
    draw(primitiveType: PrimitiveType, first: number, count: number): void;
    drawInstanced(primitiveType: PrimitiveType, first: number, count: number, numInstances: number): any;
}
export interface FrameBuffer<T = unknown> extends GPUObject<T> {
    getViewport(): number[];
    setViewport(vp: number[]): void;
    getWidth(): number;
    getHeight(): number;
    getSampleCount(): number;
    setCubeTextureFace(index: number, face: CubeFace): void;
    setTextureLevel(index: number, level: number): void;
    setTextureLayer(index: number, layer: number): void;
    setDepthTextureLayer(layer: number): void;
    getColorAttachments(): BaseTexture[];
    getDepthAttachment(): BaseTexture;
    bind(): boolean;
    unbind(): void;
}
export interface GPUProgram<T = unknown> extends GPUObject<T> {
    readonly bindGroupLayouts: BindGroupLayout[];
    readonly type: 'render' | 'compute';
    getShaderSource(type: ShaderType): string;
    getCompileError(): string;
    getBindingInfo(name: string): BindPointInfo;
    use(): void;
}
export type StructuredValue = number | TypedArray | VectorBase | {
    [name: string]: StructuredValue;
};
export interface BindGroup extends GPUObject<unknown> {
    getLayout(): BindGroupLayout;
    getBuffer(name: string): StructuredBuffer;
    getTexture(name: string): BaseTexture;
    setBuffer(name: string, buffer: StructuredBuffer): void;
    setValue(name: string, value: StructuredValue): any;
    setRawData(name: string, byteOffset: number, data: TypedArray, srcPos?: number, srcLength?: number): any;
    setTexture(name: string, texture: BaseTexture, sampler?: TextureSampler): any;
    setTextureView(name: string, value: BaseTexture, level?: number, face?: number, mipCount?: number): any;
    setSampler(name: string, sampler: TextureSampler): any;
}
export {};
