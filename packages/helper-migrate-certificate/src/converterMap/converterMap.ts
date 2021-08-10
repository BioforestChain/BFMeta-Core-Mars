export class ConverterMap<KC extends BFChainCore.CrossChain.Item = never> {
  $TYPE!: KC;
  constructor(entries?: readonly KC[]) {
    this._map = new Map(entries);
  }
  private _map: Map<string, BFChainCore.CrossChain.Converter>;

  get<K extends BFChainCore.CrossChain.GetKeys<KC>>(key: K) {
    return this._map.get(key as unknown as string) as BFChainCore.CrossChain.GetValueByKey<K, KC>;
  }

  has(key: unknown): key is BFChainCore.CrossChain.GetKeys<KC> {
    return this._map.has(key as string);
  }

  set<K extends BFChainCore.CrossChain.GetKeys<KC>>(
    key: K,
    converter: BFChainCore.CrossChain.GetValueByKey<K, KC>,
  ) {
    return this._map.set(key as string, converter as BFChainCore.CrossChain.Converter);
  }

  [Symbol.iterator]() {
    return this._map.entries();
  }

  entries() {
    return this._map[Symbol.iterator] as unknown as IterableIterator<KC>;
  }

  static fromPrefix<P extends number | string, SubKC extends BFChainCore.CrossChain.Item>(
    prefix: P,
    subMap: ConverterMap<SubKC>,
  ) {
    const map = new ConverterMap();
    for (const [k, c] of subMap) {
      map.set((prefix + k) as never, c as never);
    }
    type $SubKeys = SubKC[0];
    type $AssignedKCMap = {
      [key in $SubKeys]: BFChainCore.CrossChain.Item<
        `${P}/${key}`,
        BFChainCore.CrossChain.GetValueByKey<key, SubKC>
      >;
    };
    type $AssignedKCs = $AssignedKCMap[keyof $AssignedKCMap];
    return map as unknown as ConverterMap<$AssignedKCs>;
  }

  mergeWithPrefix<P extends number | string, SubKC extends BFChainCore.CrossChain.Item>(
    prefix: P,
    subMap: ConverterMap<SubKC>,
  ) {
    for (const [k, c] of subMap) {
      this.set((prefix + k) as never, c as never);
    }
    type $SubKeys = SubKC[0];
    type $AssignedKCMap = {
      [key in $SubKeys]: BFChainCore.CrossChain.Item<
        `${P}/${key}`,
        BFChainCore.CrossChain.GetValueByKey<key, SubKC>
      >;
    };
    type $AssignedKCs = $AssignedKCMap[keyof $AssignedKCMap];
    type $MergedKCs = KC | $AssignedKCs;
    return this as unknown as ConverterMap<$MergedKCs>;
  }
}
