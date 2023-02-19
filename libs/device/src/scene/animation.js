import { Matrix4x4, Quaternion, Vector3 } from "@sophon/base/math/vector";
import { AnimationTrack } from "./animationtrack";
import { InterpolationTarget } from "./interpolator";
import { BoundingBox } from "./bounding_volume";
export class AnimationClip {
    _name;
    _model;
    _repeat;
    _repeatCounter;
    _duration;
    _isPlaying;
    _lastUpdateFrame;
    _currentPlayTime;
    _tracks;
    _skeletons;
    constructor(name, model) {
        this._name = name;
        this._model = model;
        this._tracks = new Map();
        this._duration = 0;
        this._repeat = 0;
        this._repeatCounter = 0;
        this._isPlaying = false;
        this._currentPlayTime = 0;
        this._lastUpdateFrame = 0;
        this._skeletons = new Map();
    }
    get name() {
        return this._name;
    }
    get tracks() {
        return this._tracks;
    }
    get repeat() {
        return this._repeat;
    }
    set repeat(n) {
        this._repeat = Math.max(0, n) | 0;
    }
    get timeDuration() {
        return this._duration;
    }
    addSkeleton(skeleton, meshList, boundingBoxInfo) {
        let meshes = this._skeletons.get(skeleton);
        if (!meshes) {
            meshes = [];
            this._skeletons.set(skeleton, meshes);
        }
        for (let i = 0; i < meshList.length; i++) {
            meshes.push({ mesh: meshList[i], bounding: boundingBoxInfo[i], box: new BoundingBox });
        }
    }
    addAnimationTrack(node, interpolator) {
        let trackInfo = this._tracks.get(node);
        if (!trackInfo) {
            trackInfo = {
                poseTranslation: new Vector3(node.position),
                poseRotation: new Quaternion(node.rotation),
                poseScaling: new Vector3(node.scaling)
            };
            this._tracks.set(node, trackInfo);
        }
        const track = new AnimationTrack(interpolator);
        switch (interpolator.target) {
            case InterpolationTarget.TRANSLATION:
                trackInfo.translationTrack = track;
                break;
            case InterpolationTarget.ROTATION:
                trackInfo.rotationTrack = track;
                break;
            case InterpolationTarget.SCALING:
                trackInfo.scalingTrack = track;
                break;
            case InterpolationTarget.WEIGHTS:
                trackInfo.weightsTrack = track;
                break;
        }
        this._duration = Math.max(this._duration, interpolator.maxTime);
        return track;
    }
    isPlaying() {
        return this._isPlaying;
    }
    update() {
        const device = this._model.scene.device;
        if (this._lastUpdateFrame === device.frameInfo.frameCounter) {
            return;
        }
        this._lastUpdateFrame = device.frameInfo.frameCounter;
        if (this._isPlaying) {
            if (this._currentPlayTime >= this._duration) {
                this._repeatCounter++;
                if (this._repeat === 0 || this._repeatCounter < this._repeat) {
                    this._currentPlayTime = 0;
                }
                else {
                    this.stop();
                    return;
                }
            }
            this._lastUpdateFrame = device.frameInfo.frameCounter;
            this._currentPlayTime += device.frameInfo.elapsedFrame * 0.001;
            if (this._currentPlayTime > this._duration) {
                this._currentPlayTime = this._duration;
            }
            this._tracks.forEach((trackInfo, node) => {
                trackInfo.translationTrack?.interpolator.interpolate(this._currentPlayTime, this._duration, node.position.getArray());
                trackInfo.rotationTrack?.interpolator.interpolate(this._currentPlayTime, this._duration, node.rotation.getArray());
                trackInfo.scalingTrack?.interpolator.interpolate(this._currentPlayTime, this._duration, node.scaling.getArray());
                node.notifyChanged(true, false);
            });
            this._skeletons.forEach((meshes, skeleton) => {
                skeleton.computeJoints(device);
                for (const mesh of meshes) {
                    skeleton.computeBoundingBox(mesh.bounding, mesh.mesh.invWorldMatrix);
                    mesh.mesh.setBoneMatrices(skeleton.jointTexture);
                    mesh.mesh.setInvBindMatrix(mesh.mesh.invWorldMatrix);
                    mesh.mesh.setAnimatedBoundingBox(mesh.bounding.boundingBox);
                }
            });
        }
    }
    play() {
        this._isPlaying = true;
    }
    stop() {
        const device = this._model.scene.device;
        this._isPlaying = false;
        this._skeletons.forEach((meshes, skeleton) => {
            skeleton.computeBindPose(device);
            for (const mesh of meshes) {
                const invWorldMatrix = Matrix4x4.multiply(mesh.mesh.invWorldMatrix, this._model.worldMatrix);
                skeleton.computeBoundingBox(mesh.bounding, invWorldMatrix);
                mesh.mesh.setBoneMatrices(skeleton.jointTexture);
                mesh.mesh.setInvBindMatrix(invWorldMatrix);
                mesh.mesh.setAnimatedBoundingBox(mesh.bounding.boundingBox);
            }
        });
    }
    rewind() {
        this._currentPlayTime = 0;
    }
}
//# sourceMappingURL=animation.js.map