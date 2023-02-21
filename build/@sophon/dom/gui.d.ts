import { REventTarget } from '@sophon/base';
import { GUIRenderer } from './renderer';
import { ImageManager } from './image_manager';
import { UIRect } from './layout';
import { RNode } from './node';
import { RText } from './components/text';
import { RDocument } from './document';
import { RElement } from './element';
interface IElementConstructor {
    new (gui: GUI, ...args: unknown[]): RElement;
}
export declare class ElementRegistry {
    constructor(tags?: {
        [tagname: string]: IElementConstructor;
    });
    register(ctor: IElementConstructor, tagName: string): void;
    createElement(gui: GUI, tagName: string): RElement;
}
export declare class GUI extends REventTarget {
    constructor(renderer: GUIRenderer, bounds?: UIRect);
    get renderer(): GUIRenderer;
    get bounds(): UIRect;
    set bounds(rect: UIRect);
    get baseURI(): string;
    set baseURI(val: string);
    get document(): RDocument;
    get imageManager(): ImageManager;
    get mouseX(): number;
    get mouseY(): number;
    get mouseButtonState(): number;
    get ctrlKey(): boolean;
    get shiftKey(): boolean;
    get altKey(): boolean;
    get metaKey(): boolean;
    getHover(): {
        element: RNode;
        x: number;
        y: number;
    };
    getFocus(): RNode;
    setFocus(node: RNode): void;
    getCapture(): RNode;
    setCapture(node: RNode): void;
    dispose(): void;
    render(): void;
    serializeToXML(): string;
    deserializeFromXML(xml: string): Promise<any>;
    deserializeFromURL(url: string): Promise<void>;
    createElement<T extends RElement = RElement>(tagName: string): T;
    createTextNode(): RText;
    loadCSS(content: string): void;
}
export {};
