import { Vector3, Vector4, Quaternion, Matrix4x4, REvent } from '@sophon/base';
import { Device, DeviceType } from '@sophon/device';
import { Scene, ForwardRenderScheme, FPSCameraModel, DirectionalLight } from '@sophon/scene';
import { GUI, RElement, RKeyEvent } from '@sophon/dom';
import * as common from '../common';
import { loadEarthSculptorMap } from './earthscuptor';

(async function () {
  const type = (common.getQueryString('dev') as DeviceType) || 'webgl';
  const device = await Device.create(document.getElementById('canvas') as HTMLCanvasElement, type, { msaa: true });
  const gui = new GUI(device);

  await gui.deserializeFromXML(document.querySelector('#main-ui').innerHTML);
  const sceneView = gui.document.querySelector('#scene-view');
  sceneView.customDraw = true;
  const scene = new Scene(device);
  const scheme = new ForwardRenderScheme(device);
  const camera = scene.addCamera();
  camera.setProjectionMatrix(
    Matrix4x4.perspective(
      Math.PI / 3,
      device.getDrawingBufferWidth() / device.getDrawingBufferHeight(),
      1,
      300
    )
  );
  camera.mouseInputSource = sceneView;
  camera.keyboardInputSource = sceneView;
  camera.setModel(new FPSCameraModel({ moveSpeed: 0.5 }));
  scene.envLightStrength = 0.5;

  const light = new DirectionalLight(scene).setColor(new Vector4(1, 1, 1, 1)).setCastShadow(false);
  light.lookAt(new Vector3(10, 3, 10), new Vector3(0, 0, 0), Vector3.axisPY());
  light.shadow.shadowMapSize = 2048;
  light.shadow.numShadowCascades = 4;

  common.createTestPanel(scene, sceneView, {
    width: '200px'
  });
  common.createSceneTweakPanel(scene, sceneView, { width: '200px' });
  common.createTextureViewPanel(device, sceneView, 300);
  common.createLightTweakPanel(light, sceneView, {
    width: '200px'
  });

  function loadTerrain(filename) {
    loadEarthSculptorMap(scene, filename).then((terrain) => {
      terrain.castShadow = true;
      const eyePos = terrain.getBoundingVolume().toAABB().maxPoint;
      const destPos = terrain.getBoundingVolume().toAABB().center;
      camera.lookAt(eyePos, destPos, Vector3.axisPY());
      let timer: number = null;
      let rot = 0;
      sceneView.addEventListener('keydown', function (evt: REvent) {
        const keyEvent = evt as RKeyEvent;
        if (keyEvent.code === 'Space') {
          terrain.wireframe = !terrain.wireframe;
        } else if (keyEvent.code === 'KeyR') {
          if (timer !== null) {
            window.clearInterval(timer);
            terrain.scaling.set(1, 1, 1);
            terrain.rotation.identity();
            terrain.position.set(0, 0, 0);
            timer = null;
          } else {
            timer = window.setInterval(() => {
              const center = terrain.getBoundingVolume().toAABB().center;
              const t1 = Matrix4x4.translation(new Vector3(-center.x, 0, -center.z));
              const r = Quaternion.fromAxisAngle(Vector3.axisPY(), rot).toMatrix4x4();
              const t2 = Matrix4x4.translation(new Vector3(center.x, 0, center.z));
              const matrix = Matrix4x4.multiply(Matrix4x4.multiply(t2, r), t1);
              matrix.decompose(terrain.scaling, terrain.rotation, terrain.position);
              rot += 0.02;
            }, 20);
          }
        }
      });
    });
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

  sceneView.addEventListener('draw', function (this: RElement, evt: REvent) {
    evt.preventDefault();
    scheme.renderScene(scene, camera);
  });

  loadTerrain('./assets/maps/map1/test1.map');
  device.runLoop((device) => gui.render());
})();
