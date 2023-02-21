/** sophon base library */
import { WebGPUObject } from './gpuobject_webgpu.js';
import { textureWrappingMap, textureFilterMap, compareFuncMap } from './constants_webgpu.js';
import { TextureWrapping, TextureFilter } from '../base_types.js';

class WebGPUTextureSampler extends WebGPUObject {
    _options;
    constructor(device, options) {
        super(device);
        this._options = Object.assign({
            addressU: TextureWrapping.ClampToEdge,
            addressV: TextureWrapping.ClampToEdge,
            addressW: TextureWrapping.ClampToEdge,
            magFilter: TextureFilter.Nearest,
            minFilter: TextureFilter.Nearest,
            mipFilter: TextureFilter.None,
            lodMin: 0,
            lodMax: 32,
            compare: null,
            maxAnisotropy: 1
        }, options || {});
        this._load();
    }
    get hash() {
        return this._object ? this._device.gpuGetObjectHash(this._object) : 0;
    }
    get addressModeU() {
        return this._options.addressU;
    }
    get addressModeV() {
        return this._options.addressV;
    }
    get addressModeW() {
        return this._options.addressW;
    }
    get magFilter() {
        return this._options.magFilter;
    }
    get minFilter() {
        return this._options.minFilter;
    }
    get mipFilter() {
        return this._options.mipFilter;
    }
    get lodMin() {
        return this._options.lodMin;
    }
    get lodMax() {
        return this._options.lodMax;
    }
    get compare() {
        return this._options.compare;
    }
    get maxAnisotropy() {
        return this._options.maxAnisotropy;
    }
    destroy() {
        this._object = null;
    }
    async restore() {
        if (!this._device.isContextLost()) {
            this._load();
        }
    }
    _load() {
        this._object = this._device.gpuCreateSampler({
            addressModeU: textureWrappingMap[this._options.addressU],
            addressModeV: textureWrappingMap[this._options.addressV],
            addressModeW: textureWrappingMap[this._options.addressW],
            magFilter: textureFilterMap[this._options.magFilter],
            minFilter: textureFilterMap[this._options.minFilter],
            mipmapFilter: textureFilterMap[this._options.mipFilter],
            lodMinClamp: this._options.lodMin,
            lodMaxClamp: this._options.lodMax,
            compare: compareFuncMap[this._options.compare] || undefined,
            maxAnisotropy: this._options.maxAnisotropy
        });
        return !!this._object;
    }
    isSampler() {
        return true;
    }
}

export { WebGPUTextureSampler };
//# sourceMappingURL=sampler_webgpu.js.map
