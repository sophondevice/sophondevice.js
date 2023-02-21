/** sophon base library */
import { Vector2, Vector3, Matrix3x3 } from '@sophon/base';
import { TextureFormat } from '../../device/base_types.js';
import { BUILTIN_ASSET_TEXTURE_SHEEN_LUT } from '../values.js';

function getSheenLutLoader(textureSize) {
    new Vector2();
    new Vector3();
    new Vector3();
    new Vector3();
    new Vector3();
    new Vector3();
    new Vector3();
    new Vector3();
    new Vector3();
    Vector3.axisPY();
    new Matrix3x3();
    const bits = new Uint32Array(1);
    function radicalInverse_VdC(i) {
        bits[0] = i;
        bits[0] = ((bits[0] << 16) | (bits[0] >> 16)) >>> 0;
        bits[0] = ((bits[0] & 0x55555555) << 1) | ((bits[0] & 0xAAAAAAAA) >>> 1) >>> 0;
        bits[0] = ((bits[0] & 0x33333333) << 2) | ((bits[0] & 0xCCCCCCCC) >>> 2) >>> 0;
        bits[0] = ((bits[0] & 0x0F0F0F0F) << 4) | ((bits[0] & 0xF0F0F0F0) >>> 4) >>> 0;
        bits[0] = ((bits[0] & 0x00FF00FF) << 8) | ((bits[0] & 0xFF00FF00) >>> 8) >>> 0;
        return bits[0] * 2.3283064365386963e-10;
    }
    function hammersley(i, iN, out) {
        out.set(i * iN, radicalInverse_VdC(i));
    }
    function distributionCharlie(NdotH, roughness) {
        const invAlpha = 1 / roughness;
        const cos2h = NdotH * NdotH;
        const sin2h = 1 - cos2h;
        return (2 + invAlpha) * Math.pow(sin2h, invAlpha * 0.5) / (2 * Math.PI);
    }
    function visibilityAshikhmin(NdotV, NdotL) {
        return Math.min(Math.max(1 / (4 * (NdotL + NdotV - NdotL * NdotV)), 0), 1);
    }
    function hemisphereUniformSample(u, out) {
        const phi = 2 * Math.PI * u.x;
        const cosTheta = 1 - u.y;
        const sinTheta = Math.sqrt(1 - cosTheta * cosTheta);
        out.set(sinTheta * Math.cos(phi), sinTheta * Math.sin(phi), cosTheta);
    }
    function dfvCharlieUniform(NdotV, roughness, numSamples) {
        let r = 0;
        const V = new Vector3(Math.sqrt(1 - NdotV * NdotV), 0, NdotV);
        const u = new Vector2();
        const H = new Vector3();
        const L = new Vector3();
        for (let i = 0; i < numSamples; i++) {
            hammersley(i, 1 / numSamples, u);
            hemisphereUniformSample(u, H);
            Vector3.scale(H, Vector3.dot(V, H) * 2, L).subBy(V);
            const VdotH = Math.min(Math.max(Vector3.dot(V, H), 0), 1);
            const NdotL = Math.min(Math.max(L.z, 0), 1);
            const NdotH = Math.min(Math.max(H.z, 0), 1);
            if (NdotL > 0) {
                const v = visibilityAshikhmin(NdotV, NdotL);
                const d = distributionCharlie(NdotH, roughness);
                r += v * d * NdotL * VdotH;
            }
        }
        return r * (4 * 2 * Math.PI / numSamples);
    }
    const _tables = (function _generateTables() {
        const buffer = new ArrayBuffer(4);
        const floatView = new Float32Array(buffer);
        const uint32View = new Uint32Array(buffer);
        const baseTable = new Uint32Array(512);
        const shiftTable = new Uint32Array(512);
        for (let i = 0; i < 256; ++i) {
            const e = i - 127;
            if (e < -27) {
                baseTable[i] = 0x0000;
                baseTable[i | 0x100] = 0x8000;
                shiftTable[i] = 24;
                shiftTable[i | 0x100] = 24;
            }
            else if (e < -14) {
                baseTable[i] = 0x0400 >> (-e - 14);
                baseTable[i | 0x100] = (0x0400 >> (-e - 14)) | 0x8000;
                shiftTable[i] = -e - 1;
                shiftTable[i | 0x100] = -e - 1;
            }
            else if (e <= 15) {
                baseTable[i] = (e + 15) << 10;
                baseTable[i | 0x100] = ((e + 15) << 10) | 0x8000;
                shiftTable[i] = 13;
                shiftTable[i | 0x100] = 13;
            }
            else if (e < 128) {
                baseTable[i] = 0x7c00;
                baseTable[i | 0x100] = 0xfc00;
                shiftTable[i] = 24;
                shiftTable[i | 0x100] = 24;
            }
            else {
                baseTable[i] = 0x7c00;
                baseTable[i | 0x100] = 0xfc00;
                shiftTable[i] = 13;
                shiftTable[i | 0x100] = 13;
            }
        }
        const mantissaTable = new Uint32Array(2048);
        const exponentTable = new Uint32Array(64);
        const offsetTable = new Uint32Array(64);
        for (let i = 1; i < 1024; ++i) {
            let m = i << 13;
            let e = 0;
            while ((m & 0x00800000) === 0) {
                m <<= 1;
                e -= 0x00800000;
            }
            m &= ~0x00800000;
            e += 0x38800000;
            mantissaTable[i] = m | e;
        }
        for (let i = 1024; i < 2048; ++i) {
            mantissaTable[i] = 0x38000000 + ((i - 1024) << 13);
        }
        for (let i = 1; i < 31; ++i) {
            exponentTable[i] = i << 23;
        }
        exponentTable[31] = 0x47800000;
        exponentTable[32] = 0x80000000;
        for (let i = 33; i < 63; ++i) {
            exponentTable[i] = 0x80000000 + ((i - 32) << 23);
        }
        exponentTable[63] = 0xc7800000;
        for (let i = 1; i < 64; ++i) {
            if (i !== 32) {
                offsetTable[i] = 1024;
            }
        }
        return {
            floatView: floatView,
            uint32View: uint32View,
            baseTable: baseTable,
            shiftTable: shiftTable,
            mantissaTable: mantissaTable,
            exponentTable: exponentTable,
            offsetTable: offsetTable
        };
    }());
    function encodeF16(val) {
        val = Math.min(Math.max(val, -65504), 65504);
        _tables.floatView[0] = val;
        const f = _tables.uint32View[0];
        const e = (f >> 23) & 0x1ff;
        return _tables.baseTable[e] + ((f & 0x007fffff) >> _tables.shiftTable[e]);
    }
    async function createSheenLUTFilament(device, texture) {
        if (texture) {
            if (!texture.isTexture2D()) {
                throw new Error('can not reload sheen lut texture: invalid texture type');
            }
            if (texture.format !== TextureFormat.RGBA16F) {
                throw new Error('can not reload sheen lut texture: invalid texture format');
            }
            if (texture.width !== textureSize || texture.height !== textureSize) {
                throw new Error('can not reload sheen lut texture: invalid texture size');
            }
        }
        const tex = texture || device.createTexture2D(TextureFormat.RGBA16F, textureSize, textureSize, { colorSpace: 'linear' });
        const image = new Uint16Array(textureSize * textureSize * 4);
        let p = 0;
        const one = encodeF16(1);
        for (let y = 0; y < textureSize; y++) {
            const coord = Math.min(Math.max((y + 0.5) / textureSize, 0), 1);
            const roughness = coord * coord;
            for (let x = 0; x < textureSize; x++) {
                const NdotV = Math.min(Math.max((x + 0.5) / textureSize, 0), 1);
                const c = dfvCharlieUniform(NdotV, roughness, 4096);
                const f16 = encodeF16(c);
                image[p++] = 0;
                image[p++] = 0;
                image[p++] = f16;
                image[p++] = one;
            }
        }
        tex.update(image, 0, 0, textureSize, textureSize);
        tex.name = `builtin:${BUILTIN_ASSET_TEXTURE_SHEEN_LUT}`;
        return tex;
    }
    return createSheenLUTFilament;
}

export { getSheenLutLoader };
//# sourceMappingURL=builtin.js.map
