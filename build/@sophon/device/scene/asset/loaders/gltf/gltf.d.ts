export type GlTfId = number;
export interface AccessorSparseIndices {
    "bufferView": GlTfId;
    "byteOffset"?: number;
    "componentType": number | number | number | number;
    "extensions"?: any;
    "extras"?: any;
    [k: string]: any;
}
export interface AccessorSparseValues {
    "bufferView": GlTfId;
    "byteOffset"?: number;
    "extensions"?: any;
    "extras"?: any;
    [k: string]: any;
}
export interface AccessorSparse {
    "count": number;
    "indices": AccessorSparseIndices;
    "values": AccessorSparseValues;
    "extensions"?: any;
    "extras"?: any;
    [k: string]: any;
}
export interface Accessor {
    "bufferView"?: GlTfId;
    "byteOffset"?: number;
    "componentType": number | number | number | number | number | number | number;
    "normalized"?: boolean;
    "count": number;
    "type": any | any | any | any | any | any | any | string;
    "max"?: number[];
    "min"?: number[];
    "sparse"?: AccessorSparse;
    "name"?: any;
    "extensions"?: any;
    "extras"?: any;
    [k: string]: any;
}
export interface AnimationChannelTarget {
    "node"?: GlTfId;
    "path": any | any | any | any | string;
    "extensions"?: any;
    "extras"?: any;
    [k: string]: any;
}
export interface AnimationChannel {
    "sampler": GlTfId;
    "target": AnimationChannelTarget;
    "extensions"?: any;
    "extras"?: any;
    [k: string]: any;
}
export interface AnimationSampler {
    "input": GlTfId;
    "interpolation"?: any | any | any | string;
    "output": GlTfId;
    "extensions"?: any;
    "extras"?: any;
    [k: string]: any;
}
export interface Animation {
    "channels": AnimationChannel[];
    "samplers": AnimationSampler[];
    "name"?: any;
    "extensions"?: any;
    "extras"?: any;
    [k: string]: any;
}
export interface Asset {
    "copyright"?: string;
    "generator"?: string;
    "version": string;
    "minVersion"?: string;
    "extensions"?: any;
    "extras"?: any;
    [k: string]: any;
}
export interface Buffer {
    "uri"?: string;
    "byteLength": number;
    "name"?: any;
    "extensions"?: any;
    "extras"?: any;
    [k: string]: any;
}
export interface BufferView {
    "buffer": GlTfId;
    "byteOffset"?: number;
    "byteLength": number;
    "byteStride"?: number;
    "target"?: number | number | number;
    "name"?: any;
    "extensions"?: any;
    "extras"?: any;
    [k: string]: any;
}
export interface CameraOrthographic {
    "xmag": number;
    "ymag": number;
    "zfar": number;
    "znear": number;
    "extensions"?: any;
    "extras"?: any;
    [k: string]: any;
}
export interface CameraPerspective {
    "aspectRatio"?: number;
    "yfov": number;
    "zfar"?: number;
    "znear": number;
    "extensions"?: any;
    "extras"?: any;
    [k: string]: any;
}
export interface Camera {
    "orthographic"?: CameraOrthographic;
    "perspective"?: CameraPerspective;
    "type": any | any | string;
    "name"?: any;
    "extensions"?: any;
    "extras"?: any;
    [k: string]: any;
}
export interface Image {
    "uri"?: string;
    "mimeType"?: any | any | string;
    "bufferView"?: GlTfId;
    "name"?: any;
    "extensions"?: any;
    "extras"?: any;
    [k: string]: any;
}
export interface TextureInfo {
    "index": GlTfId;
    "texCoord"?: number;
    "extensions"?: any;
    "extras"?: any;
    [k: string]: any;
}
export interface MaterialPbrMetallicRoughness {
    "baseColorFactor"?: number[];
    "baseColorTexture"?: TextureInfo;
    "metallicFactor"?: number;
    "roughnessFactor"?: number;
    "metallicRoughnessTexture"?: TextureInfo;
    "extensions"?: any;
    "extras"?: any;
    [k: string]: any;
}
export interface MaterialNormalTextureInfo {
    "index"?: any;
    "texCoord"?: any;
    "scale"?: number;
    "extensions"?: any;
    "extras"?: any;
    [k: string]: any;
}
export interface MaterialOcclusionTextureInfo {
    "index"?: any;
    "texCoord"?: any;
    "strength"?: number;
    "extensions"?: any;
    "extras"?: any;
    [k: string]: any;
}
export interface Material {
    "name"?: any;
    "extensions"?: any;
    "extras"?: any;
    "pbrMetallicRoughness"?: MaterialPbrMetallicRoughness;
    "normalTexture"?: MaterialNormalTextureInfo;
    "occlusionTexture"?: MaterialOcclusionTextureInfo;
    "emissiveTexture"?: TextureInfo;
    "emissiveFactor"?: number[];
    "alphaMode"?: any | any | any | string;
    "alphaCutoff"?: number;
    "doubleSided"?: boolean;
    [k: string]: any;
}
export interface MeshPrimitive {
    "attributes": {
        [k: string]: GlTfId;
    };
    "indices"?: GlTfId;
    "material"?: GlTfId;
    "mode"?: number | number | number | number | number | number | number | number;
    "targets"?: {
        [k: string]: GlTfId;
    }[];
    "extensions"?: any;
    "extras"?: any;
    [k: string]: any;
}
export interface Mesh {
    "primitives": MeshPrimitive[];
    "weights"?: number[];
    "name"?: any;
    "extensions"?: any;
    "extras"?: any;
    [k: string]: any;
}
export interface Node {
    "camera"?: GlTfId;
    "children"?: GlTfId[];
    "skin"?: GlTfId;
    "matrix"?: number[];
    "mesh"?: GlTfId;
    "rotation"?: number[];
    "scale"?: number[];
    "translation"?: number[];
    "weights"?: number[];
    "name"?: any;
    "extensions"?: any;
    "extras"?: any;
    [k: string]: any;
}
export interface Sampler {
    "magFilter"?: number | number | number;
    "minFilter"?: number | number | number | number | number | number | number;
    "wrapS"?: number | number | number | number;
    "wrapT"?: number | number | number | number;
    "name"?: any;
    "extensions"?: any;
    "extras"?: any;
    [k: string]: any;
}
export interface Scene {
    "nodes"?: GlTfId[];
    "name"?: any;
    "extensions"?: any;
    "extras"?: any;
    [k: string]: any;
}
export interface Skin {
    "inverseBindMatrices"?: GlTfId;
    "skeleton"?: GlTfId;
    "joints": GlTfId[];
    "name"?: any;
    "extensions"?: any;
    "extras"?: any;
    [k: string]: any;
}
export interface Texture {
    "sampler"?: GlTfId;
    "source"?: GlTfId;
    "name"?: any;
    "extensions"?: any;
    "extras"?: any;
    [k: string]: any;
}
export interface GlTf {
    "extensionsUsed"?: string[];
    "extensionsRequired"?: string[];
    "accessors"?: Accessor[];
    "animations"?: Animation[];
    "asset": Asset;
    "buffers"?: Buffer[];
    "bufferViews"?: BufferView[];
    "cameras"?: Camera[];
    "images"?: Image[];
    "materials"?: Material[];
    "meshes"?: Mesh[];
    "nodes"?: Node[];
    "samplers"?: Sampler[];
    "scene"?: GlTfId;
    "scenes"?: Scene[];
    "skins"?: Skin[];
    "textures"?: Texture[];
    "extensions"?: any;
    "extras"?: any;
    [k: string]: any;
}
