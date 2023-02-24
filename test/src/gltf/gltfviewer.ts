import { Vector4, Vector3, Matrix4x4, AABB } from '@sophon/base';
import {
  SceneNode,
  BoundingBox,
  GraphNode,
  Material,
  Model,
  AssetManager,
  Scene,
  RenderScheme,
  Camera,
  DirectionalLight,
  BUILTIN_ASSET_TEXTURE_SHEEN_LUT,
  ForwardRenderScheme,
  OrbitCameraModel
} from '@sophon/scene';
import { GUI, Select, Option } from '@sophon/dom';

export class GLTFViewer {
  private _gui: GUI;
  private _animationSelector: Select;
  private _currentAnimation: string;
  private _modelNode: Model;
  private _assetManager: AssetManager;
  private _scene: Scene;
  private _scheme: RenderScheme;
  private _camera: Camera;
  private _light: DirectionalLight;
  private _fov: number;
  private _aspect: number;
  private _nearPlane: number;
  constructor(gui: GUI, scene: Scene) {
    this._gui = gui;
    this._animationSelector = this._gui.document.querySelector<Select>('#animation');
    this._currentAnimation = null;
    this._modelNode = null;
    this._scene = scene;
    this._assetManager = new AssetManager(scene.device);
    this._assetManager.fetchBuiltinTexture(BUILTIN_ASSET_TEXTURE_SHEEN_LUT);
    this._scheme = new ForwardRenderScheme(scene.device);
    this._fov = Math.PI / 3;
    this._aspect = 1;
    this._nearPlane = 1;
    this._camera = this._scene.addCamera();
    this._camera.position.set(0, 0, 15);
    this._camera.setModel(new OrbitCameraModel());
    this._light = new DirectionalLight(this._scene).setColor(new Vector4(1, 1, 1, 1)).setCastShadow(false);
    this._light.shadow.shadowMapSize = 1024;
    this._light.lookAt(new Vector3(10, 10, 10), new Vector3(0, 0, 0), Vector3.axisPY());
    Material.setGCOptions({
      drawableCountThreshold: 0,
      materialCountThreshold: 0,
      inactiveTimeDuration: 10000,
      verbose: true
    });
    this._animationSelector.addEventListener('change', () => {
      if (this._animationSelector.value === 'none') {
        this.stopAnimation();
      } else {
        this.playAnimation(this._animationSelector.value);
      }
    });
  }
  get light(): DirectionalLight {
    return this._light;
  }
  get FOV(): number {
    return this._fov;
  }
  set FOV(val: number) {
    if (val !== this._fov) {
      this._fov = val;
      this.lookAt();
    }
  }
  get aspect(): number {
    return this._aspect;
  }
  set aspect(val: number) {
    if (val !== this._aspect) {
      this._aspect = val;
      this.lookAt();
    }
  }
  get camera(): Camera {
    return this._camera;
  }
  get scene(): Scene {
    return this._scene;
  }
  get animations(): string[] {
    return this._modelNode?.getAnimationNames() || [];
  }
  handleDrop(data: DataTransfer) {
    this.resolveDraggedItems(data).then((fileMap) => {
      if (fileMap) {
        console.log(fileMap);
        this._assetManager.httpRequest.urlResolver = (url) => {
          return fileMap.get(url) || url;
        };
        const modelFile = Array.from(fileMap.keys()).find((val) => /(\.gltf|\.glb)$/i.test(val));
        if (modelFile) {
          this._modelNode?.remove();
          this._assetManager.clearCache();
          this._assetManager.createModelNode(this._scene, modelFile, null).then((node) => {
            this._modelNode = node;
            this._modelNode.pickMode = GraphNode.PICK_ENABLED;
            this.lookAt();
            this._currentAnimation = null;
            while (this._animationSelector.firstChild) {
              this._animationSelector.removeChild(this._animationSelector.firstChild);
            }
            const optionNoAnimation = this._gui.document.createElement<Option>('option');
            optionNoAnimation.textContent = 'No animation';
            optionNoAnimation.setAttribute('value', 'none');
            this._animationSelector.appendChild(optionNoAnimation);
            let activeAnimation: string = null;
            for (let i = 0; i < this.animations.length; i++) {
              const name = this.animations[i];
              const option = this._gui.document.createElement<Option>('option');
              option.textContent = name;
              option.setAttribute('value', name);
              if (i === 0) {
                option.setAttribute('selected', 'selected');
                activeAnimation = name;
              }
              this._animationSelector.appendChild(option);
            }
            fileMap.forEach((val, key) => {
              // URL.revokeObjectURL(val);
            });
            this.playAnimation(activeAnimation);
          });
        }
      }
    });
  }
  playAnimation(name: string) {
    if (this._currentAnimation !== name) {
      this.stopAnimation();
      this._modelNode?.playAnimation(name, 0);
      this._currentAnimation = name;
      this.lookAt();
    }
  }
  stopAnimation() {
    if (this._currentAnimation) {
      this._modelNode?.stopAnimation(this._currentAnimation);
      this._currentAnimation = null;
      this.lookAt();
    }
  }
  enableShadow(enable: boolean) {
    this._light.setCastShadow(enable);
  }
  raycast(screenX: number, screenY: number): GraphNode {
    return this._scene.raycast(this._camera, screenX, screenY);
  }
  render() {
    this._scheme.renderScene(this._scene, this._camera);
  }
  lookAt() {
    const bbox = this.getBoundingBox();
    const minSize = 10;
    const maxSize = 100;
    if (bbox) {
      const center = bbox.center;
      const extents = bbox.extents;
      let size = Math.max(extents.x, extents.y);
      if (size < minSize || size > maxSize) {
        const scale = size < minSize ? minSize / size : maxSize / size;
        this._modelNode.scaling.scaleBy(scale);
        center.scaleBy(scale);
        extents.scaleBy(scale);
        size *= scale;
      }
      const dist = size / Math.tan(this._fov * 0.5) + extents.z + this._nearPlane;

      this._camera.lookAt(
        Vector3.add(center, Vector3.scale(Vector3.axisPZ(), dist)),
        center,
        Vector3.axisPY()
      );
      this._camera.setProjectionMatrix(
        Matrix4x4.perspective(
          this._camera.getFOV(),
          this._aspect,
          Math.min(1, this._camera.getNearPlane()),
          Math.max(10, dist + extents.z + 100)
        )
      );
      (this._camera.model as OrbitCameraModel).setOptions({ distance: dist });
    }
  }
  private getBoundingBox(): AABB {
    const bbox = new BoundingBox();
    bbox.beginExtend();
    this.traverseModel((node) => {
      if (node.isGraphNode()) {
        const aabb = node.getWorldBoundingVolume()?.toAABB();
        if (aabb && aabb.isValid()) {
          bbox.extend(aabb.minPoint);
          bbox.extend(aabb.maxPoint);
        }
      }
    });
    return bbox.isValid() ? bbox : null;
  }
  private traverseModel(func: (node: SceneNode) => void, context?: any) {
    if (this._modelNode) {
      const queue: SceneNode[] = [this._modelNode];
      while (queue.length > 0) {
        const node = queue.shift();
        queue.push(...node.children);
        if (node.isMesh()) {
          func.call(context, node);
        }
      }
    }
  }
  private async readDirectoryEntry(entry: FileSystemDirectoryEntry): Promise<FileSystemEntry[]> {
    return new Promise((resolve, reject) => {
      entry.createReader().readEntries(
        (fileEntries) => resolve(fileEntries),
        (err) => reject(err)
      );
    });
  }
  private async resolveDirectoryEntries(
    files: File[],
    entries: FileSystemEntry[]
  ): Promise<Map<string, { entry: FileSystemEntry; file: File }>> {
    const map: Map<string, { entry: FileSystemEntry; file: File }> = new Map();
    let i = 0;
    while (i < entries.length) {
      const entry = entries[i];
      if (entry.isDirectory) {
        entries.splice(i, 1);
        if (i < files.length) {
          files.splice(i, 1);
        }
        entries.push(...(await this.readDirectoryEntry(entry as FileSystemDirectoryEntry)));
      } else {
        map.set(entry.fullPath, {
          entry,
          file: i < files.length ? files[i] : null
        });
        i++;
      }
    }
    return map;
  }
  private async resolveFileEntries(
    map: Map<string, { entry: FileSystemEntry; file: File }>
  ): Promise<Map<string, string>> {
    const result: Map<string, string> = new Map();
    const promises = Array.from(map.entries()).map(
      (entry) =>
        new Promise<File>((resolve, reject) => {
          const key = `/${entry[0]
            .slice(1)
            .split('/')
            .map((val) => encodeURIComponent(val))
            .join('/')}`;
          if (entry[1].file) {
            result.set(key, URL.createObjectURL(entry[1].file));
            resolve(null);
          } else {
            (entry[1].entry as FileSystemFileEntry).file(
              (f) => {
                result.set(key, URL.createObjectURL(f));
                resolve(null);
              },
              (err) => reject(err)
            );
          }
        })
    );
    await Promise.all(promises);
    return result;
  }
  private async resolveDraggedItems(data: DataTransfer): Promise<Map<string, string>> {
    const files = Array.from(data.files);
    const entries = Array.from(data.items).map((item) => item.webkitGetAsEntry());
    const modelFile = files.find((file) => /(\.gltf|\.glb)$/i.test(file.name));
    if (!modelFile) {
      return null;
    }
    const map = await this.resolveDirectoryEntries(files, entries);
    const result = await this.resolveFileEntries(map);
    return result;
  }
}
