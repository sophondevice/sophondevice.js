export type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array;

export type TypedArrayConstructor<T extends TypedArray = any> = {
  new(): T;
  new(size: number): T;
  new(elements: number[]): T;
  new(buffer: ArrayBuffer): T;
  new(buffer: ArrayBuffer, byteOffset: number): T;
  new(buffer: ArrayBuffer, byteOffset: number, length: number): T;
  BYTES_PER_ELEMENT: number;
}

