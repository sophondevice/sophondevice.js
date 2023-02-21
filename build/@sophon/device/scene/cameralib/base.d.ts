import type { CameraInputSource, IMouseEvent, IKeyEvent } from '../camera';
export declare class BaseCameraModel {
    constructor();
    installMouseInput(input: CameraInputSource): void;
    uninstallMouseInput(input: CameraInputSource): void;
    installKeyboardInput(input: CameraInputSource): void;
    uninstallKeyboardInput(input: CameraInputSource): void;
    reset(): void;
    onMouseDown(evt: IMouseEvent): void;
    onMouseUp(evt: IMouseEvent): void;
    onMouseWheel(evt: IMouseEvent): void;
    onMouseMove(evt: IMouseEvent): void;
    onKeyDown(evt: IKeyEvent): void;
    onKeyUp(evt: IKeyEvent): void;
    update(): void;
}
