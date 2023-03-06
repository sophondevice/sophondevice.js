import { Vector4, REvent } from '@sophon/base';
import { createDevice, DeviceType } from '@sophon/device';
import { AssetManager } from '@sophon/scene';
import { GUI, RElement } from '@sophon/dom';
import * as common from '../common';
import { TestTexture2D, TestTexture2DArray, TestTexture3D, TestTextureCube, TestTextureVideo } from './case';

const test2D = true;
const test3D = false;
const testCube = false;
const test2DArray = false;
const testVideo = false;

(async function () {
  const type = (common.getQueryString('dev') as DeviceType) || 'webgl';
  const device = await createDevice(document.getElementById('canvas') as HTMLCanvasElement, type, { msaa: true });
  const gui = new GUI(device);
  await gui.deserializeFromXML(document.querySelector('#main-ui').innerHTML);
  const assetManager = new AssetManager(device);

  if (test2D) {
    const sceneView2d = test2D ? gui.document.querySelector('#scene-view-2d') : null;
    sceneView2d.customDraw = true;
    const case2d = new TestTexture2D(device, assetManager);
    await case2d.init();
    sceneView2d.addEventListener('draw', function (this: RElement, evt: REvent) {
      evt.preventDefault();
      device.clearFrameBuffer(new Vector4(0, 0, 0.5, 1), 1, 0);
      const rect = this.getClientRect();
      case2d.draw(rect.width, rect.height);
    });
  }
  if (test3D) {
    const sceneView3d = gui.document.querySelector('#scene-view-3d');
    sceneView3d.customDraw = true;
    const case3d =
    device.type === 'webgl' ? null : new TestTexture3D(device, assetManager);
    await case3d?.init();
    sceneView3d.addEventListener('draw', function (this: RElement, evt: REvent) {
      evt.preventDefault();
      device.clearFrameBuffer(new Vector4(0, 0, 0.5, 1), 1, 0);
      if (device.type !== 'webgl') {
        const rect = this.getClientRect();
        case3d.draw(rect.width, rect.height);
      }
    });
  }
  if (testCube) {
    const sceneViewCube = gui.document.querySelector('#scene-view-cube');
    sceneViewCube.customDraw = true;
    const caseCube = new TestTextureCube(device, assetManager);
    await caseCube.init();
    sceneViewCube.addEventListener('draw', function (this: RElement, evt: REvent) {
      evt.preventDefault();
      device.clearFrameBuffer(new Vector4(0, 0, 0.5, 1), 1, 0);
      const rect = this.getClientRect();
      caseCube.draw(rect.width, rect.height);
    });
  }
  if (test2DArray) {
    const sceneView2dArray = gui.document.querySelector('#scene-view-2darray');
    sceneView2dArray.customDraw = true;
    const case2dArray =
    device.type === 'webgl' ? null : new TestTexture2DArray(device, assetManager);
    await case2dArray?.init();
    sceneView2dArray.addEventListener('draw', function (this: RElement, evt: REvent) {
      evt.preventDefault();
      device.clearFrameBuffer(new Vector4(0, 0, 0.5, 1), 1, 0);
      if (device.type !== 'webgl') {
        const rect = this.getClientRect();
        case2dArray.draw(rect.width, rect.height);
      }
    });  
  }
  if (testVideo) {
    const sceneViewVideo = gui.document.querySelector('#scene-view-video');
    sceneViewVideo.customDraw = true;
    const caseVideo = new TestTextureVideo(device, assetManager, './assets/images/sample-video.mp4');
    await caseVideo.init();
    sceneViewVideo.addEventListener('draw', function (this: RElement, evt: REvent) {
      evt.preventDefault();
      device.clearFrameBuffer(new Vector4(0, 0, 0.5, 1), 1, 0);
      const rect = this.getClientRect();
      caseVideo.draw(rect.width, rect.height);
    });
  }

  common.createTextureViewPanel(device, gui.document.body, 300);
  device.runLoop((device) => gui.render());
})();
