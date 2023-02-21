/** sophon base library */
class ListIterator {
    _node;
    _reverse;
    _dl;
    constructor(dl, node, reverse) {
        this._dl = dl;
        this._node = node;
        this._reverse = reverse;
    }
    valid() {
        return this._node !== this._dl.head;
    }
    next() {
        if (this.valid()) {
            this._node = this._reverse ? this._node.prev : this._node.next;
        }
        return this;
    }
    getNext() {
        if (!this.valid()) {
            throw new Error('Failed to get next iterator: this iterator is invalid');
        }
        return new ListIterator(this._dl, this._reverse ? this._node.prev : this._node.next, this._reverse);
    }
    prev() {
        if (this.valid()) {
            this._node = this._reverse ? this._node.next : this._node.prev;
        }
        return this;
    }
    getPrev() {
        if (!this.valid()) {
            throw new Error('Failed to get previous iterator: this iterator is invalid');
        }
        return new ListIterator(this._dl, this._reverse ? this._node.next : this._node.prev, this._reverse);
    }
    get node() {
        return this._node;
    }
    set node(n) {
        this._node = n;
    }
    get reversed() {
        return this._reverse;
    }
    get list() {
        return this._dl;
    }
    get data() {
        if (this.valid()) {
            return this._node.data;
        }
        else {
            throw new Error('Invalid interator');
        }
    }
    set data(val) {
        if (this.valid()) {
            this._node.data = val;
        }
    }
}
class List {
    _head;
    _length;
    constructor() {
        this._head = new ListNodeImpl();
        this._length = 0;
    }
    get head() {
        return this._head;
    }
    get length() {
        return this._length;
    }
    clear() {
        while (this._length > 0) {
            this.remove(this.begin());
        }
    }
    append(data) {
        return this._insertAt(data, this._head);
    }
    prepend(data) {
        return this._insertAt(data, this._head.next);
    }
    removeAndAppend(it) {
        this._move(it, this._head);
    }
    removeAndPrepend(it) {
        this._move(it, this._head.next);
    }
    remove(it) {
        if (it.valid() && it.list === this) {
            const node = it.node;
            it.next();
            this._remove(node);
        }
    }
    insertAt(data, at) {
        if (at.list === this) {
            if (at.valid()) {
                if (at.reversed) {
                    return this._insertAt(data, at.node.next);
                }
                else {
                    return this._insertAt(data, at.node);
                }
            }
            else {
                return this.append(data);
            }
        }
        return null;
    }
    forEach(callback) {
        for (let it = this.begin(); it.valid(); it.next()) {
            callback && callback(it.data);
        }
    }
    forEachReverse(callback) {
        for (let it = this.rbegin(); it.valid(); it.next()) {
            callback && callback(it.data);
        }
    }
    front() {
        return this.begin().data;
    }
    back() {
        return this.rbegin().data;
    }
    begin() {
        return new ListIterator(this, this._length > 0 ? this._head.next : this._head, false);
    }
    rbegin() {
        return new ListIterator(this, this._length > 0 ? this._head.prev : this._head, true);
    }
    _remove(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
        delete node.prev;
        delete node.next;
        this._length--;
    }
    _insertAt(data, node) {
        const newNode = new ListNode(data);
        newNode.next = node;
        newNode.prev = node.prev;
        node.prev.next = newNode;
        node.prev = newNode;
        this._length++;
        return new ListIterator(this, newNode, false);
    }
    _move(iter, at) {
        const node = iter.node;
        node.prev.next = node.next;
        node.next.prev = node.prev;
        node.next = at;
        node.prev = at.prev;
        at.prev.next = node;
        at.prev = node;
    }
}
class ListNodeImpl {
    next;
    prev;
    constructor() {
        this.next = this;
        this.prev = this;
    }
}
class ListNode extends ListNodeImpl {
    data;
    constructor(data) {
        super();
        this.data = data;
    }
}

export { List, ListIterator };
//# sourceMappingURL=linkedlist.js.map
