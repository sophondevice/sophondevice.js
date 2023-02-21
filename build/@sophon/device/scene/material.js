/** sophon base library */
import { List } from '@sophon/base';
import { ShaderLib } from './materiallib/shaderlib.js';
import { TextureFilter } from '../device/base_types.js';

class InstanceBindGroupPool {
    _bindGroups;
    _frameStamp;
    constructor() {
        this._bindGroups = [];
        this._frameStamp = -1;
    }
    apply(device, hash, index, worldMatrices) {
        const maxSize = device.getShaderCaps().maxUniformBufferSize;
        if (device.frameInfo.frameCounter !== this._frameStamp) {
            this._frameStamp = device.frameInfo.frameCounter;
            for (const bindGroup of this._bindGroups) {
                bindGroup.freeSize = maxSize;
            }
        }
        let bindGroupIndex = -1;
        for (let i = 0; i < this._bindGroups.length; i++) {
            if (this._bindGroups[i].freeSize >= worldMatrices.length * 64) {
                bindGroupIndex = i;
                break;
            }
        }
        if (bindGroupIndex < 0) {
            const program = Material.getProgramByHashIndex(hash, index);
            const bindGroup = program?.bindGroupLayouts[3] ? device.createBindGroup(program.bindGroupLayouts[3]) : null;
            this._bindGroups.push({ bindGroup: bindGroup, freeSize: maxSize });
            bindGroupIndex = this._bindGroups.length - 1;
        }
        const bindGroup = this._bindGroups[bindGroupIndex];
        const offset = (maxSize - bindGroup.freeSize) / 64;
        for (const matrix of worldMatrices) {
            bindGroup.bindGroup.setRawData('worldMatrix', maxSize - bindGroup.freeSize, matrix.getArray());
            bindGroup.freeSize -= 64;
        }
        device.setBindGroup(3, bindGroup.bindGroup);
        return offset;
    }
}
class Material {
    static _nextId = 0;
    static _programMap = {};
    static _defaultBindGroupLayouts = {};
    static _drawableLRU = new List();
    static _materialLRU = new List();
    static _gcOptions = {
        disabled: false,
        drawableCountThreshold: 500,
        materialCountThreshold: 200,
        inactiveTimeDuration: 30000,
    };
    static _boneMatrixTextureSampler = null;
    static _instanceBindGroupPool = new InstanceBindGroupPool();
    static _drawableBindGroupMap = new WeakMap();
    _device;
    _hash;
    _renderStateSet;
    _bindGroupMap;
    _optionTag;
    _supportSharedUniforms;
    _materialBindGroup;
    _lruIterator;
    _lastRenderTimeStamp;
    _id;
    constructor(device) {
        this._id = ++Material._nextId;
        this._device = device;
        this._hash = null;
        this._renderStateSet = device.createRenderStateSet();
        this._bindGroupMap = {};
        this._optionTag = 0;
        this._supportSharedUniforms = device.getMiscCaps().supportSharedUniforms;
        this._materialBindGroup = null;
        this._lruIterator = null;
        this._lastRenderTimeStamp = 0;
    }
    get id() {
        return this._id;
    }
    getLRUIterator() {
        return this._lruIterator;
    }
    setLRUIterator(iter) {
        this._lruIterator = iter;
    }
    setLastRenderTimeStamp(val) {
        this._lastRenderTimeStamp = val;
    }
    getLastRenderTimeStamp() {
        return this._lastRenderTimeStamp;
    }
    getHash() {
        if (this._hash === null) {
            this._hash = this.createHash();
        }
        return this._hash;
    }
    get stateSet() {
        return this._renderStateSet;
    }
    set stateSet(stateset) {
        this._renderStateSet = stateset;
    }
    get device() {
        return this._device;
    }
    isTransparent() {
        return false;
    }
    supportLighting() {
        return true;
    }
    draw(primitive, ctx) {
        if (this.beginDraw(ctx)) {
            if (ctx.instanceData?.worldMatrices.length > 1) {
                primitive.drawInstanced(ctx.instanceData.worldMatrices.length);
            }
            else {
                primitive.draw();
            }
            this.endDraw();
        }
    }
    beginDraw(ctx) {
        const numInstances = ctx.instanceData?.worldMatrices?.length || 1;
        const programInfo = this.getOrCreateProgram(ctx);
        if (programInfo) {
            const hash = programInfo.hash;
            if (!programInfo.programs[ctx.materialFunc]) {
                return null;
            }
            this._materialBindGroup = this.applyMaterialBindGroups(ctx, hash);
            if (numInstances > 1) {
                this.applyInstanceBindGroups(ctx, hash);
            }
            else {
                this.applyDrawableBindGroups(ctx, hash);
            }
            this._device.setRenderStates(this._renderStateSet);
            this._device.setProgram(programInfo.programs[ctx.materialFunc]);
            ctx.target.setLastRenderTimestamp(ctx.renderPass.renderTimeStamp);
            Material.lruPutDrawable(ctx.target);
            this.setLastRenderTimeStamp(ctx.renderPass.renderTimeStamp);
            Material.lruPutMaterial(this);
            return true;
        }
        return false;
    }
    endDraw() {
        this._materialBindGroup = null;
    }
    getMaterialBindGroup() {
        return this._materialBindGroup;
    }
    applyUniforms(bindGroup, ctx, needUpdate) {
        if (needUpdate) {
            this._applyUniforms(bindGroup, ctx);
        }
    }
    getOrCreateProgram(ctx) {
        const func = ctx.materialFunc;
        const programMap = Material._programMap;
        const hash = `${this.getHash()}:${!!ctx.target.getBoneMatrices()}:${Number(!!(ctx.instanceData?.worldMatrices.length > 1))}:${ctx.renderPassHash}`;
        let programInfo = programMap[hash];
        if (!programInfo || !programInfo.programs[func] || programInfo.programs[func].disposed) {
            console.time(hash);
            const program = this.createProgram(ctx, func);
            console.timeEnd(hash);
            if (!programInfo) {
                programInfo = {
                    programs: [null, null, null],
                    hash
                };
                programMap[hash] = programInfo;
            }
            programInfo.programs[func] = program;
        }
        return programInfo || null;
    }
    dispose() {
        this.clearBindGroupCache();
    }
    static initShader(pb, ctx) {
        ctx.renderPass.setGlobalBindings(pb.globalScope, ctx);
        if (!ctx.instanceData || ctx.instanceData.worldMatrices.length === 1) {
            pb.globalScope.worldMatrix = pb.mat4().uniform(1).tag(ShaderLib.USAGE_WORLD_MATRIX);
        }
        else {
            pb.globalScope.instanceBufferOffset = pb.uint().uniform(1);
            pb.globalScope.worldMatrix = pb.defineStruct(null, 'std140', pb.mat4[ctx.renderPass.device.getShaderCaps().maxUniformBufferSize / 64]('matrices'))().uniform(3);
            pb.reflection.tag(ShaderLib.USAGE_WORLD_MATRIX, () => pb.globalScope.worldMatrix.matrices.at(pb.add(pb.globalScope.instanceBufferOffset, pb.uint(pb.globalScope.$builtins.instanceIndex))));
        }
        if (ctx.target.getBoneMatrices()) {
            pb.globalScope.boneMatrices = pb.tex2D().uniform(1).sampleType('unfilterable-float').tag(ShaderLib.USAGE_BONE_MATRICIES);
            pb.globalScope.invBindMatrix = pb.mat4().uniform(1).tag(ShaderLib.USAGE_INV_BIND_MATRIX);
            pb.globalScope.boneTextureSize = pb.int().uniform(1).tag(ShaderLib.USAGE_BONE_TEXTURE_SIZE);
        }
    }
    static setGCOptions(opt) {
        this._gcOptions = Object.assign({}, this._gcOptions, opt || {});
    }
    static getGCOptions() {
        return this._gcOptions;
    }
    static garbageCollect(ts) {
        let n = 0;
        ts -= this._gcOptions.inactiveTimeDuration;
        while (this._drawableLRU.length > this._gcOptions.drawableCountThreshold) {
            const iter = this._drawableLRU.begin();
            if (iter.data.getLastRenderTimeStamp() < ts) {
                const bindGroups = this._drawableBindGroupMap.get(iter.data);
                if (bindGroups) {
                    for (const k in bindGroups) {
                        for (const bindGroup of bindGroups[k].bindGroup) {
                            if (bindGroup) {
                                this.bindGroupGarbageCollect(bindGroup);
                                n++;
                            }
                        }
                    }
                }
                this._drawableBindGroupMap.delete(iter.data);
                iter.data.setLRUIterator(null);
                this._drawableLRU.remove(iter);
            }
            else {
                break;
            }
        }
        while (this._materialLRU.length > this._gcOptions.materialCountThreshold) {
            const iter = this._materialLRU.begin();
            const mat = iter.data;
            if (mat.getLastRenderTimeStamp() < ts && mat._bindGroupMap) {
                n += mat.clearBindGroupCache();
                mat.setLRUIterator(null);
                this._materialLRU.remove(iter);
            }
            else {
                break;
            }
        }
        if (n > 0 && this._gcOptions.verbose) {
            console.log(`INFO: ${n} bind groups have been garbage collected`);
        }
        return n;
    }
    optionChanged(changeHash) {
        this._optionTag++;
        if (changeHash) {
            this._hash = null;
        }
    }
    static getProgramByHashIndex(hash, index) {
        return this._programMap[hash].programs[index];
    }
    applyMaterialBindGroups(ctx, hash) {
        const index = ctx.materialFunc;
        let bindGroupInfo = this._bindGroupMap[hash];
        if (!bindGroupInfo) {
            const materialBindGroup = [0, 1, 2].map(k => {
                const program = Material._programMap[hash].programs[k];
                return program?.bindGroupLayouts[2] ? this._device.createBindGroup(program.bindGroupLayouts[2]) : null;
            });
            bindGroupInfo = this._bindGroupMap[hash] = {
                materialBindGroup,
                bindGroupTag: [0, 0, 0],
                materialTag: [-1, -1, -1]
            };
        }
        const bindGroup = bindGroupInfo.materialBindGroup[index];
        if (bindGroup) {
            this.applyUniforms(bindGroup, ctx, bindGroupInfo.materialTag[index] < this._optionTag || bindGroupInfo.bindGroupTag[index] !== bindGroup.cid);
            bindGroupInfo.materialTag[index] = this._optionTag;
            bindGroupInfo.bindGroupTag[index] = bindGroup.cid;
            this._device.setBindGroup(2, bindGroup);
        }
        else {
            this._device.setBindGroup(2, null);
        }
        return bindGroup;
    }
    getDrawableBindGroup(ctx, hash) {
        let drawableBindGroups = Material._drawableBindGroupMap.get(ctx.target);
        if (!drawableBindGroups) {
            drawableBindGroups = {};
            Material._drawableBindGroupMap.set(ctx.target, drawableBindGroups);
        }
        let drawableBindGroup = drawableBindGroups[hash];
        if (!drawableBindGroup) {
            const bindGroup = [0, 1, 2].map(k => {
                const program = Material._programMap[hash].programs[k];
                return program?.bindGroupLayouts[1] ? this._device.createBindGroup(program.bindGroupLayouts[1]) : null;
            });
            drawableBindGroup = drawableBindGroups[hash] = {
                bindGroup,
                bindGroupTag: [0, 0, 0],
                xformTag: [-1, -1, -1],
            };
        }
        return drawableBindGroup;
    }
    applyInstanceBindGroups(ctx, hash) {
        const index = ctx.materialFunc;
        const offset = Material._instanceBindGroupPool.apply(this.device, hash, index, ctx.instanceData.worldMatrices);
        const bindGroup = this.getDrawableBindGroup(ctx, hash).bindGroup?.[index];
        if (bindGroup) {
            bindGroup.setValue('instanceBufferOffset', offset);
            this._device.setBindGroup(1, bindGroup);
        }
        else {
            this._device.setBindGroup(1, null);
        }
    }
    applyDrawableBindGroups(ctx, hash) {
        const index = ctx.materialFunc;
        const drawableBindGroup = this.getDrawableBindGroup(ctx, hash);
        if (drawableBindGroup.bindGroup) {
            const bindGroup = drawableBindGroup.bindGroup[index];
            if (drawableBindGroup.xformTag[index] < ctx.target.getXForm().getTag() || drawableBindGroup.bindGroupTag[index] !== bindGroup.cid) {
                bindGroup.setValue('worldMatrix', ctx.target.getXForm().worldMatrix);
                drawableBindGroup.xformTag[index] = ctx.target.getXForm().getTag();
                drawableBindGroup.bindGroupTag[index] = bindGroup.cid;
            }
            const boneMatrices = ctx.target.getBoneMatrices();
            if (boneMatrices) {
                if (!Material._boneMatrixTextureSampler) {
                    Material._boneMatrixTextureSampler = this.device.createSampler({
                        magFilter: TextureFilter.Nearest,
                        minFilter: TextureFilter.Nearest,
                        mipFilter: TextureFilter.None
                    });
                }
                bindGroup.setTexture('boneMatrices', boneMatrices, Material._boneMatrixTextureSampler);
                bindGroup.setValue('boneTextureSize', boneMatrices.width);
                bindGroup.setValue('invBindMatrix', ctx.target.getInvBindMatrix());
            }
            this._device.setBindGroup(1, bindGroup);
        }
        else {
            this._device.setBindGroup(1, null);
        }
    }
    createHash() {
        return `${this.constructor.name}|${this._createHash()}`;
    }
    clearBindGroupCache() {
        let n = 0;
        for (const k in this._bindGroupMap) {
            for (const bindGroup of this._bindGroupMap[k].materialBindGroup) {
                if (bindGroup) {
                    Material.bindGroupGarbageCollect(bindGroup);
                    n++;
                }
            }
        }
        this._bindGroupMap = {};
        return n;
    }
    static bindGroupGarbageCollect(bindGroup) {
        const layout = bindGroup.getLayout();
        for (const entry of layout.entries) {
            if (entry.buffer) {
                const buffer = bindGroup.getBuffer(entry.name);
                if (buffer) {
                    buffer.dispose();
                    bindGroup.setBuffer(entry.name, null);
                }
            }
        }
    }
    static lruPutDrawable(drawable) {
        const iter = drawable.getLRUIterator();
        if (iter) {
            this._drawableLRU.removeAndAppend(iter);
        }
        else {
            drawable.setLRUIterator(this._drawableLRU.append(drawable));
        }
    }
    static lruPutMaterial(material) {
        const iter = material.getLRUIterator();
        if (iter) {
            this._materialLRU.removeAndAppend(iter);
        }
        else {
            material.setLRUIterator(this._materialLRU.append(material));
        }
    }
    createProgram(ctx, func) {
        const pb = this._device.createProgramBuilder();
        return this._createProgram(pb, ctx, func);
    }
    _createProgram(pb, ctx, func) {
        return null;
    }
    _applyUniforms(bindGroup, ctx) {
    }
    _createHash() {
        return '';
    }
}

export { Material };
//# sourceMappingURL=material.js.map
