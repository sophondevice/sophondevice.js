import { PrimitiveType } from '../../device/base_types';
import { FaceMode } from '../../device/render_states';
import { makeVertexBufferType } from '../../device/gpuobject';
import { Primitive } from "../primitive";
import { BoxShape } from "../shape";
export class Blitter {
    _hash;
    constructor() {
        this._hash = null;
    }
    get hash() {
        if (!this._hash) {
            this._hash = `${this.constructor.name}:${this.calcHash()}`;
        }
        return this._hash;
    }
    invalidateHash() {
        this._hash = null;
    }
    readTexel(scope, type, srcTex, srcUV, srcLayer) {
        const pb = scope.$builder;
        switch (type) {
            case '2d':
            case 'cube':
                return pb.device?.getShaderCaps().supportShaderTextureLod ? pb.textureSampleLevel(srcTex, srcUV, 0) : pb.textureSample(srcTex, srcUV);
            case '2d-array':
                return pb.textureArraySampleLevel(srcTex, srcUV, srcLayer, 0);
            default:
                return null;
        }
    }
    writeTexel(scope, type, srcUV, texel) {
        return texel;
    }
    setup(scope, type) {
    }
    setUniforms(bindGroup) {
    }
    blit2D(source, dest, sampler) {
        const device = source.device;
        const programInfo = getBlitProgram(device, '2d', this);
        programInfo.bindGroup.setTexture('srcTex', source, sampler);
        this.setUniforms(programInfo.bindGroup);
        device.setFramebuffer(dest);
        device.setViewport(null);
        device.setScissor(null);
        device.setProgram(programInfo.program);
        device.setBindGroup(0, programInfo.bindGroup);
        device.setBindGroup(1, null);
        device.setBindGroup(2, null);
        device.setBindGroup(3, null);
        device.setRenderStates(getBlitRenderStateSet(device));
        getBlitPrimitive2D(device).draw();
    }
    blit2DArray(source, dest, layer, sampler) {
        const device = source.device;
        const programInfo = getBlitProgram(device, '2d-array', this);
        programInfo.bindGroup.setTexture('srcTex', source, sampler);
        programInfo.bindGroup.setValue('srcLayer', layer);
        this.setUniforms(programInfo.bindGroup);
        device.setFramebuffer(dest);
        device.setViewport(null);
        device.setScissor(null);
        device.setProgram(programInfo.program);
        device.setBindGroup(0, programInfo.bindGroup);
        device.setBindGroup(1, null);
        device.setBindGroup(2, null);
        device.setBindGroup(3, null);
        device.setRenderStates(getBlitRenderStateSet(device));
        getBlitPrimitive2D(device).draw();
    }
    blitCubeMap(source, dest, face, sampler) {
        const device = source.device;
        const programInfo = getBlitProgram(device, 'cube', this);
        programInfo.bindGroup.setTexture('srcTex', source, sampler);
        programInfo.bindGroup.setValue('texelSize', 1 / source.width);
        programInfo.bindGroup.setValue('cubeFace', face);
        this.setUniforms(programInfo.bindGroup);
        device.setFramebuffer(dest);
        device.setViewport(null);
        device.setScissor(null);
        device.setProgram(programInfo.program);
        device.setBindGroup(0, programInfo.bindGroup);
        device.setBindGroup(1, null);
        device.setBindGroup(2, null);
        device.setBindGroup(3, null);
        device.setRenderStates(getBlitRenderStateSet(device));
        getBlitPrimitive2D(device).draw();
    }
    blit(source, dest, layer, sampler) {
        const device = source.device;
        const saveFramebuffer = device.getFramebuffer();
        const saveViewport = device.getViewport();
        const saveScissor = device.getScissor();
        const saveRenderStates = device.getRenderStates();
        const framebuffer = dest.isFramebuffer() ? dest : device.createFrameBuffer({
            colorAttachments: [{ texture: dest }]
        });
        const destTexture = dest.isFramebuffer() ? dest.getColorAttachments()?.[0] : dest;
        if (source.isTexture2D()) {
            if (!destTexture?.isTexture2D() && !destTexture?.isTexture2DArray()) {
                throw new Error('Blitter.blit() failed: invalid destination texture type');
            }
            if (destTexture.isTexture2DArray()) {
                framebuffer.setTextureLayer(0, layer || 0);
            }
            this.blit2D(source, framebuffer, sampler);
        }
        else if (source.isTexture2DArray()) {
            if (!destTexture?.isTexture2D() && !destTexture.isTexture2DArray()) {
                throw new Error('Blitter.blit() failed: invalid destination texture type');
            }
            if (destTexture.isTexture2D()) {
                this.blit2DArray(source, framebuffer, layer || 0, sampler);
            }
            else {
                if (destTexture.depth !== source.depth) {
                    throw new Error('Blitter.blit() failed: can not blit between texture 2d arrays with different array size');
                }
                else {
                    for (let i = 0; i < source.depth; i++) {
                        framebuffer.setTextureLayer(0, i);
                        this.blit2DArray(source, framebuffer, i, layer);
                    }
                }
            }
        }
        else if (source.isTextureCube()) {
            if (!destTexture.isTextureCube() && !destTexture.isTexture2D()) {
                throw new Error('Blitter.blit() failed: invalid destination texture type');
            }
            if (destTexture.isTextureCube()) {
                for (let i = 0; i < 6; i++) {
                    framebuffer.setCubeTextureFace(0, i);
                    this.blitCubeMap(source, framebuffer, i, layer);
                }
            }
            else {
                this.blitCubeMap(source, framebuffer, layer || 0, sampler);
            }
        }
        else {
            throw new Error('Blitter.blit() failed: invalid texture type');
        }
        device.setFramebuffer(saveFramebuffer);
        device.setViewport(saveViewport);
        device.setScissor(saveScissor);
        device.setRenderStates(saveRenderStates);
        if (!dest.isFramebuffer()) {
            framebuffer.dispose();
        }
    }
}
const blitProgramCache = {};
let blitPrimitive2D = null;
let blitPrimitiveCube = null;
let blitRenderStates = null;
function getBlitPrimitive2D(device) {
    if (!blitPrimitive2D) {
        blitPrimitive2D = new Primitive(device);
        const vb = device.createStructuredBuffer(makeVertexBufferType(4, 'position_f32x2'), { usage: 'vertex', managed: true }, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]));
        blitPrimitive2D.setVertexBuffer(vb);
        blitPrimitive2D.indexCount = 4;
        blitPrimitive2D.indexStart = 0;
        blitPrimitive2D.primitiveType = PrimitiveType.TriangleStrip;
    }
    return blitPrimitive2D;
}
function getBlitPrimitiveCube(device) {
    if (!blitPrimitiveCube) {
        blitPrimitiveCube = new BoxShape(device, {
            needNormal: false,
            needTangent: false,
            needUV: false,
            size: 2,
            pivotX: 0.5,
            pivotY: 0.5,
            pivotZ: 0.5
        });
    }
    return blitPrimitiveCube;
}
function getBlitRenderStateSet(device) {
    if (!blitRenderStates) {
        blitRenderStates = device.createRenderStateSet();
        blitRenderStates.useDepthState().enableTest(false).enableWrite(false);
        blitRenderStates.useRasterizerState().setCullMode(FaceMode.NONE);
    }
    return blitRenderStates;
}
function getBlitProgram(device, type, filter) {
    const hash = `${type}:${filter.hash}`;
    let programInfo = blitProgramCache[hash];
    if (programInfo === undefined) {
        programInfo = createBlitProgram(device, type, filter) || null;
        blitProgramCache[hash] = programInfo;
    }
    return programInfo;
}
function createBlitProgram(device, type, filter) {
    const pb = device.createProgramBuilder();
    const program = pb.buildRenderProgram({
        vertex() {
            this.$inputs.pos = pb.vec2().attrib('position');
            this.$outputs.uv = pb.vec2();
            filter.setup(this, type);
            this.$mainFunc(function () {
                this.$builtins.position = pb.vec4(this.$inputs.pos, 0, 1);
                this.$outputs.uv = type === 'cube' ? pb.mul(pb.vec2(1, -1), this.$inputs.pos.xy) : pb.add(pb.mul(this.$inputs.pos.xy, 0.5), pb.vec2(0.5));
                if (device.getDeviceType() === 'webgpu') {
                    this.$builtins.position.y = pb.neg(this.$builtins.position.y);
                }
            });
        },
        fragment() {
            switch (type) {
                case '2d':
                    this.srcTex = pb.tex2D().uniform(0);
                    break;
                case '2d-array':
                    this.srcTex = pb.tex2DArray().uniform(0);
                    this.srcLayer = pb.int().uniform(0);
                    break;
                case 'cube':
                    this.srcTex = pb.texCube().uniform(0);
                    this.texelSize = pb.float().uniform(0);
                    this.cubeFace = pb.int().uniform(0);
                    break;
                default:
                    throw new Error(`invalid blit type: ${type}`);
            }
            this.$outputs.outColor = pb.vec4();
            filter.setup(this, type);
            this.$mainFunc(function () {
                if (type === 'cube') {
                    this.uv = pb.vec3();
                    this.$if(pb.equal(this.cubeFace, 0), function () {
                        this.uv = pb.vec3(1, this.$inputs.uv.y, pb.neg(this.$inputs.uv.x));
                    }).$elseif(pb.equal(this.cubeFace, 1), function () {
                        this.uv = pb.vec3(-1, this.$inputs.uv.y, this.$inputs.uv.x);
                    }).$elseif(pb.equal(this.cubeFace, 2), function () {
                        this.uv = pb.vec3(this.$inputs.uv.x, 1, pb.neg(this.$inputs.uv.y));
                    }).$elseif(pb.equal(this.cubeFace, 3), function () {
                        this.uv = pb.vec3(this.$inputs.uv.x, -1, this.$inputs.uv.y);
                    }).$elseif(pb.equal(this.cubeFace, 4), function () {
                        this.uv = pb.vec3(this.$inputs.uv.x, this.$inputs.uv.y, 1);
                    }).$else(function () {
                        this.uv = pb.vec3(pb.neg(this.$inputs.uv.x), this.$inputs.uv.y, -1);
                    });
                }
                else {
                    this.uv = this.$inputs.uv;
                }
                this.$l.outTexel = filter.filter(this, type, this.srcTex, this.uv, type === '2d' ? null : this.srcLayer);
                this.$outputs.outColor = filter.writeTexel(this, type, this.$inputs.uv, this.outTexel);
            });
        }
    });
    return program ? {
        program,
        bindGroup: device.createBindGroup(program.bindGroupLayouts[0]),
    } : null;
}
//# sourceMappingURL=blitter.js.map