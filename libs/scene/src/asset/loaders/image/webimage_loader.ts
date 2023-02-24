import { BaseTexture, TextureCreationOptions } from '@sophon/device';
import { AbstractTextureLoader } from '../loader';
import type { AssetManager } from '../../assetmanager';

export class WebImageLoader extends AbstractTextureLoader {
  supportExtension(ext: string): boolean {
    return ext === '.jpg' || ext === '.jpeg' || ext === '.png';
  }
  supportMIMEType(mimeType: string): boolean {
    return mimeType === 'image/jpg' || mimeType === 'image/jpeg' || mimeType === 'image/png';
  }
  async load(assetManager: AssetManager, filename: string, mimeType: string, data: ArrayBuffer, srgb: boolean, noMipmap: boolean, texture?: BaseTexture): Promise<BaseTexture> {
    return new Promise<BaseTexture>((resolve, reject) => {
      if (!mimeType) {
        reject('unknown image file type');
      }
      const src = URL.createObjectURL(new Blob([data], { type: mimeType }));
      const img = document.createElement('img');
      img.src = src;

      img.onload = () => {
        createImageBitmap(img, {
          premultiplyAlpha: 'none',
          colorSpaceConversion: 'none',
        }).then(bm => {
          const options: TextureCreationOptions = {
            colorSpace: srgb ? 'srgb' : 'linear',
            noMipmap: !!noMipmap,
            texture: texture
          };
          const tex = assetManager.device.createTexture2DFromImage(bm, options);
          if (tex) {
            resolve(tex);
          } else {
            reject('create texture from image element failed');
          }
        });
      };
      img.onerror = err => {
        reject(err);
      };
    });
  }
}

