/** sophon base library */
import { AnimationClip } from './animation.js';
import { GraphNode } from './graph_node.js';

class Model extends GraphNode {
    _animations;
    _animationIndex;
    _updateCallback;
    constructor(scene) {
        super(scene);
        this._animations = {};
        this._animationIndex = 0;
        this._updateCallback = (evt) => {
            if (this.attached) {
                this.update(evt.camera);
            }
        };
    }
    addAnimation(name) {
        if (!name) {
            for (;;) {
                name = `animation${this._animationIndex++}`;
                if (!this._animationIndex[name]) {
                    break;
                }
            }
        }
        if (this._animations[name]) {
            console.error(`Model.addAnimation() failed: animation '${name}' already exists`);
            return null;
        }
        else {
            const ani = new AnimationClip(name, this);
            this._animations[name] = ani;
            return ani;
        }
    }
    removeAnimation(name) {
        this.stopAnimation(name);
        delete this._animations[name];
    }
    getAnimationNames() {
        return Object.keys(this._animations);
    }
    update(camera) {
        for (const k in this._animations) {
            this._animations[k].update();
        }
    }
    isPlayingAnimation(name) {
        if (name) {
            return this._animations[name]?.isPlaying();
        }
        else {
            for (const k in this._animations) {
                if (this._animations[k].isPlaying()) {
                    return true;
                }
            }
            return false;
        }
    }
    playAnimation(name, repeat = 1) {
        const isPlaying = this.isPlayingAnimation();
        const ani = this._animations[name];
        if (ani && !ani.isPlaying()) {
            ani.repeat = repeat;
            ani.play();
        }
        if (!isPlaying && this.isPlayingAnimation()) {
            this.scene.addEventListener('tick', this._updateCallback);
        }
    }
    stopAnimation(name) {
        const isPlaying = this.isPlayingAnimation();
        this._animations[name]?.stop();
        if (isPlaying && !this.isPlayingAnimation()) {
            this.scene.removeEventListener('tick', this._updateCallback);
        }
    }
}

export { Model };
//# sourceMappingURL=model.js.map
