/** sophon base library */
import { WebGPUObject } from './gpuobject_webgpu.js';
import { ShaderType } from '../base_types.js';

class WebGPUProgram extends WebGPUObject {
    static _hashCounter = 0;
    _type;
    _vs;
    _fs;
    _cs;
    _label;
    _hash;
    _error;
    _bindGroupLayouts;
    _vertexAttributes;
    _csModule;
    _vsModule;
    _fsModule;
    _pipelineLayout;
    constructor(device, params) {
        super(device);
        this._type = params.type;
        this._label = params.label;
        this._bindGroupLayouts = [...params.params.bindGroupLayouts];
        this._error = '';
        if (params.type === 'render') {
            const renderParams = params.params;
            this._vs = renderParams.vs;
            this._fs = renderParams.fs;
            this._vertexAttributes = renderParams.vertexAttributes ? renderParams.vertexAttributes.join(':') : '';
        }
        else {
            const computeParams = params.params;
            this._cs = computeParams.source;
        }
        this._load();
        this._hash = String(++WebGPUProgram._hashCounter);
    }
    get type() {
        return this._type;
    }
    get label() {
        return this._label;
    }
    getCompileError() {
        return this._error;
    }
    getShaderSource(shaderType) {
        switch (shaderType) {
            case ShaderType.Vertex: return this._vs;
            case ShaderType.Fragment: return this._fs;
            case ShaderType.Compute: return this._cs;
        }
    }
    getBindingInfo(name) {
        for (let group = 0; group < this._bindGroupLayouts.length; group++) {
            const layout = this._bindGroupLayouts[group];
            for (let binding = 0; binding < layout.entries.length; binding++) {
                const bindingPoint = layout.entries[binding];
                if (bindingPoint.name === name) {
                    return {
                        group: group,
                        binding: binding,
                        type: bindingPoint.type
                    };
                }
            }
        }
        return null;
    }
    get bindGroupLayouts() {
        return this._bindGroupLayouts;
    }
    get vertexAttributes() {
        return this._vertexAttributes;
    }
    get hash() {
        return this._hash;
    }
    getPipelineLayout() {
        return this._pipelineLayout;
    }
    getShaderModule() {
        return {
            vsModule: this._vsModule,
            fsModule: this._fsModule,
            csModule: this._csModule,
            pipelineLayout: this._pipelineLayout
        };
    }
    get fsModule() {
        return this._fsModule;
    }
    destroy() {
        this._vsModule = null;
        this._fsModule = null;
        this._pipelineLayout = null;
        this._object = null;
    }
    async restore() {
        if (!this._object) {
            this._load();
        }
    }
    isProgram() {
        return true;
    }
    _load() {
        if (this._type === 'render') {
            this._vsModule = this.createShaderModule(this._vs);
            this._fsModule = this.createShaderModule(this._fs);
        }
        else {
            this._csModule = this.createShaderModule(this._cs);
        }
        this._pipelineLayout = this.createPipelineLayout(this._bindGroupLayouts);
        this._object = {};
    }
    createPipelineLayout(bindGroupLayouts) {
        const layouts = [];
        bindGroupLayouts.forEach(val => {
            layouts.push(this._device.fetchBindGroupLayout(val));
        });
        return this._device.device.createPipelineLayout({
            bindGroupLayouts: layouts
        });
    }
    createShaderModule(code) {
        const t0 = Date.now();
        let sm = this._device.device.createShaderModule({ code });
        if (sm && sm.compilationInfo) {
            sm.compilationInfo().then(compilationInfo => {
                const elapsed = Date.now() - t0;
                if (elapsed > 1000) {
                    console.log(`compile shader took ${elapsed}ms: \n${code}`);
                }
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
                        this._error += msg;
                        console.log(msg);
                    }
                }
                if (err) {
                    sm = null;
                }
            });
        }
        return sm;
    }
    use() {
        this._device.setProgram(this);
    }
}

export { WebGPUProgram };
//# sourceMappingURL=gpuprogram_webgpu.js.map
