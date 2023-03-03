import { Vector4, REvent } from '@sophon/base';
import { Device, DeviceType, makeVertexBufferType } from '@sophon/device';
import { GUI, RElement } from '@sophon/dom';
import * as common from '../common';
import { createSeaProgram } from './program';

(async function () {
  const type = (common.getQueryString('dev') as DeviceType) || 'webgl';
  const device = await Device.create(document.getElementById('canvas') as HTMLCanvasElement, type, { msaa: true });
  const gui = new GUI(device);
  await gui.deserializeFromXML(document.querySelector('#main-ui').innerHTML);
  const sceneView = gui.document.querySelector('#scene-view');
  sceneView.customDraw = true;

  const vb = device.createStructuredBuffer(
    makeVertexBufferType(4, 'position_f32x2'),
    {
      usage: 'vertex',
      managed: true
    },
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
  );
  const rect = device.createVertexLayout({
    vertexBuffers: [{
      buffer: vb
    }]
  });
  const program = createSeaProgram(device);
  const bindGroup = device.createBindGroup(program.bindGroupLayouts[0]);

  sceneView.addEventListener('draw', function (this: RElement, evt: REvent) {
    evt.preventDefault();
    bindGroup.setValue(
      'uniforms',
      new Vector4(
        device.frameInfo.elapsedOverall * 0.001,
        0,
        device.getDrawingBufferWidth(),
        device.getDrawingBufferHeight()
      )
    );
    device.setProgram(program);
    device.setBindGroup(0, bindGroup);
    rect.draw('triangle-strip', 0, 4);
  });

  device.runLoop((device) => gui.render());
})();
