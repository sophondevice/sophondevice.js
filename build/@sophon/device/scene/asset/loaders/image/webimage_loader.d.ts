import { BaseTexture } from '../../../../device/gpuobject';
import { AbstractTextureLoader } from '../loader';
import type { AssetManager } from '../../assetmanager';
export declare class WebImageLoader extends AbstractTextureLoader {
    supportExtension(ext: string): boolean;
    supportMIMEType(mimeType: string): boolean;
    load(assetManager: AssetManager, filename: string, mimeType: string, data: ArrayBuffer, srgb: boolean, noMipmap: boolean, texture?: BaseTexture): Promise<BaseTexture>;
}
