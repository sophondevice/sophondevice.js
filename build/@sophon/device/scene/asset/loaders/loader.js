/** sophon base library */
class LoaderBase {
    _urlResolver;
    constructor() {
        this._urlResolver = null;
    }
    get urlResolver() {
        return this._urlResolver;
    }
    set urlResolver(resolver) {
        this._urlResolver = resolver;
    }
    async request(url, headers = {}, crossOrigin = 'anonymous') {
        url = this._urlResolver ? this._urlResolver(url) : null;
        return url ? fetch(url, {
            credentials: crossOrigin === 'anonymous' ? 'same-origin' : 'include',
            headers: headers
        }) : null;
    }
}
class AbstractTextureLoader extends LoaderBase {
}
class AbstractModelLoader extends LoaderBase {
}

export { AbstractModelLoader, AbstractTextureLoader, LoaderBase };
//# sourceMappingURL=loader.js.map
