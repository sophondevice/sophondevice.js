/** sophon base library */
import { CubeFace } from '@sophon/base';
import { CompareFunc, TextureWrapping, PrimitiveType, TextureTarget, CompareMode, TextureFilter } from '../base_types.js';
import { PBPrimitiveType } from '../builder/types.js';
import { WebGLEnum } from './webgl_enum.js';
import { BlendEquation, BlendFunc, FaceMode, FaceWinding, StencilOp } from '../render_states.js';

const blendEquationMap = {
    [BlendEquation.ADD]: WebGLEnum.FUNC_ADD,
    [BlendEquation.SUBTRACT]: WebGLEnum.FUNC_SUBTRACT,
    [BlendEquation.REVERSE_SUBTRACT]: WebGLEnum.FUNC_REVERSE_SUBTRACT,
    [BlendEquation.MAX]: WebGLEnum.FUNC_MAX,
    [BlendEquation.MIN]: WebGLEnum.FUNC_MIN
};
const blendEquationInvMap = {
    [WebGLEnum.FUNC_ADD]: BlendEquation.ADD,
    [WebGLEnum.FUNC_SUBTRACT]: BlendEquation.SUBTRACT,
    [WebGLEnum.FUNC_REVERSE_SUBTRACT]: BlendEquation.REVERSE_SUBTRACT,
    [WebGLEnum.FUNC_MAX]: BlendEquation.MAX,
    [WebGLEnum.FUNC_MIN]: BlendEquation.MIN,
};
const blendFuncMap = {
    [BlendFunc.ZERO]: WebGLEnum.ZERO,
    [BlendFunc.ONE]: WebGLEnum.ONE,
    [BlendFunc.SRC_ALPHA]: WebGLEnum.SRC_ALPHA,
    [BlendFunc.INV_SRC_ALPHA]: WebGLEnum.ONE_MINUS_SRC_ALPHA,
    [BlendFunc.SRC_ALPHA_SATURATE]: WebGLEnum.BLEND,
    [BlendFunc.DST_ALPHA]: WebGLEnum.DST_ALPHA,
    [BlendFunc.INV_DST_ALPHA]: WebGLEnum.ONE_MINUS_DST_ALPHA,
    [BlendFunc.SRC_COLOR]: WebGLEnum.SRC_COLOR,
    [BlendFunc.INV_SRC_COLOR]: WebGLEnum.ONE_MINUS_SRC_COLOR,
    [BlendFunc.DST_COLOR]: WebGLEnum.DST_COLOR,
    [BlendFunc.INV_DST_COLOR]: WebGLEnum.ONE_MINUS_DST_COLOR,
    [BlendFunc.CONSTANT_COLOR]: WebGLEnum.CONSTANT_COLOR,
    [BlendFunc.INV_CONSTANT_COLOR]: WebGLEnum.ONE_MINUS_CONSTANT_COLOR,
    [BlendFunc.CONSTANT_ALPHA]: WebGLEnum.CONSTANT_ALPHA,
    [BlendFunc.INV_CONSTANT_ALPHA]: WebGLEnum.ONE_MINUS_CONSTANT_ALPHA,
};
const blendFuncInvMap = {
    [WebGLEnum.ZERO]: BlendFunc.ZERO,
    [WebGLEnum.ONE]: BlendFunc.ONE,
    [WebGLEnum.SRC_ALPHA]: BlendFunc.SRC_ALPHA,
    [WebGLEnum.ONE_MINUS_SRC_ALPHA]: BlendFunc.INV_SRC_ALPHA,
    [WebGLEnum.SRC_ALPHA_SATURATE]: BlendFunc.SRC_ALPHA_SATURATE,
    [WebGLEnum.DST_ALPHA]: BlendFunc.DST_ALPHA,
    [WebGLEnum.ONE_MINUS_DST_ALPHA]: BlendFunc.INV_DST_ALPHA,
    [WebGLEnum.SRC_COLOR]: BlendFunc.SRC_COLOR,
    [WebGLEnum.ONE_MINUS_SRC_COLOR]: BlendFunc.INV_SRC_COLOR,
    [WebGLEnum.DST_COLOR]: BlendFunc.DST_COLOR,
    [WebGLEnum.ONE_MINUS_DST_COLOR]: BlendFunc.INV_DST_COLOR,
    [WebGLEnum.CONSTANT_COLOR]: BlendFunc.CONSTANT_COLOR,
    [WebGLEnum.ONE_MINUS_CONSTANT_COLOR]: BlendFunc.INV_CONSTANT_COLOR,
    [WebGLEnum.CONSTANT_ALPHA]: BlendFunc.CONSTANT_ALPHA,
    [WebGLEnum.ONE_MINUS_CONSTANT_ALPHA]: BlendFunc.INV_CONSTANT_ALPHA,
};
const faceModeMap = {
    [FaceMode.NONE]: WebGLEnum.NONE,
    [FaceMode.FRONT]: WebGLEnum.FRONT,
    [FaceMode.BACK]: WebGLEnum.BACK,
};
const faceModeInvMap = {
    [WebGLEnum.NONE]: [FaceMode.NONE],
    [WebGLEnum.FRONT]: [FaceMode.FRONT],
    [WebGLEnum.BACK]: [FaceMode.BACK],
};
({
    [FaceWinding.CW]: WebGLEnum.CW,
    [FaceWinding.CCW]: WebGLEnum.CCW,
});
({
    [WebGLEnum.CW]: [FaceWinding.CW],
    [WebGLEnum.CCW]: [FaceWinding.CCW],
});
const stencilOpMap = {
    [StencilOp.KEEP]: WebGLEnum.KEEP,
    [StencilOp.ZERO]: WebGLEnum.ZERO,
    [StencilOp.REPLACE]: WebGLEnum.REPLACE,
    [StencilOp.INCR]: WebGLEnum.INCR,
    [StencilOp.INCR_WRAP]: WebGLEnum.INCR_WRAP,
    [StencilOp.DECR]: WebGLEnum.DECR,
    [StencilOp.DECR_WRAP]: WebGLEnum.DECR_WRAP,
    [StencilOp.INVERT]: WebGLEnum.INVERT,
};
const stencilOpInvMap = {
    [WebGLEnum.KEEP]: StencilOp.KEEP,
    [WebGLEnum.ZERO]: StencilOp.ZERO,
    [WebGLEnum.REPLACE]: StencilOp.REPLACE,
    [WebGLEnum.INCR]: StencilOp.INCR,
    [WebGLEnum.INCR_WRAP]: StencilOp.INCR_WRAP,
    [WebGLEnum.DECR]: StencilOp.DECR,
    [WebGLEnum.DECR_WRAP]: StencilOp.DECR_WRAP,
    [WebGLEnum.INVERT]: StencilOp.INVERT,
};
const compareFuncMap = {
    [CompareFunc.Unknown]: WebGLEnum.NONE,
    [CompareFunc.Always]: WebGLEnum.ALWAYS,
    [CompareFunc.LessEqual]: WebGLEnum.LEQUAL,
    [CompareFunc.GreaterEqual]: WebGLEnum.GEQUAL,
    [CompareFunc.Less]: WebGLEnum.LESS,
    [CompareFunc.Greater]: WebGLEnum.GREATER,
    [CompareFunc.Equal]: WebGLEnum.EQUAL,
    [CompareFunc.NotEqual]: WebGLEnum.NOTEQUAL,
    [CompareFunc.Never]: WebGLEnum.NEVER,
};
const compareFuncInvMap = {
    [WebGLEnum.NONE]: CompareFunc.Unknown,
    [WebGLEnum.ALWAYS]: CompareFunc.Always,
    [WebGLEnum.LEQUAL]: CompareFunc.LessEqual,
    [WebGLEnum.GEQUAL]: CompareFunc.GreaterEqual,
    [WebGLEnum.LESS]: CompareFunc.Less,
    [WebGLEnum.GREATER]: CompareFunc.Greater,
    [WebGLEnum.EQUAL]: CompareFunc.Equal,
    [WebGLEnum.NOTEQUAL]: CompareFunc.NotEqual,
    [WebGLEnum.NEVER]: CompareFunc.Never,
};
const textureWrappingMap = {
    [TextureWrapping.Repeat]: WebGLEnum.REPEAT,
    [TextureWrapping.MirroredRepeat]: WebGLEnum.MIRRORED_REPEAT,
    [TextureWrapping.ClampToEdge]: WebGLEnum.CLAMP_TO_EDGE,
};
const typeMap = {
    [PBPrimitiveType.BOOL]: WebGLEnum.BOOL,
    [PBPrimitiveType.BVEC2]: WebGLEnum.BOOL_VEC2,
    [PBPrimitiveType.BVEC3]: WebGLEnum.BOOL_VEC3,
    [PBPrimitiveType.BVEC4]: WebGLEnum.BOOL_VEC4,
    [PBPrimitiveType.F32]: WebGLEnum.FLOAT,
    [PBPrimitiveType.F32VEC2]: WebGLEnum.FLOAT_VEC2,
    [PBPrimitiveType.F32VEC3]: WebGLEnum.FLOAT_VEC3,
    [PBPrimitiveType.F32VEC4]: WebGLEnum.FLOAT_VEC4,
    [PBPrimitiveType.I8]: WebGLEnum.BYTE,
    [PBPrimitiveType.I16]: WebGLEnum.SHORT,
    [PBPrimitiveType.I32]: WebGLEnum.INT,
    [PBPrimitiveType.I32VEC2]: WebGLEnum.INT_VEC2,
    [PBPrimitiveType.I32VEC3]: WebGLEnum.INT_VEC3,
    [PBPrimitiveType.I32VEC4]: WebGLEnum.INT_VEC4,
    [PBPrimitiveType.U8]: WebGLEnum.UNSIGNED_BYTE,
    [PBPrimitiveType.U16]: WebGLEnum.UNSIGNED_SHORT,
    [PBPrimitiveType.U32]: WebGLEnum.UNSIGNED_INT,
    [PBPrimitiveType.U32VEC2]: WebGLEnum.UNSIGNED_INT_VEC2,
    [PBPrimitiveType.U32VEC3]: WebGLEnum.UNSIGNED_INT_VEC3,
    [PBPrimitiveType.U32VEC4]: WebGLEnum.UNSIGNED_INT_VEC4,
};
const primitiveTypeMap = {
    [PrimitiveType.TriangleList]: WebGLEnum.TRIANGLES,
    [PrimitiveType.TriangleStrip]: WebGLEnum.TRIANGLE_STRIP,
    [PrimitiveType.TriangleFan]: WebGLEnum.TRIANGLE_FAN,
    [PrimitiveType.LineList]: WebGLEnum.LINES,
    [PrimitiveType.LineStrip]: WebGLEnum.LINE_STRIP,
    [PrimitiveType.PointList]: WebGLEnum.POINTS,
};
const textureTargetMap = {
    [TextureTarget.Texture2D]: WebGLEnum.TEXTURE_2D,
    [TextureTarget.Texture3D]: WebGLEnum.TEXTURE_3D,
    [TextureTarget.TextureCubemap]: WebGLEnum.TEXTURE_CUBE_MAP,
    [TextureTarget.Texture2DArray]: WebGLEnum.TEXTURE_2D_ARRAY,
};
({
    [CompareMode.None]: WebGLEnum.NONE,
    [CompareMode.RefToTexture]: WebGLEnum.COMPARE_REF_TO_TEXTURE,
});
const cubeMapFaceMap = {
    [CubeFace.PX]: WebGLEnum.TEXTURE_CUBE_MAP_POSITIVE_X,
    [CubeFace.NX]: WebGLEnum.TEXTURE_CUBE_MAP_NEGATIVE_X,
    [CubeFace.PY]: WebGLEnum.TEXTURE_CUBE_MAP_POSITIVE_Y,
    [CubeFace.NY]: WebGLEnum.TEXTURE_CUBE_MAP_NEGATIVE_Y,
    [CubeFace.PZ]: WebGLEnum.TEXTURE_CUBE_MAP_POSITIVE_Z,
    [CubeFace.NZ]: WebGLEnum.TEXTURE_CUBE_MAP_NEGATIVE_Z,
};
function textureMagFilterToWebGL(magFilter) {
    switch (magFilter) {
        case TextureFilter.Nearest:
            return WebGLEnum.NEAREST;
        case TextureFilter.Linear:
            return WebGLEnum.LINEAR;
        default:
            return WebGLEnum.NONE;
    }
}
function textureMinFilterToWebGL(minFilter, mipFilter) {
    switch (minFilter) {
        case TextureFilter.Nearest:
            switch (mipFilter) {
                case TextureFilter.None:
                    return WebGLEnum.NEAREST;
                case TextureFilter.Nearest:
                    return WebGLEnum.NEAREST_MIPMAP_NEAREST;
                case TextureFilter.Linear:
                    return WebGLEnum.NEAREST_MIPMAP_LINEAR;
            }
            break;
        case TextureFilter.Linear:
            switch (mipFilter) {
                case TextureFilter.None:
                    return WebGLEnum.LINEAR;
                case TextureFilter.Nearest:
                    return WebGLEnum.LINEAR_MIPMAP_NEAREST;
                case TextureFilter.Linear:
                    return WebGLEnum.LINEAR_MIPMAP_LINEAR;
            }
            break;
    }
    return WebGLEnum.NONE;
}

export { blendEquationInvMap, blendEquationMap, blendFuncInvMap, blendFuncMap, compareFuncInvMap, compareFuncMap, cubeMapFaceMap, faceModeInvMap, faceModeMap, primitiveTypeMap, stencilOpInvMap, stencilOpMap, textureMagFilterToWebGL, textureMinFilterToWebGL, textureTargetMap, textureWrappingMap, typeMap };
//# sourceMappingURL=constants_webgl.js.map
