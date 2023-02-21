/** sophon base library */
import { RNode } from './node.js';
import { RAttributeChangeEvent } from './events.js';
import { RStaticNodeList } from './nodelist.js';

class RClassList {
    static _elementMap = new WeakMap();
    _classList;
    _value;
    _valueChanged;
    _changeEvent;
    constructor(el) {
        this._classList = [];
        this._value = '';
        this._valueChanged = false;
        this._changeEvent = new RAttributeChangeEvent('class', false);
        const proxy = new Proxy(this, {
            get: function (target, name) {
                if (typeof name === 'string' && /^\d+$/.test(name)) {
                    return target._classList[parseInt(name)];
                }
                else {
                    return target[name];
                }
            },
        });
        RClassList._elementMap.set(proxy, el);
        return proxy;
    }
    get value() {
        if (this._valueChanged) {
            this._valueChanged = false;
            this._value = this._classList.join(' ');
        }
        return this._value;
    }
    set value(val) {
        this._setValue(val, true);
    }
    get length() {
        return this._classList.length;
    }
    _setValue(val, dispatch) {
        this._classList = val.split(/\s+/).filter((value) => !!value);
        this._valueChanged = true;
        if (dispatch) {
            this._notify();
        }
    }
    _notify() {
        const el = RClassList._elementMap.get(this);
        el.dispatchEvent(this._changeEvent);
    }
    add(...args) {
        let changed = false;
        for (const arg of args) {
            if (arg && typeof arg === 'string') {
                const classes = arg.split(/\s+/);
                classes.forEach((cls) => {
                    if (this._classList.indexOf(cls) < 0) {
                        this._classList.push(cls);
                        changed = true;
                    }
                });
            }
        }
        if (changed) {
            this._valueChanged = true;
            this._notify();
        }
    }
    remove(...args) {
        let changed = false;
        for (const arg of args) {
            if (arg && typeof arg === 'string') {
                const classes = arg.split(/\s+/);
                classes.forEach((cls) => {
                    const index = this._classList.indexOf(cls);
                    if (index >= 0) {
                        this._classList.splice(index, 1);
                        changed = true;
                    }
                });
            }
        }
        if (changed) {
            this._valueChanged = true;
            this._notify();
        }
    }
    toggle(className) {
        this._valueChanged = true;
        const index = this._classList.indexOf(className);
        if (index >= 0) {
            this._classList.splice(index, 1);
            this._notify();
            return false;
        }
        else {
            this._classList.push(className);
            this._notify();
            return true;
        }
    }
    contains(className) {
        return this._classList.indexOf(className) >= 0;
    }
    replace(oldClassName, newClassName) {
        if (newClassName !== oldClassName) {
            if (!oldClassName || oldClassName.indexOf(' ') >= 0) {
                throw new Error('Failed to replace class: old class name is invalid');
            }
            oldClassName = oldClassName.trim();
            if (oldClassName === '') {
                throw new Error('Failed to replace class: old class name is empty');
            }
            const index = this._classList.indexOf(oldClassName);
            if (index < 0) {
                throw new Error('Failed to replace class: old class name not exists');
            }
            newClassName = newClassName || '';
            newClassName = newClassName.trim();
            const newClassNames = newClassName.split(/\s+/).filter((val) => !!val);
            this._classList.splice(index, 1, ...newClassNames);
            this._notify();
        }
    }
}
class RElement extends RNode {
    _tagname;
    _attributes;
    _classList;
    _attrChangeEvent;
    constructor(uiscene) {
        super(uiscene);
        this._tagname = null;
        this._attributes = {};
        this._classList = new RClassList(this);
        this._attrChangeEvent = new RAttributeChangeEvent('', false);
        this.addDefaultEventListener(RAttributeChangeEvent.NAME, (e) => {
            const data = e;
            if (data.name === 'class') {
                this._uiscene._markStyleRefreshForElement(this);
            }
        });
    }
    get children() {
        return this._childrenElements;
    }
    get childElementCount() {
        return this._childrenElements.length;
    }
    get nodeType() {
        return RNode.ELEMENT_NODE;
    }
    get localName() {
        return this._tagname;
    }
    get tagName() {
        return this._tagname;
    }
    get id() {
        return this._attributes.id || '';
    }
    set id(id) {
        this._attributes.id = id || '';
    }
    get classList() {
        return this._classList;
    }
    get className() {
        return this._classList.value;
    }
    get attributes() {
        const result = [];
        for (const name in this._attributes) {
            result.push({ name: name, value: this._attributes[name] });
        }
        return result;
    }
    get firstElementChild() {
        return this._getFirstChild(true);
    }
    get lastElementChild() {
        return this._getLastChild(true);
    }
    get nextElementSibling() {
        return this._getNextSibling(true);
    }
    get previousElementSibling() {
        return this._getPreviousSibling(true);
    }
    getAttribute(k) {
        if (k) {
            k = k.toLowerCase();
            return k === 'class'
                ? this._classList.value
                : (this._attributes && this._attributes[k]) || null;
        }
        return null;
    }
    setAttribute(k, v) {
        if (k) {
            v = v || null;
            k = k.toLowerCase();
            if (this._attributes[k] !== v) {
                this._attributes[k] = v;
                if (k === 'class') {
                    this._classList._setValue(v || '', false);
                }
                else if (k === 'style') {
                    this._uiscene._markStyleRefreshForElement(this);
                }
                this._attrChangeEvent.name = k;
                this._attrChangeEvent.removed = false;
                this.dispatchEvent(this._attrChangeEvent);
            }
        }
    }
    removeAttribute(k) {
        if (k) {
            k = k.toLowerCase();
            if (this._attributes[k] !== undefined) {
                delete this._attributes[k];
                if (k === 'style') {
                    this._uiscene._markStyleRefreshForElement(this);
                }
                this._attrChangeEvent.name = k;
                this._attrChangeEvent.removed = true;
                this.dispatchEvent(this._attrChangeEvent);
            }
        }
    }
    hasAttribute(k) {
        return k ? this._attributes[k.toLowerCase()] !== undefined : false;
    }
    hasAttributes() {
        return Object.getOwnPropertyNames(this._attributes).length !== 0;
    }
    insertAdjacentElement(position, element) {
        if (!element) {
            return null;
        }
        if (position === 'beforebegin') {
            this.before(element);
            return element;
        }
        else if (position === 'afterend') {
            this.after(element);
            return element;
        }
        else if (position === 'afterbegin') {
            this.prepend(element);
            return element;
        }
        else if (position === 'beforeend') {
            this.append(element);
            return element;
        }
        return null;
    }
    insertAdjacentText(position, text) {
        if (!text) {
            return null;
        }
        if (position === 'beforebegin') {
            this.before(text);
            return text;
        }
        else if (position === 'afterend') {
            this.after(text);
            return text;
        }
        else if (position === 'afterbegin') {
            this.prepend(text);
            return text;
        }
        else if (position === 'beforeend') {
            this.append(text);
            return text;
        }
        return null;
    }
    matches(selectorString) {
        return this.ownerDocument.querySelectorAll(selectorString).indexOf(this) >= 0;
    }
    cloneNode(deep) {
        const clone = this._uiscene.createElement(this.tagName);
        clone.classList._setValue(this.classList.value, false);
        clone._attributes = Object.assign({}, this._attributes);
        if (deep) {
            for (let child = this.firstChild; child; child = child.nextSibling) {
                clone.appendChild(child.cloneNode(deep));
            }
        }
        return clone;
    }
    replaceWith(...nodes) {
        this.before(...nodes);
        this.remove();
    }
    _updateStyle(val) {
        super._updateStyle(val);
        this._rawSetStyleAttribute(val);
    }
    _applyInlineStyles() {
        this.style.applyStyles(this.getAttribute('style') || '', true);
    }
    _getNumberAttribute(name, defaultValue) {
        const val = this.getAttribute(name);
        const num = val === null ? defaultValue : Number(val);
        return Number.isNaN(num) ? defaultValue : num;
    }
    _setNumberAttribute(name, val) {
        this.setAttribute(name, String(val));
    }
    _getStringAttribute(name, defaultValue) {
        const val = this.getAttribute(name);
        return val ? String(val) : defaultValue;
    }
    _setStringAttribute(name, val) {
        this.setAttribute(name, String(val));
    }
    _rawSetStyleAttribute(style) {
        style = style || '';
        if (this._attributes['style'] !== style) {
            this._attributes['style'] = style;
            this._attrChangeEvent.name = 'style';
            this._attrChangeEvent.removed = false;
            this.dispatchEvent(this._attrChangeEvent);
        }
    }
    _setTagName(name) {
        this._tagname = name;
    }
    remove() {
        this._remove();
        return this;
    }
    before(...nodes) {
        this._before(...nodes);
    }
    after(...nodes) {
        this._after(...nodes);
    }
    append(...nodes) {
        this._append(...nodes);
    }
    prepend(...nodes) {
        this._prepend(...nodes);
    }
    querySelectorAll(selectors) {
        return new RStaticNodeList(this._uiscene._querySelectorAll(this, selectors, true, false));
    }
    querySelector(selectors) {
        return this._uiscene._querySelectorOne(this, selectors, true, false);
    }
    getElementById(id) {
        for (let child = this.firstElementChild; child; child = child.nextElementSibling) {
            const el = this._uiscene._getElementById(child, id);
            if (el) {
                return el;
            }
        }
        return null;
    }
    getElementsByTagName(tagName) {
        const results = [];
        for (let child = this.firstElementChild; child; child = child.nextElementSibling) {
            this._uiscene._getElementsByTagName(child, tagName, results);
        }
        return new RStaticNodeList(results);
    }
    getElementsByClassName(classnames) {
        const results = [];
        classnames = classnames || '';
        const classNameList = classnames.split(/\s+/).filter((val) => !!val);
        if (classNameList.length > 0) {
            for (let child = this.firstElementChild; child; child = child.nextElementSibling) {
                this._uiscene._getElementsByClassName(child, classNameList, results);
            }
        }
        return new RStaticNodeList(results);
    }
}

export { RClassList, RElement };
//# sourceMappingURL=element.js.map
