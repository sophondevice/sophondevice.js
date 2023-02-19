import { getDDSMipLevelsInfo } from './dds';
import { AbstractTextureLoader } from '../loader';
export class DDSLoader extends AbstractTextureLoader {
    supportExtension(ext) {
        return ext === '.dds';
    }
    supportMIMEType(mimeType) {
        return mimeType === 'image/dds';
    }
    async load(assetManager, url, mimeType, data, srgb, noMipmap, texture) {
        const arrayBuffer = data;
        const mipmapLevelData = getDDSMipLevelsInfo(arrayBuffer);
        if (!mipmapLevelData) {
            throw new Error(`read DDS file failed: ${url}`);
        }
        const options = {
            colorSpace: srgb ? 'srgb' : 'linear',
            noMipmap: !!noMipmap,
            texture: texture
        };
        if (mipmapLevelData.isCubemap) {
            return assetManager.device.createCubeTextureFromMipmapData(mipmapLevelData, options);
        }
        else if (mipmapLevelData.isVolume) {
            throw new Error(`load DDS volume texture is not supported`);
        }
        else {
            return assetManager.device.createTexture2DFromMipmapData(mipmapLevelData, options);
        }
    }
}
//# sourceMappingURL=dds_loader.js.map