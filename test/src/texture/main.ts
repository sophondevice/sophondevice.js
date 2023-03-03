import { Vector4, REvent } from '@sophon/base';
import { Device, DeviceType } from '@sophon/device';
import { AssetManager } from '@sophon/scene';
import { GUI, RElement } from '@sophon/dom';
import * as common from '../common';
import { TestTexture2D, TestTexture2DArray, TestTexture3D, TestTextureCube, TestTextureVideo } from './case';

(async function () {
  const type = (common.getQueryString('dev') as DeviceType) || 'webgl';
  const device = await Device.create(document.getElementById('canvas') as HTMLCanvasElement, type, { msaa: true });
  const gui = new GUI(device);
  await gui.deserializeFromXML(document.querySelector('#main-ui').innerHTML);
  const assetManager = new AssetManager(device);
  const sceneView2d = gui.document.querySelector('#scene-view-2d');
  sceneView2d.customDraw = true;
  const sceneView3d = gui.document.querySelector('#scene-view-3d');
  sceneView3d.customDraw = true;
  const sceneViewCube = gui.document.querySelector('#scene-view-cube');
  sceneViewCube.customDraw = true;
  const sceneView2dArray = gui.document.querySelector('#scene-view-2darray');
  sceneView2dArray.customDraw = true;
  const sceneViewVideo = gui.document.querySelector('#scene-view-video');
  sceneViewVideo.customDraw = true;

  const case2d = new TestTexture2D(device, assetManager);
  await case2d.init();
  const case3d =
    device.type === 'webgl' ? null : new TestTexture3D(device, assetManager);
  await case3d?.init();
  const caseCube = new TestTextureCube(device, assetManager);
  await caseCube.init();
  const case2dArray =
    device.type === 'webgl' ? null : new TestTexture2DArray(device, assetManager);
  await case2dArray?.init();
  const caseVideo = new TestTextureVideo(device, assetManager, './assets/images/sample-video.mp4');
  await caseVideo.init();

  sceneView2d.addEventListener('draw', function (this: RElement, evt: REvent) {
    evt.preventDefault();
    device.clearFrameBuffer(new Vector4(0, 0, 0.5, 1), 1, 0);
    const rect = this.getClientRect();
    case2d.draw(rect.width, rect.height);
  });

  sceneView3d.addEventListener('draw', function (this: RElement, evt: REvent) {
    evt.preventDefault();
    device.clearFrameBuffer(new Vector4(0, 0, 0.5, 1), 1, 0);
    if (device.type !== 'webgl') {
      const rect = this.getClientRect();
      case3d.draw(rect.width, rect.height);
    }
  });

  sceneViewCube.addEventListener('draw', function (this: RElement, evt: REvent) {
    evt.preventDefault();
    device.clearFrameBuffer(new Vector4(0, 0, 0.5, 1), 1, 0);
    const rect = this.getClientRect();
    caseCube.draw(rect.width, rect.height);
  });

  sceneView2dArray.addEventListener('draw', function (this: RElement, evt: REvent) {
    evt.preventDefault();
    device.clearFrameBuffer(new Vector4(0, 0, 0.5, 1), 1, 0);
    if (device.type !== 'webgl') {
      const rect = this.getClientRect();
      case2dArray.draw(rect.width, rect.height);
    }
  });

  sceneViewVideo.addEventListener('draw', function (this: RElement, evt: REvent) {
    evt.preventDefault();
    device.clearFrameBuffer(new Vector4(0, 0, 0.5, 1), 1, 0);
    const rect = this.getClientRect();
    caseVideo.draw(rect.width, rect.height);
  });

  common.createTextureViewPanel(device, gui.document.body, 300);
  device.runLoop((device) => gui.render());
})();
