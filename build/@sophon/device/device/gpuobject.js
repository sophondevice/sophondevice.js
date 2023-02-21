/** sophon base library */
import { PBPrimitiveType, PBStructTypeInfo, PBArrayTypeInfo, PBPrimitiveTypeInfo } from './builder/types.js';

const MAX_VERTEX_ATTRIBUTES = 16;
const MAX_BINDING_GROUPS = 4;
const MAX_TEXCOORD_INDEX_COUNT = 8;
const VERTEX_ATTRIB_POSITION = 0;
const VERTEX_ATTRIB_NORMAL = 1;
const VERTEX_ATTRIB_DIFFUSE = 2;
const VERTEX_ATTRIB_TANGENT = 3;
const VERTEX_ATTRIB_TEXCOORD0 = 4;
const VERTEX_ATTRIB_TEXCOORD1 = 5;
const VERTEX_ATTRIB_TEXCOORD2 = 6;
const VERTEX_ATTRIB_TEXCOORD3 = 7;
const VERTEX_ATTRIB_TEXCOORD4 = 8;
const VERTEX_ATTRIB_TEXCOORD5 = 9;
const VERTEX_ATTRIB_TEXCOORD6 = 10;
const VERTEX_ATTRIB_TEXCOORD7 = 11;
const VERTEX_ATTRIB_BLEND_WEIGHT = 12;
const VERTEX_ATTRIB_BLEND_INDICES = 13;
const VERTEX_ATTRIB_CUSTOM0 = 14;
const VERTEX_ATTRIB_CUSTOM1 = 15;
const vertexAttribFormatMap = {
    position_u8normx2: [VERTEX_ATTRIB_POSITION, PBPrimitiveType.U8VEC2_NORM, 2],
    position_u8normx4: [VERTEX_ATTRIB_POSITION, PBPrimitiveType.U8VEC4_NORM, 4],
    position_i8normx2: [VERTEX_ATTRIB_POSITION, PBPrimitiveType.I8VEC2_NORM, 2],
    position_i8normx4: [VERTEX_ATTRIB_POSITION, PBPrimitiveType.I8VEC4_NORM, 4],
    position_u16x2: [VERTEX_ATTRIB_POSITION, PBPrimitiveType.U16VEC2, 4],
    position_u16x4: [VERTEX_ATTRIB_POSITION, PBPrimitiveType.U16VEC4, 8],
    position_i16x2: [VERTEX_ATTRIB_POSITION, PBPrimitiveType.I16VEC2, 4],
    position_i16x4: [VERTEX_ATTRIB_POSITION, PBPrimitiveType.I16VEC4, 8],
    position_u16normx2: [VERTEX_ATTRIB_POSITION, PBPrimitiveType.U16VEC2_NORM, 4],
    position_u16normx4: [VERTEX_ATTRIB_POSITION, PBPrimitiveType.U16VEC4_NORM, 8],
    position_i16normx2: [VERTEX_ATTRIB_POSITION, PBPrimitiveType.I16VEC2_NORM, 4],
    position_i16normx4: [VERTEX_ATTRIB_POSITION, PBPrimitiveType.I16VEC4_NORM, 8],
    position_f16x2: [VERTEX_ATTRIB_POSITION, PBPrimitiveType.F16VEC2, 4],
    position_f16x4: [VERTEX_ATTRIB_POSITION, PBPrimitiveType.F16VEC4, 8],
    position_f32: [VERTEX_ATTRIB_POSITION, PBPrimitiveType.F32, 4],
    position_f32x2: [VERTEX_ATTRIB_POSITION, PBPrimitiveType.F32VEC2, 8],
    position_f32x3: [VERTEX_ATTRIB_POSITION, PBPrimitiveType.F32VEC3, 12],
    position_f32x4: [VERTEX_ATTRIB_POSITION, PBPrimitiveType.F32VEC4, 16],
    position_i32: [VERTEX_ATTRIB_POSITION, PBPrimitiveType.I32, 4],
    position_i32x2: [VERTEX_ATTRIB_POSITION, PBPrimitiveType.I32VEC2, 8],
    position_i32x3: [VERTEX_ATTRIB_POSITION, PBPrimitiveType.I32VEC3, 12],
    position_i32x4: [VERTEX_ATTRIB_POSITION, PBPrimitiveType.I32VEC4, 16],
    position_u32: [VERTEX_ATTRIB_POSITION, PBPrimitiveType.U32, 4],
    position_u32x2: [VERTEX_ATTRIB_POSITION, PBPrimitiveType.U32VEC2, 8],
    position_u32x3: [VERTEX_ATTRIB_POSITION, PBPrimitiveType.U32VEC3, 12],
    position_u32x4: [VERTEX_ATTRIB_POSITION, PBPrimitiveType.U32VEC4, 16],
    normal_f16x4: [VERTEX_ATTRIB_NORMAL, PBPrimitiveType.F16VEC4, 8],
    normal_f32x3: [VERTEX_ATTRIB_NORMAL, PBPrimitiveType.F32VEC3, 12],
    normal_f32x4: [VERTEX_ATTRIB_NORMAL, PBPrimitiveType.F32VEC4, 16],
    diffuse_u8normx4: [VERTEX_ATTRIB_DIFFUSE, PBPrimitiveType.U8VEC4_NORM, 4],
    diffuse_u16x4: [VERTEX_ATTRIB_DIFFUSE, PBPrimitiveType.U16VEC4, 8],
    diffuse_u16normx4: [VERTEX_ATTRIB_DIFFUSE, PBPrimitiveType.U16VEC4_NORM, 8],
    diffuse_f16x4: [VERTEX_ATTRIB_DIFFUSE, PBPrimitiveType.F16VEC4, 8],
    diffuse_f32x3: [VERTEX_ATTRIB_DIFFUSE, PBPrimitiveType.F32VEC3, 12],
    diffuse_f32x4: [VERTEX_ATTRIB_DIFFUSE, PBPrimitiveType.F32VEC4, 16],
    diffuse_u32x3: [VERTEX_ATTRIB_DIFFUSE, PBPrimitiveType.U32VEC3, 12],
    diffuse_u32x4: [VERTEX_ATTRIB_DIFFUSE, PBPrimitiveType.U32VEC4, 16],
    tangent_f16x4: [VERTEX_ATTRIB_TANGENT, PBPrimitiveType.F16VEC4, 8],
    tangent_f32x3: [VERTEX_ATTRIB_TANGENT, PBPrimitiveType.F32VEC3, 12],
    tangent_f32x4: [VERTEX_ATTRIB_TANGENT, PBPrimitiveType.F32VEC4, 16],
    tex0_u8normx2: [VERTEX_ATTRIB_TEXCOORD0, PBPrimitiveType.U8VEC2_NORM, 2],
    tex0_u8normx4: [VERTEX_ATTRIB_TEXCOORD0, PBPrimitiveType.U8VEC4_NORM, 4],
    tex0_i8normx2: [VERTEX_ATTRIB_TEXCOORD0, PBPrimitiveType.I8VEC2_NORM, 2],
    tex0_i8normx4: [VERTEX_ATTRIB_TEXCOORD0, PBPrimitiveType.I8VEC4_NORM, 4],
    tex0_u16x2: [VERTEX_ATTRIB_TEXCOORD0, PBPrimitiveType.U16VEC2, 4],
    tex0_u16x4: [VERTEX_ATTRIB_TEXCOORD0, PBPrimitiveType.U16VEC4, 8],
    tex0_i16x2: [VERTEX_ATTRIB_TEXCOORD0, PBPrimitiveType.I16VEC2, 4],
    tex0_i16x4: [VERTEX_ATTRIB_TEXCOORD0, PBPrimitiveType.I16VEC4, 8],
    tex0_u16normx2: [VERTEX_ATTRIB_TEXCOORD0, PBPrimitiveType.U16VEC2_NORM, 4],
    tex0_u16normx4: [VERTEX_ATTRIB_TEXCOORD0, PBPrimitiveType.U16VEC4_NORM, 8],
    tex0_i16normx2: [VERTEX_ATTRIB_TEXCOORD0, PBPrimitiveType.I16VEC2_NORM, 4],
    tex0_i16normx4: [VERTEX_ATTRIB_TEXCOORD0, PBPrimitiveType.I16VEC4_NORM, 8],
    tex0_f16x2: [VERTEX_ATTRIB_TEXCOORD0, PBPrimitiveType.F16VEC2, 4],
    tex0_f16x4: [VERTEX_ATTRIB_TEXCOORD0, PBPrimitiveType.F16VEC4, 8],
    tex0_f32: [VERTEX_ATTRIB_TEXCOORD0, PBPrimitiveType.F32, 4],
    tex0_f32x2: [VERTEX_ATTRIB_TEXCOORD0, PBPrimitiveType.F32VEC2, 8],
    tex0_f32x3: [VERTEX_ATTRIB_TEXCOORD0, PBPrimitiveType.F32VEC3, 12],
    tex0_f32x4: [VERTEX_ATTRIB_TEXCOORD0, PBPrimitiveType.F32VEC4, 16],
    tex0_i32: [VERTEX_ATTRIB_TEXCOORD0, PBPrimitiveType.I32, 4],
    tex0_i32x2: [VERTEX_ATTRIB_TEXCOORD0, PBPrimitiveType.I32VEC2, 8],
    tex0_i32x3: [VERTEX_ATTRIB_TEXCOORD0, PBPrimitiveType.I32VEC3, 12],
    tex0_i32x4: [VERTEX_ATTRIB_TEXCOORD0, PBPrimitiveType.I32VEC4, 16],
    tex0_u32: [VERTEX_ATTRIB_TEXCOORD0, PBPrimitiveType.U32, 4],
    tex0_u32x2: [VERTEX_ATTRIB_TEXCOORD0, PBPrimitiveType.U32VEC2, 8],
    tex0_u32x3: [VERTEX_ATTRIB_TEXCOORD0, PBPrimitiveType.U32VEC3, 12],
    tex0_u32x4: [VERTEX_ATTRIB_TEXCOORD0, PBPrimitiveType.U32VEC4, 16],
    tex1_u8normx2: [VERTEX_ATTRIB_TEXCOORD1, PBPrimitiveType.U8VEC2_NORM, 2],
    tex1_u8normx4: [VERTEX_ATTRIB_TEXCOORD1, PBPrimitiveType.U8VEC4_NORM, 4],
    tex1_i8normx2: [VERTEX_ATTRIB_TEXCOORD1, PBPrimitiveType.I8VEC2_NORM, 2],
    tex1_i8normx4: [VERTEX_ATTRIB_TEXCOORD1, PBPrimitiveType.I8VEC4_NORM, 4],
    tex1_u16x2: [VERTEX_ATTRIB_TEXCOORD1, PBPrimitiveType.U16VEC2, 4],
    tex1_u16x4: [VERTEX_ATTRIB_TEXCOORD1, PBPrimitiveType.U16VEC4, 8],
    tex1_i16x2: [VERTEX_ATTRIB_TEXCOORD1, PBPrimitiveType.I16VEC2, 4],
    tex1_i16x4: [VERTEX_ATTRIB_TEXCOORD1, PBPrimitiveType.I16VEC4, 8],
    tex1_u16normx2: [VERTEX_ATTRIB_TEXCOORD1, PBPrimitiveType.U16VEC2_NORM, 4],
    tex1_u16normx4: [VERTEX_ATTRIB_TEXCOORD1, PBPrimitiveType.U16VEC4_NORM, 8],
    tex1_i16normx2: [VERTEX_ATTRIB_TEXCOORD1, PBPrimitiveType.I16VEC2_NORM, 4],
    tex1_i16normx4: [VERTEX_ATTRIB_TEXCOORD1, PBPrimitiveType.I16VEC4_NORM, 8],
    tex1_f16x2: [VERTEX_ATTRIB_TEXCOORD1, PBPrimitiveType.F16VEC2, 4],
    tex1_f16x4: [VERTEX_ATTRIB_TEXCOORD1, PBPrimitiveType.F16VEC4, 8],
    tex1_f32: [VERTEX_ATTRIB_TEXCOORD1, PBPrimitiveType.F32, 4],
    tex1_f32x2: [VERTEX_ATTRIB_TEXCOORD1, PBPrimitiveType.F32VEC2, 8],
    tex1_f32x3: [VERTEX_ATTRIB_TEXCOORD1, PBPrimitiveType.F32VEC3, 12],
    tex1_f32x4: [VERTEX_ATTRIB_TEXCOORD1, PBPrimitiveType.F32VEC4, 16],
    tex1_i32: [VERTEX_ATTRIB_TEXCOORD1, PBPrimitiveType.I32, 4],
    tex1_i32x2: [VERTEX_ATTRIB_TEXCOORD1, PBPrimitiveType.I32VEC2, 8],
    tex1_i32x3: [VERTEX_ATTRIB_TEXCOORD1, PBPrimitiveType.I32VEC3, 12],
    tex1_i32x4: [VERTEX_ATTRIB_TEXCOORD1, PBPrimitiveType.I32VEC4, 16],
    tex1_u32: [VERTEX_ATTRIB_TEXCOORD1, PBPrimitiveType.U32, 4],
    tex1_u32x2: [VERTEX_ATTRIB_TEXCOORD1, PBPrimitiveType.U32VEC2, 8],
    tex1_u32x3: [VERTEX_ATTRIB_TEXCOORD1, PBPrimitiveType.U32VEC3, 12],
    tex1_u32x4: [VERTEX_ATTRIB_TEXCOORD1, PBPrimitiveType.U32VEC4, 16],
    tex2_u8normx2: [VERTEX_ATTRIB_TEXCOORD2, PBPrimitiveType.U8VEC2_NORM, 2],
    tex2_u8normx4: [VERTEX_ATTRIB_TEXCOORD2, PBPrimitiveType.U8VEC4_NORM, 4],
    tex2_i8normx2: [VERTEX_ATTRIB_TEXCOORD2, PBPrimitiveType.I8VEC2_NORM, 2],
    tex2_i8normx4: [VERTEX_ATTRIB_TEXCOORD2, PBPrimitiveType.I8VEC4_NORM, 4],
    tex2_u16x2: [VERTEX_ATTRIB_TEXCOORD2, PBPrimitiveType.U16VEC2, 4],
    tex2_u16x4: [VERTEX_ATTRIB_TEXCOORD2, PBPrimitiveType.U16VEC4, 8],
    tex2_i16x2: [VERTEX_ATTRIB_TEXCOORD2, PBPrimitiveType.I16VEC2, 4],
    tex2_i16x4: [VERTEX_ATTRIB_TEXCOORD2, PBPrimitiveType.I16VEC4, 8],
    tex2_u16normx2: [VERTEX_ATTRIB_TEXCOORD2, PBPrimitiveType.U16VEC2_NORM, 4],
    tex2_u16normx4: [VERTEX_ATTRIB_TEXCOORD2, PBPrimitiveType.U16VEC4_NORM, 8],
    tex2_i16normx2: [VERTEX_ATTRIB_TEXCOORD2, PBPrimitiveType.I16VEC2_NORM, 4],
    tex2_i16normx4: [VERTEX_ATTRIB_TEXCOORD2, PBPrimitiveType.I16VEC4_NORM, 8],
    tex2_f16x2: [VERTEX_ATTRIB_TEXCOORD2, PBPrimitiveType.F16VEC2, 4],
    tex2_f16x4: [VERTEX_ATTRIB_TEXCOORD2, PBPrimitiveType.F16VEC4, 8],
    tex2_f32: [VERTEX_ATTRIB_TEXCOORD2, PBPrimitiveType.F32, 4],
    tex2_f32x2: [VERTEX_ATTRIB_TEXCOORD2, PBPrimitiveType.F32VEC2, 8],
    tex2_f32x3: [VERTEX_ATTRIB_TEXCOORD2, PBPrimitiveType.F32VEC3, 12],
    tex2_f32x4: [VERTEX_ATTRIB_TEXCOORD2, PBPrimitiveType.F32VEC4, 16],
    tex2_i32: [VERTEX_ATTRIB_TEXCOORD2, PBPrimitiveType.I32, 4],
    tex2_i32x2: [VERTEX_ATTRIB_TEXCOORD2, PBPrimitiveType.I32VEC2, 8],
    tex2_i32x3: [VERTEX_ATTRIB_TEXCOORD2, PBPrimitiveType.I32VEC3, 12],
    tex2_i32x4: [VERTEX_ATTRIB_TEXCOORD2, PBPrimitiveType.I32VEC4, 16],
    tex2_u32: [VERTEX_ATTRIB_TEXCOORD2, PBPrimitiveType.U32, 4],
    tex2_u32x2: [VERTEX_ATTRIB_TEXCOORD2, PBPrimitiveType.U32VEC2, 8],
    tex2_u32x3: [VERTEX_ATTRIB_TEXCOORD2, PBPrimitiveType.U32VEC3, 12],
    tex2_u32x4: [VERTEX_ATTRIB_TEXCOORD2, PBPrimitiveType.U32VEC4, 16],
    tex3_u8normx2: [VERTEX_ATTRIB_TEXCOORD3, PBPrimitiveType.U8VEC2_NORM, 2],
    tex3_u8normx4: [VERTEX_ATTRIB_TEXCOORD3, PBPrimitiveType.U8VEC4_NORM, 4],
    tex3_i8normx2: [VERTEX_ATTRIB_TEXCOORD3, PBPrimitiveType.I8VEC2_NORM, 2],
    tex3_i8normx4: [VERTEX_ATTRIB_TEXCOORD3, PBPrimitiveType.I8VEC4_NORM, 4],
    tex3_u16x2: [VERTEX_ATTRIB_TEXCOORD3, PBPrimitiveType.U16VEC2, 4],
    tex3_u16x4: [VERTEX_ATTRIB_TEXCOORD3, PBPrimitiveType.U16VEC4, 8],
    tex3_i16x2: [VERTEX_ATTRIB_TEXCOORD3, PBPrimitiveType.I16VEC2, 4],
    tex3_i16x4: [VERTEX_ATTRIB_TEXCOORD3, PBPrimitiveType.I16VEC4, 8],
    tex3_u16normx2: [VERTEX_ATTRIB_TEXCOORD3, PBPrimitiveType.U16VEC2_NORM, 4],
    tex3_u16normx4: [VERTEX_ATTRIB_TEXCOORD3, PBPrimitiveType.U16VEC4_NORM, 8],
    tex3_i16normx2: [VERTEX_ATTRIB_TEXCOORD3, PBPrimitiveType.I16VEC2_NORM, 4],
    tex3_i16normx4: [VERTEX_ATTRIB_TEXCOORD3, PBPrimitiveType.I16VEC4_NORM, 8],
    tex3_f16x2: [VERTEX_ATTRIB_TEXCOORD3, PBPrimitiveType.F16VEC2, 4],
    tex3_f16x4: [VERTEX_ATTRIB_TEXCOORD3, PBPrimitiveType.F16VEC4, 8],
    tex3_f32: [VERTEX_ATTRIB_TEXCOORD3, PBPrimitiveType.F32, 4],
    tex3_f32x2: [VERTEX_ATTRIB_TEXCOORD3, PBPrimitiveType.F32VEC2, 8],
    tex3_f32x3: [VERTEX_ATTRIB_TEXCOORD3, PBPrimitiveType.F32VEC3, 12],
    tex3_f32x4: [VERTEX_ATTRIB_TEXCOORD3, PBPrimitiveType.F32VEC4, 16],
    tex3_i32: [VERTEX_ATTRIB_TEXCOORD3, PBPrimitiveType.I32, 4],
    tex3_i32x2: [VERTEX_ATTRIB_TEXCOORD3, PBPrimitiveType.I32VEC2, 8],
    tex3_i32x3: [VERTEX_ATTRIB_TEXCOORD3, PBPrimitiveType.I32VEC3, 12],
    tex3_i32x4: [VERTEX_ATTRIB_TEXCOORD3, PBPrimitiveType.I32VEC4, 16],
    tex3_u32: [VERTEX_ATTRIB_TEXCOORD3, PBPrimitiveType.U32, 4],
    tex3_u32x2: [VERTEX_ATTRIB_TEXCOORD3, PBPrimitiveType.U32VEC2, 8],
    tex3_u32x3: [VERTEX_ATTRIB_TEXCOORD3, PBPrimitiveType.U32VEC3, 12],
    tex3_u32x4: [VERTEX_ATTRIB_TEXCOORD3, PBPrimitiveType.U32VEC4, 16],
    tex4_u8normx2: [VERTEX_ATTRIB_TEXCOORD4, PBPrimitiveType.U8VEC2_NORM, 2],
    tex4_u8normx4: [VERTEX_ATTRIB_TEXCOORD4, PBPrimitiveType.U8VEC4_NORM, 4],
    tex4_i8normx2: [VERTEX_ATTRIB_TEXCOORD4, PBPrimitiveType.I8VEC2_NORM, 2],
    tex4_i8normx4: [VERTEX_ATTRIB_TEXCOORD4, PBPrimitiveType.I8VEC4_NORM, 4],
    tex4_u16x2: [VERTEX_ATTRIB_TEXCOORD4, PBPrimitiveType.U16VEC2, 4],
    tex4_u16x4: [VERTEX_ATTRIB_TEXCOORD4, PBPrimitiveType.U16VEC4, 8],
    tex4_i16x2: [VERTEX_ATTRIB_TEXCOORD4, PBPrimitiveType.I16VEC2, 4],
    tex4_i16x4: [VERTEX_ATTRIB_TEXCOORD4, PBPrimitiveType.I16VEC4, 8],
    tex4_u16normx2: [VERTEX_ATTRIB_TEXCOORD4, PBPrimitiveType.U16VEC2_NORM, 4],
    tex4_u16normx4: [VERTEX_ATTRIB_TEXCOORD4, PBPrimitiveType.U16VEC4_NORM, 8],
    tex4_i16normx2: [VERTEX_ATTRIB_TEXCOORD4, PBPrimitiveType.I16VEC2_NORM, 4],
    tex4_i16normx4: [VERTEX_ATTRIB_TEXCOORD4, PBPrimitiveType.I16VEC4_NORM, 8],
    tex4_f16x2: [VERTEX_ATTRIB_TEXCOORD4, PBPrimitiveType.F16VEC2, 4],
    tex4_f16x4: [VERTEX_ATTRIB_TEXCOORD4, PBPrimitiveType.F16VEC4, 8],
    tex4_f32: [VERTEX_ATTRIB_TEXCOORD4, PBPrimitiveType.F32, 4],
    tex4_f32x2: [VERTEX_ATTRIB_TEXCOORD4, PBPrimitiveType.F32VEC2, 8],
    tex4_f32x3: [VERTEX_ATTRIB_TEXCOORD4, PBPrimitiveType.F32VEC3, 12],
    tex4_f32x4: [VERTEX_ATTRIB_TEXCOORD4, PBPrimitiveType.F32VEC4, 16],
    tex4_i32: [VERTEX_ATTRIB_TEXCOORD4, PBPrimitiveType.I32, 4],
    tex4_i32x2: [VERTEX_ATTRIB_TEXCOORD4, PBPrimitiveType.I32VEC2, 8],
    tex4_i32x3: [VERTEX_ATTRIB_TEXCOORD4, PBPrimitiveType.I32VEC3, 12],
    tex4_i32x4: [VERTEX_ATTRIB_TEXCOORD4, PBPrimitiveType.I32VEC4, 16],
    tex4_u32: [VERTEX_ATTRIB_TEXCOORD4, PBPrimitiveType.U32, 4],
    tex4_u32x2: [VERTEX_ATTRIB_TEXCOORD4, PBPrimitiveType.U32VEC2, 8],
    tex4_u32x3: [VERTEX_ATTRIB_TEXCOORD4, PBPrimitiveType.U32VEC3, 12],
    tex4_u32x4: [VERTEX_ATTRIB_TEXCOORD4, PBPrimitiveType.U32VEC4, 16],
    tex5_u8normx2: [VERTEX_ATTRIB_TEXCOORD5, PBPrimitiveType.U8VEC2_NORM, 2],
    tex5_u8normx4: [VERTEX_ATTRIB_TEXCOORD5, PBPrimitiveType.U8VEC4_NORM, 4],
    tex5_i8normx2: [VERTEX_ATTRIB_TEXCOORD5, PBPrimitiveType.I8VEC2_NORM, 2],
    tex5_i8normx4: [VERTEX_ATTRIB_TEXCOORD5, PBPrimitiveType.I8VEC4_NORM, 4],
    tex5_u16x2: [VERTEX_ATTRIB_TEXCOORD5, PBPrimitiveType.U16VEC2, 4],
    tex5_u16x4: [VERTEX_ATTRIB_TEXCOORD5, PBPrimitiveType.U16VEC4, 8],
    tex5_i16x2: [VERTEX_ATTRIB_TEXCOORD5, PBPrimitiveType.I16VEC2, 4],
    tex5_i16x4: [VERTEX_ATTRIB_TEXCOORD5, PBPrimitiveType.I16VEC4, 8],
    tex5_u16normx2: [VERTEX_ATTRIB_TEXCOORD5, PBPrimitiveType.U16VEC2_NORM, 4],
    tex5_u16normx4: [VERTEX_ATTRIB_TEXCOORD5, PBPrimitiveType.U16VEC4_NORM, 8],
    tex5_i16normx2: [VERTEX_ATTRIB_TEXCOORD5, PBPrimitiveType.I16VEC2_NORM, 4],
    tex5_i16normx4: [VERTEX_ATTRIB_TEXCOORD5, PBPrimitiveType.I16VEC4_NORM, 8],
    tex5_f16x2: [VERTEX_ATTRIB_TEXCOORD5, PBPrimitiveType.F16VEC2, 4],
    tex5_f16x4: [VERTEX_ATTRIB_TEXCOORD5, PBPrimitiveType.F16VEC4, 8],
    tex5_f32: [VERTEX_ATTRIB_TEXCOORD5, PBPrimitiveType.F32, 4],
    tex5_f32x2: [VERTEX_ATTRIB_TEXCOORD5, PBPrimitiveType.F32VEC2, 8],
    tex5_f32x3: [VERTEX_ATTRIB_TEXCOORD5, PBPrimitiveType.F32VEC3, 12],
    tex5_f32x4: [VERTEX_ATTRIB_TEXCOORD5, PBPrimitiveType.F32VEC4, 16],
    tex5_i32: [VERTEX_ATTRIB_TEXCOORD5, PBPrimitiveType.I32, 4],
    tex5_i32x2: [VERTEX_ATTRIB_TEXCOORD5, PBPrimitiveType.I32VEC2, 8],
    tex5_i32x3: [VERTEX_ATTRIB_TEXCOORD5, PBPrimitiveType.I32VEC3, 12],
    tex5_i32x4: [VERTEX_ATTRIB_TEXCOORD5, PBPrimitiveType.I32VEC4, 16],
    tex5_u32: [VERTEX_ATTRIB_TEXCOORD5, PBPrimitiveType.U32, 4],
    tex5_u32x2: [VERTEX_ATTRIB_TEXCOORD5, PBPrimitiveType.U32VEC2, 8],
    tex5_u32x3: [VERTEX_ATTRIB_TEXCOORD5, PBPrimitiveType.U32VEC3, 12],
    tex5_u32x4: [VERTEX_ATTRIB_TEXCOORD5, PBPrimitiveType.U32VEC4, 16],
    tex6_u8normx2: [VERTEX_ATTRIB_TEXCOORD6, PBPrimitiveType.U8VEC2_NORM, 2],
    tex6_u8normx4: [VERTEX_ATTRIB_TEXCOORD6, PBPrimitiveType.U8VEC4_NORM, 4],
    tex6_i8normx2: [VERTEX_ATTRIB_TEXCOORD6, PBPrimitiveType.I8VEC2_NORM, 2],
    tex6_i8normx4: [VERTEX_ATTRIB_TEXCOORD6, PBPrimitiveType.I8VEC4_NORM, 4],
    tex6_u16x2: [VERTEX_ATTRIB_TEXCOORD6, PBPrimitiveType.U16VEC2, 4],
    tex6_u16x4: [VERTEX_ATTRIB_TEXCOORD6, PBPrimitiveType.U16VEC4, 8],
    tex6_i16x2: [VERTEX_ATTRIB_TEXCOORD6, PBPrimitiveType.I16VEC2, 4],
    tex6_i16x4: [VERTEX_ATTRIB_TEXCOORD6, PBPrimitiveType.I16VEC4, 8],
    tex6_u16normx2: [VERTEX_ATTRIB_TEXCOORD6, PBPrimitiveType.U16VEC2_NORM, 4],
    tex6_u16normx4: [VERTEX_ATTRIB_TEXCOORD6, PBPrimitiveType.U16VEC4_NORM, 8],
    tex6_i16normx2: [VERTEX_ATTRIB_TEXCOORD6, PBPrimitiveType.I16VEC2_NORM, 4],
    tex6_i16normx4: [VERTEX_ATTRIB_TEXCOORD6, PBPrimitiveType.I16VEC4_NORM, 8],
    tex6_f16x2: [VERTEX_ATTRIB_TEXCOORD6, PBPrimitiveType.F16VEC2, 4],
    tex6_f16x4: [VERTEX_ATTRIB_TEXCOORD6, PBPrimitiveType.F16VEC4, 8],
    tex6_f32: [VERTEX_ATTRIB_TEXCOORD6, PBPrimitiveType.F32, 4],
    tex6_f32x2: [VERTEX_ATTRIB_TEXCOORD6, PBPrimitiveType.F32VEC2, 8],
    tex6_f32x3: [VERTEX_ATTRIB_TEXCOORD6, PBPrimitiveType.F32VEC3, 12],
    tex6_f32x4: [VERTEX_ATTRIB_TEXCOORD6, PBPrimitiveType.F32VEC4, 16],
    tex6_i32: [VERTEX_ATTRIB_TEXCOORD6, PBPrimitiveType.I32, 4],
    tex6_i32x2: [VERTEX_ATTRIB_TEXCOORD6, PBPrimitiveType.I32VEC2, 8],
    tex6_i32x3: [VERTEX_ATTRIB_TEXCOORD6, PBPrimitiveType.I32VEC3, 12],
    tex6_i32x4: [VERTEX_ATTRIB_TEXCOORD6, PBPrimitiveType.I32VEC4, 16],
    tex6_u32: [VERTEX_ATTRIB_TEXCOORD6, PBPrimitiveType.U32, 4],
    tex6_u32x2: [VERTEX_ATTRIB_TEXCOORD6, PBPrimitiveType.U32VEC2, 8],
    tex6_u32x3: [VERTEX_ATTRIB_TEXCOORD6, PBPrimitiveType.U32VEC3, 12],
    tex6_u32x4: [VERTEX_ATTRIB_TEXCOORD6, PBPrimitiveType.U32VEC4, 16],
    tex7_u8normx2: [VERTEX_ATTRIB_TEXCOORD7, PBPrimitiveType.U8VEC2_NORM, 2],
    tex7_u8normx4: [VERTEX_ATTRIB_TEXCOORD7, PBPrimitiveType.U8VEC4_NORM, 4],
    tex7_i8normx2: [VERTEX_ATTRIB_TEXCOORD7, PBPrimitiveType.I8VEC2_NORM, 2],
    tex7_i8normx4: [VERTEX_ATTRIB_TEXCOORD7, PBPrimitiveType.I8VEC4_NORM, 4],
    tex7_u16x2: [VERTEX_ATTRIB_TEXCOORD7, PBPrimitiveType.U16VEC2, 4],
    tex7_u16x4: [VERTEX_ATTRIB_TEXCOORD7, PBPrimitiveType.U16VEC4, 8],
    tex7_i16x2: [VERTEX_ATTRIB_TEXCOORD7, PBPrimitiveType.I16VEC2, 4],
    tex7_i16x4: [VERTEX_ATTRIB_TEXCOORD7, PBPrimitiveType.I16VEC4, 8],
    tex7_u16normx2: [VERTEX_ATTRIB_TEXCOORD7, PBPrimitiveType.U16VEC2_NORM, 4],
    tex7_u16normx4: [VERTEX_ATTRIB_TEXCOORD7, PBPrimitiveType.U16VEC4_NORM, 8],
    tex7_i16normx2: [VERTEX_ATTRIB_TEXCOORD7, PBPrimitiveType.I16VEC2_NORM, 4],
    tex7_i16normx4: [VERTEX_ATTRIB_TEXCOORD7, PBPrimitiveType.I16VEC4_NORM, 8],
    tex7_f16x2: [VERTEX_ATTRIB_TEXCOORD7, PBPrimitiveType.F16VEC2, 4],
    tex7_f16x4: [VERTEX_ATTRIB_TEXCOORD7, PBPrimitiveType.F16VEC4, 8],
    tex7_f32: [VERTEX_ATTRIB_TEXCOORD7, PBPrimitiveType.F32, 4],
    tex7_f32x2: [VERTEX_ATTRIB_TEXCOORD7, PBPrimitiveType.F32VEC2, 8],
    tex7_f32x3: [VERTEX_ATTRIB_TEXCOORD7, PBPrimitiveType.F32VEC3, 12],
    tex7_f32x4: [VERTEX_ATTRIB_TEXCOORD7, PBPrimitiveType.F32VEC4, 16],
    tex7_i32: [VERTEX_ATTRIB_TEXCOORD7, PBPrimitiveType.I32, 4],
    tex7_i32x2: [VERTEX_ATTRIB_TEXCOORD7, PBPrimitiveType.I32VEC2, 8],
    tex7_i32x3: [VERTEX_ATTRIB_TEXCOORD7, PBPrimitiveType.I32VEC3, 12],
    tex7_i32x4: [VERTEX_ATTRIB_TEXCOORD7, PBPrimitiveType.I32VEC4, 16],
    tex7_u32: [VERTEX_ATTRIB_TEXCOORD7, PBPrimitiveType.U32, 4],
    tex7_u32x2: [VERTEX_ATTRIB_TEXCOORD7, PBPrimitiveType.U32VEC2, 8],
    tex7_u32x3: [VERTEX_ATTRIB_TEXCOORD7, PBPrimitiveType.U32VEC3, 12],
    tex7_u32x4: [VERTEX_ATTRIB_TEXCOORD7, PBPrimitiveType.U32VEC4, 16],
    blendweights_f16x4: [VERTEX_ATTRIB_BLEND_WEIGHT, PBPrimitiveType.F16VEC4, 8],
    blendweights_f32x4: [VERTEX_ATTRIB_BLEND_WEIGHT, PBPrimitiveType.F32VEC4, 16],
    blendindices_u16x4: [VERTEX_ATTRIB_BLEND_INDICES, PBPrimitiveType.U16VEC4, 8],
    blendindices_f16x4: [VERTEX_ATTRIB_BLEND_INDICES, PBPrimitiveType.F16VEC4, 8],
    blendindices_f32x4: [VERTEX_ATTRIB_BLEND_INDICES, PBPrimitiveType.F32VEC4, 16],
    blendindices_u32x4: [VERTEX_ATTRIB_BLEND_INDICES, PBPrimitiveType.U32VEC4, 16],
    custom0_u8normx2: [VERTEX_ATTRIB_CUSTOM0, PBPrimitiveType.U8VEC2_NORM, 2],
    custom0_u8normx4: [VERTEX_ATTRIB_CUSTOM0, PBPrimitiveType.U8VEC4_NORM, 4],
    custom0_i8normx2: [VERTEX_ATTRIB_CUSTOM0, PBPrimitiveType.I8VEC2_NORM, 2],
    custom0_i8normx4: [VERTEX_ATTRIB_CUSTOM0, PBPrimitiveType.I8VEC4_NORM, 4],
    custom0_u16x2: [VERTEX_ATTRIB_CUSTOM0, PBPrimitiveType.U16VEC2, 4],
    custom0_u16x4: [VERTEX_ATTRIB_CUSTOM0, PBPrimitiveType.U16VEC4, 8],
    custom0_i16x2: [VERTEX_ATTRIB_CUSTOM0, PBPrimitiveType.I16VEC2, 4],
    custom0_i16x4: [VERTEX_ATTRIB_CUSTOM0, PBPrimitiveType.I16VEC4, 8],
    custom0_u16normx2: [VERTEX_ATTRIB_CUSTOM0, PBPrimitiveType.U16VEC2_NORM, 4],
    custom0_u16normx4: [VERTEX_ATTRIB_CUSTOM0, PBPrimitiveType.U16VEC4_NORM, 8],
    custom0_i16normx2: [VERTEX_ATTRIB_CUSTOM0, PBPrimitiveType.I16VEC2_NORM, 4],
    custom0_i16normx4: [VERTEX_ATTRIB_CUSTOM0, PBPrimitiveType.I16VEC4_NORM, 8],
    custom0_f16x2: [VERTEX_ATTRIB_CUSTOM0, PBPrimitiveType.F16VEC2, 4],
    custom0_f16x4: [VERTEX_ATTRIB_CUSTOM0, PBPrimitiveType.F16VEC4, 8],
    custom0_f32: [VERTEX_ATTRIB_CUSTOM0, PBPrimitiveType.F32, 4],
    custom0_f32x2: [VERTEX_ATTRIB_CUSTOM0, PBPrimitiveType.F32VEC2, 8],
    custom0_f32x3: [VERTEX_ATTRIB_CUSTOM0, PBPrimitiveType.F32VEC3, 12],
    custom0_f32x4: [VERTEX_ATTRIB_CUSTOM0, PBPrimitiveType.F32VEC4, 16],
    custom0_i32: [VERTEX_ATTRIB_CUSTOM0, PBPrimitiveType.I32, 4],
    custom0_i32x2: [VERTEX_ATTRIB_CUSTOM0, PBPrimitiveType.I32VEC2, 8],
    custom0_i32x3: [VERTEX_ATTRIB_CUSTOM0, PBPrimitiveType.I32VEC3, 12],
    custom0_i32x4: [VERTEX_ATTRIB_CUSTOM0, PBPrimitiveType.I32VEC4, 16],
    custom0_u32: [VERTEX_ATTRIB_CUSTOM0, PBPrimitiveType.U32, 4],
    custom0_u32x2: [VERTEX_ATTRIB_CUSTOM0, PBPrimitiveType.U32VEC2, 8],
    custom0_u32x3: [VERTEX_ATTRIB_CUSTOM0, PBPrimitiveType.U32VEC3, 12],
    custom0_u32x4: [VERTEX_ATTRIB_CUSTOM0, PBPrimitiveType.U32VEC4, 16],
    custom1_u8normx2: [VERTEX_ATTRIB_CUSTOM1, PBPrimitiveType.U8VEC2_NORM, 2],
    custom1_u8normx4: [VERTEX_ATTRIB_CUSTOM1, PBPrimitiveType.U8VEC4_NORM, 4],
    custom1_i8normx2: [VERTEX_ATTRIB_CUSTOM1, PBPrimitiveType.I8VEC2_NORM, 2],
    custom1_i8normx4: [VERTEX_ATTRIB_CUSTOM1, PBPrimitiveType.I8VEC4_NORM, 4],
    custom1_u16x2: [VERTEX_ATTRIB_CUSTOM1, PBPrimitiveType.U16VEC2, 4],
    custom1_u16x4: [VERTEX_ATTRIB_CUSTOM1, PBPrimitiveType.U16VEC4, 8],
    custom1_i16x2: [VERTEX_ATTRIB_CUSTOM1, PBPrimitiveType.I16VEC2, 4],
    custom1_i16x4: [VERTEX_ATTRIB_CUSTOM1, PBPrimitiveType.I16VEC4, 8],
    custom1_u16normx2: [VERTEX_ATTRIB_CUSTOM1, PBPrimitiveType.U16VEC2_NORM, 4],
    custom1_u16normx4: [VERTEX_ATTRIB_CUSTOM1, PBPrimitiveType.U16VEC4_NORM, 8],
    custom1_i16normx2: [VERTEX_ATTRIB_CUSTOM1, PBPrimitiveType.I16VEC2_NORM, 4],
    custom1_i16normx4: [VERTEX_ATTRIB_CUSTOM1, PBPrimitiveType.I16VEC4_NORM, 8],
    custom1_f16x2: [VERTEX_ATTRIB_CUSTOM1, PBPrimitiveType.F16VEC2, 4],
    custom1_f16x4: [VERTEX_ATTRIB_CUSTOM1, PBPrimitiveType.F16VEC4, 8],
    custom1_f32: [VERTEX_ATTRIB_CUSTOM1, PBPrimitiveType.F32, 4],
    custom1_f32x2: [VERTEX_ATTRIB_CUSTOM1, PBPrimitiveType.F32VEC2, 8],
    custom1_f32x3: [VERTEX_ATTRIB_CUSTOM1, PBPrimitiveType.F32VEC3, 12],
    custom1_f32x4: [VERTEX_ATTRIB_CUSTOM1, PBPrimitiveType.F32VEC4, 16],
    custom1_i32: [VERTEX_ATTRIB_CUSTOM1, PBPrimitiveType.I32, 4],
    custom1_i32x2: [VERTEX_ATTRIB_CUSTOM1, PBPrimitiveType.I32VEC2, 8],
    custom1_i32x3: [VERTEX_ATTRIB_CUSTOM1, PBPrimitiveType.I32VEC3, 12],
    custom1_i32x4: [VERTEX_ATTRIB_CUSTOM1, PBPrimitiveType.I32VEC4, 16],
    custom1_u32: [VERTEX_ATTRIB_CUSTOM1, PBPrimitiveType.U32, 4],
    custom1_u32x2: [VERTEX_ATTRIB_CUSTOM1, PBPrimitiveType.U32VEC2, 8],
    custom1_u32x3: [VERTEX_ATTRIB_CUSTOM1, PBPrimitiveType.U32VEC3, 12],
    custom1_u32x4: [VERTEX_ATTRIB_CUSTOM1, PBPrimitiveType.U32VEC4, 16],
};
const vertexAttribNameMap = {
    position: VERTEX_ATTRIB_POSITION,
    normal: VERTEX_ATTRIB_NORMAL,
    diffuse: VERTEX_ATTRIB_DIFFUSE,
    tangent: VERTEX_ATTRIB_TANGENT,
    blendIndices: VERTEX_ATTRIB_BLEND_INDICES,
    blendWeights: VERTEX_ATTRIB_BLEND_WEIGHT,
    texCoord0: VERTEX_ATTRIB_TEXCOORD0,
    texCoord1: VERTEX_ATTRIB_TEXCOORD1,
    texCoord2: VERTEX_ATTRIB_TEXCOORD2,
    texCoord3: VERTEX_ATTRIB_TEXCOORD3,
    texCoord4: VERTEX_ATTRIB_TEXCOORD4,
    texCoord5: VERTEX_ATTRIB_TEXCOORD5,
    texCoord6: VERTEX_ATTRIB_TEXCOORD6,
    texCoord7: VERTEX_ATTRIB_TEXCOORD7,
    custom0: VERTEX_ATTRIB_CUSTOM0,
    custom1: VERTEX_ATTRIB_CUSTOM1,
};
const vertexAttribNameRevMap = {
    [VERTEX_ATTRIB_POSITION]: 'position',
    [VERTEX_ATTRIB_NORMAL]: 'normal',
    [VERTEX_ATTRIB_DIFFUSE]: 'diffuse',
    [VERTEX_ATTRIB_TANGENT]: 'tangent',
    [VERTEX_ATTRIB_BLEND_INDICES]: 'blendIndices',
    [VERTEX_ATTRIB_BLEND_WEIGHT]: 'blendWeights',
    [VERTEX_ATTRIB_TEXCOORD0]: 'texCoord0',
    [VERTEX_ATTRIB_TEXCOORD1]: 'texCoord1',
    [VERTEX_ATTRIB_TEXCOORD2]: 'texCoord2',
    [VERTEX_ATTRIB_TEXCOORD3]: 'texCoord3',
    [VERTEX_ATTRIB_TEXCOORD4]: 'texCoord4',
    [VERTEX_ATTRIB_TEXCOORD5]: 'texCoord5',
    [VERTEX_ATTRIB_TEXCOORD6]: 'texCoord6',
    [VERTEX_ATTRIB_TEXCOORD7]: 'texCoord7',
    [VERTEX_ATTRIB_CUSTOM0]: 'custom0',
    [VERTEX_ATTRIB_CUSTOM1]: 'custom1',
};
var GPUResourceUsageFlags;
(function (GPUResourceUsageFlags) {
    GPUResourceUsageFlags[GPUResourceUsageFlags["TF_LINEAR_COLOR_SPACE"] = 2] = "TF_LINEAR_COLOR_SPACE";
    GPUResourceUsageFlags[GPUResourceUsageFlags["TF_NO_MIPMAP"] = 4] = "TF_NO_MIPMAP";
    GPUResourceUsageFlags[GPUResourceUsageFlags["TF_WRITABLE"] = 8] = "TF_WRITABLE";
    GPUResourceUsageFlags[GPUResourceUsageFlags["TF_NO_GC"] = 16] = "TF_NO_GC";
    GPUResourceUsageFlags[GPUResourceUsageFlags["BF_VERTEX"] = 32] = "BF_VERTEX";
    GPUResourceUsageFlags[GPUResourceUsageFlags["BF_INDEX"] = 64] = "BF_INDEX";
    GPUResourceUsageFlags[GPUResourceUsageFlags["BF_READ"] = 128] = "BF_READ";
    GPUResourceUsageFlags[GPUResourceUsageFlags["BF_WRITE"] = 256] = "BF_WRITE";
    GPUResourceUsageFlags[GPUResourceUsageFlags["BF_UNIFORM"] = 512] = "BF_UNIFORM";
    GPUResourceUsageFlags[GPUResourceUsageFlags["BF_STORAGE"] = 1024] = "BF_STORAGE";
    GPUResourceUsageFlags[GPUResourceUsageFlags["DYNAMIC"] = 2048] = "DYNAMIC";
    GPUResourceUsageFlags[GPUResourceUsageFlags["MANAGED"] = 4096] = "MANAGED";
})(GPUResourceUsageFlags || (GPUResourceUsageFlags = {}));
function getVertexAttribByName(name) {
    return vertexAttribNameMap[name];
}
function getVertexAttribName(attrib) {
    return vertexAttribNameRevMap[attrib];
}
function getVertexFormatSize(fmt) {
    return vertexAttribFormatMap[fmt][2];
}
function getVertexBufferLength(vertexBufferType) {
    return vertexBufferType.structMembers[0].type.dimension;
}
function getVertexBufferStride(vertexBufferType) {
    const vertexType = vertexBufferType.structMembers[0].type.elementType;
    if (vertexType.isStructType()) {
        let stride = 0;
        for (const member of vertexType.structMembers) {
            stride += member.type.getSize();
        }
        return stride;
    }
    else {
        return vertexType.getSize();
    }
}
function getVertexBufferAttribType(vertexBufferType, attrib) {
    const attribName = getVertexAttribName(attrib);
    if (!attribName) {
        return null;
    }
    const k = vertexBufferType.structMembers[0];
    const vertexType = k.type.elementType;
    if (vertexType.isStructType()) {
        for (const member of vertexType.structMembers) {
            if (member.name === attribName) {
                return member.type;
            }
        }
        return null;
    }
    else {
        return k.name === attribName ? vertexType : null;
    }
}
function makeVertexBufferType(length, ...attributes) {
    if (attributes.length === 0) {
        return null;
    }
    if (attributes.length === 1) {
        const format = vertexAttribFormatMap[attributes[0]];
        return new PBStructTypeInfo(null, 'packed', [{
                name: getVertexAttribName(format[0]),
                type: new PBArrayTypeInfo(PBPrimitiveTypeInfo.getCachedTypeInfo(format[1]), length),
            }]);
    }
    else {
        const vertexType = new PBStructTypeInfo(null, 'packed', attributes.map(attrib => ({
            name: getVertexAttribName(vertexAttribFormatMap[attrib][0]),
            type: PBPrimitiveTypeInfo.getCachedTypeInfo(vertexAttribFormatMap[attrib][1]),
        })));
        return new PBStructTypeInfo(null, 'packed', [{
                name: 'value',
                type: new PBArrayTypeInfo(vertexType, length),
            }]);
    }
}
const semanticList = (function () {
    const list = [];
    for (let i = 0; i < MAX_VERTEX_ATTRIBUTES; i++) {
        list.push(semanticToAttrib(i));
    }
    return list;
})();
function semanticToAttrib(semantic) {
    switch (semantic) {
        case VERTEX_ATTRIB_POSITION:
            return 'a_position';
        case VERTEX_ATTRIB_NORMAL:
            return 'a_normal';
        case VERTEX_ATTRIB_DIFFUSE:
            return 'a_diffuse';
        case VERTEX_ATTRIB_TANGENT:
            return 'a_tangent';
        case VERTEX_ATTRIB_TEXCOORD0:
            return 'a_texcoord0';
        case VERTEX_ATTRIB_TEXCOORD1:
            return 'a_texcoord1';
        case VERTEX_ATTRIB_TEXCOORD2:
            return 'a_texcoord2';
        case VERTEX_ATTRIB_TEXCOORD3:
            return 'a_texcoord3';
        case VERTEX_ATTRIB_TEXCOORD4:
            return 'a_texcoord4';
        case VERTEX_ATTRIB_TEXCOORD5:
            return 'a_texcoord5';
        case VERTEX_ATTRIB_TEXCOORD6:
            return 'a_texcoord6';
        case VERTEX_ATTRIB_TEXCOORD7:
            return 'a_texcoord7';
        case VERTEX_ATTRIB_BLEND_INDICES:
            return 'a_indices';
        case VERTEX_ATTRIB_BLEND_WEIGHT:
            return 'a_weight';
        case VERTEX_ATTRIB_CUSTOM0:
            return 'a_custom0';
        case VERTEX_ATTRIB_CUSTOM1:
            return 'a_custom1';
        default:
            return null;
    }
}
class TextureLoadEvent {
    static NAME = 'textureLoad';
    texture;
    constructor(texture) {
        this.texture = texture;
    }
}
function genDefaultName(obj) {
    if (obj.isTexture2D()) {
        return 'texture_2d';
    }
    else if (obj.isTexture2DArray()) {
        return 'texture_2darray';
    }
    else if (obj.isTexture3D()) {
        return 'texture_3d';
    }
    else if (obj.isTextureCube()) {
        return 'texture_cube';
    }
    else if (obj.isTextureVideo()) {
        return 'texture_video';
    }
    else if (obj.isBuffer()) {
        return 'buffer';
    }
    else if (obj.isFramebuffer()) {
        return 'framebuffer';
    }
    else if (obj.isProgram()) {
        return 'program';
    }
    else if (obj.isSampler()) {
        return 'sampler';
    }
    else if (obj.isVAO()) {
        return 'vbo';
    }
    else {
        return 'unknown';
    }
}

export { GPUResourceUsageFlags, MAX_BINDING_GROUPS, MAX_TEXCOORD_INDEX_COUNT, MAX_VERTEX_ATTRIBUTES, TextureLoadEvent, VERTEX_ATTRIB_BLEND_INDICES, VERTEX_ATTRIB_BLEND_WEIGHT, VERTEX_ATTRIB_CUSTOM0, VERTEX_ATTRIB_CUSTOM1, VERTEX_ATTRIB_DIFFUSE, VERTEX_ATTRIB_NORMAL, VERTEX_ATTRIB_POSITION, VERTEX_ATTRIB_TANGENT, VERTEX_ATTRIB_TEXCOORD0, VERTEX_ATTRIB_TEXCOORD1, VERTEX_ATTRIB_TEXCOORD2, VERTEX_ATTRIB_TEXCOORD3, VERTEX_ATTRIB_TEXCOORD4, VERTEX_ATTRIB_TEXCOORD5, VERTEX_ATTRIB_TEXCOORD6, VERTEX_ATTRIB_TEXCOORD7, genDefaultName, getVertexAttribByName, getVertexAttribName, getVertexBufferAttribType, getVertexBufferLength, getVertexBufferStride, getVertexFormatSize, makeVertexBufferType, semanticList, semanticToAttrib };
//# sourceMappingURL=gpuobject.js.map
