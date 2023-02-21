/** sophon base library */
import { TextureFormat } from '../../device/base_types.js';
import '../../device/gpuobject.js';
import '../../device/render_states.js';
import '@sophon/base';
import '../asset/assetmanager.js';
import '../../device/builder/ast.js';
import '../../device/builder/types.js';
import '../../device/builder/builtinfunc.js';
import '../../device/builder/constructors.js';
import '../../device/webgl/utils.js';
import '../../device/webgl/webgl_enum.js';
import '../../device/webgl/constants_webgl.js';
import '../../device/webgl/renderstate_webgl.js';
import '../../device/webgpu/constants_webgpu.js';
import '../../device/webgpu/structuredbuffer_webgpu.js';
import '../../device/webgpu/renderstates_webgpu.js';
import '../../device/webgpu/utils_webgpu.js';

class RenderScheme {
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

export { RenderScheme };
//# sourceMappingURL=renderscheme.js.map
