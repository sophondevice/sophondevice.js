import { RenderPass } from './renderpass';
import type { RenderScheme } from './renderscheme';
export declare class ForwardRenderPass extends RenderPass {
    constructor(renderScheme: RenderScheme, name: string);
    getRenderPassType(): number;
}
