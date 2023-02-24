import { RElement } from './element';
import type { GUI } from './gui';
import type { IStyleSheet } from './style';

export class DummyElement extends RElement {
  constructor(uiscene: GUI) {
    super(uiscene);
  }
  /** @internal */
  _getDefaultStyleSheet(): IStyleSheet {
    return { display: 'none' };
  }
}
