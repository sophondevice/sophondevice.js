import { Matrix4x4, Vector3 } from './vector';
import { AABB } from './aabb';
import type { Nullable } from 'src/utils';

// reduce GC
const tmpV0 = new Vector3();
const tmpV1 = new Vector3();
const tmpV2 = new Vector3();
const tmpV3 = new Vector3();
const tmpV4 = new Vector3();

export class Ray {
  /** @internal */
  private _origin: Vector3;
  /** @internal */
  private _direction: Vector3;
  /** @internal */
  private _ii = 0;
  /** @internal */
  private _ij = 0;
  /** @internal */
  private _ik = 0;
  /** @internal */
  private _ibyj = 0;
  /** @internal */
  private _jbyi = 0;
  /** @internal */
  private _kbyj = 0;
  /** @internal */
  private _jbyk = 0;
  /** @internal */
  private _ibyk = 0;
  /** @internal */
  private _kbyi = 0;
  /** @internal */
  private _c_xy = 0;
  /** @internal */
  private _c_xz = 0;
  /** @internal */
  private _c_yx = 0;
  /** @internal */
  private _c_yz = 0;
  /** @internal */
  private _c_zx = 0;
  /** @internal */
  private _c_zy = 0;
  /** @internal */
  private _bboxIntersectionTest: Nullable<(bbox: AABB) => boolean> = null;
  /** @internal */
  private _bboxIntersectionTestEx: Nullable<(bbox: AABB) => Nullable<number> > = null;

  constructor();
  constructor(origin: Vector3, directionNormalized: Vector3);
  constructor(origin?: Vector3, directionNormalized?: Vector3) {
    this._origin = origin ? new Vector3(origin) : Vector3.zero();
    this._direction = directionNormalized ? new Vector3(directionNormalized) : Vector3.axisPZ();
    this.prepare();
  }

  get bboxIntersectionTest(): (bbox: AABB) => boolean {
    return this._bboxIntersectionTest!;
  }

  get bboxIntersectionTestEx(): (bbox: AABB) => Nullable<number> {
    return this._bboxIntersectionTestEx!;
  }

  get origin(): Vector3 {
    return this._origin;
  }

  get direction(): Vector3 {
    return this._direction;
  }

  set(origin: Vector3, directionNormalized: Vector3) {
    this._origin = this._origin?.assign(origin.getArray()) ?? new Vector3(origin);
    this._direction =
      this._direction?.assign(directionNormalized.getArray()) ?? new Vector3(directionNormalized);
    this.prepare();
  }

  transform(matrix: Matrix4x4, other?: Ray): Ray {
    if (other) {
      matrix.transformPointAffine(this._origin, other._origin);
      matrix.transformVectorAffine(this._direction, other._direction);
      other.prepare();
    } else {
      other = new Ray(
        matrix.transformPointAffine(this._origin),
        matrix.transformVectorAffine(this._direction)
      );
    }
    return other;
  }

  intersectionTestTriangle(v1: Vector3, v2: Vector3, v3: Vector3, cull: boolean): number | null {
    const start = this._origin;
    const normal = this._direction;
    const edge1 = Vector3.sub(v2, v1, tmpV0);
    const edge2 = Vector3.sub(v3, v1, tmpV1);
    const pvec = Vector3.cross(normal, edge2, tmpV2);
    const det = Vector3.dot(edge1, pvec);
    if (!cull) {
      if (det > -0.0001 && det < 0.0001) {
        return null;
      }
      const inv_det = 1.0 / det;
      const tvec = Vector3.sub(start, v1, tmpV3);
      const u = inv_det * Vector3.dot(tvec, pvec);
      if (u < 0 || u > 1) {
        return null;
      }
      const qvec = Vector3.cross(tvec, edge1, tmpV4);
      const v = inv_det * Vector3.dot(normal, qvec);
      if (v < 0 || u + v > 1) {
        return null;
      }
      return Vector3.dot(edge2, qvec) * inv_det;
    } else {
      if (det < 0) {
        return null;
      }
      const tvec = Vector3.sub(start, v1, tmpV3);
      const u = Vector3.dot(tvec, pvec);
      if (u < 0 || u > det) {
        return null;
      }
      const qvec = Vector3.cross(tvec, edge1, tmpV4);
      const v = Vector3.dot(normal, qvec);
      if (v < 0 || u + v > det) {
        return null;
      }
      return Vector3.dot(edge2, qvec) / det;
    }
  }

  /** @internal */
  qtestMMM(bbox: AABB): boolean {
    const x0 = bbox.minPoint.x;
    const y0 = bbox.minPoint.y;
    const z0 = bbox.minPoint.z;
    const x1 = bbox.maxPoint.x;
    const y1 = bbox.maxPoint.y;
    const z1 = bbox.maxPoint.z;
    if (
      this._origin.x < x0 ||
      this._origin.y < y0 ||
      this._origin.z < z0 ||
      this._jbyi * x0 - y1 + this._c_xy > 0 ||
      this._ibyj * y0 - x1 + this._c_yx > 0 ||
      this._jbyk * z0 - y1 + this._c_zy > 0 ||
      this._kbyj * y0 - z1 + this._c_yz > 0 ||
      this._kbyi * x0 - z1 + this._c_xz > 0 ||
      this._ibyk * z0 - x1 + this._c_zx > 0
    ) {
      return false;
    }
    return true;
  }
  /** @internal */
  qtestMMMEx(bbox: AABB): number | null {
    if (!this.qtestMMM(bbox)) {
      return null;
    }
    let t = (bbox.maxPoint.x - this._origin.x) * this._ii;
    const t1 = (bbox.maxPoint.y - this._origin.y) * this._ij;
    if (t1 > t) {
      t = t1;
    }
    const t2 = (bbox.maxPoint.z - this._origin.z) * this._ik;
    if (t2 > t) {
      t = t2;
    }
    return t;
  }
  /** @internal */
  qtestMMP(bbox: AABB): boolean {
    const x0 = bbox.minPoint.x;
    const y0 = bbox.minPoint.y;
    const z0 = bbox.minPoint.z;
    const x1 = bbox.maxPoint.x;
    const y1 = bbox.maxPoint.y;
    const z1 = bbox.maxPoint.z;
    if (
      this._origin.x < x0 ||
      this._origin.y < y0 ||
      this._origin.z > z1 ||
      this._jbyi * x0 - y1 + this._c_xy > 0 ||
      this._ibyj * y0 - x1 + this._c_yx > 0 ||
      this._jbyk * z1 - y1 + this._c_zy > 0 ||
      this._kbyj * y0 - z0 + this._c_yz < 0 ||
      this._kbyi * x0 - z0 + this._c_xz < 0 ||
      this._ibyk * z1 - x1 + this._c_zx > 0
    )
      return false;

    return true;
  }
  /** @internal */
  qtestMMPEx(bbox: AABB): number | null {
    if (!this.qtestMMP(bbox)) {
      return null;
    }
    let t = (bbox.maxPoint.x - this._origin.x) * this._ii;
    const t1 = (bbox.maxPoint.y - this._origin.y) * this._ij;
    if (t1 > t) {
      t = t1;
    }
    const t2 = (bbox.minPoint.z - this._origin.z) * this._ik;
    if (t2 > t) {
      t = t2;
    }
    return t;
  }
  /** @internal */
  qtestMPM(bbox: AABB): boolean {
    const x0 = bbox.minPoint.x;
    const y0 = bbox.minPoint.y;
    const z0 = bbox.minPoint.z;
    const x1 = bbox.maxPoint.x;
    const y1 = bbox.maxPoint.y;
    const z1 = bbox.maxPoint.z;
    if (
      this._origin.x < x0 ||
      this._origin.y > y1 ||
      this._origin.z < z0 ||
      this._jbyi * x0 - y0 + this._c_xy < 0 ||
      this._ibyj * y1 - x1 + this._c_yx > 0 ||
      this._jbyk * z0 - y0 + this._c_zy < 0 ||
      this._kbyj * y1 - z1 + this._c_yz > 0 ||
      this._kbyi * x0 - z1 + this._c_xz > 0 ||
      this._ibyk * z0 - x1 + this._c_zx > 0
    )
      return false;

    return true;
  }
  /** @internal */
  qtestMPMEx(bbox: AABB): number | null {
    if (!this.qtestMPM(bbox)) {
      return null;
    }
    let t = (bbox.maxPoint.x - this._origin.x) * this._ii;
    const t1 = (bbox.minPoint.y - this._origin.y) * this._ij;
    if (t1 > t) {
      t = t1;
    }
    const t2 = (bbox.maxPoint.z - this._origin.z) * this._ik;
    if (t2 > t) {
      t = t2;
    }
    return t;
  }
  /** @internal */
  qtestMPP(bbox: AABB): boolean {
    const x0 = bbox.minPoint.x;
    const y0 = bbox.minPoint.y;
    const z0 = bbox.minPoint.z;
    const x1 = bbox.maxPoint.x;
    const y1 = bbox.maxPoint.y;
    const z1 = bbox.maxPoint.z;
    if (
      this._origin.x < x0 ||
      this._origin.y > y1 ||
      this._origin.z > z1 ||
      this._jbyi * x0 - y0 + this._c_xy < 0 ||
      this._ibyj * y1 - x1 + this._c_yx > 0 ||
      this._jbyk * z1 - y0 + this._c_zy < 0 ||
      this._kbyj * y1 - z0 + this._c_yz < 0 ||
      this._kbyi * x0 - z0 + this._c_xz < 0 ||
      this._ibyk * z1 - x1 + this._c_zx > 0
    )
      return false;

    return true;
  }
  /** @internal */
  qtestMPPEx(bbox: AABB): number | null {
    if (!this.qtestMPP(bbox)) {
      return null;
    }
    let t = (bbox.maxPoint.x - this._origin.x) * this._ii;
    const t1 = (bbox.minPoint.y - this._origin.y) * this._ij;
    if (t1 > t) {
      t = t1;
    }
    const t2 = (bbox.minPoint.z - this._origin.z) * this._ik;
    if (t2 > t) {
      t = t2;
    }
    return t;
  }
  /** @internal */
  qtestPMM(bbox: AABB): boolean {
    const x0 = bbox.minPoint.x;
    const y0 = bbox.minPoint.y;
    const z0 = bbox.minPoint.z;
    const x1 = bbox.maxPoint.x;
    const y1 = bbox.maxPoint.y;
    const z1 = bbox.maxPoint.z;
    if (
      this._origin.x > x1 ||
      this._origin.y < y0 ||
      this._origin.z < z0 ||
      this._jbyi * x1 - y1 + this._c_xy > 0 ||
      this._ibyj * y0 - x0 + this._c_yx < 0 ||
      this._jbyk * z0 - y1 + this._c_zy > 0 ||
      this._kbyj * y0 - z1 + this._c_yz > 0 ||
      this._kbyi * x1 - z1 + this._c_xz > 0 ||
      this._ibyk * z0 - x0 + this._c_zx < 0
    )
      return false;

    return true;
  }
  /** @internal */
  qtestPMMEx(bbox: AABB): number | null {
    if (!this.qtestPMM(bbox)) {
      return null;
    }
    let t = (bbox.minPoint.x - this._origin.x) * this._ii;
    const t1 = (bbox.maxPoint.y - this._origin.y) * this._ij;
    if (t1 > t) {
      t = t1;
    }
    const t2 = (bbox.maxPoint.z - this._origin.z) * this._ik;
    if (t2 > t) {
      t = t2;
    }
    return t;
  }
  /** @internal */
  qtestPMP(bbox: AABB): boolean {
    const x0 = bbox.minPoint.x;
    const y0 = bbox.minPoint.y;
    const z0 = bbox.minPoint.z;
    const x1 = bbox.maxPoint.x;
    const y1 = bbox.maxPoint.y;
    const z1 = bbox.maxPoint.z;
    if (
      this._origin.x > x1 ||
      this._origin.y < y0 ||
      this._origin.z > z1 ||
      this._jbyi * x1 - y1 + this._c_xy > 0 ||
      this._ibyj * y0 - x0 + this._c_yx < 0 ||
      this._jbyk * z1 - y1 + this._c_zy > 0 ||
      this._kbyj * y0 - z0 + this._c_yz < 0 ||
      this._kbyi * x1 - z0 + this._c_xz < 0 ||
      this._ibyk * z1 - x0 + this._c_zx < 0
    )
      return false;

    return true;
  }
  /** @internal */
  qtestPMPEx(bbox: AABB): number | null {
    if (!this.qtestPMP(bbox)) {
      return null;
    }
    let t = (bbox.minPoint.x - this._origin.x) * this._ii;
    const t1 = (bbox.maxPoint.y - this._origin.y) * this._ij;
    if (t1 > t) t = t1;
    const t2 = (bbox.minPoint.z - this._origin.z) * this._ik;
    if (t2 > t) t = t2;
    return t;
  }
  /** @internal */
  qtestPPM(bbox: AABB): boolean {
    const x0 = bbox.minPoint.x;
    const y0 = bbox.minPoint.y;
    const z0 = bbox.minPoint.z;
    const x1 = bbox.maxPoint.x;
    const y1 = bbox.maxPoint.y;
    const z1 = bbox.maxPoint.z;
    if (
      this._origin.x > x1 ||
      this._origin.y > y1 ||
      this._origin.z < z0 ||
      this._jbyi * x1 - y0 + this._c_xy < 0 ||
      this._ibyj * y1 - x0 + this._c_yx < 0 ||
      this._jbyk * z0 - y0 + this._c_zy < 0 ||
      this._kbyj * y1 - z1 + this._c_yz > 0 ||
      this._kbyi * x1 - z1 + this._c_xz > 0 ||
      this._ibyk * z0 - x0 + this._c_zx < 0
    )
      return false;

    return true;
  }
  /** @internal */
  qtestPPMEx(bbox: AABB): number | null {
    if (!this.qtestPPM(bbox)) {
      return null;
    }
    let t = (bbox.minPoint.x - this._origin.x) * this._ii;
    const t1 = (bbox.minPoint.y - this._origin.y) * this._ij;
    if (t1 > t) t = t1;
    const t2 = (bbox.maxPoint.z - this._origin.z) * this._ik;
    if (t2 > t) t = t2;

    return t;
  }
  /** @internal */
  qtestPPP(bbox: AABB): boolean {
    const x0 = bbox.minPoint.x;
    const y0 = bbox.minPoint.y;
    const z0 = bbox.minPoint.z;
    const x1 = bbox.maxPoint.x;
    const y1 = bbox.maxPoint.y;
    const z1 = bbox.maxPoint.z;
    if (
      this._origin.x > x1 ||
      this._origin.y > y1 ||
      this._origin.z > z1 ||
      this._jbyi * x1 - y0 + this._c_xy < 0 ||
      this._ibyj * y1 - x0 + this._c_yx < 0 ||
      this._jbyk * z1 - y0 + this._c_zy < 0 ||
      this._kbyj * y1 - z0 + this._c_yz < 0 ||
      this._kbyi * x1 - z0 + this._c_xz < 0 ||
      this._ibyk * z1 - x0 + this._c_zx < 0
    )
      return false;

    return true;
  }
  /** @internal */
  qtestPPPEx(bbox: AABB): number | null {
    if (!this.qtestPPP(bbox)) {
      return null;
    }
    let t = (bbox.minPoint.x - this._origin.x) * this._ii;
    const t1 = (bbox.minPoint.y - this._origin.y) * this._ij;
    if (t1 > t) t = t1;
    const t2 = (bbox.minPoint.z - this._origin.z) * this._ik;
    if (t2 > t) t = t2;

    return t;
  }
  /** @internal */
  qtestOMM(bbox: AABB): boolean {
    const x0 = bbox.minPoint.x;
    const y0 = bbox.minPoint.y;
    const z0 = bbox.minPoint.z;
    const x1 = bbox.maxPoint.x;
    const y1 = bbox.maxPoint.y;
    const z1 = bbox.maxPoint.z;
    if (
      this._origin.x < x0 ||
      this._origin.x > x1 ||
      this._origin.y < y0 ||
      this._origin.z < z0 ||
      this._jbyk * z0 - y1 + this._c_zy > 0 ||
      this._kbyj * y0 - z1 + this._c_yz > 0
    )
      return false;

    return true;
  }
  /** @internal */
  qtestOMMEx(bbox: AABB): number | null {
    if (!this.qtestOMM(bbox)) {
      return null;
    }

    let t = (bbox.maxPoint.y - this._origin.y) * this._ij;
    const t2 = (bbox.maxPoint.z - this._origin.z) * this._ik;
    if (t2 > t) t = t2;

    return t;
  }
  /** @internal */
  qtestOMP(bbox: AABB): boolean {
    const x0 = bbox.minPoint.x;
    const y0 = bbox.minPoint.y;
    const z0 = bbox.minPoint.z;
    const x1 = bbox.maxPoint.x;
    const y1 = bbox.maxPoint.y;
    const z1 = bbox.maxPoint.z;
    if (
      this._origin.x < x0 ||
      this._origin.x > x1 ||
      this._origin.y < y0 ||
      this._origin.z > z1 ||
      this._jbyk * z1 - y1 + this._c_zy > 0 ||
      this._kbyj * y0 - z0 + this._c_yz < 0
    )
      return false;

    return true;
  }
  /** @internal */
  qtestOMPEx(bbox: AABB): number | null {
    if (!this.qtestOMP(bbox)) {
      return null;
    }

    let t = (bbox.maxPoint.y - this._origin.y) * this._ij;
    const t2 = (bbox.minPoint.z - this._origin.z) * this._ik;
    if (t2 > t) t = t2;

    return t;
  }
  /** @internal */
  qtestOPM(bbox: AABB): boolean {
    const x0 = bbox.minPoint.x;
    const y0 = bbox.minPoint.y;
    const z0 = bbox.minPoint.z;
    const x1 = bbox.maxPoint.x;
    const y1 = bbox.maxPoint.y;
    const z1 = bbox.maxPoint.z;
    if (
      this._origin.x < x0 ||
      this._origin.x > x1 ||
      this._origin.y > y1 ||
      this._origin.z < z0 ||
      this._jbyk * z0 - y0 + this._c_zy < 0 ||
      this._kbyj * y1 - z1 + this._c_yz > 0
    )
      return false;

    return true;
  }
  /** @internal */
  qtestOPMEx(bbox: AABB): number | null {
    if (!this.qtestOPM(bbox)) {
      return null;
    }
    let t = (bbox.minPoint.y - this._origin.y) * this._ij;
    const t2 = (bbox.maxPoint.z - this._origin.z) * this._ik;
    if (t2 > t) t = t2;

    return t;
  }
  /** @internal */
  qtestOPP(bbox: AABB): boolean {
    const x0 = bbox.minPoint.x;
    const y0 = bbox.minPoint.y;
    const z0 = bbox.minPoint.z;
    const x1 = bbox.maxPoint.x;
    const y1 = bbox.maxPoint.y;
    const z1 = bbox.maxPoint.z;
    if (
      this._origin.x < x0 ||
      this._origin.x > x1 ||
      this._origin.y > y1 ||
      this._origin.z > z1 ||
      this._jbyk * z1 - y0 + this._c_zy < 0 ||
      this._kbyj * y1 - z0 + this._c_yz < 0
    )
      return false;

    return true;
  }
  /** @internal */
  qtestOPPEx(bbox: AABB): number | null {
    if (!this.qtestOPP(bbox)) {
      return null;
    }

    let t = (bbox.minPoint.y - this._origin.y) * this._ij;
    const t2 = (bbox.minPoint.z - this._origin.z) * this._ik;
    if (t2 > t) t = t2;

    return t;
  }
  /** @internal */
  qtestMOM(bbox: AABB): boolean {
    const x0 = bbox.minPoint.x;
    const y0 = bbox.minPoint.y;
    const z0 = bbox.minPoint.z;
    const x1 = bbox.maxPoint.x;
    const y1 = bbox.maxPoint.y;
    const z1 = bbox.maxPoint.z;
    if (
      this._origin.y < y0 ||
      this._origin.y > y1 ||
      this._origin.x < x0 ||
      this._origin.z < z0 ||
      this._kbyi * x0 - z1 + this._c_xz > 0 ||
      this._ibyk * z0 - x1 + this._c_zx > 0
    )
      return false;

    return true;
  }
  /** @internal */
  qtestMOMEx(bbox: AABB): number | null {
    if (!this.qtestMOM(bbox)) {
      return null;
    }
    let t = (bbox.maxPoint.x - this._origin.x) * this._ii;
    const t2 = (bbox.maxPoint.z - this._origin.z) * this._ik;
    if (t2 > t) t = t2;

    return t;
  }
  /** @internal */
  qtestMOP(bbox: AABB): boolean {
    const x0 = bbox.minPoint.x;
    const y0 = bbox.minPoint.y;
    const z0 = bbox.minPoint.z;
    const x1 = bbox.maxPoint.x;
    const y1 = bbox.maxPoint.y;
    const z1 = bbox.maxPoint.z;
    if (
      this._origin.y < y0 ||
      this._origin.y > y1 ||
      this._origin.x < x0 ||
      this._origin.z > z1 ||
      this._kbyi * x0 - z0 + this._c_xz < 0 ||
      this._ibyk * z1 - x1 + this._c_zx > 0
    )
      return false;

    return true;
  }
  /** @internal */
  qtestMOPEx(bbox: AABB): number | null {
    if (!this.qtestMOP(bbox)) {
      return null;
    }
    let t = (bbox.maxPoint.x - this._origin.x) * this._ii;
    const t2 = (bbox.minPoint.z - this._origin.z) * this._ik;
    if (t2 > t) t = t2;

    return t;
  }
  /** @internal */
  qtestPOM(bbox: AABB): boolean {
    const x0 = bbox.minPoint.x;
    const y0 = bbox.minPoint.y;
    const z0 = bbox.minPoint.z;
    const x1 = bbox.maxPoint.x;
    const y1 = bbox.maxPoint.y;
    const z1 = bbox.maxPoint.z;
    if (
      this._origin.y < y0 ||
      this._origin.y > y1 ||
      this._origin.x > x1 ||
      this._origin.z < z0 ||
      this._kbyi * x1 - z1 + this._c_xz > 0 ||
      this._ibyk * z0 - x0 + this._c_zx < 0
    )
      return false;

    return true;
  }
  /** @internal */
  qtestPOMEx(bbox: AABB): number | null {
    if (!this.qtestPOM(bbox)) {
      return null;
    }
    let t = (bbox.minPoint.x - this._origin.x) * this._ii;
    const t2 = (bbox.maxPoint.z - this._origin.z) * this._ik;
    if (t2 > t) t = t2;

    return t;
  }
  /** @internal */
  qtestPOP(bbox: AABB): boolean {
    const x0 = bbox.minPoint.x;
    const y0 = bbox.minPoint.y;
    const z0 = bbox.minPoint.z;
    const x1 = bbox.maxPoint.x;
    const y1 = bbox.maxPoint.y;
    const z1 = bbox.maxPoint.z;
    if (
      this._origin.y < y0 ||
      this._origin.y > y1 ||
      this._origin.x > x1 ||
      this._origin.z > z1 ||
      this._kbyi * x1 - z0 + this._c_xz < 0 ||
      this._ibyk * z1 - x0 + this._c_zx < 0
    )
      return false;

    return true;
  }
  /** @internal */
  qtestPOPEx(bbox: AABB): number | null {
    if (!this.qtestPOP(bbox)) {
      return null;
    }
    let t = (bbox.minPoint.x - this._origin.x) * this._ii;
    const t2 = (bbox.minPoint.z - this._origin.z) * this._ik;
    if (t2 > t) t = t2;

    return t;
  }
  /** @internal */
  qtestMMO(bbox: AABB): boolean {
    const x0 = bbox.minPoint.x;
    const y0 = bbox.minPoint.y;
    const z0 = bbox.minPoint.z;
    const x1 = bbox.maxPoint.x;
    const y1 = bbox.maxPoint.y;
    const z1 = bbox.maxPoint.z;
    if (
      this._origin.z < z0 ||
      this._origin.z > z1 ||
      this._origin.x < x0 ||
      this._origin.y < y0 ||
      this._jbyi * x0 - y1 + this._c_xy > 0 ||
      this._ibyj * y0 - x1 + this._c_yx > 0
    )
      return false;

    return true;
  }
  /** @internal */
  qtestMMOEx(bbox: AABB): number | null {
    if (!this.qtestMMO(bbox)) {
      return null;
    }
    let t = (bbox.maxPoint.x - this._origin.x) * this._ii;
    const t2 = (bbox.maxPoint.y - this._origin.y) * this._ij;
    if (t2 > t) t = t2;

    return t;
  }
  /** @internal */
  qtestMPO(bbox: AABB): boolean {
    const x0 = bbox.minPoint.x;
    const y0 = bbox.minPoint.y;
    const z0 = bbox.minPoint.z;
    const x1 = bbox.maxPoint.x;
    const y1 = bbox.maxPoint.y;
    const z1 = bbox.maxPoint.z;
    if (
      this._origin.z < z0 ||
      this._origin.z > z1 ||
      this._origin.x < x0 ||
      this._origin.y > y1 ||
      this._jbyi * x0 - y0 + this._c_xy < 0 ||
      this._ibyj * y1 - x1 + this._c_yx > 0
    )
      return false;

    return true;
  }
  /** @internal */
  qtestMPOEx(bbox: AABB): number | null {
    if (!this.qtestMPO(bbox)) {
      return null;
    }

    let t = (bbox.maxPoint.x - this._origin.x) * this._ii;
    const t2 = (bbox.minPoint.y - this._origin.y) * this._ij;
    if (t2 > t) t = t2;

    return t;
  }
  /** @internal */
  qtestPMO(bbox: AABB): boolean {
    const x0 = bbox.minPoint.x;
    const y0 = bbox.minPoint.y;
    const z0 = bbox.minPoint.z;
    const x1 = bbox.maxPoint.x;
    const y1 = bbox.maxPoint.y;
    const z1 = bbox.maxPoint.z;
    if (
      this._origin.z < z0 ||
      this._origin.z > z1 ||
      this._origin.x > x1 ||
      this._origin.y < y0 ||
      this._jbyi * x1 - y1 + this._c_xy > 0 ||
      this._ibyj * y0 - x0 + this._c_yx < 0
    )
      return false;
    return true;
  }
  /** @internal */
  qtestPMOEx(bbox: AABB): number | null {
    if (!this.qtestPMO(bbox)) {
      return null;
    }
    let t = (bbox.minPoint.x - this._origin.x) * this._ii;
    const t2 = (bbox.maxPoint.y - this._origin.y) * this._ij;
    if (t2 > t) t = t2;

    return t;
  }
  /** @internal */
  qtestPPO(bbox: AABB): boolean {
    const x0 = bbox.minPoint.x;
    const y0 = bbox.minPoint.y;
    const z0 = bbox.minPoint.z;
    const x1 = bbox.maxPoint.x;
    const y1 = bbox.maxPoint.y;
    const z1 = bbox.maxPoint.z;
    if (
      this._origin.z < z0 ||
      this._origin.z > z1 ||
      this._origin.x > x1 ||
      this._origin.y > y1 ||
      this._jbyi * x1 - y0 + this._c_xy < 0 ||
      this._ibyj * y1 - x0 + this._c_yx < 0
    )
      return false;

    return true;
  }
  /** @internal */
  qtestPPOEx(bbox: AABB): number | null {
    if (!this.qtestPPO(bbox)) {
      return null;
    }
    let t = (bbox.minPoint.x - this._origin.x) * this._ii;
    const t2 = (bbox.minPoint.y - this._origin.y) * this._ij;
    if (t2 > t) t = t2;

    return t;
  }
  /** @internal */
  qtestMOO(bbox: AABB): boolean {
    const x0 = bbox.minPoint.x;
    const y0 = bbox.minPoint.y;
    const z0 = bbox.minPoint.z;
    const y1 = bbox.maxPoint.y;
    const z1 = bbox.maxPoint.z;

    if (
      this._origin.x < x0 ||
      this._origin.y < y0 ||
      this._origin.y > y1 ||
      this._origin.z < z0 ||
      this._origin.z > z1
    )
      return false;

    return true;
  }
  /** @internal */
  qtestMOOEx(bbox: AABB): number | null {
    if (!this.qtestMOO(bbox)) {
      return null;
    }
    const t = (bbox.maxPoint.x - this._origin.x) * this._ii;

    return t;
  }
  /** @internal */
  qtestPOO(bbox: AABB): boolean {
    const y0 = bbox.minPoint.y;
    const z0 = bbox.minPoint.z;
    const x1 = bbox.maxPoint.x;
    const y1 = bbox.maxPoint.y;
    const z1 = bbox.maxPoint.z;

    if (
      this._origin.x > x1 ||
      this._origin.y < y0 ||
      this._origin.y > y1 ||
      this._origin.z < z0 ||
      this._origin.z > z1
    )
      return false;

    return true;
  }
  /** @internal */
  qtestPOOEx(bbox: AABB): number | null {
    if (!this.qtestPOO(bbox)) {
      return null;
    }

    const t = (bbox.minPoint.x - this._origin.x) * this._ii;

    return t;
  }
  /** @internal */
  qtestOMO(bbox: AABB): boolean {
    const x0 = bbox.minPoint.x;
    const y0 = bbox.minPoint.y;
    const z0 = bbox.minPoint.z;
    const x1 = bbox.maxPoint.x;
    const z1 = bbox.maxPoint.z;

    if (
      this._origin.y < y0 ||
      this._origin.x < x0 ||
      this._origin.x > x1 ||
      this._origin.z < z0 ||
      this._origin.z > z1
    )
      return false;

    return true;
  }
  /** @internal */
  qtestOMOEx(bbox: AABB): number | null {
    if (!this.qtestOMO(bbox)) {
      return null;
    }

    const t = (bbox.maxPoint.y - this._origin.y) * this._ij;

    return t;
  }
  /** @internal */
  qtestOPO(bbox: AABB): boolean {
    const x0 = bbox.minPoint.x;
    const z0 = bbox.minPoint.z;
    const x1 = bbox.maxPoint.x;
    const y1 = bbox.maxPoint.y;
    const z1 = bbox.maxPoint.z;

    if (
      this._origin.y > y1 ||
      this._origin.x < x0 ||
      this._origin.x > x1 ||
      this._origin.z < z0 ||
      this._origin.z > z1
    )
      return false;

    return true;
  }
  /** @internal */
  qtestOPOEx(bbox: AABB): number | null {
    if (!this.qtestOPO(bbox)) {
      return null;
    }

    const t = (bbox.minPoint.y - this._origin.y) * this._ij;

    return t;
  }
  /** @internal */
  qtestOOM(bbox: AABB): boolean {
    const x0 = bbox.minPoint.x;
    const y0 = bbox.minPoint.y;
    const z0 = bbox.minPoint.z;
    const x1 = bbox.maxPoint.x;
    const y1 = bbox.maxPoint.y;

    if (
      this._origin.z < z0 ||
      this._origin.x < x0 ||
      this._origin.x > x1 ||
      this._origin.y < y0 ||
      this._origin.y > y1
    )
      return false;

    return true;
  }
  /** @internal */
  qtestOOMEx(bbox: AABB): number | null {
    if (!this.qtestOOM(bbox)) {
      return null;
    }

    const t = (bbox.maxPoint.z - this._origin.z) * this._ik;

    return t;
  }
  /** @internal */
  qtestOOP(bbox: AABB): boolean {
    const x0 = bbox.minPoint.x;
    const y0 = bbox.minPoint.y;
    const x1 = bbox.maxPoint.x;
    const y1 = bbox.maxPoint.y;
    const z1 = bbox.maxPoint.z;

    if (
      this._origin.z > z1 ||
      this._origin.x < x0 ||
      this._origin.x > x1 ||
      this._origin.y < y0 ||
      this._origin.y > y1
    )
      return false;

    return true;
  }
  /** @internal */
  qtestOOPEx(bbox: AABB): number | null {
    if (!this.qtestOOP(bbox)) {
      return null;
    }

    const t = (bbox.minPoint.z - this._origin.z) * this._ik;

    return t;
  }
  /** @internal */
  prepare() {
    const x = this._origin.x;
    const y = this._origin.y;
    const z = this._origin.z;
    const i = this._direction.x;
    const j = this._direction.y;
    const k = this._direction.z;
    this._ii = 1.0 / i;
    this._ij = 1.0 / j;
    this._ik = 1.0 / k;
    this._ibyj = i * this._ij;
    this._jbyi = j * this._ii;
    this._jbyk = j * this._ik;
    this._kbyj = k * this._ij;
    this._ibyk = i * this._ik;
    this._kbyi = k * this._ii;
    this._c_xy = y - this._jbyi * x;
    this._c_xz = z - this._kbyi * x;
    this._c_yx = x - this._ibyj * y;
    this._c_yz = z - this._kbyj * y;
    this._c_zx = x - this._ibyk * z;
    this._c_zy = y - this._jbyk * z;
    if (i < 0) {
      if (j < 0) {
        if (k < 0) {
          this._bboxIntersectionTest = this.qtestMMM;
          this._bboxIntersectionTestEx = this.qtestMMMEx;
        } else if (k > 0) {
          this._bboxIntersectionTest = this.qtestMMP;
          this._bboxIntersectionTestEx = this.qtestMMPEx;
        } else {
          this._bboxIntersectionTest = this.qtestMMO;
          this._bboxIntersectionTestEx = this.qtestMMOEx;
        }
      } else {
        if (k < 0) {
          this._bboxIntersectionTest = j > 0 ? this.qtestMPM : this.qtestMOM;
          this._bboxIntersectionTestEx = j > 0 ? this.qtestMPMEx : this.qtestMOMEx;
        } else {
          if (j === 0 && k === 0) {
            this._bboxIntersectionTest = this.qtestMOO;
            this._bboxIntersectionTestEx = this.qtestMOOEx;
          } else if (k === 0) {
            this._bboxIntersectionTest = this.qtestMPO;
            this._bboxIntersectionTestEx = this.qtestMPOEx;
          } else if (j === 0) {
            this._bboxIntersectionTest = this.qtestMOP;
            this._bboxIntersectionTestEx = this.qtestMOPEx;
          } else {
            this._bboxIntersectionTest = this.qtestMPP;
            this._bboxIntersectionTestEx = this.qtestMPPEx;
          }
        }
      }
    } else {
      if (j < 0) {
        if (k < 0) {
          this._bboxIntersectionTest = i > 0 ? this.qtestPMM : this.qtestOMM;
          this._bboxIntersectionTestEx = i > 0 ? this.qtestPMMEx : this.qtestOMMEx;
        } else {
          if (i === 0 && k === 0) {
            this._bboxIntersectionTest = this.qtestOMO;
            this._bboxIntersectionTestEx = this.qtestOMOEx;
          } else if (k === 0) {
            this._bboxIntersectionTest = this.qtestPMO;
            this._bboxIntersectionTestEx = this.qtestPMOEx;
          } else if (i === 0) {
            this._bboxIntersectionTest = this.qtestOMP;
            this._bboxIntersectionTestEx = this.qtestOMPEx;
          } else {
            this._bboxIntersectionTest = this.qtestPMP;
            this._bboxIntersectionTestEx = this.qtestPMPEx;
          }
        }
      } else {
        if (k < 0) {
          if (i === 0 && j === 0) {
            this._bboxIntersectionTest = this.qtestOOM;
            this._bboxIntersectionTestEx = this.qtestOOMEx;
          } else if (i === 0) {
            this._bboxIntersectionTest = this.qtestOPM;
            this._bboxIntersectionTestEx = this.qtestOPMEx;
          } else if (j === 0) {
            this._bboxIntersectionTest = this.qtestPOM;
            this._bboxIntersectionTestEx = this.qtestPOMEx;
          } else {
            this._bboxIntersectionTest = this.qtestPPM;
            this._bboxIntersectionTestEx = this.qtestPPMEx;
          }
        } else {
          if (i === 0) {
            if (j === 0) {
              this._bboxIntersectionTest = this.qtestOOP;
              this._bboxIntersectionTestEx = this.qtestOOPEx;
            } else if (k === 0) {
              this._bboxIntersectionTest = this.qtestOPO;
              this._bboxIntersectionTestEx = this.qtestOPOEx;
            } else {
              this._bboxIntersectionTest = this.qtestOPP;
              this._bboxIntersectionTestEx = this.qtestOPPEx;
            }
          } else {
            if (j === 0 && k === 0) {
              this._bboxIntersectionTest = this.qtestPOO;
              this._bboxIntersectionTestEx = this.qtestPOOEx;
            } else if (j === 0) {
              this._bboxIntersectionTest = this.qtestPOP;
              this._bboxIntersectionTestEx = this.qtestPOPEx;
            } else if (k === 0) {
              this._bboxIntersectionTest = this.qtestPPO;
              this._bboxIntersectionTestEx = this.qtestPPOEx;
            } else {
              this._bboxIntersectionTest = this.qtestPPP;
              this._bboxIntersectionTestEx = this.qtestPPPEx;
            }
          }
        }
      }
    }
  }
}
