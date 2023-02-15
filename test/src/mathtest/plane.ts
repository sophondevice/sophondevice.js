import * as base from '@sophon/base';
import * as chaos from '@sophon/device';
import { assert, rand } from './common';

export function testPlane() {
  const x = rand(-1000, 1000);
  const y = rand(1, 100);
  const z = rand(-1000, 1000);
  const plane = new chaos.Plane(new chaos.Vector3(x, y, z), new chaos.Vector3(0, 1, 0));
  const x1 = rand(-1000, 1000);
  const y1 = rand(y + rand(0, 100));
  const z1 = rand(-1000, 1000);
  assert(base.numberEquals(plane.distanceToPoint(new chaos.Vector3(x1, y1, z1)), y1 - y), 'distanceToPoint test failed');
  assert(plane.nearestPointToPoint(new chaos.Vector3(x1, y1, z1)).equalsTo(new chaos.Vector3(x1, y, z1)), 'nearestPointToPoint test failed');
  plane.inplaceFlip();
  assert(base.numberEquals(plane.distanceToPoint(new chaos.Vector3(x1, y1, z1)), y - y1), 'distanceToPoint test failed');
  assert(plane.nearestPointToPoint(new chaos.Vector3(x1, y1, z1)).equalsTo(new chaos.Vector3(x1, y, z1)), 'nearestPointToPoint test failed');
}
