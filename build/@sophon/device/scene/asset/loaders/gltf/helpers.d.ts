import { Accessor, AccessorSparse } from "./gltf";
import type { GLTFContent } from "./gltf_loader";
import type { TypedArray } from "../../../../misc";
export declare const enum ComponentType {
    UNKNOWN = 0,
    BYTE = 5120,
    UBYTE = 5121,
    SHORT = 5122,
    USHORT = 5123,
    INT = 5124,
    UINT = 5125,
    FLOAT = 5126
}
export type GLTFComponentType = 'SCALAR' | 'VEC2' | 'VEC3' | 'VEC4' | 'MAT2' | 'MAT3' | 'MAT4';
export declare class GLTFAccessor {
    bufferView: number;
    byteOffset: number;
    typeMask: number;
    componentType: ComponentType;
    normalized: boolean;
    count: number;
    type: GLTFComponentType;
    max: number[];
    min: number[];
    sparse: AccessorSparse;
    name: string;
    private _typedView;
    private _filteredView;
    private _normalizedFilteredView;
    private _normalizedTypedView;
    constructor(accessorInfo: Accessor);
    getTypedView(gltf: GLTFContent): TypedArray;
    getNormalizedTypedView(gltf: GLTFContent): TypedArray;
    getDeinterlacedView(gltf: GLTFContent): TypedArray;
    createView(): Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array;
    getNormalizedDeinterlacedView(gltf: GLTFContent): TypedArray;
    applySparse(gltf: GLTFContent, view: TypedArray): void;
    static dequantize(typedArray: TypedArray, componentType: ComponentType): TypedArray;
    getComponentCount(type: GLTFComponentType): 0 | 1 | 2 | 4 | 3 | 9 | 16;
    getTypeMask(componentType: ComponentType): number;
    getComponentSize(componentType: ComponentType): 0 | 1 | 2 | 4;
}
