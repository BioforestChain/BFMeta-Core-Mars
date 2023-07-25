import { cacheGetter } from "@bfchain/util-decorator";

type Keyof<V> = keyof V & string;
/**
 * 传入一个普通的object对象，其属性会被当做Map一样操作
 */
class TypedMap<KV extends Record<string, any>, MKV extends Record<Keyof<KV>, any> = KV> {
  private _m: Map<Keyof<MKV>, MKV[string]>;
  constructor(
    private _raw: KV,
    private valueCode: {
      decode: <K extends Keyof<KV>>(rvalue: KV[K], key: K) => MKV[K];
      encode: <K extends Keyof<KV>>(mvalue: MKV[K], key: K) => KV[K];
    },
  ) {
    this._m = new Map();
    for (const [key, rvalue] of Object.entries(this._raw)) {
      this._m.set(key, valueCode.decode(rvalue, key));
    }
  }
  /**
   * 因为`set`会在构造函数调用`super`的时候去运作，那时候`._map`属性还没赋值，所以延迟设置
   */
  set<K extends Keyof<KV>>(key: K, val: MKV[K]) {
    this._m.set(key, val);
    this._raw[key] = this.valueCode.encode(val, key);
    return this;
  }
  delete(key: Keyof<KV>) {
    if (this._m.delete(key)) {
      delete this._raw[key];
      return true;
    }
    return false;
  }
  clear() {
    for (const key in this._raw) {
      delete this._raw[key];
    }
    return this._m.clear();
  }
  toObject() {
    const res: any = {};
    for (const [item, value] of this._m) {
      res[item[0]] = value;
    }
    return res as MKV;
  }
  toJSON() {
    return { ...this._raw };
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
// export class NumberKeyMap<V> extends TypedMap<number, V> {
//   constructor(map: { [key: string]: V }) {
//     super(Object.keys(map).map((num) => [Number.parseInt(num), map[num]] as [number, V]));
//   }
// }
export class StringKeyMap<V> extends TypedMap<Record<string, V>> {
  constructor(map: { [key: string]: V }) {
    super(map, { decode: (value) => value, encode: (value) => value });
  }
}

export class StringKeyJsonValueMap<KV extends Record<string, any>> extends TypedMap<
  Record<string, string>,
  KV
> {
  constructor(map: { [key: string]: string }) {
    super(map, { decode: (value) => JSON.parse(value), encode: (value) => JSON.stringify(value) });
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
