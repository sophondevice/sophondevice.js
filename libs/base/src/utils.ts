export function zip<K = string>(keys: string[], values: K[]): {[k: string]: K} {
  const ret: {[k: string]: K} = {};
  const len = keys.length;
  for (let i = 0; i < len; i++) {
    ret[keys[i]] = values[i];
  }
  return ret;
}

