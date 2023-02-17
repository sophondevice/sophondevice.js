import * as chaos from '@sophon/device';

export interface ITestCase {
  caseName: string;
  times: number;
  execute: () => void;
}

export function assert(exp, msg) {
  if (!exp) {
    throw new Error(msg);
  }
}

class Foo {
}

class Bar {
}

class SuperBar extends Bar {
}

class Visitor2 extends chaos.Visitor {
  @chaos.visitor(Foo)
  visitFoo() {
    return 'Foo';
  }
  @chaos.visitor(Bar)
  visitBar() {
    return 'Bar';
  }
}

class Visitor3 extends Visitor2 {
  visit(target: unknown) {
    if (target instanceof Foo) {
      return super.visit(target);
    } else {
      return 'AAAA';
    }
  }
}

export function testVisitor() {
  (function case1() {
    const v = new Visitor2();
    const foo = new Foo();
    assert(v.visit(foo) === 'Foo', 'Visitor test failed');
    const bar = new Bar();
    assert(v.visit(bar) === 'Bar', 'Visitor test failed');
    const sbar = new SuperBar();
    assert(v.visit(sbar) === 'Bar', 'Visitor test failed');
    const v2 = new Visitor3();
    assert(v2.visit(foo) === 'Foo', 'Visitor test failed');
    assert(v2.visit(bar) === 'AAAA', 'Visitor test failed');
    assert(v2.visit(sbar) === 'AAAA', 'Visitor test failed');
  })();
}

