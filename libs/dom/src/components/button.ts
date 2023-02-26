import { RElement } from '../element';
import type { GUI } from '../gui';
import type { StyleSheet } from '../style';

export class Button extends RElement {
  constructor(uiscene: GUI) {
    super(uiscene);
  }
  /** @internal */
  _applyInlineStyles() {
    super._applyInlineStyles();
  }
  /** @internal */
  _init() {}
  /** @internal */
  _getDefaultStyleSheet(): StyleSheet {
    const style = super._getDefaultStyleSheet();
    style.flexDirection = 'row';
    style.padding = '2';
    style.justifyContent = 'center';
    style.backgroundColor = '#1074e7';
    return style;
  }
}
