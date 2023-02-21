export declare class FontCanvas {
    private static _canvas;
    private static _context;
    private static _currentFont;
    static get canvas(): HTMLCanvasElement;
    static get context(): CanvasRenderingContext2D;
    static get font(): string;
    static set font(font: string);
    private static _realize;
}
export declare class Font {
    constructor(name: string, scale: number);
    static fetchFont(name: string, scale: number): Font;
    get fontName(): string;
    set fontName(name: string);
    get fontNameScaled(): string;
    get size(): number;
    get family(): string;
    get top(): number;
    get bottom(): number;
    get maxHeight(): number;
    get topScaled(): number;
    get bottomScaled(): number;
    get maxHeightScaled(): number;
    equalTo(other: Font): boolean;
}
