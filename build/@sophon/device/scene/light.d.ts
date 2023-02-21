import { Vector4, Matrix4x4 } from '@sophon/base';
import { GraphNode } from './graph_node';
import { ShadowMapper } from './shadow/shadowmapper';
import type { Scene } from './scene';
import type { TextureCube } from '../device/gpuobject';
export declare enum LightingFalloffMode {
    UNKNOWN = 0,
    CONSTANT = 1,
    LINEAR = 2,
    QUADRATIC = 3
}
export declare abstract class BaseLight extends GraphNode {
    constructor(scene: Scene, type: number);
    get lightType(): number;
    get intensity(): number;
    set intensity(val: number);
    get positionAndRange(): Vector4;
    get directionAndCutoff(): Vector4;
    get diffuseAndIntensity(): Vector4;
    get viewMatrix(): Matrix4x4;
    get viewProjMatrix(): Matrix4x4;
    setIntensity(val: number): this;
    invalidateUniforms(): void;
    isLight(): this is BaseLight;
    isPunctualLight(): this is PunctualLight;
    isAmbientLight(): this is AmbientLight;
    isHemiSphericLight(): this is HemiSphericLight;
    isDirectionLight(): this is DirectionalLight;
    isPointLight(): this is PointLight;
    isSpotLight(): this is SpotLight;
}
export declare abstract class AmbientLight extends BaseLight {
    constructor(scene: Scene, type: number);
    isAmbientLight(): this is AmbientLight;
}
export declare class EnvironmentLight extends AmbientLight {
    constructor(scene: Scene, radianceMap?: TextureCube, irradianceMap?: TextureCube);
    get radianceMap(): TextureCube;
    set radianceMap(map: TextureCube);
    get irradianceMap(): TextureCube;
    set irradianceMap(map: TextureCube);
    computeUniforms(): void;
}
export declare class HemiSphericLight extends AmbientLight {
    constructor(scene: Scene);
    get colorUp(): Vector4;
    set colorUp(val: Vector4);
    setColorUp(val: Vector4): this;
    get colorDown(): Vector4;
    set colorDown(val: Vector4);
    setColorDown(val: Vector4): this;
    isHemiSphericLight(): this is HemiSphericLight;
}
export declare abstract class PunctualLight extends BaseLight {
    constructor(scene: Scene, type: number);
    get color(): Vector4;
    set color(clr: Vector4);
    setColor(clr: Vector4): this;
    get castShadow(): boolean;
    set castShadow(b: boolean);
    setCastShadow(b: boolean): this;
    get viewProjMatrix(): Matrix4x4;
    set viewProjMatrix(mat: Matrix4x4);
    get shadow(): ShadowMapper;
    setLightViewProjectionMatrix(mat: Matrix4x4): this;
    isPunctualLight(): this is PunctualLight;
    dispose(): void;
}
export declare class DirectionalLight extends PunctualLight {
    constructor(scene: Scene);
    isDirectionLight(): this is DirectionalLight;
}
export declare class PointLight extends PunctualLight {
    constructor(scene: Scene);
    get range(): number;
    set range(val: number);
    setRange(val: number): this;
    isPointLight(): this is PointLight;
}
export declare class SpotLight extends PunctualLight {
    constructor(scene: Scene);
    get range(): number;
    set range(val: number);
    setRange(val: number): this;
    get cutoff(): number;
    set cutoff(val: number);
    setCutoff(val: number): this;
    isSpotLight(): this is SpotLight;
}
