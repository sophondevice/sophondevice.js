export class ShadowImpl {
    _resourceDirty;
    constructor() {
        this._resourceDirty = true;
    }
    invalidateResource() {
        this._resourceDirty = true;
    }
    updateResources(shadowMapper) {
        if (this._resourceDirty) {
            this.doUpdateResources(shadowMapper);
            this._resourceDirty = false;
        }
    }
}
//# sourceMappingURL=shadow_impl.js.map