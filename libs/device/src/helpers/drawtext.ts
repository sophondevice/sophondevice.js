import { Matrix4x4, parseColor, Vector3, Vector4 } from "@sophon/base";
import { Font } from "./font";
import { GlyphManager } from "./glyphmanager";
import { RenderStateSet } from "../render_states";
import type { Device } from "../device";
import type { BindGroup, GPUProgram, StructuredBuffer, VertexLayout } from "../gpuobject";

const MAX_GLYPH_COUNT = 1024;

export class DrawText {
  private static readonly GLYPH_COUNT = MAX_GLYPH_COUNT;
  private static glyphManager: GlyphManager = null;
  private static prepared = false;
  private static textVertexBuffer: StructuredBuffer = null;
  private static textVertexLayout: VertexLayout = null;
  private static textProgram: GPUProgram = null;
  private static textBindGroup: BindGroup = null;
  private static textRenderStates: RenderStateSet = null;
  private static textOffset = 0;
  private static textMatrix = new Matrix4x4();
  private static font: Font = null;
  private static vertexCache: Float32Array = null;
  private static savedOverridenRenderStates: RenderStateSet = null;
  private static colorValue: Vector4 = new Vector4();
  private static calculateTextMatrix(device: Device, matrix: Matrix4x4) {
    const viewport = device.getViewport();
    const projectionMatrix = Matrix4x4.ortho(0, viewport[2], 0, viewport[3], 1, 100);
    const flipMatrix = Matrix4x4.translation(new Vector3(0, viewport[3], 0)).scaleRight(
      new Vector3(1, -1, 1)
    );
    Matrix4x4.multiply(projectionMatrix, flipMatrix, matrix);
  }
  static setFont(device: Device, name: string) {
    this.font = Font.fetchFont(name, device.getScale()) || Font.fetchFont('12px arial', device.getScale());
  }
  static drawText(device: Device, text: string, color: string, x: number, y: number) {
    if (text.length > 0) {
      this.prepareDrawText(device);
      this.calculateTextMatrix(device, this.textMatrix);
      const colorValue = parseColor(color);
      this.colorValue.x = colorValue.r;
      this.colorValue.y = colorValue.g;
      this.colorValue.z = colorValue.b;
      this.colorValue.w = colorValue.a;
      this.textBindGroup.setValue('textMatrix', this.textMatrix);
      this.textBindGroup.setValue('textColor', this.colorValue);
      this.beginDraw(device);
      let drawn = 0;
      let total = text.length;
      while (drawn < total) {
        const count = Math.min(total - drawn, this.GLYPH_COUNT - this.textOffset);
        if (count > 0) {
          x = this.drawTextNoOverflow(device, text, drawn, count, x, y);
          drawn += count;
          this.textOffset += count;
        }
        if (this.GLYPH_COUNT === this.textOffset) {
          this.textOffset = 0;
          device.flush();
        }
      }
      this.endDraw(device);
    }
  }
  private static drawTextNoOverflow(device: Device, text: string, start: number, count: number, x: number, y: number): number {
    let drawn = 0;
    let atlasIndex = -1;
    let i = 0;
    for (; i < count; i++) {
      const glyph = this.glyphManager.getGlyphInfo(text[i + start], this.font) || this.glyphManager.getGlyphInfo('?', this.font);
      if (atlasIndex >= 0 && glyph.atlasIndex !== atlasIndex) {
        this.textVertexBuffer.bufferSubData((this.textOffset + drawn) * 16 * 4, this.vertexCache, (this.textOffset + drawn) * 16, (i - drawn) * 16);
        this.textBindGroup.setTexture('tex', this.glyphManager.getGlyphTexture(atlasIndex));
        device.draw('triangle-list', (this.textOffset + drawn) * 6, (i - drawn) * 6);
        drawn = i;
      }
      atlasIndex = glyph.atlasIndex;
      const base = (this.textOffset + i) * 16;
      this.vertexCache[base + 0] = x;
      this.vertexCache[base + 1] = y;
      this.vertexCache[base + 2] = glyph.uMin;
      this.vertexCache[base + 3] = glyph.vMin;
      this.vertexCache[base + 4] = x + glyph.width;
      this.vertexCache[base + 5] = y;
      this.vertexCache[base + 6] = glyph.uMax;
      this.vertexCache[base + 7] = glyph.vMin;
      this.vertexCache[base + 8] = x + glyph.width;
      this.vertexCache[base + 9] = y + glyph.height;
      this.vertexCache[base + 10] = glyph.uMax;
      this.vertexCache[base + 11] = glyph.vMax;
      this.vertexCache[base + 12] = x;
      this.vertexCache[base + 13] = y + glyph.height;
      this.vertexCache[base + 14] = glyph.uMin;
      this.vertexCache[base + 15] = glyph.vMax;
      x += glyph.width;
    }
    this.textVertexBuffer.bufferSubData((this.textOffset + drawn) * 16 * 4, this.vertexCache, (this.textOffset + drawn) * 16, (i - drawn) * 16);
    this.textBindGroup.setTexture('tex', this.glyphManager.getGlyphTexture(atlasIndex));
    device.draw('triangle-list', (this.textOffset + drawn) * 6, (i - drawn) * 6);
    return x;
  }
  private static beginDraw(device: Device) {
    this.savedOverridenRenderStates = device.getRenderStatesOverridden();
    device.setProgram(this.textProgram);
    device.setVertexLayout(this.textVertexLayout);
    device.setRenderStates(this.textRenderStates);
    device.setRenderStatesOverridden(null);
    device.setBindGroup(0, this.textBindGroup);
  }
  private static endDraw(device: Device) {
    device.setRenderStatesOverridden(this.savedOverridenRenderStates);
  }
  private static prepareDrawText(device: Device) {
    if (!this.prepared) {
      this.prepared = true;
      this.font = this.font || Font.fetchFont('12px arial', device.getScale());
      this.glyphManager = new GlyphManager(device, 1024, 1024, 1);
      this.vertexCache = new Float32Array(this.GLYPH_COUNT * 16);
      this.textVertexBuffer = device.createInterleavedVertexBuffer(['position_f32x2', 'tex0_f32x2'], this.vertexCache, {
        dynamic: true
      });
      const indices = new Uint16Array(this.GLYPH_COUNT * 6);
      for (let i = 0; i < this.GLYPH_COUNT; i++) {
        const base = i * 4;
        indices[i * 6 + 0] = base + 0;
        indices[i * 6 + 1] = base + 1;
        indices[i * 6 + 2] = base + 2;
        indices[i * 6 + 3] = base + 0;
        indices[i * 6 + 4] = base + 2;
        indices[i * 6 + 5] = base + 3;
      }
      const textIndexBuffer = device.createIndexBuffer(indices);
      this.textVertexLayout = device.createVertexLayout({
        vertexBuffers: [{ buffer: this.textVertexBuffer }],
        indexBuffer: textIndexBuffer
      });
      this.textOffset = 0;
      this.textProgram = device.createProgramBuilder().buildRenderProgram({
        vertex(pb) {
          this.$inputs.pos = pb.vec2().attrib('position');
          this.$inputs.uv = pb.vec2().attrib('texCoord0');
          this.$outputs.uv = pb.vec2();
          this.textMatrix = pb.mat4().uniform(0);
          this.$mainFunc(function(){
            this.$builtins.position = pb.mul(this.textMatrix, pb.vec4(this.$inputs.pos, -50, 1));
            this.$outputs.uv = this.$inputs.uv;
          });
        },
        fragment(pb) {
          this.$outputs.color = pb.vec4();
          this.textColor = pb.vec4().uniform(0);
          this.tex = pb.tex2D().uniform(0);
          this.$mainFunc(function(){
            this.alpha = pb.mul(pb.textureSample(this.tex, this.$inputs.uv).a, this.textColor.a);
            this.$outputs.color = pb.vec4(pb.mul(this.textColor.rgb, this.alpha), this.alpha);
          });
        }
      });
      this.textBindGroup = device.createBindGroup(this.textProgram.bindGroupLayouts[0]);
      this.textRenderStates = device.createRenderStateSet();
      this.textRenderStates.useBlendingState().enable(true).setBlendFuncRGB('one', 'inv-src-alpha').setBlendFuncAlpha('zero', 'one');
      this.textRenderStates.useDepthState().enableTest(false).enableWrite(false);
      this.textRenderStates.useRasterizerState().setCullMode('none');
    }
  }
}