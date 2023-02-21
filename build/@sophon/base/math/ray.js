/** sophon base library */
import { Vector3 } from './vector.js';

const tmpV0 = new Vector3();
const tmpV1 = new Vector3();
const tmpV2 = new Vector3();
const tmpV3 = new Vector3();
const tmpV4 = new Vector3();
class Ray {
    _origin;
    _direction;
    _ii;
    _ij;
    _ik;
    _ibyj;
    _jbyi;
    _kbyj;
    _jbyk;
    _ibyk;
    _kbyi;
    _c_xy;
    _c_xz;
    _c_yx;
    _c_yz;
    _c_zx;
    _c_zy;
    bboxIntersectionTest;
    bboxIntersectionTestEx;
    constructor(origin, directionNormalized) {
        this._origin = origin ? new Vector3(origin) : Vector3.zero();
        this._direction = directionNormalized ? new Vector3(directionNormalized) : Vector3.axisPZ();
        this.prepare();
    }
    get origin() {
        return this._origin;
    }
    get direction() {
        return this._direction;
    }
    set(origin, directionNormalized) {
        this._origin = this._origin?.assign(origin.getArray()) ?? new Vector3(origin);
        this._direction = this._direction?.assign(directionNormalized.getArray()) ?? new Vector3(directionNormalized);
        this.prepare();
    }
    transform(matrix, other) {
        if (other) {
            matrix.transformPointAffine(this._origin, other._origin);
            matrix.transformVectorAffine(this._direction, other._direction);
            other.prepare();
        }
        else {
            other = new Ray(matrix.transformPointAffine(this._origin), matrix.transformVectorAffine(this._direction));
        }
        return other;
    }
    intersectionTestTriangle(v1, v2, v3, cull) {
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
        }
        else {
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
    qtestMMM(bbox) {
        const x0 = bbox.minPoint.x;
        const y0 = bbox.minPoint.y;
        const z0 = bbox.minPoint.z;
        const x1 = bbox.maxPoint.x;
        const y1 = bbox.maxPoint.y;
        const z1 = bbox.maxPoint.z;
        if (this._origin.x < x0 ||
            this._origin.y < y0 ||
            this._origin.z < z0 ||
            this._jbyi * x0 - y1 + this._c_xy > 0 ||
            this._ibyj * y0 - x1 + this._c_yx > 0 ||
            this._jbyk * z0 - y1 + this._c_zy > 0 ||
            this._kbyj * y0 - z1 + this._c_yz > 0 ||
            this._kbyi * x0 - z1 + this._c_xz > 0 ||
            this._ibyk * z0 - x1 + this._c_zx > 0) {
            return false;
        }
        return true;
    }
    qtestMMMEx(bbox) {
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
    qtestMMP(bbox) {
        const x0 = bbox.minPoint.x;
        const y0 = bbox.minPoint.y;
        const z0 = bbox.minPoint.z;
        const x1 = bbox.maxPoint.x;
        const y1 = bbox.maxPoint.y;
        const z1 = bbox.maxPoint.z;
        if (this._origin.x < x0 ||
            this._origin.y < y0 ||
            this._origin.z > z1 ||
            this._jbyi * x0 - y1 + this._c_xy > 0 ||
            this._ibyj * y0 - x1 + this._c_yx > 0 ||
            this._jbyk * z1 - y1 + this._c_zy > 0 ||
            this._kbyj * y0 - z0 + this._c_yz < 0 ||
            this._kbyi * x0 - z0 + this._c_xz < 0 ||
            this._ibyk * z1 - x1 + this._c_zx > 0)
            return false;
        return true;
    }
    qtestMMPEx(bbox) {
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
    qtestMPM(bbox) {
        const x0 = bbox.minPoint.x;
        const y0 = bbox.minPoint.y;
        const z0 = bbox.minPoint.z;
        const x1 = bbox.maxPoint.x;
        const y1 = bbox.maxPoint.y;
        const z1 = bbox.maxPoint.z;
        if (this._origin.x < x0 ||
            this._origin.y > y1 ||
            this._origin.z < z0 ||
            this._jbyi * x0 - y0 + this._c_xy < 0 ||
            this._ibyj * y1 - x1 + this._c_yx > 0 ||
            this._jbyk * z0 - y0 + this._c_zy < 0 ||
            this._kbyj * y1 - z1 + this._c_yz > 0 ||
            this._kbyi * x0 - z1 + this._c_xz > 0 ||
            this._ibyk * z0 - x1 + this._c_zx > 0)
            return false;
        return true;
    }
    qtestMPMEx(bbox) {
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
    qtestMPP(bbox) {
        const x0 = bbox.minPoint.x;
        const y0 = bbox.minPoint.y;
        const z0 = bbox.minPoint.z;
        const x1 = bbox.maxPoint.x;
        const y1 = bbox.maxPoint.y;
        const z1 = bbox.maxPoint.z;
        if (this._origin.x < x0 ||
            this._origin.y > y1 ||
            this._origin.z > z1 ||
            this._jbyi * x0 - y0 + this._c_xy < 0 ||
            this._ibyj * y1 - x1 + this._c_yx > 0 ||
            this._jbyk * z1 - y0 + this._c_zy < 0 ||
            this._kbyj * y1 - z0 + this._c_yz < 0 ||
            this._kbyi * x0 - z0 + this._c_xz < 0 ||
            this._ibyk * z1 - x1 + this._c_zx > 0)
            return false;
        return true;
    }
    qtestMPPEx(bbox) {
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
    qtestPMM(bbox) {
        const x0 = bbox.minPoint.x;
        const y0 = bbox.minPoint.y;
        const z0 = bbox.minPoint.z;
        const x1 = bbox.maxPoint.x;
        const y1 = bbox.maxPoint.y;
        const z1 = bbox.maxPoint.z;
        if (this._origin.x > x1 ||
            this._origin.y < y0 ||
            this._origin.z < z0 ||
            this._jbyi * x1 - y1 + this._c_xy > 0 ||
            this._ibyj * y0 - x0 + this._c_yx < 0 ||
            this._jbyk * z0 - y1 + this._c_zy > 0 ||
            this._kbyj * y0 - z1 + this._c_yz > 0 ||
            this._kbyi * x1 - z1 + this._c_xz > 0 ||
            this._ibyk * z0 - x0 + this._c_zx < 0)
            return false;
        return true;
    }
    qtestPMMEx(bbox) {
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
    qtestPMP(bbox) {
        const x0 = bbox.minPoint.x;
        const y0 = bbox.minPoint.y;
        const z0 = bbox.minPoint.z;
        const x1 = bbox.maxPoint.x;
        const y1 = bbox.maxPoint.y;
        const z1 = bbox.maxPoint.z;
        if (this._origin.x > x1 ||
            this._origin.y < y0 ||
            this._origin.z > z1 ||
            this._jbyi * x1 - y1 + this._c_xy > 0 ||
            this._ibyj * y0 - x0 + this._c_yx < 0 ||
            this._jbyk * z1 - y1 + this._c_zy > 0 ||
            this._kbyj * y0 - z0 + this._c_yz < 0 ||
            this._kbyi * x1 - z0 + this._c_xz < 0 ||
            this._ibyk * z1 - x0 + this._c_zx < 0)
            return false;
        return true;
    }
    qtestPMPEx(bbox) {
        if (!this.qtestPMP(bbox)) {
            return null;
        }
        let t = (bbox.minPoint.x - this._origin.x) * this._ii;
        const t1 = (bbox.maxPoint.y - this._origin.y) * this._ij;
        if (t1 > t)
            t = t1;
        const t2 = (bbox.minPoint.z - this._origin.z) * this._ik;
        if (t2 > t)
            t = t2;
        return t;
    }
    qtestPPM(bbox) {
        const x0 = bbox.minPoint.x;
        const y0 = bbox.minPoint.y;
        const z0 = bbox.minPoint.z;
        const x1 = bbox.maxPoint.x;
        const y1 = bbox.maxPoint.y;
        const z1 = bbox.maxPoint.z;
        if (this._origin.x > x1 ||
            this._origin.y > y1 ||
            this._origin.z < z0 ||
            this._jbyi * x1 - y0 + this._c_xy < 0 ||
            this._ibyj * y1 - x0 + this._c_yx < 0 ||
            this._jbyk * z0 - y0 + this._c_zy < 0 ||
            this._kbyj * y1 - z1 + this._c_yz > 0 ||
            this._kbyi * x1 - z1 + this._c_xz > 0 ||
            this._ibyk * z0 - x0 + this._c_zx < 0)
            return false;
        return true;
    }
    qtestPPMEx(bbox) {
        if (!this.qtestPPM(bbox)) {
            return null;
        }
        let t = (bbox.minPoint.x - this._origin.x) * this._ii;
        const t1 = (bbox.minPoint.y - this._origin.y) * this._ij;
        if (t1 > t)
            t = t1;
        const t2 = (bbox.maxPoint.z - this._origin.z) * this._ik;
        if (t2 > t)
            t = t2;
        return t;
    }
    qtestPPP(bbox) {
        const x0 = bbox.minPoint.x;
        const y0 = bbox.minPoint.y;
        const z0 = bbox.minPoint.z;
        const x1 = bbox.maxPoint.x;
        const y1 = bbox.maxPoint.y;
        const z1 = bbox.maxPoint.z;
        if (this._origin.x > x1 ||
            this._origin.y > y1 ||
            this._origin.z > z1 ||
            this._jbyi * x1 - y0 + this._c_xy < 0 ||
            this._ibyj * y1 - x0 + this._c_yx < 0 ||
            this._jbyk * z1 - y0 + this._c_zy < 0 ||
            this._kbyj * y1 - z0 + this._c_yz < 0 ||
            this._kbyi * x1 - z0 + this._c_xz < 0 ||
            this._ibyk * z1 - x0 + this._c_zx < 0)
            return false;
        return true;
    }
    qtestPPPEx(bbox) {
        if (!this.qtestPPP(bbox)) {
            return null;
        }
        let t = (bbox.minPoint.x - this._origin.x) * this._ii;
        const t1 = (bbox.minPoint.y - this._origin.y) * this._ij;
        if (t1 > t)
            t = t1;
        const t2 = (bbox.minPoint.z - this._origin.z) * this._ik;
        if (t2 > t)
            t = t2;
        return t;
    }
    qtestOMM(bbox) {
        const x0 = bbox.minPoint.x;
        const y0 = bbox.minPoint.y;
        const z0 = bbox.minPoint.z;
        const x1 = bbox.maxPoint.x;
        const y1 = bbox.maxPoint.y;
        const z1 = bbox.maxPoint.z;
        if (this._origin.x < x0 ||
            this._origin.x > x1 ||
            this._origin.y < y0 ||
            this._origin.z < z0 ||
            this._jbyk * z0 - y1 + this._c_zy > 0 ||
            this._kbyj * y0 - z1 + this._c_yz > 0)
            return false;
        return true;
    }
    qtestOMMEx(bbox) {
        if (!this.qtestOMM(bbox)) {
            return null;
        }
        let t = (bbox.maxPoint.y - this._origin.y) * this._ij;
        const t2 = (bbox.maxPoint.z - this._origin.z) * this._ik;
        if (t2 > t)
            t = t2;
        return t;
    }
    qtestOMP(bbox) {
        const x0 = bbox.minPoint.x;
        const y0 = bbox.minPoint.y;
        const z0 = bbox.minPoint.z;
        const x1 = bbox.maxPoint.x;
        const y1 = bbox.maxPoint.y;
        const z1 = bbox.maxPoint.z;
        if (this._origin.x < x0 ||
            this._origin.x > x1 ||
            this._origin.y < y0 ||
            this._origin.z > z1 ||
            this._jbyk * z1 - y1 + this._c_zy > 0 ||
            this._kbyj * y0 - z0 + this._c_yz < 0)
            return false;
        return true;
    }
    qtestOMPEx(bbox) {
        if (!this.qtestOMP(bbox)) {
            return null;
        }
        let t = (bbox.maxPoint.y - this._origin.y) * this._ij;
        const t2 = (bbox.minPoint.z - this._origin.z) * this._ik;
        if (t2 > t)
            t = t2;
        return t;
    }
    qtestOPM(bbox) {
        const x0 = bbox.minPoint.x;
        const y0 = bbox.minPoint.y;
        const z0 = bbox.minPoint.z;
        const x1 = bbox.maxPoint.x;
        const y1 = bbox.maxPoint.y;
        const z1 = bbox.maxPoint.z;
        if (this._origin.x < x0 ||
            this._origin.x > x1 ||
            this._origin.y > y1 ||
            this._origin.z < z0 ||
            this._jbyk * z0 - y0 + this._c_zy < 0 ||
            this._kbyj * y1 - z1 + this._c_yz > 0)
            return false;
        return true;
    }
    qtestOPMEx(bbox) {
        if (!this.qtestOPM(bbox)) {
            return null;
        }
        let t = (bbox.minPoint.y - this._origin.y) * this._ij;
        const t2 = (bbox.maxPoint.z - this._origin.z) * this._ik;
        if (t2 > t)
            t = t2;
        return t;
    }
    qtestOPP(bbox) {
        const x0 = bbox.minPoint.x;
        const y0 = bbox.minPoint.y;
        const z0 = bbox.minPoint.z;
        const x1 = bbox.maxPoint.x;
        const y1 = bbox.maxPoint.y;
        const z1 = bbox.maxPoint.z;
        if (this._origin.x < x0 ||
            this._origin.x > x1 ||
            this._origin.y > y1 ||
            this._origin.z > z1 ||
            this._jbyk * z1 - y0 + this._c_zy < 0 ||
            this._kbyj * y1 - z0 + this._c_yz < 0)
            return false;
        return true;
    }
    qtestOPPEx(bbox) {
        if (!this.qtestOPP(bbox)) {
            return null;
        }
        let t = (bbox.minPoint.y - this._origin.y) * this._ij;
        const t2 = (bbox.minPoint.z - this._origin.z) * this._ik;
        if (t2 > t)
            t = t2;
        return t;
    }
    qtestMOM(bbox) {
        const x0 = bbox.minPoint.x;
        const y0 = bbox.minPoint.y;
        const z0 = bbox.minPoint.z;
        const x1 = bbox.maxPoint.x;
        const y1 = bbox.maxPoint.y;
        const z1 = bbox.maxPoint.z;
        if (this._origin.y < y0 ||
            this._origin.y > y1 ||
            this._origin.x < x0 ||
            this._origin.z < z0 ||
            this._kbyi * x0 - z1 + this._c_xz > 0 ||
            this._ibyk * z0 - x1 + this._c_zx > 0)
            return false;
        return true;
    }
    qtestMOMEx(bbox) {
        if (!this.qtestMOM(bbox)) {
            return null;
        }
        let t = (bbox.maxPoint.x - this._origin.x) * this._ii;
        const t2 = (bbox.maxPoint.z - this._origin.z) * this._ik;
        if (t2 > t)
            t = t2;
        return t;
    }
    qtestMOP(bbox) {
        const x0 = bbox.minPoint.x;
        const y0 = bbox.minPoint.y;
        const z0 = bbox.minPoint.z;
        const x1 = bbox.maxPoint.x;
        const y1 = bbox.maxPoint.y;
        const z1 = bbox.maxPoint.z;
        if (this._origin.y < y0 ||
            this._origin.y > y1 ||
            this._origin.x < x0 ||
            this._origin.z > z1 ||
            this._kbyi * x0 - z0 + this._c_xz < 0 ||
            this._ibyk * z1 - x1 + this._c_zx > 0)
            return false;
        return true;
    }
    qtestMOPEx(bbox) {
        if (!this.qtestMOP(bbox)) {
            return null;
        }
        let t = (bbox.maxPoint.x - this._origin.x) * this._ii;
        const t2 = (bbox.minPoint.z - this._origin.z) * this._ik;
        if (t2 > t)
            t = t2;
        return t;
    }
    qtestPOM(bbox) {
        const x0 = bbox.minPoint.x;
        const y0 = bbox.minPoint.y;
        const z0 = bbox.minPoint.z;
        const x1 = bbox.maxPoint.x;
        const y1 = bbox.maxPoint.y;
        const z1 = bbox.maxPoint.z;
        if (this._origin.y < y0 ||
            this._origin.y > y1 ||
            this._origin.x > x1 ||
            this._origin.z < z0 ||
            this._kbyi * x1 - z1 + this._c_xz > 0 ||
            this._ibyk * z0 - x0 + this._c_zx < 0)
            return false;
        return true;
    }
    qtestPOMEx(bbox) {
        if (!this.qtestPOM(bbox)) {
            return null;
        }
        let t = (bbox.minPoint.x - this._origin.x) * this._ii;
        const t2 = (bbox.maxPoint.z - this._origin.z) * this._ik;
        if (t2 > t)
            t = t2;
        return t;
    }
    qtestPOP(bbox) {
        const x0 = bbox.minPoint.x;
        const y0 = bbox.minPoint.y;
        const z0 = bbox.minPoint.z;
        const x1 = bbox.maxPoint.x;
        const y1 = bbox.maxPoint.y;
        const z1 = bbox.maxPoint.z;
        if (this._origin.y < y0 ||
            this._origin.y > y1 ||
            this._origin.x > x1 ||
            this._origin.z > z1 ||
            this._kbyi * x1 - z0 + this._c_xz < 0 ||
            this._ibyk * z1 - x0 + this._c_zx < 0)
            return false;
        return true;
    }
    qtestPOPEx(bbox) {
        if (!this.qtestPOP(bbox)) {
            return null;
        }
        let t = (bbox.minPoint.x - this._origin.x) * this._ii;
        const t2 = (bbox.minPoint.z - this._origin.z) * this._ik;
        if (t2 > t)
            t = t2;
        return t;
    }
    qtestMMO(bbox) {
        const x0 = bbox.minPoint.x;
        const y0 = bbox.minPoint.y;
        const z0 = bbox.minPoint.z;
        const x1 = bbox.maxPoint.x;
        const y1 = bbox.maxPoint.y;
        const z1 = bbox.maxPoint.z;
        if (this._origin.z < z0 ||
            this._origin.z > z1 ||
            this._origin.x < x0 ||
            this._origin.y < y0 ||
            this._jbyi * x0 - y1 + this._c_xy > 0 ||
            this._ibyj * y0 - x1 + this._c_yx > 0)
            return false;
        return true;
    }
    qtestMMOEx(bbox) {
        if (!this.qtestMMO(bbox)) {
            return null;
        }
        let t = (bbox.maxPoint.x - this._origin.x) * this._ii;
        const t2 = (bbox.maxPoint.y - this._origin.y) * this._ij;
        if (t2 > t)
            t = t2;
        return t;
    }
    qtestMPO(bbox) {
        const x0 = bbox.minPoint.x;
        const y0 = bbox.minPoint.y;
        const z0 = bbox.minPoint.z;
        const x1 = bbox.maxPoint.x;
        const y1 = bbox.maxPoint.y;
        const z1 = bbox.maxPoint.z;
        if (this._origin.z < z0 ||
            this._origin.z > z1 ||
            this._origin.x < x0 ||
            this._origin.y > y1 ||
            this._jbyi * x0 - y0 + this._c_xy < 0 ||
            this._ibyj * y1 - x1 + this._c_yx > 0)
            return false;
        return true;
    }
    qtestMPOEx(bbox) {
        if (!this.qtestMPO(bbox)) {
            return null;
        }
        let t = (bbox.maxPoint.x - this._origin.x) * this._ii;
        const t2 = (bbox.minPoint.y - this._origin.y) * this._ij;
        if (t2 > t)
            t = t2;
        return t;
    }
    qtestPMO(bbox) {
        const x0 = bbox.minPoint.x;
        const y0 = bbox.minPoint.y;
        const z0 = bbox.minPoint.z;
        const x1 = bbox.maxPoint.x;
        const y1 = bbox.maxPoint.y;
        const z1 = bbox.maxPoint.z;
        if (this._origin.z < z0 ||
            this._origin.z > z1 ||
            this._origin.x > x1 ||
            this._origin.y < y0 ||
            this._jbyi * x1 - y1 + this._c_xy > 0 ||
            this._ibyj * y0 - x0 + this._c_yx < 0)
            return false;
        return true;
    }
    qtestPMOEx(bbox) {
        if (!this.qtestPMO(bbox)) {
            return null;
        }
        let t = (bbox.minPoint.x - this._origin.x) * this._ii;
        const t2 = (bbox.maxPoint.y - this._origin.y) * this._ij;
        if (t2 > t)
            t = t2;
        return t;
    }
    qtestPPO(bbox) {
        const x0 = bbox.minPoint.x;
        const y0 = bbox.minPoint.y;
        const z0 = bbox.minPoint.z;
        const x1 = bbox.maxPoint.x;
        const y1 = bbox.maxPoint.y;
        const z1 = bbox.maxPoint.z;
        if (this._origin.z < z0 ||
            this._origin.z > z1 ||
            this._origin.x > x1 ||
            this._origin.y > y1 ||
            this._jbyi * x1 - y0 + this._c_xy < 0 ||
            this._ibyj * y1 - x0 + this._c_yx < 0)
            return false;
        return true;
    }
    qtestPPOEx(bbox) {
        if (!this.qtestPPO(bbox)) {
            return null;
        }
        let t = (bbox.minPoint.x - this._origin.x) * this._ii;
        const t2 = (bbox.minPoint.y - this._origin.y) * this._ij;
        if (t2 > t)
            t = t2;
        return t;
    }
    qtestMOO(bbox) {
        const x0 = bbox.minPoint.x;
        const y0 = bbox.minPoint.y;
        const z0 = bbox.minPoint.z;
        const y1 = bbox.maxPoint.y;
        const z1 = bbox.maxPoint.z;
        if (this._origin.x < x0 ||
            this._origin.y < y0 ||
            this._origin.y > y1 ||
            this._origin.z < z0 ||
            this._origin.z > z1)
            return false;
        return true;
    }
    qtestMOOEx(bbox) {
        if (!this.qtestMOO(bbox)) {
            return null;
        }
        const t = (bbox.maxPoint.x - this._origin.x) * this._ii;
        return t;
    }
    qtestPOO(bbox) {
        const y0 = bbox.minPoint.y;
        const z0 = bbox.minPoint.z;
        const x1 = bbox.maxPoint.x;
        const y1 = bbox.maxPoint.y;
        const z1 = bbox.maxPoint.z;
        if (this._origin.x > x1 ||
            this._origin.y < y0 ||
            this._origin.y > y1 ||
            this._origin.z < z0 ||
            this._origin.z > z1)
            return false;
        return true;
    }
    qtestPOOEx(bbox) {
        if (!this.qtestPOO(bbox)) {
            return null;
        }
        const t = (bbox.minPoint.x - this._origin.x) * this._ii;
        return t;
    }
    qtestOMO(bbox) {
        const x0 = bbox.minPoint.x;
        const y0 = bbox.minPoint.y;
        const z0 = bbox.minPoint.z;
        const x1 = bbox.maxPoint.x;
        const z1 = bbox.maxPoint.z;
        if (this._origin.y < y0 ||
            this._origin.x < x0 ||
            this._origin.x > x1 ||
            this._origin.z < z0 ||
            this._origin.z > z1)
            return false;
        return true;
    }
    qtestOMOEx(bbox) {
        if (!this.qtestOMO(bbox)) {
            return null;
        }
        const t = (bbox.maxPoint.y - this._origin.y) * this._ij;
        return t;
    }
    qtestOPO(bbox) {
        const x0 = bbox.minPoint.x;
        const z0 = bbox.minPoint.z;
        const x1 = bbox.maxPoint.x;
        const y1 = bbox.maxPoint.y;
        const z1 = bbox.maxPoint.z;
        if (this._origin.y > y1 ||
            this._origin.x < x0 ||
            this._origin.x > x1 ||
            this._origin.z < z0 ||
            this._origin.z > z1)
            return false;
        return true;
    }
    qtestOPOEx(bbox) {
        if (!this.qtestOPO(bbox)) {
            return null;
        }
        const t = (bbox.minPoint.y - this._origin.y) * this._ij;
        return t;
    }
    qtestOOM(bbox) {
        const x0 = bbox.minPoint.x;
        const y0 = bbox.minPoint.y;
        const z0 = bbox.minPoint.z;
        const x1 = bbox.maxPoint.x;
        const y1 = bbox.maxPoint.y;
        if (this._origin.z < z0 ||
            this._origin.x < x0 ||
            this._origin.x > x1 ||
            this._origin.y < y0 ||
            this._origin.y > y1)
            return false;
        return true;
    }
    qtestOOMEx(bbox) {
        if (!this.qtestOOM(bbox)) {
            return null;
        }
        const t = (bbox.maxPoint.z - this._origin.z) * this._ik;
        return t;
    }
    qtestOOP(bbox) {
        const x0 = bbox.minPoint.x;
        const y0 = bbox.minPoint.y;
        const x1 = bbox.maxPoint.x;
        const y1 = bbox.maxPoint.y;
        const z1 = bbox.maxPoint.z;
        if (this._origin.z > z1 ||
            this._origin.x < x0 ||
            this._origin.x > x1 ||
            this._origin.y < y0 ||
            this._origin.y > y1)
            return false;
        return true;
    }
    qtestOOPEx(bbox) {
        if (!this.qtestOOP(bbox)) {
            return null;
        }
        const t = (bbox.minPoint.z - this._origin.z) * this._ik;
        return t;
    }
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
                    this.bboxIntersectionTest = this.qtestMMM;
                    this.bboxIntersectionTestEx = this.qtestMMMEx;
                }
                else if (k > 0) {
                    this.bboxIntersectionTest = this.qtestMMP;
                    this.bboxIntersectionTestEx = this.qtestMMPEx;
                }
                else {
                    this.bboxIntersectionTest = this.qtestMMO;
                    this.bboxIntersectionTestEx = this.qtestMMOEx;
                }
            }
            else {
                if (k < 0) {
                    this.bboxIntersectionTest = j > 0 ? this.qtestMPM : this.qtestMOM;
                    this.bboxIntersectionTestEx = j > 0 ? this.qtestMPMEx : this.qtestMOMEx;
                }
                else {
                    if (j === 0 && k === 0) {
                        this.bboxIntersectionTest = this.qtestMOO;
                        this.bboxIntersectionTestEx = this.qtestMOOEx;
                    }
                    else if (k === 0) {
                        this.bboxIntersectionTest = this.qtestMPO;
                        this.bboxIntersectionTestEx = this.qtestMPOEx;
                    }
                    else if (j === 0) {
                        this.bboxIntersectionTest = this.qtestMOP;
                        this.bboxIntersectionTestEx = this.qtestMOPEx;
                    }
                    else {
                        this.bboxIntersectionTest = this.qtestMPP;
                        this.bboxIntersectionTestEx = this.qtestMPPEx;
                    }
                }
            }
        }
        else {
            if (j < 0) {
                if (k < 0) {
                    this.bboxIntersectionTest = i > 0 ? this.qtestPMM : this.qtestOMM;
                    this.bboxIntersectionTestEx = i > 0 ? this.qtestPMMEx : this.qtestOMMEx;
                }
                else {
                    if (i === 0 && k === 0) {
                        this.bboxIntersectionTest = this.qtestOMO;
                        this.bboxIntersectionTestEx = this.qtestOMOEx;
                    }
                    else if (k === 0) {
                        this.bboxIntersectionTest = this.qtestPMO;
                        this.bboxIntersectionTestEx = this.qtestPMOEx;
                    }
                    else if (i === 0) {
                        this.bboxIntersectionTest = this.qtestOMP;
                        this.bboxIntersectionTestEx = this.qtestOMPEx;
                    }
                    else {
                        this.bboxIntersectionTest = this.qtestPMP;
                        this.bboxIntersectionTestEx = this.qtestPMPEx;
                    }
                }
            }
            else {
                if (k < 0) {
                    if (i === 0 && j === 0) {
                        this.bboxIntersectionTest = this.qtestOOM;
                        this.bboxIntersectionTestEx = this.qtestOOMEx;
                    }
                    else if (i === 0) {
                        this.bboxIntersectionTest = this.qtestOPM;
                        this.bboxIntersectionTestEx = this.qtestOPMEx;
                    }
                    else if (j === 0) {
                        this.bboxIntersectionTest = this.qtestPOM;
                        this.bboxIntersectionTestEx = this.qtestPOMEx;
                    }
                    else {
                        this.bboxIntersectionTest = this.qtestPPM;
                        this.bboxIntersectionTestEx = this.qtestPPMEx;
                    }
                }
                else {
                    if (i === 0) {
                        if (j === 0) {
                            this.bboxIntersectionTest = this.qtestOOP;
                            this.bboxIntersectionTestEx = this.qtestOOPEx;
                        }
                        else if (k === 0) {
                            this.bboxIntersectionTest = this.qtestOPO;
                            this.bboxIntersectionTestEx = this.qtestOPOEx;
                        }
                        else {
                            this.bboxIntersectionTest = this.qtestOPP;
                            this.bboxIntersectionTestEx = this.qtestOPPEx;
                        }
                    }
                    else {
                        if (j === 0 && k === 0) {
                            this.bboxIntersectionTest = this.qtestPOO;
                            this.bboxIntersectionTestEx = this.qtestPOOEx;
                        }
                        else if (j === 0) {
                            this.bboxIntersectionTest = this.qtestPOP;
                            this.bboxIntersectionTestEx = this.qtestPOPEx;
                        }
                        else if (k === 0) {
                            this.bboxIntersectionTest = this.qtestPPO;
                            this.bboxIntersectionTestEx = this.qtestPPOEx;
                        }
                        else {
                            this.bboxIntersectionTest = this.qtestPPP;
                            this.bboxIntersectionTestEx = this.qtestPPPEx;
                        }
                    }
                }
            }
        }
    }
}

export { Ray };
//# sourceMappingURL=ray.js.map
