import { REventTarget, REvent } from '@sophon/base/event';
import { CPUTimer } from './timer';
import { AssetManager } from '../scene/asset/assetmanager';
import { GPUResourceUsageFlags } from './gpuobject';
import { ProgramBuilder } from './builder';
export const DEVICE_TYPE_WEBGL = 'webgl';
export const DEVICE_TYPE_WEBGL2 = 'webgl2';
export const DEVICE_TYPE_WEBGPU = 'webgpu';
export class DeviceResizeEvent extends REvent {
    static NAME = 'resize';
    width;
    height;
    constructor(width, height) {
        super(DeviceResizeEvent.NAME, false, false);
        this.width = width;
        this.height = height;
    }
}
export class DeviceFrameBegin extends REvent {
    static NAME = 'framebegin';
    device;
    constructor(device) {
        super(DeviceFrameBegin.NAME, false, false);
        this.device = device;
    }
}
export class DeviceFrameEnd extends REvent {
    static NAME = 'frameend';
    device;
    constructor(device) {
        super(DeviceFrameEnd.NAME, false, false);
        this.device = device;
    }
}
export class DeviceGPUObjectAddedEvent extends REvent {
    static NAME = 'gpuobject_added';
    object;
    constructor(obj) {
        super(DeviceGPUObjectAddedEvent.NAME, false, false);
        this.object = obj;
    }
}
export class DeviceGPUObjectRemovedEvent extends REvent {
    static NAME = 'gpuobject_removed';
    object;
    constructor(obj) {
        super(DeviceGPUObjectRemovedEvent.NAME, false, false);
        this.object = obj;
    }
}
export class DeviceGPUObjectRenameEvent extends REvent {
    static NAME = 'gpuobject_rename';
    object;
    lastName;
    constructor(obj, lastName) {
        super(DeviceGPUObjectRenameEvent.NAME, false, false);
        this.object = obj;
        this.lastName = lastName;
    }
}
export class DeviceLostEvent extends REvent {
    static NAME = 'device_lost';
    constructor() {
        super(DeviceLostEvent.NAME, false, false);
    }
}
export class DeviceRestoreEvent extends REvent {
    static NAME = 'device_restored';
    constructor() {
        super(DeviceRestoreEvent.NAME, false, false);
    }
}
export class Device extends REventTarget {
    _gpuObjectList;
    _gpuMemCost;
    _disposeObjectList;
    _beginFrameTime;
    _endFrameTime;
    _frameInfo;
    _cpuTimer;
    _gpuTimer;
    _runningLoop;
    _frameBeginEvent;
    _frameEndEvent;
    _fpsCounter;
    _runLoopFunc;
    constructor() {
        super();
        this._gpuObjectList = {
            textures: [],
            samplers: [],
            buffers: [],
            programs: [],
            framebuffers: [],
            vertexArrayObjects: [],
            bindGroups: []
        };
        this._gpuMemCost = 0;
        this._disposeObjectList = [];
        this._beginFrameTime = 0;
        this._endFrameTime = 0;
        this._runLoopFunc = null;
        this._frameInfo = {
            frameCounter: 0,
            frameTimestamp: 0,
            elapsedTimeCPU: 0,
            elapsedTimeGPU: 0,
            elapsedFrame: 0,
            elapsedOverall: 0,
            FPS: 0,
            drawCalls: 0,
            computeCalls: 0,
            nextFrameCall: []
        };
        this._cpuTimer = new CPUTimer();
        this._gpuTimer = null;
        this._runningLoop = null;
        this._fpsCounter = { time: 0, frame: 0 };
        this._frameBeginEvent = new DeviceFrameBegin(this);
        this._frameEndEvent = new DeviceFrameEnd(this);
    }
    get videoMemoryUsage() {
        return this._gpuMemCost;
    }
    get frameInfo() {
        return this._frameInfo;
    }
    get isRendering() {
        return this._runningLoop !== null;
    }
    getEngineCaps() {
        return {
            maxBindGroups: 4,
            maxTexCoordIndex: 8,
            maxVertexAttributes: 16
        };
    }
    disposeObject(obj, remove = true) {
        if (obj) {
            if (remove) {
                this.removeGPUObject(obj);
            }
            if (!obj.disposed) {
                if (this.isContextLost()) {
                    obj.destroy();
                }
                else {
                    this._disposeObjectList.push(obj);
                }
            }
        }
    }
    async restoreObject(obj) {
        if (obj && obj.disposed && !this.isContextLost()) {
            await obj.restore();
            if (obj.restoreHandler) {
                await obj.restoreHandler(obj);
            }
        }
    }
    enableGPUTimeRecording(enable) {
        if (enable && !this._gpuTimer) {
            this._gpuTimer = this.createGPUTimer();
        }
        else if (!enable) {
            this._gpuTimer?.end();
            this._gpuTimer = null;
        }
    }
    beginFrame() {
        for (const obj of this._disposeObjectList) {
            obj.destroy();
        }
        this._disposeObjectList = [];
        this._beginFrameTime = this._cpuTimer.now();
        this.updateFrameInfo();
        this._frameBeginEvent.reset();
        this.dispatchEvent(this._frameBeginEvent);
        return this.onBeginFrame();
    }
    endFrame() {
        this._endFrameTime = this._cpuTimer.now();
        this._frameEndEvent.reset();
        this.dispatchEvent(this._frameEndEvent);
        this.onEndFrame();
    }
    draw(primitiveType, first, count) {
        this._frameInfo.drawCalls++;
        this._draw(primitiveType, first, count);
    }
    drawInstanced(primitiveType, first, count, numInstances) {
        this._frameInfo.drawCalls++;
        this._drawInstanced(primitiveType, first, count, numInstances);
    }
    compute(workgroupCountX, workgroupCountY, workgroupCountZ) {
        this._frameInfo.computeCalls++;
        this._compute(workgroupCountX, workgroupCountY, workgroupCountZ);
    }
    runNextFrame(f) {
        if (f) {
            this._frameInfo.nextFrameCall.push(f);
        }
    }
    cancelNextFrameCall(f) {
        const index = this._frameInfo.nextFrameCall.indexOf(f);
        if (index >= 0) {
            this._frameInfo.nextFrameCall.splice(index, 1);
        }
    }
    exitLoop() {
        if (this._runningLoop) {
            cancelAnimationFrame(this._runningLoop);
            this._runningLoop = null;
        }
    }
    runLoop(func) {
        if (this._runningLoop !== null) {
            console.error('Device.runLoop() can not be nested');
            return;
        }
        if (!func) {
            console.error('Device.runLoop() argment error');
            return;
        }
        const that = this;
        that._runLoopFunc = func;
        (function entry() {
            that._runningLoop = requestAnimationFrame(entry);
            if (that.beginFrame()) {
                that._runLoopFunc(that);
                that.endFrame();
            }
        }());
    }
    getGPUObjects() {
        return this._gpuObjectList;
    }
    getGPUObjectById(uid) {
        for (const list of [
            this._gpuObjectList.textures,
            this._gpuObjectList.samplers,
            this._gpuObjectList.buffers,
            this._gpuObjectList.framebuffers,
            this._gpuObjectList.programs,
            this._gpuObjectList.vertexArrayObjects
        ]) {
            for (const obj of list) {
                if (obj.uid === uid) {
                    return obj;
                }
            }
        }
        return null;
    }
    screenToDevice(val) {
        return this.getFramebuffer() ? val : Math.round(val * this.getScale());
    }
    deviceToScreen(val) {
        return this.getFramebuffer() ? val : Math.round(val / this.getScale());
    }
    createAssetManager() {
        return new AssetManager(this);
    }
    createProgramBuilder() {
        return new ProgramBuilder(this);
    }
    addGPUObject(obj) {
        const list = this.getGPUObjectList(obj);
        if (list && list.indexOf(obj) < 0) {
            list.push(obj);
            this.dispatchEvent(new DeviceGPUObjectAddedEvent(obj));
        }
    }
    removeGPUObject(obj) {
        const list = this.getGPUObjectList(obj);
        if (list) {
            const index = list.indexOf(obj);
            if (index >= 0) {
                list.splice(index, 1);
                this.dispatchEvent(new DeviceGPUObjectRemovedEvent(obj));
            }
        }
    }
    updateVideoMemoryCost(delta) {
        this._gpuMemCost += delta;
    }
    updateFrameInfo() {
        this._frameInfo.frameCounter++;
        this._frameInfo.drawCalls = 0;
        this._frameInfo.computeCalls = 0;
        const now = this._beginFrameTime;
        if (this._frameInfo.frameTimestamp === 0) {
            this._frameInfo.frameTimestamp = now;
            this._frameInfo.elapsedTimeCPU = 0;
            this._frameInfo.elapsedTimeGPU = 0;
            this._frameInfo.elapsedFrame = 0;
            this._frameInfo.elapsedOverall = 0;
            this._frameInfo.FPS = 0;
            this._fpsCounter.time = now;
            this._fpsCounter.frame = this._frameInfo.frameCounter;
            if (this._gpuTimer) {
                this._gpuTimer.begin();
            }
        }
        else {
            this._frameInfo.elapsedFrame = now - this._frameInfo.frameTimestamp;
            this._frameInfo.elapsedOverall += this._frameInfo.elapsedFrame;
            if (this._endFrameTime !== 0) {
                this._frameInfo.elapsedTimeGPU = now - this._endFrameTime;
                this._frameInfo.elapsedTimeCPU = this._endFrameTime - this._frameInfo.frameTimestamp;
            }
            this._frameInfo.frameTimestamp = now;
            if (now >= this._fpsCounter.time + 1000) {
                this._frameInfo.FPS = (this._frameInfo.frameCounter - this._fpsCounter.frame) * 1000 / (now - this._fpsCounter.time);
                this._fpsCounter.time = now;
                this._fpsCounter.frame = this._frameInfo.frameCounter;
            }
        }
        for (const f of this._frameInfo.nextFrameCall) {
            f();
        }
        this._frameInfo.nextFrameCall.length = 0;
    }
    getGPUObjectList(obj) {
        let list = null;
        if (obj.isTexture()) {
            list = this._gpuObjectList.textures;
        }
        else if (obj.isSampler()) {
            list = this._gpuObjectList.samplers;
        }
        else if (obj.isBuffer()) {
            list = this._gpuObjectList.buffers;
        }
        else if (obj.isFramebuffer()) {
            list = this._gpuObjectList.framebuffers;
        }
        else if (obj.isProgram()) {
            list = this._gpuObjectList.programs;
        }
        else if (obj.isVAO()) {
            list = this._gpuObjectList.vertexArrayObjects;
        }
        else if (obj.isBindGroup()) {
            list = this._gpuObjectList.bindGroups;
        }
        return list;
    }
    invalidateAll() {
        for (const list of [
            this._gpuObjectList.buffers,
            this._gpuObjectList.textures,
            this._gpuObjectList.samplers,
            this._gpuObjectList.programs,
            this._gpuObjectList.framebuffers,
            this._gpuObjectList.vertexArrayObjects,
            this._gpuObjectList.bindGroups
        ]) {
            for (const obj of list) {
                this.disposeObject(obj, false);
            }
        }
        if (this.isContextLost()) {
            for (const obj of this._disposeObjectList) {
                obj.destroy();
            }
            this._disposeObjectList = [];
        }
    }
    async reloadAll() {
        const promises = [];
        for (const list of [
            this._gpuObjectList.buffers,
            this._gpuObjectList.textures,
            this._gpuObjectList.samplers,
            this._gpuObjectList.programs,
            this._gpuObjectList.framebuffers,
            this._gpuObjectList.vertexArrayObjects,
            this._gpuObjectList.bindGroups
        ]) {
            for (const obj of list.slice()) {
                promises.push(obj.reload());
            }
        }
        return Promise.all(promises);
    }
    parseTextureOptions(options) {
        const colorSpace = options?.colorSpace ?? 'srgb';
        console.assert(colorSpace === 'srgb' || colorSpace === 'linear', `invalid texture color space: ${colorSpace}`);
        const colorSpaceFlag = colorSpace === 'srgb' ? 0 : GPUResourceUsageFlags.TF_LINEAR_COLOR_SPACE;
        const noMipmapFlag = !!options?.noMipmap ? GPUResourceUsageFlags.TF_NO_MIPMAP : 0;
        const writableFlag = !!options?.writable ? GPUResourceUsageFlags.TF_WRITABLE : 0;
        const dynamicFlag = !!options?.dynamic ? GPUResourceUsageFlags.DYNAMIC : 0;
        const managedFlag = !!options?.managed ? GPUResourceUsageFlags.MANAGED : 0;
        return colorSpaceFlag | noMipmapFlag | writableFlag | dynamicFlag | managedFlag;
    }
    parseBufferOptions(options, defaultUsage) {
        const usage = options?.usage || defaultUsage;
        let usageFlag;
        switch (usage) {
            case 'uniform':
                usageFlag = GPUResourceUsageFlags.BF_UNIFORM;
                break;
            case 'vertex':
                usageFlag = GPUResourceUsageFlags.BF_VERTEX;
                break;
            case 'index':
                usageFlag = GPUResourceUsageFlags.BF_INDEX;
                break;
            case 'read':
                usageFlag = GPUResourceUsageFlags.BF_READ;
                break;
            case 'write':
                usageFlag = GPUResourceUsageFlags.BF_WRITE;
                break;
            default:
                usageFlag = 0;
                break;
        }
        const storageFlag = !!options?.storage ? GPUResourceUsageFlags.BF_STORAGE : 0;
        const dynamicFlag = !!options?.dynamic ? GPUResourceUsageFlags.DYNAMIC : 0;
        const managedFlag = !!options?.managed ? GPUResourceUsageFlags.MANAGED : 0;
        return usageFlag | storageFlag | dynamicFlag | managedFlag;
    }
}
//# sourceMappingURL=device.js.map