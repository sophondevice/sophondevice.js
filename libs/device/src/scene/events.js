export class AddLight {
    node;
    constructor(node) {
        this.node = node || null;
    }
}
export class RemoveLight {
    node;
    constructor(node) {
        this.node = node || null;
    }
}
export class CameraChange {
    camera;
    constructor(camera) {
        this.camera = camera || null;
    }
}
//# sourceMappingURL=events.js.map