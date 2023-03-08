import { Matrix4x4, Quaternion, Vector3, Vector4 } from '@sophon/base';
import { createDevice, DeviceType } from "@sophon/device";

(async function() {
  // create render device
  const canvas = document.querySelector<HTMLCanvasElement>('#canvas');
  const deviceType = new URL(location.href).searchParams.get('dev') || 'webgl';
  const device = await createDevice(canvas, deviceType as DeviceType);

  // create vertex layout
  const vertices = [
    // top
    -1, 1, -1, -1, 1, 1, 1, 1, 1, 1, 1, -1,
    // front
    -1, 1, 1, -1, -1, 1, 1, -1, 1, 1, 1, 1,
    // right
    1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1,
    // back
    1, 1, -1, 1, -1, -1, -1, -1, -1, -1, 1, -1,
    // left
    -1, 1, -1, -1, -1, -1, -1, -1, 1, -1, 1, 1,
    // bottom
    -1, -1, 1, -1, -1, -1, 1, -1, -1, 1, -1, 1
  ];
  const normals = [
    // top
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
    // front
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
    // right
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
    // back
    0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
    // left
    -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
    // bottom
    0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0
  ];
  const texcoords = [
    // top
    0, 0, 0, 1, 1, 1, 1, 0,
    // front
    0, 0, 0, 1, 1, 1, 1, 0,
    // right
    0, 0, 0, 1, 1, 1, 1, 0,
    // back
    0, 0, 0, 1, 1, 1, 1, 0,
    // left
    0, 0, 0, 1, 1, 1, 1, 0,
    // bottom
    0, 0, 0, 1, 1, 1, 1, 0,
  ];
  const indices = [
    0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23
  ];
  const vbPos = device.createVertexBuffer('position_f32x3', new Float32Array(vertices));
  const vbNormals = device.createVertexBuffer('normal_f32x3', new Float32Array(normals));
  const vbTexCoords = device.createVertexBuffer('tex0_f32x2', new Float32Array(texcoords));
  const ib = device.createIndexBuffer(new Uint16Array(indices));
  const vertexLayout = device.createVertexLayout({
    vertexBuffers: [{
      buffer: vbPos
    }, {
      buffer: vbNormals
    }, {
      buffer: vbTexCoords
    }],
    indexBuffer: ib
  });

  // load texture
  const img = document.createElement('img');
  img.src = 'layer.jpg';
  await img.decode();
  const bitmap = await createImageBitmap(img, { premultiplyAlpha: 'none' });
  const texture = device.createTexture2DFromImage(bitmap, {
    colorSpace: 'srgb'
  });

  // create shader program
  const program = device.createProgramBuilder().buildRenderProgram({
    vertex() {
      const pb = this.$builder;
      this.projMatrix = pb.mat4().uniform(0);
      this.worldMatrix = pb.mat4().uniform(0);
      this.$inputs.position = pb.vec3().attrib('position');
      this.$inputs.normal = pb.vec3().attrib('normal');
      this.$inputs.uv = pb.vec2().attrib('texCoord0');
      this.$outputs.uv = pb.vec2();
      this.$outputs.worldNormal = pb.vec3();
      this.$mainFunc(function() {
        this.worldPos = pb.mul(this.worldMatrix, pb.vec4(this.$inputs.position, 1));
        this.$builtins.position = pb.mul(this.projMatrix, this.worldPos);
        this.$outputs.worldNormal = pb.mul(this.worldMatrix, pb.vec4(this.$inputs.normal, 0)).xyz;
        this.$outputs.uv = this.$inputs.uv;
      });
    },
    fragment() {
      const pb = this.$builder;
      this.tex = pb.tex2D().uniform(0);
      this.lightdir = pb.vec3().uniform(0);
      this.lightcolor = pb.vec3().uniform(0);
      this.ambient = pb.vec3().uniform(0);
      this.$outputs.color = pb.vec4();
      this.$mainFunc(function() {
        this.sampleColor = pb.textureSample(this.tex, this.$inputs.uv);
        this.NdotL = pb.clamp(pb.neg(pb.dot(pb.normalize(this.lightdir), pb.normalize(this.$inputs.worldNormal))), 0, 1);
        this.finalColor = pb.add(pb.mul(this.sampleColor.rgb, this.lightcolor, this.NdotL), this.ambient);
        this.$outputs.color = pb.vec4(pb.pow(this.finalColor, pb.vec3(1 / 2.2)), 1);
      });
    }
  });

  // create bind group
  const bindGroup = device.createBindGroup(program.bindGroupLayouts[0]);

  // light color
  const lightColor = Vector3.one();
  // light direction
  const lightDir = new Vector3(1, -1, -1).inplaceNormalize();
  // ambient lighting
  const ambient = new Vector3(0.01, 0.01, 0.01);

  // start render loop
  device.runLoop(device => {
    const t = device.frameInfo.elapsedOverall * 0.002;
    const rotateMatrix = Quaternion.fromEulerAngle(t, t, 0, 'XYZ').toMatrix4x4();
    bindGroup.setValue('worldMatrix', Matrix4x4.translateLeft(rotateMatrix, new Vector3(0, 0, -4)));
    bindGroup.setValue('projMatrix', Matrix4x4.perspective(1.5, device.getDrawingBufferWidth()/device.getDrawingBufferHeight(), 1, 50));
    bindGroup.setValue('lightdir', lightDir);
    bindGroup.setValue('lightcolor', lightColor);
    bindGroup.setValue('ambient', ambient);
    bindGroup.setTexture('tex', texture);

    device.clearFrameBuffer(new Vector4(0, 0, 0.5, 1), 1, 0);
    device.setProgram(program);
    device.setVertexLayout(vertexLayout);
    device.setBindGroup(0, bindGroup);
    device.draw('triangle-list', 0, 36);    
  });
})();