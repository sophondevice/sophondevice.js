/** sophon base library */
import { DeviceResizeEvent } from './device.js';
import { WebGLDevice } from './webgl/device_webgl.js';
import { WebGPUDevice } from './webgpu/device.js';

class Viewer {
    _device;
    _canvas;
    _canvasClientWidth;
    _canvasClientHeight;
    constructor(cvs) {
        this._canvas = cvs;
        this._canvasClientWidth = 0;
        this._canvasClientHeight = 0;
        this._device = null;
    }
    get device() {
        return this._device;
    }
    get canvas() {
        return this._canvas;
    }
    async initDevice(deviceType, options) {
        const typelist = Array.isArray(deviceType) ? deviceType : [deviceType];
        for (const type of typelist) {
            try {
                if (type === 'webgl' || type === 'webgl2') {
                    this._device = new WebGLDevice(this._canvas, type, options);
                }
                else if (navigator.gpu) {
                    this._device = new WebGPUDevice(this._canvas, options);
                }
                if (this._device) {
                    break;
                }
            }
            catch (err) {
                console.log(`create context '${type}' failed: ${err}`);
                this._device = null;
            }
        }
        if (!this._device) {
            throw new Error('ERR: create device failed');
        }
        await this._device.initContext();
        this._device.setViewport();
        this._device.setScissor();
        if (this._canvas instanceof HTMLCanvasElement) {
            this._canvas.style.outline = 'none';
            this._canvas.setAttribute('tabindex', '1');
        }
        this._onresize();
        this._registerEventHandlers();
    }
    _onresize() {
        const canvas = this._canvas;
        if (this._canvasClientWidth !== canvas.clientWidth ||
            this._canvasClientHeight !== canvas.clientHeight) {
            this._canvasClientWidth = canvas.clientWidth;
            this._canvasClientHeight = canvas.clientHeight;
            this._device.dispatchEvent(new DeviceResizeEvent(canvas.clientWidth, canvas.clientHeight));
        }
    }
    _registerEventHandlers() {
        const canvas = this._canvas;
        const that = this;
        if (window.ResizeObserver) {
            new window.ResizeObserver(entries => {
                that._onresize();
            }).observe(canvas, {});
        }
        else {
            new MutationObserver(function (mutations) {
                if (mutations.length > 0) {
                    that._onresize();
                }
            }).observe(canvas, { attributes: true, attributeFilter: ['style'] });
            window.addEventListener('resize', () => {
                this._onresize();
            });
        }
    }
}

export { Viewer };
//# sourceMappingURL=viewer.js.map
