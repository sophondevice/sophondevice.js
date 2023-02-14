import type { RenderTemplate } from 'typedoc';
import type { REvent } from '@sophon/base';

export type TestType = RenderTemplate<number>;
export type TestType2 = REvent;
export type TestType3 = import('sophon-dummy').DummyType;