import { GPUResourceUsageFlags } from '../gpuobject';
import { WebGLStructuredBuffer } from './structuredbuffer_webgl';
import { WebGLGPUObject } from './gpuobject_webgl';
export class WebGLBindGroup extends WebGLGPUObject {
    _layout;
    _resources;
    constructor(device, layout) {
        super(device);
        this._device = device;
        this._layout = layout;
        this._resources = {};
        this._object = {};
    }
    getLayout() {
        return this._layout;
    }
    getBuffer(name) {
        return this._getBuffer(name, true);
    }
    setBuffer(name, buffer) {
        for (const entry of this._layout.entries) {
            if (entry.name === name) {
                if (!entry.buffer) {
                    console.log(`setBuffer() failed: resource '${name}' is not buffer`);
                }
                else {
                    if (buffer && !(buffer.usage & GPUResourceUsageFlags.BF_UNIFORM)) {
                        console.log(`setBuffer() failed: buffer resource '${name}' must be type '${entry.buffer.type}'`);
                    }
                    else if (buffer !== this._resources[entry.name]) {
                        this._resources[entry.name] = buffer;
                    }
                }
                return;
            }
        }
        console.log(`setBuffer() failed: no buffer resource named '${name}'`);
    }
    setRawData(name, byteOffset, data, srcPos, srcLength) {
        const mappedName = this._layout.nameMap?.[name];
        if (mappedName) {
            this.setRawData(mappedName, byteOffset, data, srcPos, srcLength);
        }
        else {
            const buffer = this._getBuffer(name, false);
            if (buffer) {
                buffer.bufferSubData(byteOffset, data, srcPos, srcLength);
            }
            else {
                console.log(`set(): no uniform buffer named '${name}'`);
            }
        }
    }
    setValue(name, value) {
        const mappedName = this._layout.nameMap?.[name];
        if (mappedName) {
            this.setValue(mappedName, { [name]: value });
        }
        else {
            const buffer = this._getBuffer(name, false);
            if (buffer) {
                if (value?.BYTES_PER_ELEMENT) {
                    buffer.bufferSubData(0, value);
                }
                else {
                    for (const k in value) {
                        buffer.set(k, value[k]);
                    }
                }
            }
            else {
                console.log(`set(): no uniform buffer named '${name}'`);
            }
        }
    }
    setTextureView(name, value, level, face) {
        throw new Error('setTextureView() not supported for webgl device');
    }
    getTexture(name) {
        const entry = this._findTextureLayout(name);
        if (entry) {
            return this._resources[name]?.[0] || null;
        }
        else {
            throw new Error(`getTexture() failed:${name} is not a texture`);
        }
    }
    setTexture(name, texture, sampler) {
        const entry = this._findTextureLayout(name);
        if (entry) {
            this._resources[name] = [
                texture,
                (sampler || texture.getDefaultSampler(!!entry.texture?.autoBindSamplerComparison))
            ];
        }
        else {
            console.log(`setTexture() failed: no texture uniform named '${name}'`);
        }
    }
    setSampler(name, value) {
    }
    apply(program, offsets) {
        const webgl2 = this._device.isWebGL2;
        let dynamicOffsetIndex = 0;
        for (let i = 0; i < this._layout.entries.length; i++) {
            const entry = this._layout.entries[i];
            const res = this._resources[entry.name];
            if (res instanceof WebGLStructuredBuffer) {
                if (webgl2) {
                    if (entry.buffer.hasDynamicOffset) {
                        const offset = offsets?.[dynamicOffsetIndex] || 0;
                        dynamicOffsetIndex++;
                        program.setBlock(res.structure.structName, res, offset);
                    }
                    else {
                        program.setBlock(res.structure.structName, res, 0);
                    }
                }
                else {
                    program.setUniform(entry.name, res.getUniformData().uniforms);
                }
            }
            else if (res) {
                if (res[0].isTextureVideo()) {
                    res[0].updateVideoFrame();
                }
                res[0].sampler = res[1];
                program.setUniform(entry.name, res);
            }
        }
    }
    destroy() {
        this._resources = {};
        this._object = null;
    }
    async restore() {
        this._object = {};
    }
    isBindGroup() {
        return true;
    }
    _getBuffer(name, nocreate = false) {
        for (const entry of this._layout.entries) {
            if (entry.buffer && entry.name === name) {
                let buffer = this._resources[entry.name];
                if (!buffer && !nocreate) {
                    buffer = this._device.createStructuredBuffer(entry.type, { usage: 'uniform' });
                    this._resources[entry.name] = buffer;
                }
                return buffer;
            }
        }
        return null;
    }
    _findTextureLayout(name) {
        for (const entry of this._layout.entries) {
            if ((entry.texture || entry.storageTexture || entry.externalTexture) && entry.name === name) {
                return entry;
            }
        }
        return null;
    }
}
//# sourceMappingURL=bindgroup_webgl.js.map