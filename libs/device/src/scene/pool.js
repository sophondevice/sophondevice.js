export class BufferPool {
    static _uniformBufferFreeList = [];
    static _storageBufferFreeList = [];
    static allocUniformBuffer(size) {
        return this.allocBuffer(this._uniformBufferFreeList, size);
    }
    static freeUniformBuffer(buffer) {
        return this.freeBuffer(this._uniformBufferFreeList, buffer);
    }
    static allocStorageBuffer(size) {
        return this.allocBuffer(this._storageBufferFreeList, size);
    }
    static freeStorageBuffer(buffer) {
        return this.freeBuffer(this._storageBufferFreeList, buffer);
    }
    static purgeUniformBuffers() {
        for (const buffer of this._uniformBufferFreeList) {
            buffer.dispose();
        }
        this._uniformBufferFreeList = [];
    }
    static purgeStorageBuffers() {
        for (const buffer of this._storageBufferFreeList) {
            buffer.dispose();
        }
        this._storageBufferFreeList = [];
    }
    static allocBuffer(freeList, size) {
        const index = this.findLeastSize(freeList, size);
        if (index >= 0) {
            const buffer = freeList[index];
            freeList.splice(index, 1);
            return buffer;
        }
        return null;
    }
    static freeBuffer(freeList, buffer) {
        const index = freeList.length > 0 ? this.findLeastSize(freeList, buffer.byteLength) : -1;
        if (index >= 0) {
            freeList.splice(index, 0, buffer);
        }
        else {
            freeList.push(buffer);
        }
    }
    static findLeastSize(list, size) {
        let left = 0;
        let right = list.length - 1;
        while (left < right) {
            const mid = (left + right) >> 1;
            const midSize = list[mid].byteLength;
            if (midSize >= size) {
                right = mid;
            }
            else {
                left = mid + 1;
            }
        }
        return list[left].byteLength >= size ? left : -1;
    }
}
//# sourceMappingURL=pool.js.map