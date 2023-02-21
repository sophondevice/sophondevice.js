/** sophon base library */
import { hasStencilChannel } from '../base_types.js';
import '../builder/ast.js';
import '../gpuobject.js';
import { typeU16 } from '../builder/types.js';
import '../builder/builtinfunc.js';
import '../builder/constructors.js';
import { WebGPUMipmapGenerator, WebGPUClearQuad } from './utils_webgpu.js';

const VALIDATION_NEED_NEW_PASS = 1 << 0;
const VALIDATION_NEED_GENERATE_MIPMAP = 1 << 1;
const VALIDATION_FAILED = 1 << 2;
class WebGPURenderPass {
    _device;
    _frameBuffer;
    _bufferUploads;
    _textureUploads;
    _uploadCommandEncoder;
    _renderCommandEncoder;
    _renderPassEncoder;
    _fbBindFlag;
    _currentViewport;
    _currentScissor;
    _frameBufferInfo;
    constructor(device) {
        this._device = device;
        this._bufferUploads = new Set();
        this._textureUploads = new Set();
        this._uploadCommandEncoder = this._device.device.createCommandEncoder();
        this._renderCommandEncoder = this._device.device.createCommandEncoder();
        this._renderPassEncoder = null;
        this._frameBuffer = null;
        this._fbBindFlag = null;
        this._currentViewport = null;
        this._currentScissor = null;
        this._frameBufferInfo = null;
    }
    get active() {
        return !!this._renderPassEncoder;
    }
    isBufferUploading(buffer) {
        return !!this._bufferUploads.has(buffer);
    }
    isTextureUploading(tex) {
        return !!this._textureUploads.has(tex);
    }
    setFramebuffer(fb) {
        if (this._frameBuffer !== fb) {
            this.end();
            this._frameBuffer = fb;
            this._currentViewport = null;
            this._currentScissor = null;
        }
    }
    getFramebuffer() {
        return this._frameBuffer;
    }
    setViewport(x, y, w, h) {
        if (x === undefined || x === null) {
            this._currentViewport = null;
            if (this._renderPassEncoder) {
                this._renderPassEncoder.setViewport(0, 0, this._device.drawingBufferWidth, this._device.drawingBufferHeight, 0, 1);
            }
        }
        else {
            const vx = this._device.screenToDevice(x);
            const vy = this._device.screenToDevice(y);
            const vw = this._device.screenToDevice(w);
            const vh = this._device.screenToDevice(h);
            if (vx < 0 || vy < 0 || vw > this._device.drawingBufferWidth || vh > this._device.drawingBufferHeight) {
                console.log(`** VIEWPORT ERROR **: (${vx}, ${vy}, ${vw}, ${vh}) => (0, 0, ${this._device.drawingBufferWidth}, ${this._device.drawingBufferHeight})`);
            }
            this._currentViewport = [x, y, w, h];
            if (this._renderPassEncoder) {
                this._renderPassEncoder.setViewport(vx, this._device.drawingBufferHeight - vy - vh, vw, vh, 0, 1);
            }
        }
    }
    getViewport() {
        return this._currentViewport
            ? [...this._currentViewport]
            : [0, 0, this._device.deviceToScreen(this._device.drawingBufferWidth), this._device.deviceToScreen(this._device.drawingBufferHeight)];
    }
    setScissor(x, y, w, h) {
        if (x === undefined || x === null) {
            this._currentScissor = null;
            if (this._renderPassEncoder) {
                this._renderPassEncoder.setScissorRect(0, 0, this._device.drawingBufferWidth, this._device.drawingBufferHeight);
            }
        }
        else {
            this._currentScissor = [x, y, w, h];
            if (this._renderPassEncoder) {
                x = this._device.screenToDevice(x);
                y = this._device.screenToDevice(y);
                w = this._device.screenToDevice(w);
                h = this._device.screenToDevice(h);
                this._renderPassEncoder.setScissorRect(x, this._device.drawingBufferHeight - y - h, w, h);
            }
        }
    }
    getScissor() {
        return this._currentScissor
            ? [...this._currentScissor]
            : [0, 0, this._device.deviceToScreen(this._device.drawingBufferWidth), this._device.deviceToScreen(this._device.drawingBufferHeight)];
    }
    draw(program, vertexData, stateSet, bindGroups, bindGroupOffsets, primitiveType, first, count, numInstances) {
        const validation = this.validateDraw(program, vertexData, bindGroups);
        if ((validation & VALIDATION_NEED_NEW_PASS) || (validation & VALIDATION_NEED_GENERATE_MIPMAP)) {
            this.end();
        }
        if (validation & VALIDATION_NEED_GENERATE_MIPMAP) {
            WebGPUMipmapGenerator.generateMipmapsForBindGroups(this._device, bindGroups);
        }
        if (!(validation & VALIDATION_FAILED)) {
            if (!this.active) {
                this.begin();
            }
            this.drawInternal(this._renderPassEncoder, program, vertexData, stateSet, bindGroups, bindGroupOffsets, primitiveType, first, count, numInstances);
        }
    }
    clear(color, depth, stencil) {
        if (!this._currentScissor) {
            this.end();
            this.begin(color, depth, stencil);
        }
        else {
            if (!this._renderPassEncoder) {
                this.begin();
            }
            this._renderPassEncoder.insertDebugMarker('clear');
            WebGPUClearQuad.drawClearQuad(this, color, depth, stencil);
            this._renderPassEncoder.insertDebugMarker('end clear');
        }
    }
    getDevice() {
        return this._device;
    }
    getFrameBufferInfo() {
        return this._frameBufferInfo;
    }
    begin(color, depth, stencil) {
        if (this.active) {
            console.error('WebGPURenderPass.begin() failed: begin() has already been called');
            return;
        }
        this._uploadCommandEncoder = this._device.device.createCommandEncoder();
        this._renderCommandEncoder = this._device.device.createCommandEncoder();
        if (!this._frameBuffer) {
            this._frameBufferInfo = {
                colorFormats: [this._device.backbufferFormat],
                depthFormat: this._device.backbufferDepthFormat,
                sampleCount: this._device.sampleCount,
                hash: `${this._device.backbufferFormat}:${this._device.backbufferDepthFormat}:${this._device.sampleCount}`
            };
            const mainPassDesc = this._device.defaultRenderPassDesc;
            const colorAttachmentDesc = this._device.defaultRenderPassDesc.colorAttachments[0];
            if (this._frameBufferInfo.sampleCount > 1) {
                colorAttachmentDesc.resolveTarget = this._device.context.getCurrentTexture().createView();
            }
            else {
                colorAttachmentDesc.view = this._device.context.getCurrentTexture().createView();
            }
            colorAttachmentDesc.loadOp = color ? 'clear' : 'load';
            colorAttachmentDesc.clearValue = color?.getArray();
            const depthAttachmentDesc = this._device.defaultRenderPassDesc.depthStencilAttachment;
            depthAttachmentDesc.depthLoadOp = typeof depth === 'number' ? 'clear' : 'load';
            depthAttachmentDesc.depthClearValue = depth;
            depthAttachmentDesc.stencilLoadOp = typeof stencil === 'number' ? 'clear' : 'load';
            depthAttachmentDesc.stencilClearValue = stencil;
            this._renderPassEncoder = this._renderCommandEncoder.beginRenderPass(mainPassDesc);
        }
        else {
            const colorAttachmentTextures = this._frameBuffer.getColorAttachments();
            const depthAttachmentTexture = this._frameBuffer.getDepthAttachment();
            let depthTextureView;
            if (depthAttachmentTexture) {
                depthAttachmentTexture._markAsCurrentFB(true);
                const attachment = this._frameBuffer.options.depthAttachment;
                const layer = depthAttachmentTexture.isTexture2DArray() || depthAttachmentTexture.isTexture3D() ? attachment.layer : 0;
                depthTextureView = depthAttachmentTexture.getView(attachment.level ?? 0, layer ?? 0, 1);
            }
            this._frameBufferInfo = {
                colorFormats: colorAttachmentTextures.map(val => val.gpuFormat),
                depthFormat: depthAttachmentTexture?.gpuFormat,
                sampleCount: 1,
                hash: null,
            };
            this._frameBufferInfo.hash = `${this._frameBufferInfo.colorFormats.join('-')}:${this._frameBufferInfo.depthFormat}:${this._frameBufferInfo.sampleCount}`;
            this._fbBindFlag = this._frameBuffer.bindFlag;
            const passDesc = {
                label: `customRenderPass:${this._frameBufferInfo.hash}`,
                colorAttachments: this._frameBuffer.options.colorAttachments.map((attachment, index) => {
                    const tex = attachment.texture;
                    if (tex) {
                        tex._markAsCurrentFB(true);
                        const layer = (tex.isTexture2DArray() || tex.isTexture3D()) ? attachment.layer : tex.isTextureCube() ? attachment.face : 0;
                        return {
                            view: tex.getView(attachment.level ?? 0, layer ?? 0, 1),
                            loadOp: color ? 'clear' : 'load',
                            clearValue: color?.getArray(),
                            storeOp: 'store',
                        };
                    }
                    else {
                        return null;
                    }
                }),
                depthStencilAttachment: depthAttachmentTexture ? {
                    view: depthTextureView,
                    depthLoadOp: typeof depth === 'number' ? 'clear' : 'load',
                    depthClearValue: depth,
                    depthStoreOp: 'store',
                    stencilLoadOp: hasStencilChannel(depthAttachmentTexture.format) ? typeof stencil === 'number' ? 'clear' : 'load' : undefined,
                    stencilClearValue: stencil,
                    stencilStoreOp: hasStencilChannel(depthAttachmentTexture.format) ? 'store' : undefined,
                } : undefined
            };
            this._renderPassEncoder = this._renderCommandEncoder.beginRenderPass(passDesc);
        }
        if (!this._currentViewport) {
            this.setViewport();
        }
        else {
            this.setViewport(...this._currentViewport);
        }
        if (!this._currentScissor) {
            this.setScissor();
        }
        else {
            this.setScissor(...this._currentScissor);
        }
    }
    end() {
        if (this.active) {
            this.flush();
            if (this._frameBuffer) {
                const colorAttachmentTextures = this._frameBuffer.getColorAttachments();
                const depthAttachmentTexture = this._frameBuffer.getDepthAttachment();
                for (const texture of colorAttachmentTextures) {
                    texture._markAsCurrentFB(false);
                    if (texture.mipLevelCount > 1) {
                        texture.generateMipmaps();
                    }
                }
                depthAttachmentTexture?._markAsCurrentFB(false);
            }
        }
    }
    drawInternal(renderPassEncoder, program, vertexData, stateSet, bindGroups, bindGroupOffsets, primitiveType, first, count, numInstances) {
        if (this.setBindGroupsForRender(renderPassEncoder, program, vertexData, bindGroups, bindGroupOffsets)) {
            const pipeline = this._device.pipelineCache.fetchRenderPipeline(program, vertexData, stateSet, primitiveType, this._frameBufferInfo);
            if (pipeline) {
                renderPassEncoder.setPipeline(pipeline);
                const stencilState = stateSet?.stencilState;
                if (stencilState) {
                    renderPassEncoder.setStencilReference(stencilState.ref);
                }
                if (vertexData) {
                    const vertexBuffers = vertexData.getLayouts(program.vertexAttributes)?.buffers;
                    vertexBuffers?.forEach((val, index) => {
                        renderPassEncoder.setVertexBuffer(index, val.buffer.object, val.offset);
                    });
                    const indexBuffer = vertexData.getIndexBuffer();
                    if (indexBuffer) {
                        renderPassEncoder.setIndexBuffer(indexBuffer.object, indexBuffer.indexType === typeU16 ? 'uint16' : 'uint32');
                        renderPassEncoder.drawIndexed(count, numInstances, first);
                    }
                    else {
                        renderPassEncoder.draw(count, numInstances, first);
                    }
                }
                else {
                    renderPassEncoder.draw(count, numInstances, first);
                }
            }
        }
    }
    validateDraw(program, vertexData, bindGroups) {
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
                            if (tex._isMarkedAsCurrentFB()) {
                                console.error('bind resource texture can not be current render target');
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
        const vertexBuffers = vertexData?.getLayouts(program.vertexAttributes)?.buffers;
        if (vertexBuffers) {
            for (const buffer of vertexBuffers) {
                if (buffer.buffer.getPendingUploads().length > 0) {
                    this._bufferUploads.add(buffer.buffer);
                }
            }
        }
        const indexBuffer = vertexData?.getIndexBuffer();
        if (indexBuffer?.getPendingUploads().length > 0) {
            this._bufferUploads.add(indexBuffer);
        }
        if (this._frameBuffer && this._frameBuffer.bindFlag !== this._fbBindFlag) {
            validation |= VALIDATION_NEED_NEW_PASS;
        }
        return validation;
    }
    setBindGroupsForRender(renderPassEncoder, program, vertexData, bindGroups, bindGroupOffsets) {
        if (bindGroups) {
            for (let i = 0; i < bindGroups.length; i++) {
                if (bindGroups[i]) {
                    bindGroups[i].updateVideoTextures();
                    const bindGroup = bindGroups[i].bindGroup;
                    if (!bindGroup) {
                        return false;
                    }
                    renderPassEncoder.setBindGroup(i, bindGroup, bindGroupOffsets?.[i] || undefined);
                }
            }
        }
        return true;
    }
    flush() {
        if (this._renderPassEncoder) {
            this._renderPassEncoder.end();
            this._renderPassEncoder = null;
        }
        this._bufferUploads.forEach(buffer => buffer.beginSyncChanges(this._uploadCommandEncoder));
        this._textureUploads.forEach(tex => tex.beginSyncChanges(this._uploadCommandEncoder));
        this._device.device.queue.submit([this._uploadCommandEncoder.finish(), this._renderCommandEncoder.finish()]);
        this._bufferUploads.forEach(buffer => buffer.endSyncChanges());
        this._textureUploads.forEach(tex => tex.endSyncChanges());
        this._bufferUploads.clear();
        this._textureUploads.clear();
        this._uploadCommandEncoder = null;
        this._renderCommandEncoder = null;
    }
}

export { WebGPURenderPass };
//# sourceMappingURL=renderpass_webgpu.js.map
