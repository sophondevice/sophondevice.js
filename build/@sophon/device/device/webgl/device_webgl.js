/** sophon base library */
import { TextureFormat, isCompressedTextureFormat, isDepthTextureFormat, hasRedChannel, hasGreenChannel, hasBlueChannel, hasAlphaChannel, isIntegerTextureFormat, isFloatTextureFormat, isSignedTextureFormat, getTextureFormatBlockSize } from '../base_types.js';
import { isWebGL2, WebGLError } from './utils.js';
import { WebGLEnum } from './webgl_enum.js';
import { WebGLTexture2D } from './texture2d_webgl.js';
import { WebGLTexture2DArray } from './texture2darray_webgl.js';
import { WebGLTexture3D } from './texture3d_webgl.js';
import { WebGLTextureCube } from './texturecube_webgl.js';
import { WebGLTextureVideo } from './texturevideo_webgl.js';
import { WebGLVertexInputLayout } from './vertexinputlayout_webgl.js';
import { WebGLGPUBuffer } from './buffer_webgl.js';
import { WebGLIndexBuffer } from './indexbuffer_webgl.js';
import { WebGLFrameBuffer } from './framebuffer_webgl.js';
import { WebGLDepthState, WebGLRenderStateSet } from './renderstate_webgl.js';
import { GPUTimer } from './gpu_timer.js';
import { WebGLTextureCap, WebGLFramebufferCap, WebGLMiscCap, WebGLShaderCap } from './capabilities_webgl.js';
import { WebGLBindGroup } from './bindgroup_webgl.js';
import { WebGLGPUProgram } from './gpuprogram_webgl.js';
import { primitiveTypeMap, typeMap } from './constants_webgl.js';
import { Device, DeviceLostEvent, DeviceRestoreEvent } from '../device.js';
import { SamplerCache } from './sampler_cache.js';
import { WebGLStructuredBuffer } from './structuredbuffer_webgl.js';
import '../builder/ast.js';
import '../gpuobject.js';
import { typeU16 } from '../builder/types.js';
import '../builder/builtinfunc.js';
import '../builder/constructors.js';

class WebGLDevice extends Device {
    _context;
    _loseContextExtension;
    _contextLost;
    _isRendering;
    _deviceType;
    _canvas;
    _dpr;
    _reverseWindingOrder;
    _textureCaps;
    _framebufferCaps;
    _miscCaps;
    _shaderCaps;
    _vaoExt;
    _instancedArraysExt;
    _drawBuffersExt;
    _currentProgram;
    _currentVertexData;
    _currentStateSet;
    _currentBindGroups;
    _currentBindGroupOffsets;
    _currentViewport;
    _currentScissorRect;
    _samplerCache;
    _renderStatesOverridden;
    constructor(cvs, type, options) {
        super();
        this._canvas = cvs;
        this._dpr = Math.ceil(options?.dpr ?? window.devicePixelRatio);
        this._canvas.style.outline = 'none';
        this._isRendering = false;
        let context = null;
        context = this._canvas.getContext(type, {
            antialias: !!options?.msaa,
            depth: true,
            stencil: true,
            premultipliedAlpha: false
        });
        if (!context) {
            this._deviceType = null;
            throw new Error('Invalid argument or no webgl support');
        }
        this._contextLost = false;
        this._deviceType = type;
        this._reverseWindingOrder = false;
        this._textureCaps = null;
        this._framebufferCaps = null;
        this._miscCaps = null;
        this._shaderCaps = null;
        this._context = context;
        this._currentProgram = null;
        this._currentVertexData = null;
        this._currentStateSet = null;
        this._currentBindGroups = [];
        this._currentBindGroupOffsets = [];
        this._currentViewport = null;
        this._currentScissorRect = null;
        this._samplerCache = new SamplerCache(this);
        this._renderStatesOverridden = null;
        this._loseContextExtension = this._context.getExtension('WEBGL_lose_context');
        this._canvas.addEventListener('webglcontextlost', evt => {
            this._contextLost = true;
            evt.preventDefault();
            this.handleContextLost();
        }, false);
        this._canvas.addEventListener('webglcontextrestored', evt => {
            this._contextLost = false;
            this.handleContextRestored();
        }, false);
    }
    get context() {
        return this._context;
    }
    get isWebGL2() {
        return this._context && isWebGL2(this._context);
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
    getCanvas() {
        return this._canvas;
    }
    getScale() {
        return this._dpr;
    }
    isContextLost() {
        return this._context.isContextLost();
    }
    getDeviceType() {
        return this._deviceType;
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
    get vaoExt() {
        return this._vaoExt;
    }
    get instancedArraysExt() {
        return this._instancedArraysExt;
    }
    get drawBuffersExt() {
        return this._drawBuffersExt;
    }
    getDrawingBufferWidth() {
        return this._context._currentFramebuffer?.getWidth() || this._context.drawingBufferWidth;
    }
    getDrawingBufferHeight() {
        return this._context._currentFramebuffer?.getHeight() || this._context.drawingBufferHeight;
    }
    getBackBufferWidth() {
        return this._canvas.width;
    }
    getBackBufferHeight() {
        return this._canvas.height;
    }
    async initContext() {
        this.initContextState();
        this.addDefaultEventListener('resize', evt => {
            const width = Math.max(1, Math.round(this._canvas.clientWidth * this._dpr));
            const height = Math.max(1, Math.round(this._canvas.clientHeight * this._dpr));
            if (width !== this._canvas.width || height !== this._canvas.height) {
                this._canvas.width = width;
                this._canvas.height = height;
                this.setViewport(null);
                this.setScissor(null);
            }
        });
    }
    clearFrameBuffer(clearColor, clearDepth, clearStencil) {
        const gl = this._context;
        const colorFlag = clearColor ? gl.COLOR_BUFFER_BIT : 0;
        const depthFlag = typeof clearDepth === 'number' ? gl.DEPTH_BUFFER_BIT : 0;
        const stencilFlag = typeof clearStencil === 'number' ? gl.STENCIL_BUFFER_BIT : 0;
        if (colorFlag || depthFlag || stencilFlag) {
            WebGLDepthState.applyDefaults(this._context);
            if (isWebGL2(gl) && gl._currentFramebuffer) {
                if (depthFlag || stencilFlag) {
                    const depthAttachment = gl._currentFramebuffer.getDepthAttachment();
                    if (depthAttachment) {
                        gl.clearBufferfi(WebGLEnum.DEPTH_STENCIL, 0, clearDepth || 1, clearStencil || 0);
                    }
                }
                if (colorFlag) {
                    const attachments = gl._currentFramebuffer.getColorAttachments();
                    for (let i = 0; i < attachments.length; i++) {
                        gl.clearBufferfv(WebGLEnum.COLOR, i, clearColor.getArray());
                    }
                }
            }
            else {
                gl.clearColor(clearColor.x, clearColor.y, clearColor.z, clearColor.w);
                gl.clearDepth(clearDepth);
                gl.clearStencil(clearStencil);
                gl.clear(colorFlag | depthFlag | stencilFlag);
            }
        }
    }
    createGPUTimer() {
        return new GPUTimer(this);
    }
    createRenderStateSet() {
        return new WebGLRenderStateSet(this._context);
    }
    createSampler(options) {
        return this._samplerCache.fetchSampler(options);
    }
    createTexture2D(format, width, height, options) {
        const tex = options?.texture ?? new WebGLTexture2D(this);
        if (!tex.isTexture2D()) {
            console.error('createTexture2D() failed: options.texture must be 2d texture');
            return null;
        }
        tex.createEmpty(format, width, height, this.parseTextureOptions(options));
        return tex;
    }
    createTexture2DFromMipmapData(data, options) {
        const tex = options?.texture ?? new WebGLTexture2D(this);
        if (!tex.isTexture2D()) {
            console.error('createTexture2DFromMipmapData() failed: options.texture must be 2d texture');
            return null;
        }
        tex.createWithMipmapData(data, this.parseTextureOptions(options));
        return tex;
    }
    createTexture2DFromImage(element, options) {
        const tex = options?.texture ?? new WebGLTexture2D(this);
        if (!tex.isTexture2D()) {
            console.error('createTexture2DFromImage() failed: options.texture must be 2d texture');
            return null;
        }
        tex.loadFromElement(element, this.parseTextureOptions(options));
        return tex;
    }
    createTexture2DArray(format, width, height, depth, options) {
        const tex = options?.texture ?? new WebGLTexture2DArray(this);
        if (!tex.isTexture2DArray()) {
            console.error('createTexture2DArray() failed: options.texture must be 2d array texture');
            return null;
        }
        tex.createEmpty(format, width, height, depth, this.parseTextureOptions(options));
        return tex;
    }
    createTexture3D(format, width, height, depth, options) {
        if (!this.isWebGL2) {
            console.error('device does not support 3d texture');
            return null;
        }
        const tex = options?.texture ?? new WebGLTexture3D(this);
        if (!tex.isTexture3D()) {
            console.error('createTexture3D() failed: options.texture must be 3d texture');
            return null;
        }
        tex.createEmpty(format, width, height, depth, this.parseTextureOptions(options));
        return tex;
    }
    createCubeTexture(format, size, options) {
        const tex = options?.texture ?? new WebGLTextureCube(this);
        if (!tex.isTextureCube()) {
            console.error('createCubeTexture() failed: options.texture must be cube texture');
            return null;
        }
        tex.createEmpty(format, size, this.parseTextureOptions(options));
        return tex;
    }
    createCubeTextureFromMipmapData(data, options) {
        const tex = options?.texture ?? new WebGLTextureCube(this);
        if (!tex.isTextureCube()) {
            console.error('createCubeTextureFromMipmapData() failed: options.texture must be cube texture');
            return null;
        }
        tex.createWithMipmapData(data, this.parseTextureOptions(options));
        return tex;
    }
    createTextureVideo(el) {
        return new WebGLTextureVideo(this, el);
    }
    createGPUProgram(params) {
        if (params.type === 'compute') {
            throw new Error('device does not support compute shader');
        }
        const renderProgramParams = params.params;
        return new WebGLGPUProgram(this, renderProgramParams.vs, renderProgramParams.fs, renderProgramParams.bindGroupLayouts, renderProgramParams.vertexAttributes);
    }
    createBindGroup(layout) {
        return new WebGLBindGroup(this, layout);
    }
    createBuffer(sizeInBytes, options) {
        return new WebGLGPUBuffer(this, this.parseBufferOptions(options), sizeInBytes);
    }
    createIndexBuffer(data, options) {
        return new WebGLIndexBuffer(this, data, this.parseBufferOptions(options, 'index'));
    }
    createStructuredBuffer(structureType, options, data) {
        return new WebGLStructuredBuffer(this, structureType, this.parseBufferOptions(options), data);
    }
    createVAO(vertexData) {
        return new WebGLVertexInputLayout(this, vertexData);
    }
    createFrameBuffer(options) {
        return new WebGLFrameBuffer(this, options);
    }
    setBindGroup(index, bindGroup, bindGroupOffsets) {
        if (bindGroupOffsets && !isWebGL2(this._context)) {
            throw new Error(`setBindGroup(): no dynamic offset buffer support for WebGL1 device`);
        }
        this._currentBindGroups[index] = bindGroup;
        this._currentBindGroupOffsets[index] = bindGroupOffsets || null;
    }
    setViewport(x, y, w, h) {
        if (x === null || x === undefined) {
            this._currentViewport = null;
            this._context.viewport(0, 0, this.drawingBufferWidth, this.drawingBufferHeight);
        }
        else if (Array.isArray(x)) {
            this._currentViewport = [...x];
            this._context.viewport(this.screenToDevice(x[0]), this.screenToDevice(x[1]), this.screenToDevice(x[2]), this.screenToDevice(x[3]));
        }
        else {
            this._currentViewport = [x, y, w, h];
            this._context.viewport(this.screenToDevice(x), this.screenToDevice(y), this.screenToDevice(w), this.screenToDevice(h));
        }
    }
    getViewport() {
        return this._currentViewport ? [...this._currentViewport] : [0, 0, this.deviceToScreen(this.drawingBufferWidth), this.deviceToScreen(this.drawingBufferHeight)];
    }
    setScissor(x, y, w, h) {
        if (x === null || x === undefined) {
            this._currentScissorRect = null;
            this._context.scissor(0, 0, this.drawingBufferWidth, this.drawingBufferHeight);
        }
        else if (Array.isArray(x)) {
            this._currentScissorRect = [...x];
            this._context.scissor(this.screenToDevice(x[0]), this.screenToDevice(x[1]), this.screenToDevice(x[2]), this.screenToDevice(x[3]));
        }
        else {
            this._currentScissorRect = [x, y, w, h];
            this._context.scissor(this.screenToDevice(x), this.screenToDevice(y), this.screenToDevice(w), this.screenToDevice(h));
        }
    }
    getScissor() {
        return this._currentScissorRect ? [...this._currentScissorRect] : [0, 0, this.deviceToScreen(this.drawingBufferWidth), this.deviceToScreen(this.drawingBufferHeight)];
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
        if (rt) {
            rt.bind();
        }
        else {
            if (this._context._currentFramebuffer) {
                const renderTextures = this._context._currentFramebuffer.getColorAttachments();
                this._context._currentFramebuffer?.unbind();
                for (const tex of renderTextures) {
                    if (tex.mipLevelCount > 1) {
                        tex.generateMipmaps();
                    }
                }
            }
        }
    }
    getFramebuffer() {
        return this._context._currentFramebuffer || null;
    }
    reverseVertexWindingOrder(reverse) {
        this._reverseWindingOrder = !!reverse;
        this._context.frontFace(reverse ? this._context.CW : this._context.CCW);
    }
    isWindingOrderReversed() {
        return !!this._reverseWindingOrder;
    }
    setRenderStatesOverridden(renderStates) {
        this._renderStatesOverridden = renderStates;
    }
    flush() {
        this.context.flush();
    }
    async readPixels(x, y, w, h, buffer) {
        const fb = this.getFramebuffer();
        const colorAttachment = fb ? fb.getColorAttachments()[0] : null;
        const format = colorAttachment ? colorAttachment.format : TextureFormat.RGBA8UNORM;
        let glFormat = WebGLEnum.NONE;
        let glType = WebGLEnum.NONE;
        const r = hasRedChannel(format);
        const g = hasGreenChannel(format);
        const b = hasBlueChannel(format);
        const a = hasAlphaChannel(format);
        const numChannels = (r ? 1 : 0) + (g ? 1 : 0) + (b ? 1 : 0) + (a ? 1 : 0);
        const pixelSize = getTextureFormatBlockSize(format);
        const size = pixelSize / numChannels;
        const integer = isIntegerTextureFormat(format);
        const float = isFloatTextureFormat(format);
        const signed = isSignedTextureFormat(format);
        if (r && g && b && a) {
            glFormat = integer ? WebGLEnum.RGBA_INTEGER : WebGLEnum.RGBA;
        }
        else if (r && g) {
            glFormat = integer ? WebGLEnum.RG_INTEGER : WebGLEnum.RG;
        }
        else if (r) {
            glFormat = integer ? WebGLEnum.RED_INTEGER : WebGLEnum.RED;
        }
        if (size === 1) {
            glType = signed ? WebGLEnum.BYTE : WebGLEnum.UNSIGNED_BYTE;
        }
        else if (size === 2) {
            glType = float ? WebGLEnum.HALF_FLOAT : signed ? WebGLEnum.SHORT : WebGLEnum.UNSIGNED_SHORT;
        }
        else if (size === 4) {
            glType = float ? WebGLEnum.FLOAT : signed ? WebGLEnum.INT : WebGLEnum.UNSIGNED_INT;
        }
        if ((glFormat !== WebGLEnum.RGBA || (glType !== WebGLEnum.UNSIGNED_BYTE && glType !== WebGLEnum.FLOAT)) && !isWebGL2(this.context)) {
            throw new Error(`readPixels() failed: invalid format: ${format}`);
        }
        const byteSize = w * h * pixelSize;
        if (buffer.byteLength < byteSize) {
            throw new Error(`readPixels() failed: destination buffer must have at least ${byteSize} bytes`);
        }
        if (isWebGL2(this.context)) {
            const stagingBuffer = this.createBuffer(byteSize, {
                usage: 'read'
            });
            this.context.bindBuffer(WebGLEnum.PIXEL_PACK_BUFFER, stagingBuffer.object);
            this.context.readBuffer(WebGLEnum.COLOR_ATTACHMENT0);
            this.flush();
            this.context.readPixels(x, y, w, h, glFormat, glType, 0);
            this.context.bindBuffer(WebGLEnum.PIXEL_PACK_BUFFER, null);
            const data = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
            await stagingBuffer.getBufferSubData(data);
            stagingBuffer.dispose();
        }
        else {
            this.context.readPixels(x, y, w, h, glFormat, glType, new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength));
        }
    }
    readPixelsToBuffer(x, y, w, h, buffer) {
        const fb = this.getFramebuffer();
        const colorAttachment = fb ? fb.getColorAttachments()[0] : null;
        const format = colorAttachment ? colorAttachment.format : TextureFormat.RGBA8UNORM;
        let glFormat = WebGLEnum.NONE;
        let glType = WebGLEnum.NONE;
        if (!isWebGL2(this.context)) {
            throw new Error('readPixels() failed: readPixels() requires webgl2 device');
        }
        if (isCompressedTextureFormat(format) || isDepthTextureFormat(format)) {
            throw new Error(`readPixels() failed: invalid format: ${format}`);
        }
        const r = hasRedChannel(format);
        const g = hasGreenChannel(format);
        const b = hasBlueChannel(format);
        const a = hasAlphaChannel(format);
        const numChannels = (r ? 1 : 0) + (g ? 1 : 0) + (b ? 1 : 0) + (a ? 1 : 0);
        const size = getTextureFormatBlockSize(format) / numChannels;
        const integer = isIntegerTextureFormat(format);
        const float = isFloatTextureFormat(format);
        const signed = isSignedTextureFormat(format);
        if (r && g && b && a) {
            glFormat = integer ? WebGLEnum.RGBA_INTEGER : WebGLEnum.RGBA;
        }
        else if (r && g) {
            glFormat = integer ? WebGLEnum.RG_INTEGER : WebGLEnum.RG;
        }
        else if (r) {
            glFormat = integer ? WebGLEnum.RED_INTEGER : WebGLEnum.RED;
        }
        if (size === 1) {
            glType = signed ? WebGLEnum.BYTE : WebGLEnum.UNSIGNED_BYTE;
        }
        else if (size === 2) {
            glType = float ? WebGLEnum.HALF_FLOAT : signed ? WebGLEnum.SHORT : WebGLEnum.UNSIGNED_SHORT;
        }
        else if (size === 4) {
            glType = float ? WebGLEnum.FLOAT : signed ? WebGLEnum.INT : WebGLEnum.UNSIGNED_INT;
        }
        this.context.bindBuffer(WebGLEnum.PIXEL_PACK_BUFFER, buffer.object);
        this.context.readBuffer(WebGLEnum.COLOR_ATTACHMENT0);
        this.flush();
        this.context.readPixels(x, y, w, h, glFormat, glType, 0);
        this.context.bindBuffer(WebGLEnum.PIXEL_PACK_BUFFER, null);
    }
    looseContext() {
        if (!this.context.isContextLost()) {
            this._loseContextExtension?.loseContext();
        }
    }
    restoreContext() {
        if (this.context.isContextLost()) {
            this.clearErrors();
            this._loseContextExtension?.restoreContext();
            const err = this.getError();
            if (err) {
                console.log(err);
            }
        }
    }
    onBeginFrame() {
        if (this._contextLost) {
            if (!this._context.isContextLost()) {
                this._contextLost = false;
                this.handleContextRestored();
            }
        }
        return !this._contextLost;
    }
    onEndFrame() {
    }
    _draw(primitiveType, first, count) {
        if (this._currentVertexData) {
            this._currentVertexData.bind();
            if (this._currentProgram) {
                if (!this._currentProgram.use()) {
                    return;
                }
                for (let i = 0; i < this._currentBindGroups.length; i++) {
                    const bindGroup = this._currentBindGroups[i];
                    if (bindGroup) {
                        const offsets = this._currentBindGroupOffsets[i];
                        bindGroup.apply(this._currentProgram, offsets);
                    }
                }
            }
            if (this._currentStateSet) {
                this._currentStateSet.apply(this._renderStatesOverridden);
            }
            else {
                WebGLRenderStateSet.applyDefaults(this._context);
            }
            const indexBuffer = this._currentVertexData.indexBuffer;
            if (indexBuffer) {
                this.context.drawElements(primitiveTypeMap[primitiveType], count, typeMap[indexBuffer.indexType.primitiveType], first * (indexBuffer.indexType === typeU16 ? 2 : 4));
            }
            else {
                this.context.drawArrays(primitiveTypeMap[primitiveType], first, count);
            }
        }
    }
    _drawInstanced(primitiveType, first, count, numInstances) {
        if (this.instancedArraysExt && this._currentVertexData) {
            this._currentVertexData.bind();
            if (this._currentProgram) {
                if (!this._currentProgram.use()) {
                    return;
                }
                for (let i = 0; i < this._currentBindGroups.length; i++) {
                    const bindGroup = this._currentBindGroups[i];
                    if (bindGroup) {
                        const offsets = this._currentBindGroupOffsets[i];
                        bindGroup.apply(this._currentProgram, offsets);
                    }
                }
            }
            this._currentStateSet?.apply(this._renderStatesOverridden);
            const indexBuffer = this._currentVertexData.indexBuffer;
            if (indexBuffer) {
                this.instancedArraysExt.drawElementsInstanced(primitiveTypeMap[primitiveType], count, typeMap[indexBuffer.indexType.primitiveType], first * (indexBuffer.indexType === typeU16 ? 2 : 4), numInstances);
            }
            else {
                this.instancedArraysExt.drawArraysInstanced(primitiveTypeMap[primitiveType], first, count, numInstances);
            }
        }
    }
    _compute() {
        throw new Error('WebGL device does not support compute shader');
    }
    createInstancedArraysEXT() {
        const gl = this._context;
        if (isWebGL2(gl)) {
            return {
                vertexAttribDivisor: gl.vertexAttribDivisor.bind(gl),
                drawArraysInstanced: gl.drawArraysInstanced.bind(gl),
                drawElementsInstanced: gl.drawElementsInstanced.bind(gl),
            };
        }
        else {
            const extInstancedArray = gl.getExtension('ANGLE_instanced_arrays');
            return extInstancedArray
                ? {
                    vertexAttribDivisor: extInstancedArray.vertexAttribDivisorANGLE.bind(extInstancedArray),
                    drawArraysInstanced: extInstancedArray.drawArraysInstancedANGLE.bind(extInstancedArray),
                    drawElementsInstanced: extInstancedArray.drawElementsInstancedANGLE.bind(extInstancedArray),
                }
                : null;
        }
    }
    createDrawBuffersEXT() {
        const gl = this._context;
        if (isWebGL2(gl)) {
            return {
                drawBuffers: gl.drawBuffers.bind(gl),
            };
        }
        else {
            const extDrawBuffers = gl.getExtension('WEBGL_draw_buffers');
            return extDrawBuffers
                ? {
                    drawBuffers: extDrawBuffers.drawBuffersWEBGL.bind(extDrawBuffers),
                }
                : null;
        }
    }
    createVertexArrayObjectEXT() {
        const gl = this._context;
        if (isWebGL2(gl)) {
            return {
                createVertexArray: gl.createVertexArray.bind(gl),
                bindVertexArray: gl.bindVertexArray.bind(gl),
                deleteVertexArray: gl.deleteVertexArray.bind(gl),
                isVertexArray: gl.isVertexArray.bind(gl),
            };
        }
        else {
            const extVAO = gl.getExtension('OES_vertex_array_object');
            return extVAO
                ? {
                    createVertexArray: extVAO.createVertexArrayOES.bind(extVAO),
                    bindVertexArray: extVAO.bindVertexArrayOES.bind(extVAO),
                    deleteVertexArray: extVAO.deleteVertexArrayOES.bind(extVAO),
                    isVertexArray: extVAO.isVertexArrayOES.bind(extVAO),
                }
                : null;
        }
    }
    handleContextLost() {
        this._isRendering = this.isRendering;
        this.exitLoop();
        console.log('handle context lost');
        this.invalidateAll();
        this.dispatchEvent(new DeviceLostEvent());
    }
    handleContextRestored() {
        console.log('handle context restored');
        this.initContextState();
        this._currentProgram = null;
        this._currentVertexData = null;
        this._currentStateSet = null;
        this._currentBindGroups = [];
        this._currentBindGroupOffsets = [];
        this._currentViewport = null;
        this._currentScissorRect = null;
        this._samplerCache = new SamplerCache(this);
        if (this._isRendering) {
            this._isRendering = false;
            this.reloadAll().then(() => {
                this.dispatchEvent(new DeviceRestoreEvent());
                this.runLoop(this._runLoopFunc);
            });
        }
    }
    initContextState() {
        this._textureCaps = new WebGLTextureCap(this._context);
        this._framebufferCaps = new WebGLFramebufferCap(this._context);
        this._miscCaps = new WebGLMiscCap(this._context);
        this._shaderCaps = new WebGLShaderCap(this._context);
        this._vaoExt = this.createVertexArrayObjectEXT();
        this._instancedArraysExt = this.createInstancedArraysEXT();
        this._drawBuffersExt = this.createDrawBuffersEXT();
        this._context.pixelStorei(WebGLEnum.UNPACK_COLORSPACE_CONVERSION_WEBGL, WebGLEnum.NONE);
        this._context.pixelStorei(WebGLEnum.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        this.setViewport(null);
        this.setScissor(null);
        this._context.enable(WebGLEnum.SCISSOR_TEST);
        this.enableGPUTimeRecording(true);
        this._context._currentFramebuffer = undefined;
        this._context._currentProgram = undefined;
    }
    clearErrors() {
        while (this._context.getError())
            ;
    }
    getError(throwError) {
        const errcode = this._context.getError();
        const err = errcode === WebGLEnum.NO_ERROR ? null : new WebGLError(errcode);
        if (err && throwError) {
            throw err;
        }
        return err;
    }
}

export { WebGLDevice };
//# sourceMappingURL=device_webgl.js.map
