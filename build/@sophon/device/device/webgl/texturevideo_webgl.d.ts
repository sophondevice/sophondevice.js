import { WebGLBaseTexture } from './basetexture_webgl';
import { TextureVideo } from '../gpuobject';
import type { WebGLDevice } from './device_webgl';
export declare class WebGLTextureVideo extends WebGLBaseTexture implements TextureVideo<WebGLTexture> {
    private _source;
    private _callbackId;
    constructor(device: WebGLDevice, source: HTMLVideoElement);
    isTextureVideo(): this is TextureVideo;
    get source(): HTMLVideoElement;
    destroy(): void;
    init(): void;
    generateMipmaps(): void;
}
