/** sophon base library */
import { WebGLTextureSampler } from './sampler_webgl.js';

class SamplerCache {
    _device;
    _samplers;
    constructor(device) {
        this._device = device;
        this._samplers = {};
    }
    fetchSampler(options) {
        const hash = this.hash(options);
        let sampler = this._samplers[hash];
        if (!sampler) {
            sampler = this.createSampler(options);
            this._samplers[hash] = sampler;
        }
        return sampler;
    }
    hash(options) {
        const addressU = options.addressU ? String(options.addressU) : '';
        const addressV = options.addressV ? String(options.addressV) : '';
        const addressW = options.addressW ? String(options.addressW) : '';
        const magFilter = options.magFilter ? String(options.magFilter) : '';
        const minFilter = options.minFilter ? String(options.minFilter) : '';
        const mipFilter = options.mipFilter ? String(options.mipFilter) : '';
        const lodMin = options.lodMin ? String(options.lodMin) : '';
        const lodMax = options.lodMax ? String(options.lodMax) : '';
        const compare = options.compare ? String(options.compare) : '';
        const maxAnisotropy = options.maxAnisotropy ? String(options.maxAnisotropy) : '';
        return `${addressU}:${addressV}:${addressW}:${magFilter}:${minFilter}:${mipFilter}:${lodMin}:${lodMax}:${compare}:${maxAnisotropy}`;
    }
    createSampler(options) {
        return new WebGLTextureSampler(this._device, options);
    }
}

export { SamplerCache };
//# sourceMappingURL=sampler_cache.js.map
