/** sophon base library */
import { Matrix4x4, Vector3, Quaternion, Vector4 } from '@sophon/base';
import { TextureWrapping, TextureFilter, PrimitiveType } from '../../../../device/base_types.js';
import { FaceMode } from '../../../../device/render_states.js';
import { VERTEX_ATTRIB_POSITION, getVertexBufferAttribType, VERTEX_ATTRIB_BLEND_INDICES, VERTEX_ATTRIB_BLEND_WEIGHT, VERTEX_ATTRIB_DIFFUSE, VERTEX_ATTRIB_TEXCOORD7, VERTEX_ATTRIB_TEXCOORD6, VERTEX_ATTRIB_TEXCOORD5, VERTEX_ATTRIB_TEXCOORD4, VERTEX_ATTRIB_TEXCOORD3, VERTEX_ATTRIB_TEXCOORD2, VERTEX_ATTRIB_TEXCOORD1, VERTEX_ATTRIB_TEXCOORD0, VERTEX_ATTRIB_TANGENT, VERTEX_ATTRIB_NORMAL, getVertexAttribName } from '../../../../device/gpuobject.js';
import { PBStructTypeInfo, PBArrayTypeInfo, PBPrimitiveTypeInfo, makePrimitiveType, I8_BITMASK, U8_BITMASK, I16_BITMASK, U16_BITMASK, I32_BITMASK, U32_BITMASK, F32_BITMASK } from '../../../../device/builder/types.js';
import { AssetScene, AssetSkeleton, SharedModel } from '../../model.js';
import { BoundingBox } from '../../../bounding_volume.js';
import { Primitive } from '../../../primitive.js';
import '../../../material.js';
import '../../../../device/builder/ast.js';
import '../../../../device/builder/builtinfunc.js';
import '../../../../device/builder/constructors.js';
import { BUILTIN_ASSET_TEXTURE_SHEEN_LUT } from '../../../values.js';
import '../../../materiallib/lightmodel.js';
import { UnlitMaterial } from '../../../materiallib/unlit.js';
import { PBRSpecularGlossinessMaterial, PBRMetallicRoughnessMaterial } from '../../../materiallib/pbr.js';
import { GLTFAccessor } from './helpers.js';
import { InterpolationMode, InterpolationTarget, Interpolator } from '../../../interpolator.js';
import { AbstractModelLoader } from '../loader.js';

class GLTFLoader extends AbstractModelLoader {
    supportExtension(ext) {
        return ext === '.gltf' || ext === '.glb';
    }
    supportMIMEType(mimeType) {
        return mimeType === 'model/gltf+json' || mimeType === 'model/gltf-binary';
    }
    async load(assetManager, url, mimeType, data) {
        const buffer = await data.arrayBuffer();
        if (this.isGLB(buffer)) {
            return this.loadBinary(assetManager, url, buffer);
        }
        const gltf = await new Response(data).json();
        gltf._manager = assetManager;
        gltf._loadedBuffers = null;
        return this.loadJson(url, gltf);
    }
    async loadBinary(assetManager, url, buffer) {
        const jsonChunkType = 0x4E4F534A;
        const binaryChunkType = 0x004E4942;
        let gltf = null;
        const buffers = [];
        const chunkInfos = this.getGLBChunkInfos(buffer);
        for (const info of chunkInfos) {
            if (info.type === jsonChunkType && !gltf) {
                const jsonSlice = new Uint8Array(buffer, 20, info.length);
                const stringBuffer = new TextDecoder('utf-8').decode(jsonSlice);
                gltf = JSON.parse(stringBuffer);
            }
            else if (info.type === binaryChunkType) {
                buffers.push(buffer.slice(info.start, info.start + info.length));
            }
        }
        if (gltf) {
            gltf._manager = assetManager;
            gltf._loadedBuffers = buffers;
            return this.loadJson(url, gltf);
        }
        return null;
    }
    async loadJson(url, gltf) {
        console.log(`GLTF extensions used: ${gltf.extensionsUsed || []}`);
        gltf._accessors = [];
        gltf._bufferCache = {};
        gltf._textureCache = {};
        gltf._primitiveCache = {};
        gltf._materialCache = {};
        gltf._accessorCache = {};
        gltf._nodes = [];
        gltf._meshes = [];
        const asset = gltf.asset;
        if (asset) {
            const gltfVersion = asset.version;
            if (gltfVersion !== '2.0') {
                console.error(`Invalid GLTF version: ${gltfVersion}`);
                return null;
            }
        }
        gltf._baseURI = url.substring(0, url.lastIndexOf('/') + 1);
        if (!gltf._loadedBuffers) {
            gltf._loadedBuffers = [];
            const buffers = gltf.buffers;
            if (buffers) {
                for (const buffer of buffers) {
                    const uri = this._normalizeURI(gltf._baseURI, buffer.uri);
                    const buf = await gltf._manager.fetchBinaryData(uri);
                    if (buffer.byteLength !== buf.byteLength) {
                        console.error(`Invalid GLTF: buffer byte length error.`);
                        return null;
                    }
                    gltf._loadedBuffers.push(buf);
                }
            }
        }
        const accessors = gltf.accessors;
        if (accessors) {
            for (const accessor of gltf.accessors) {
                gltf._accessors.push(new GLTFAccessor(accessor));
            }
        }
        const scenes = gltf.scenes;
        if (scenes) {
            const sharedModel = new SharedModel();
            await this._loadMeshes(gltf, sharedModel);
            this._loadNodes(gltf, sharedModel);
            this._loadSkins(gltf, sharedModel);
            for (let i = 0; i < gltf.nodes?.length; i++) {
                if (typeof gltf.nodes[i].skin === 'number' && gltf.nodes[i].skin >= 0) {
                    gltf._nodes[i].skeleton = sharedModel.skeletons[gltf.nodes[i].skin];
                }
            }
            this._loadAnimations(gltf, sharedModel);
            for (const scene of scenes) {
                const assetScene = new AssetScene(scene.name);
                for (const node of scene.nodes) {
                    assetScene.rootNodes.push(gltf._nodes[node]);
                }
                sharedModel.scenes.push(assetScene);
            }
            if (typeof gltf.scene === 'number') {
                sharedModel.activeScene = gltf.scene;
            }
            return sharedModel;
        }
        return null;
    }
    _normalizeURI(baseURI, uri) {
        const s = uri.toLowerCase();
        if (s.startsWith('http://')
            || s.startsWith('https://')
            || s.startsWith('blob:')
            || s.startsWith('data:')) {
            return encodeURI(uri);
        }
        uri = uri.replace(/\.\//g, '');
        uri = decodeURIComponent(uri);
        if (uri[0] === '/') {
            uri = uri.slice(1);
        }
        uri = uri.split('/').map(val => encodeURIComponent(val)).join('/');
        return baseURI + uri;
    }
    _loadNodes(gltf, model) {
        if (gltf.nodes) {
            for (let i = 0; i < gltf.nodes.length; i++) {
                this._loadNode(gltf, i, null, model);
            }
            for (const node of gltf._nodes) {
                if (!node.parent) {
                    node.computeTransforms(null);
                }
            }
        }
    }
    _loadSkins(gltf, model) {
        if (gltf.skins) {
            for (let i = 0; i < gltf.skins.length; i++) {
                const skinInfo = gltf.skins[i];
                const skeleton = new AssetSkeleton(skinInfo.name);
                if (typeof skinInfo.skeleton === 'number') {
                    skeleton.pivot = gltf._nodes[skinInfo.skeleton];
                }
                const accessor = gltf._accessors[skinInfo.inverseBindMatrices];
                if (!accessor || accessor.type !== 'MAT4' || accessor.componentType !== 5126) {
                    throw new Error('Invalid GLTF inverse bind matricies accessor');
                }
                const matrices = typeof skinInfo.inverseBindMatrices === 'number' ? accessor.getDeinterlacedView(gltf) : null;
                skinInfo.joints.forEach((joint, index) => {
                    const m = index * 16;
                    skeleton.addJoint(gltf._nodes[joint], matrices ? new Matrix4x4(matrices.subarray(m, m + 16)) : Matrix4x4.identity());
                });
                model.addSkeleton(skeleton);
            }
        }
    }
    _loadAnimations(gltf, model) {
        if (gltf.animations) {
            for (let i = 0; i < gltf.animations.length; i++) {
                const animation = this._loadAnimation(gltf, i, model);
                model.addAnimation(animation);
            }
        }
    }
    collectNodes(gltf) {
        const collect = new Map();
        for (const node of gltf._nodes) {
            collect.set(node, {
                translate: node.position || Vector3.zero(),
                rotation: node.rotation || Quaternion.identity(),
                scale: node.scaling || Vector3.one(),
                worldTransform: null
            });
        }
        return collect;
    }
    updateNodeTransform(nodeTransforms, node) {
        const transform = nodeTransforms.get(node);
        if (!transform.worldTransform) {
            transform.worldTransform = Matrix4x4.scaling(transform.scale).rotateLeft(transform.rotation).translateLeft(transform.translate);
            if (node.parent) {
                this.updateNodeTransform(nodeTransforms, node.parent);
                transform.worldTransform.multiplyLeft(nodeTransforms.get(node.parent).worldTransform);
            }
        }
    }
    getAnimationInfo(gltf, index) {
        const animationInfo = gltf.animations[index];
        const name = animationInfo.name || null;
        const channels = animationInfo.channels;
        const samplers = animationInfo.samplers;
        const interpolators = [];
        const nodes = this.collectNodes(gltf);
        let maxTime = 0;
        for (let i = 0; i < channels.length; i++) {
            const channel = channels[i];
            const sampler = samplers[channel.sampler];
            const input = gltf._accessors[sampler.input].getNormalizedDeinterlacedView(gltf);
            const output = gltf._accessors[sampler.output].getNormalizedDeinterlacedView(gltf);
            const mode = sampler.interpolation === 'STEP'
                ? InterpolationMode.STEP
                : sampler.interpolation === 'CUBICSPLINE'
                    ? InterpolationMode.CUBICSPLINE
                    : InterpolationMode.LINEAR;
            const target = channel.target.path === 'rotation'
                ? InterpolationTarget.ROTATION
                : channel.target.path === 'translation'
                    ? InterpolationTarget.TRANSLATION
                    : channel.target.path === 'scale'
                        ? InterpolationTarget.SCALING
                        : InterpolationTarget.WEIGHTS;
            interpolators.push(new Interpolator(mode, target, input, output, 0));
            const max = input[input.length - 1];
            if (max > maxTime) {
                maxTime = max;
            }
        }
        return { name, channels, samplers, interpolators, maxTime, nodes };
    }
    _loadAnimation(gltf, index, model) {
        const animationInfo = this.getAnimationInfo(gltf, index);
        const animationData = { name: animationInfo.name, tracks: [], skeletons: [], nodes: [] };
        for (let i = 0; i < animationInfo.channels.length; i++) {
            const targetNode = gltf._nodes[animationInfo.channels[i].target.node];
            animationData.tracks.push({
                node: targetNode,
                interpolator: animationInfo.interpolators[i]
            });
            if (animationData.nodes.indexOf(targetNode) < 0) {
                animationData.nodes.push(targetNode);
            }
            if (targetNode.skeletonAttached && animationData.skeletons.indexOf(targetNode.skeletonAttached) < 0) {
                animationData.skeletons.push(targetNode.skeletonAttached);
            }
        }
        return animationData;
    }
    _loadNode(gltf, nodeIndex, parent, model) {
        let node = gltf._nodes[nodeIndex];
        if (node) {
            if (parent) {
                if (node.parent) {
                    throw new Error('invalid node hierarchy');
                }
                parent.addChild(node);
            }
            return node;
        }
        const nodeInfo = gltf.nodes?.[nodeIndex];
        if (nodeInfo) {
            node = model.addNode(parent, nodeIndex, nodeInfo.name);
            if (typeof nodeInfo.mesh === 'number') {
                node.mesh = gltf._meshes[nodeInfo.mesh];
            }
            if (!(typeof nodeInfo.skin === 'number') || nodeInfo.skin < 0) {
                if (nodeInfo.matrix) {
                    const matrix = new Matrix4x4(nodeInfo.matrix);
                    matrix.decompose(node.scaling, node.rotation, node.position);
                }
                else {
                    if (nodeInfo.rotation) {
                        node.rotation.assign(nodeInfo.rotation);
                    }
                    if (nodeInfo.scale) {
                        node.scaling.assign(nodeInfo.scale);
                    }
                    if (nodeInfo.translation) {
                        node.position.assign(nodeInfo.translation);
                    }
                }
            }
            gltf._nodes[nodeIndex] = node;
            if (nodeInfo.children) {
                for (const childIndex of nodeInfo.children) {
                    this._loadNode(gltf, childIndex, node, model);
                }
            }
        }
        else {
            throw new Error(`invalid GLTF node: ${nodeIndex}`);
        }
        return node;
    }
    async _loadMeshes(gltf, model) {
        if (gltf.meshes) {
            for (let i = 0; i < gltf.meshes.length; i++) {
                gltf._meshes[i] = await this._loadMesh(gltf, i);
            }
        }
    }
    async _loadMesh(gltf, meshIndex) {
        const meshInfo = gltf.meshes && gltf.meshes[meshIndex];
        let mesh = null;
        if (meshInfo) {
            mesh = { subMeshes: [] };
            const primitives = meshInfo.primitives;
            meshInfo.name || null;
            if (primitives) {
                for (const p of primitives) {
                    const subMeshData = {
                        primitive: null,
                        material: null,
                        rawPositions: null,
                        rawBlendIndices: null,
                        rawJointWeights: null,
                    };
                    const hash = `(${Object.getOwnPropertyNames(p.attributes).sort().map(k => `${k}:${p.attributes[k]}`).join(',')})-(${p.indices})-(${p.mode})`;
                    let primitive = p.targets ? null : gltf._primitiveCache[hash];
                    if (!primitive) {
                        primitive = new Primitive(gltf._manager.device);
                        const attributes = p.attributes;
                        for (const attrib in attributes) {
                            this._loadVertexBuffer(gltf, attrib, attributes[attrib], primitive, subMeshData);
                        }
                        const indices = p.indices;
                        if (typeof indices === 'number') {
                            this._loadIndexBuffer(gltf, indices, primitive, subMeshData);
                        }
                        let primitiveType = p.mode;
                        if (typeof primitiveType !== 'number') {
                            primitiveType = 4;
                        }
                        primitive.primitiveType = this._primitiveType(primitiveType);
                        gltf._primitiveCache[hash] = primitive;
                    }
                    const hasVertexNormal = !!primitive.getVertexBuffer('normal');
                    const hasVertexColor = !!primitive.getVertexBuffer('diffuse');
                    const hasVertexTangent = !!primitive.getVertexBuffer('tangent');
                    const materialHash = `${p.material}.${Number(hasVertexNormal)}.${Number(hasVertexColor)}.${Number(hasVertexTangent)}`;
                    let material = gltf._materialCache[materialHash];
                    if (!material) {
                        const materialInfo = p.material !== undefined ? gltf.materials[p.material] : null;
                        material = await this._loadMaterial(gltf, materialInfo, hasVertexColor, hasVertexNormal, hasVertexTangent);
                        gltf._materialCache[materialHash] = material;
                    }
                    subMeshData.primitive = primitive;
                    subMeshData.material = material;
                    mesh.subMeshes.push(subMeshData);
                }
            }
        }
        return mesh;
    }
    async _createMaterial(assetManager, assetMaterial) {
        if (assetMaterial.type === 'unlit') {
            const unlitAssetMaterial = assetMaterial;
            const unlitMaterial = new UnlitMaterial(assetManager.device);
            unlitMaterial.lightModel.albedo = unlitAssetMaterial.diffuse ?? Vector4.one();
            if (unlitAssetMaterial.diffuseMap) {
                unlitMaterial.lightModel.setAlbedoMap(unlitAssetMaterial.diffuseMap.texture, unlitAssetMaterial.diffuseMap.sampler, unlitAssetMaterial.diffuseMap.texCoord, unlitAssetMaterial.diffuseMap.transform);
            }
            unlitMaterial.vertexColor = unlitAssetMaterial.common.vertexColor;
            if (assetMaterial.common.alphaMode === 'blend') {
                unlitMaterial.alphaBlend = true;
            }
            else if (assetMaterial.common.alphaMode === 'mask') {
                unlitMaterial.alphaCutoff = assetMaterial.common.alphaCutoff;
            }
            if (assetMaterial.common.doubleSided) {
                const rasterizerState = unlitMaterial.stateSet.useRasterizerState();
                rasterizerState.setCullMode(FaceMode.NONE);
            }
            unlitMaterial.vertexNormal = !!assetMaterial.common.vertexNormal;
            return unlitMaterial;
        }
        else if (assetMaterial.type === 'pbrSpecularGlossiness') {
            const assetPBRMaterial = assetMaterial;
            const pbrMaterial = new PBRSpecularGlossinessMaterial(assetManager.device);
            pbrMaterial.lightModel.ior = assetPBRMaterial.ior;
            pbrMaterial.lightModel.albedo = assetPBRMaterial.diffuse;
            pbrMaterial.lightModel.specularFactor = new Vector4(assetPBRMaterial.specular.x, assetPBRMaterial.specular.y, assetPBRMaterial.specular.z, 1);
            pbrMaterial.lightModel.glossinessFactor = assetPBRMaterial.glossness;
            if (assetPBRMaterial.diffuseMap) {
                pbrMaterial.lightModel.setAlbedoMap(assetPBRMaterial.diffuseMap.texture, assetPBRMaterial.diffuseMap.sampler, assetPBRMaterial.diffuseMap.texCoord, assetPBRMaterial.diffuseMap.transform);
            }
            if (assetPBRMaterial.common.normalMap) {
                pbrMaterial.lightModel.setNormalMap(assetPBRMaterial.common.normalMap.texture, assetPBRMaterial.common.normalMap.sampler, assetPBRMaterial.common.normalMap.texCoord, assetPBRMaterial.common.normalMap.transform);
            }
            pbrMaterial.lightModel.normalScale = assetPBRMaterial.common.bumpScale;
            if (assetPBRMaterial.common.emissiveMap) {
                pbrMaterial.lightModel.setEmissiveMap(assetPBRMaterial.common.emissiveMap.texture, assetPBRMaterial.common.emissiveMap.sampler, assetPBRMaterial.common.emissiveMap.texCoord, assetPBRMaterial.common.emissiveMap.transform);
            }
            pbrMaterial.lightModel.emissiveColor = assetPBRMaterial.common.emissiveColor;
            pbrMaterial.lightModel.emissiveStrength = assetPBRMaterial.common.emissiveStrength;
            if (assetPBRMaterial.common.occlusionMap) {
                pbrMaterial.lightModel.setOcclusionMap(assetPBRMaterial.common.occlusionMap.texture, assetPBRMaterial.common.occlusionMap.sampler, assetPBRMaterial.common.occlusionMap.texCoord, assetPBRMaterial.common.occlusionMap.transform);
            }
            pbrMaterial.lightModel.occlusionStrength = assetPBRMaterial.common.occlusionStrength;
            if (assetPBRMaterial.specularGlossnessMap) {
                pbrMaterial.lightModel.setSpecularMap(assetPBRMaterial.specularGlossnessMap.texture, assetPBRMaterial.specularGlossnessMap.sampler, assetPBRMaterial.specularGlossnessMap.texCoord, assetPBRMaterial.specularGlossnessMap.transform);
            }
            pbrMaterial.vertexTangent = assetPBRMaterial.common.useTangent;
            pbrMaterial.vertexColor = assetPBRMaterial.common.vertexColor;
            if (assetPBRMaterial.common.alphaMode === 'blend') {
                pbrMaterial.alphaBlend = true;
            }
            else if (assetPBRMaterial.common.alphaMode === 'mask') {
                pbrMaterial.alphaCutoff = assetPBRMaterial.common.alphaCutoff;
            }
            if (assetPBRMaterial.common.doubleSided) {
                const rasterizerState = pbrMaterial.stateSet.useRasterizerState();
                rasterizerState.setCullMode(FaceMode.NONE);
            }
            pbrMaterial.vertexNormal = !!assetMaterial.common.vertexNormal;
            return pbrMaterial;
        }
        else if (assetMaterial.type === 'pbrMetallicRoughness') {
            const assetPBRMaterial = assetMaterial;
            const pbrMaterial = new PBRMetallicRoughnessMaterial(assetManager.device);
            pbrMaterial.lightModel.ior = assetPBRMaterial.ior;
            pbrMaterial.lightModel.albedo = assetPBRMaterial.diffuse;
            pbrMaterial.lightModel.metallic = assetPBRMaterial.metallic;
            pbrMaterial.lightModel.roughness = assetPBRMaterial.roughness;
            if (assetPBRMaterial.diffuseMap) {
                pbrMaterial.lightModel.setAlbedoMap(assetPBRMaterial.diffuseMap.texture, assetPBRMaterial.diffuseMap.sampler, assetPBRMaterial.diffuseMap.texCoord, assetPBRMaterial.diffuseMap.transform);
            }
            if (assetPBRMaterial.common.normalMap) {
                pbrMaterial.lightModel.setNormalMap(assetPBRMaterial.common.normalMap.texture, assetPBRMaterial.common.normalMap.sampler, assetPBRMaterial.common.normalMap.texCoord, assetPBRMaterial.common.normalMap.transform);
            }
            pbrMaterial.lightModel.normalScale = assetPBRMaterial.common.bumpScale;
            if (assetPBRMaterial.common.emissiveMap) {
                pbrMaterial.lightModel.setEmissiveMap(assetPBRMaterial.common.emissiveMap.texture, assetPBRMaterial.common.emissiveMap.sampler, assetPBRMaterial.common.emissiveMap.texCoord, assetPBRMaterial.common.emissiveMap.transform);
            }
            pbrMaterial.lightModel.emissiveColor = assetPBRMaterial.common.emissiveColor;
            pbrMaterial.lightModel.emissiveStrength = assetPBRMaterial.common.emissiveStrength;
            if (assetPBRMaterial.common.occlusionMap) {
                pbrMaterial.lightModel.setOcclusionMap(assetPBRMaterial.common.occlusionMap.texture, assetPBRMaterial.common.occlusionMap.sampler, assetPBRMaterial.common.occlusionMap.texCoord, assetPBRMaterial.common.occlusionMap.transform);
            }
            pbrMaterial.lightModel.occlusionStrength = assetPBRMaterial.common.occlusionStrength;
            if (assetPBRMaterial.metallicMap) {
                pbrMaterial.lightModel.setMetallicMap(assetPBRMaterial.metallicMap.texture, assetPBRMaterial.metallicMap.sampler, assetPBRMaterial.metallicMap.texCoord, assetPBRMaterial.metallicMap.transform);
            }
            pbrMaterial.lightModel.metallicIndex = assetPBRMaterial.metallicIndex;
            pbrMaterial.lightModel.roughnessIndex = assetPBRMaterial.roughnessIndex;
            pbrMaterial.lightModel.specularFactor = assetPBRMaterial.specularFactor;
            if (assetPBRMaterial.specularMap) {
                pbrMaterial.lightModel.setSpecularMap(assetPBRMaterial.specularMap.texture, assetPBRMaterial.specularMap.sampler, assetPBRMaterial.specularMap.texCoord, assetPBRMaterial.specularMap.transform);
            }
            if (assetPBRMaterial.specularColorMap) {
                pbrMaterial.lightModel.setSpecularColorMap(assetPBRMaterial.specularColorMap.texture, assetPBRMaterial.specularColorMap.sampler, assetPBRMaterial.specularColorMap.texCoord, assetPBRMaterial.specularColorMap.transform);
            }
            if (assetPBRMaterial.sheen) {
                const sheen = assetPBRMaterial.sheen;
                pbrMaterial.lightModel.useSheen = true;
                pbrMaterial.lightModel.sheenColorFactor = sheen.sheenColorFactor;
                pbrMaterial.lightModel.sheenRoughnessFactor = sheen.sheenRoughnessFactor;
                pbrMaterial.lightModel.setSheenLut(await assetManager.fetchBuiltinTexture(BUILTIN_ASSET_TEXTURE_SHEEN_LUT));
                if (sheen.sheenColorMap) {
                    pbrMaterial.lightModel.setSheenColorMap(sheen.sheenColorMap.texture, sheen.sheenColorMap.sampler, sheen.sheenColorMap.texCoord, sheen.sheenColorMap.transform);
                }
                if (sheen.sheenRoughnessMap) {
                    pbrMaterial.lightModel.setSheenRoughnessMap(sheen.sheenRoughnessMap.texture, sheen.sheenRoughnessMap.sampler, sheen.sheenRoughnessMap.texCoord, sheen.sheenRoughnessMap.transform);
                }
            }
            if (assetPBRMaterial.clearcoat) {
                const cc = assetPBRMaterial.clearcoat;
                pbrMaterial.lightModel.useClearcoat = true;
                pbrMaterial.lightModel.clearcoatIntensity = cc.clearCoatFactor;
                pbrMaterial.lightModel.clearcoatRoughnessFactor = cc.clearCoatRoughnessFactor;
                if (cc.clearCoatIntensityMap) {
                    pbrMaterial.lightModel.setClearcoatIntensityMap(cc.clearCoatIntensityMap.texture, cc.clearCoatIntensityMap.sampler, cc.clearCoatIntensityMap.texCoord, cc.clearCoatIntensityMap.transform);
                }
                if (cc.clearCoatRoughnessMap) {
                    pbrMaterial.lightModel.setClearcoatRoughnessMap(cc.clearCoatRoughnessMap.texture, cc.clearCoatRoughnessMap.sampler, cc.clearCoatRoughnessMap.texCoord, cc.clearCoatRoughnessMap.transform);
                }
                if (cc.clearCoatNormalMap) {
                    pbrMaterial.lightModel.setClearcoatNormalMap(cc.clearCoatNormalMap.texture, cc.clearCoatNormalMap.sampler, cc.clearCoatNormalMap.texCoord, cc.clearCoatNormalMap.transform);
                }
            }
            pbrMaterial.vertexTangent = assetPBRMaterial.common.useTangent;
            pbrMaterial.vertexColor = assetPBRMaterial.common.vertexColor;
            if (assetPBRMaterial.common.alphaMode === 'blend') {
                pbrMaterial.alphaBlend = true;
            }
            else if (assetPBRMaterial.common.alphaMode === 'mask') {
                pbrMaterial.alphaCutoff = assetPBRMaterial.common.alphaCutoff;
            }
            if (assetPBRMaterial.common.doubleSided) {
                const rasterizerState = pbrMaterial.stateSet.useRasterizerState();
                rasterizerState.setCullMode(FaceMode.NONE);
            }
            pbrMaterial.vertexNormal = !!assetMaterial.common.vertexNormal;
            return pbrMaterial;
        }
    }
    async _loadMaterial(gltf, materialInfo, vertexColor, vertexNormal, useTangent) {
        let assetMaterial = null;
        let pbrMetallicRoughness = null;
        let pbrSpecularGlossness = null;
        const pbrCommon = {
            useTangent,
            vertexColor,
            vertexNormal,
            bumpScale: 1,
            emissiveColor: Vector3.zero(),
            emissiveStrength: 1,
            occlusionStrength: 1,
        };
        switch (materialInfo?.alphaMode) {
            case 'BLEND': {
                pbrCommon.alphaMode = 'blend';
                break;
            }
            case 'MASK': {
                pbrCommon.alphaMode = 'mask';
                pbrCommon.alphaCutoff = materialInfo.alphaCutoff ?? 0.5;
                break;
            }
        }
        if (materialInfo?.doubleSided) {
            pbrCommon.doubleSided = true;
        }
        if (materialInfo?.pbrMetallicRoughness || materialInfo?.extensions?.KHR_materials_pbrSpecularGlossiness) {
            pbrCommon.normalMap = materialInfo.normalTexture ? await this._loadTexture(gltf, materialInfo.normalTexture, false) : null;
            pbrCommon.bumpScale = materialInfo.normalTexture?.scale ?? 1;
            pbrCommon.occlusionMap = materialInfo.occlusionTexture ? await this._loadTexture(gltf, materialInfo.occlusionTexture, false) : null;
            pbrCommon.occlusionStrength = materialInfo.occlusionTexture?.strength ?? 1;
            pbrCommon.emissiveMap = materialInfo.emissiveTexture ? await this._loadTexture(gltf, materialInfo.emissiveTexture, false) : null;
            pbrCommon.emissiveStrength = materialInfo?.extensions?.KHR_materials_emissive_strength?.emissiveStrength ?? 1;
            pbrCommon.emissiveColor = materialInfo.emissiveFactor ? new Vector3(materialInfo.emissiveFactor) : Vector3.zero();
        }
        if (materialInfo?.pbrMetallicRoughness) {
            pbrMetallicRoughness = {
                type: 'pbrMetallicRoughness',
                ior: 1.5,
                common: pbrCommon,
            };
            pbrMetallicRoughness.diffuse = new Vector4(materialInfo.pbrMetallicRoughness.baseColorFactor ?? [1, 1, 1, 1]);
            pbrMetallicRoughness.metallic = materialInfo.pbrMetallicRoughness.metallicFactor ?? 1;
            pbrMetallicRoughness.roughness = materialInfo.pbrMetallicRoughness.roughnessFactor ?? 1;
            pbrMetallicRoughness.diffuseMap = materialInfo.pbrMetallicRoughness.baseColorTexture ? await this._loadTexture(gltf, materialInfo.pbrMetallicRoughness.baseColorTexture, true) : null;
            pbrMetallicRoughness.metallicMap = materialInfo.pbrMetallicRoughness.metallicRoughnessTexture ? await this._loadTexture(gltf, materialInfo.pbrMetallicRoughness.metallicRoughnessTexture, false) : null;
            pbrMetallicRoughness.metallicIndex = 2;
            pbrMetallicRoughness.roughnessIndex = 1;
        }
        if (materialInfo?.extensions?.KHR_materials_pbrSpecularGlossiness) {
            const sg = materialInfo.extensions?.KHR_materials_pbrSpecularGlossiness;
            pbrSpecularGlossness = {
                type: 'pbrSpecularGlossiness',
                ior: 1.5,
                common: pbrCommon,
            };
            pbrSpecularGlossness.diffuse = new Vector4(sg.diffuseFactor ?? [1, 1, 1, 1]);
            pbrSpecularGlossness.specular = new Vector3(sg.specularFactor ?? [1, 1, 1]);
            pbrSpecularGlossness.glossness = sg.glossnessFactor ?? 1;
            pbrSpecularGlossness.diffuseMap = sg.diffuseTexture ? await this._loadTexture(gltf, sg.diffuseTexture, true) : null;
            pbrSpecularGlossness.specularGlossnessMap = sg.specularGlossinessTexture ? await this._loadTexture(gltf, sg.specularGlossinessTexture, true) : null;
        }
        assetMaterial = pbrSpecularGlossness || pbrMetallicRoughness;
        if (!assetMaterial || materialInfo?.extensions?.KHR_materials_unlit) {
            if (materialInfo?.extensions?.KHR_materials_unlit) {
                assetMaterial = {
                    type: 'unlit',
                    common: pbrCommon,
                    diffuse: pbrMetallicRoughness?.diffuse ?? Vector4.one(),
                    diffuseMap: pbrMetallicRoughness?.diffuseMap ?? null,
                };
            }
            else {
                assetMaterial = {
                    type: 'pbrMetallicRoughness',
                    common: pbrCommon,
                    diffuse: Vector4.one(),
                    metallic: 1,
                    roughness: 1,
                    diffuseMap: null,
                    metallicMap: null,
                    metallicIndex: 2,
                    roughnessIndex: 1,
                };
            }
        }
        if (assetMaterial.type !== 'unlit' && materialInfo?.extensions?.KHR_materials_ior) {
            assetMaterial.ior = materialInfo.extensions.KHR_materials_ior.ior ?? 1.5;
        }
        if (assetMaterial.type === 'pbrMetallicRoughness') {
            pbrMetallicRoughness = assetMaterial;
            pbrMetallicRoughness.specularFactor = new Vector4(new Vector3(materialInfo?.extensions?.KHR_materials_specular?.specularColorFactor ?? [1, 1, 1]), materialInfo?.extensions?.KHR_materials_specular?.specularFactor ?? 1);
            pbrMetallicRoughness.specularMap = materialInfo?.extensions?.KHR_materials_specular?.specularTexture ? await this._loadTexture(gltf, materialInfo.extensions.KHR_materials_specular.specularTexture, false) : null;
            pbrMetallicRoughness.specularColorMap = materialInfo?.extensions?.KHR_materials_specular?.specularColorTexture ? await this._loadTexture(gltf, materialInfo.extensions.KHR_materials_specular.specularColorTexture, true) : null;
            const sheen = materialInfo?.extensions?.KHR_materials_sheen;
            if (sheen) {
                pbrMetallicRoughness.sheen = {
                    sheenColorFactor: new Vector3(sheen.sheenColorFactor ?? [0, 0, 0]),
                    sheenColorMap: sheen.sheenColorTexture ? await this._loadTexture(gltf, sheen.sheenColorTexture, true) : null,
                    sheenRoughnessFactor: sheen.sheenRoughnessFactor ?? 0,
                    sheenRoughnessMap: sheen.sheenRoughnessTexture ? await this._loadTexture(gltf, sheen.sheenRoughnessTexture, true) : null,
                };
            }
            const cc = materialInfo?.extensions?.KHR_materials_clearcoat;
            if (cc) {
                pbrMetallicRoughness.clearcoat = {
                    clearCoatFactor: cc.clearcoatFactor ?? 0,
                    clearCoatIntensityMap: cc.clearcoatTexture ? await this._loadTexture(gltf, cc.clearcoatTexture, false) : null,
                    clearCoatRoughnessFactor: cc.clearcoatRoughnessFactor ?? 0,
                    clearCoatRoughnessMap: cc.clearcoatRoughnessTexture ? await this._loadTexture(gltf, cc.clearcoatRoughnessTexture, false) : null,
                    clearCoatNormalMap: cc.clearcoatNormalTexture ? await this._loadTexture(gltf, cc.clearcoatNormalTexture, false) : null
                };
            }
        }
        return await this._createMaterial(gltf._manager, assetMaterial);
    }
    async _loadTexture(gltf, info, sRGB) {
        const mt = {
            texture: null,
            sampler: null,
            texCoord: info.texCoord ?? 0,
            transform: null
        };
        const textureInfo = gltf.textures[info.index];
        if (textureInfo) {
            if (info.extensions?.KHR_texture_transform) {
                const uvTransform = info.extensions.KHR_texture_transform;
                if (uvTransform.texCoord !== undefined) {
                    mt.texCoord = uvTransform.texCoord;
                }
                const rotation = uvTransform.rotation !== undefined
                    ? Matrix4x4.rotationZ(-uvTransform.rotation)
                    : Matrix4x4.identity();
                const scale = uvTransform.scale !== undefined
                    ? new Vector3(uvTransform.scale[0], uvTransform.scale[1], 1)
                    : Vector3.one();
                const translation = uvTransform.offset !== undefined
                    ? new Vector3(uvTransform.offset[0], uvTransform.offset[1], 0)
                    : Vector3.zero();
                mt.transform = Matrix4x4.scaling(scale).multiplyLeft(rotation).translateLeft(translation);
            }
            let wrapS = TextureWrapping.Repeat;
            let wrapT = TextureWrapping.Repeat;
            let magFilter = TextureFilter.Linear;
            let minFilter = TextureFilter.Linear;
            let mipFilter = TextureFilter.Linear;
            const samplerIndex = textureInfo.sampler;
            const sampler = gltf.samplers && gltf.samplers[samplerIndex];
            if (sampler) {
                switch (sampler.wrapS) {
                    case 0x2901:
                        wrapS = TextureWrapping.Repeat;
                        break;
                    case 0x8370:
                        wrapS = TextureWrapping.MirroredRepeat;
                        break;
                    case 0x812f:
                        wrapS = TextureWrapping.ClampToEdge;
                        break;
                }
                switch (sampler.wrapT) {
                    case 0x2901:
                        wrapT = TextureWrapping.Repeat;
                        break;
                    case 0x8370:
                        wrapT = TextureWrapping.MirroredRepeat;
                        break;
                    case 0x812f:
                        wrapT = TextureWrapping.ClampToEdge;
                        break;
                }
                switch (sampler.magFilter) {
                    case 0x2600:
                        magFilter = TextureFilter.Nearest;
                        break;
                    case 0x2601:
                        magFilter = TextureFilter.Linear;
                        break;
                }
                switch (sampler.minFilter) {
                    case 0x2600:
                        minFilter = TextureFilter.Nearest;
                        mipFilter = TextureFilter.None;
                        break;
                    case 0x2601:
                        minFilter = TextureFilter.Linear;
                        mipFilter = TextureFilter.None;
                        break;
                    case 0x2700:
                        minFilter = TextureFilter.Nearest;
                        mipFilter = TextureFilter.Nearest;
                        break;
                    case 0x2701:
                        minFilter = TextureFilter.Linear;
                        mipFilter = TextureFilter.Nearest;
                        break;
                    case 0x2702:
                        minFilter = TextureFilter.Nearest;
                        mipFilter = TextureFilter.Linear;
                        break;
                    case 0x2703:
                        minFilter = TextureFilter.Linear;
                        mipFilter = TextureFilter.Linear;
                        break;
                }
            }
            const imageIndex = textureInfo.source;
            const hash = `${imageIndex}:${!!sRGB}:${wrapS}:${wrapT}:${minFilter}:${magFilter}:${mipFilter}`;
            mt.texture = gltf._textureCache[hash];
            if (!mt.texture) {
                const image = gltf.images[imageIndex];
                if (image) {
                    if (image.uri) {
                        const imageUrl = this._normalizeURI(gltf._baseURI, image.uri);
                        mt.texture = await gltf._manager.fetchTexture(imageUrl, null, sRGB);
                        mt.texture.name = imageUrl;
                    }
                    else if (typeof image.bufferView === 'number' && image.mimeType) {
                        const bufferView = gltf.bufferViews && gltf.bufferViews[image.bufferView];
                        if (bufferView) {
                            const arrayBuffer = gltf._loadedBuffers && gltf._loadedBuffers[bufferView.buffer];
                            if (arrayBuffer) {
                                const view = new Uint8Array(arrayBuffer, bufferView.byteOffset || 0, bufferView.byteLength);
                                const mimeType = image.mimeType;
                                const blob = new Blob([view], { type: mimeType });
                                const sourceURI = URL.createObjectURL(blob);
                                mt.texture = await gltf._manager.fetchTexture(sourceURI, mimeType, sRGB);
                                URL.revokeObjectURL(sourceURI);
                            }
                        }
                    }
                }
                if (mt.texture) {
                    gltf._textureCache[hash] = mt.texture;
                }
            }
            if (mt.texture) {
                mt.sampler = gltf._manager.device.createSampler({
                    addressU: wrapS,
                    addressV: wrapT,
                    magFilter: magFilter,
                    minFilter: minFilter,
                    mipFilter: mipFilter,
                });
            }
        }
        return mt;
    }
    _primitiveType(type) {
        switch (type) {
            case 0:
                return PrimitiveType.PointList;
            case 1:
                return PrimitiveType.LineList;
            case 3:
                return PrimitiveType.LineStrip;
            case 4:
                return PrimitiveType.TriangleList;
            case 5:
                return PrimitiveType.TriangleStrip;
            case 6:
                return PrimitiveType.TriangleFan;
            default:
                return PrimitiveType.Unknown;
        }
    }
    _loadIndexBuffer(gltf, accessorIndex, primitive, meshData) {
        this._setBuffer(gltf, accessorIndex, primitive, -1, meshData);
    }
    _loadVertexBuffer(gltf, attribName, accessorIndex, primitive, subMeshData) {
        let semantic;
        switch (attribName) {
            case 'POSITION':
                semantic = VERTEX_ATTRIB_POSITION;
                break;
            case 'NORMAL':
                semantic = VERTEX_ATTRIB_NORMAL;
                break;
            case 'TANGENT':
                semantic = VERTEX_ATTRIB_TANGENT;
                break;
            case 'TEXCOORD_0':
                semantic = VERTEX_ATTRIB_TEXCOORD0;
                break;
            case 'TEXCOORD_1':
                semantic = VERTEX_ATTRIB_TEXCOORD1;
                break;
            case 'TEXCOORD_2':
                semantic = VERTEX_ATTRIB_TEXCOORD2;
                break;
            case 'TEXCOORD_3':
                semantic = VERTEX_ATTRIB_TEXCOORD3;
                break;
            case 'TEXCOORD_4':
                semantic = VERTEX_ATTRIB_TEXCOORD4;
                break;
            case 'TEXCOORD_5':
                semantic = VERTEX_ATTRIB_TEXCOORD5;
                break;
            case 'TEXCOORD_6':
                semantic = VERTEX_ATTRIB_TEXCOORD6;
                break;
            case 'TEXCOORD_7':
                semantic = VERTEX_ATTRIB_TEXCOORD7;
                break;
            case 'COLOR_0':
                semantic = VERTEX_ATTRIB_DIFFUSE;
                break;
            case 'JOINTS_0':
                semantic = VERTEX_ATTRIB_BLEND_INDICES;
                break;
            case 'WEIGHTS_0':
                semantic = VERTEX_ATTRIB_BLEND_WEIGHT;
                break;
            default:
                return;
        }
        this._setBuffer(gltf, accessorIndex, primitive, semantic, subMeshData);
    }
    _setBuffer(gltf, accessorIndex, primitive, semantic, subMeshData) {
        const accessor = gltf._accessors[accessorIndex];
        const normalized = !!accessor.normalized;
        const hash = `${accessorIndex}:${semantic >= 0}:${Number(normalized)}`;
        let buffer = gltf._bufferCache[hash];
        if (!buffer) {
            let data = accessor.getTypedView(gltf);
            let ctype;
            let typeMask;
            if (data instanceof Int8Array) {
                ctype = 5120;
                typeMask = I8_BITMASK;
            }
            else if (data instanceof Uint8Array) {
                ctype = 5121;
                typeMask = U8_BITMASK;
            }
            else if (data instanceof Int16Array) {
                ctype = 5122;
                typeMask = I16_BITMASK;
            }
            else if (data instanceof Uint16Array) {
                ctype = 5123;
                typeMask = U16_BITMASK;
            }
            else if (data instanceof Int32Array) {
                ctype = 5124;
                typeMask = I32_BITMASK;
            }
            else if (data instanceof Uint32Array) {
                ctype = 5125;
                typeMask = U32_BITMASK;
            }
            else if (data instanceof Float32Array) {
                ctype = 5126;
                typeMask = F32_BITMASK;
            }
            else {
                throw new Error('invalid buffer data type');
            }
            const componentCount = accessor.getComponentCount(accessor.type);
            if (semantic >= 0 && ctype !== 5126) {
                const floatData = new Float32Array(data.length);
                floatData.set(data);
                ctype = 5126;
                typeMask = F32_BITMASK;
                data = floatData;
            }
            if (semantic < 0) {
                if (ctype !== 5121 && ctype !== 5123 && ctype !== 5125) {
                    throw new Error(`Invalid index buffer component type: ${ctype}`);
                }
                if (ctype === 5125 && !gltf._manager.device.getMiscCaps().support32BitIndex) {
                    throw new Error('Device does not support 32bit vertex index');
                }
                if (ctype === 5121) {
                    const uint16Data = new Uint16Array(data.length);
                    uint16Data.set(data);
                    ctype = 5123;
                    typeMask = U16_BITMASK;
                    data = uint16Data;
                }
            }
            if (semantic < 0) {
                buffer = gltf._manager.device.createIndexBuffer(data, { managed: true });
            }
            else {
                const name = getVertexAttribName(semantic);
                const bufferType = new PBStructTypeInfo(null, 'packed', [{
                        name: name,
                        type: new PBArrayTypeInfo(PBPrimitiveTypeInfo.getCachedTypeInfo(makePrimitiveType(typeMask, 1, componentCount, 0)), data.length / componentCount),
                    }]);
                buffer = gltf._manager.device.createStructuredBuffer(bufferType, { usage: 'vertex', managed: true }, data);
            }
            gltf._bufferCache[hash] = buffer;
        }
        if (buffer) {
            if (semantic < 0) {
                primitive.setIndexBuffer(buffer);
                primitive.indexCount = buffer.length;
            }
            else {
                primitive.setVertexBuffer(buffer);
                if (semantic === VERTEX_ATTRIB_POSITION) {
                    if (!primitive.getIndexBuffer()) {
                        primitive.indexCount = Math.floor(buffer.byteLength / 12);
                    }
                    const data = accessor.getNormalizedDeinterlacedView(gltf);
                    subMeshData.rawPositions = data;
                    const min = accessor.min;
                    const max = accessor.max;
                    if (min && max) {
                        primitive.setBoundingVolume(new BoundingBox(new Vector3(min), new Vector3(max)));
                    }
                    else {
                        const numComponents = getVertexBufferAttribType(buffer.structure, semantic).cols;
                        const bbox = new BoundingBox();
                        bbox.beginExtend();
                        for (let i = 0; i < data.length; i++) {
                            const v = new Vector3(data[i * numComponents], data[i * numComponents + 1], data[i * numComponents + 2]);
                            bbox.extend(v);
                        }
                        if (bbox.isValid()) {
                            primitive.setBoundingVolume(bbox);
                        }
                    }
                }
                else if (semantic === VERTEX_ATTRIB_BLEND_INDICES) {
                    subMeshData.rawBlendIndices = accessor.getNormalizedDeinterlacedView(gltf);
                }
                else if (semantic === VERTEX_ATTRIB_BLEND_WEIGHT) {
                    subMeshData.rawJointWeights = accessor.getNormalizedDeinterlacedView(gltf);
                }
            }
        }
        return buffer;
    }
    isGLB(data) {
        if (data.byteLength > 12) {
            const p = new Uint32Array(data, 0, 3);
            if (p[0] === 0x46546C67 && p[1] === 2 && p[2] === data.byteLength) {
                return true;
            }
        }
        return false;
    }
    getGLBChunkInfo(data, offset) {
        const header = new Uint32Array(data, offset, 2);
        const start = offset + 8;
        const length = header[0];
        const type = header[1];
        return { start, length, type };
    }
    getGLBChunkInfos(data) {
        const infos = [];
        let offset = 12;
        while (offset < data.byteLength) {
            const info = this.getGLBChunkInfo(data, offset);
            infos.push(info);
            offset += info.length + 8;
        }
        return infos;
    }
}

export { GLTFLoader };
//# sourceMappingURL=gltf_loader.js.map
