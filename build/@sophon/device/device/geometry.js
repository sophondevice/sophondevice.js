/** sophon base library */
import { PrimitiveType } from './base_types.js';
import { VertexData } from './vertexdata.js';

class Geometry {
    _device;
    _vao;
    _vertexData;
    _primitiveType;
    _indexStart;
    _indexCount;
    _vaoDirty;
    constructor(device) {
        this._device = device;
        this._vao = null;
        this._vertexData = new VertexData();
        this._primitiveType = PrimitiveType.TriangleList;
        this._indexStart = 0;
        this._indexCount = 0;
        this._vaoDirty = false;
    }
    get primitiveType() {
        return this._primitiveType;
    }
    set primitiveType(type) {
        this._primitiveType = type;
    }
    get indexStart() {
        return this._indexStart;
    }
    set indexStart(val) {
        this._indexStart = val;
    }
    get indexCount() {
        return this._indexCount;
    }
    set indexCount(val) {
        this._indexCount = val;
    }
    get drawOffset() {
        return this._vertexData.getDrawOffset();
    }
    removeVertexBuffer(buffer) {
        this._vaoDirty = this._vertexData.removeVertexBuffer(buffer);
    }
    getVertexBuffer(semantic) {
        return this._vertexData.getVertexBuffer(semantic);
    }
    createAndSetVertexBuffer(structureType, data, stepMode) {
        const buffer = this._device.createStructuredBuffer(structureType, {
            usage: 'vertex',
            managed: true
        }, data);
        const ret = this._vertexData.setVertexBuffer(buffer, stepMode);
        this._vaoDirty = !!ret;
        return ret;
    }
    setVertexBuffer(buffer, stepMode) {
        const ret = this._vertexData.setVertexBuffer(buffer, stepMode);
        this._vaoDirty = !!ret;
        return ret;
    }
    createAndSetIndexBuffer(data, dynamic) {
        const buffer = this._device.createIndexBuffer(data, {
            dynamic: !!dynamic,
            managed: !dynamic
        });
        this._vertexData.setIndexBuffer(buffer);
        this._vaoDirty = true;
        return buffer;
    }
    setIndexBuffer(data) {
        if (this._vertexData.indexBuffer !== data) {
            this._vertexData.setIndexBuffer(data);
            this._vaoDirty = true;
        }
    }
    getIndexBuffer() {
        return this._vertexData.indexBuffer;
    }
    draw() {
        if (this._vaoDirty) {
            this._vao?.dispose();
            this._vao = this._device.createVAO(this._vertexData);
            this._vaoDirty = false;
        }
        this._vao?.draw(this._primitiveType, this._indexStart, this._indexCount);
    }
    drawInstanced(numInstances) {
        if (this._vaoDirty) {
            this._vao?.dispose();
            this._vao = this._device.createVAO(this._vertexData);
            this._vaoDirty = false;
        }
        this._vao?.drawInstanced(this._primitiveType, this._indexStart, this._indexCount, numInstances);
    }
    dispose() {
        if (this._vao) {
            this._vao.dispose();
            this._vao = null;
        }
        this._vertexData = null;
        this._indexCount = 0;
        this._indexStart = 0;
        this._primitiveType = PrimitiveType.Unknown;
    }
}

export { Geometry };
//# sourceMappingURL=geometry.js.map
