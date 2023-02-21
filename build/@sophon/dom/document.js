/** sophon base library */
import { RNode } from './node.js';
import { RStaticNodeList } from './nodelist.js';

class RDocument extends RNode {
    _textContent;
    constructor(uiscene) {
        super(uiscene);
        this._textContent = '';
    }
    get nodeType() {
        return RNode.DOCUMENT_NODE;
    }
    get nodeName() {
        return '#document';
    }
    get head() {
        return this.querySelector('head');
    }
    get body() {
        return this.querySelector('body');
    }
    get baseURI() {
        return this._uiscene.baseURI;
    }
    set baseURI(val) {
        this._uiscene.baseURI = val;
    }
    get textContent() {
        return this._textContent;
    }
    set textContent(val) {
        this._textContent = val;
    }
    get documentElement() {
        return this.firstElementChild || null;
    }
    get children() {
        return this._childrenElements;
    }
    get childElementCount() {
        return this._childrenElements.length;
    }
    get firstElementChild() {
        return this._getFirstChild(true);
    }
    get lastElementChild() {
        return this._getLastChild(true);
    }
    appendChild(child) {
        if (child.nodeType !== RNode.ELEMENT_NODE) {
            throw new Error('Failed to execute appendChild: only element can be inserted into document');
        }
        else if (this.childElementCount > 0) {
            throw new Error('Failed to execute appendChild: only one element can be inserted into document');
        }
        return super.appendChild(child);
    }
    insertBefore(newElement, referenceElement) {
        if (!newElement || newElement.nodeType !== RNode.ELEMENT_NODE) {
            throw new Error('Failed to execute insertBefore: only element can be inserted into document');
        }
        else if (referenceElement || this.childElementCount > 0) {
            throw new Error('Failed to execute insertBefore: only one element can be inserted into document');
        }
        return super.appendChild(newElement);
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
    getElementsByTagName(tagname) {
        const results = [];
        for (let child = this.firstElementChild; child; child = child.nextElementSibling) {
            this._uiscene._getElementsByTagName(child, tagname, results);
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
    getElementById(id) {
        return this._uiscene._getElementById(this, id);
    }
    createElement(tagname) {
        return this._uiscene.createElement(tagname);
    }
    createTextNode() {
        return this._uiscene.createTextNode();
    }
    _getDefaultStyleSheet() {
        return {
            position: 'absolute',
            flexDirection: 'column',
            left: '0px',
            top: '0px',
            right: '0px',
            bottom: '0px',
            overflow: 'auto',
            backgroundColor: 'rgba(0,0,0,0)',
        };
    }
}

export { RDocument };
//# sourceMappingURL=document.js.map
