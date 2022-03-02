export interface SimpleMap<V = string> {
  [index: string]: V;
}

export interface LocalStoragePackage<T = unknown> {
  version: number;
  data: T;
}
