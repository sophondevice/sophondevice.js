import { isWebGL2 } from './utils';
import { WebGLEnum } from './webgl_enum';
const GPU_DISJOINT_EXT = 0x8fbb;
const TIME_ELAPSED_EXT = 0x88bf;
export class GPUTimer {
    _device;
    _query;
    _state;
    _timerQuery;
    _gpuTime;
    constructor(device) {
        this._device = device;
        this._state = 0;
        this._gpuTime = null;
        const gl = this._device.context;
        if (isWebGL2(gl)) {
            const ext = gl.getExtension('EXT_disjoint_timer_query_webgl2');
            if (ext) {
                this._timerQuery = {
                    createQuery: gl.createQuery.bind(gl),
                    deleteQuery: gl.deleteQuery.bind(gl),
                    beginQuery: gl.beginQuery.bind(gl),
                    endQuery: gl.endQuery.bind(gl),
                    isQuery: gl.isQuery.bind(gl),
                    getQuery: gl.getQuery.bind(gl),
                    getQueryObject: gl.getQueryParameter.bind(gl),
                    queryCounter: ext.queryCounterEXT.bind(ext),
                };
            }
        }
        else {
            const ext = gl.getExtension('EXT_disjoint_timer_query');
            if (ext) {
                this._timerQuery = {
                    createQuery: ext.createQueryEXT.bind(ext),
                    deleteQuery: ext.deleteQueryEXT.bind(ext),
                    beginQuery: ext.beginQueryEXT.bind(ext),
                    endQuery: ext.endQueryEXT.bind(ext),
                    isQuery: ext.isQueryEXT.bind(ext),
                    getQuery: ext.getQueryEXT.bind(ext),
                    getQueryObject: ext.getQueryObjectEXT.bind(ext),
                    queryCounter: ext.queryCounterEXT.bind(ext),
                };
            }
        }
        this._query = this._timerQuery ? this._timerQuery.createQuery() : null;
    }
    get gpuTimerSupported() {
        return !!this._query;
    }
    begin() {
        if (this._state === 1) {
            this.end();
        }
        if (this._query) {
            this._timerQuery.beginQuery(TIME_ELAPSED_EXT, this._query);
        }
        this._gpuTime = null;
        this._state = 1;
    }
    end() {
        if (this._state === 1) {
            if (this._query) {
                this._timerQuery.endQuery(TIME_ELAPSED_EXT);
            }
            this._state = 2;
        }
    }
    ended() {
        return this._state !== 1;
    }
    elapsed() {
        if (this._state === 2) {
            if (this._gpuTime === null &&
                this._query &&
                this._timerQuery.getQueryObject(this._query, WebGLEnum.QUERY_RESULT_AVAILABLE)) {
                const gpuTimerDisjoint = this._device.context.getParameter(GPU_DISJOINT_EXT);
                if (!gpuTimerDisjoint) {
                    this._gpuTime =
                        Number(this._timerQuery.getQueryObject(this._query, WebGLEnum.QUERY_RESULT)) / 1000000;
                }
            }
        }
        return this._gpuTime;
    }
}
//# sourceMappingURL=gpu_timer.js.map