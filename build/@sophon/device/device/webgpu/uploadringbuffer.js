/** sophon base library */
class UploadRingBuffer {
    _device;
    _bufferList;
    _defaultSize;
    _unmappedBufferList;
    constructor(device, defaultSize = 64 * 1024) {
        this._device = device;
        this._bufferList = [];
        this._defaultSize = defaultSize;
        this._unmappedBufferList = [];
    }
    uploadBuffer(src, dst, srcOffset, dstOffset, uploadSize, allowOverlap) {
        const size = (uploadSize + 3) & ~3;
        const mappedBuffer = this.fetchBufferMapped(size, !!allowOverlap);
        if (src) {
            const mappedRange = mappedBuffer.mappedRange;
            new Uint8Array(mappedRange, mappedBuffer.offset, size).set(new Uint8Array(src, srcOffset, uploadSize));
        }
        const upload = {
            mappedBuffer: { ...mappedBuffer },
            uploadSize: size,
            uploadBuffer: dst,
            uploadOffset: dstOffset,
        };
        mappedBuffer.offset += size;
        mappedBuffer.offset = (mappedBuffer.offset + 7) & ~7;
        return upload;
    }
    beginUploads() {
        for (let i = this._bufferList.length - 1; i >= 0; i--) {
            const buffer = this._bufferList[i];
            if (buffer.used) {
                buffer.buffer.unmap();
                this._unmappedBufferList.push(buffer);
                this._bufferList.splice(i, 1);
                buffer.mappedRange = null;
            }
        }
        return this._unmappedBufferList.length;
    }
    endUploads() {
        for (const buffer of this._unmappedBufferList) {
            buffer.buffer.mapAsync(GPUMapMode.WRITE).then(() => {
                buffer.offset = 0;
                buffer.used = false;
                buffer.mappedRange = buffer.buffer.getMappedRange();
                this._bufferList.push(buffer);
            });
        }
        this._unmappedBufferList = [];
    }
    purge() {
        for (let i = this._bufferList.length - 1; i >= 0; i--) {
            const buffer = this._bufferList[i];
            if (buffer.mappedRange) {
                buffer.buffer.unmap();
                buffer.buffer.destroy();
            }
        }
        this._bufferList = [];
        for (const buffer of this._unmappedBufferList) {
            buffer.buffer.destroy();
        }
        this._unmappedBufferList = [];
    }
    fetchBufferMapped(size, allowOverlap) {
        for (const buffer of this._bufferList) {
            if (allowOverlap || buffer.size - buffer.offset >= size) {
                buffer.used = true;
                return buffer;
            }
        }
        const bufferSize = (Math.max(size, this._defaultSize) + 3) & ~3;
        const buf = this._device.device.createBuffer({
            label: `StagingRingBuffer${this._bufferList.length}:${bufferSize}`,
            size: bufferSize,
            usage: GPUBufferUsage.MAP_WRITE | GPUBufferUsage.COPY_SRC,
            mappedAtCreation: true
        });
        this._bufferList.push({
            buffer: buf,
            size: bufferSize,
            offset: 0,
            used: true,
            mappedRange: buf.getMappedRange(),
        });
        return this._bufferList[this._bufferList.length - 1];
    }
}

export { UploadRingBuffer };
//# sourceMappingURL=uploadringbuffer.js.map
