import type { BaseTexture } from "../../../device";
import type { AssetManager } from "../assetmanager";
import type { SharedModel } from "../model";
export declare class LoaderBase {
    protected _urlResolver: (url: string) => string;
    constructor();
    get urlResolver(): (url: string) => string;
    set urlResolver(resolver: (url: string) => string);
    request(url: string, headers?: Record<string, string>, crossOrigin?: string): Promise<Response>;
}
export declare abstract class AbstractTextureLoader extends LoaderBase {
    abstract supportExtension(ext: string): boolean;
    abstract supportMIMEType(mimeType: string): boolean;
    abstract load(assetManager: AssetManager, url: string, mimeType: string, data: ArrayBuffer, srgb: boolean, noMipmap: boolean, texture?: BaseTexture): Promise<BaseTexture>;
}
export declare abstract class AbstractModelLoader extends LoaderBase {
    abstract supportExtension(ext: string): boolean;
    abstract supportMIMEType(mimeType: string): boolean;
    abstract load(assetManager: AssetManager, url: string, mimeType: string, data: Blob): Promise<SharedModel>;
}
