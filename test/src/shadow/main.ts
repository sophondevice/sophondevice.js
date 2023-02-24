import { Vector3, Vector4, Quaternion, Matrix4x4, REvent } from '@sophon/base';
import { Viewer, DeviceType } from '@sophon/device';
import {
  Scene,
  ForwardRenderScheme,
  FPSCameraModel,
  DirectionalLight,
  PBRMetallicRoughnessMaterial,
  Mesh
} from '@sophon/scene';
import { GUI, GUIRenderer, RElement } from '@sophon/dom';
import * as common from '../common';

(async function () {
  const viewer = new Viewer(document.getElementById('canvas') as HTMLCanvasElement);
  await viewer.initDevice((common.getQueryString('dev') as DeviceType) || 'webgl', { msaa: true });
  const guiRenderer = new GUIRenderer(viewer.device);
  const gui = new GUI(guiRenderer);
  await gui.deserializeFromXML(document.querySelector('#main-ui').innerHTML);
  const sceneView = gui.document.querySelector('#scene-view');
  sceneView.customDraw = true;
  const scene = new Scene(viewer.device);
  scene.envLightStrength = 0.2;
  const scheme = new ForwardRenderScheme(viewer.device);
  const camera = scene.addCamera().lookAt(new Vector3(0, 8, 30), new Vector3(0, 8, 0), Vector3.axisPY());
  camera.setProjectionMatrix(
    Matrix4x4.perspective(
      Math.PI / 3,
      viewer.device.getDrawingBufferWidth() / viewer.device.getDrawingBufferHeight(),
      1,
      1000
    )
  );
  camera.mouseInputSource = sceneView;
  camera.keyboardInputSource = sceneView;
  camera.setModel(new FPSCameraModel({ moveSpeed: 0.5 }));

  common.createTestPanel(scene, sceneView, {
    width: '200px'
  });
  common.createTextureViewPanel(viewer.device, sceneView, 300);

  // const directionlight = null;
  const directionlight = new DirectionalLight(scene);
  directionlight.setCastShadow(true).setColor(new Vector4(1, 1, 1, 1));
  directionlight.lookAt(new Vector3(20, 28, -20), Vector3.zero(), Vector3.axisPY());
  directionlight.shadow.shadowMapSize = 2048;
  directionlight.shadow.numShadowCascades = 4;
  const planeMaterial = new PBRMetallicRoughnessMaterial(viewer.device);
  planeMaterial.lightModel.metallic = 0.1;
  planeMaterial.lightModel.roughness = 0.6;

  common.createLightTweakPanel(directionlight, sceneView, {
    width: '200px'
  });

  const floor = Mesh.unitBox(scene);
  floor.scaling = new Vector3(2000, 10, 2000);
  floor.position = new Vector3(-1000, -10, -1000);
  floor.castShadow = true;
  floor.material = planeMaterial;

  for (let i = -40; i <= 40; i++) {
    const box1 = Mesh.unitBox(scene);
    box1.scaling = new Vector3(2, 20, 2);
    box1.position = new Vector3(-20, -10, i * 10);
    box1.material = planeMaterial;
    const box2 = Mesh.unitBox(scene);
    box2.scaling = new Vector3(2, 20, 2);
    box2.position = new Vector3(20, -10, i * 10);
    box2.material = planeMaterial;
  }

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

  scene.addEventListener('tick', () => {
    const elapsed = viewer.device.frameInfo.elapsedOverall;
    if (false && directionlight) {
      directionlight.setRotation(
        Quaternion.fromAxisAngle(Vector3.axisNX(), Math.PI * (0.5 + 0.25 * Math.sin(elapsed / 2000)))
      );
      directionlight.lookAt(
        new Vector3(0, 28, 0),
        new Vector3(40 * Math.cos(elapsed / 2000), 0, 40 * Math.sin(elapsed / 2000)),
        Vector3.axisPY()
      );
    }
  });

  sceneView.addEventListener('draw', function (this: RElement, evt: REvent) {
    evt.preventDefault();
    scheme.renderScene(scene, camera);
  });

  viewer.device.runLoop((device) => gui.render());
})();
