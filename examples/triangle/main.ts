import { Vector4 } from '@sophon/base';
import { createDevice, DeviceType } from "@sophon/device";

(async function() {
  // create render device
  const canvas = document.querySelector<HTMLCanvasElement>('#canvas');
  const deviceType = new URL(location.href).searchParams.get('dev') || 'webgl';
  const device = await createDevice(canvas, deviceType as DeviceType);

  // create vertex layout
  const positions = device.createVertexBuffer('position_f32x2', new Float32Array([-0.3, -0.7, 0.3, -0.7, 0, 0.7]));
  const colors = device.createVertexBuffer('diffuse_u8normx4', new Uint8Array([255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255]));
  const vertexLayout = device.createVertexLayout({
    vertexBuffers: [{
      buffer: positions
    }, {
      buffer: colors
    }]
  });

  // create shader program
  const program = device.createProgramBuilder().buildRenderProgram({
    vertex() {
      const pb = this.$builder;
      this.$inputs.position = pb.vec2().attrib('position');
      this.$inputs.color = pb.vec4().attrib('diffuse');
      this.$outputs.color = pb.vec4();
      this.$mainFunc(function(){
        this.$builtins.position = pb.vec4(this.$inputs.position, 0, 1);
        this.$outputs.color = this.$inputs.color;
      });
    },
    fragment() {
      const pb = this.$builder;
      this.$outputs.color = pb.vec4();
      this.$mainFunc(function(){
        this.$outputs.color = pb.vec4(pb.pow(this.$inputs.color.rgb, pb.vec3(1/2.2)), 1);
      });
    }
  });

  // start render loop
  device.runLoop(device => {
    device.clearFrameBuffer(new Vector4(0, 0, 0.5, 1), 1, 0);
    device.setProgram(program);
    device.setVertexLayout(vertexLayout);
    device.draw('triangle-list', 0, 3);
  });
})();