import { Matrix4x4, Vector3, Vector4, REvent } from '@sophon/base';
import {
  Viewer,
  DeviceType,
  FrameBuffer,
  TextureSampler,
  TextureCube,
  Texture2D,
  Device,
  TextureFormat,
  PBInsideFunctionScope,
  PBShaderExp
} from '@sophon/device';
import {
  Mesh,
  SphereMesh,
  AssetManager,
  DirectionalLight,
  ForwardRenderScheme,
  ForwardMultiRenderPass,
  ForwardRenderPass,
  OrbitCameraModel,
  RenderPass,
  ShaderLib,
  Scene,
  Camera,
  GraphNode,
  UnlitLightModel,
  StandardMaterial,
  PBRMetallicRoughnessMaterial
} from '@sophon/scene';
import { GUIRenderer, GUI, RElement, RKeyEvent } from '@sophon/dom';
import * as common from '../common';

class MyRenderScheme extends ForwardRenderScheme {
  cubemapRenderPass: RenderPass;
  cubemapRenderCamera: Map<Scene, Camera>;
  cubemapCamera: Camera;
  fb: FrameBuffer;
  colorAttachment: TextureCube;
  depthAttachment: Texture2D;
  reflectiveSphere: Mesh;
  constructor(device: Device) {
    super(device);
    this.cubemapRenderPass =
      device.getDeviceType() === 'webgl'
        ? new ForwardMultiRenderPass(this, 'cubemap')
        : new ForwardRenderPass(this, 'cubemap');
    this.cubemapRenderCamera = new Map();
    this.colorAttachment = device.createCubeTexture(TextureFormat.RGBA8UNORM, 512, {
      colorSpace: 'linear'
    });
    this.depthAttachment = device.createTexture2D(TextureFormat.D24S8, 512, 512, {
      noMipmap: true
    });
    this.fb = device.createFrameBuffer({
      colorAttachments: [
        {
          texture: this.colorAttachment
        }
      ],
      depthAttachment: {
        texture: this.depthAttachment
      },
      sampleCount: device.getDeviceType() === 'webgl' ? 1 : 4
    });
  }
  renderScene(scene: Scene, camera: Camera) {
    if (this.reflectiveSphere) {
      if (!this.cubemapRenderCamera.get(scene)) {
        this.cubemapRenderCamera.set(scene, new Camera(scene));
        this.cubemapRenderCamera.get(scene).projectionMatrix = Matrix4x4.perspective(Math.PI / 2, 1, 1, 500);
      }
      this.reflectiveSphere.showState = GraphNode.SHOW_HIDE;
      this.cubemapRenderPass.renderToCubeTexture(scene, this.cubemapRenderCamera.get(scene), this.fb);
      this.reflectiveSphere.showState = GraphNode.SHOW_DEFAULT;
    }
    super.renderScene(scene, camera);
  }
  dispose() {
    super.dispose();
    this.fb.dispose();
    this.fb = null;
    this.colorAttachment.dispose();
    this.colorAttachment = null;
    this.depthAttachment.dispose();
    this.depthAttachment = null;
  }
}

class ReflectLightModel extends UnlitLightModel {
  private _reflectTexture: TextureCube;
  private _reflectTextureSampler: TextureSampler;
  constructor(reflectTexture: TextureCube) {
    super();
    this._reflectTexture = reflectTexture;
    this._reflectTextureSampler = reflectTexture?.getDefaultSampler(false);
    this.setTextureOptions('reflection', this._reflectTexture, this._reflectTextureSampler, null, null);
  }
  isNormalUsed(): boolean {
    return true;
  }
  calculateAlbedo(scope: PBInsideFunctionScope): PBShaderExp {
    const pb = scope.$builder;
    const reflectTexture = scope[this.getTextureUniformName('reflection')];
    const v = pb.normalize(
      pb.sub(scope.$inputs.worldPosition.xyz, scope.$query(ShaderLib.USAGE_CAMERA_POSITION))
    );
    const r = pb.reflect(v, pb.normalize(scope.$inputs.worldNormal));
    return pb.textureSample(reflectTexture, r);
  }
}

(async function () {
  const viewer = new Viewer(document.getElementById('canvas') as HTMLCanvasElement);
  await viewer.initDevice((common.getQueryString('dev') as DeviceType) || 'webgl', { msaa: true });
  const guiRenderer = new GUIRenderer(viewer.device);
  const gui = new GUI(guiRenderer);

  await gui.deserializeFromXML(document.querySelector('#main-ui').innerHTML);
  const sceneView = gui.document.querySelector('#scene-view');
  sceneView.customDraw = true;
  const scene = new Scene(viewer.device);
  const scheme = new MyRenderScheme(viewer.device);
  const camera = scene.addCamera().lookAt(new Vector3(0, 8, 30), new Vector3(0, 0, 0), Vector3.axisPY());
  camera.setProjectionMatrix(
    Matrix4x4.perspective(
      Math.PI / 3,
      viewer.device.getDrawingBufferWidth() / viewer.device.getDrawingBufferHeight(),
      1,
      160
    )
  );
  camera.mouseInputSource = sceneView;
  camera.keyboardInputSource = sceneView;
  camera.setModel(new OrbitCameraModel({ distance: camera.position.magnitude }));

  const assetManager = new AssetManager(scene.device);

  const reflectionTexture = scheme.fb.getColorAttachments()[0] as TextureCube;
  const material = new StandardMaterial<ReflectLightModel>(scene.device);
  material.lightModel = new ReflectLightModel(reflectionTexture);
  const cubeTexture = await assetManager.fetchTexture<TextureCube>('./assets/images/sky2.dds', null, true);
  scene.addSkybox(cubeTexture);
  scheme.reflectiveSphere = new SphereMesh(scene, { radius: 10, material: material });

  const light = new DirectionalLight(scene)
    .setColor(new Vector4(1, 1, 1, 1))
    .setIntensity(1)
    .setCastShadow(false);
  light.lookAt(new Vector3(10, 10, 10), new Vector3(0, 0, 0), Vector3.axisPY());

  const stdMat = new PBRMetallicRoughnessMaterial(scene.device);
  stdMat.lightModel.setAlbedoMap(
    await assetManager.fetchTexture('./assets/images/rustediron2_basecolor.png', null, true),
    null,
    0
  );
  stdMat.lightModel.setNormalMap(
    await assetManager.fetchTexture('./assets/images/rustediron2_normal.png', null, false),
    null,
    0
  );
  stdMat.lightModel.setMetallicMap(
    await assetManager.fetchTexture('./assets/images/mr.png', null, false),
    null,
    0
  );
  stdMat.lightModel.metallicIndex = 0;
  stdMat.lightModel.roughnessIndex = 1;

  const sphere2 = Mesh.unitSphere(scene);
  sphere2.material = stdMat;
  sphere2.scaling = new Vector3(3, 3, 3);

  const sphere3 = Mesh.unitSphere(scene);
  sphere3.material = stdMat;
  sphere3.scaling = new Vector3(3, 3, 3);

  const sphere4 = Mesh.unitSphere(scene);
  sphere4.material = stdMat;
  sphere4.scaling = new Vector3(3, 3, 3);

  sceneView.addEventListener('layout', function (this: RElement) {
    const rect = this.getClientRect();
    camera.setProjectionMatrix(
      Matrix4x4.perspective(
        camera.getFOV(),
        rect.width / rect.height,
        camera.getNearPlane(),
        camera.getFarPlane()
      )
    );
  });

  sceneView.addEventListener('keyup', function (evt: REvent) {
    const keyEvent = evt as RKeyEvent;
    console.log(keyEvent.code, keyEvent.key);
    if (keyEvent.code === 'Space') {
      if (sphere2.attached) {
        sphere2.parent = null;
      } else {
        sphere2.parent = scene.rootNode;
      }
      if (sphere3.attached) {
        sphere3.parent = null;
      } else {
        sphere3.parent = scene.rootNode;
      }
    }
  });

  sceneView.addEventListener('draw', function (this: RElement, evt: REvent) {
    evt.preventDefault();
    const elapsed = viewer.device.frameInfo.elapsedOverall;
    sphere2.position.set(20 * Math.sin(elapsed * 0.003), 0, 20 * Math.cos(elapsed * 0.003));
    sphere3.position.set(0, 20 * Math.sin(elapsed * 0.002), 20 * Math.cos(elapsed * 0.002));
    sphere4.position.set(20 * Math.sin(elapsed * 0.002), 20 * Math.cos(elapsed * 0.002), 0);
    scheme.renderScene(scene, camera);
  });

  viewer.device.runLoop((device) => gui.render());
})();
