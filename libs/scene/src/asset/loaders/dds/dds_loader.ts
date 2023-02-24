import { BaseTexture, TextureCreationOptions } from '@sophon/device';
import { getDDSMipLevelsInfo } from './dds';
import { AbstractTextureLoader } from '../loader';
import type { AssetManager } from '../../assetmanager';

export class DDSLoader extends AbstractTextureLoader {
  supportExtension(ext: string): boolean {
    return ext === '.dds';
  }
  supportMIMEType(mimeType: string): boolean {
    return mimeType === 'image/dds';
  }
  async load(assetManager: AssetManager, url: string, mimeType: string, data: ArrayBuffer, srgb: boolean, noMipmap: boolean, texture?: BaseTexture): Promise<BaseTexture> {
    const arrayBuffer = data;
    const mipmapLevelData = getDDSMipLevelsInfo(arrayBuffer);
    if (!mipmapLevelData) {
      throw new Error(`read DDS file failed: ${url}`);
    }
    const options: TextureCreationOptions = {
      colorSpace: srgb ? 'srgb' : 'linear',
      noMipmap: !!noMipmap,
      texture: texture
    }
    if (mipmapLevelData.isCubemap) {
      return assetManager.device.createCubeTextureFromMipmapData(mipmapLevelData, options);
    } else if (mipmapLevelData.isVolume) {
      throw new Error(`load DDS volume texture is not supported`);
    } else {
      return assetManager.device.createTexture2DFromMipmapData(mipmapLevelData, options);
    }
  }
}

