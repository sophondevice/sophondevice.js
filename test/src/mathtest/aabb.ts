import * as base from '@sophon/base';
import { assert, rand } from './common';

export function testAABB() {
  function randAABB() {
    const v1 = new base.Vector3(rand(-1000, 1000), rand(-1000, 1000), rand(-1000, 1000));
    const v2 = new base.Vector3(rand(-1000, 1000), rand(-1000, 1000), rand(-1000, 1000));
    const [min, max] = [base.Vector3.min(v1, v2), base.Vector3.max(v1, v2)];
    return new base.AABB(min, max);
  }
  function getCorners(box: base.AABB): base.Vector3[] {
    const [minx, miny, minz] = box.minPoint;
    const [maxx, maxy, maxz] = box.maxPoint;
    return [
      new base.Vector3(minx, miny, minz),
      new base.Vector3(maxx, miny, minz),
      new base.Vector3(maxx, maxy, minz),
      new base.Vector3(minx, maxy, minz),
      new base.Vector3(minx, miny, maxz),
      new base.Vector3(maxx, miny, maxz),
      new base.Vector3(maxx, maxy, maxz),
      new base.Vector3(minx, maxy, maxz)
    ]
  }
  function classifyPoints(box: base.AABB, points: base.Vector3[]) {
    let inside = 0;
    let outside = 0;
    for (const p of points) {
      if (box.containsPoint(p)) {
        inside++;
      } else {
        outside++;
      }
    }
    return [inside, outside];
  }
  (function testIntersectin() {
    const a = randAABB();
    const b = randAABB();
    const [a_inside_b, a_outside_b] = classifyPoints(b, getCorners(a));
    const [b_inside_a, b_outside_a] = classifyPoints(a, getCorners(b));
    let intersected = false;
    let a_contains_b = false;
    let b_contains_a = false;
    if ((a_inside_b !== 0 && a_outside_b !== 0) || (b_inside_a !== 0 && b_outside_a !== 0)) {
      intersected = true;
    } else if (a_inside_b === 0) {
      assert(b_inside_a === 0 || b_outside_a === 0, `intersection test failed: (${a_inside_b},${a_outside_b})(${b_inside_a},${b_outside_a})`);
      a_contains_b = b_inside_a !== 0;
    } else {
      b_contains_a = true;
    }
    if (intersected) {
      assert(a.intersectedWithBox(b) && b.intersectedWithBox(a), 'intersection test failed: intersectedWithBox()');
    }
    if (a_contains_b) {
      assert(a.containsBox(b), 'intersection test failed: containsBox()');
    }
    if (b_contains_a) {
      assert(b.containsBox(a), 'intersection test failed');
    }
  }());
}
