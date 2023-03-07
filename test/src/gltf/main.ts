import { REvent } from '@sophon/base';
import { createDevice, DeviceType } from '@sophon/device';
import { Scene } from '@sophon/scene';
import { GUI, RElement } from '@sophon/dom';
import * as common from '../common';
import { GLTFViewer } from './gltfviewer';

(async function () {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const type = (common.getQueryString('dev') as DeviceType) || 'webgl';
  const device = await createDevice(canvas, type, { msaa: true });
  const gui = new GUI(device);
  await gui.deserializeFromXML(document.querySelector('#main-ui').innerHTML);
  const sceneView = gui.document.querySelector('#scene-view');
  sceneView.customDraw = true;
  const group = gui.document.querySelector('#button-group');
  const scene = new Scene(device);
  common.createTestPanel(scene, group);
  common.createSceneTweakPanel(scene, group, { width: '200px' });
  common.createTextureViewPanel(device, sceneView, 300);

  const gltfViewer = new GLTFViewer(gui, scene);
  gltfViewer.camera.mouseInputSource = sceneView;
  gltfViewer.camera.keyboardInputSource = sceneView;
  // await gltfViewer.initEnvironment();

  canvas.addEventListener('dragover', (ev: DragEvent) => {
    ev.preventDefault();
  });
  canvas.addEventListener('drop', (ev: DragEvent) => {
    ev.preventDefault();
    ev.stopPropagation();
    if (ev.dataTransfer.items.length > 0) {
      gltfViewer.handleDrop(ev.dataTransfer);
    }
  });

  /*
  common.createLightTweakPanel(gltfViewer.light, sceneView, {
    width: '200px'
  });
  */
  sceneView.addEventListener('layout', function (this: RElement) {
    const rect = this.getClientRect();
    gltfViewer.aspect = rect.z / rect.w;
  });

  sceneView.addEventListener('draw', function (this: RElement, evt: REvent) {
    evt.preventDefault();
    gltfViewer.render();
  });

  sceneView.addEventListener('mousemove', (evt) => {
    const intersected = gltfViewer.raycast(evt.offsetX, evt.offsetY);
    console.log(`raycast: ${intersected?.constructor.name || null}`);
  });

  device.runLoop((device) => gui.render());
})();
