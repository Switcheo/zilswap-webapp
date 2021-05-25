export interface SimpleMap<V> {
  [index: string]: V;
}

export interface LocalStoragePackage<T = unknown> {
  version: number;
  data: T;
}
