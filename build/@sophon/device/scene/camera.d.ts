import { CubeFace, Matrix4x4, Vector3, Frustum } from '@sophon/base';
import { SceneNode } from './scene_node';
import type { Scene } from './scene';
export interface IMouseEvent {
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
    button: number;
    buttons: number;
    wheelDeltaX: number;
    wheelDeltaY: number;
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    metaKey: boolean;
    target: unknown;
}
export interface IKeyEvent {
    key: string;
    code: string;
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    metaKey: boolean;
    target: unknown;
}
export interface IFrameStamp {
    frameId: number;
    timestamp: number;
}
export interface CameraInputSource {
    addEventListener(eventname: string, func: (evt: any) => void): any;
    removeEventListener(eventname: string, func: (evt: any) => void): any;
}
export interface AbstractCameraModel {
    reset(): void;
    installMouseInput(input: CameraInputSource): any;
    uninstallMouseInput(input: CameraInputSource): any;
    installKeyboardInput(input: CameraInputSource): any;
    uninstallKeyboardInput(input: CameraInputSource): any;
    onMouseDown(evt: IMouseEvent): void;
    onMouseUp(evt: IMouseEvent): void;
    onMouseWheel(evt: IMouseEvent): void;
    onMouseMove(evt: IMouseEvent): void;
    onKeyDown(evt: IKeyEvent): void;
    onKeyUp(evt: IKeyEvent): void;
    update(): void;
}
export declare class Camera extends SceneNode {
    constructor(scene: Scene, projectionMatrix?: Matrix4x4);
    get cameraTag(): number;
    get framestamp(): IFrameStamp;
    get mouseInputSource(): CameraInputSource;
    set mouseInputSource(inputSource: CameraInputSource);
    get keyboardInputSource(): CameraInputSource;
    set keyboardInputSource(inputSource: CameraInputSource);
    lookAt(eye: Vector3, target: Vector3, up: Vector3): this;
    lookAtCubeFace(face: CubeFace, position?: Vector3): void;
    get projectionMatrix(): Matrix4x4;
    set projectionMatrix(matrix: Matrix4x4);
    setProjectionMatrix(matrix: Matrix4x4): this;
    get viewMatrix(): Matrix4x4;
    get viewProjectionMatrix(): Matrix4x4;
    get invViewProjectionMatrix(): Matrix4x4;
    get frustum(): Frustum;
    get linearOutputEnabled(): boolean;
    set linearOutputEnabled(val: boolean);
    get model(): AbstractCameraModel;
    set model(model: AbstractCameraModel);
    enableLinearOutput(val: boolean): this;
    isPerspective(): boolean;
    isOrtho(): boolean;
    isCamera(): this is Camera;
    getNearPlane(): number;
    getFarPlane(): number;
    getFOV(): number;
    getTanHalfFovy(): number;
    getAspect(): number;
    setNearFar(znear: number, zfar: number): void;
    setModel(model: AbstractCameraModel): this;
    frameUpdate(): void;
    dispose(): void;
}
