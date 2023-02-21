import { RenderPass } from './renderpass';
import { PunctualLight } from '../light';
import type { RenderScheme } from './renderscheme';
export declare class ForwardMultiRenderPass extends RenderPass {
    constructor(renderScheme: RenderScheme, name: string);
    get light(): PunctualLight;
    getRenderPassType(): number;
}
