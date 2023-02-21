/** sophon base library */
import { WebGLGPUObject } from './gpuobject_webgl.js';
import { isWebGL2 } from './utils.js';
import { WebGLEnum } from './webgl_enum.js';
import { ShaderType } from '../base_types.js';
import { semanticList } from '../gpuobject.js';

class WebGLGPUProgram extends WebGLGPUObject {
    _vs;
    _fs;
    _unitCounter;
    _uniformSetters;
    _uniformInfo;
    _blockInfo;
    _bindGroupLayouts;
    _vertexAttributes;
    _error;
    _vertexShader;
    _fragmentShader;
    constructor(device, vertexShader, fragmentShader, bindGroupLayouts, vertexAttributes) {
        super(device);
        this._object = this._device.context.createProgram();
        this._unitCounter = 0;
        this._uniformSetters = null;
        this._uniformInfo = null;
        this._blockInfo = null;
        this._error = '';
        this._vertexShader = null;
        this._fragmentShader = null;
        this._vs = vertexShader;
        this._fs = fragmentShader;
        this._bindGroupLayouts = [...bindGroupLayouts];
        this._vertexAttributes = [...vertexAttributes];
        this.load();
    }
    get type() {
        return 'render';
    }
    getCompileError() {
        return this._error;
    }
    getShaderSource(shaderType) {
        switch (shaderType) {
            case ShaderType.Vertex: return this._vs;
            case ShaderType.Fragment: return this._fs;
            case ShaderType.Compute: return null;
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
    setUniform(name, value) {
        const setter = this._uniformSetters[name];
        if (setter) {
            setter(value);
        }
        else {
            const proto = Object.getPrototypeOf(value);
            if (proto === Object.getPrototypeOf({})) {
                this._setUniformStruct(name, value);
            }
            else if (proto == Object.getPrototypeOf([])) {
                this._setUniformArray(name, value);
            }
        }
    }
    setBlock(name, value, offset) {
        const info = this._blockInfo[name];
        if (info) {
            if (offset) {
                this._device.context.bindBufferRange(WebGLEnum.UNIFORM_BUFFER, info.index, value.object, offset, value.byteLength - offset);
            }
            else {
                this._device.context.bindBufferBase(WebGLEnum.UNIFORM_BUFFER, info.index, value.object);
            }
        }
    }
    destroy() {
        if (this._object) {
            this._device.context.deleteProgram(this._object);
            this._object = null;
            this._unitCounter = 0;
            this._uniformSetters = null;
            this._uniformInfo = null;
            this._blockInfo = null;
            this._error = '';
            this._vertexShader = null;
            this._fragmentShader = null;
        }
    }
    async restore() {
        if (!this._object && !this._device.isContextLost()) {
            this.load();
        }
    }
    isProgram() {
        return true;
    }
    use() {
        if (this !== this._device.context._currentProgram) {
            if (!this.checkLoad()) {
                return false;
            }
            this._device.context._currentProgram = this;
            this._device.context.useProgram(this._object);
        }
        return true;
    }
    _setUniformStruct(name, value) {
        for (const k in value) {
            this.setUniform(`${name}.${k}`, value[k]);
        }
    }
    _setUniformArray(name, value) {
        for (let i = 0; i < value.length; i++) {
            this.setUniform(`${name}[${i}]`, value[i]);
        }
    }
    load() {
        if (this._device.isContextLost()) {
            return;
        }
        const gl = this._device.context;
        this._error = null;
        this._uniformSetters = {};
        if (!this._object) {
            this._object = this._device.context.createProgram();
        }
        this._vertexShader = gl.createShader(WebGLEnum.VERTEX_SHADER);
        gl.attachShader(this._object, this._vertexShader);
        gl.shaderSource(this._vertexShader, this._vs);
        gl.compileShader(this._vertexShader);
        this._fragmentShader = gl.createShader(WebGLEnum.FRAGMENT_SHADER);
        gl.attachShader(this._object, this._fragmentShader);
        gl.shaderSource(this._fragmentShader, this._fs);
        gl.compileShader(this._fragmentShader);
        for (let loc = 0; loc < semanticList.length; loc++) {
            gl.bindAttribLocation(this._object, loc, semanticList[loc]);
        }
        gl.linkProgram(this._object);
    }
    checkLoad() {
        if (!this._object) {
            return false;
        }
        if (this._vertexShader) {
            const gl = this._device.context;
            if (!this._device.isContextLost()) {
                if (!gl.getProgramParameter(this._object, WebGLEnum.LINK_STATUS)) {
                    if (!gl.getShaderParameter(this._vertexShader, WebGLEnum.COMPILE_STATUS)) {
                        this._error = gl.getShaderInfoLog(this._vertexShader);
                        console.error(new Error(`Compile shader failed: ${this._error}`));
                    }
                    else if (!gl.getShaderParameter(this._fragmentShader, WebGLEnum.COMPILE_STATUS)) {
                        this._error = gl.getShaderInfoLog(this._fragmentShader);
                        console.error(new Error(`Compile shader failed: ${this._error}`));
                    }
                    else {
                        this._error = gl.getProgramInfoLog(this._object);
                        console.error(new Error(`Load program failed: \n${this._error}`));
                    }
                }
            }
            gl.deleteShader(this._vertexShader);
            this._vertexShader = null;
            gl.deleteShader(this._fragmentShader);
            this._fragmentShader = null;
            if (this._error) {
                gl.deleteProgram(this._object);
                this._object = null;
                return false;
            }
            this._uniformSetters = this.createUniformSetters();
        }
        return true;
    }
    createUniformSetter(info) {
        const loc = info.location;
        const isArray = info.isArray;
        switch (info.type) {
            case WebGLEnum.FLOAT:
                return this.getUniformSetterfv(loc);
            case WebGLEnum.FLOAT_VEC2:
                return this.getUniformSetter2fv(loc);
            case WebGLEnum.FLOAT_VEC3:
                return this.getUniformSetter3fv(loc);
            case WebGLEnum.FLOAT_VEC4:
                return this.getUniformSetter4fv(loc);
            case WebGLEnum.INT:
                return this.getUniformSetteriv(loc);
            case WebGLEnum.INT_VEC2:
                return this.getUniformSetter2iv(loc);
            case WebGLEnum.INT_VEC3:
                return this.getUniformSetter3iv(loc);
            case WebGLEnum.INT_VEC4:
                return this.getUniformSetter4iv(loc);
            case WebGLEnum.UNSIGNED_INT:
                return this.getUniformSetteruiv(loc);
            case WebGLEnum.UNSIGNED_INT_VEC2:
                return this.getUniformSetter2uiv(loc);
            case WebGLEnum.UNSIGNED_INT_VEC3:
                return this.getUniformSetter3uiv(loc);
            case WebGLEnum.UNSIGNED_INT_VEC4:
                return this.getUniformSetter4uiv(loc);
            case WebGLEnum.BOOL:
                return this.getUniformSetteriv(loc);
            case WebGLEnum.BOOL_VEC2:
                return this.getUniformSetter2iv(loc);
            case WebGLEnum.BOOL_VEC3:
                return this.getUniformSetter3iv(loc);
            case WebGLEnum.BOOL_VEC4:
                return this.getUniformSetter4iv(loc);
            case WebGLEnum.FLOAT_MAT2:
                return this.getUniformSetterMatrix2(loc);
            case WebGLEnum.FLOAT_MAT2x3:
                return this.getUniformSetterMatrix23(loc);
            case WebGLEnum.FLOAT_MAT2x4:
                return this.getUniformSetterMatrix24(loc);
            case WebGLEnum.FLOAT_MAT3:
                return this.getUniformSetterMatrix3(loc);
            case WebGLEnum.FLOAT_MAT3x2:
                return this.getUniformSetterMatrix32(loc);
            case WebGLEnum.FLOAT_MAT3x4:
                return this.getUniformSetterMatrix34(loc);
            case WebGLEnum.FLOAT_MAT4:
                return this.getUniformSetterMatrix4(loc);
            case WebGLEnum.FLOAT_MAT4x2:
                return this.getUniformSetterMatrix42(loc);
            case WebGLEnum.FLOAT_MAT4x3:
                return this.getUniformSetterMatrix43(loc);
            case WebGLEnum.SAMPLER_2D:
            case WebGLEnum.SAMPLER_2D_SHADOW:
            case WebGLEnum.INT_SAMPLER_2D:
            case WebGLEnum.UNSIGNED_INT_SAMPLER_2D: {
                const unit = this._unitCounter;
                this._unitCounter += info.size;
                return isArray
                    ? this.getSamplerArraySetter(loc, WebGLEnum.TEXTURE_2D, unit, info.size)
                    : this.getSamplerSetter(loc, WebGLEnum.TEXTURE_2D, unit);
            }
            case WebGLEnum.SAMPLER_2D_ARRAY:
            case WebGLEnum.SAMPLER_2D_ARRAY_SHADOW:
            case WebGLEnum.INT_SAMPLER_2D_ARRAY:
            case WebGLEnum.UNSIGNED_INT_SAMPLER_2D_ARRAY: {
                const unit = this._unitCounter;
                this._unitCounter += info.size;
                return isArray
                    ? this.getSamplerArraySetter(loc, WebGLEnum.TEXTURE_2D_ARRAY, unit, info.size)
                    : this.getSamplerSetter(loc, WebGLEnum.TEXTURE_2D_ARRAY, unit);
            }
            case WebGLEnum.SAMPLER_CUBE:
            case WebGLEnum.SAMPLER_CUBE_SHADOW:
            case WebGLEnum.INT_SAMPLER_CUBE:
            case WebGLEnum.UNSIGNED_INT_SAMPLER_CUBE: {
                const unit = this._unitCounter;
                this._unitCounter += info.size;
                return isArray
                    ? this.getSamplerArraySetter(loc, WebGLEnum.TEXTURE_CUBE_MAP, unit, info.size)
                    : this.getSamplerSetter(loc, WebGLEnum.TEXTURE_CUBE_MAP, unit);
            }
            case WebGLEnum.SAMPLER_3D:
            case WebGLEnum.INT_SAMPLER_3D:
            case WebGLEnum.UNSIGNED_INT_SAMPLER_3D: {
                const unit = this._unitCounter;
                this._unitCounter += info.size;
                return isArray
                    ? this.getSamplerArraySetter(loc, WebGLEnum.TEXTURE_3D, unit, info.size)
                    : this.getSamplerSetter(loc, WebGLEnum.TEXTURE_3D, unit);
            }
            default: {
                console.log(`Error: unknown uniform type: ${info.type}`);
            }
        }
    }
    createUniformSetters() {
        const uniformSetters = {};
        const gl = this._device.context;
        const numUniforms = gl.getProgramParameter(this._object, WebGLEnum.ACTIVE_UNIFORMS);
        this._uniformInfo = [];
        for (let index = 0; index < numUniforms; index++) {
            const info = gl.getActiveUniform(this._object, index);
            let name = info.name;
            let isArray = false;
            if (name.startsWith('gl_') || name.startsWith('webgl_')) {
                this._uniformInfo.push(null);
            }
            else {
                if (name.substr(-3) === '[0]') {
                    name = name.substr(0, name.length - 3);
                    isArray = true;
                }
                const size = info.size;
                const type = info.type;
                const blockIndex = -1;
                const offset = 0;
                const location = gl.getUniformLocation(this._object, info.name);
                const view = null;
                const { ctor: viewCtor, elementSize: viewElementSize } = this.getTypedArrayInfo(info.type);
                const uniformInfo = { index, name, size, type, blockIndex, offset, isArray, location, view, viewCtor, viewElementSize };
                this._uniformInfo.push(uniformInfo);
                if (location) {
                    uniformSetters[name] = this.createUniformSetter(uniformInfo);
                }
            }
        }
        if (isWebGL2(gl)) {
            this._blockInfo = {};
            const numBlocks = gl.getProgramParameter(this._object, WebGLEnum.ACTIVE_UNIFORM_BLOCKS);
            for (let i = 0; i < numBlocks; i++) {
                const name = gl.getActiveUniformBlockName(this._object, i);
                const index = gl.getUniformBlockIndex(this._object, name);
                const usedInVS = !!gl.getActiveUniformBlockParameter(this._object, i, WebGLEnum.UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER);
                const usedInFS = !!gl.getActiveUniformBlockParameter(this._object, i, WebGLEnum.UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER);
                const used = usedInVS || usedInFS;
                const size = gl.getActiveUniformBlockParameter(this._object, i, WebGLEnum.UNIFORM_BLOCK_DATA_SIZE);
                const uniformIndices = gl.getActiveUniformBlockParameter(this._object, i, WebGLEnum.UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES);
                this._blockInfo[name] = { index, used, size, uniformIndices };
                gl.uniformBlockBinding(this._object, index, index);
            }
        }
        return uniformSetters;
    }
    getUniformSetterf(location) {
        return (value) => {
            this._device.context.uniform1f(location, value);
        };
    }
    getUniformSetterfv(location) {
        return (value) => {
            this._device.context.uniform1fv(location, (value.getArray && value.getArray()) || value);
        };
    }
    getUniformSetter2fv(location) {
        return (value) => {
            this._device.context.uniform2fv(location, (value.getArray && value.getArray()) || value);
        };
    }
    getUniformSetter3fv(location) {
        return (value) => {
            this._device.context.uniform3fv(location, (value.getArray && value.getArray()) || value);
        };
    }
    getUniformSetter4fv(location) {
        return (value) => {
            this._device.context.uniform4fv(location, (value.getArray && value.getArray()) || value);
        };
    }
    getUniformSetteri(location) {
        return (value) => {
            this._device.context.uniform1i(location, value);
        };
    }
    getUniformSetteriv(location) {
        return (value) => {
            this._device.context.uniform1iv(location, (value.getArray && value.getArray()) || value);
        };
    }
    getUniformSetter2iv(location) {
        return (value) => {
            this._device.context.uniform2iv(location, (value.getArray && value.getArray()) || value);
        };
    }
    getUniformSetter3iv(location) {
        return (value) => {
            this._device.context.uniform3iv(location, (value.getArray && value.getArray()) || value);
        };
    }
    getUniformSetter4iv(location) {
        return (value) => {
            this._device.context.uniform4iv(location, (value.getArray && value.getArray()) || value);
        };
    }
    getUniformSetterui(location) {
        return (value) => {
            this._device.context.uniform1ui(location, value);
        };
    }
    getUniformSetteruiv(location) {
        return (value) => {
            this._device.context.uniform1uiv(location, (value.getArray && value.getArray()) || value);
        };
    }
    getUniformSetter2uiv(location) {
        return (value) => {
            this._device.context.uniform2uiv(location, (value.getArray && value.getArray()) || value);
        };
    }
    getUniformSetter3uiv(location) {
        return (value) => {
            this._device.context.uniform3uiv(location, (value.getArray && value.getArray()) || value);
        };
    }
    getUniformSetter4uiv(location) {
        return (value) => {
            this._device.context.uniform4uiv(location, (value.getArray && value.getArray()) || value);
        };
    }
    getUniformSetterMatrix2(location) {
        return (value) => {
            this._device.context.uniformMatrix2fv(location, false, (value.getArray && value.getArray()) || value);
        };
    }
    getUniformSetterMatrix23(location) {
        return (value) => {
            this._device.context.uniformMatrix2x3fv(location, false, (value.getArray && value.getArray()) || value);
        };
    }
    getUniformSetterMatrix24(location) {
        return (value) => {
            this._device.context.uniformMatrix2x4fv(location, false, (value.getArray && value.getArray()) || value);
        };
    }
    getUniformSetterMatrix32(location) {
        return (value) => {
            this._device.context.uniformMatrix3x2fv(location, false, (value.getArray && value.getArray()) || value);
        };
    }
    getUniformSetterMatrix3(location) {
        return (value) => {
            this._device.context.uniformMatrix3fv(location, false, (value.getArray && value.getArray()) || value);
        };
    }
    getUniformSetterMatrix34(location) {
        return (value) => {
            this._device.context.uniformMatrix3x4fv(location, false, (value.getArray && value.getArray()) || value);
        };
    }
    getUniformSetterMatrix42(location) {
        return (value) => {
            this._device.context.uniformMatrix4x2fv(location, false, (value.getArray && value.getArray()) || value);
        };
    }
    getUniformSetterMatrix43(location) {
        return (value) => {
            this._device.context.uniformMatrix4x3fv(location, false, (value.getArray && value.getArray()) || value);
        };
    }
    getUniformSetterMatrix4(location) {
        return (value) => {
            this._device.context.uniformMatrix4fv(location, false, (value.getArray && value.getArray()) || value);
        };
    }
    getSamplerSetter(location, target, unit) {
        const gl = this._device.context;
        return isWebGL2(gl) ? (texture) => {
            gl.uniform1i(location, unit);
            gl.activeTexture(this._device.context.TEXTURE0 + unit);
            gl.bindTexture(target, texture?.[0]?.object || null);
            gl.bindSampler(unit, texture?.[1]?.object || null);
        } : (texture) => {
            gl.uniform1i(location, unit);
            gl.activeTexture(this._device.context.TEXTURE0 + unit);
            gl.bindTexture(target, texture?.[0]?.object || null);
        };
    }
    getSamplerArraySetter(location, target, unit, size) {
        const units = new Int32Array(size);
        for (let i = 0; i < size; i++) {
            units[i] = unit + i;
        }
        const gl = this._device.context;
        return isWebGL2(gl)
            ? (textures) => {
                gl.uniform1iv(location, units);
                textures.forEach((texture, index) => {
                    gl.activeTexture(this._device.context.TEXTURE0 + units[index]);
                    gl.bindTexture(target, texture?.object || null);
                    gl.bindSampler(units[index], texture?.sampler.object || null);
                });
            }
            : (textures) => {
                gl.uniform1iv(location, units);
                textures.forEach((texture, index) => {
                    gl.activeTexture(this._device.context.TEXTURE0 + units[index]);
                    gl.bindTexture(target, texture?.object || null);
                });
            };
    }
    getTypedArrayInfo(type) {
        let ctor = null;
        let elementSize = 0;
        switch (type) {
            case WebGLEnum.INT:
                ctor = Int32Array;
                elementSize = 4;
                break;
            case WebGLEnum.INT_VEC2:
                ctor = Int32Array;
                elementSize = 8;
                break;
            case WebGLEnum.INT_VEC3:
                ctor = Int32Array;
                elementSize = 12;
                break;
            case WebGLEnum.INT_VEC4:
                ctor = Int32Array;
                elementSize = 16;
                break;
            case WebGLEnum.UNSIGNED_INT:
            case WebGLEnum.BOOL:
                ctor = Uint32Array;
                elementSize = 4;
                break;
            case WebGLEnum.UNSIGNED_INT_VEC2:
            case WebGLEnum.BOOL_VEC2:
                ctor = Uint32Array;
                elementSize = 8;
                break;
            case WebGLEnum.UNSIGNED_INT_VEC3:
            case WebGLEnum.BOOL_VEC3:
                ctor = Uint32Array;
                elementSize = 12;
                break;
            case WebGLEnum.UNSIGNED_INT_VEC4:
            case WebGLEnum.BOOL_VEC4:
                ctor = Uint32Array;
                elementSize = 16;
                break;
            case WebGLEnum.FLOAT:
                ctor = Float32Array;
                elementSize = 4;
                break;
            case WebGLEnum.FLOAT_VEC2:
                ctor = Float32Array;
                elementSize = 8;
                break;
            case WebGLEnum.FLOAT_VEC3:
                ctor = Float32Array;
                elementSize = 12;
                break;
            case WebGLEnum.FLOAT_VEC4:
            case WebGLEnum.FLOAT_MAT2:
                ctor = Float32Array;
                elementSize = 16;
                break;
            case WebGLEnum.FLOAT_MAT2x3:
            case WebGLEnum.FLOAT_MAT3x2:
                ctor = Float32Array;
                elementSize = 24;
                break;
            case WebGLEnum.FLOAT_MAT2x4:
            case WebGLEnum.FLOAT_MAT4x2:
                ctor = Float32Array;
                elementSize = 32;
                break;
            case WebGLEnum.FLOAT_MAT3:
                ctor = Float32Array;
                elementSize = 36;
                break;
            case WebGLEnum.FLOAT_MAT3x4:
            case WebGLEnum.FLOAT_MAT4x3:
                ctor = Float32Array;
                elementSize = 48;
                break;
            case WebGLEnum.FLOAT_MAT4:
                ctor = Float32Array;
                elementSize = 64;
                break;
        }
        return { ctor, elementSize };
    }
}

export { WebGLGPUProgram };
//# sourceMappingURL=gpuprogram_webgl.js.map
