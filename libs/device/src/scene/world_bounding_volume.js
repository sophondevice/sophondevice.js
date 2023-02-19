export class WorldBoundingVolume {
    static _tagCounter = 1;
    _node;
    _local;
    _world;
    _transformTag;
    _bvTag;
    _tag;
    constructor(local, node) {
        this._world = this._local = local || null;
        this._node = node || null;
        this._transformTag = 0;
        this._bvTag = this._local ? this._local.getTag() : 0;
        this._tag = 0;
    }
    static _fetchTag() {
        return this._tagCounter++;
    }
}
//# sourceMappingURL=world_bounding_volume.js.map