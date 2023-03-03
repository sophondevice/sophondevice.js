import { Vector3, Vector4, Quaternion, REvent } from '@sophon/base';
import { Device, DeviceType } from '@sophon/device';
import {
  Scene,
  ForwardRenderScheme,
  OrbitCameraModel,
  AssetManager,
  PBRMetallicRoughnessMaterial,
  Mesh,
  DirectionalLight
} from '@sophon/scene';
import { GUI, RElement } from '@sophon/dom';
import * as common from '../common';

(async function () {
  const type = (common.getQueryString('dev') as DeviceType) || 'webgl';
  const device = await Device.create(document.getElementById('canvas') as HTMLCanvasElement, type, { msaa: true });
  const gui = new GUI(device);
  await gui.deserializeFromXML(document.querySelector('#main-ui').innerHTML);
  const sceneView = gui.document.querySelector('#scene-view');
  const group = gui.document.querySelector('#button-group');
  sceneView.customDraw = true;
  const scene = new Scene(device);
  const scheme = new ForwardRenderScheme(device);
  const camera = scene.addCamera().setPosition(new Vector3(0, 0, 60));
  camera.mouseInputSource = sceneView;
  camera.keyboardInputSource = sceneView;
  camera.setModel(new OrbitCameraModel({ distance: camera.position.magnitude }));
  common.createTestPanel(scene, group);
  common.createSceneTweakPanel(scene, group, { width: '200px' });
  const assetManager = new AssetManager(device);

  const boxMaterial = new PBRMetallicRoughnessMaterial(device);
  boxMaterial.lightModel.setAlbedoMap(
    await assetManager.fetchTexture('./assets/images/rustediron2_basecolor.png', null, true),
    null,
    0
  );
  boxMaterial.lightModel.setNormalMap(
    await assetManager.fetchTexture('./assets/images/rustediron2_normal.png', null, false),
    null,
    0
  );
  boxMaterial.lightModel.setMetallicMap(
    await assetManager.fetchTexture('./assets/images/mr.png', null, false),
    null,
    0
  );
  boxMaterial.lightModel.metallicIndex = 0;
  boxMaterial.lightModel.roughnessIndex = 1;
  for (let x = -20; x <= 20; x += 2) {
    for (let y = -20; y <= 20; y += 2) {
      for (let z = -20; z <= 20; z += 2) {
        const instance = Mesh.unitBox(scene);
        instance.material = boxMaterial;
        instance.position.set(x, y, z);
      }
    }
  }

  const light = new DirectionalLight(scene)
    .setCastShadow(false)
    .setColor(new Vector4(1, 1, 1, 1))
    .setRotation(Quaternion.fromAxisAngle(new Vector3(1, 1, 0).inplaceNormalize(), (Math.PI * 2) / 3));

  sceneView.addEventListener('draw', function (this: RElement, evt: REvent) {
    evt.preventDefault();
    scheme.renderScene(scene, camera);
  });

  device.runLoop((device) => gui.render());
})();
