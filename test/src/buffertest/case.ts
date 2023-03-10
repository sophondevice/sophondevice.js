import { Device } from '@sophon/device';

export async function testBufferReadWrite(device: Device) {
  const readBuffer = device.createBuffer(4, { usage: 'read' });
  readBuffer.bufferSubData(0, new Uint8Array([1, 2, 3, 4]), 0, 4);
  const data = new Float32Array(100);
  const vertexBuffer = device.createVertexBuffer('position_f32', data);
  vertexBuffer.bufferSubData(0, data, 0, 20);
  vertexBuffer.bufferSubData(160, data, 0, 20);
  vertexBuffer.bufferSubData(320, data, 0, 20);
  vertexBuffer.bufferSubData(80, data, 0, 20);
  vertexBuffer.bufferSubData(240, data, 0, 20);
  vertexBuffer.bufferSubData(120, data, 0, 30);
}
