import { RenderScheme } from './renderscheme';
import { ForwardRenderPass } from './forward_pass';
import { ForwardMultiRenderPass } from './forward_multi_pass';
import { ShadowMapPass } from './shadowmap_pass';
import type { Device, FrameBuffer } from '../../device';
import type { Scene } from '../scene';
import type { Camera } from '../camera';
export declare class ForwardRenderScheme extends RenderScheme {
    constructor(device: Device);
    get scenePass(): ForwardRenderPass | ForwardMultiRenderPass;
    get shadowMapPass(): ShadowMapPass;
    protected _renderScene(scene: Scene, camera: Camera): void;
    protected _renderSceneToTexture(scene: Scene, camera: Camera, frameBuffer: FrameBuffer): void;
    protected _renderSceneToCubeTexture(scene: Scene, camera: Camera, frameBuffer: FrameBuffer): void;
    protected _dispose(): void;
}
