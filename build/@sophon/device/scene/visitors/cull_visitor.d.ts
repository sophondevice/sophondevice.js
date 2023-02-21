import { ClipState, AABB } from '@sophon/base';
import { OctreeNode } from '../octree';
import { Mesh } from '../mesh';
import { Terrain } from '../terrain';
import { RenderQueue } from '../render_queue';
import type { Visitor } from '../../misc';
import type { Camera } from '../camera';
import type { RenderPass } from '../renderers';
import type { Drawable } from '../drawable';
export declare class CullVisitor implements Visitor {
    constructor(renderPass: RenderPass, camera?: Camera);
    get camera(): Camera;
    set camera(camera: Camera);
    get renderPass(): RenderPass;
    get renderQueue(): RenderQueue;
    get frustum(): import("@sophon/base").Frustum;
    get postCullHook(): (camera: Camera, drawable: Drawable, castShadow: boolean, clipState: ClipState, box: AABB) => boolean;
    set postCullHook(hook: (camera: Camera, drawable: Drawable, castShadow: boolean, clipState: ClipState, box: AABB) => boolean);
    push(camera: Camera, drawable: Drawable, renderOrder: number, castShadow: boolean, clipState: ClipState, box: AABB): void;
    visit(target: unknown): unknown;
    visitTerrain(node: Terrain): void;
    visitMesh(node: Mesh): void;
    visitOctreeNode(node: OctreeNode): boolean;
}
