export function formatNumber(
  val: number,
  fractLength: number,
  totalLength?: number,
  fillchar?: string
): string {
  const fixed = val === (val | 0) ? String(val) : val.toFixed(fractLength);
  const ch = fillchar || '0';
  const tl = totalLength || 0;
  return tl > 0 ? (Array(totalLength).join(ch) + fixed).substr(-totalLength) : fixed;
}

const f = new Float32Array(1);
export function toFloat32(a: number): number {
  f[0] = a;
  return f[0];
}

export function numberEquals(a: number, b: number, epsl?: number) {
  a = toFloat32(a);
  b = toFloat32(b);
  // const e = typeof epsl === 'number' ? epsl : Math.max(measureEpsl(a), measureEpsl(b));
  const e = (typeof epsl === 'number' ? epsl : 0.0001) * Math.max(1, Math.abs(a), Math.abs(b));
  return Math.abs(a - b) <= e;
}

export function numberClamp(value: number, low: number, high: number) {
  return value < low ? low : value > high ? high : value;
}

export function isPowerOf2(value: number) {
  return value % 1 === 0 && value >= 0 && (value & (value - 1)) === 0;
}

export function nextPowerOf2(value: number) {
  value--;
  value |= value >> 1;
  value |= value >> 2;
  value |= value >> 4;
  value |= value >> 8;
  value |= value >> 16;
  value++;
  return value;
}
