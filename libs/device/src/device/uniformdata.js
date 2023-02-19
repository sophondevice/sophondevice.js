import { PBPrimitiveType } from './builder/types';
export class StructuredBufferData {
    _cache;
    _buffer;
    _size;
    _uniformMap;
    _uniformPositions;
    constructor(layout, buffer) {
        this._size = (layout.byteSize + 15) & ~15;
        if (this._size <= 0) {
            throw new Error(`UniformBuffer(): invalid uniform buffer byte size: ${this._size}`);
        }
        this._uniformMap = {};
        this._uniformPositions = {};
        this._cache = buffer instanceof ArrayBuffer ? buffer : null;
        this._buffer = buffer instanceof ArrayBuffer ? null : buffer;
        this.init(layout, 0, '');
    }
    get byteLength() {
        return this._size;
    }
    get buffer() {
        return this._cache;
    }
    get uniforms() {
        return this._uniformMap;
    }
    set(name, value) {
        if (value !== undefined) {
            const view = this._uniformMap[name];
            if (view) {
                if (this._cache) {
                    if (typeof value === 'number') {
                        view[0] = value;
                    }
                    else if (value?._v) {
                        view.set(value._v);
                    }
                    else if (typeof value?.length === 'number') {
                        view.set(value);
                    }
                    else {
                        throw new Error('invalid uniform value');
                    }
                }
                else {
                    if (typeof value === 'number') {
                        view[0] = value;
                        this._buffer.bufferSubData(this._uniformPositions[name][0], view);
                    }
                    else if (value?._v) {
                        this._buffer.bufferSubData(this._uniformPositions[name][0], value._v);
                    }
                    else if (typeof value?.length === 'number') {
                        this._buffer.bufferSubData(this._uniformPositions[name][0], value);
                    }
                    else {
                        throw new Error('invalid uniform value');
                    }
                }
            }
            else {
                const proto = Object.getPrototypeOf(value);
                if (proto === Object.getPrototypeOf({})) {
                    this.setStruct(name, value);
                }
                else {
                    throw new Error('invalid uniform value');
                }
            }
        }
    }
    setStruct(name, value) {
        for (const k in value) {
            this.set(`${name}.${k}`, value[k]);
        }
    }
    init(layout, offset, prefix) {
        for (const entry of layout.entries) {
            if (entry.subLayout) {
                offset = this.init(entry.subLayout, offset, `${prefix}${entry.name}.`);
            }
            else {
                const name = `${prefix}${entry.name}`;
                if (this._uniformPositions[name]) {
                    throw new Error(`UniformBuffer(): duplicate uniform name: ${name}`);
                }
                if (entry.offset < offset || entry.byteSize < 0) {
                    throw new Error('UniformBuffer(): invalid layout');
                }
                this._uniformPositions[name] = [entry.offset, entry.byteSize];
                let viewCtor = null;
                switch (entry.type) {
                    case PBPrimitiveType.F32:
                        viewCtor = Float32Array;
                        break;
                    case PBPrimitiveType.U32:
                    case PBPrimitiveType.BOOL:
                        viewCtor = Uint32Array;
                        break;
                    case PBPrimitiveType.I32:
                        viewCtor = Int32Array;
                        break;
                    case PBPrimitiveType.U16:
                    case PBPrimitiveType.U16_NORM:
                    case PBPrimitiveType.F16:
                        viewCtor = Uint16Array;
                        break;
                    case PBPrimitiveType.I16:
                    case PBPrimitiveType.I16_NORM:
                        viewCtor = Int16Array;
                        break;
                    case PBPrimitiveType.U8:
                    case PBPrimitiveType.U8_NORM:
                        viewCtor = Uint8Array;
                        break;
                    case PBPrimitiveType.I8:
                    case PBPrimitiveType.I8_NORM:
                        viewCtor = Int8Array;
                        break;
                }
                if (!viewCtor) {
                    throw new Error(`UniformBuffer(): invalid data type for uniform: ${name}`);
                }
                if (entry.byteSize % viewCtor.BYTES_PER_ELEMENT) {
                    throw new Error(`UniformBuffer(): invalid byte size for uniform: ${name}`);
                }
                if (this._cache) {
                    this._uniformMap[name] = new viewCtor(this._cache, entry.offset, entry.byteSize / viewCtor.BYTES_PER_ELEMENT);
                }
                else {
                    this._uniformMap[name] = new viewCtor(1);
                }
                offset = entry.offset + entry.byteSize;
            }
        }
        return offset;
    }
}
//# sourceMappingURL=uniformdata.js.map