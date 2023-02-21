import { SharedModel, AssetHierarchyNode, AssetMeshData } from '../../model';
import { Primitive } from '../../../primitive';
import { StandardMaterial } from '../../../materiallib';
import { GLTFAccessor } from './helpers';
import { AbstractModelLoader } from '../loader';
import type { AssetManager } from '../../assetmanager';
import type { GlTf } from './gltf';
import type { TypedArray } from '../../../../misc';
import type { GPUDataBuffer, Texture2D } from '../../../../device/gpuobject';
export interface GLTFContent extends GlTf {
    _manager: AssetManager;
    _loadedBuffers: ArrayBuffer[];
    _accessors: GLTFAccessor[];
    _bufferCache: {
        [name: string]: GPUDataBuffer;
    };
    _textureCache: {
        [name: string]: Texture2D;
    };
    _primitiveCache: {
        [hash: string]: Primitive;
    };
    _materialCache: {
        [hash: string]: StandardMaterial;
    };
    _accessorCache: {
        [index: number]: {
            array: TypedArray;
            typeMask: number;
            elementCount: number;
        };
    };
    _nodes: AssetHierarchyNode[];
    _meshes: AssetMeshData[];
}
export declare class GLTFLoader extends AbstractModelLoader {
    supportExtension(ext: string): boolean;
    supportMIMEType(mimeType: string): boolean;
    load(assetManager: AssetManager, url: string, mimeType: string, data: Blob): Promise<SharedModel>;
    loadBinary(assetManager: AssetManager, url: string, buffer: ArrayBuffer): Promise<SharedModel>;
    loadJson(url: string, gltf: GLTFContent): Promise<SharedModel>;
    private _createMaterial;
}
