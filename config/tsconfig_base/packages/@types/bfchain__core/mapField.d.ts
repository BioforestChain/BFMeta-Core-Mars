/**
 * 传入一个普通的object对象，其属性会被当做Map一样操作
 */
declare class TypedMap<T extends string | number, V> {
    private _hm;
    private _m;
    constructor(_hm: {
        [key in T]: V;
    }, parseMapToEntries: (map: {
        [key: string]: V;
    }) => [T, V][]);
    /**
     * 因为`set`会在构造函数调用`super`的时候去运作，那时候`._map`属性还没赋值，所以延迟设置
     */
    set(key: T, val: V): this;
    delete(key: T): boolean;
    clear(): void;
    toJSON(): { [key in T]: V; };
    get has(): (key: T) => boolean;
    get get(): (key: T) => V | undefined;
    get size(): number;
    /** Returns an iterable of entries in the map. */
    get [Symbol.iterator](): () => IterableIterator<[T, V]>;
    /**
     * Returns an iterable of key, value pairs for every entry in the map.
     */
    get entries(): () => IterableIterator<[T, V]>;
    /**
     * Returns an iterable of keys in the map
     */
    get keys(): () => IterableIterator<T>;
    /**
     * Returns an iterable of values in the map
     */
    get values(): () => IterableIterator<V>;
    get [Symbol.toStringTag](): string;
}
export declare class NumberKeyMap<V> extends TypedMap<number, V> {
    constructor(map: {
        [key: string]: V;
    });
}
export declare class StringKeyMap<V> extends TypedMap<string, V> {
    constructor(map: {
        [key: string]: V;
    });
}
declare class TypedSet<T> {
    private _l;
    private _s;
    constructor(_l: T[]);
    add(item: T): this;
    delete(item: T): boolean;
    clear(): void;
    get has(): (value: T) => boolean;
    get size(): number;
    /** Returns an iterable of entries in the map. */
    get [Symbol.iterator](): () => IterableIterator<T>;
    /**
     * Returns an iterable of key, value pairs for every entry in the map.
     */
    get entries(): () => IterableIterator<[T, T]>;
    /**
     * Returns an iterable of keys in the map
     */
    get keys(): () => IterableIterator<T>;
    /**
     * Returns an iterable of values in the map
     */
    get values(): () => IterableIterator<T>;
    get [Symbol.toStringTag](): string;
}
export declare class StringSet extends TypedSet<string> {
}
export declare class NumberSet extends TypedSet<number> {
}
export {};
//# sourceMappingURL=mapField.d.ts.map