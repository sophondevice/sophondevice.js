import { WebGLGPUBuffer } from "./buffer_webgl";
import { typeU16, typeU32 } from "../builder";
import { GPUResourceUsageFlags } from "../gpuobject";
export class WebGLIndexBuffer extends WebGLGPUBuffer {
    indexType;
    length;
    constructor(device, data, usage) {
        if (!(data instanceof Uint16Array) && !(data instanceof Uint32Array)) {
            throw new Error('invalid index data');
        }
        super(device, GPUResourceUsageFlags.BF_INDEX | usage, data);
        this.indexType = data instanceof Uint16Array ? typeU16 : typeU32;
        this.length = data.length;
    }
}
//# sourceMappingURL=indexbuffer_webgl.js.map