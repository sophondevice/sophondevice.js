/** sophon base library */
import { MAX_VERTEX_ATTRIBUTES, getVertexAttribByName, GPUResourceUsageFlags } from './gpuobject.js';

class VertexData {
    _vertexBuffers;
    _indexBuffer;
    _drawOffset;
    _tag;
    constructor() {
        this._vertexBuffers = [];
        this._tag = 0;
        for (let i = 0; i < MAX_VERTEX_ATTRIBUTES; i++) {
            this._vertexBuffers.push(null);
        }
        this._indexBuffer = null;
        this._drawOffset = 0;
    }
    clone() {
        const newVertexData = new VertexData();
        newVertexData._vertexBuffers = this._vertexBuffers.slice();
        newVertexData._indexBuffer = this._indexBuffer;
        newVertexData._drawOffset = this._drawOffset;
        return newVertexData;
    }
    updateTag() {
        this._tag++;
    }
    getTag() {
        return this._tag;
    }
    get vertexBuffers() {
        return this._vertexBuffers;
    }
    get indexBuffer() {
        return this._indexBuffer;
    }
    getDrawOffset() {
        return this._drawOffset;
    }
    setDrawOffset(offset) {
        if (offset !== this._drawOffset) {
            this._drawOffset = offset;
            this.updateTag();
        }
    }
    getVertexBuffer(semantic) {
        return this._vertexBuffers[getVertexAttribByName(semantic)]?.buffer || null;
    }
    getIndexBuffer() {
        return this._indexBuffer || null;
    }
    setVertexBuffer(buffer, stepMode) {
        if (!buffer || !(buffer.usage & GPUResourceUsageFlags.BF_VERTEX)) {
            throw new Error('setVertexBuffer() failed: buffer is null or buffer has not Vertex usage flag');
        }
        stepMode = stepMode || 'vertex';
        const vertexType = buffer.structure.structMembers[0].type.elementType;
        if (vertexType.isStructType()) {
            let offset = 0;
            for (const attrib of vertexType.structMembers) {
                const loc = getVertexAttribByName(attrib.name);
                this.internalSetVertexBuffer(loc, buffer, offset, stepMode);
                offset += attrib.size;
            }
        }
        else {
            const loc = getVertexAttribByName(buffer.structure.structMembers[0].name);
            this.internalSetVertexBuffer(loc, buffer, 0, stepMode);
        }
        return buffer;
    }
    removeVertexBuffer(buffer) {
        let removed = false;
        for (let loc = 0; loc < this._vertexBuffers.length; loc++) {
            const info = this._vertexBuffers[loc];
            const remove = info?.buffer === buffer;
            if (remove) {
                this._vertexBuffers[loc] = null;
                removed = true;
            }
        }
        if (removed) {
            this.updateTag();
        }
        return removed;
    }
    setIndexBuffer(buffer) {
        if (buffer !== this._indexBuffer) {
            this._indexBuffer = buffer || null;
            this.updateTag();
        }
        return buffer;
    }
    internalSetVertexBuffer(loc, buffer, offset, stepMode) {
        if (loc < 0 || loc >= MAX_VERTEX_ATTRIBUTES) {
            throw new Error(`setVertexBuffer() failed: location out of bounds: ${loc}`);
        }
        this.updateTag();
        offset = Number(offset) || 0;
        stepMode = stepMode || 'vertex';
        const old = this._vertexBuffers[loc];
        if (!old
            || old.buffer !== buffer
            || old.offset !== offset
            || old.stepMode !== stepMode) {
            this._vertexBuffers[loc] = {
                buffer: buffer,
                offset: offset,
                stepMode: stepMode,
            };
            return buffer;
        }
        return null;
    }
}

export { VertexData };
//# sourceMappingURL=vertexdata.js.map
