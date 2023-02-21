/** sophon base library */
function formatNumber(val, fractLength, totalLength, fillchar) {
    const fixed = val === (val | 0) ? String(val) : val.toFixed(fractLength);
    const ch = fillchar || '0';
    const tl = totalLength || 0;
    return tl > 0 ? (Array(totalLength).join(ch) + fixed).substr(-totalLength) : fixed;
}
const f = new Float32Array(1);
function toFloat32(a) {
    f[0] = a;
    return f[0];
}
function numberEquals(a, b, epsl) {
    a = toFloat32(a);
    b = toFloat32(b);
    const e = (typeof epsl === 'number' ? epsl : 0.0001) * Math.max(1, Math.abs(a), Math.abs(b));
    return Math.abs(a - b) <= e;
}
function numberClamp(value, low, high) {
    return value < low ? low : value > high ? high : value;
}
function isPowerOf2(value) {
    return value % 1 === 0 && value >= 0 && (value & (value - 1)) === 0;
}
function nextPowerOf2(value) {
    value--;
    value |= value >> 1;
    value |= value >> 2;
    value |= value >> 4;
    value |= value >> 8;
    value |= value >> 16;
    value++;
    return value;
}

export { formatNumber, isPowerOf2, nextPowerOf2, numberClamp, numberEquals, toFloat32 };
//# sourceMappingURL=misc.js.map
