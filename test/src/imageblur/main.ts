import { REvent, Vector4 } from '@sophon/base';
import { createDevice, ProgramBuilder } from '@sophon/device';
import { AssetManager } from '@sophon/scene';
import { GUI, ScrollBar, RValueChangeEvent, RElement } from '@sophon/dom';

(async function () {
  const device = await createDevice(document.getElementById('canvas') as HTMLCanvasElement, 'webgpu', { msaa: true });
  const gui = new GUI(device);
  await gui.deserializeFromXML(document.querySelector('#main-ui').innerHTML);
  const sceneView = gui.document.querySelector('#scene-view');
  sceneView.customDraw = true;

  const assetManager = new AssetManager(device);

  const pb = new ProgramBuilder(device);
  const fullScreenQuadProgram = pb.buildRenderProgram({
    label: 'fullScreenQuad',
    vertex() {
      this.pos = [
        pb.vec2(1, 1),
        pb.vec2(1, -1),
        pb.vec2(-1, -1),
        pb.vec2(1, 1),
        pb.vec2(-1, 1),
        pb.vec2(-1, -1)
      ];
      this.uv = [pb.vec2(1, 0), pb.vec2(1, 1), pb.vec2(0, 1), pb.vec2(1, 0), pb.vec2(0, 0), pb.vec2(0, 1)];
      this.$outputs.fragUV = pb.vec2();
      this.$mainFunc(function () {
        this.$builtins.position = pb.vec4(this.pos.at(this.$builtins.vertexIndex), 0, 1);
        this.$outputs.fragUV = this.uv.at(this.$builtins.vertexIndex);
      });
    },
    fragment() {
      this.texture = pb.tex2D().uniform(0);
      this.$outputs.color = pb.vec4();
      this.$mainFunc(function () {
        this.$outputs.color = pb.textureSample(this.texture, this.$inputs.fragUV);
      });
    }
  });
  const blurProgram = pb.buildComputeProgram({
    workgroupSize: [32, 1, 1],
    compute() {
      const structParams = pb.defineStruct(null, 'default', pb.uint('filterDim'), pb.uint('blockDim'));
      const structFlip = pb.defineStruct(null, 'default', pb.uint('value'));
      this.params = structParams().uniform(0);
      this.inputTex = pb.tex2D().uniform(1);
      this.outputTex = pb.texStorage2D.rgba8unorm().uniform(1);
      this.flip = structFlip().uniform(1);
      this.tile = pb.vec3[128][4]().workgroup();
      this.$mainFunc(function () {
        this.filterOffset = pb.div(pb.sub(this.params.filterDim, 1), 2);
        this.dims = pb.textureDimensions(this.inputTex, 0);
        this.baseIndex = pb.sub(
          pb.add(
            pb.mul(this.$builtins.workGroupId.xy, pb.uvec2(this.params.blockDim, 4)),
            pb.mul(this.$builtins.localInvocationId.xy, pb.uvec2(4, 1))
          ),
          pb.uvec2(this.filterOffset, 0)
        );
        this.$for(pb.uint('r'), 0, 4, function () {
          this.$for(pb.uint('c'), 0, 4, function () {
            this.loadIndex = pb.add(this.baseIndex, pb.uvec2(this.c, this.r));
            this.$if(pb.notEqual(this.flip.value, 0), function () {
              this.loadIndex = this.loadIndex.yx;
            });
            this.tile
              .at(this.r)
              .setAt(
                pb.add(pb.mul(4, this.$builtins.localInvocationId.x), this.c),
                pb.textureSampleLevel(
                  this.inputTex,
                  pb.div(pb.add(pb.vec2(this.loadIndex), pb.vec2(0.25, 0.25)), pb.vec2(this.dims)),
                  0
                ).xyz
              );
          });
        });
        pb.workgroupBarrier();
        this.$for(pb.uint('r'), 0, 4, function () {
          this.$for(pb.uint('c'), 0, 4, function () {
            this.writeIndex = pb.add(this.baseIndex, pb.uvec2(this.c, this.r));
            this.$if(pb.notEqual(this.flip.value, 0), function () {
              this.writeIndex = this.writeIndex.yx;
            });
            this.center = pb.add(pb.mul(4, this.$builtins.localInvocationId.x), this.c);
            this.$if(
              pb.and(
                pb.and(
                  pb.greaterThanEqual(this.center, this.filterOffset),
                  pb.lessThan(this.center, pb.sub(128, this.filterOffset))
                ),
                pb.all(pb.lessThan(this.writeIndex, this.dims))
              ),
              function () {
                this.acc = pb.vec3(0, 0, 0);
                this.$for(pb.uint('f'), 0, this.params.filterDim, function () {
                  this.i = pb.sub(pb.add(this.center, this.f), this.filterOffset);
                  this.acc = pb.add(
                    this.acc,
                    pb.mul(pb.div(1, pb.float(this.params.filterDim)), this.tile.at(this.r).at(this.i))
                  );
                });
                pb.textureStore(this.outputTex, this.writeIndex, pb.vec4(this.acc, 1));
              }
            );
          });
        });
      });
    }
  });
  const cubeTexture = await assetManager.fetchTexture('./assets/images/Di-3d.png', null, false, true);
  const textures = [
    device.createTexture2D('rgba8unorm', cubeTexture.width, cubeTexture.height, {
      colorSpace: 'linear',
      writable: true,
      noMipmap: true
    }),
    device.createTexture2D('rgba8unorm', cubeTexture.width, cubeTexture.height, {
      colorSpace: 'linear',
      writable: true,
      noMipmap: true
    })
  ];
  const computeUniforms = device.createBindGroup(blurProgram.bindGroupLayouts[0]);
  const computeBindGroup0 = device.createBindGroup(blurProgram.bindGroupLayouts[1]);
  computeBindGroup0.setTexture('inputTex', cubeTexture);
  computeBindGroup0.setTexture('outputTex', textures[0]);
  computeBindGroup0.setValue('flip', { value: 0 });
  const computeBindGroup1 = device.createBindGroup(blurProgram.bindGroupLayouts[1]);
  computeBindGroup1.setTexture('inputTex', textures[0]);
  computeBindGroup1.setTexture('outputTex', textures[1]);
  computeBindGroup1.setValue('flip', { value: 1 });
  const computeBindGroup2 = device.createBindGroup(blurProgram.bindGroupLayouts[1]);
  computeBindGroup2.setTexture('inputTex', textures[1]);
  computeBindGroup2.setTexture('outputTex', textures[0]);
  computeBindGroup2.setValue('flip', { value: 0 });
  const resultBindGroup = device.createBindGroup(fullScreenQuadProgram.bindGroupLayouts[0]);
  resultBindGroup.setTexture('texture', textures[1]);
  let blockDim: number;
  const tileDim = 128;
  const batch = [4, 4];
  const sliderFilterSize = sceneView.querySelector('#filter-size') as ScrollBar;
  const sliderIterations = sceneView.querySelector('#iterations') as ScrollBar;
  const settings = {
    filterSize: Number(sliderFilterSize.value),
    iterations: Number(sliderIterations.value)
  };
  const updateSettings = () => {
    blockDim = tileDim - (settings.filterSize - 1);
    computeUniforms.setValue('params', {
      filterDim: settings.filterSize,
      blockDim: blockDim
    });
  };
  sliderFilterSize.addEventListener(RValueChangeEvent.NAME, function () {
    settings.filterSize = sliderFilterSize.value;
    updateSettings();
  });
  sliderIterations.addEventListener(RValueChangeEvent.NAME, function () {
    settings.iterations = sliderIterations.value;
    updateSettings();
  });
  updateSettings();
  sceneView.addEventListener('draw', function (this: RElement, evt: REvent) {
    evt.preventDefault();
    device.setProgram(blurProgram);
    device.setBindGroup(0, computeUniforms);
    device.setBindGroup(1, computeBindGroup0);
    device.compute(
      Math.ceil(cubeTexture.width / blockDim),
      Math.ceil(cubeTexture.height / batch[1]),
      1
    );
    device.setBindGroup(1, computeBindGroup1);
    device.compute(
      Math.ceil(cubeTexture.height / blockDim),
      Math.ceil(cubeTexture.width / batch[1]),
      1
    );
    for (let i = 0; i < settings.iterations - 1; i++) {
      device.setBindGroup(1, computeBindGroup2);
      device.compute(
        Math.ceil(cubeTexture.width / blockDim),
        Math.ceil(cubeTexture.height / batch[1]),
        1
      );
      device.setBindGroup(1, computeBindGroup1);
      device.compute(
        Math.ceil(cubeTexture.height / blockDim),
        Math.ceil(cubeTexture.width / batch[1]),
        1
      );
    }
    device.clearFrameBuffer(new Vector4(0, 0, 0, 1), 1, 0);
    device.setProgram(fullScreenQuadProgram);
    device.setBindGroup(0, resultBindGroup);
    device.setBindGroup(1, null);
    device.setVertexLayout(null);
    device.draw('triangle-list', 0, 6);
  });

  device.runLoop((device) => gui.render());
})();
