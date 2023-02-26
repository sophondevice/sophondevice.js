import { RElement } from './element';
import type { GUI } from './gui';
import type { StyleSheet } from './style';

export class DummyElement extends RElement {
  constructor(uiscene: GUI) {
    super(uiscene);
  }
  /** @internal */
  _getDefaultStyleSheet(): StyleSheet {
    return { display: 'none' };
  }
}
