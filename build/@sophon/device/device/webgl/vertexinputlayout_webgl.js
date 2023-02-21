/** sophon base library */
import { WebGLGPUObject } from './gpuobject_webgl.js';
import { WebGLEnum } from './webgl_enum.js';
import { getVertexBufferAttribType, getVertexBufferStride } from '../gpuobject.js';
import { typeMap } from './constants_webgl.js';

class WebGLVertexInputLayout extends WebGLGPUObject {
    _vertexData;
    constructor(device, vertexData) {
        super(device);
        this._vertexData = vertexData.clone();
        this.load();
    }
    destroy() {
        if (this._object && this._device.vaoExt) {
            this._device.vaoExt.deleteVertexArray(this._object);
        }
        this._object = null;
    }
    async restore() {
        if (!this._device.isContextLost()) {
            this.load();
        }
    }
    get vertexBuffers() {
        return this._vertexData.vertexBuffers;
    }
    get indexBuffer() {
        return this._vertexData.indexBuffer;
    }
    getDrawOffset() {
        return this._vertexData.getDrawOffset();
    }
    getVertexBuffer(semantic) {
        return this._vertexData.getVertexBuffer(semantic);
    }
    getIndexBuffer() {
        return this._vertexData.getIndexBuffer();
    }
    bind() {
        if (this._object && this._device.vaoExt) {
            this._device.vaoExt.bindVertexArray(this._object);
        }
        else {
            this.bindBuffers();
        }
    }
    draw(primitiveType, first, count) {
        this._device.setVertexData(this);
        this._device.draw(primitiveType, first, count);
    }
    drawInstanced(primitiveType, first, count, numInstances) {
        this._device.setVertexData(this);
        this._device.drawInstanced(primitiveType, first, count, numInstances);
    }
    isVAO() {
        return true;
    }
    load() {
        if (this._device.isContextLost()) {
            return;
        }
        if (this._device.vaoExt) {
            if (!this._object) {
                this._object = this._device.vaoExt.createVertexArray();
                this._device.vaoExt.bindVertexArray(this._object);
                this.bindBuffers();
                this._device.vaoExt.bindVertexArray(null);
            }
        }
        else {
            this._object = {};
        }
    }
    bindBuffers() {
        const vertexBuffers = this._vertexData.vertexBuffers;
        const drawOffset = this._vertexData.getDrawOffset();
        const gl = this._device.context;
        for (let loc = 0; loc < vertexBuffers.length; loc++) {
            const bufferInfo = vertexBuffers[loc];
            const buffer = bufferInfo?.buffer;
            if (buffer) {
                if (buffer.disposed) {
                    buffer.reload();
                }
                gl.bindBuffer(WebGLEnum.ARRAY_BUFFER, buffer.object);
                gl.enableVertexAttribArray(loc);
                const vertexType = getVertexBufferAttribType(bufferInfo.buffer.structure, loc);
                const stride = getVertexBufferStride(bufferInfo.buffer.structure);
                if (bufferInfo.stepMode === 'instance' && this._device.instancedArraysExt) {
                    gl.vertexAttribPointer(loc, vertexType.cols, typeMap[vertexType.scalarType], false, stride, bufferInfo.offset);
                    this._device.instancedArraysExt.vertexAttribDivisor(loc, 1);
                }
                else {
                    gl.vertexAttribPointer(loc, vertexType.cols, typeMap[vertexType.scalarType], false, stride, drawOffset * stride + bufferInfo.offset);
                }
            }
            else {
                gl.disableVertexAttribArray(loc);
            }
        }
        if (this._vertexData.indexBuffer?.disposed) {
            this._vertexData.indexBuffer.reload();
        }
        gl.bindBuffer(WebGLEnum.ELEMENT_ARRAY_BUFFER, this._vertexData.indexBuffer ? this._vertexData.indexBuffer.object : null);
    }
}

export { WebGLVertexInputLayout };
//# sourceMappingURL=vertexinputlayout_webgl.js.map
