export type CacheKey = string | (string | number)[];

export const resolveCacheKey = (key: CacheKey): string =>
  Array.isArray(key) ? key.filter((x) => undefined !== x).join('__') : key;
