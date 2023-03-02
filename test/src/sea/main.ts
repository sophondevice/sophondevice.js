import { Vector4, REvent } from '@sophon/base';
import { Viewer, DeviceType, makeVertexBufferType } from '@sophon/device';
import * as dom from '@sophon/dom';
import * as common from '../common';
import { createSeaProgram } from './program';

(async function () {
  const viewer = new Viewer(document.getElementById('canvas') as HTMLCanvasElement);
  await viewer.initDevice((common.getQueryString('dev') as DeviceType) || 'webgl', { msaa: true });
  const guiRenderer = new dom.GUIRenderer(viewer.device);
  const GUI = new dom.GUI(guiRenderer);
  await GUI.deserializeFromXML(document.querySelector('#main-ui').innerHTML);
  const sceneView = GUI.document.querySelector('#scene-view');
  sceneView.customDraw = true;

  const vb = viewer.device.createStructuredBuffer(
    makeVertexBufferType(4, 'position_f32x2'),
    {
      usage: 'vertex',
      managed: true
    },
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
  );
  const rect = viewer.device.createVAO({
    vertexBuffers: [{
      buffer: vb
    }]
  });
  const program = createSeaProgram(viewer.device);
  const bindGroup = viewer.device.createBindGroup(program.bindGroupLayouts[0]);

  sceneView.addEventListener('draw', function (this: dom.RElement, evt: REvent) {
    evt.preventDefault();
    bindGroup.setValue(
      'uniforms',
      new Vector4(
        viewer.device.frameInfo.elapsedOverall * 0.001,
        0,
        viewer.device.getDrawingBufferWidth(),
        viewer.device.getDrawingBufferHeight()
      )
    );
    viewer.device.setProgram(program);
    viewer.device.setBindGroup(0, bindGroup);
    rect.draw('triangle-strip', 0, 4);
  });

  viewer.device.runLoop((device) => GUI.render());
})();
