import { Vector4 } from '@sophon/base';
import { TextureFormat, WebGLContext } from '../base_types';
import { IFrameBufferOptions, SamplerOptions, TextureSampler, Texture2D, Texture3D, TextureCube, TextureVideo, VertexInputLayout, GPUDataBuffer, IndexBuffer, FrameBuffer, GPUProgram, BindGroup, BindGroupLayout, StructuredBuffer, TextureMipmapData, TextureImageElement, Texture2DArray, TextureCreationOptions, BufferCreationOptions } from '../gpuobject';
import { GPUProgramConstructParams, Device, DeviceType, DeviceTypeWebGL, TextureCaps, MiscCaps, FramebufferCaps, ShaderCaps, DeviceOptions } from '../device';
import { RenderStateSet } from '../render_states';
import { PBStructTypeInfo } from '../builder';
import type { ITimer } from '../timer';
import type { VertexData } from '../vertexdata';
import type { TypedArray } from '../../misc';
declare global {
    interface WebGLRenderingContext {
        _currentFramebuffer: FrameBuffer;
        _currentProgram: GPUProgram;
    }
    interface WebGL2RenderingContext {
        _currentFramebuffer: FrameBuffer;
        _currentProgram: GPUProgram;
    }
}
export type VAOObject = WebGLVertexArrayObject | WebGLVertexArrayObjectOES;
export interface VertexArrayObjectEXT {
    createVertexArray: () => VAOObject;
    bindVertexArray: (arrayObject: VAOObject) => void;
    deleteVertexArray: (arrayObject: VAOObject) => void;
    isVertexArray: (arrayObject: VAOObject) => GLboolean;
}
export interface InstancedArraysEXT {
    drawArraysInstanced: (mode: GLenum, first: GLint, count: GLsizei, primcount: GLsizei) => void;
    drawElementsInstanced: (mode: GLenum, count: GLsizei, type: GLenum, offset: GLintptr, primcount: GLsizei) => void;
    vertexAttribDivisor: (index: GLuint, divisor: GLuint) => void;
}
export interface DrawBuffersEXT {
    drawBuffers(buffers: number[]): any;
}
export declare class WebGLDevice extends Device {
    private _context;
    private _loseContextExtension;
    private _contextLost;
    private _isRendering;
    private _deviceType;
    private _canvas;
    private _dpr;
    private _reverseWindingOrder;
    private _textureCaps;
    private _framebufferCaps;
    private _miscCaps;
    private _shaderCaps;
    private _vaoExt;
    private _instancedArraysExt;
    private _drawBuffersExt;
    private _currentProgram;
    private _currentVertexData;
    private _currentStateSet;
    private _currentBindGroups;
    private _currentBindGroupOffsets;
    private _currentViewport;
    private _currentScissorRect;
    private _samplerCache;
    private _renderStatesOverridden;
    constructor(cvs: HTMLCanvasElement, type: DeviceTypeWebGL, options?: DeviceOptions);
    get context(): WebGLContext;
    get isWebGL2(): boolean;
    get drawingBufferWidth(): number;
    get drawingBufferHeight(): number;
    get clientWidth(): number;
    get clientHeight(): number;
    getCanvas(): HTMLCanvasElement;
    getScale(): number;
    isContextLost(): boolean;
    getDeviceType(): DeviceType;
    getTextureCaps(): TextureCaps;
    getFramebufferCaps(): FramebufferCaps;
    getMiscCaps(): MiscCaps;
    getShaderCaps(): ShaderCaps;
    get vaoExt(): VertexArrayObjectEXT;
    get instancedArraysExt(): InstancedArraysEXT;
    get drawBuffersExt(): DrawBuffersEXT;
    getDrawingBufferWidth(): number;
    getDrawingBufferHeight(): number;
    getBackBufferWidth(): number;
    getBackBufferHeight(): number;
    initContext(): Promise<void>;
    clearFrameBuffer(clearColor: Vector4, clearDepth: number, clearStencil: number): void;
    createGPUTimer(): ITimer;
    createRenderStateSet(): RenderStateSet;
    createSampler(options: SamplerOptions): TextureSampler;
    createTexture2D(format: TextureFormat, width: number, height: number, options?: TextureCreationOptions): Texture2D;
    createTexture2DFromMipmapData(data: TextureMipmapData, options?: TextureCreationOptions): Texture2D;
    createTexture2DFromImage(element: TextureImageElement, options?: TextureCreationOptions): Texture2D;
    createTexture2DArray(format: TextureFormat, width: number, height: number, depth: number, options?: TextureCreationOptions): Texture2DArray;
    createTexture3D(format: TextureFormat, width: number, height: number, depth: number, options?: TextureCreationOptions): Texture3D;
    createCubeTexture(format: TextureFormat, size: number, options?: TextureCreationOptions): TextureCube;
    createCubeTextureFromMipmapData(data: TextureMipmapData, options?: TextureCreationOptions): TextureCube;
    createTextureVideo(el: HTMLVideoElement): TextureVideo;
    createGPUProgram(params: GPUProgramConstructParams): GPUProgram;
    createBindGroup(layout: BindGroupLayout): BindGroup;
    createBuffer(sizeInBytes: number, options: BufferCreationOptions): GPUDataBuffer;
    createIndexBuffer(data: Uint16Array | Uint32Array, options?: BufferCreationOptions): IndexBuffer;
    createStructuredBuffer(structureType: PBStructTypeInfo, options?: BufferCreationOptions, data?: TypedArray): StructuredBuffer;
    createVAO(vertexData: VertexData): VertexInputLayout;
    createFrameBuffer(options?: IFrameBufferOptions): FrameBuffer;
    setBindGroup(index: number, bindGroup: BindGroup, bindGroupOffsets?: Iterable<number>): void;
    setViewport(vp?: number[]): any;
    setViewport(x: number, y: number, w: number, h: number): any;
    getViewport(): number[];
    setScissor(scissor?: number[]): any;
    setScissor(x: number, y: number, w: number, h: number): void;
    getScissor(): number[];
    setProgram(program: GPUProgram): void;
    getProgram(): GPUProgram;
    setVertexData(vertexData: VertexInputLayout): void;
    getVertexData(): VertexInputLayout;
    setRenderStates(stateSet: RenderStateSet): void;
    getRenderStates(): RenderStateSet;
    setFramebuffer(rt: FrameBuffer): void;
    getFramebuffer(): FrameBuffer;
    reverseVertexWindingOrder(reverse: boolean): void;
    isWindingOrderReversed(): boolean;
    setRenderStatesOverridden(renderStates: RenderStateSet): void;
    flush(): void;
    readPixels(x: number, y: number, w: number, h: number, buffer: TypedArray): Promise<void>;
    readPixelsToBuffer(x: number, y: number, w: number, h: number, buffer: GPUDataBuffer): void;
    looseContext(): void;
    restoreContext(): void;
    getError(throwError?: boolean): Error;
}
