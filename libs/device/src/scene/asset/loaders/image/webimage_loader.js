import { AbstractTextureLoader } from '../loader';
export class WebImageLoader extends AbstractTextureLoader {
    supportExtension(ext) {
        return ext === '.jpg' || ext === '.jpeg' || ext === '.png';
    }
    supportMIMEType(mimeType) {
        return mimeType === 'image/jpg' || mimeType === 'image/jpeg' || mimeType === 'image/png';
    }
    async load(assetManager, filename, mimeType, data, srgb, noMipmap, texture) {
        return new Promise((resolve, reject) => {
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
                    const options = {
                        colorSpace: srgb ? 'srgb' : 'linear',
                        noMipmap: !!noMipmap,
                        texture: texture
                    };
                    const tex = assetManager.device.createTexture2DFromImage(bm, options);
                    if (tex) {
                        resolve(tex);
                    }
                    else {
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
//# sourceMappingURL=webimage_loader.js.map