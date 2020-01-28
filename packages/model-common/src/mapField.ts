import { cacheGetter } from "@bfchain/util-decorator";

/**
 * 传入一个普通的object对象，其属性会被当做Map一样操作
 */
class TypedMap<T extends string | number, V> {
  private _m: Map<T, V>;
  constructor(
    private _hm: {
      [key in T]: V;
    },
    parseMapToEntries: (map: { [key: string]: V }) => [T, V][],
  ) {
    this._m = new Map(parseMapToEntries(_hm));
  }
  /**
   * 因为`set`会在构造函数调用`super`的时候去运作，那时候`._map`属性还没赋值，所以延迟设置
   */
  set(key: T, val: V) {
    this._m.set(key, val);
    this._hm[key] = val;
    return this;
  }
  delete(key: T) {
    delete this._hm[key];
    return this._m.delete(key);
  }
  clear() {
    for (const num in this._hm) {
      delete this._hm[num];
    }
    return this._m.clear();
  }
  toJSON() {
    const res = {} as { [key in T]: V };

    for (const item of this._m.entries()) {
      const value = item[1] as { toJSON?: Function } | undefined;
      res[item[0]] = value && typeof value.toJSON === "function" ? value.toJSON() : value;
    }
    return res;
  }
  //#region Map属性与方法的继承
  @cacheGetter
  get has() {
    return this._m.has.bind(this._m);
  }
  @cacheGetter
  get get() {
    return this._m.get.bind(this._m);
  }
  get size() {
    return this._m.size;
  }
  /** Returns an iterable of entries in the map. */
  @cacheGetter
  get [Symbol.iterator]() {
    return this._m[Symbol.iterator].bind(this._m);
  }

  /**
   * Returns an iterable of key, value pairs for every entry in the map.
   */
  @cacheGetter
  get entries() {
    return this._m.entries.bind(this._m);
  }

  /**
   * Returns an iterable of keys in the map
   */
  @cacheGetter
  get keys() {
    return this._m.keys.bind(this._m);
  }

  /**
   * Returns an iterable of values in the map
   */
  @cacheGetter
  get values() {
    return this._m.values.bind(this._m);
  }
  get [Symbol.toStringTag]() {
    return "TypedMap";
  }
  //#endregion
}
export class NumberKeyMap<V> extends TypedMap<number, V> {
  constructor(map: { [key: string]: V }) {
    super(map, map => Object.keys(map).map(num => [Number.parseInt(num), map[num]] as [number, V]));
  }
}
export class StringKeyMap<V> extends TypedMap<string, V> {
  constructor(map: { [key: string]: V }) {
    super(map, map => Object.entries(map));
  }
}

class TypedSet<T> {
  private _s: Set<T>;
  constructor(private _l: T[]) {
    this._s = new Set(_l);
  }
  add(item: T) {
    if (!this._s.has(item)) {
      this._l.push(item);
      this._s.add(item);
    }
    return this;
  }
  delete(item: T) {
    if (this._s.delete(item)) {
      const index = this._l.indexOf(item);
      this._l.splice(index, 1);
      return true;
    }
    return false;
  }
  clear() {
    this._s.clear();
    this._l.length = 0;
  }
  //#region Set属性与方法的继承
  @cacheGetter
  get has() {
    return this._s.has.bind(this._s);
  }
  get size() {
    return this._s.size;
  }
  /** Returns an iterable of entries in the map. */
  @cacheGetter
  get [Symbol.iterator]() {
    return this._s[Symbol.iterator].bind(this._s);
  }

  /**
   * Returns an iterable of key, value pairs for every entry in the map.
   */
  @cacheGetter
  get entries() {
    return this._s.entries.bind(this._s);
  }

  /**
   * Returns an iterable of keys in the map
   */
  @cacheGetter
  get keys() {
    return this._s.keys.bind(this._s);
  }

  /**
   * Returns an iterable of values in the map
   */
  @cacheGetter
  get values() {
    return this._s.values.bind(this._s);
  }
  get [Symbol.toStringTag]() {
    return "TypedSet";
  }
  //#endregion
}
export class StringSet extends TypedSet<string> {}
export class NumberSet extends TypedSet<number> {}
