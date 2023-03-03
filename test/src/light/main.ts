import { Vector3, Vector4, Quaternion, Matrix4x4, REvent } from '@sophon/base';
import { createDevice, DeviceType } from '@sophon/device';
import {
  Scene,
  OrbitCameraModel,
  ForwardRenderScheme,
  DirectionalLight,
  SpotLight,
  UnlitMaterial,
  Mesh,
  PBRMetallicRoughnessMaterial
} from '@sophon/scene';
import { GUI, RElement, RKeyEvent } from '@sophon/dom';
import * as common from '../common';

(async function () {
  const type = (common.getQueryString('dev') as DeviceType) || 'webgl';
  const device = await createDevice(document.getElementById('canvas') as HTMLCanvasElement, type, { msaa: false });
  const gui = new GUI(device);
  await gui.deserializeFromXML(document.querySelector('#main-ui').innerHTML);
  const sceneView = gui.document.querySelector('#scene-view');
  sceneView.customDraw = true;
  const scene = new Scene(device);
  const scheme = new ForwardRenderScheme(device);
  const camera = scene.addCamera().lookAt(new Vector3(0, 8, 30), new Vector3(0, 8, 0), Vector3.axisPY());
  camera.setProjectionMatrix(
    Matrix4x4.perspective(
      Math.PI / 3,
      device.getDrawingBufferWidth() / device.getDrawingBufferHeight(),
      1,
      260
    )
  );
  camera.mouseInputSource = sceneView;
  camera.keyboardInputSource = sceneView;
  camera.setModel(new OrbitCameraModel({ distance: camera.position.magnitude }));

  common.createTestPanel(scene, sceneView, {
    width: '200px'
  });
  common.createSceneTweakPanel(scene, sceneView, { width: '200px' });
  common.createTextureViewPanel(device, sceneView, 300);

  const directionlight = new DirectionalLight(scene);
  directionlight.setCastShadow(false).setColor(new Vector4(1, 0, 1, 1));
  directionlight.lookAt(new Vector3(0, 28, 0), new Vector3(0, 0, 0), Vector3.axisPX());
  directionlight.shadow.shadowMapSize = 1024;
  common.createLightTweakPanel(directionlight, sceneView, {
    width: '200px'
  });

  // const pointlight = null;
  const pointlight = new SpotLight(scene)
    .setPosition(new Vector3(0, 28, 0))
    .setRotation(Quaternion.fromAxisAngle(Vector3.axisPX(), -Math.PI * 0.25))
    .setRange(50)
    .setIntensity(8)
    .setCutoff(Math.PI * 0.2)
    .setColor(new Vector4(1, 1, 0, 1))
    .setCastShadow(false);
  pointlight.shadow.shadowMapSize = 1024;
  common.createLightTweakPanel(pointlight, sceneView, {
    width: '200px'
  });

  const ballMaterial = new UnlitMaterial(device);
  ballMaterial.lightModel.albedo = new Vector4(1, 1, 0, 1);
  const ball = Mesh.unitSphere(scene);
  ball.scaling = new Vector3(1, 1, 1);
  ball.castShadow = false;
  ball.material = ballMaterial;
  ball.reparent(pointlight);

  /*
  const spotlight = new SpotLight(null)
  .setRange(100)
  .setCutoff(Math.PI * 0.2)
  .setColor(new Vector4(1, 1, 1, 1))
  .setCastShadow(true);
new PointLight(scene, null)
  .setPosition(new Vector3(-20, 20, 5))
  .setRange(30)
  .setColor(new Vector4(0.4, 0.8, 0.7, 1));
new HemiSphericLight(scene, null)
  .setColorDown(new Vector4(0.1, 0.2, 0, 1))
  .setColorUp(new Vector4(0, 0.2, 0.4, 1));
*/
  //const sphereMaterial = new StandardMaterial(device);
  //const lm = new PBRLightModel();
  //lm.albedo = new Vector4(1, 1, 0, 1);
  //lm.metallic = 0.8;
  //lm.roughness = 0.2;
  //sphereMaterial.lightModel = lm;
  //new SphereMesh(scene, null, { radius: 8, verticalDetail: 40, horizonalDetail: 40 }).setPosition(new Vector3(0, 8, 0)).material = sphereMaterial;

  const planeMaterial = new PBRMetallicRoughnessMaterial(device);
  planeMaterial.lightModel.metallic = 0.1;
  planeMaterial.lightModel.roughness = 0.6;

  const floor = Mesh.unitBox(scene);
  floor.scaling = new Vector3(50, 10, 50);
  floor.position = new Vector3(-25, -5, -25);
  floor.castShadow = true;
  floor.material = planeMaterial;

  const sphere = Mesh.unitSphere(scene);
  sphere.scaling = new Vector3(10, 10, 10);
  sphere.position = new Vector3(0, 20, 0);
  sphere.material = planeMaterial;
  /*
  for (let i = -3; i <= 3; i++) {
    for (let j = -3; j <= 3; j++) {
      const box = Mesh.unitBox(scene);
      box.scaling = new Vector3(5, 20, 5);
      box.position = new Vector3(i * 30, 10, j * 30);
      box.material = planeMaterial;
    }
  }
  */

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

  let pause = false;
  sceneView.addEventListener('keydown', function (evt: REvent) {
    const keyEvent = evt as RKeyEvent;
    if (keyEvent.code === 'KeyP') {
      pause = !pause;
    }
  });

  scene.addEventListener('tick', () => {
    if (!pause) {
      const elapsed = device.frameInfo.elapsedOverall;
      if (pointlight) {
        pointlight.position.x = 15 * Math.sin(elapsed / 3000);
        pointlight.position.y = 25;
        pointlight.position.z = 15 * Math.cos(elapsed / 3000);
        pointlight.position.y = 30 + 15 * Math.sin(elapsed / 3000);
      }
      if (directionlight) {
        directionlight.setRotation(
          Quaternion.fromAxisAngle(Vector3.axisNX(), Math.PI * (0.5 + 0.25 * Math.sin(elapsed / 2000)))
        );
        directionlight.lookAt(
          new Vector3(0, 28, 0),
          new Vector3(40 * Math.cos(elapsed / 2000), 0, 40 * Math.sin(elapsed / 2000)),
          Vector3.axisPY()
        );
      }
    }
  });

  sceneView.addEventListener('draw', function (this: RElement, evt: REvent) {
    evt.preventDefault();
    scheme.renderScene(scene, camera);
  });

  device.runLoop((device) => gui.render());
})();
