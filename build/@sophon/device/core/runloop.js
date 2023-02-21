/** sophon base library */
const runningLoopStack = [];
const runLoopQueue = [];
function runLoopFunc() {
    console.assert(runningLoopStack.length > 0, 'running loop stack error');
    const currentLoop = runningLoopStack[runningLoopStack.length - 1];
    currentLoop._processFrameTasks();
    if (currentLoop.mainFunc(...currentLoop.runArgs)) {
        console.assert(runningLoopStack.length > 0 && runningLoopStack[runningLoopStack.length - 1] === currentLoop, 'running loop error');
        runningLoopStack.pop();
        currentLoop.atexit && currentLoop.atexit();
    }
    while (runLoopQueue.length > 0) {
        const rl = runLoopQueue.splice(0, 1);
        runningLoopStack.push(rl[0]);
    }
    if (runningLoopStack.length > 0) {
        requestAnimationFrame(runLoopFunc);
    }
}
class RunLoop {
    _options;
    _runArgs;
    _frameTasks;
    constructor(options) {
        this._runArgs = [];
        this._frameTasks = [];
        this._options = {
            main: null,
            atexit: null,
            eventFilter: null,
            noFrameEvents: false,
        };
        if (options) {
            if (typeof options === 'function') {
                this._options.main = options;
            }
            else {
                Object.assign(this._options, options);
            }
        }
    }
    get eventFilter() {
        return this._options.eventFilter;
    }
    set eventFilter(filter) {
        this._options.eventFilter = filter || null;
    }
    get noFrameEvents() {
        return !!this._options.noFrameEvents;
    }
    set noFrameEvents(val) {
        this._options.noFrameEvents = val;
    }
    get runArgs() {
        return this._runArgs;
    }
    set runArgs(args) {
        this._runArgs = args;
    }
    get mainFunc() {
        return this._options.main;
    }
    set mainFunc(func) {
        this._options.main = func || null;
    }
    get atexit() {
        return this._options.atexit;
    }
    set atexit(func) {
        this._options.atexit = func || null;
    }
    scheduleNextFrame(task) {
        task && this._frameTasks.push(task);
    }
    _processFrameTasks() {
        for (const f of this._frameTasks) {
            f();
        }
        this._frameTasks = [];
    }
    run(...args) {
        console.assert(!!this._options.main, 'invalid runloop main function');
        this._runArgs = [...args];
        if (runningLoopStack.indexOf(this) < 0) {
            if (runningLoopStack.length === 0) {
                console.assert(runLoopQueue.length === 0, 'run loop queue error');
                runningLoopStack.push(this);
                runLoopFunc();
            }
            else if (runLoopQueue.indexOf(this) < 0) {
                runLoopQueue.push(this);
            }
        }
    }
    static current() {
        return runningLoopStack[runningLoopStack.length - 1];
    }
}

export { RunLoop };
//# sourceMappingURL=runloop.js.map
