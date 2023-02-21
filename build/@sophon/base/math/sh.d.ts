import { Vector3, Vector4 } from "./vector";
export declare function XMSHEvalDirectionalLight(order: number, dir: Vector3, color: Vector3, resultR: Float32Array, resultG: Float32Array, resultB: Float32Array): boolean;
export declare function XMSHEvalSphericalLight(order: number, pos: Vector3, radius: number, color: Vector4, resultR: Float32Array, resultG: Float32Array, resultB: Float32Array): boolean;
export declare function XMSHEvalConeLight(order: number, dir: Vector3, radius: number, color: Vector3, resultR: Float32Array, resultG: Float32Array, resultB: Float32Array): boolean;
export declare function XMSHEvalHemisphereLight(order: number, dir: Vector3, topColor: Vector3, bottomColor: Vector3, resultR: Float32Array, resultG: Float32Array, resultB: Float32Array): boolean;
