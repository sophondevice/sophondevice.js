export class PBReflection {
    _builder;
    _tagList;
    _attribList;
    constructor(builder) {
        this._builder = builder;
        this._tagList = {};
        this._attribList = {};
    }
    get vertexAttributes() {
        return this._builder.getVertexAttributes();
    }
    hasVertexAttribute(attrib) {
        return this.vertexAttributes.indexOf(attrib) >= 0;
    }
    clear() {
        this._tagList = {};
        this._attribList = {};
    }
    tag(arg0, arg1) {
        if (typeof arg0 === 'string') {
            if (arg1 === undefined) {
                return this.getTag(arg0);
            }
            else {
                this.addTag(arg0, arg1);
            }
        }
        else {
            for (const k of Object.keys(arg0)) {
                this.addTag(k, arg0[k]);
            }
        }
    }
    attribute(attrib) {
        return this._attribList[attrib] || null;
    }
    setAttrib(attrib, exp) {
        this._attribList[attrib] = exp;
    }
    addTag(name, exp) {
        this._tagList[name] = exp;
    }
    getTag(name) {
        const getter = this._tagList[name];
        return getter ? getter(this._builder.globalScope) : null;
    }
}
//# sourceMappingURL=reflection.js.map