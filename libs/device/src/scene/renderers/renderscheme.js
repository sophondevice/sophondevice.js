import { TextureFormat } from '../../device';
export class RenderScheme {
    _device;
    _shadowMapFormat;
    constructor(device) {
        this._device = device;
        this._shadowMapFormat = device.getTextureCaps().supportHalfFloatColorBuffer
            ? device.getDeviceType() === 'webgl' ? TextureFormat.RGBA16F : TextureFormat.R16F
            : device.getTextureCaps().supportFloatColorBuffer
                ? device.getDeviceType() === 'webgl' ? TextureFormat.RGBA32F : TextureFormat.R32F
                : TextureFormat.RGBA8UNORM;
    }
    get device() {
        return this._device;
    }
    renderScene(scene, camera) {
        scene.frameUpdate(camera);
        if (camera && !scene.device.isContextLost()) {
            this._renderScene(scene, camera);
        }
    }
    renderSceneToTexture(scene, camera, frameBuffer) {
        scene.frameUpdate(camera);
        if (camera && !scene.device.isContextLost()) {
            this._renderSceneToTexture(scene, camera, frameBuffer);
        }
    }
    renderSceneToCubeTexture(scene, camera, frameBuffer) {
        scene.frameUpdate(camera);
        if (camera && !scene.device.isContextLost()) {
            this._renderSceneToCubeTexture(scene, camera, frameBuffer);
        }
    }
    dispose() {
        this._dispose();
    }
    getShadowMapFormat() {
        return this._shadowMapFormat;
    }
}
//# sourceMappingURL=renderscheme.js.map