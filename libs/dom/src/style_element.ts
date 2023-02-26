import { RElement } from './element';
import { RTextContentChangeEvent } from './events';
import type { GUI } from './gui';
import type { RSelector } from './selector';
import type { StyleSheet } from './style';

/** @internal */
export interface StyleDefiniation {
  selector: RSelector;
  stylesheet: StyleSheet;
  extra: unknown;
}

export class StyleElement extends RElement {
  /** @internal */
  private _definitions: StyleDefiniation[];
  constructor(uiscene: GUI) {
    super(uiscene);
    this._definitions = [];
    this.addDefaultEventListener(RTextContentChangeEvent.NAME, () => {
      this._update();
    });
  }
  /** @internal */
  get definitions(): StyleDefiniation[] {
    return this._definitions;
  }
  /** @internal */
  private _update() {
    this._definitions = this._uiscene._parseStyleContent(this.textContent);
    if (this._isSucceedingOf(this._uiscene.document)) {
      this._uiscene.requireFullStyleRefresh();
    }
  }
  /** @internal */
  _getDefaultStyleSheet(): StyleSheet {
    const style = {} as StyleSheet;
    style.display = 'none';
    return style;
  }
}
