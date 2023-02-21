export interface ITimer {
    begin(): void;
    end(): void;
    ended(): boolean;
    elapsed(): number;
}
export declare class CPUTimer implements ITimer {
    private _cpuTimer;
    private _cpuStart;
    private _cpuTime;
    private _ended;
    constructor();
    now(): number;
    begin(): void;
    end(): void;
    ended(): boolean;
    elapsed(): number;
}
