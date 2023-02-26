import { RElement } from './element';
import type { GUI } from './gui';
import type { StyleSheet } from './style';

export class RFlowElement extends RElement {
  constructor(uiscene: GUI) {
    super(uiscene);
  }
  /** @internal */
  _getDefaultStyleSheet(): StyleSheet {
    const style = {} as StyleSheet;
    style.width = '100%';
    style.height = 'auto';
    style.flexDirection = 'column';
    style.justifyContent = 'flex-start';
    style.alignItems = 'stretch';
    style.flex = '0 0 auto';
    style.overflow = 'auto';
    return style;
  }
}
