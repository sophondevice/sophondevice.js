import { WebGPURenderPass } from './renderpass_webgpu';
import { WebGPUComputePass } from './computepass_webgpu';
export class CommandQueueImmediate {
    _renderPass;
    _computePass;
    constructor(device) {
        this._renderPass = new WebGPURenderPass(device);
        this._computePass = new WebGPUComputePass(device);
    }
    get currentPass() {
        return this._renderPass.active ? this._renderPass : this._computePass.active ? this._computePass : null;
    }
    beginFrame() {
    }
    endFrame() {
        this._renderPass.end();
        this._computePass.end();
    }
    flush() {
        this._renderPass.end();
        this._computePass.end();
    }
    setFramebuffer(fb) {
        this._renderPass.setFramebuffer(fb);
    }
    getFramebuffer() {
        return this._renderPass.getFramebuffer();
    }
    getFramebufferInfo() {
        return this._renderPass.getFrameBufferInfo();
    }
    compute(program, bindGroups, bindGroupOffsets, workgroupCountX, workgroupCountY, workgroupCountZ) {
        this._renderPass.end();
        this._computePass.compute(program, bindGroups, bindGroupOffsets, workgroupCountX, workgroupCountY, workgroupCountZ);
    }
    draw(program, vertexData, stateSet, bindGroups, bindGroupOffsets, primitiveType, first, count, numInstances) {
        this._computePass.end();
        this._renderPass.draw(program, vertexData, stateSet, bindGroups, bindGroupOffsets, primitiveType, first, count, numInstances);
    }
    setViewport(x, y, w, h) {
        this._renderPass.setViewport(x, y, w, h);
    }
    getViewport() {
        return this._renderPass.getViewport();
    }
    setScissor(x, y, w, h) {
        this._renderPass.setScissor(x, y, w, h);
    }
    getScissor() {
        return this._renderPass.getScissor();
    }
    clear(color, depth, stencil) {
        this._renderPass.clear(color, depth, stencil);
    }
    isBufferUploading(buffer) {
        return this._renderPass.isBufferUploading(buffer) || this._computePass.isBufferUploading(buffer);
    }
    isTextureUploading(tex) {
        return this._renderPass.isTextureUploading(tex) || this._computePass.isTextureUploading(tex);
    }
}
//# sourceMappingURL=commandqueue.js.map