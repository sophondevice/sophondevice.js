import { Matrix4x4, Vector3, Vector4, ColorRGBA, REventTarget } from '@sophon/base';
import { RMouseEvent, RDragEvent, RKeyEvent } from './events';
import type {
  BindGroup,
  RenderStateSet,
  Device,
  Texture2D,
  GPUProgram,
  TextureSampler,
  VertexLayout,
  VertexLayoutOptions
} from '@sophon/device';
import type { GUI } from './gui';
import type { RNode } from './node';

export class GUIRenderer extends REventTarget {
  /** @internal */
  private static readonly VERTEX_BUFFER_SIZE = 8192;
  /** @internal */
  private _device: Device;
  /** @internal */
  private _primitiveBuffer: VertexLayout[];
  /** @internal */
  private _activeBuffer: number;
  /** @internal */
  private _drawPosition: number;
  /** @internal */
  private _drawCount: number;
  /** @internal */
  private _currentTexture: Texture2D;
  /** @internal */
  private _program: GPUProgram;
  /** @internal */
  private _textureSampler: TextureSampler;
  /** @internal */
  private _programTexture: GPUProgram;
  /** @internal */
  private _bindGroup: BindGroup;
  /** @internal */
  private _bindGroupTexture: BindGroup;
  /** @internal */
  private _renderStateSet: RenderStateSet;
  /** @internal */
  private _vertexCache: Float32Array;
  /** @internal */
  private _projectionMatrix: Matrix4x4;
  /** @internal */
  private _flipMatrix: Matrix4x4;
  /** @internal */
  private _savedViewports: number[][];
  /** @internal */
  private _savedScissors: number[][];
  constructor(device: Device) {
    super();
    this._device = device;
    this._projectionMatrix = Matrix4x4.ortho(
      0,
      this._device.getDrawingBufferWidth(),
      0,
      this._device.getDrawingBufferHeight(),
      1,
      100
    );
    this._flipMatrix = Matrix4x4.translation(
      new Vector3(0, this._device.getDrawingBufferHeight(), 0)
    ).scaleRight(new Vector3(1, -1, 1));
    this._program = this.createProgram(false);
    this._programTexture = this.createProgram(true);
    this._bindGroup = this._device.createBindGroup(this._program.bindGroupLayouts[0]);
    this._bindGroupTexture = this._device.createBindGroup(this._programTexture.bindGroupLayouts[0]);
    this._textureSampler = this._device.createSampler({
      magFilter: 'nearest',
      minFilter: 'nearest',
      mipFilter: 'none'
    });
    this._renderStateSet = this.createStateSet();
    this._primitiveBuffer = [];
    this._activeBuffer = 0;
    this._savedViewports = [];
    this._savedScissors = [];
    const indexArray = new Uint32Array(Array.from({ length: GUIRenderer.VERTEX_BUFFER_SIZE * 6 }));
    for (let i = 0; i < GUIRenderer.VERTEX_BUFFER_SIZE; i++) {
      const base = i * 4;
      indexArray[i * 6 + 0] = base + 0;
      indexArray[i * 6 + 1] = base + 1;
      indexArray[i * 6 + 2] = base + 2;
      indexArray[i * 6 + 3] = base + 0;
      indexArray[i * 6 + 4] = base + 2;
      indexArray[i * 6 + 5] = base + 3;
    }
    for (let i = 0; i < 2; i++) {
      const opt: VertexLayoutOptions = {
        vertexBuffers: [{
          buffer: this._device.createInterleavedVertexBuffer(['position_f32x3', 'diffuse_f32x4', 'tex0_f32x2'], new Float32Array(GUIRenderer.VERTEX_BUFFER_SIZE * 4 * 9), { dynamic: true })
        }],
        indexBuffer: this._device.createIndexBuffer(indexArray, { managed: true })
      };
      this._primitiveBuffer.push(this._device.createVertexLayout(opt));
    }
    this._drawPosition = 0;
    this._drawCount = 0;
    this._currentTexture = null;
    this._vertexCache = new Float32Array(9 * 4 * GUIRenderer.VERTEX_BUFFER_SIZE);
  }
  get device() {
    return this._device;
  }
  dispose() {
    this._primitiveBuffer = null;
    this._vertexCache = null;
    this._device = null;
  }
  getCanvas(): HTMLCanvasElement {
    return this._device.canvas;
  }
  getDrawingBufferWidth(): number {
    return this._device.deviceToScreen(this._device.getDrawingBufferWidth());
  }
  getDrawingBufferHeight(): number {
    return this._device.deviceToScreen(this._device.getDrawingBufferHeight());
  }
  screenToDevice(val: number): number {
    return this._device.screenToDevice(val);
  }
  deviceToScreen(val: number): number {
    return this._device.deviceToScreen(val);
  }
  supportColorComposition(): boolean {
    return true;
  }
  createTexture(width: number, height: number, color: ColorRGBA, linear: boolean): Texture2D {
    const tex = this._device.createTexture2D('rgba8unorm', width, height, {
      colorSpace: linear ? 'linear' : 'srgb',
      noMipmap: true
    });
    if (color) {
      this.clearTexture(tex, color);
    }
    return tex;
  }
  clearTexture(tex: Texture2D, color: ColorRGBA) {
    const pixels = new Uint8Array(tex.width * tex.height * 4);
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    const a = Math.round(color.a * 255);
    for (let i = 0; i < tex.width * tex.height; i++) {
      pixels[i * 4 + 0] = r;
      pixels[i * 4 + 1] = g;
      pixels[i * 4 + 2] = b;
      pixels[i * 4 + 3] = a;
    }
    tex.update(pixels, 0, 0, tex.width, tex.height);
  }
  updateTextureWithImage(texture: Texture2D, bitmap: ImageData, x: number, y: number): void {
    const originValues = new Uint8Array(bitmap.data.buffer);
    console.assert(texture.format === 'rgba8unorm');
    texture.update(originValues, x, y, bitmap.width, bitmap.height);
  }
  updateTextureWithCanvas(
    texture: Texture2D,
    ctx: CanvasRenderingContext2D,
    cvsOffsetX: number,
    cvsOffsetY: number,
    w: number,
    h: number,
    x: number,
    y: number
  ): void {
    texture.updateFromElement(ctx.canvas, x, y, cvsOffsetX, cvsOffsetY, w, h);
  }
  getTextureWidth(texture: Texture2D): number {
    return texture.width;
  }
  getTextureHeight(texture: Texture2D): number {
    return texture.height;
  }
  disposeTexture(texture: Texture2D): void {
    texture?.dispose();
  }
  setCursorStyle(style: string): void {
    this.getCanvas().style.cursor = style;
  }
  getCursorStyle(): string {
    return this.getCanvas().style.cursor;
  }
  drawQuads(data: Float32Array, texture: Texture2D) {
    let tex = texture || null;
    if (tex?.disposed) {
      tex = null;
    }
    if (
      tex !== this._currentTexture ||
      this._drawPosition + this._drawCount === GUIRenderer.VERTEX_BUFFER_SIZE
    ) {
      this.flush();
      this._currentTexture = tex;
    }
    let updatePosition = this._drawPosition + this._drawCount;
    let count = data.length / 36;
    let pos = 0;
    while (updatePosition < GUIRenderer.VERTEX_BUFFER_SIZE && count > 0) {
      const drawCount = Math.min(count, GUIRenderer.VERTEX_BUFFER_SIZE - updatePosition);
      const subdata = pos === 0 && drawCount === count ? data : data.subarray(pos, pos + drawCount * 36);
      this._vertexCache.set(subdata, updatePosition * 36);
      this._drawCount += drawCount;
      pos += drawCount * 36;
      updatePosition += drawCount;
      count -= drawCount;
      if (updatePosition === GUIRenderer.VERTEX_BUFFER_SIZE) {
        this.flush();
        updatePosition = this._drawPosition + this._drawCount;
      }
    }
  }
  flush() {
    if (this._drawCount > 0) {
      const buffer = this._primitiveBuffer[this._activeBuffer];
      buffer
        .getVertexBuffer('position')
        .bufferSubData(
          this._drawPosition * 36 * this._vertexCache.BYTES_PER_ELEMENT,
          this._vertexCache,
          this._drawPosition * 36,
          this._drawCount * 36
        );
      if (this._currentTexture) {
        this._device.setProgram(this._programTexture);
        this._bindGroupTexture.setTexture('tex', this._currentTexture, this._textureSampler);
        this._device.setBindGroup(0, this._bindGroupTexture);
      } else {
        this._device.setProgram(this._program);
        this._device.setBindGroup(0, this._bindGroup);
      }
      this._device.setBindGroup(1, null);
      this._device.setBindGroup(2, null);
      this._device.setBindGroup(3, null);
      this._device.setRenderStates(this._renderStateSet);
      /*
      buffer.indexStart = this._drawPosition * 6;
      buffer.indexCount = this._drawCount * 6;
      buffer.draw();
      */
      buffer.draw('triangle-list', this._drawPosition * 6, this._drawCount * 6);
      if (this._drawPosition + this._drawCount === GUIRenderer.VERTEX_BUFFER_SIZE) {
        this._activeBuffer = 1 - this._activeBuffer;
        this._drawPosition = 0;
      } else {
        this._drawPosition += this._drawCount;
      }
      this._drawCount = 0;
    }
  }
  pushViewport(x: number, y: number, w: number, h: number) {
    this._savedViewports.push(this._device.getViewport());
    this._device.setViewport(x, y, w, h);
  }
  popViewport() {
    const saved = this._savedViewports.pop();
    this._device.setViewport(saved[0], saved[1], saved[2], saved[3]);
  }
  pushScissor(x: number, y: number, w: number, h: number) {
    this._savedScissors.push(this._device.getScissor());
    this._device.setScissor(x, y, w, h);
  }
  popScissor() {
    const saved = this._savedScissors.pop();
    this._device.setScissor(saved[0], saved[1], saved[2], saved[3]);
  }
  beginRender() {
    this._device.setViewport();
    this._device.setScissor();
    this._projectionMatrix.ortho(0, this.getDrawingBufferWidth(), 0, this.getDrawingBufferHeight(), 1, 100);
    this._flipMatrix = Matrix4x4.translation(new Vector3(0, this.getDrawingBufferHeight(), 0)).scaleRight(
      new Vector3(1, -1, 1)
    );
    const mvpMatrix = Matrix4x4.multiply(this._projectionMatrix, this._flipMatrix);
    this._bindGroup.setValue('transform', { mvpMatrix });
    this._bindGroupTexture.setValue('transform', { mvpMatrix });
    this._device.clearFrameBuffer(new Vector4(0, 0, 0, 1), 1, 0);
  }
  endRender() {
    this.flush();
  }
  beginCustomDraw(node: RNode) {
    this.flush();
    const vp = this._device.getViewport();
    const height = vp[3];
    const rect = node.getClientRect();
    const pos = node.toAbsolute({ x: 0, y: 0 });
    const posClient = { x: pos.x + rect.x, y: pos.y + rect.y };
    let x = posClient.x;
    let y = height - posClient.y - rect.w;
    const w = rect.z;
    const h = rect.w;
    this.pushViewport(x, y, w, h);
    const cliprect = node.getClippedRect() || rect;
    if (cliprect) {
      x = cliprect.x + pos.x;
      y = height - cliprect.y - pos.y - cliprect.w;
    }
    this.pushScissor(x, y, cliprect.z, cliprect.w);
  }
  endCustomDraw(node: RNode) {
    this.popScissor();
    this.popViewport();
  }
  /** @internal */
  private createStateSet(): RenderStateSet {
    const rs = this._device.createRenderStateSet();
    rs.useBlendingState().enable(true).setBlendFunc('one', 'inv-src-alpha');
    rs.useDepthState().enableTest(false).enableWrite(false);
    rs.useRasterizerState().setCullMode('none');
    return rs;
  }
  /** @internal */
  private createProgram(diffuseMap: boolean): GPUProgram {
    const pb = this._device.createProgramBuilder();
    const structUniform = pb.defineStruct('UIMaterialUniforms', 'std140', pb.mat4('mvpMatrix'));
    return pb.buildRenderProgram({
      label: 'UI',
      vertex() {
        this.$inputs.pos = pb.vec3().attrib('position');
        this.$inputs.diffuse = pb.vec4().attrib('diffuse');
        this.$outputs.outDiffuse = pb.vec4();
        if (diffuseMap) {
          this.$inputs.uv = pb.vec2().attrib('texCoord0');
          this.$outputs.outUV = pb.vec2();
        }
        this.transform = structUniform().uniform(0);
        this.$mainFunc(function () {
          this.$builtins.position = pb.mul(this.transform.mvpMatrix, pb.vec4(this.$inputs.pos, 1));
          this.$outputs.outDiffuse = this.$inputs.diffuse;
          if (diffuseMap) {
            this.$outputs.outUV = this.$inputs.uv;
          }
        });
      },
      fragment() {
        this.$outputs.outColor = pb.vec4();
        if (diffuseMap) {
          this.tex = pb.tex2D().uniform(0);
        }
        this.$mainFunc(function () {
          if (diffuseMap) {
            this.$l.color = pb.mul(pb.textureSample(this.tex, this.$inputs.outUV), this.$inputs.outDiffuse);
          } else {
            this.$l.color = this.$inputs.outDiffuse;
          }
          this.$outputs.outColor = pb.vec4(
            pb.pow(pb.mul(this.color.xyz, this.color.w), pb.vec3(1 / 2.2)),
            this.color.w
          );
        });
      }
    });
  }
}

function _createMouseEvent(type: string, src: PointerEvent | WheelEvent): RMouseEvent {
  return new RMouseEvent(
    type,
    src.offsetX,
    src.offsetY,
    0,
    0,
    src.button,
    src.buttons,
    (src as WheelEvent).deltaX ?? 0,
    (src as WheelEvent).deltaY ?? 0,
    src.ctrlKey,
    src.shiftKey,
    src.altKey,
    src.metaKey
  );
}
function _createDragEvent(type: string, src: DragEvent): RDragEvent {
  return new RDragEvent(
    type,
    src.offsetX,
    src.offsetY,
    0,
    0,
    src.button,
    src.buttons,
    src.ctrlKey,
    src.shiftKey,
    src.altKey,
    src.metaKey,
    src.dataTransfer
  );
}
function _createKeyEvent(type: string, src: KeyboardEvent): RKeyEvent {
  return new RKeyEvent(
    type,
    src.code,
    src.key,
    src.repeat,
    src.ctrlKey,
    src.shiftKey,
    src.altKey,
    src.metaKey
  );
}

export function injectGUIEvents(gui: GUI, renderer: GUIRenderer): void {
  type PointerEventName = 'pointerdown' | 'pointerup' | 'pointermove' | 'wheel';
  type DragEventName = 'dragenter' | 'dragover' | 'drop';
  const canvas = renderer.getCanvas();
  const mouseEventNames: PointerEventName[] = ['pointerdown', 'pointerup', 'pointermove', 'wheel'];
  const dragEventNames: DragEventName[] = ['dragenter', 'dragover', 'drop'];
  const rendererMouseEventNames = [
    RMouseEvent.NAME_RENDERER_MOUSEDOWN,
    RMouseEvent.NAME_RENDERER_MOUSEUP,
    RMouseEvent.NAME_RENDERER_MOUSEMOVE,
    RMouseEvent.NAME_RENDERER_MOUSEWHEEL
  ];
  const rendererDragEventNames = [
    RMouseEvent.NAME_RENDERER_DRAGENTER,
    RMouseEvent.NAME_RENDERER_DRAGOVER,
    RMouseEvent.NAME_RENDERER_DRAGDROP
  ];
  let captureId: number = null;
  for (let i = 0; i < mouseEventNames.length; i++) {
    canvas.addEventListener(mouseEventNames[i], (evt: PointerEvent | WheelEvent) => {
      if (mouseEventNames[i] === 'pointerdown' && evt.button === 0) {
        captureId = (evt as PointerEvent).pointerId;
        canvas.setPointerCapture(captureId);
      } else if (mouseEventNames[i] === 'pointerup' && (evt as PointerEvent).pointerId === captureId) {
        canvas.releasePointerCapture(captureId);
        captureId = null;
      }
      gui.dispatchEvent(_createMouseEvent(rendererMouseEventNames[i], evt));
    });
  }
  for (let i = 0; i < dragEventNames.length; i++) {
    canvas.addEventListener(dragEventNames[i], (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      gui.dispatchEvent(_createDragEvent(rendererDragEventNames[i], evt));
    });
  }
  type KeyEventName = 'keydown' | 'keyup' | 'keypress';
  const keyEventNames: KeyEventName[] = ['keydown', 'keyup', 'keypress'];
  const rendererKeyEventNames = [
    RKeyEvent.NAME_RENDERER_KEYDOWN,
    RKeyEvent.NAME_RENDERER_KEYUP,
    RKeyEvent.NAME_RENDERER_KEYPRESS
  ];
  for (let i = 0; i < keyEventNames.length; i++) {
    canvas.addEventListener(keyEventNames[i], (evt: KeyboardEvent) => {
      gui.dispatchEvent(_createKeyEvent(rendererKeyEventNames[i], evt));
    });
  }
}
