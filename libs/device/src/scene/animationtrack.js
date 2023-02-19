export class AnimationTrack {
    _interpolator;
    _currentPlayTime;
    _playing;
    constructor(interpolator) {
        this._currentPlayTime = 0;
        this._playing = false;
        this._interpolator = interpolator;
    }
    get interpolator() {
        return this._interpolator;
    }
    get playing() {
        return this._playing;
    }
    start() {
        this._playing = true;
    }
    stop() {
        this._playing = false;
    }
    rewind() {
        this._currentPlayTime = 0;
    }
    reset() {
        this.stop();
        this._currentPlayTime = 0;
    }
    update(device, result, playTime, duration) {
        this._interpolator.interpolate(this._currentPlayTime, duration, result);
    }
}
//# sourceMappingURL=animationtrack.js.map