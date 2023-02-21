/** sophon base library */
import { List } from '@sophon/base';
import { RNode } from './node.js';

const rIdentifier = /^([^\s.*[\]|()$^+#><~!=:]+)/;
const rOp = /^\s*(=|~=|\|=|\^=|\$=|\*=)?\s*/;
const rCombine = /^\s*([>|~|+]?)\s*/;
const rLiteral = /^"(.*)"|'(.*)'/;
const rCloseBracket = /^\s*\]/;
const rWS = /^\s*$/;
class Rule {
    filters;
    targets;
    specificity;
    constructor() {
        this.filters = new List();
        this.targets = new Set();
        this.specificity = 0;
    }
    resolve(roots, up, allowInternal, pseudoElementCallback) {
        const allElements = new Set();
        roots.forEach((root) => {
            this._traverseElement(root, allowInternal, (el) => {
                allElements.add(el);
            });
            if (up) {
                let p = root.parentNode;
                while (p) {
                    if (allowInternal || p.nodeType === RNode.ELEMENT_NODE) {
                        allElements.add(p);
                    }
                    p = p.parentNode;
                }
            }
        });
        this.targets = new Set(allElements);
        for (const it = this.filters.begin(); it.valid(); it.next()) {
            let tmp = new Set();
            if (it.data.type != 4) {
                this.targets.forEach((el) => {
                    this._walkWithFilter(it, el, tmp, allowInternal, allElements, pseudoElementCallback);
                });
                const t = this.targets;
                this.targets = tmp;
                tmp = t;
                tmp.clear();
            }
        }
    }
    _traverseElement(element, allowInternal, cb) {
        if (allowInternal || !element._isInternal()) {
            if (allowInternal || element.nodeType === RNode.ELEMENT_NODE) {
                cb(element);
            }
            const children = element._getChildren();
            children.forEach((child) => this._traverseElement(child, allowInternal, cb));
        }
    }
    _check(filter, element) {
        switch (filter.type) {
            case 1:
                return (element.nodeType === RNode.ELEMENT_NODE && element.tagName === filter.name);
            case 2:
                return (element.nodeType === RNode.ELEMENT_NODE &&
                    element.classList.contains(filter.name));
            case 3:
                return element.nodeType === RNode.ELEMENT_NODE && element.id === filter.name;
            case 5: {
                if (element.nodeType === RNode.ELEMENT_NODE) {
                    const val = element.getAttribute(filter.attribKey);
                    switch (filter.attribOp) {
                        case 0:
                            return val !== undefined;
                        case 2:
                            return typeof val === 'string' && val.indexOf(filter.attribValue) >= 0;
                        case 1:
                            return val === filter.attribValue;
                        case 3:
                            return typeof val === 'string' && val.indexOf(filter.attribValue) === 0;
                        case 4:
                            return (typeof val === 'string' &&
                                val.length >= filter.attribValue.length &&
                                val.substr(-filter.attribValue.length) === filter.attribValue);
                        default:
                            return false;
                    }
                }
                else {
                    return false;
                }
            }
            case 6: {
                switch (filter.name) {
                    case 'hover':
                        return element._isHover();
                    case 'active':
                        return element._isActive();
                    case 'disabled':
                        return false;
                    case 'empty':
                        return element.childNodes.length === 0;
                    case 'enabled':
                        return true;
                    case 'first-child':
                        return !element.previousSibling;
                    case 'last-child':
                        return !element.nextSibling;
                    case 'only-child':
                        return !element.previousSibling && !element.nextSibling;
                    case 'focus':
                        return element.gui.getFocus() === element;
                    case 'focus-within':
                        return !!element.gui.getFocus()?._isSucceedingOf(element);
                    default:
                        return false;
                }
            }
            case 0:
                return true;
            default:
                return false;
        }
    }
    _walkWithFilter(filter, last, targets, allowInternal, elementSet, pseudoElementCallback) {
        const prevIt = filter.getPrev();
        const lastFilter = prevIt.valid() ? prevIt.data : null;
        switch (filter.data.type) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 6:
            case 5: {
                if (lastFilter === null || lastFilter.type !== 4) {
                    if (this._check(filter.data, last)) {
                        targets.add(last);
                    }
                }
                else if (lastFilter) {
                    switch (lastFilter.combineType) {
                        case 2: {
                            last._getChildren().forEach((child) => {
                                if (child.nodeType === RNode.ELEMENT_NODE &&
                                    elementSet.has(child) &&
                                    this._check(filter.data, child)) {
                                    targets.add(child);
                                }
                            });
                            break;
                        }
                        case 1: {
                            last._getChildren().forEach((child) => {
                                if (child.nodeType === RNode.ELEMENT_NODE) {
                                    this._traverseElement(child, allowInternal, (el) => {
                                        if (elementSet.has(el) && this._check(filter.data, el)) {
                                            targets.add(el);
                                        }
                                    });
                                }
                            });
                            break;
                        }
                        case 3: {
                            let next = last.nextSibling;
                            while (next) {
                                if (next.nodeType === RNode.ELEMENT_NODE &&
                                    elementSet.has(next) &&
                                    this._check(filter.data, next)) {
                                    targets.add(next);
                                }
                                next = next.nextSibling;
                            }
                            break;
                        }
                        case 4: {
                            const next = last.nextSibling;
                            if (next &&
                                next.nodeType === RNode.ELEMENT_NODE &&
                                elementSet.has(next) &&
                                this._check(filter.data, next)) {
                                targets.add(next);
                            }
                            break;
                        }
                    }
                }
                break;
            }
            case 7: {
                if (pseudoElementCallback &&
                    lastFilter &&
                    lastFilter.type !== 4 &&
                    !filter.getNext().valid()) {
                    pseudoElementCallback(last, filter.data.name);
                }
                break;
            }
        }
    }
}
class RSelector {
    _rules;
    constructor(s) {
        this._rules = s ? this._createRules(s) : [];
        if (this._rules.some((rule) => !this._validateRule(rule))) {
            this._rules = [];
        }
    }
    resolve(root, excludeRoot, allowInternal) {
        if (this._rules.length === 0) {
            return [];
        }
        const matched = new Set();
        this._rules.forEach((rule) => {
            rule.resolve([root], false, allowInternal);
            rule.targets.forEach((t) => {
                matched.add(t);
            });
        });
        if (excludeRoot) {
            matched.delete(root);
        }
        return Array.from(matched);
    }
    multiResolve(roots, allowInternal) {
        if (this._rules.length === 0) {
            return [];
        }
        const matched = new Set();
        this._rules.forEach((rule) => {
            rule.resolve(roots, true, allowInternal);
            rule.targets.forEach((t) => {
                matched.add(t);
            });
        });
        return Array.from(matched);
    }
    rules() {
        return this._rules;
    }
    _validateRule(rule) {
        for (const it = rule.filters.begin(); it.valid(); it.next()) {
            const prev = it.getPrev();
            if (it.data.type === 4 && prev.valid() && prev.data.type === 4) {
                return false;
            }
        }
        return true;
    }
    _createRules(s) {
        return s
            .trim()
            .split(',')
            .map((val) => val.trim())
            .filter((val) => val !== '')
            .map((val) => this._createRule(val))
            .filter((val) => !!val)
            .sort((a, b) => a.specificity - b.specificity);
    }
    _createRule(s) {
        const rule = new Rule();
        let numIds = 0;
        let numClasses = 0;
        let numTypes = 0;
        for (;;) {
            const filter = this._createFilter(s);
            if (filter === null) {
                return null;
            }
            else if (filter[0] === null) {
                break;
            }
            else {
                rule.filters.append(filter[0]);
                s = filter[1];
                numIds += filter[0].numIds;
                numClasses += filter[0].numClasses;
                numTypes += filter[0].numTypes;
            }
        }
        const base = 100;
        rule.specificity = numIds * base * base + numClasses * base + numTypes;
        return rule;
    }
    _createFilter(s) {
        if (rWS.exec(s)) {
            return [null, ''];
        }
        const info = { numIds: 0, numClasses: 0, numTypes: 0 };
        let combine = rCombine.exec(s);
        if (combine && combine[0] === '') {
            combine = null;
        }
        if (!combine) {
            info.combineType = 0;
            s = s.trim();
            switch (s[0]) {
                case '*': {
                    info.type = 0;
                    s = s.substr(1);
                    break;
                }
                case '.': {
                    info.numClasses++;
                    info.type = 2;
                    s = s.substr(1);
                    const match = rIdentifier.exec(s);
                    if (!match) {
                        return null;
                    }
                    info.name = match[1];
                    s = s.substr(match[0].length);
                    break;
                }
                case '#': {
                    info.numIds++;
                    info.type = 3;
                    s = s.substr(1);
                    const match = rIdentifier.exec(s);
                    if (!match) {
                        return null;
                    }
                    info.name = match[1];
                    s = s.substr(match[0].length);
                    break;
                }
                case ':': {
                    info.numClasses++;
                    if (s[1] !== ':') {
                        info.type = 6;
                        s = s.substr(1);
                        const match = rIdentifier.exec(s);
                        if (!match) {
                            return null;
                        }
                        info.name = match[1];
                        s = s.substr(match[0].length);
                    }
                    else {
                        info.type = 7;
                        s = s.substr(2);
                        const match = rIdentifier.exec(s);
                        if (!match) {
                            return null;
                        }
                        info.name = match[1];
                        s = s.substr(match[0].length);
                    }
                    break;
                }
                case '[': {
                    info.numClasses++;
                    info.type = 5;
                    s = s.substr(1);
                    const matchKey = rIdentifier.exec(s);
                    if (!matchKey) {
                        return null;
                    }
                    info.attribKey = matchKey[1];
                    s = s.substr(matchKey[0].length);
                    const matchOp = rOp.exec(s);
                    if (!matchOp) {
                        return null;
                    }
                    switch (matchOp[1]) {
                        case '=':
                            info.attribOp = 1;
                            break;
                        case '~=':
                        case '*=':
                            info.attribOp = 2;
                            break;
                        case '|=':
                        case '^=':
                            info.attribOp = 3;
                            break;
                        case '$=':
                            info.attribOp = 4;
                            break;
                        default:
                            info.attribOp = 0;
                            break;
                    }
                    s = s.substr(matchOp[0].length);
                    if (info.attribOp !== 0) {
                        const matchValue = (s[0] === "'" || s[0] === '"' ? rLiteral : rIdentifier).exec(s);
                        if (!matchValue) {
                            return null;
                        }
                        info.attribValue = matchValue[1] || matchValue[2];
                        s = s.substr(matchValue[0].length);
                    }
                    const matchCloseBracket = rCloseBracket.exec(s);
                    if (!matchCloseBracket) {
                        return null;
                    }
                    s = s.substr(matchCloseBracket[0].length);
                    break;
                }
                default: {
                    info.numTypes++;
                    info.type = 1;
                    const match = rIdentifier.exec(s);
                    if (!match) {
                        return null;
                    }
                    info.name = match[1];
                    s = s.substr(match[0].length);
                    break;
                }
            }
        }
        else {
            s = s.substr(combine[0].length);
            info.type = 4;
            if (combine[1] === '') {
                info.combineType = 1;
            }
            else if (combine[1] === '>') {
                info.combineType = 2;
            }
            else if (combine[1] === '~') {
                info.combineType = 3;
            }
            else {
                info.combineType = 4;
            }
        }
        return [info, s];
    }
}

export { RSelector, Rule };
//# sourceMappingURL=selector.js.map
