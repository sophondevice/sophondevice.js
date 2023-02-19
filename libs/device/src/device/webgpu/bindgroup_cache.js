import { ShaderType } from '../base_types';
import { textureFormatMap } from './constants_webgpu';
export class BindGroupCache {
    _device;
    _bindGroupLayoutCache;
    constructor(device) {
        this._device = device;
        this._bindGroupLayoutCache = {};
    }
    fetchBindGroupLayout(desc) {
        const hash = desc ? this.getLayoutHash(desc) : '';
        let bgl = this._bindGroupLayoutCache[hash];
        if (!bgl) {
            bgl = this.createBindGroupLayout(desc);
            if (bgl) {
                this._bindGroupLayoutCache[hash] = bgl;
            }
            else {
                throw new Error(`fetchBindGroupLayout() failed: hash: ${hash}`);
            }
        }
        return bgl;
    }
    getLayoutHash(desc) {
        let hash = '';
        for (const entry of desc.entries) {
            let s = `${entry.binding}:${entry.visibility}:`;
            if (entry.buffer) {
                s += `b:${entry.buffer.type}:${entry.buffer.hasDynamicOffset}:${entry.buffer.minBindingSize}`;
            }
            else if (entry.sampler) {
                s += `s${entry.sampler.type}:`;
            }
            else if (entry.texture) {
                s += `t${entry.texture.sampleType}-${entry.texture.viewDimension}-${Number(!!entry.texture.multisampled)}:`;
            }
            else if (entry.storageTexture) {
                s += `k${entry.storageTexture.access}-${entry.storageTexture.format}-${entry.storageTexture.viewDimension}:`;
            }
            else if (entry.externalTexture) {
                s += `v:`;
            }
            hash = `${hash} ${s}`;
        }
        return hash;
    }
    createBindGroupLayout(desc) {
        const layoutDescriptor = {
            entries: desc?.entries.map(entry => {
                const binding = entry.binding;
                const visibility = ((entry.visibility & ShaderType.Vertex) ? GPUShaderStage.VERTEX : 0)
                    | ((entry.visibility & ShaderType.Fragment) ? GPUShaderStage.FRAGMENT : 0)
                    | ((entry.visibility & ShaderType.Compute) ? GPUShaderStage.COMPUTE : 0);
                const buffer = entry.buffer ? {
                    type: entry.buffer.type,
                    hasDynamicOffset: entry.buffer.hasDynamicOffset,
                    minBindingSize: Number(entry.buffer.minBindingSize) || 0,
                } : undefined;
                const sampler = entry.sampler ? {
                    type: entry.sampler.type
                } : undefined;
                const texture = entry.texture ? {
                    sampleType: entry.texture.sampleType,
                    viewDimension: entry.texture.viewDimension,
                } : undefined;
                const storageTexture = entry.storageTexture ? {
                    access: 'write-only',
                    viewDimension: '2d',
                    format: textureFormatMap[entry.storageTexture.format],
                } : undefined;
                const externalTexture = entry.externalTexture ? {} : undefined;
                const t = {
                    binding,
                    visibility,
                };
                if (buffer) {
                    t.buffer = buffer;
                }
                else if (sampler) {
                    t.sampler = sampler;
                }
                else if (texture) {
                    t.texture = texture;
                }
                else if (storageTexture) {
                    t.storageTexture = storageTexture;
                }
                else if (externalTexture) {
                    t.externalTexture = externalTexture;
                }
                return t;
            }) || [],
        };
        if (desc?.label) {
            layoutDescriptor.label = desc.label;
        }
        return this._device.device.createBindGroupLayout(layoutDescriptor);
    }
}
//# sourceMappingURL=bindgroup_cache.js.map