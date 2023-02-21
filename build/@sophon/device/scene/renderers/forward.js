/** sophon base library */
import { RenderScheme } from './renderscheme.js';
import { ForwardRenderPass } from './forward_pass.js';
import { ForwardMultiRenderPass } from './forward_multi_pass.js';
import { ShadowMapPass } from './shadowmap_pass.js';

class ForwardRenderScheme extends RenderScheme {
    _scenePass;
    _shadowMapPass;
    constructor(device) {
        super(device);
        this._scenePass = device.getDeviceType() === 'webgl' ? new ForwardMultiRenderPass(this, '') : new ForwardRenderPass(this, '');
        this._shadowMapPass = new ShadowMapPass(this, '');
        this._shadowMapPass.mainPass = this._scenePass;
    }
    get scenePass() {
        return this._scenePass;
    }
    get shadowMapPass() {
        return this._shadowMapPass;
    }
    _renderScene(scene, camera) {
        this._shadowMapPass.render(scene, camera);
        this._scenePass.render(scene, camera);
    }
    _renderSceneToTexture(scene, camera, frameBuffer) {
        this._shadowMapPass.render(scene, camera);
        this._scenePass.renderToTexture(scene, camera, frameBuffer);
    }
    _renderSceneToCubeTexture(scene, camera, frameBuffer) {
        this._shadowMapPass.render(scene, camera);
        this._scenePass.renderToCubeTexture(scene, camera, frameBuffer);
    }
    _dispose() {
        this._scenePass.dispose();
        this._scenePass = null;
        this._shadowMapPass.dispose();
        this._shadowMapPass = null;
    }
}

export { ForwardRenderScheme };
//# sourceMappingURL=forward.js.map
