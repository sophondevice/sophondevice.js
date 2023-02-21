/** sophon base library */
import { NodeType } from './values.js';

class ElementIndexer {
    static MODE_ALL = 0;
    static MODE_NON_INTERNAL = 1;
    static MODE_ELEMENT_NON_INTERNAL = 2;
    _parent;
    _currentIndex;
    _currentNode;
    _length;
    _mode;
    _domTag;
    constructor(parent, mode) {
        this._parent = parent;
        this._currentIndex = -1;
        this._currentNode = null;
        this._length = -1;
        this._mode = mode;
        this._domTag = parent.gui.domTag;
    }
    get length() {
        return this._getLength();
    }
    item(index) {
        return this._at(index);
    }
    entries() {
        return this._getEntriesIterator();
    }
    keys() {
        return this._getKeysIterator();
    }
    values() {
        return this._getValuesIterator();
    }
    forEach(callback, thisArg) {
        for (const entry of this.entries()) {
            callback && callback.call(thisArg, entry[1], entry[0], this);
        }
    }
    indexOf(node) {
        for (let i = 0; i < this.length; i++) {
            if (this.item(i) === node) {
                return i;
            }
        }
        return -1;
    }
    _at(index) {
        if (index < 0 || index >= this.length) {
            return null;
        }
        if (this._currentIndex < 0 || this._currentIndex >= this.length) {
            this._reset(index);
        }
        else {
            while (index < this._currentIndex) {
                this._previous();
            }
            while (index > this._currentIndex) {
                this._next();
            }
        }
        return this._currentNode;
    }
    _reset(index) {
        this._length = -1;
        this._currentIndex = 0;
        switch (this._mode) {
            case ElementIndexer.MODE_ALL:
                this._currentNode = this._parent._getLayout().firstChild()?.element || null;
                break;
            case ElementIndexer.MODE_NON_INTERNAL:
                this._currentNode = this._getFirstNonInternalNode();
                break;
            case ElementIndexer.MODE_ELEMENT_NON_INTERNAL:
                this._currentNode = this._getFirstNonInternalElement();
                break;
        }
        while (this._currentIndex < index && this._currentNode) {
            this._next();
        }
    }
    _getFirstNonInternalNode() {
        for (let child = this._parent._getLayout().firstChild(); child; child = child.nextSibling()) {
            if (!child.element._isInternal()) {
                return child.element;
            }
        }
        return null;
    }
    _getFirstNonInternalElement() {
        for (let child = this._parent._getLayout().firstChild(); child; child = child.nextSibling()) {
            if (!child.element._isInternal() && child.element.nodeType === NodeType.ELEMENT_NODE) {
                return child.element;
            }
        }
        return null;
    }
    _getLengthAll() {
        return this._parent._getLayout().getNumChildren();
    }
    _getLengthNonInternalNode() {
        let length = 0;
        for (let child = this._parent._getLayout().firstChild(); child; child = child.nextSibling()) {
            if (!child.element._isInternal()) {
                length++;
            }
        }
        return length;
    }
    _getLengthNonInternalElement() {
        let length = 0;
        for (let child = this._parent._getLayout().firstChild(); child; child = child.nextSibling()) {
            if (!child.element._isInternal() && child.element.nodeType === NodeType.ELEMENT_NODE) {
                length++;
            }
        }
        return length;
    }
    _getLength() {
        if (this._domTag !== this._parent.gui.domTag) {
            this._domTag = this._parent.gui.domTag;
            this._reset(this._currentIndex);
        }
        if (this._length < 0) {
            switch (this._mode) {
                case ElementIndexer.MODE_ALL:
                    this._length = this._getLengthAll();
                    break;
                case ElementIndexer.MODE_NON_INTERNAL:
                    this._length = this._getLengthNonInternalNode();
                    break;
                case ElementIndexer.MODE_ELEMENT_NON_INTERNAL:
                    this._length = this._getLengthNonInternalElement();
                    break;
            }
        }
        return this._length;
    }
    _getKeysIterator() {
        const that = this;
        return {
            [Symbol.iterator]() {
                return {
                    lastIndex: -1,
                    next() {
                        this.lastIndex++;
                        if (that._domTag !== that._parent.gui.domTag) {
                            that._domTag = that._parent.gui.domTag;
                            that._reset(this.lastIndex);
                        }
                        if (this.lastIndex >= that.length) {
                            this.lastIndex = -1;
                            return {
                                done: true,
                                value: null,
                            };
                        }
                        else {
                            return {
                                done: false,
                                value: this.lastIndex,
                            };
                        }
                    },
                };
            },
        };
    }
    _getEntriesIterator() {
        const that = this;
        return {
            [Symbol.iterator]() {
                return {
                    lastIndex: -1,
                    next() {
                        this.lastIndex++;
                        if (that._domTag !== that._parent.gui.domTag || that._currentIndex !== this.lastIndex) {
                            that._domTag = that._parent.gui.domTag;
                            that._reset(this.lastIndex);
                        }
                        if (!that._currentNode) {
                            this.lastIndex = -1;
                            return {
                                done: true,
                                value: null,
                            };
                        }
                        else {
                            const ret = {
                                done: false,
                                value: [that._currentIndex, that._currentNode],
                            };
                            that._next();
                            return ret;
                        }
                    },
                };
            },
        };
    }
    _getValuesIterator() {
        const that = this;
        return {
            [Symbol.iterator]() {
                return {
                    lastIndex: -1,
                    next() {
                        this.lastIndex++;
                        if (that._domTag !== that._parent.gui.domTag || that._currentIndex !== this.lastIndex) {
                            that._domTag = that._parent.gui.domTag;
                            that._reset(this.lastIndex);
                        }
                        if (!that._currentNode) {
                            this.lastIndex = -1;
                            return {
                                done: true,
                                value: null,
                            };
                        }
                        else {
                            const ret = {
                                done: false,
                                value: that._currentNode,
                            };
                            that._next();
                            return ret;
                        }
                    },
                };
            },
        };
    }
    _next() {
        if (this._currentNode) {
            switch (this._mode) {
                case ElementIndexer.MODE_ALL: {
                    this._currentNode = this._currentNode._getLayout().nextSibling()?.element || null;
                    break;
                }
                case ElementIndexer.MODE_NON_INTERNAL: {
                    do {
                        this._currentNode = this._currentNode._getLayout().nextSibling()?.element || null;
                    } while (this._currentNode?._isInternal());
                    break;
                }
                case ElementIndexer.MODE_ELEMENT_NON_INTERNAL: {
                    do {
                        this._currentNode = this._currentNode._getLayout().nextSibling()?.element || null;
                    } while (this._currentNode &&
                        (this._currentNode._isInternal() ||
                            this._currentNode.nodeType !== NodeType.ELEMENT_NODE));
                    break;
                }
            }
            this._currentIndex++;
        }
    }
    _previous() {
        if (this._currentNode) {
            switch (this._mode) {
                case ElementIndexer.MODE_ALL: {
                    this._currentNode = this._currentNode._getLayout().previousSibling()?.element || null;
                    break;
                }
                case ElementIndexer.MODE_NON_INTERNAL: {
                    do {
                        this._currentNode = this._currentNode._getLayout().previousSibling()?.element || null;
                    } while (this._currentNode?._isInternal());
                    break;
                }
                case ElementIndexer.MODE_ELEMENT_NON_INTERNAL: {
                    do {
                        this._currentNode = this._currentNode._getLayout().previousSibling()?.element || null;
                    } while (this._currentNode &&
                        (this._currentNode._isInternal() ||
                            this._currentNode.nodeType !== NodeType.ELEMENT_NODE));
                    break;
                }
            }
            this._currentIndex--;
        }
    }
}
class RStaticNodeList {
    _nodelist;
    constructor(nodelist) {
        this._nodelist = nodelist;
        return new Proxy(this, {
            get: function (target, name) {
                if (typeof name === 'string' && /^\d+$/.test(name)) {
                    return target._nodelist[parseInt(name)] || undefined;
                }
                else {
                    return target[name];
                }
            },
            set: function () {
                return false;
            },
        });
    }
    get length() {
        return this._nodelist.length;
    }
    item(index) {
        return this._nodelist[index] || null;
    }
    entries() {
        const that = this;
        return {
            [Symbol.iterator]() {
                return {
                    lastIndex: -1,
                    next() {
                        this.lastIndex++;
                        if (this.lastIndex >= that.length) {
                            this.lastIndex = -1;
                            return {
                                done: true,
                                value: null,
                            };
                        }
                        else {
                            return {
                                done: false,
                                value: [this.lastIndex, that.item(this.lastIndex)],
                            };
                        }
                    },
                };
            },
        };
    }
    keys() {
        const that = this;
        return {
            [Symbol.iterator]() {
                return {
                    lastIndex: -1,
                    next() {
                        this.lastIndex++;
                        if (this.lastIndex >= that.length) {
                            this.lastIndex = -1;
                            return {
                                done: true,
                                value: null,
                            };
                        }
                        else {
                            return {
                                done: false,
                                value: this.lastIndex,
                            };
                        }
                    },
                };
            },
        };
    }
    values() {
        const that = this;
        return {
            [Symbol.iterator]() {
                return {
                    lastIndex: -1,
                    next() {
                        this.lastIndex++;
                        if (this.lastIndex >= that.length) {
                            this.lastIndex = -1;
                            return {
                                done: true,
                                value: null,
                            };
                        }
                        else {
                            return {
                                done: false,
                                value: that.item(this.lastIndex),
                            };
                        }
                    },
                };
            },
        };
    }
    indexOf(node) {
        return this._nodelist.indexOf(node);
    }
    forEach(callback, thisArg) {
        const that = this;
        if (callback) {
            for (let i = 0; i < this._nodelist.length; i++) {
                callback.call(thisArg, that._nodelist[i], i, that);
            }
        }
    }
}
class RLiveNodeList {
    static MODE_ALL = ElementIndexer.MODE_ALL;
    static MODE_NON_INTERNAL = ElementIndexer.MODE_NON_INTERNAL;
    static MODE_ELEMENT_NON_INTERNAL = ElementIndexer.MODE_ELEMENT_NON_INTERNAL;
    _indexer;
    constructor(parent, mode) {
        this._indexer = new ElementIndexer(parent, mode);
        const proxy = new Proxy(this, {
            get: function (target, name) {
                if (typeof name === 'string' && /^\d+$/.test(name)) {
                    return target._indexer.item(parseInt(name)) || undefined;
                }
                else {
                    return target._indexer[name];
                }
            },
            set: function (target, name, value) {
                if (typeof name === 'string' && /^\d+$/.test(name)) {
                    return false;
                }
                else {
                    target._indexer[name] = value;
                    return true;
                }
            },
        });
        return proxy;
    }
}

export { RLiveNodeList, RStaticNodeList };
//# sourceMappingURL=nodelist.js.map
