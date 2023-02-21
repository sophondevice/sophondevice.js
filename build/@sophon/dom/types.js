/** sophon base library */
class GUIEventPath {
    path;
    constructor() {
        this.path = [];
    }
    toArray() {
        return this.path;
    }
}
class GUIEventPathBuilder {
    build(node) {
        const path = new GUIEventPath();
        let el = node;
        while (el) {
            path.path.push(el);
            el = el.parentNode || el.gui || null;
        }
        return path;
    }
}

export { GUIEventPathBuilder };
//# sourceMappingURL=types.js.map
