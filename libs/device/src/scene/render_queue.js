export class RenderQueue {
    _itemLists;
    _renderPass;
    constructor(renderPass) {
        this._itemLists = {};
        this._renderPass = renderPass;
    }
    get renderPass() {
        return this._renderPass;
    }
    get items() {
        return this._itemLists;
    }
    getMaxBatchSize(device) {
        return device.getShaderCaps().maxUniformBufferSize / 64;
    }
    push(camera, drawable, renderOrder) {
        if (drawable) {
            let itemList = this._itemLists[renderOrder];
            if (!itemList) {
                itemList = {
                    opaqueList: [],
                    opaqueInstanceList: {},
                    transList: [],
                    transInstanceList: {},
                };
                this._itemLists[renderOrder] = itemList;
            }
            const trans = drawable.isTransparency();
            const list = trans ? itemList.transList : itemList.opaqueList;
            if (drawable.isBatchable()) {
                const instanceList = trans ? itemList.transInstanceList : itemList.opaqueInstanceList;
                const hash = drawable.getInstanceId(this._renderPass);
                const index = instanceList[hash];
                if (index === undefined || list[index].instanceData.worldMatrices.length === this.getMaxBatchSize(camera.scene.device)) {
                    instanceList[hash] = list.length;
                    list.push({
                        drawable,
                        sortDistance: drawable.getSortDistance(camera),
                        instanceData: {
                            worldMatrices: [drawable.getXForm().worldMatrix],
                            hash: hash,
                        }
                    });
                }
                else {
                    list[index].instanceData.worldMatrices.push(drawable.getXForm().worldMatrix);
                }
            }
            else {
                list.push({
                    drawable,
                    sortDistance: drawable.getSortDistance(camera),
                    instanceData: null,
                });
            }
        }
    }
    clear() {
        this._itemLists = {};
    }
    sortItems() {
        for (const list of Object.values(this._itemLists)) {
            list.opaqueList.sort((a, b) => a.sortDistance - b.sortDistance);
            list.transList.sort((a, b) => b.sortDistance - a.sortDistance);
        }
    }
}
//# sourceMappingURL=render_queue.js.map