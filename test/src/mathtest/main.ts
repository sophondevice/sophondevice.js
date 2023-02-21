import * as base from '@sophon/base';
import { ITestCase, doTest } from '../common';
import { testVectorType, testMatrixType, testQuaternion, testXForm } from './vector';
import { testPlane } from './plane';
import { testFrustum } from './frustum';
import { testAABB } from './aabb';
import { testSH } from './sh';


const testCases: ITestCase[] = [{
  caseName: 'Vector2 test',
  times: 100,
  execute: () => testVectorType(base.Vector2, 2)
}, {
  caseName: 'Vector3 test',
  times: 100,
  execute: () => testVectorType(base.Vector3, 3)
}, {
  caseName: 'Vector4 test',
  times: 100,
  execute: () => testVectorType(base.Vector4, 4)
}, {
  caseName: 'Quaternion test',
  times: 100,
  execute: () => testQuaternion()
}, {
  caseName: 'Matrix3x3 test',
  times: 100,
  execute: () => testMatrixType(base.Matrix3x3, 3, 3)
}, {
  caseName: 'Matrix4x4 test',
  times: 100,
  execute: () => testMatrixType(base.Matrix4x4, 4, 4)
}, {
  caseName: 'XForm test',
  times: 100,
  execute: () => testXForm()
}, {
  caseName: 'Plane test',
  times: 100,
  execute: () => testPlane()
}, {
  caseName: 'Frustum test',
  times: 100,
  execute: () => testFrustum()
}, {
  caseName: 'AABB test',
  times: 100,
  execute: () => testAABB()
}, {
  caseName: 'SH test',
  times: 1,
  execute: () => testSH()
}];

(async function () {
  await doTest('math test', testCases);
} ());
