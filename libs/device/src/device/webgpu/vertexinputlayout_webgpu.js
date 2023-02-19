import { getVertexBufferStride, getVertexBufferAttribType } from '../gpuobject';
import { vertexFormatToHash } from './constants_webgpu';
import { WebGPUObject } from './gpuobject_webgpu';
import { WebGPUStructuredBuffer } from './structuredbuffer_webgpu';
export class WebGPUVertexInputLayout extends WebGPUObject {
    static _hashCounter = 0;
    _vertexData;
    _hash;
    _layouts;
    constructor(device, vertexData) {
        super(device);
        this._vertexData = vertexData.clone();
        this._hash = String(++WebGPUVertexInputLayout._hashCounter);
        this._layouts = {};
    }
    destroy() {
        this._object = null;
    }
    async restore() {
        this._object = {};
    }
    get hash() {
        return this._hash;
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
    getLayouts(attributes) {
        if (!attributes) {
            return null;
        }
        let layout = this._layouts[attributes];
        if (!layout) {
            layout = this.calcHash(attributes);
            this._layouts[attributes] = layout;
        }
        return layout;
    }
    calcHash(attribHash) {
        const layouts = [];
        const layoutVertexBuffers = [];
        const vertexBuffers = this._vertexData.vertexBuffers;
        const drawOffset = this._vertexData.getDrawOffset();
        const attributes = attribHash.split(':').map(val => Number(val));
        for (let idx = 0; idx < attributes.length; idx++) {
            const attrib = attributes[idx];
            const bufferInfo = vertexBuffers[attrib];
            const buffer = bufferInfo?.buffer;
            if (!buffer) {
                console.log(`ERROR: No vertex buffer set for location ${idx}`);
                continue;
            }
            const vertexType = getVertexBufferAttribType(buffer.structure, attrib);
            if (!vertexType) {
                console.log(`ERROR: No vertex attrib ${attrib} found for vertex buffer`);
                return null;
            }
            const gpuFormat = WebGPUStructuredBuffer.getGPUVertexFormat(vertexType);
            if (!gpuFormat) {
                throw new Error('Invalid vertex buffer format');
            }
            const index = layoutVertexBuffers.findIndex(val => val.buffer === buffer);
            const stride = getVertexBufferStride(bufferInfo.buffer.structure);
            if (index >= 0 && stride * drawOffset !== layoutVertexBuffers[index].offset) {
                throw new Error('WebGPUVertexData.createLayouts() failed: inconsistent stride for interleaved vertex buffer');
            }
            let layout = index >= 0 ? layouts[index] : `${stride}-${Number(bufferInfo.stepMode === 'instance')}`;
            layout += `-${vertexFormatToHash[gpuFormat]}-${bufferInfo.offset}-${idx}`;
            if (index >= 0) {
                layouts[index] = layout;
            }
            else {
                layouts.push(layout);
                layoutVertexBuffers.push({ buffer: buffer, offset: stride * drawOffset });
            }
        }
        return {
            layoutHash: layouts.join(':'),
            buffers: layoutVertexBuffers,
        };
    }
    bind() {
        this._device.setVertexData(this);
    }
    draw(primitiveType, first, count) {
        this.bind();
        this._device.draw(primitiveType, first, count);
    }
    drawInstanced(primitiveType, first, count, numInstances) {
        this.bind();
        this._device.drawInstanced(primitiveType, first, count, numInstances);
    }
}
//# sourceMappingURL=vertexinputlayout_webgpu.js.map