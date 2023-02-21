/** sophon base library */
import { isPowerOf2, nextPowerOf2, Vector3 } from '@sophon/base';
import { TextureFilter, TextureWrapping, TextureFormat } from '../../device/base_types.js';
import { GLTFLoader } from './loaders/gltf/gltf_loader.js';
import { WebImageLoader } from './loaders/image/webimage_loader.js';
import { DDSLoader } from './loaders/dds/dds_loader.js';
import { SceneNode } from '../scene_node.js';
import { Mesh } from '../mesh.js';
import { Model } from '../model.js';
import { Skeleton } from '../skeleton.js';
import { BoundingBox } from '../bounding_volume.js';
import '../../device/render_states.js';
import '../../device/gpuobject.js';
import { GammaBlitter } from '../blitter/gamma.js';
import { getSheenLutLoader } from './builtin.js';
import { GraphNode } from '../graph_node.js';
import { BUILTIN_ASSET_TEXTURE_SHEEN_LUT } from '../values.js';

class AssetManager {
    static _builtinTextures = {};
    static _builtinTextureLoaders = {
        [BUILTIN_ASSET_TEXTURE_SHEEN_LUT]: getSheenLutLoader(64)
    };
    _device;
    _urlResolver;
    _textureLoaders;
    _modelLoaders;
    _textures;
    _textures_nomipmap;
    _textures_srgb;
    _textures_srgb_nomipmap;
    _models;
    _binaryDatas;
    _textDatas;
    static _tempElement = null;
    constructor(device) {
        this._device = device;
        this._urlResolver = null;
        this._textureLoaders = [new WebImageLoader(), new DDSLoader()];
        this._modelLoaders = [new GLTFLoader()];
        this._textures = {};
        this._textures_nomipmap = {};
        this._textures_srgb = {};
        this._textures_srgb_nomipmap = {};
        this._models = {};
        this._binaryDatas = {};
        this._textDatas = {};
    }
    get urlResolver() {
        return this._urlResolver;
    }
    set urlResolver(resolver) {
        this._urlResolver = resolver;
    }
    get device() {
        return this._device;
    }
    async request(url, headers = {}, crossOrigin = 'anonymous') {
        url = this._urlResolver ? this._urlResolver(url) : this.resolveURL(url);
        return url ? fetch(url, {
            credentials: crossOrigin === 'anonymous' ? 'same-origin' : 'include',
            headers: headers
        }) : null;
    }
    resolveURL(url) {
        if (!AssetManager._tempElement) {
            AssetManager._tempElement = document.createElement('a');
        }
        AssetManager._tempElement.href = url;
        return AssetManager._tempElement.href;
    }
    clearCache() {
        this._textures = {};
        this._textures_nomipmap = {};
        this._textures_srgb = {};
        this._textures_srgb_nomipmap = {};
        this._models = {};
        this._binaryDatas = {};
        this._textDatas = {};
    }
    addTextureLoader(loader) {
        if (loader) {
            this._textureLoaders.unshift(loader);
        }
    }
    addModelLoader(loader) {
        if (loader) {
            this._modelLoaders.unshift(loader);
        }
    }
    async fetchTextData(url) {
        let P = this._textDatas[url];
        if (!P) {
            P = this.loadTextData(url);
            this._textDatas[url] = P;
        }
        return P;
    }
    async fetchBinaryData(url) {
        let P = this._binaryDatas[url];
        if (!P) {
            P = this.loadBinaryData(url);
            this._binaryDatas[url] = P;
        }
        return P;
    }
    async fetchTexture(url, mimeType, srgb, noMipmap) {
        const textures = srgb ? noMipmap ? this._textures_srgb_nomipmap : this._textures_srgb : noMipmap ? this._textures_nomipmap : this._textures;
        let P = textures[url];
        if (!P) {
            P = this.loadTexture(url, mimeType, srgb, noMipmap);
            textures[url] = P;
        }
        return P;
    }
    async fetchModel(scene, url, mimeType) {
        let P = this._models[url];
        if (!P) {
            P = this.loadModel(url, mimeType);
            this._models[url] = P;
        }
        return P;
    }
    async createModelNode(scene, url, mimeType) {
        const sharedModel = await this.fetchModel(scene, url, mimeType);
        return this.createSceneNode(scene, sharedModel);
    }
    async loadTextData(url) {
        const response = await this.request(url);
        if (!response.ok) {
            throw new Error(`Asset download failed: ${url}`);
        }
        return await response.text();
    }
    async loadBinaryData(url) {
        const response = await this.request(url);
        if (!response.ok) {
            throw new Error(`Asset download failed: ${url}`);
        }
        return await response.arrayBuffer();
    }
    async loadTexture(url, mimeType, srgb, noMipmap, texture) {
        const response = await this.request(url);
        if (!response.ok) {
            throw new Error(`Asset download failed: ${url}`);
        }
        const data = await response.arrayBuffer();
        let ext = '';
        let filename = '';
        const dataUriMatchResult = url.match(/^data:([^;]+)/);
        if (dataUriMatchResult) {
            mimeType = mimeType || dataUriMatchResult[1];
        }
        else {
            filename = new URL(url, new URL(location.href).origin).pathname.split('/').filter(val => !!val).slice(-1)[0];
            const p = filename ? filename.lastIndexOf('.') : -1;
            ext = p >= 0 ? filename.substring(p).toLowerCase() : null;
            if (!mimeType) {
                if (ext === '.jpg' || ext === '.jpeg') {
                    mimeType = 'image/jpg';
                }
                else if (ext === '.png') {
                    mimeType = 'image/png';
                }
            }
        }
        for (const loader of this._textureLoaders) {
            if ((!ext || !loader.supportExtension(ext)) && (!mimeType || !loader.supportMIMEType(mimeType))) {
                continue;
            }
            const tex = await this.doLoadTexture(loader, filename, mimeType, data, !!srgb, !!noMipmap, texture);
            tex.name = filename;
            if (url.match(/^blob:/)) {
                tex.restoreHandler = async (tex) => {
                    await this.doLoadTexture(loader, filename, mimeType, data, !!srgb, !!noMipmap, tex);
                };
            }
            else {
                tex.restoreHandler = async (tex) => {
                    await this.loadTexture(url, mimeType, srgb, noMipmap, tex);
                };
            }
            return tex;
        }
        throw new Error(`Can not find loader for asset ${url}`);
    }
    async doLoadTexture(loader, url, mimeType, data, srgb, noMipmap, texture) {
        if (this.device.getDeviceType() !== 'webgl') {
            return await loader.load(this, url, mimeType, data, srgb, noMipmap, texture);
        }
        else {
            let tex = await loader.load(this, url, mimeType, data, srgb, noMipmap);
            if (texture) {
                const magFilter = tex.width !== texture.width || tex.height !== texture.height ? TextureFilter.Linear : TextureFilter.Nearest;
                const minFilter = magFilter;
                const mipFilter = TextureFilter.None;
                const sampler = this.device.createSampler({
                    addressU: TextureWrapping.ClampToEdge,
                    addressV: TextureWrapping.ClampToEdge,
                    magFilter,
                    minFilter,
                    mipFilter
                });
                const blitter = new GammaBlitter(1);
                blitter.blit(tex, texture, sampler);
                tex = texture;
            }
            else if (!noMipmap && (tex.isTexture2D() || tex.isTextureCube()) && (srgb || !isPowerOf2(tex.width) || !isPowerOf2(tex.height))) {
                const newWidth = !noMipmap && !isPowerOf2(tex.width) ? nextPowerOf2(tex.width) : tex.width;
                const newHeight = !noMipmap && !isPowerOf2(tex.height) ? nextPowerOf2(tex.height) : tex.height;
                const magFilter = newWidth !== tex.width || newHeight !== tex.height ? TextureFilter.Linear : TextureFilter.Nearest;
                const minFilter = magFilter;
                const mipFilter = TextureFilter.None;
                const sampler = this.device.createSampler({
                    addressU: TextureWrapping.ClampToEdge,
                    addressV: TextureWrapping.ClampToEdge,
                    magFilter,
                    minFilter,
                    mipFilter
                });
                const blitter = new GammaBlitter(1);
                const newTexture = tex.isTexture2D()
                    ? this.device.createTexture2D(TextureFormat.RGBA8UNORM, newWidth, newHeight, { colorSpace: 'linear' })
                    : this.device.createCubeTexture(TextureFormat.RGBA8UNORM, newWidth, { colorSpace: 'linear' });
                blitter.blit(tex, newTexture, sampler);
                tex.dispose();
                tex = newTexture;
            }
            return tex;
        }
    }
    async loadModel(url, mimeType, name) {
        const response = await this.request(url);
        if (!response.ok) {
            throw new Error(`Asset download failed: ${url}`);
        }
        const data = await response.blob();
        const filename = new URL(url, new URL(location.href).origin).pathname.split('/').filter(val => !!val).slice(-1)[0];
        const p = filename ? filename.lastIndexOf('.') : -1;
        const ext = p >= 0 ? filename.substring(p) : null;
        for (const loader of this._modelLoaders) {
            if (!loader.supportExtension(ext) && !loader.supportMIMEType(mimeType || data.type)) {
                continue;
            }
            const model = await loader.load(this, url, mimeType || data.type, data);
            if (!model) {
                throw new Error(`Load asset failed: ${url}`);
            }
            model.name = name || filename;
            return model;
        }
        throw new Error(`Can not find loader for asset ${url}`);
    }
    async fetchBuiltinTexture(name) {
        let P = AssetManager._builtinTextures[name];
        const loader = AssetManager._builtinTextureLoaders[name];
        if (!P) {
            if (!loader) {
                throw new Error(`Unknown builtin texture name: ${name}`);
            }
            P = loader(this.device);
            AssetManager._builtinTextures[name] = P;
        }
        const tex = await P;
        tex.restoreHandler = async (tex) => {
            await loader(this.device, tex);
        };
        return tex;
    }
    createSceneNode(scene, model, sceneIndex) {
        const node = new Model(scene);
        node.name = model.name;
        for (let i = 0; i < model.scenes.length; i++) {
            if (typeof sceneIndex === 'number' && sceneIndex >= 0 && i !== sceneIndex) {
                continue;
            }
            else if ((sceneIndex === undefined || sceneIndex === null) && model.activeScene >= 0 && i !== model.activeScene) {
                continue;
            }
            const assetScene = model.scenes[i];
            const skeletonMeshMap = new Map();
            const nodeMap = new Map();
            for (let k = 0; k < assetScene.rootNodes.length; k++) {
                this.setAssetNodeToSceneNode(scene, node, model, assetScene.rootNodes[k], skeletonMeshMap, nodeMap);
            }
            for (const animationData of model.animations) {
                const animation = node.addAnimation(animationData.name);
                if (animation) {
                    for (const track of animationData.tracks) {
                        animation.addAnimationTrack(nodeMap.get(track.node), track.interpolator);
                    }
                    for (const sk of animationData.skeletons) {
                        const nodes = skeletonMeshMap.get(sk);
                        if (nodes) {
                            const skeleton = new Skeleton(sk.joints.map(val => nodeMap.get(val)), sk.inverseBindMatrices, sk.bindPoseMatrices);
                            skeleton.updateJointMatrices(scene.device);
                            animation.addSkeleton(skeleton, nodes.mesh, nodes.bounding.map(val => this.getBoundingInfo(skeleton, val)));
                        }
                    }
                }
                animation.stop();
            }
        }
        return node;
    }
    static setBuiltinTextureLoader(name, loader) {
        if (loader) {
            this._builtinTextureLoaders[name] = loader;
        }
        else {
            delete this._builtinTextureLoaders[name];
        }
    }
    getBoundingInfo(skeleton, meshData) {
        const indices = [0, 0, 0, 0, 0, 0];
        let minx = Number.MAX_VALUE;
        let maxx = -Number.MAX_VALUE;
        let miny = Number.MAX_VALUE;
        let maxy = -Number.MAX_VALUE;
        let minz = Number.MAX_VALUE;
        let maxz = -Number.MAX_VALUE;
        const v = meshData.rawPositions;
        const vert = new Vector3();
        const tmpV0 = new Vector3();
        const tmpV1 = new Vector3();
        const tmpV2 = new Vector3();
        const tmpV3 = new Vector3();
        const numVertices = Math.floor(v.length / 3);
        for (let i = 0; i < numVertices; i++) {
            vert.set(v[i * 3], v[i * 3 + 1], v[i * 3 + 2]);
            skeleton.jointMatrices[meshData.rawBlendIndices[i * 4 + 0]].transformPointAffine(vert, tmpV0).scaleBy(meshData.rawJointWeights[i * 4 + 0]);
            skeleton.jointMatrices[meshData.rawBlendIndices[i * 4 + 1]].transformPointAffine(vert, tmpV1).scaleBy(meshData.rawJointWeights[i * 4 + 1]);
            skeleton.jointMatrices[meshData.rawBlendIndices[i * 4 + 2]].transformPointAffine(vert, tmpV2).scaleBy(meshData.rawJointWeights[i * 4 + 2]);
            skeleton.jointMatrices[meshData.rawBlendIndices[i * 4 + 3]].transformPointAffine(vert, tmpV3).scaleBy(meshData.rawJointWeights[i * 4 + 3]);
            tmpV0.addBy(tmpV1).addBy(tmpV2).addBy(tmpV3);
            if (tmpV0.x < minx) {
                minx = tmpV0.x;
                indices[0] = i;
            }
            if (tmpV0.x > maxx) {
                maxx = tmpV0.x;
                indices[1] = i;
            }
            if (tmpV0.y < miny) {
                miny = tmpV0.y;
                indices[2] = i;
            }
            if (tmpV0.y > maxy) {
                maxy = tmpV0.y;
                indices[3] = i;
            }
            if (tmpV0.z < minz) {
                minz = tmpV0.z;
                indices[4] = i;
            }
            if (tmpV0.z > maxz) {
                maxz = tmpV0.z;
                indices[5] = i;
            }
        }
        const info = {
            boundingVertexBlendIndices: new Float32Array(Array.from({ length: 6 * 4 }).map((val, index) => meshData.rawBlendIndices[indices[index >> 2] * 4 + index % 4])),
            boundingVertexJointWeights: new Float32Array(Array.from({ length: 6 * 4 }).map((val, index) => meshData.rawJointWeights[indices[index >> 2] * 4 + index % 4])),
            boundingVertices: Array.from({ length: 6 }).map((val, index) => new Vector3(meshData.rawPositions[indices[index] * 3], meshData.rawPositions[indices[index] * 3 + 1], meshData.rawPositions[indices[index] * 3 + 2])),
            boundingBox: new BoundingBox,
        };
        return info;
    }
    setAssetNodeToSceneNode(scene, parent, model, assetNode, skeletonMeshMap, nodeMap) {
        const node = new SceneNode(scene);
        nodeMap.set(assetNode, node);
        node.name = `${assetNode.name}`;
        node.position = assetNode.position;
        node.rotation = assetNode.rotation;
        node.scaling = assetNode.scaling;
        if (assetNode.mesh) {
            const meshData = assetNode.mesh;
            const skeleton = assetNode.skeleton;
            for (const subMesh of meshData.subMeshes) {
                const meshNode = new Mesh(scene);
                meshNode.renderOrder = GraphNode.ORDER_INHERITED;
                meshNode.clipMode = GraphNode.CLIP_INHERITED;
                meshNode.showState = GraphNode.SHOW_INHERITED;
                meshNode.pickMode = GraphNode.PICK_INHERITED;
                meshNode.primitive = subMesh.primitive;
                meshNode.material = subMesh.material;
                meshNode.reparent(node);
                if (skeleton) {
                    if (!skeletonMeshMap.has(skeleton)) {
                        skeletonMeshMap.set(skeleton, { mesh: [meshNode], bounding: [subMesh] });
                    }
                    else {
                        skeletonMeshMap.get(skeleton).mesh.push(meshNode);
                        skeletonMeshMap.get(skeleton).bounding.push(subMesh);
                    }
                }
            }
        }
        node.reparent(parent);
        for (const child of assetNode.children) {
            this.setAssetNodeToSceneNode(scene, node, model, child, skeletonMeshMap, nodeMap);
        }
    }
}

export { AssetManager };
//# sourceMappingURL=assetmanager.js.map
