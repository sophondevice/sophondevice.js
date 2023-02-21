/** sophon base library */
import { WebGLEnum } from './webgl_enum.js';

function isWebGL2(gl) {
    return !!(gl && gl.texStorage2D);
}
class WebGLError extends Error {
    static errorToString = {
        [WebGLEnum.NO_ERROR]: 'NO_ERROR',
        [WebGLEnum.INVALID_ENUM]: 'INVALID_ENUM',
        [WebGLEnum.INVALID_VALUE]: 'INVALID_VALUE',
        [WebGLEnum.INVALID_OPERATION]: 'INVALID_OPERATION',
        [WebGLEnum.INVALID_FRAMEBUFFER_OPERATION]: 'INVALID_FRAMEBUFFER_OPERATION',
        [WebGLEnum.OUT_OF_MEMORY]: 'OUT_OF_MEMORY',
        [WebGLEnum.CONTEXT_LOST_WEBGL]: 'CONTEXT_LOST_WEBGL',
    };
    code;
    constructor(code) {
        super(WebGLError.errorToString[code]);
        this.code = code;
    }
}

export { WebGLError, isWebGL2 };
//# sourceMappingURL=utils.js.map
