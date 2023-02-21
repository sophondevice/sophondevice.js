/** sophon base library */
import { Vector3 } from './vector.js';

const SH_MINORDER = 2;
const SH_MAXORDER = 6;
const sqrtf = Math.sqrt;
const cosf = Math.cos;
const sinf = Math.sin;
const asinf = Math.asin;
const XM_PI = Math.PI;
const XM_PIDIV2 = 1.570796327;
const fExtraNormFac = [
    2.0 * sqrtf(XM_PI),
    2.0 / 3.0 * sqrtf(3.0 * XM_PI),
    2.0 / 5.0 * sqrtf(5.0 * XM_PI),
    2.0 / 7.0 * sqrtf(7.0 * XM_PI),
    2.0 / 3.0 * sqrtf(XM_PI),
    2.0 / 11.0 * sqrtf(11.0 * XM_PI)
];
function CONSTANT(val) {
    return val;
}
const ComputeCapInt_t1 = sqrtf(0.3141593E1);
const ComputeCapInt_t5 = sqrtf(3.0);
const ComputeCapInt_t11 = sqrtf(5.0);
const ComputeCapInt_t18 = sqrtf(7.0);
const ComputeCapInt_t32 = sqrtf(11.0);
function ComputeCapInt(order, angle, pR) {
    const t2 = cosf(angle);
    const t3 = ComputeCapInt_t1 * t2;
    const t7 = sinf(angle);
    const t8 = t7 * t7;
    pR[0] = -t3 + ComputeCapInt_t1;
    pR[1] = ComputeCapInt_t5 * ComputeCapInt_t1 * t8 / 2.0;
    if (order > 2) {
        const t13 = t2 * t2;
        pR[2] = -ComputeCapInt_t11 * ComputeCapInt_t1 * t2 * (t13 - 1.0) / 2.0;
        if (order > 3) {
            const t19 = ComputeCapInt_t18 * ComputeCapInt_t1;
            const t20 = t13 * t13;
            pR[3] = -5.0 / 8.0 * t19 * t20 + 3.0 / 4.0 * t19 * t13 - t19 / 8.0;
            if (order > 4) {
                pR[4] = -3.0 / 8.0 * t3 * (7.0 * t20 - 10.0 * t13 + 3.0);
                if (order > 5) {
                    const t33 = ComputeCapInt_t32 * ComputeCapInt_t1;
                    pR[5] = -21.0 / 16.0 * t33 * t20 * t13 + 35.0 / 16.0 * t33 * t20 - 15.0 / 16.0 * t33 * t13 + t33 / 16.0;
                }
            }
        }
    }
}
function CosWtInt(order) {
    const fCW0 = 0.25;
    const fCW1 = 0.5;
    const fCW2 = 5.0 / 16.0;
    const fCW4 = -3.0 / 32.0;
    let fRet = fCW0 + fCW1;
    if (order > 2)
        fRet += fCW2;
    if (order > 4)
        fRet += fCW4;
    return fRet;
}
const SHEvalHemisphereLight_fSqrtPi = sqrtf(XM_PI);
const SHEvalHemisphereLight_fSqrtPi3 = sqrtf(XM_PI / 3.0);
function sh_eval_basis_1(x, y, z, b) {
    const p_0_0 = 0.282094791773878140;
    b[0] = p_0_0;
    const p_1_0 = 0.488602511902919920 * z;
    b[2] = p_1_0;
    const s1 = y;
    const c1 = x;
    const p_1_1 = -0.488602511902919920;
    b[1] = p_1_1 * s1;
    b[3] = p_1_1 * c1;
}
function sh_eval_basis_2(x, y, z, b) {
    const z2 = z * z;
    const p_0_0 = 0.282094791773878140;
    b[0] = p_0_0;
    const p_1_0 = 0.488602511902919920 * z;
    b[2] = p_1_0;
    const p_2_0 = 0.946174695757560080 * z2 + -0.315391565252520050;
    b[6] = p_2_0;
    const s1 = y;
    const c1 = x;
    const p_1_1 = -0.488602511902919920;
    b[1] = p_1_1 * s1;
    b[3] = p_1_1 * c1;
    const p_2_1 = -1.092548430592079200 * z;
    b[5] = p_2_1 * s1;
    b[7] = p_2_1 * c1;
    const s2 = x * s1 + y * c1;
    const c2 = x * c1 - y * s1;
    const p_2_2 = 0.546274215296039590;
    b[4] = p_2_2 * s2;
    b[8] = p_2_2 * c2;
}
function sh_eval_basis_3(x, y, z, b) {
    const z2 = z * z;
    const p_0_0 = 0.282094791773878140;
    b[0] = p_0_0;
    const p_1_0 = 0.488602511902919920 * z;
    b[2] = p_1_0;
    const p_2_0 = 0.946174695757560080 * z2 + -0.315391565252520050;
    b[6] = p_2_0;
    const p_3_0 = z * (1.865881662950577000 * z2 + -1.119528997770346200);
    b[12] = p_3_0;
    const s1 = y;
    const c1 = x;
    const p_1_1 = -0.488602511902919920;
    b[1] = p_1_1 * s1;
    b[3] = p_1_1 * c1;
    const p_2_1 = -1.092548430592079200 * z;
    b[5] = p_2_1 * s1;
    b[7] = p_2_1 * c1;
    const p_3_1 = -2.285228997322328800 * z2 + 0.457045799464465770;
    b[11] = p_3_1 * s1;
    b[13] = p_3_1 * c1;
    const s2 = x * s1 + y * c1;
    const c2 = x * c1 - y * s1;
    const p_2_2 = 0.546274215296039590;
    b[4] = p_2_2 * s2;
    b[8] = p_2_2 * c2;
    const p_3_2 = 1.445305721320277100 * z;
    b[10] = p_3_2 * s2;
    b[14] = p_3_2 * c2;
    const s3 = x * s2 + y * c2;
    const c3 = x * c2 - y * s2;
    const p_3_3 = -0.590043589926643520;
    b[9] = p_3_3 * s3;
    b[15] = p_3_3 * c3;
}
function sh_eval_basis_4(x, y, z, b) {
    const z2 = z * z;
    const p_0_0 = 0.282094791773878140;
    b[0] = p_0_0;
    const p_1_0 = 0.488602511902919920 * z;
    b[2] = p_1_0;
    const p_2_0 = 0.946174695757560080 * z2 + -0.315391565252520050;
    b[6] = p_2_0;
    const p_3_0 = z * (1.865881662950577000 * z2 + -1.119528997770346200);
    b[12] = p_3_0;
    const p_4_0 = 1.984313483298443000 * z * p_3_0 + -1.006230589874905300 * p_2_0;
    b[20] = p_4_0;
    const s1 = y;
    const c1 = x;
    const p_1_1 = -0.488602511902919920;
    b[1] = p_1_1 * s1;
    b[3] = p_1_1 * c1;
    const p_2_1 = -1.092548430592079200 * z;
    b[5] = p_2_1 * s1;
    b[7] = p_2_1 * c1;
    const p_3_1 = -2.285228997322328800 * z2 + 0.457045799464465770;
    b[11] = p_3_1 * s1;
    b[13] = p_3_1 * c1;
    const p_4_1 = z * (-4.683325804901024000 * z2 + 2.007139630671867200);
    b[19] = p_4_1 * s1;
    b[21] = p_4_1 * c1;
    const s2 = x * s1 + y * c1;
    const c2 = x * c1 - y * s1;
    const p_2_2 = 0.546274215296039590;
    b[4] = p_2_2 * s2;
    b[8] = p_2_2 * c2;
    const p_3_2 = 1.445305721320277100 * z;
    b[10] = p_3_2 * s2;
    b[14] = p_3_2 * c2;
    const p_4_2 = 3.311611435151459800 * z2 + -0.473087347878779980;
    b[18] = p_4_2 * s2;
    b[22] = p_4_2 * c2;
    const s3 = x * s2 + y * c2;
    const c3 = x * c2 - y * s2;
    const p_3_3 = -0.590043589926643520;
    b[9] = p_3_3 * s3;
    b[15] = p_3_3 * c3;
    const p_4_3 = -1.770130769779930200 * z;
    b[17] = p_4_3 * s3;
    b[23] = p_4_3 * c3;
    const s4 = x * s3 + y * c3;
    const c4 = x * c3 - y * s3;
    const p_4_4 = 0.625835735449176030;
    b[16] = p_4_4 * s4;
    b[24] = p_4_4 * c4;
}
function sh_eval_basis_5(x, y, z, b) {
    const z2 = z * z;
    const p_0_0 = CONSTANT(0.282094791773878140);
    b[0] = p_0_0;
    const p_1_0 = CONSTANT(0.488602511902919920) * z;
    b[2] = p_1_0;
    const p_2_0 = CONSTANT(0.946174695757560080) * z2 + CONSTANT(-0.315391565252520050);
    b[6] = p_2_0;
    const p_3_0 = z * (CONSTANT(1.865881662950577000) * z2 + CONSTANT(-1.119528997770346200));
    b[12] = p_3_0;
    const p_4_0 = CONSTANT(1.984313483298443000) * z * p_3_0 + CONSTANT(-1.006230589874905300) * p_2_0;
    b[20] = p_4_0;
    const p_5_0 = CONSTANT(1.989974874213239700) * z * p_4_0 + CONSTANT(-1.002853072844814000) * p_3_0;
    b[30] = p_5_0;
    const s1 = y;
    const c1 = x;
    const p_1_1 = CONSTANT(-0.488602511902919920);
    b[1] = p_1_1 * s1;
    b[3] = p_1_1 * c1;
    const p_2_1 = CONSTANT(-1.092548430592079200) * z;
    b[5] = p_2_1 * s1;
    b[7] = p_2_1 * c1;
    const p_3_1 = CONSTANT(-2.285228997322328800) * z2 + CONSTANT(0.457045799464465770);
    b[11] = p_3_1 * s1;
    b[13] = p_3_1 * c1;
    const p_4_1 = z * (CONSTANT(-4.683325804901024000) * z2 + CONSTANT(2.007139630671867200));
    b[19] = p_4_1 * s1;
    b[21] = p_4_1 * c1;
    const p_5_1 = CONSTANT(2.031009601158990200) * z * p_4_1 + CONSTANT(-0.991031208965114650) * p_3_1;
    b[29] = p_5_1 * s1;
    b[31] = p_5_1 * c1;
    const s2 = x * s1 + y * c1;
    const c2 = x * c1 - y * s1;
    const p_2_2 = CONSTANT(0.546274215296039590);
    b[4] = p_2_2 * s2;
    b[8] = p_2_2 * c2;
    const p_3_2 = CONSTANT(1.445305721320277100) * z;
    b[10] = p_3_2 * s2;
    b[14] = p_3_2 * c2;
    const p_4_2 = CONSTANT(3.311611435151459800) * z2 + CONSTANT(-0.473087347878779980);
    b[18] = p_4_2 * s2;
    b[22] = p_4_2 * c2;
    const p_5_2 = z * (CONSTANT(7.190305177459987500) * z2 + CONSTANT(-2.396768392486662100));
    b[28] = p_5_2 * s2;
    b[32] = p_5_2 * c2;
    const s3 = x * s2 + y * c2;
    const c3 = x * c2 - y * s2;
    const p_3_3 = CONSTANT(-0.590043589926643520);
    b[9] = p_3_3 * s3;
    b[15] = p_3_3 * c3;
    const p_4_3 = CONSTANT(-1.770130769779930200) * z;
    b[17] = p_4_3 * s3;
    b[23] = p_4_3 * c3;
    const p_5_3 = CONSTANT(-4.403144694917253700) * z2 + CONSTANT(0.489238299435250430);
    b[27] = p_5_3 * s3;
    b[33] = p_5_3 * c3;
    const s4 = x * s3 + y * c3;
    const c4 = x * c3 - y * s3;
    const p_4_4 = CONSTANT(0.625835735449176030);
    b[16] = p_4_4 * s4;
    b[24] = p_4_4 * c4;
    const p_5_4 = CONSTANT(2.075662314881041100) * z;
    b[26] = p_5_4 * s4;
    b[34] = p_5_4 * c4;
    const s5 = x * s4 + y * c4;
    const c5 = x * c4 - y * s4;
    const p_5_5 = CONSTANT(-0.656382056840170150);
    b[25] = p_5_5 * s5;
    b[35] = p_5_5 * c5;
}
function XMSHEvalDirection(result, order, dir) {
    const dv = dir;
    const fX = dv.x;
    const fY = dv.y;
    const fZ = dv.z;
    switch (order) {
        case 2:
            sh_eval_basis_1(fX, fY, fZ, result);
            break;
        case 3:
            sh_eval_basis_2(fX, fY, fZ, result);
            break;
        case 4:
            sh_eval_basis_3(fX, fY, fZ, result);
            break;
        case 5:
            sh_eval_basis_4(fX, fY, fZ, result);
            break;
        case 6:
            sh_eval_basis_5(fX, fY, fZ, result);
            break;
        default:
            return null;
    }
    return result;
}
function XMSHEvalDirectionalLight(order, dir, color, resultR, resultG, resultB) {
    if (!resultR)
        return false;
    if (order < SH_MINORDER || order > SH_MAXORDER)
        return false;
    const clr = color;
    const fTmp = new Float32Array(SH_MAXORDER * SH_MAXORDER);
    XMSHEvalDirection(fTmp, order, dir);
    const fNorm = XM_PI / CosWtInt(order);
    const numcoeff = order * order;
    const fRScale = fNorm * clr.x;
    for (let i = 0; i < numcoeff; ++i) {
        resultR[i] = fTmp[i] * fRScale;
    }
    if (resultG) {
        const fGScale = fNorm * clr.y;
        for (let i = 0; i < numcoeff; ++i) {
            resultG[i] = fTmp[i] * fGScale;
        }
    }
    if (resultB) {
        const fBScale = fNorm * clr.z;
        for (let i = 0; i < numcoeff; ++i) {
            resultB[i] = fTmp[i] * fBScale;
        }
    }
    return true;
}
function XMSHEvalSphericalLight(order, pos, radius, color, resultR, resultG, resultB) {
    if (!resultR)
        return false;
    if (radius < 0)
        return false;
    const fDist = pos.magnitude;
    const fConeAngle = (fDist <= radius) ? (XM_PIDIV2) : asinf(radius / fDist);
    const dir = Vector3.normalize(pos);
    const fTmpDir = new Float32Array(SH_MAXORDER * SH_MAXORDER);
    const fTmpL0 = new Float32Array(SH_MAXORDER);
    const fNewNorm = 1.0;
    ComputeCapInt(order, fConeAngle, fTmpL0);
    const vd = new Vector3(dir);
    const fX = vd.x;
    const fY = vd.y;
    const fZ = vd.z;
    switch (order) {
        case 2:
            sh_eval_basis_1(fX, fY, fZ, fTmpDir);
            break;
        case 3:
            sh_eval_basis_2(fX, fY, fZ, fTmpDir);
            break;
        case 4:
            sh_eval_basis_3(fX, fY, fZ, fTmpDir);
            break;
        case 5:
            sh_eval_basis_4(fX, fY, fZ, fTmpDir);
            break;
        case 6:
            sh_eval_basis_5(fX, fY, fZ, fTmpDir);
            break;
        default:
            return false;
    }
    const clr = color;
    for (let i = 0; i < order; ++i) {
        const cNumCoefs = 2 * i + 1;
        const cStart = i * i;
        const fValUse = fTmpL0[i] * clr.x * fNewNorm * fExtraNormFac[i];
        for (let j = 0; j < cNumCoefs; ++j)
            resultR[cStart + j] = fTmpDir[cStart + j] * fValUse;
    }
    if (resultG) {
        for (let i = 0; i < order; ++i) {
            const cNumCoefs = 2 * i + 1;
            const cStart = i * i;
            const fValUse = fTmpL0[i] * clr.y * fNewNorm * fExtraNormFac[i];
            for (let j = 0; j < cNumCoefs; ++j)
                resultG[cStart + j] = fTmpDir[cStart + j] * fValUse;
        }
    }
    if (resultB) {
        for (let i = 0; i < order; ++i) {
            const cNumCoefs = 2 * i + 1;
            const cStart = i * i;
            const fValUse = fTmpL0[i] * clr.z * fNewNorm * fExtraNormFac[i];
            for (let j = 0; j < cNumCoefs; ++j)
                resultB[cStart + j] = fTmpDir[cStart + j] * fValUse;
        }
    }
    return true;
}
function XMSHEvalConeLight(order, dir, radius, color, resultR, resultG, resultB) {
    if (!resultR)
        return false;
    if (radius < 0 || radius > (XM_PI * 1.00001))
        return false;
    if (radius < 0.0001) {
        return XMSHEvalDirectionalLight(order, dir, color, resultR, resultG, resultB);
    }
    else {
        const fTmpL0 = new Float32Array(SH_MAXORDER);
        const fTmpDir = new Float32Array(SH_MAXORDER * SH_MAXORDER);
        const fConeAngle = radius;
        const fAngCheck = (fConeAngle > XM_PIDIV2) ? (XM_PIDIV2) : fConeAngle;
        const fNewNorm = 1.0 / (sinf(fAngCheck) * sinf(fAngCheck));
        ComputeCapInt(order, fConeAngle, fTmpL0);
        const vd = dir;
        const fX = vd.x;
        const fY = vd.y;
        const fZ = vd.z;
        switch (order) {
            case 2:
                sh_eval_basis_1(fX, fY, fZ, fTmpDir);
                break;
            case 3:
                sh_eval_basis_2(fX, fY, fZ, fTmpDir);
                break;
            case 4:
                sh_eval_basis_3(fX, fY, fZ, fTmpDir);
                break;
            case 5:
                sh_eval_basis_4(fX, fY, fZ, fTmpDir);
                break;
            case 6:
                sh_eval_basis_5(fX, fY, fZ, fTmpDir);
                break;
            default:
                return false;
        }
        const clr = color;
        for (let i = 0; i < order; ++i) {
            const cNumCoefs = 2 * i + 1;
            const cStart = i * i;
            const fValUse = fTmpL0[i] * clr.x * fNewNorm * fExtraNormFac[i];
            for (let j = 0; j < cNumCoefs; ++j)
                resultR[cStart + j] = fTmpDir[cStart + j] * fValUse;
        }
        if (resultG) {
            for (let i = 0; i < order; ++i) {
                const cNumCoefs = 2 * i + 1;
                const cStart = i * i;
                const fValUse = fTmpL0[i] * clr.y * fNewNorm * fExtraNormFac[i];
                for (let j = 0; j < cNumCoefs; ++j)
                    resultG[cStart + j] = fTmpDir[cStart + j] * fValUse;
            }
        }
        if (resultB) {
            for (let i = 0; i < order; ++i) {
                const cNumCoefs = 2 * i + 1;
                const cStart = i * i;
                const fValUse = fTmpL0[i] * clr.z * fNewNorm * fExtraNormFac[i];
                for (let j = 0; j < cNumCoefs; ++j)
                    resultB[cStart + j] = fTmpDir[cStart + j] * fValUse;
            }
        }
    }
    return true;
}
function XMSHEvalHemisphereLight(order, dir, topColor, bottomColor, resultR, resultG, resultB) {
    if (!resultR)
        return false;
    if (order < SH_MINORDER || order > SH_MAXORDER)
        return false;
    const fTmpDir = new Float32Array(SH_MAXORDER * SH_MAXORDER);
    const fTmpL0 = new Float32Array(SH_MAXORDER);
    const fNewNorm = 3.0 / 2.0;
    const vd = dir;
    const fX = vd.x;
    const fY = vd.y;
    const fZ = vd.z;
    sh_eval_basis_1(fX, fY, fZ, fTmpDir);
    const clrTop = topColor;
    const clrBottom = bottomColor;
    let fA = clrTop.x;
    let fAvrg = (clrTop.x + clrBottom.x) * 0.5;
    fTmpL0[0] = fAvrg * 2.0 * SHEvalHemisphereLight_fSqrtPi;
    fTmpL0[1] = (fA - fAvrg) * 2.0 * SHEvalHemisphereLight_fSqrtPi3;
    let i = 0;
    for (; i < 2; ++i) {
        const cNumCoefs = 2 * i + 1;
        const cStart = i * i;
        const fValUse = fTmpL0[i] * fNewNorm * fExtraNormFac[i];
        for (let j = 0; j < cNumCoefs; ++j)
            resultR[cStart + j] = fTmpDir[cStart + j] * fValUse;
    }
    for (; i < order; ++i) {
        const cNumCoefs = 2 * i + 1;
        const cStart = i * i;
        for (let j = 0; j < cNumCoefs; ++j)
            resultR[cStart + j] = 0.0;
    }
    if (resultG) {
        fA = clrTop.y;
        fAvrg = (clrTop.y + clrBottom.y) * 0.5;
        fTmpL0[0] = fAvrg * 2.0 * SHEvalHemisphereLight_fSqrtPi;
        fTmpL0[1] = (fA - fAvrg) * 2.0 * SHEvalHemisphereLight_fSqrtPi3;
        for (i = 0; i < 2; ++i) {
            const cNumCoefs = 2 * i + 1;
            const cStart = i * i;
            const fValUse = fTmpL0[i] * fNewNorm * fExtraNormFac[i];
            for (let j = 0; j < cNumCoefs; ++j)
                resultG[cStart + j] = fTmpDir[cStart + j] * fValUse;
        }
        for (; i < order; ++i) {
            const cNumCoefs = 2 * i + 1;
            const cStart = i * i;
            for (let j = 0; j < cNumCoefs; ++j)
                resultG[cStart + j] = 0.0;
        }
    }
    if (resultB) {
        fA = clrTop.z;
        fAvrg = (clrTop.z + clrBottom.z) * 0.5;
        fTmpL0[0] = fAvrg * 2.0 * SHEvalHemisphereLight_fSqrtPi;
        fTmpL0[1] = (fA - fAvrg) * 2.0 * SHEvalHemisphereLight_fSqrtPi3;
        for (i = 0; i < 2; ++i) {
            const cNumCoefs = 2 * i + 1;
            const cStart = i * i;
            const fValUse = fTmpL0[i] * fNewNorm * fExtraNormFac[i];
            for (let j = 0; j < cNumCoefs; ++j)
                resultB[cStart + j] = fTmpDir[cStart + j] * fValUse;
        }
        for (; i < order; ++i) {
            const cNumCoefs = 2 * i + 1;
            const cStart = i * i;
            for (let j = 0; j < cNumCoefs; ++j)
                resultB[cStart + j] = 0.0;
        }
    }
    return true;
}

export { XMSHEvalConeLight, XMSHEvalDirectionalLight, XMSHEvalHemisphereLight, XMSHEvalSphericalLight };
//# sourceMappingURL=sh.js.map
