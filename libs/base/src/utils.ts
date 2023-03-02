export type Nullable<T> = T | null;

export type HttpURLResolver = (url: string) => string;

export class HttpRequest {
  /** @internal */
  static _tempElement: Nullable<HTMLAnchorElement> = null;
  /** @internal */
  private _urlResolver: Nullable<HttpURLResolver>;
  /** @internal */
  private _crossOrigin: string;
  /** @internal */
  private _headers: Record<string, string>;
  constructor() {
    this._urlResolver = null;
    this._crossOrigin = '';
    this._headers = {};
  }
  get urlResolver(): Nullable<HttpURLResolver> {
    return this._urlResolver;
  }
  set urlResolver(resolver: Nullable<HttpURLResolver>) {
    this._urlResolver = resolver;
  }
  get crossOrigin(): string {
    return this._crossOrigin;
  }
  set crossOrigin(val: string) {
    this._crossOrigin = val;
  }
  get headers(): Record<string, string> {
    return this._headers;
  }
  set headers(val: Record<string, string>) {
    this._headers = val;
  }
  resolveURL(url: string): string {
    if (!HttpRequest._tempElement) {
      HttpRequest._tempElement = document.createElement('a');
    }
    HttpRequest._tempElement.href = url;
    return HttpRequest._tempElement.href;
  }
  async request(url: string): Promise<Nullable<Response> > {
    url = this._urlResolver ? this._urlResolver(url) : this.resolveURL(url);
    return url
      ? fetch(url, {
          credentials: this._crossOrigin === 'anonymous' ? 'same-origin' : 'include',
          headers: this._headers || {}
        })
      : null;
  }
  async requestText(url: string): Promise<string> {
    const response = await this.request(url);
    if (!response || !response.ok) {
      throw new Error(`Asset download failed: ${url}`);
    }
    return response.text();
  }
  async requestArrayBuffer(url: string): Promise<ArrayBuffer> {
    const response = await this.request(url);
    if (!response || !response.ok) {
      throw new Error(`Asset download failed: ${url}`);
    }
    return response.arrayBuffer();
  }
  async requestBlob(url: string): Promise<Blob> {
    const arrayBuffer = await this.requestArrayBuffer(url);
    return new Blob([arrayBuffer]);
  }
}
