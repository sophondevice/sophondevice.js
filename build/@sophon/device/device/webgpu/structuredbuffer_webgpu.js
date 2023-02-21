/** sophon base library */
import { WebGPUBuffer } from './buffer_webgpu.js';
import { StructuredBufferData } from '../uniformdata.js';
import { GPUResourceUsageFlags } from '../gpuobject.js';
import { typeU8Vec2_Norm, typeU8Vec4_Norm, typeI8Vec2_Norm, typeI8Vec4_Norm, typeU16Vec2, typeU16Vec4, typeI16Vec2, typeI16Vec4, typeU16Vec2_Norm, typeU16Vec4_Norm, typeI16Vec2_Norm, typeI16Vec4_Norm, typeF16Vec2, typeF16Vec4, typeF32, typeF32Vec2, typeF32Vec3, typeF32Vec4, typeU32, typeU32Vec2, typeU32Vec3, typeU32Vec4, typeI32, typeI32Vec2, typeI32Vec3, typeI32Vec4 } from '../builder/types.js';

const vertexFormatTable = {
    [typeU8Vec2_Norm.typeId]: 'unorm8x2',
    [typeU8Vec4_Norm.typeId]: 'unorm8x4',
    [typeI8Vec2_Norm.typeId]: 'snorm8x2',
    [typeI8Vec4_Norm.typeId]: 'snorm8x4',
    [typeU16Vec2.typeId]: 'uint16x2',
    [typeU16Vec4.typeId]: 'uint16x4',
    [typeI16Vec2.typeId]: 'sint16x2',
    [typeI16Vec4.typeId]: 'sint16x4',
    [typeU16Vec2_Norm.typeId]: 'unorm16x2',
    [typeU16Vec4_Norm.typeId]: 'unorm16x4',
    [typeI16Vec2_Norm.typeId]: 'snorm16x2',
    [typeI16Vec4_Norm.typeId]: 'snorm16x4',
    [typeF16Vec2.typeId]: 'float16x2',
    [typeF16Vec4.typeId]: 'float16x4',
    [typeF32.typeId]: 'float32',
    [typeF32Vec2.typeId]: 'float32x2',
    [typeF32Vec3.typeId]: 'float32x3',
    [typeF32Vec4.typeId]: 'float32x4',
    [typeU32.typeId]: 'uint32',
    [typeU32Vec2.typeId]: 'uint32x2',
    [typeU32Vec3.typeId]: 'uint32x3',
    [typeU32Vec4.typeId]: 'uint32x4',
    [typeI32.typeId]: 'sint32',
    [typeI32Vec2.typeId]: 'sint32x2',
    [typeI32Vec3.typeId]: 'sint32x3',
    [typeI32Vec4.typeId]: 'sint32x4',
};
class WebGPUStructuredBuffer extends WebGPUBuffer {
    _structure;
    _data;
    constructor(device, structure, usage, source) {
        if (!(structure?.isStructType())) {
            throw new Error('invalid structure type');
        }
        if (usage & GPUResourceUsageFlags.BF_INDEX) {
            throw new Error('structured buffer must not have Index usage flag');
        }
        if ((usage & GPUResourceUsageFlags.BF_READ) || (usage & GPUResourceUsageFlags.BF_WRITE)) {
            throw new Error('structured buffer must not have Read or Write usage flags');
        }
        if (usage & GPUResourceUsageFlags.BF_VERTEX) {
            if (structure.structMembers.length !== 1 || !structure.structMembers[0].type.isArrayType()) {
                throw new Error('structured buffer for vertex usage must have only one array member');
            }
        }
        if ((usage & GPUResourceUsageFlags.BF_UNIFORM) || (usage & GPUResourceUsageFlags.BF_STORAGE)) {
            usage |= GPUResourceUsageFlags.DYNAMIC;
        }
        const layout = structure.toBufferLayout(0, structure.layout);
        if (source && layout.byteSize !== source.byteLength) {
            throw new Error(`create structured buffer failed: invalid source size: ${source.byteLength}, should be ${layout.byteSize}`);
        }
        super(device, usage, source || layout.byteSize);
        this._data = new StructuredBufferData(layout, this);
        this._structure = structure;
    }
    set(name, value) {
        this._data.set(name, value);
    }
    get structure() {
        return this._structure;
    }
    set structure(st) {
        if (st?.typeId !== this._structure.typeId) {
            const layout = st.toBufferLayout(0, st.layout);
            if (layout.byteSize > this.byteLength) {
                throw new Error(`set structure type failed: new structure type is too large: ${layout.byteSize}`);
            }
            this._data = new StructuredBufferData(layout, this);
            this._structure = st;
        }
    }
    static getGPUVertexFormat(type) {
        return vertexFormatTable[type.typeId];
    }
}

export { WebGPUStructuredBuffer };
//# sourceMappingURL=structuredbuffer_webgpu.js.map
