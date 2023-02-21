/** sophon base library */
import { Vector3, Matrix4x4, nextPowerOf2 } from '@sophon/base';
import { TextureFormat } from '../device/base_types.js';

const tmpV0 = new Vector3();
const tmpV1 = new Vector3();
const tmpV2 = new Vector3();
const tmpV3 = new Vector3();
class Skeleton {
    _joints;
    _inverseBindMatrices;
    _bindPoseMatrices;
    _jointMatrices;
    _jointMatrixArray;
    _jointTexture;
    constructor(joints, inverseBindMatrices, bindPoseMatrices) {
        this._joints = joints;
        this._inverseBindMatrices = inverseBindMatrices;
        this._bindPoseMatrices = bindPoseMatrices;
        this._jointMatrixArray = null;
        this._jointMatrices = null;
        this._jointTexture = null;
    }
    get jointMatrices() {
        return this._jointMatrices;
    }
    get jointTexture() {
        return this._jointTexture;
    }
    updateJointMatrices(device, jointTransforms) {
        if (!this._jointTexture) {
            this._createJointTexture(device);
        }
        for (let i = 0; i < this._joints.length; i++) {
            const mat = this._jointMatrices[i];
            Matrix4x4.multiply(jointTransforms ? jointTransforms[i] : this._joints[i].worldMatrix, this._inverseBindMatrices[i], mat);
        }
    }
    computeBindPose(device) {
        this.updateJointMatrices(device, this._bindPoseMatrices);
        this._jointTexture.update(this._jointMatrixArray, 0, 0, this._jointTexture.width, this._jointTexture.height);
    }
    computeJoints(device) {
        this.updateJointMatrices(device);
        this._jointTexture.update(this._jointMatrixArray, 0, 0, this._jointTexture.width, this._jointTexture.height);
    }
    computeBoundingBox(info, invWorldMatrix) {
        info.boundingBox.beginExtend();
        for (let i = 0; i < info.boundingVertices.length; i++) {
            this._jointMatrices[info.boundingVertexBlendIndices[i * 4 + 0]].transformPointAffine(info.boundingVertices[i], tmpV0).scaleBy(info.boundingVertexJointWeights[i * 4 + 0]);
            this._jointMatrices[info.boundingVertexBlendIndices[i * 4 + 1]].transformPointAffine(info.boundingVertices[i], tmpV1).scaleBy(info.boundingVertexJointWeights[i * 4 + 1]);
            this._jointMatrices[info.boundingVertexBlendIndices[i * 4 + 2]].transformPointAffine(info.boundingVertices[i], tmpV2).scaleBy(info.boundingVertexJointWeights[i * 4 + 2]);
            this._jointMatrices[info.boundingVertexBlendIndices[i * 4 + 3]].transformPointAffine(info.boundingVertices[i], tmpV3).scaleBy(info.boundingVertexJointWeights[i * 4 + 3]);
            tmpV0.addBy(tmpV1).addBy(tmpV2).addBy(tmpV3);
            invWorldMatrix.transformPointAffine(tmpV0, tmpV0);
            info.boundingBox.extend(tmpV0);
        }
    }
    _createJointTexture(device) {
        const textureWidth = nextPowerOf2(Math.max(4, Math.ceil(Math.sqrt(this._joints.length * 4))));
        this._jointTexture = device.createTexture2D(TextureFormat.RGBA32F, textureWidth, textureWidth, {
            colorSpace: 'linear',
            noMipmap: true
        });
        this._jointMatrixArray = new Float32Array(textureWidth * textureWidth * 4);
        this._jointMatrices = this._joints.map((val, index) => new Matrix4x4(this._jointMatrixArray.subarray(index * 16, index * 16 + 16)));
    }
}

export { Skeleton };
//# sourceMappingURL=skeleton.js.map
