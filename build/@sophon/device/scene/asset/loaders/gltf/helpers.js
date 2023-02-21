/** sophon base library */
import '../../../../device/builder/ast.js';
import '../../../../device/base_types.js';
import '../../../../device/gpuobject.js';
import { F32_BITMASK, U32_BITMASK, I32_BITMASK, U16_BITMASK, I16_BITMASK, U8_BITMASK, I8_BITMASK } from '../../../../device/builder/types.js';
import '../../../../device/builder/builtinfunc.js';
import '../../../../device/builder/constructors.js';

class GLTFAccessor {
    bufferView;
    byteOffset;
    typeMask;
    componentType;
    normalized;
    count;
    type;
    max;
    min;
    sparse;
    name;
    _typedView;
    _filteredView;
    _normalizedFilteredView;
    _normalizedTypedView;
    constructor(accessorInfo) {
        this.bufferView = accessorInfo.bufferView;
        this.byteOffset = accessorInfo.byteOffset ?? 0;
        this.componentType = accessorInfo.componentType;
        this.typeMask = this.getTypeMask(this.componentType);
        this.normalized = !!accessorInfo.normalized;
        this.count = accessorInfo.count;
        this.type = accessorInfo.type;
        this.max = accessorInfo.max;
        this.min = accessorInfo.min;
        this.sparse = accessorInfo.sparse;
        this.name = accessorInfo.name;
        this._typedView = null;
        this._filteredView = null;
        this._normalizedFilteredView = null;
        this._normalizedTypedView = null;
    }
    getTypedView(gltf) {
        if (this._typedView) {
            return this._typedView;
        }
        if (this.bufferView !== undefined) {
            const bufferView = gltf.bufferViews[this.bufferView];
            const buffer = gltf._loadedBuffers[bufferView.buffer];
            const byteOffset = this.byteOffset + (bufferView.byteOffset ?? 0);
            const componentSize = this.getComponentSize(this.componentType);
            const componentCount = this.getComponentCount(this.type);
            let arrayLength = 0;
            if (bufferView.byteStride !== undefined && bufferView.byteStride !== 0) {
                if (componentSize !== 0) {
                    arrayLength = bufferView.byteStride / componentSize * (this.count - 1) + componentCount;
                }
                else {
                    console.warn("Invalid component type in accessor '" + (this.name ? this.name : "") + "'");
                }
            }
            else {
                arrayLength = this.count * componentCount;
            }
            if (arrayLength * componentSize > buffer.byteLength - byteOffset) {
                arrayLength = (buffer.byteLength - byteOffset) / componentSize;
                console.warn("Count in accessor '" + (this.name ? this.name : "") + "' is too large.");
            }
            switch (this.componentType) {
                case 5120:
                    this._typedView = new Int8Array(buffer, byteOffset, arrayLength);
                    break;
                case 5121:
                    this._typedView = new Uint8Array(buffer, byteOffset, arrayLength);
                    break;
                case 5122:
                    this._typedView = new Int16Array(buffer, byteOffset, arrayLength);
                    break;
                case 5123:
                    this._typedView = new Uint16Array(buffer, byteOffset, arrayLength);
                    break;
                case 5124:
                    this._typedView = new Int32Array(buffer, byteOffset, arrayLength);
                    break;
                case 5125:
                    this._typedView = new Uint32Array(buffer, byteOffset, arrayLength);
                    break;
                case 5126:
                    this._typedView = new Float32Array(buffer, byteOffset, arrayLength);
                    break;
            }
        }
        else if (this.sparse !== undefined) {
            this._typedView = this.createView();
        }
        if (!this._typedView) {
            console.warn("Failed to convert buffer view to typed view!: " + this.bufferView);
        }
        else if (this.sparse !== undefined) {
            this.applySparse(gltf, this._typedView);
        }
        return this._typedView;
    }
    getNormalizedTypedView(gltf) {
        if (this._normalizedTypedView) {
            return this._normalizedTypedView;
        }
        const typedView = this.getTypedView(gltf);
        this._normalizedTypedView = this.normalized ? GLTFAccessor.dequantize(typedView, this.componentType) : typedView;
        return this._normalizedTypedView;
    }
    getDeinterlacedView(gltf) {
        if (this._filteredView) {
            return this._filteredView;
        }
        const componentSize = this.getComponentSize(this.componentType);
        const componentCount = this.getComponentCount(this.type);
        const arrayLength = this.count * componentCount;
        let func = 'getFloat32';
        switch (this.componentType) {
            case 5120:
                this._filteredView = new Int8Array(arrayLength);
                func = 'getInt8';
                break;
            case 5121:
                this._filteredView = new Uint8Array(arrayLength);
                func = 'getUint8';
                break;
            case 5122:
                this._filteredView = new Int16Array(arrayLength);
                func = 'getInt16';
                break;
            case 5123:
                this._filteredView = new Uint16Array(arrayLength);
                func = 'getUint16';
                break;
            case 5124:
                this._filteredView = new Int32Array(arrayLength);
                func = 'getInt32';
                break;
            case 5125:
                this._filteredView = new Uint32Array(arrayLength);
                func = 'getUint32';
                break;
            case 5126:
                this._filteredView = new Float32Array(arrayLength);
                func = 'getFloat32';
                break;
            default:
                return;
        }
        if (this.bufferView !== undefined) {
            const bufferView = gltf.bufferViews[this.bufferView];
            const buffer = gltf._loadedBuffers[bufferView.buffer];
            const byteOffset = this.byteOffset + (bufferView.byteOffset ?? 0);
            const stride = (bufferView.byteStride !== undefined && bufferView.byteStride !== 0) ? bufferView.byteStride : componentCount * componentSize;
            const dataView = new DataView(buffer, byteOffset, this.count * stride);
            for (let i = 0; i < arrayLength; ++i) {
                const offset = Math.floor(i / componentCount) * stride + (i % componentCount) * componentSize;
                this._filteredView[i] = dataView[func](offset, true);
            }
        }
        else if (this.sparse !== undefined) {
            this._filteredView = this.createView();
        }
        if (this.sparse !== undefined) {
            this.applySparse(gltf, this._filteredView);
        }
        return this._filteredView;
    }
    createView() {
        const size = this.count * this.getComponentCount(this.type);
        if (this.componentType == 5120)
            return new Int8Array(size);
        if (this.componentType == 5121)
            return new Uint8Array(size);
        if (this.componentType == 5122)
            return new Int16Array(size);
        if (this.componentType == 5123)
            return new Uint16Array(size);
        if (this.componentType == 5124)
            return new Int32Array(size);
        if (this.componentType == 5125)
            return new Uint32Array(size);
        if (this.componentType == 5126)
            return new Float32Array(size);
        return undefined;
    }
    getNormalizedDeinterlacedView(gltf) {
        if (this._normalizedFilteredView) {
            return this._normalizedFilteredView;
        }
        const filteredView = this.getDeinterlacedView(gltf);
        this._normalizedFilteredView = this.normalized ? GLTFAccessor.dequantize(filteredView, this.componentType) : filteredView;
        return this._normalizedFilteredView;
    }
    applySparse(gltf, view) {
        const indicesBufferView = gltf.bufferViews[this.sparse.indices.bufferView];
        const indicesBuffer = gltf._loadedBuffers[indicesBufferView.buffer];
        const indicesByteOffset = this.sparse.indices.byteOffset + (indicesBufferView.byteOffset ?? 0);
        const indicesComponentSize = this.getComponentSize(this.sparse.indices.componentType);
        let indicesComponentCount = 1;
        if (indicesBufferView.byteStride !== undefined && indicesBufferView.byteStride !== 0) {
            indicesComponentCount = indicesBufferView.byteStride / indicesComponentSize;
        }
        const indicesArrayLength = this.sparse.count * indicesComponentCount;
        let indicesTypedView;
        switch (this.sparse.indices.componentType) {
            case 5121:
                indicesTypedView = new Uint8Array(indicesBuffer, indicesByteOffset, indicesArrayLength);
                break;
            case 5123:
                indicesTypedView = new Uint16Array(indicesBuffer, indicesByteOffset, indicesArrayLength);
                break;
            case 5125:
                indicesTypedView = new Uint32Array(indicesBuffer, indicesByteOffset, indicesArrayLength);
                break;
        }
        const valuesBufferView = gltf.bufferViews[this.sparse.values.bufferView];
        const valuesBuffer = gltf._loadedBuffers[valuesBufferView.buffer];
        const valuesByteOffset = this.sparse.values.byteOffset + (valuesBufferView.byteOffset ?? 0);
        const valuesComponentSize = this.getComponentSize(this.componentType);
        let valuesComponentCount = this.getComponentCount(this.type);
        if (valuesBufferView.byteStride !== undefined && valuesBufferView.byteStride !== 0) {
            valuesComponentCount = valuesBufferView.byteStride / valuesComponentSize;
        }
        const valuesArrayLength = this.sparse.count * valuesComponentCount;
        let valuesTypedView;
        switch (this.componentType) {
            case 5120:
                valuesTypedView = new Int8Array(valuesBuffer, valuesByteOffset, valuesArrayLength);
                break;
            case 5121:
                valuesTypedView = new Uint8Array(valuesBuffer, valuesByteOffset, valuesArrayLength);
                break;
            case 5122:
                valuesTypedView = new Int16Array(valuesBuffer, valuesByteOffset, valuesArrayLength);
                break;
            case 5123:
                valuesTypedView = new Uint16Array(valuesBuffer, valuesByteOffset, valuesArrayLength);
                break;
            case 5124:
                valuesTypedView = new Int32Array(valuesBuffer, valuesByteOffset, valuesArrayLength);
                break;
            case 5125:
                valuesTypedView = new Uint32Array(valuesBuffer, valuesByteOffset, valuesArrayLength);
                break;
            case 5126:
                valuesTypedView = new Float32Array(valuesBuffer, valuesByteOffset, valuesArrayLength);
                break;
        }
        for (let i = 0; i < this.sparse.count; ++i) {
            for (let k = 0; k < valuesComponentCount; ++k) {
                view[indicesTypedView[i] * valuesComponentCount + k] = valuesTypedView[i * valuesComponentCount + k];
            }
        }
    }
    static dequantize(typedArray, componentType) {
        switch (componentType) {
            case 5120:
                return new Float32Array(typedArray).map(c => Math.max(c / 127.0, -1.0));
            case 5121:
                return new Float32Array(typedArray).map(c => c / 255.0);
            case 5122:
                return new Float32Array(typedArray).map(c => Math.max(c / 32767.0, -1.0));
            case 5123:
                return new Float32Array(typedArray).map(c => c / 65535.0);
            default:
                return typedArray;
        }
    }
    getComponentCount(type) {
        switch (type) {
            case 'SCALAR': return 1;
            case 'VEC2': return 2;
            case 'VEC3': return 3;
            case 'VEC4': return 4;
            case 'MAT2': return 4;
            case 'MAT3': return 9;
            case 'MAT4': return 16;
            default: return 0;
        }
    }
    getTypeMask(componentType) {
        switch (componentType) {
            case 5120: return I8_BITMASK;
            case 5121: return U8_BITMASK;
            case 5122: return I16_BITMASK;
            case 5123: return U16_BITMASK;
            case 5124: return I32_BITMASK;
            case 5125: return U32_BITMASK;
            case 5126: return F32_BITMASK;
            default: return 0;
        }
    }
    getComponentSize(componentType) {
        switch (componentType) {
            case 5120:
            case 5121:
                return 1;
            case 5122:
            case 5123:
                return 2;
            case 5124:
            case 5125:
            case 5126:
                return 4;
            default:
                return 0;
        }
    }
}

export { GLTFAccessor };
//# sourceMappingURL=helpers.js.map
