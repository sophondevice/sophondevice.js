/** sophon base library */
import { WebGLGPUObject } from './gpuobject_webgl.js';
import { WebGLEnum } from './webgl_enum.js';
import { TextureWrapping, TextureFilter } from '../base_types.js';
import { textureTargetMap, textureWrappingMap, textureMagFilterToWebGL, textureMinFilterToWebGL, compareFuncMap } from './constants_webgl.js';
import { isWebGL2 } from './utils.js';

class WebGLTextureSampler extends WebGLGPUObject {
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
        if (this._object && isWebGL2(this._device.context)) {
            this._device.context.deleteSampler(this._object);
        }
        this._object = null;
    }
    async restore() {
        if (!this._object && !this._device.isContextLost()) {
            this._load();
        }
    }
    apply(texture) {
        if (texture?.object && !this._device.isWebGL2 && !this._device.isContextLost()) {
            const gl = this._device.context;
            const target = textureTargetMap[texture.target];
            gl.bindTexture(target, texture.object);
            gl.texParameteri(target, WebGLEnum.TEXTURE_WRAP_S, textureWrappingMap[this._options.addressU]);
            gl.texParameteri(target, WebGLEnum.TEXTURE_WRAP_T, textureWrappingMap[this._options.addressV]);
            gl.texParameteri(target, WebGLEnum.TEXTURE_MAG_FILTER, textureMagFilterToWebGL(this._options.magFilter));
            gl.texParameteri(target, WebGLEnum.TEXTURE_MIN_FILTER, textureMinFilterToWebGL(this._options.minFilter, this._options.mipFilter));
            if (this._device.getTextureCaps().supportAnisotropicFiltering) {
                gl.texParameterf(target, WebGLEnum.TEXTURE_MAX_ANISOTROPY, this._options.maxAnisotropy);
            }
        }
    }
    _load() {
        if (!isWebGL2(this._device.context)) {
            this._object = {};
            return true;
        }
        if (!this._device.isContextLost()) {
            const gl = this._device.context;
            if (!this._object) {
                this._object = gl.createSampler();
            }
            gl.samplerParameteri(this._object, WebGLEnum.TEXTURE_WRAP_S, textureWrappingMap[this._options.addressU]);
            gl.samplerParameteri(this._object, WebGLEnum.TEXTURE_WRAP_T, textureWrappingMap[this._options.addressV]);
            gl.samplerParameteri(this._object, WebGLEnum.TEXTURE_WRAP_R, textureWrappingMap[this._options.addressW]);
            gl.samplerParameteri(this._object, WebGLEnum.TEXTURE_MAG_FILTER, textureMagFilterToWebGL(this._options.magFilter));
            gl.samplerParameteri(this._object, WebGLEnum.TEXTURE_MIN_FILTER, textureMinFilterToWebGL(this._options.minFilter, this._options.mipFilter));
            gl.samplerParameterf(this._object, WebGLEnum.TEXTURE_MIN_LOD, this._options.lodMin);
            gl.samplerParameterf(this._object, WebGLEnum.TEXTURE_MAX_LOD, this._options.lodMax);
            if (this._options.compare === null) {
                gl.samplerParameteri(this._object, WebGLEnum.TEXTURE_COMPARE_MODE, WebGLEnum.NONE);
            }
            else {
                gl.samplerParameteri(this._object, WebGLEnum.TEXTURE_COMPARE_MODE, WebGLEnum.COMPARE_REF_TO_TEXTURE);
                gl.samplerParameteri(this._object, WebGLEnum.TEXTURE_COMPARE_FUNC, compareFuncMap[this._options.compare]);
            }
            if (this._device.getTextureCaps().supportAnisotropicFiltering) {
                gl.samplerParameterf(this._object, WebGLEnum.TEXTURE_MAX_ANISOTROPY, this._options.maxAnisotropy);
            }
        }
        return true;
    }
    isSampler() {
        return true;
    }
}

export { WebGLTextureSampler };
//# sourceMappingURL=sampler_webgl.js.map
