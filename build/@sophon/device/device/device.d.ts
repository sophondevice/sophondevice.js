import { REventTarget, REvent, Vector4 } from '@sophon/base';
import { PrimitiveType, TextureFormat } from './base_types';
import { CPUTimer, ITimer } from './timer';
import { AssetManager } from '../scene/asset/assetmanager';
import type { TypedArray } from '../misc';
import type { RenderStateSet } from './render_states';
import type { VertexData } from './vertexdata';
import { IFrameBufferOptions, SamplerOptions, TextureSampler, Texture2D, Texture3D, TextureCube, VertexInputLayout, GPUDataBuffer, FrameBuffer, BaseTexture, GPUProgram, GPUObject, StructuredBuffer, BindGroupLayout, BindGroup, IndexBuffer, TextureVideo, TextureMipmapData, TextureImageElement, Texture2DArray, TextureCreationOptions, BufferCreationOptions } from './gpuobject';
import { PBStructTypeInfo, ProgramBuilder } from './builder';
interface GPUObjectList {
    textures: BaseTexture[];
    samplers: TextureSampler[];
    buffers: GPUDataBuffer[];
    programs: GPUProgram[];
    framebuffers: FrameBuffer[];
    vertexArrayObjects: VertexInputLayout[];
    bindGroups: BindGroup[];
}
export interface EngineCaps {
    maxVertexAttributes: number;
    maxBindGroups: number;
    maxTexCoordIndex: number;
}
export interface FramebufferCaps {
    maxDrawBuffers: number;
    supportDrawBuffers: boolean;
    supportRenderMipmap: boolean;
}
export interface MiscCaps {
    supportBlendMinMax: boolean;
    support32BitIndex: boolean;
    supportLoseContext: boolean;
    supportDebugRendererInfo: boolean;
    supportSharedUniforms: boolean;
}
export interface ShaderCaps {
    supportFragmentDepth: boolean;
    supportStandardDerivatives: boolean;
    supportShaderTextureLod: boolean;
    supportHighPrecisionFloat: boolean;
    supportHighPrecisionInt: boolean;
    maxUniformBufferSize: number;
    uniformBufferOffsetAlignment: number;
}
export interface ITextureFormatInfo {
    filterable: boolean;
    renderable: boolean;
    compressed: boolean;
}
export interface TextureCaps {
    maxTextureSize: number;
    maxCubeTextureSize: number;
    npo2Mipmapping: boolean;
    npo2Repeating: boolean;
    supportS3TC: boolean;
    supportS3TCSRGB: boolean;
    supportDepthTexture: boolean;
    support3DTexture: boolean;
    supportSRGBTexture: boolean;
    supportFloatTexture: boolean;
    supportLinearFloatTexture: boolean;
    supportHalfFloatTexture: boolean;
    supportLinearHalfFloatTexture: boolean;
    supportAnisotropicFiltering: boolean;
    supportFloatColorBuffer: boolean;
    supportHalfFloatColorBuffer: boolean;
    supportFloatBlending: boolean;
    getTextureFormatInfo(format: TextureFormat): ITextureFormatInfo;
}
export type DeviceTypeWebGL = 'webgl' | 'webgl2';
export type DeviceTypeWebGPU = 'webgpu';
export type DeviceType = DeviceTypeWebGL | DeviceTypeWebGPU;
export declare const DEVICE_TYPE_WEBGL = "webgl";
export declare const DEVICE_TYPE_WEBGL2 = "webgl2";
export declare const DEVICE_TYPE_WEBGPU = "webgpu";
export interface RenderProgramConstructParams {
    vs: string;
    fs: string;
    bindGroupLayouts: BindGroupLayout[];
    vertexAttributes: number[];
}
export interface ComputeProgramConstructParams {
    source: string;
    bindGroupLayouts: BindGroupLayout[];
}
export interface GPUProgramConstructParams {
    type: 'render' | 'compute';
    label?: string;
    params: RenderProgramConstructParams | ComputeProgramConstructParams;
}
export declare class DeviceResizeEvent extends REvent {
    static readonly NAME = "resize";
    width: number;
    height: number;
    constructor(width: number, height: number);
}
export declare class DeviceFrameBegin extends REvent {
    static readonly NAME = "framebegin";
    device: Device;
    constructor(device: Device);
}
export declare class DeviceFrameEnd extends REvent {
    static readonly NAME = "frameend";
    device: Device;
    constructor(device: Device);
}
export interface FrameInfo {
    frameCounter: number;
    frameTimestamp: number;
    elapsedTimeCPU: number;
    elapsedTimeGPU: number;
    elapsedFrame: number;
    elapsedOverall: number;
    FPS: number;
    drawCalls: number;
    computeCalls: number;
    nextFrameCall: (() => void)[];
}
export declare class DeviceGPUObjectAddedEvent extends REvent {
    static readonly NAME = "gpuobject_added";
    object: GPUObject;
    constructor(obj: GPUObject);
}
export declare class DeviceGPUObjectRemovedEvent extends REvent {
    static readonly NAME = "gpuobject_removed";
    object: GPUObject;
    constructor(obj: GPUObject);
}
export declare class DeviceGPUObjectRenameEvent extends REvent {
    static readonly NAME = "gpuobject_rename";
    object: GPUObject;
    lastName: string;
    constructor(obj: GPUObject, lastName: string);
}
export declare class DeviceLostEvent extends REvent {
    static readonly NAME = "device_lost";
    constructor();
}
export declare class DeviceRestoreEvent extends REvent {
    static readonly NAME = "device_restored";
    constructor();
}
export interface DeviceOptions {
    msaa?: boolean;
    dpr?: number;
}
export declare abstract class Device extends REventTarget {
    protected _gpuMemCost: number;
    protected _disposeObjectList: GPUObject[];
    protected _beginFrameTime: number;
    protected _endFrameTime: number;
    protected _frameInfo: FrameInfo;
    protected _cpuTimer: CPUTimer;
    protected _gpuTimer: ITimer;
    protected _runningLoop: number;
    protected _frameBeginEvent: DeviceFrameBegin;
    protected _frameEndEvent: DeviceFrameEnd;
    protected _fpsCounter: {
        time: number;
        frame: number;
    };
    protected _runLoopFunc: (device: Device) => void;
    constructor();
    abstract getDeviceType(): DeviceType;
    abstract getCanvas(): HTMLCanvasElement;
    abstract isContextLost(): boolean;
    abstract getScale(): number;
    abstract getDrawingBufferWidth(): number;
    abstract getDrawingBufferHeight(): number;
    abstract getBackBufferWidth(): number;
    abstract getBackBufferHeight(): number;
    abstract getTextureCaps(): TextureCaps;
    abstract getFramebufferCaps(): FramebufferCaps;
    abstract getMiscCaps(): MiscCaps;
    abstract getShaderCaps(): ShaderCaps;
    abstract initContext(): Promise<void>;
    abstract clearFrameBuffer(clearColor: Vector4, clearDepth: number, clearStencil: number): any;
    abstract createGPUTimer(): ITimer;
    abstract createRenderStateSet(): RenderStateSet;
    abstract createSampler(options: SamplerOptions): TextureSampler;
    abstract createTexture2D(format: TextureFormat, width: number, height: number, options?: TextureCreationOptions): Texture2D;
    abstract createTexture2DFromMipmapData(data: TextureMipmapData, options?: TextureCreationOptions): Texture2D;
    abstract createTexture2DFromImage(element: TextureImageElement, options?: TextureCreationOptions): Texture2D;
    abstract createTexture2DArray(format: TextureFormat, width: number, height: number, depth: number, options?: TextureCreationOptions): Texture2DArray;
    abstract createTexture3D(format: TextureFormat, width: number, height: number, depth: number, options?: TextureCreationOptions): Texture3D;
    abstract createCubeTexture(format: TextureFormat, size: number, options?: TextureCreationOptions): TextureCube;
    abstract createCubeTextureFromMipmapData(data: TextureMipmapData, options?: TextureCreationOptions): TextureCube;
    abstract createTextureVideo(el: HTMLVideoElement): TextureVideo;
    abstract reverseVertexWindingOrder(reverse: boolean): void;
    abstract isWindingOrderReversed(): boolean;
    abstract setRenderStatesOverridden(renderStates: RenderStateSet): any;
    abstract createGPUProgram(params: GPUProgramConstructParams): GPUProgram;
    abstract createBindGroup(layout: BindGroupLayout): BindGroup;
    abstract createBuffer(sizeInBytes: number, options: BufferCreationOptions): GPUDataBuffer;
    abstract createIndexBuffer(data: Uint16Array | Uint32Array, options?: BufferCreationOptions): IndexBuffer;
    abstract createStructuredBuffer(structureType: PBStructTypeInfo, options: BufferCreationOptions, data?: TypedArray): StructuredBuffer;
    abstract createVAO(vertexData: VertexData): VertexInputLayout;
    abstract createFrameBuffer(options?: IFrameBufferOptions): FrameBuffer;
    abstract setViewport(vp?: number[]): number[];
    abstract setViewport(x: number, y: number, w: number, h: number): void;
    abstract getViewport(): number[];
    abstract setScissor(scissor?: number[]): number[];
    abstract setScissor(x: number, y: number, w: number, h: number): void;
    abstract getScissor(): number[];
    abstract setProgram(program: GPUProgram): void;
    abstract getProgram(): GPUProgram;
    abstract setVertexData(vertexData: VertexInputLayout): void;
    abstract getVertexData(): VertexInputLayout;
    abstract setRenderStates(renderStates: RenderStateSet): void;
    abstract getRenderStates(): RenderStateSet;
    abstract setFramebuffer(rt: FrameBuffer): void;
    abstract getFramebuffer(): FrameBuffer;
    abstract setBindGroup(index: number, bindGroup: BindGroup, dynamicOffsets?: Iterable<number>): any;
    abstract flush(): void;
    abstract readPixels(x: number, y: number, w: number, h: number, buffer: TypedArray): Promise<void>;
    abstract readPixelsToBuffer(x: number, y: number, w: number, h: number, buffer: GPUDataBuffer): void;
    abstract looseContext(): void;
    abstract restoreContext(): void;
    protected abstract _draw(primitiveType: PrimitiveType, first: number, count: number): void;
    protected abstract _drawInstanced(primitiveType: PrimitiveType, first: number, count: number, numInstances: number): void;
    protected abstract _compute(workgroupCountX: any, workgroupCountY: any, workgroupCountZ: any): void;
    get videoMemoryUsage(): number;
    get frameInfo(): FrameInfo;
    get isRendering(): boolean;
    getEngineCaps(): EngineCaps;
    disposeObject(obj: GPUObject, remove?: boolean): void;
    restoreObject(obj: GPUObject): Promise<void>;
    enableGPUTimeRecording(enable: boolean): void;
    beginFrame(): boolean;
    endFrame(): void;
    draw(primitiveType: PrimitiveType, first: number, count: number): void;
    drawInstanced(primitiveType: PrimitiveType, first: number, count: number, numInstances: number): void;
    compute(workgroupCountX: any, workgroupCountY: any, workgroupCountZ: any): void;
    runNextFrame(f: () => void): void;
    cancelNextFrameCall(f: () => void): void;
    exitLoop(): void;
    runLoop(func: (device: Device) => void): void;
    getGPUObjects(): GPUObjectList;
    getGPUObjectById(uid: number): GPUObject;
    screenToDevice(val: number): number;
    deviceToScreen(val: number): number;
    createAssetManager(): AssetManager;
    createProgramBuilder(): ProgramBuilder;
}
export {};
