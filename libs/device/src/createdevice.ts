import { WebGLDevice } from "./webgl/device_webgl";
import { WebGPUDevice } from "./webgpu/device";
import type { Device, DeviceType, DeviceOptions } from "./device";

/** @internal */
export async function createDevice(cvs: HTMLCanvasElement, deviceType: DeviceType[] | DeviceType, options?: DeviceOptions): Promise<Device> {
  const typelist = Array.isArray(deviceType) ? deviceType : [deviceType];
  let device: Device = null;
  for (const type of typelist) {
    try {
      if (type === 'webgl' || type === 'webgl2') {
        device = new WebGLDevice(cvs, type, options);
      } else if (navigator.gpu) {
        device = new WebGPUDevice(cvs, options);
      }
      if (device) {
        break;
      }
    } catch (err) {
      console.error(`create context '${type}' failed: ${err}`);
      device = null;
    }
  }
  if (!device) {
    console.error('ERR: create device failed');
  } else {
    await device.initContext();
    device.setViewport();
    device.setScissor();
  }
  return device;
}
