import { createDevice, Device, DeviceType } from '@sophon/device';
import { TestCase, doTest } from '../common';
import { testBufferReadWrite } from './case';

const devices: { [name: string]: Device } = {};
const deviceNames = window.navigator.gpu ? ['webgl2', 'webgpu'] : ['webgl2'];

const testCases: TestCase[] = deviceNames.map((deviceName) => ({
  caseName: `Read write buffer test - ${deviceName}`,
  times: 10,
  execute: () => testBufferReadWrite(devices[deviceName])
}));

(async function () {
  for (const name of deviceNames) {
    devices[name] = await createDevice(document.querySelector<HTMLCanvasElement>(`#${name}`), name as DeviceType);
  }
  await doTest('buffer test', testCases);
})();
