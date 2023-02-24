import { Blitter, BlitType } from './blitter';
import type { PBShaderExp, PBInsideFunctionScope } from '@sophon/device';

export class CopyBlitter extends Blitter {
  filter(
    scope: PBInsideFunctionScope,
    type: BlitType,
    srcTex: PBShaderExp,
    srcUV: PBShaderExp,
    srcLayer: PBShaderExp
  ): PBShaderExp {
    return this.readTexel(scope, type, srcTex, srcUV, srcLayer);
  }
  protected calcHash(): string {
    return '';
  }
}
