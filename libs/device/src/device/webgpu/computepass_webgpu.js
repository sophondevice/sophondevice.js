import { WebGPUMipmapGenerator } from "./utils_webgpu";
const VALIDATION_NEED_NEW_PASS = 1 << 0;
const VALIDATION_NEED_GENERATE_MIPMAP = 1 << 1;
const VALIDATION_FAILED = 1 << 2;
export class WebGPUComputePass {
    _device;
    _bufferUploads;
    _textureUploads;
    _uploadCommandEncoder;
    _computeCommandEncoder;
    _computePassEncoder;
    constructor(device, frameBuffer) {
        this._device = device;
        this._bufferUploads = new Set();
        this._textureUploads = new Set();
        this._uploadCommandEncoder = this._device.device.createCommandEncoder();
        this._computeCommandEncoder = this._device.device.createCommandEncoder();
        this._computePassEncoder = null;
    }
    get active() {
        return !!this._computePassEncoder;
    }
    isBufferUploading(buffer) {
        return !!this._bufferUploads.has(buffer);
    }
    isTextureUploading(tex) {
        return !!this._textureUploads.has(tex);
    }
    compute(program, bindGroups, bindGroupOffsets, workgroupCountX, workgroupCountY, workgroupCountZ) {
        const validation = this.validateCompute(bindGroups);
        if ((validation & VALIDATION_NEED_NEW_PASS) || (validation & VALIDATION_NEED_GENERATE_MIPMAP)) {
            if (this._computePassEncoder) {
                this.end();
            }
        }
        if (validation & VALIDATION_NEED_GENERATE_MIPMAP) {
            WebGPUMipmapGenerator.generateMipmapsForBindGroups(this._device, bindGroups);
        }
        if (!(validation & VALIDATION_FAILED)) {
            if (!this._computePassEncoder) {
                this.begin();
            }
            this.setBindGroupsForCompute(this._computePassEncoder, program, bindGroups, bindGroupOffsets);
            const pipeline = this._device.pipelineCache.fetchComputePipeline(program);
            if (pipeline) {
                this._computePassEncoder.setPipeline(pipeline);
                this._computePassEncoder.dispatchWorkgroups(workgroupCountX, workgroupCountY, workgroupCountZ);
            }
        }
    }
    setBindGroupsForCompute(computePassEncoder, program, bindGroups, bindGroupOffsets) {
        if (bindGroups) {
            for (let i = 0; i < bindGroups.length; i++) {
                if (bindGroups[i]) {
                    const bindGroup = bindGroups[i].bindGroup;
                    if (!bindGroup) {
                        return false;
                    }
                    computePassEncoder.setBindGroup(i, bindGroup, bindGroupOffsets?.[i] || undefined);
                }
            }
        }
        return true;
    }
    begin() {
        if (this.active) {
            console.error('WebGPUComputePass.begin() failed: WebGPUComputePass.begin() has already been called');
            return;
        }
        this._uploadCommandEncoder = this._device.device.createCommandEncoder();
        this._computeCommandEncoder = this._device.device.createCommandEncoder();
        this._computePassEncoder = this._computeCommandEncoder.beginComputePass();
    }
    end() {
        if (this.active) {
            this._computePassEncoder.end();
            this._computePassEncoder = null;
            this._bufferUploads.forEach(buffer => buffer.beginSyncChanges(this._uploadCommandEncoder));
            this._textureUploads.forEach(tex => tex.beginSyncChanges(this._uploadCommandEncoder));
            this._device.device.queue.submit([this._uploadCommandEncoder.finish(), this._computeCommandEncoder.finish()]);
            this._bufferUploads.forEach(buffer => buffer.endSyncChanges());
            this._textureUploads.forEach(tex => tex.endSyncChanges());
            this._bufferUploads.clear();
            this._textureUploads.clear();
            this._uploadCommandEncoder = null;
            this._computeCommandEncoder = null;
        }
    }
    validateCompute(bindGroups) {
        let validation = 0;
        if (bindGroups) {
            for (const bindGroup of bindGroups) {
                if (bindGroup) {
                    if (bindGroup.bindGroup) {
                        for (const ubo of bindGroup.bufferList) {
                            if (ubo.disposed) {
                                validation |= VALIDATION_FAILED;
                            }
                            if (ubo.getPendingUploads().length > 0) {
                                this._bufferUploads.add(ubo);
                            }
                        }
                        for (const tex of bindGroup.textureList) {
                            if (tex.disposed) {
                                validation |= VALIDATION_FAILED;
                            }
                            if (tex.isMipmapDirty()) {
                                validation |= VALIDATION_NEED_GENERATE_MIPMAP;
                            }
                            if (tex.getPendingUploads().length > 0) {
                                this._textureUploads.add(tex);
                            }
                        }
                    }
                }
            }
        }
        return validation;
    }
}
//# sourceMappingURL=computepass_webgpu.js.map