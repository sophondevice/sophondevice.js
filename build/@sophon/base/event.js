/** sophon base library */
class REvent {
    static NONE = 0;
    static CAPTURING_PHASE = 1;
    static AT_TARGET = 2;
    static BUBBLING_PHASE = 3;
    static BIT_CANBUBBLE = 1 << 0;
    static BIT_CANCELABLE = 1 << 1;
    static BIT_COMPOSED = 1 << 2;
    static BIT_PROPAGATION_STOPPED = 1 << 3;
    static BIT_IMMEDIATE_PROPAGATION_STOPPED = 1 << 4;
    static BIT_WAS_CANCELED = 1 << 5;
    static BIT_DEFAULT_HANDLED = 1 << 6;
    static BIT_EXECUTING_PASSIVE_LISTENER = 1 << 7;
    _type;
    _state;
    _phase;
    _currentTarget;
    _target;
    _timestamp;
    _path;
    constructor(type, canBubble, cancelable) {
        this._type = type;
        !!canBubble && this._setFlag(REvent.BIT_CANBUBBLE);
        !!cancelable && this._setFlag(REvent.BIT_CANCELABLE);
        this.reset();
    }
    reset() {
        this._state &= (REvent.BIT_CANBUBBLE | REvent.BIT_CANCELABLE);
        this._phase = REvent.NONE;
        this._currentTarget = null;
        this._target = null;
        this._timestamp = window.Date.now();
        this._path = null;
    }
    get bubbles() {
        return this._hasFlag(REvent.BIT_CANBUBBLE);
    }
    cancelBubble() {
        this.stopPropagation();
    }
    get cancelable() {
        return this._hasFlag(REvent.BIT_CANCELABLE);
    }
    get composed() {
        return this._hasFlag(REvent.BIT_COMPOSED);
    }
    get currentTarget() {
        return this._currentTarget;
    }
    get defaultPrevented() {
        return !!(this._state & REvent.BIT_WAS_CANCELED);
    }
    get eventPhase() {
        return this._phase;
    }
    get target() {
        return this._target;
    }
    get timeStamp() {
        return this._timestamp;
    }
    get type() {
        return this._type;
    }
    get isTrusted() {
        return true;
    }
    composedPath() {
        return this._path?.toArray() || null;
    }
    preventDefault() {
        if (this.cancelable && !(this._state & REvent.BIT_EXECUTING_PASSIVE_LISTENER)) {
            this._setFlag(REvent.BIT_WAS_CANCELED);
        }
    }
    stopImmediatePropagation() {
        this._setFlag(REvent.BIT_IMMEDIATE_PROPAGATION_STOPPED);
    }
    stopPropagation() {
        this._setFlag(REvent.BIT_PROPAGATION_STOPPED);
    }
    _isDefaultHandled() {
        return this._hasFlag(REvent.BIT_DEFAULT_HANDLED);
    }
    _setDefaultHandled(handled) {
        handled
            ? this._setFlag(REvent.BIT_DEFAULT_HANDLED)
            : this._clearFlag(REvent.BIT_DEFAULT_HANDLED);
    }
    _setCanceled(prevented) {
        prevented ? this._setFlag(REvent.BIT_WAS_CANCELED) : this._clearFlag(REvent.BIT_WAS_CANCELED);
    }
    _setPropagationStopped(stopped) {
        stopped
            ? this._setFlag(REvent.BIT_PROPAGATION_STOPPED)
            : this._clearFlag(REvent.BIT_PROPAGATION_STOPPED);
    }
    _isPropagationStopped() {
        return this._hasFlag(REvent.BIT_PROPAGATION_STOPPED);
    }
    _setImmediatePropagationStopped(stopped) {
        stopped
            ? this._setFlag(REvent.BIT_IMMEDIATE_PROPAGATION_STOPPED)
            : this._clearFlag(REvent.BIT_IMMEDIATE_PROPAGATION_STOPPED);
    }
    _isImmediatePropagationStopped() {
        return this._hasFlag(REvent.BIT_IMMEDIATE_PROPAGATION_STOPPED);
    }
    _setPassive(passive) {
        passive
            ? this._setFlag(REvent.BIT_EXECUTING_PASSIVE_LISTENER)
            : this._clearFlag(REvent.BIT_EXECUTING_PASSIVE_LISTENER);
    }
    _isPassive() {
        return this._hasFlag(REvent.BIT_EXECUTING_PASSIVE_LISTENER);
    }
    _isBeingDispatched() {
        return !!this._phase;
    }
    _setTarget(target) {
        this._target = target || null;
    }
    _setCurrentTarget(target) {
        this._currentTarget = target || null;
    }
    _setEventPhase(phase) {
        this._phase = phase;
    }
    _getPath() {
        return this._path || null;
    }
    _setPath(path) {
        this._path = path;
    }
    _setFlag(bit) {
        this._state |= bit;
    }
    _clearFlag(bit) {
        this._state &= ~bit;
    }
    _hasFlag(bit) {
        return !!(this._state & bit);
    }
}
class DefaultEventPath {
    target;
    constructor(target) {
        this.target = target;
    }
    toArray() {
        return [this.target];
    }
}
class DefaultEventPathBuilder {
    build(node) {
        return new DefaultEventPath(node);
    }
}
class REventTarget {
    _listeners;
    _defaultListeners;
    _pathBuilder;
    constructor(pathBuilder) {
        this._listeners = null;
        this._defaultListeners = null;
        this._pathBuilder = pathBuilder || new DefaultEventPathBuilder();
    }
    addEventListener(type, listener, options) {
        this._listeners = this._internalAddEventListener(this._listeners, type, listener, options);
    }
    removeEventListener(type, listener, options) {
        this._internalRemoveEventListener(this._listeners, type, listener, options);
    }
    dispatchEvent(evt) {
        if (!evt || evt._isBeingDispatched()) {
            console.error('dispatchEvent: invalid event object or event has been dispatched');
            return true;
        }
        const target = this;
        const eventPath = this._pathBuilder.build(target);
        evt._setTarget(target);
        evt._setCurrentTarget(target);
        evt._setCanceled(false);
        evt._setEventPhase(REvent.AT_TARGET);
        evt._setDefaultHandled(false);
        evt._setPath(eventPath);
        this._invokeCaptureListeners(evt);
        this._invokeBubbleListeners(evt);
        evt._setPath(null);
        evt._setCurrentTarget(null);
        evt._setEventPhase(REvent.NONE);
        evt._setPropagationStopped(false);
        evt._setImmediatePropagationStopped(false);
        if (!evt._isDefaultHandled() && !evt.defaultPrevented) {
            evt._setTarget(target);
            evt._setCurrentTarget(target);
            evt._setPath(eventPath);
            this._invokeBubbleDefaultListeners(evt);
            evt._setTarget(null);
            evt._setCurrentTarget(null);
            evt._setPath(null);
        }
        return !evt.defaultPrevented;
    }
    addDefaultEventListener(type, listener, options) {
        this._defaultListeners = this._internalAddEventListener(this._defaultListeners, type, listener, options);
    }
    removeDefaultEventListener(type, listener, options) {
        this._internalRemoveEventListener(this._defaultListeners, type, listener, options);
    }
    _internalAddEventListener(listenerMap, type, listener, options) {
        if (typeof type !== 'string') {
            return;
        }
        if (!listenerMap) {
            listenerMap = {};
        }
        const l = typeof listener === 'function' ? { handleEvent: listener } : listener;
        const o = {
            capture: !!options?.capture,
            once: !!options?.once,
            passive: !!options?.passive,
        };
        let handlers = listenerMap[type];
        if (!handlers) {
            listenerMap[type] = handlers = [];
        }
        for (const handler of handlers) {
            if (handler.handler.handleEvent === l.handleEvent && handler.options.capture === o.capture) {
                return;
            }
        }
        handlers.push({ handler: l, options: o, removed: false });
        return listenerMap;
    }
    _internalRemoveEventListener(listenerMap, type, listener, options) {
        if (typeof type !== 'string' || !listenerMap) {
            return;
        }
        const l = typeof listener === 'function' ? { handleEvent: listener } : listener;
        const o = {
            capture: !!options?.capture,
            once: !!options?.once,
            passive: !!options?.passive,
        };
        const handlers = listenerMap[type];
        if (handlers) {
            for (let i = 0; i < handlers.length; i++) {
                const handler = handlers[i];
                if (handler.handler.handleEvent === l.handleEvent &&
                    handler.options.capture === o.capture) {
                    handlers.splice(i, 1);
                    break;
                }
            }
        }
        if (handlers.length === 0) {
            delete listenerMap[type];
        }
    }
    _invokeLocalListeners(evt, useCapture) {
        if (!this._listeners) {
            return;
        }
        const handlers = this._listeners[evt.type];
        if (handlers && handlers.length > 0) {
            const handlersCopy = handlers.slice();
            for (const handler of handlersCopy) {
                if (handler.options.capture === useCapture) {
                    evt._setCurrentTarget(this);
                    evt._setPassive(handler.options.passive);
                    handler.handler.handleEvent.call(this, evt);
                    if (handler.options.once) {
                        handler.removed = true;
                    }
                    if (evt._isImmediatePropagationStopped()) {
                        break;
                    }
                }
            }
            this._clearRemovedListeners(handlers);
        }
    }
    _invokeCaptureListeners = function (evt) {
        const eventPath = evt.composedPath();
        if (eventPath) {
            for (let i = eventPath.length; i > 0; i--) {
                const currentTarget = eventPath[i - 1];
                evt._setEventPhase(currentTarget === evt.target ? REvent.AT_TARGET : REvent.CAPTURING_PHASE);
                currentTarget._invokeLocalListeners(evt, true);
                if (evt._isPropagationStopped()) {
                    break;
                }
            }
        }
    };
    _invokeBubbleListeners = function (evt) {
        const eventPath = evt.composedPath();
        if (eventPath) {
            for (const currentTarget of eventPath) {
                if (currentTarget === evt.target) {
                    evt._setEventPhase(REvent.AT_TARGET);
                }
                else if (evt.bubbles) {
                    evt._setEventPhase(REvent.BUBBLING_PHASE);
                }
                else {
                    break;
                }
                currentTarget._invokeLocalListeners(evt, false);
                if (evt._isPropagationStopped()) {
                    break;
                }
            }
        }
    };
    _invokeDefaultListeners(evt) {
        const handlers = this._defaultListeners?.[evt.type];
        if (handlers && handlers.length > 0) {
            const handlersCopy = handlers.slice();
            for (const handler of handlersCopy) {
                evt._setCurrentTarget(this);
                handler.handler.handleEvent.call(this, evt);
            }
            this._clearRemovedListeners(handlers);
        }
    }
    _invokeBubbleDefaultListeners = function (evt) {
        const eventPath = evt.composedPath();
        if (eventPath) {
            eventPath[0]?._invokeDefaultListeners(evt);
            if (evt._isDefaultHandled() || !evt.bubbles) {
                return;
            }
            for (let i = 1; i < eventPath.length; i++) {
                eventPath[i]?._invokeDefaultListeners(evt);
                if (evt._isDefaultHandled()) {
                    return;
                }
            }
        }
    };
    _clearRemovedListeners(handlers) {
        for (let i = handlers.length - 1; i >= 0; i--) {
            if (handlers[i].removed) {
                handlers.splice(i, 1);
            }
        }
    }
}

export { DefaultEventPath, DefaultEventPathBuilder, REvent, REventTarget };
//# sourceMappingURL=event.js.map
