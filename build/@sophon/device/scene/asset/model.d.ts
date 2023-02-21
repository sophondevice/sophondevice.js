import { Matrix4x4, Quaternion, Vector3, Vector4 } from "@sophon/base";
import type { Primitive } from "../primitive";
import type { Texture2D, TextureSampler } from "../../device";
import type { StandardMaterial } from "../materiallib";
import type { Interpolator } from "../interpolator";
import type { TypedArray } from "../../misc";
export declare class AssetModelObject {
    name: string;
    constructor(name: string);
}
export interface MaterialTextureInfo {
    texture: Texture2D;
    sampler: TextureSampler;
    texCoord: number;
    transform: Matrix4x4;
}
export interface AssetMaterialCommon {
    vertexColor?: boolean;
    vertexNormal?: boolean;
    useTangent?: boolean;
    alphaMode?: 'blend' | 'mask';
    alphaCutoff?: number;
    doubleSided?: boolean;
    normalMap?: MaterialTextureInfo;
    bumpScale?: number;
    emissiveMap?: MaterialTextureInfo;
    emissiveColor?: Vector3;
    emissiveStrength?: number;
    occlusionMap?: MaterialTextureInfo;
    occlusionStrength?: number;
}
export interface AssetMaterial {
    type: string;
    common: AssetMaterialCommon;
}
export interface AssetUnlitMaterial extends AssetMaterial {
    diffuseMap?: MaterialTextureInfo;
    diffuse?: Vector4;
}
export interface AssetMaterialSheen {
    sheenColorFactor?: Vector3;
    sheenColorMap?: MaterialTextureInfo;
    sheenRoughnessFactor?: number;
    sheenRoughnessMap?: MaterialTextureInfo;
}
export interface AssetMaterialClearcoat {
    clearCoatFactor?: number;
    clearCoatIntensityMap?: MaterialTextureInfo;
    clearCoatRoughnessFactor?: number;
    clearCoatRoughnessMap?: MaterialTextureInfo;
    clearCoatNormalMap?: MaterialTextureInfo;
}
export interface AssetPBRMaterialCommon extends AssetUnlitMaterial {
    ior?: number;
}
export interface AssetPBRMaterialMR extends AssetPBRMaterialCommon {
    metallic?: number;
    roughness?: number;
    metallicMap?: MaterialTextureInfo;
    metallicIndex?: number;
    roughnessIndex?: number;
    specularMap?: MaterialTextureInfo;
    specularColorMap?: MaterialTextureInfo;
    specularFactor?: Vector4;
    sheen?: AssetMaterialSheen;
    clearcoat?: AssetMaterialClearcoat;
}
export interface AssetPBRMaterialSG extends AssetPBRMaterialCommon {
    specular?: Vector3;
    glossness?: number;
    specularGlossnessMap?: MaterialTextureInfo;
}
export interface AssetSubMeshData {
    primitive: Primitive;
    material: StandardMaterial;
    rawPositions: Float32Array;
    rawBlendIndices: TypedArray;
    rawJointWeights: TypedArray;
}
export interface AssetMeshData {
    subMeshes: AssetSubMeshData[];
}
export interface AssetAnimationTrack {
    node: AssetHierarchyNode;
    interpolator: Interpolator;
}
export interface AssetAnimationData {
    name: string;
    tracks: AssetAnimationTrack[];
    skeletons: AssetSkeleton[];
    nodes: AssetHierarchyNode[];
}
export interface AssetSkeletalAnimationTrack extends AssetAnimationTrack {
    skeleton: AssetSkeleton;
    keyFrames: {
        [t: number]: {
            translation: Vector3;
            rotation: Quaternion;
            scale: Vector3;
        }[];
    };
}
export interface AssetRotationTrack extends AssetAnimationTrack {
    keyFrames: {
        [t: number]: Quaternion[];
    };
    nodes: number[];
}
export interface AssetTranslationTrack extends AssetAnimationTrack {
    keyFrames: {
        [t: number]: Vector3[];
    };
    nodes: number[];
}
export interface AssetScaleTrack extends AssetAnimationTrack {
    keyFrames: {
        [t: number]: Vector3[];
    };
    nodes: number[];
}
export declare class AssetHierarchyNode extends AssetModelObject {
    private _parent;
    private _position;
    private _rotation;
    private _scaling;
    private _mesh;
    private _skeleton;
    private _attachToSkeleton;
    private _attachIndex;
    private _meshAttached;
    private _matrix;
    private _worldMatrix;
    private _children;
    constructor(name: string, parent?: AssetHierarchyNode);
    get parent(): AssetHierarchyNode;
    get matrix(): Matrix4x4;
    get worldMatrix(): Matrix4x4;
    get mesh(): AssetMeshData;
    set mesh(data: AssetMeshData);
    get skeleton(): AssetSkeleton;
    set skeleton(skeleton: AssetSkeleton);
    get position(): Vector3;
    set position(val: Vector3);
    get rotation(): Quaternion;
    set rotation(val: Quaternion);
    get scaling(): Vector3;
    set scaling(val: Vector3);
    get meshAttached(): boolean;
    get children(): AssetHierarchyNode[];
    get skeletonAttached(): AssetSkeleton;
    get attachIndex(): number;
    computeTransforms(parentTransform: Matrix4x4): void;
    addChild(child: AssetHierarchyNode): void;
    removeChild(child: AssetHierarchyNode): void;
    attachToSkeleton(skeleton: AssetSkeleton, index: number): void;
    private setMeshAttached;
}
export declare class AssetSkeleton extends AssetModelObject {
    pivot: AssetHierarchyNode;
    joints: AssetHierarchyNode[];
    inverseBindMatrices: Matrix4x4[];
    bindPoseMatrices: Matrix4x4[];
    constructor(name: string);
    addJoint(joint: AssetHierarchyNode, inverseBindMatrix: Matrix4x4): void;
}
export declare class AssetScene extends AssetModelObject {
    rootNodes: AssetHierarchyNode[];
    constructor(name: string);
}
export declare class SharedModel {
    private _name;
    private _skeletons;
    private _nodes;
    private _animations;
    private _scenes;
    private _activeScene;
    constructor(name?: string);
    get name(): string;
    set name(val: string);
    get scenes(): AssetScene[];
    get animations(): AssetAnimationData[];
    get skeletons(): AssetSkeleton[];
    get nodes(): AssetHierarchyNode[];
    get activeScene(): number;
    set activeScene(val: number);
    addNode(parent: AssetHierarchyNode, index: number, name: string): AssetHierarchyNode;
    addSkeleton(skeleton: AssetSkeleton): void;
    addAnimation(animation: AssetAnimationData): void;
}
