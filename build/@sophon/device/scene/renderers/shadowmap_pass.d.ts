import { RenderPass } from './renderpass';
import { PunctualLight } from '../light';
import { Camera } from '../camera';
import type { Scene } from '../scene';
import type { RenderScheme } from './renderscheme';
export declare class ShadowMapPass extends RenderPass {
    constructor(renderScheme: RenderScheme, name: string);
    get light(): PunctualLight;
    get mainPass(): RenderPass;
    set mainPass(pass: RenderPass);
    getRenderPassType(): number;
    render(scene: Scene, camera: Camera): void;
}
