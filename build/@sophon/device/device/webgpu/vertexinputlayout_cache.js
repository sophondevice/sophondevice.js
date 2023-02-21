/** sophon base library */
import { hashToVertexFormat } from './constants_webgpu.js';

class VertexLayoutCache {
    _layouts;
    constructor() {
        this._layouts = {};
    }
    fetchVertexLayout(hash) {
        let layouts = this._layouts[hash];
        if (!layouts) {
            layouts = [];
            hash.split(':').forEach(l => {
                const parts = l.split('-');
                const layout = {
                    arrayStride: Number(parts[0]),
                    stepMode: (Number(parts[1]) ? 'instance' : 'vertex'),
                    attributes: [],
                };
                for (let i = 2; i < parts.length; i += 3) {
                    layout.attributes.push({
                        format: hashToVertexFormat[parts[i]],
                        offset: Number(parts[i + 1]),
                        shaderLocation: Number(parts[i + 2]),
                    });
                }
                layouts.push(layout);
            });
            this._layouts[hash] = layouts;
        }
        return layouts;
    }
}

export { VertexLayoutCache };
//# sourceMappingURL=vertexinputlayout_cache.js.map
