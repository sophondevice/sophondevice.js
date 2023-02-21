import { Matrix4x4 } from '@sophon/base';
import { GraphNode } from './graph_node';
import { IBoxCreationOptions } from './shape';
import { RenderPass } from './renderers';
import type { XForm } from './xform';
import type { Primitive } from './primitive';
import type { SceneNode } from './scene_node';
import type { Scene } from './scene';
import type { Material } from './material';
import type { BatchDrawable, DrawContext } from './drawable';
import type { BoundingBox } from './bounding_volume';
import type { Texture2D } from '../device';
export declare class Mesh extends GraphNode implements BatchDrawable {
    constructor(scene: Scene, parent?: SceneNode);
    getInstanceId(renderPass: RenderPass): string;
    get castShadow(): boolean;
    set castShadow(b: boolean);
    get primitive(): Primitive;
    set primitive(prim: Primitive);
    get material(): Material;
    set material(m: Material);
    get drawBoundingBox(): boolean;
    set drawBoundingBox(val: boolean);
    isMesh(): boolean;
    setAnimatedBoundingBox(bbox: BoundingBox): void;
    setBoneMatrices(matrices: Texture2D): void;
    setInvBindMatrix(matrix: Matrix4x4): void;
    isBatchable(): this is BatchDrawable;
    dispose(): void;
    isTransparency(): boolean;
    isUnlit(): boolean;
    draw(ctx: DrawContext): void;
    getBoneMatrices(): Texture2D;
    getInvBindMatrix(): Matrix4x4;
    getXForm(): XForm;
    private static _defaultMaterial;
    private static _defaultSphere;
    private static _defaultBox;
    private static _defaultBoxFrame;
    private static _getDefaultMaterial;
    static unitSphere(scene: Scene, parent?: SceneNode): Mesh;
    static unitBox(scene: Scene, parent?: SceneNode): Mesh;
    static unitBoxFrame(scene: Scene, parent?: SceneNode): Mesh;
}
export declare class BoxMesh extends Mesh {
    constructor(scene: Scene, options?: IBoxCreationOptions & {
        material?: Material;
    });
}
export declare class PlaneMesh extends Mesh {
    constructor(scene: Scene, options?: {
        size: number;
        sizeX?: number;
        sizeY?: number;
        material?: Material;
    });
}
export declare class SphereMesh extends Mesh {
    constructor(scene: Scene, options?: {
        radius?: number;
        verticalDetail?: number;
        horizonalDetail?: number;
        material?: Material;
    });
}
