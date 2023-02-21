import { Device, FrameBuffer, TextureFormat } from '../../device';
import type { Camera } from '../camera';
import type { Scene } from '../scene';
export declare abstract class RenderScheme {
    protected _device: Device;
    protected _shadowMapFormat: TextureFormat;
    constructor(device: Device);
    get device(): Device;
    renderScene(scene: Scene, camera: Camera): void;
    renderSceneToTexture(scene: Scene, camera: Camera, frameBuffer: FrameBuffer): void;
    renderSceneToCubeTexture(scene: Scene, camera: Camera, frameBuffer: FrameBuffer): void;
    dispose(): void;
    getShadowMapFormat(): TextureFormat;
    protected abstract _renderScene(scene: Scene, camera: Camera): any;
    protected abstract _renderSceneToTexture(scene: Scene, camera: Camera, frameBuffer: FrameBuffer): any;
    protected abstract _renderSceneToCubeTexture(scene: Scene, camera: Camera, frameBuffer: FrameBuffer): any;
    protected abstract _dispose(): any;
}
