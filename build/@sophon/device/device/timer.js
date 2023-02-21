/** sophon base library */
class CPUTimer {
    _cpuTimer;
    _cpuStart;
    _cpuTime;
    _ended;
    constructor() {
        this._cpuTimer = window.performance || window.Date;
        this._cpuTime = null;
        this._ended = false;
    }
    now() {
        return this._cpuTimer.now();
    }
    begin() {
        this._cpuStart = this.now();
        this._cpuTime = null;
        this._ended = false;
    }
    end() {
        this._cpuTime = this.now() - this._cpuStart;
        this._ended = true;
    }
    ended() {
        return this._ended;
    }
    elapsed() {
        return this._cpuTime;
    }
}

export { CPUTimer };
//# sourceMappingURL=timer.js.map
