import type { Device, FrameBuffer, TextureFormat } from '@sophon/device';
import type { Camera } from '../camera';
import type { Scene } from '../scene';

export abstract class RenderScheme {
  protected _device: Device;
  protected _shadowMapFormat: TextureFormat;
  constructor(device: Device) {
    this._device = device;
    this._shadowMapFormat = device.getTextureCaps().supportHalfFloatColorBuffer
      ? device.type === 'webgl'
        ? 'rgba16f'
        : 'r16f'
      : device.getTextureCaps().supportFloatColorBuffer
      ? device.type === 'webgl'
        ? 'rgba32f'
        : 'r32f'
      : 'rgba8unorm';
  }
  get device(): Device {
    return this._device;
  }
  renderScene(scene: Scene, camera: Camera): void {
    scene.frameUpdate(camera);
    if (camera && !scene.device.isContextLost()) {
      this._renderScene(scene, camera);
    }
  }
  renderSceneToTexture(scene: Scene, camera: Camera, frameBuffer: FrameBuffer): void {
    scene.frameUpdate(camera);
    if (camera && !scene.device.isContextLost()) {
      this._renderSceneToTexture(scene, camera, frameBuffer);
    }
  }
  renderSceneToCubeTexture(scene: Scene, camera: Camera, frameBuffer: FrameBuffer): void {
    scene.frameUpdate(camera);
    if (camera && !scene.device.isContextLost()) {
      this._renderSceneToCubeTexture(scene, camera, frameBuffer);
    }
  }
  dispose(): void {
    this._dispose();
  }
  getShadowMapFormat(): TextureFormat {
    return this._shadowMapFormat;
  }
  protected abstract _renderScene(scene: Scene, camera: Camera);
  protected abstract _renderSceneToTexture(scene: Scene, camera: Camera, frameBuffer: FrameBuffer);
  protected abstract _renderSceneToCubeTexture(scene: Scene, camera: Camera, frameBuffer: FrameBuffer);
  protected abstract _dispose();
}
