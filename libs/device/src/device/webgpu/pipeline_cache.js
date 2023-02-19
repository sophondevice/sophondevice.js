import { compareFuncMap, stencilOpMap, primitiveTypeMap, faceModeMap, blendEquationMap, blendFuncMap } from './constants_webgpu';
import * as rs from './renderstates_webgpu';
import { typeU16 } from '../builder';
const stencilFormats = ['stencil8', 'depth24plus-stencil8', 'depth24unorm-stencil8', 'depth32float-stencil8'];
const depthFormats = ['depth16unorm', 'depth24plus', 'depth24plus-stencil8', 'depth32float', 'depth24unorm-stencil8', 'depth32float-stencil8'];
export class PipelineCache {
    _device;
    _renderPipelines;
    _computePipelines;
    constructor(device) {
        this._device = device;
        this._renderPipelines = {};
        this._computePipelines = {};
    }
    wipeCache() {
        this._renderPipelines = {};
        this._computePipelines = {};
    }
    fetchComputePipeline(program) {
        const hash = this.getComputePipelineHash(program);
        let pipeline = this._computePipelines[hash];
        if (pipeline === undefined) {
            const shaderModule = program.getShaderModule();
            const desc = {
                layout: shaderModule.pipelineLayout,
                compute: {
                    module: shaderModule.csModule,
                    entryPoint: 'main',
                },
            };
            pipeline = this._device.gpuCreateComputePipeline(desc);
            this._computePipelines[hash] = pipeline;
        }
        return pipeline;
    }
    fetchRenderPipeline(program, vertexData, stateSet, primitiveType, frameBufferInfo) {
        if (!frameBufferInfo.hash) {
            return null;
        }
        if (!program.vertexAttributes) {
            vertexData = null;
        }
        const hash = this.getRenderPipelineHash(frameBufferInfo.hash, program, vertexData, stateSet, primitiveType);
        let pipeline = this._renderPipelines[hash];
        if (pipeline === undefined) {
            const bufferLayouts = vertexData ? this._device.fetchVertexLayout(vertexData.getLayouts(program.vertexAttributes).layoutHash) : null;
            const shaderModule = program.getShaderModule();
            const vertex = {
                module: shaderModule.vsModule,
                entryPoint: 'main'
            };
            if (bufferLayouts) {
                vertex.buffers = bufferLayouts;
            }
            const primitiveState = this.createPrimitiveState(vertexData, stateSet, primitiveType);
            const depthStencilState = this.createDepthStencilState(frameBufferInfo.depthFormat, stateSet);
            const colorTargetStates = frameBufferInfo.colorFormats.map(val => this.createColorTargetState(stateSet, val));
            const desc = {
                label: hash,
                layout: shaderModule.pipelineLayout,
                vertex,
                primitive: primitiveState,
                depthStencil: depthStencilState,
                multisample: {
                    count: frameBufferInfo.sampleCount,
                },
                fragment: {
                    module: shaderModule.fsModule,
                    entryPoint: 'main',
                    targets: colorTargetStates
                }
            };
            pipeline = this._device.gpuCreateRenderPipeline(desc);
            this._renderPipelines[hash] = pipeline;
        }
        return pipeline;
    }
    createPrimitiveState(vertexData, stateSet, primitiveType) {
        const topology = primitiveTypeMap[primitiveType];
        if (!topology) {
            throw new Error(`createPrimitiveState() failed: invalid primitive type: ${primitiveType}`);
        }
        const stateOverridden = this._device.getRenderStatesOverridden();
        const rasterizerState = stateOverridden?.rasterizerState || stateSet?.rasterizerState || rs.WebGPURasterizerState.defaultState;
        const cullMode = faceModeMap[rasterizerState.cullMode];
        if (!cullMode) {
            throw new Error(`createPrimitiveState() failed: invalid cull mode: ${rasterizerState.cullMode}`);
        }
        const frontFace = this._device.isWindingOrderReversed() ? 'cw' : 'ccw';
        const state = {
            topology,
            frontFace,
            cullMode
        };
        if (topology === 'triangle-strip' || topology === 'line-strip') {
            state.stripIndexFormat = vertexData?.getIndexBuffer()?.indexType === typeU16 ? 'uint16' : 'uint32';
        }
        return state;
    }
    createDepthStencilState(depthFormat, stateSet) {
        if (!depthFormat) {
            return undefined;
        }
        const stateOverridden = this._device.getRenderStatesOverridden();
        const depthState = stateOverridden?.depthState || stateSet?.depthState || rs.WebGPUDepthState.defaultState;
        const stencilState = stateOverridden?.stencilState || stateSet?.stencilState || rs.WebGPUStencilState.defaultState;
        const hasStencil = stencilFormats.indexOf(depthFormat) >= 0;
        const hasDepth = depthFormats.indexOf(depthFormat) >= 0;
        const depthWriteEnabled = hasDepth ? depthState.writeEnabled : false;
        const depthCompare = (hasDepth && depthState.testEnabled) ? compareFuncMap[depthState.compareFunc] : 'always';
        const state = {
            format: depthFormat,
            depthWriteEnabled,
            depthCompare,
        };
        if (hasStencil) {
            const stencilFront = stencilState.enabled ? this.createStencilFaceState(stencilState.func, stencilState.failOp, stencilState.zFailOp, stencilState.passOp) : undefined;
            const stencilBack = stencilState.enabled ? this.createStencilFaceState(stencilState.funcBack, stencilState.failOpBack, stencilState.zFailOpBack, stencilState.passOpBack) : undefined;
            const stencilReadMask = stencilState.enabled ? stencilState.valueMask : undefined;
            const stencilWriteMask = stencilState.enabled ? stencilState.writeMask : undefined;
            state.stencilFront = stencilFront;
            state.stencilBack = stencilBack;
            state.stencilReadMask = stencilReadMask;
            state.stencilWriteMask = stencilWriteMask;
        }
        return state;
    }
    createStencilFaceState(func, failOp, zFailOp, passOp) {
        return {
            compare: compareFuncMap[func],
            failOp: stencilOpMap[failOp],
            depthFailOp: stencilOpMap[zFailOp],
            passOp: stencilOpMap[passOp],
        };
    }
    createColorTargetState(stateSet, format) {
        const stateOverridden = this._device.getRenderStatesOverridden();
        const blendingState = stateOverridden?.blendingState || stateSet?.blendingState || rs.WebGPUBlendingState.defaultState;
        const colorState = stateOverridden?.colorState || stateSet?.colorState || rs.WebGPUColorState.defaultState;
        const r = colorState.redMask ? GPUColorWrite.RED : 0;
        const g = colorState.greenMask ? GPUColorWrite.GREEN : 0;
        const b = colorState.blueMask ? GPUColorWrite.BLUE : 0;
        const a = colorState.alphaMask ? GPUColorWrite.ALPHA : 0;
        const state = {
            format: format,
            writeMask: r | g | b | a
        };
        if (blendingState.enabled) {
            state.blend = this.createBlendState(blendingState);
        }
        return state;
    }
    createBlendState(blendingState) {
        return {
            color: this.createBlendComponent(blendingState.rgbEquation, blendingState.srcBlendRGB, blendingState.dstBlendRGB),
            alpha: this.createBlendComponent(blendingState.alphaEquation, blendingState.srcBlendAlpha, blendingState.dstBlendAlpha)
        };
    }
    createBlendComponent(op, srcFunc, dstFunc) {
        const operation = blendEquationMap[op];
        if (!operation) {
            throw new Error(`createBlendComponent() failed: invalid blend op: ${op}`);
        }
        const srcFactor = blendFuncMap[srcFunc];
        if (!srcFactor) {
            throw new Error(`createBlendComponent() failed: invalid source blend func ${srcFunc}`);
        }
        const dstFactor = blendFuncMap[dstFunc];
        if (!dstFactor) {
            throw new Error(`createBlendComponent() failed: invalid dest blend func ${dstFunc}`);
        }
        return {
            operation,
            srcFactor,
            dstFactor
        };
    }
    getRenderPipelineHash(fbHash, program, vertexData, stateSet, primitiveType) {
        const programHash = program.hash;
        const vertexHash = vertexData?.getLayouts(program.vertexAttributes).layoutHash || '';
        const stateHash = stateSet?.hash || '';
        const stateOverriddenHash = this._device.getRenderStatesOverridden()?.hash || '';
        return `${programHash}:${vertexHash}:${fbHash}:${primitiveType}:${stateHash}:${stateOverriddenHash}:${Number(this._device.isWindingOrderReversed())}`;
    }
    getComputePipelineHash(program) {
        return program.hash;
    }
}
//# sourceMappingURL=pipeline_cache.js.map