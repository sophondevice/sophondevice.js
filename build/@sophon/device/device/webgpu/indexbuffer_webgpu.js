/** sophon base library */
import { WebGPUBuffer } from './buffer_webgpu.js';
import '../builder/ast.js';
import '../base_types.js';
import { GPUResourceUsageFlags } from '../gpuobject.js';
import { typeU16, typeU32 } from '../builder/types.js';
import '../builder/builtinfunc.js';
import '../builder/constructors.js';

class WebGPUIndexBuffer extends WebGPUBuffer {
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

export { WebGPUIndexBuffer };
//# sourceMappingURL=indexbuffer_webgpu.js.map
