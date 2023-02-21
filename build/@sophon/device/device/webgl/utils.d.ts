export declare function isWebGL2(gl: WebGLRenderingContext | WebGL2RenderingContext): gl is WebGL2RenderingContext;
export declare class WebGLError extends Error {
    private static errorToString;
    code: number;
    constructor(code: number);
}
