import { getTextureFormatBlockSize } from '../base_types';
import { Device } from '../device';
import { WebGPUProgram } from './gpuprogram_webgpu';
import { WebGPUBindGroup } from './bindgroup_webgpu';
import { WebGPUTexture2D } from './texture2d_webgpu';
import { WebGPUTexture2DArray } from './texture2darray_webgpu';
import { WebGPUTexture3D } from './texture3d_webgpu';
import { WebGPUTextureCube } from './texturecube_webgpu';
import { WebGPUTextureVideo } from './texturevideo_webgpu';
import { WebGPUTextureCap, WebGPUFramebufferCap, WebGPUMiscCap, WebGPUShaderCap } from './capabilities_webgpu';
import { WebGPUVertexInputLayout } from './vertexinputlayout_webgpu';
import { PipelineCache } from './pipeline_cache';
import { WebGPURenderStateSet } from './renderstates_webgpu';
import { WebGPUBuffer } from './buffer_webgpu';
import { WebGPUFrameBuffer } from './framebuffer_webgpu';
import { WebGPUIndexBuffer } from './indexbuffer_webgpu';
import { BindGroupCache } from './bindgroup_cache';
import { VertexLayoutCache } from './vertexinputlayout_cache';
import { SamplerCache } from './sampler_cache';
import { CommandQueueImmediate } from './commandqueue';
import { WebGPUStructuredBuffer } from './structuredbuffer_webgpu';
import { textureFormatInvMap } from './constants_webgpu';
import { WebGPUBaseTexture } from './basetexture_webgpu';
export class WebGPUDevice extends Device {
    _context;
    _canvas;
    _dpr;
    _device;
    _adapter;
    _textureCaps;
    _framebufferCaps;
    _miscCaps;
    _shaderCaps;
    _reverseWindingOrder;
    _canRender;
    _backBufferFormat;
    _depthFormat;
    _defaultMSAAColorTexture;
    _defaultMSAAColorTextureView;
    _defaultDepthTexture;
    _defaultDepthTextureView;
    _pipelineCache;
    _bindGroupCache;
    _vertexLayoutCache;
    _samplerCache;
    _renderStatesOverridden;
    _currentProgram;
    _currentVertexData;
    _currentStateSet;
    _currentBindGroups;
    _currentBindGroupOffsets;
    _commandQueue;
    _gpuObjectHashCounter;
    _gpuObjectHasher;
    _defaultRenderPassDesc;
    _sampleCount;
    constructor(cvs, options) {
        super();
        this._canvas = cvs;
        this._dpr = Math.ceil(options?.dpr ?? window.devicePixelRatio);
        this._device = null;
        this._adapter = null;
        this._context = null;
        this._reverseWindingOrder = false;
        this._defaultMSAAColorTexture = null;
        this._defaultMSAAColorTextureView = null;
        this._defaultDepthTexture = null;
        this._defaultDepthTextureView = null;
        this._pipelineCache = null;
        this._bindGroupCache = null;
        this._vertexLayoutCache = null;
        this._currentProgram = null;
        this._currentVertexData = null;
        this._currentStateSet = null;
        this._currentBindGroups = [];
        this._currentBindGroupOffsets = [];
        this._defaultRenderPassDesc = null;
        this._sampleCount = options?.msaa ? 4 : 1;
        this._textureCaps = null;
        this._framebufferCaps = null;
        this._miscCaps = null;
        this._shaderCaps = null;
        this._gpuObjectHasher = new WeakMap();
        this._gpuObjectHashCounter = 1;
        this._samplerCache = new SamplerCache(this);
        this._renderStatesOverridden = null;
    }
    get context() {
        return this._context;
    }
    get device() {
        return this._device;
    }
    get adapter() {
        return this._adapter;
    }
    get drawingBufferWidth() {
        return this.getDrawingBufferWidth();
    }
    get drawingBufferHeight() {
        return this.getDrawingBufferHeight();
    }
    get clientWidth() {
        return this._canvas.clientWidth;
    }
    get clientHeight() {
        return this._canvas.clientHeight;
    }
    get pipelineCache() {
        return this._pipelineCache;
    }
    get backbufferFormat() {
        return this._backBufferFormat;
    }
    get backbufferDepthFormat() {
        return this._depthFormat;
    }
    get defaultDepthTexture() {
        return this._defaultDepthTexture;
    }
    get defaultDepthTextureView() {
        return this._defaultDepthTextureView;
    }
    get defaultMSAAColorTextureView() {
        return this._defaultMSAAColorTextureView;
    }
    get defaultRenderPassDesc() {
        return this._defaultRenderPassDesc;
    }
    get sampleCount() {
        return this._sampleCount;
    }
    get currentPass() {
        return this._commandQueue.currentPass;
    }
    getCanvas() {
        return this._canvas;
    }
    getScale() {
        return this._dpr;
    }
    isContextLost() {
        return false;
    }
    getDeviceType() {
        return 'webgpu';
    }
    getTextureCaps() {
        return this._textureCaps;
    }
    getFramebufferCaps() {
        return this._framebufferCaps;
    }
    getMiscCaps() {
        return this._miscCaps;
    }
    getShaderCaps() {
        return this._shaderCaps;
    }
    getDrawingBufferWidth() {
        return this.getFramebuffer()?.getWidth() || this._canvas.width;
    }
    getDrawingBufferHeight() {
        return this.getFramebuffer()?.getHeight() || this._canvas.height;
    }
    getBackBufferWidth() {
        return this._canvas.width;
    }
    getBackBufferHeight() {
        return this._canvas.height;
    }
    async initContext() {
        if (!navigator.gpu) {
            throw new Error('No browser support for WebGPU');
        }
        this._adapter = await navigator.gpu.requestAdapter();
        if (!this._adapter) {
            throw new Error('WebGPU: requestAdapter() failed');
        }
        if (this._adapter.isFallbackAdapter) {
            console.warn('using a fallback adapter');
        }
        const featureNames = [
            'depth-clip-control',
            'depth24unorm-stencil8',
            'depth32float-stencil8',
            'texture-compression-bc',
            'texture-compression-etc2',
            'texture-compression-astc',
            'timestamp-query',
            'indirect-first-instance',
            'shader-f16'
        ].filter(val => this._adapter.features.has(val));
        this._device = await this._adapter.requestDevice({
            requiredFeatures: featureNames
        });
        if (!this._device) {
            throw new Error('WebGPU: requestDevice() failed');
        }
        console.log('WebGPU device features:');
        for (const feature of this._device.features) {
            console.log(` - ${feature}`);
        }
        this._context = this._canvas.getContext('webgpu') || null;
        if (!this._context) {
            this._canRender = false;
            throw new Error('WebGPU: getContext() failed');
        }
        this._canvas.width = this._canvas.clientWidth;
        this._canvas.height = this._canvas.clientHeight;
        this.configure();
        this._textureCaps = new WebGPUTextureCap(this);
        this._framebufferCaps = new WebGPUFramebufferCap(this);
        this._miscCaps = new WebGPUMiscCap(this);
        this._shaderCaps = new WebGPUShaderCap(this);
        this._pipelineCache = new PipelineCache(this);
        this._bindGroupCache = new BindGroupCache(this);
        this._vertexLayoutCache = new VertexLayoutCache();
        this._commandQueue = new CommandQueueImmediate(this);
        this._canRender = true;
        this.addDefaultEventListener('resize', evt => {
            const width = Math.max(1, Math.round(this._canvas.clientWidth * this._dpr));
            const height = Math.max(1, Math.round(this._canvas.clientHeight * this._dpr));
            if (width !== this._canvas.width || height !== this._canvas.height) {
                this._canvas.width = width;
                this._canvas.height = height;
                this.createDefaultRenderAttachments();
            }
        });
    }
    clearFrameBuffer(clearColor, clearDepth, clearStencil) {
        this._commandQueue.clear(clearColor, clearDepth, clearStencil);
    }
    createGPUTimer() {
        return null;
    }
    createRenderStateSet() {
        return new WebGPURenderStateSet(this);
    }
    createSampler(options) {
        return this.fetchSampler(options);
    }
    createTexture2D(format, width, height, options) {
        const tex = options?.texture ?? new WebGPUTexture2D(this);
        if (!tex.isTexture2D()) {
            console.error('createTexture2D() failed: options.texture must be 2d texture');
            return null;
        }
        tex.createEmpty(format, width, height, this.parseTextureOptions(options));
        return tex;
    }
    createTexture2DFromMipmapData(data, options) {
        const tex = options?.texture ?? new WebGPUTexture2D(this);
        if (!tex.isTexture2D()) {
            console.error('createTexture2DFromMipmapData() failed: options.texture must be 2d texture');
            return null;
        }
        tex.createWithMipmapData(data, this.parseTextureOptions(options));
        return tex;
    }
    createTexture2DFromImage(element, options) {
        const tex = options?.texture ?? new WebGPUTexture2D(this);
        if (!tex.isTexture2D()) {
            console.error('createTexture2DFromImage() failed: options.texture must be 2d texture');
            return null;
        }
        tex.loadFromElement(element, this.parseTextureOptions(options));
        return tex;
    }
    createTexture2DArray(format, width, height, depth, options) {
        const tex = options?.texture ?? new WebGPUTexture2DArray(this);
        if (!tex.isTexture2DArray()) {
            console.error('createTexture2DArray() failed: options.texture must be 2d array texture');
            return null;
        }
        tex.createEmpty(format, width, height, depth, this.parseTextureOptions(options));
        return tex;
    }
    createTexture3D(format, width, height, depth, options) {
        const tex = options?.texture ?? new WebGPUTexture3D(this);
        if (!tex.isTexture3D()) {
            console.error('createTexture3D() failed: options.texture must be 3d texture');
            return null;
        }
        tex.createEmpty(format, width, height, depth, this.parseTextureOptions(options));
        return tex;
    }
    createCubeTexture(format, size, options) {
        const tex = options?.texture ?? new WebGPUTextureCube(this);
        if (!tex.isTextureCube()) {
            console.error('createCubeTexture() failed: options.texture must be cube texture');
            return null;
        }
        tex.createEmpty(format, size, this.parseTextureOptions(options));
        return tex;
    }
    createCubeTextureFromMipmapData(data, options) {
        const tex = options?.texture ?? new WebGPUTextureCube(this);
        if (!tex.isTextureCube()) {
            console.error('createCubeTextureFromMipmapData() failed: options.texture must be cube texture');
            return null;
        }
        tex.createWithMipmapData(data, this.parseTextureOptions(options));
        return tex;
    }
    createTextureVideo(el) {
        return new WebGPUTextureVideo(this, el);
    }
    createGPUProgram(params) {
        return new WebGPUProgram(this, params);
    }
    createBindGroup(layout) {
        return new WebGPUBindGroup(this, layout);
    }
    createBuffer(sizeInBytes, options) {
        return new WebGPUBuffer(this, this.parseBufferOptions(options), sizeInBytes);
    }
    createIndexBuffer(data, options) {
        return new WebGPUIndexBuffer(this, data, this.parseBufferOptions(options, 'index'));
    }
    createStructuredBuffer(structureType, options, data) {
        return new WebGPUStructuredBuffer(this, structureType, this.parseBufferOptions(options), data);
    }
    createVAO(data) {
        return new WebGPUVertexInputLayout(this, data);
    }
    createFrameBuffer(options) {
        return new WebGPUFrameBuffer(this, options);
    }
    setBindGroup(index, bindGroup, dynamicOffsets) {
        this._currentBindGroups[index] = bindGroup;
        this._currentBindGroupOffsets[index] = dynamicOffsets || null;
    }
    setViewport(x, y, w, h) {
        if (x === null || x === undefined) {
            this._commandQueue.setViewport();
        }
        else if (Array.isArray(x)) {
            this._commandQueue.setViewport(x[0], x[1], x[2], x[3]);
        }
        else {
            this._commandQueue.setViewport(x, y, w, h);
        }
    }
    getViewport() {
        return this._commandQueue.getViewport();
    }
    setScissor(x, y, w, h) {
        if (x === null || x === undefined) {
            this._commandQueue.setScissor();
        }
        else if (Array.isArray(x)) {
            this._commandQueue.setScissor(x[0], x[1], x[2], x[3]);
        }
        else {
            this._commandQueue.setScissor(x, y, w, h);
        }
    }
    getScissor() {
        return this._commandQueue.getScissor();
    }
    setProgram(program) {
        this._currentProgram = program;
    }
    getProgram() {
        return this._currentProgram;
    }
    setVertexData(vertexData) {
        this._currentVertexData = vertexData;
    }
    getVertexData() {
        return this._currentVertexData;
    }
    setRenderStates(stateSet) {
        this._currentStateSet = stateSet;
    }
    getRenderStates() {
        return this._currentStateSet;
    }
    setFramebuffer(rt) {
        this._commandQueue.setFramebuffer(rt);
    }
    getFramebuffer() {
        return this._commandQueue.getFramebuffer();
    }
    reverseVertexWindingOrder(reverse) {
        this._reverseWindingOrder = !!reverse;
    }
    isWindingOrderReversed() {
        return this._reverseWindingOrder;
    }
    setRenderStatesOverridden(renderStates) {
        this._renderStatesOverridden = renderStates;
    }
    isBufferUploading(buffer) {
        return this._commandQueue.isBufferUploading(buffer);
    }
    isTextureUploading(tex) {
        return this._commandQueue.isTextureUploading(tex);
    }
    getRenderStatesOverridden() {
        return this._renderStatesOverridden;
    }
    getFramebufferInfo() {
        return this._commandQueue.getFramebufferInfo();
    }
    gpuGetObjectHash(obj) {
        return this._gpuObjectHasher.get(obj);
    }
    gpuCreateTexture(desc) {
        const tex = this._device.createTexture(desc);
        if (tex) {
            this._gpuObjectHasher.set(tex, ++this._gpuObjectHashCounter);
        }
        return tex;
    }
    gpuImportExternalTexture(el) {
        const tex = this._device.importExternalTexture({ source: el });
        if (tex) {
            this._gpuObjectHasher.set(tex, ++this._gpuObjectHashCounter);
        }
        return tex;
    }
    gpuCreateSampler(desc) {
        const sampler = this._device.createSampler(desc);
        if (sampler) {
            this._gpuObjectHasher.set(sampler, ++this._gpuObjectHashCounter);
        }
        return sampler;
    }
    gpuCreateBindGroup(desc) {
        const bindGroup = this._device.createBindGroup(desc);
        if (bindGroup) {
            this._gpuObjectHasher.set(bindGroup, ++this._gpuObjectHashCounter);
        }
        return bindGroup;
    }
    gpuCreateBuffer(desc) {
        const buffer = this._device.createBuffer(desc);
        if (buffer) {
            this._gpuObjectHasher.set(buffer, ++this._gpuObjectHashCounter);
        }
        return buffer;
    }
    gpuCreateTextureView(texture, desc) {
        const view = texture?.createView(desc);
        if (view) {
            this._gpuObjectHasher.set(view, ++this._gpuObjectHashCounter);
        }
        return view;
    }
    gpuCreateRenderPipeline(desc) {
        const pipeline = this._device.createRenderPipeline(desc);
        if (pipeline) {
            this._gpuObjectHasher.set(pipeline, ++this._gpuObjectHashCounter);
        }
        return pipeline;
    }
    gpuCreateComputePipeline(desc) {
        const pipeline = this._device.createComputePipeline(desc);
        if (pipeline) {
            this._gpuObjectHasher.set(pipeline, ++this._gpuObjectHashCounter);
        }
        return pipeline;
    }
    fetchVertexLayout(hash) {
        return this._vertexLayoutCache.fetchVertexLayout(hash);
    }
    fetchSampler(options) {
        return this._samplerCache.fetchSampler(options);
    }
    fetchBindGroupLayout(desc) {
        return this._bindGroupCache.fetchBindGroupLayout(desc);
    }
    flush() {
        this._commandQueue.flush();
    }
    async readPixels(x, y, w, h, buffer) {
        const fb = this.getFramebuffer();
        const colorAttachment = fb ? fb.getColorAttachments()[0]?.object : this.context.getCurrentTexture();
        const texFormat = fb ? fb.getColorAttachments()[0]?.format : textureFormatInvMap[this._backBufferFormat];
        if (colorAttachment && texFormat) {
            const pixelSize = getTextureFormatBlockSize(texFormat);
            const bufferSize = w * h * pixelSize;
            const stagingBuffer = this.createBuffer(bufferSize, {
                usage: 'read'
            });
            this.readPixelsToBuffer(x, y, w, h, stagingBuffer);
            const data = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
            await stagingBuffer.getBufferSubData(data);
            stagingBuffer.dispose();
        }
        else {
            console.error('readPixels() failed: no color attachment0 or unrecoganized color attachment format');
        }
    }
    readPixelsToBuffer(x, y, w, h, buffer) {
        const fb = this.getFramebuffer();
        const colorAttachment = fb ? fb.getColorAttachments()[0]?.object : this.context.getCurrentTexture();
        const texFormat = fb ? fb.getColorAttachments()[0]?.format : textureFormatInvMap[this._backBufferFormat];
        const texWidth = fb ? fb.getColorAttachments()[0]?.width : this.getDrawingBufferWidth();
        const texHeight = fb ? fb.getColorAttachments()[0]?.height : this.getDrawingBufferHeight();
        if (colorAttachment && texFormat) {
            this.flush();
            WebGPUBaseTexture.copyTexturePixelsToBuffer(this._device, colorAttachment, texWidth, texHeight, texFormat, x, y, w, h, 0, 0, buffer);
        }
        else {
            console.error('readPixelsToBuffer() failed: no color attachment0 or unrecoganized color attachment format');
        }
    }
    looseContext() {
    }
    restoreContext() {
    }
    onBeginFrame() {
        if (this._canRender) {
            this._commandQueue.beginFrame();
            return true;
        }
        else {
            return false;
        }
    }
    onEndFrame() {
        this._commandQueue.endFrame();
    }
    _draw(primitiveType, first, count) {
        this._commandQueue.draw(this._currentProgram, this._currentVertexData, this._currentStateSet, this._currentBindGroups, this._currentBindGroupOffsets, primitiveType, first, count, 1);
    }
    _drawInstanced(primitiveType, first, count, numInstances) {
        this._commandQueue.draw(this._currentProgram, this._currentVertexData, this._currentStateSet, this._currentBindGroups, this._currentBindGroupOffsets, primitiveType, first, count, numInstances);
    }
    _compute(workgroupCountX, workgroupCountY, workgroupCountZ) {
        this._commandQueue.compute(this._currentProgram, this._currentBindGroups, this._currentBindGroupOffsets, workgroupCountX, workgroupCountY, workgroupCountZ);
    }
    configure() {
        this._backBufferFormat = navigator.gpu.getPreferredCanvasFormat ? navigator.gpu.getPreferredCanvasFormat() : this._context.getPreferredFormat(this._adapter);
        this._depthFormat = 'depth24plus-stencil8';
        this._context.configure({
            device: this._device,
            format: this._backBufferFormat,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
            alphaMode: 'opaque',
            colorSpace: 'srgb',
        });
        this.createDefaultRenderAttachments();
    }
    createDefaultRenderAttachments() {
        const width = Math.max(1, this._canvas.width);
        const height = Math.max(1, this._canvas.height);
        this._defaultMSAAColorTexture?.destroy();
        this._defaultMSAAColorTexture = null;
        this._defaultMSAAColorTextureView = null;
        this._defaultDepthTexture?.destroy();
        this._defaultDepthTexture = null;
        this._defaultDepthTextureView = null;
        if (this._sampleCount > 1) {
            this._defaultMSAAColorTexture = this.gpuCreateTexture({
                size: {
                    width,
                    height,
                    depthOrArrayLayers: 1,
                },
                format: this._backBufferFormat,
                dimension: '2d',
                mipLevelCount: 1,
                sampleCount: this._sampleCount,
                usage: GPUTextureUsage.RENDER_ATTACHMENT
            });
            this._defaultMSAAColorTextureView = this._defaultMSAAColorTexture.createView();
        }
        this._defaultDepthTexture = this.gpuCreateTexture({
            size: {
                width,
                height,
                depthOrArrayLayers: 1,
            },
            format: this._depthFormat,
            dimension: '2d',
            mipLevelCount: 1,
            sampleCount: this._sampleCount,
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });
        this._defaultDepthTextureView = this._defaultDepthTexture.createView();
        this._defaultRenderPassDesc = {
            label: `mainRenderPass:${this._sampleCount}`,
            colorAttachments: [{
                    view: this._sampleCount > 1 ? this._defaultMSAAColorTextureView : null,
                    resolveTarget: undefined,
                    loadOp: 'clear',
                    clearValue: [0, 0, 0, 0],
                    storeOp: 'store',
                }],
            depthStencilAttachment: {
                view: this._defaultDepthTextureView,
                depthLoadOp: 'clear',
                depthClearValue: 1,
                depthStoreOp: 'store',
                stencilLoadOp: 'clear',
                stencilClearValue: 0,
                stencilStoreOp: 'store',
            }
        };
    }
    async tryCompile(code) {
        const sm = this._device.createShaderModule({
            code
        });
        if (sm && sm.compilationInfo) {
            const compilationInfo = await sm.compilationInfo();
            let err = false;
            if (compilationInfo?.messages?.length > 0) {
                let msg = '';
                for (const message of compilationInfo.messages) {
                    if (message.type === 'error') {
                        err = true;
                    }
                    msg += `${message.type}: ${message.message} (${message.lineNum}/${message.linePos})\n`;
                }
                if (msg) {
                    console.log(msg);
                }
            }
            return !err;
        }
        else {
            return true;
        }
    }
}
//# sourceMappingURL=device.js.map