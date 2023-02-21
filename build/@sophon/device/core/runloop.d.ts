export interface IRunLoopOptions {
    main: (...args: unknown[]) => boolean;
    atexit?: () => void;
    eventFilter?: (target: unknown, evt: unknown) => boolean;
    noFrameEvents?: boolean;
}
export declare class RunLoop {
    constructor(options?: IRunLoopOptions | ((...args: unknown[]) => boolean));
    get eventFilter(): (target: unknown, evt: unknown) => boolean;
    set eventFilter(filter: (target: unknown, evt: unknown) => boolean);
    get noFrameEvents(): boolean;
    set noFrameEvents(val: boolean);
    get runArgs(): unknown[];
    set runArgs(args: unknown[]);
    get mainFunc(): (...args: unknown[]) => boolean;
    set mainFunc(func: (...args: unknown[]) => boolean);
    get atexit(): () => void;
    set atexit(func: () => void);
    scheduleNextFrame(task: () => void): void;
    run(...args: unknown[]): void;
    static current(): RunLoop;
}
