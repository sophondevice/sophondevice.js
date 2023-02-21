/** sophon base library */
class AddLight {
    node;
    constructor(node) {
        this.node = node || null;
    }
}
class RemoveLight {
    node;
    constructor(node) {
        this.node = node || null;
    }
}
class CameraChange {
    camera;
    constructor(camera) {
        this.camera = camera || null;
    }
}

export { AddLight, CameraChange, RemoveLight };
//# sourceMappingURL=events.js.map
