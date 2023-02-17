import { doTest } from '../common';
import { testVisitor } from './common';

(async function () {
  await doTest('visitor test', [{
    caseName: 'Visitor test',
    times: 100,
    execute: () => testVisitor ()
  }]);
} ());
