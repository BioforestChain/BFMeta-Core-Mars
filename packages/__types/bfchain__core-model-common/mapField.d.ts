declare class TypedMap<T extends string | number, V> {
    private _hm;
    private _m;
    constructor(_hm: {
        [key in T]: V;
    }, parseMapToEntries: (map: {
        [key: string]: V;
    }) => [T, V][]);
    set(key: T, val: V): this;
    delete(key: T): boolean;
    clear(): void;
    toJSON(): { [key in T]: V; };
    get has(): (key: T) => boolean;
    get get(): (key: T) => V | undefined;
    get size(): number;
    get [Symbol.iterator](): () => IterableIterator<[T, V]>;
    get entries(): () => IterableIterator<[T, V]>;
    get keys(): () => IterableIterator<T>;
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
    get [Symbol.iterator](): () => IterableIterator<T>;
    get entries(): () => IterableIterator<[T, T]>;
    get keys(): () => IterableIterator<T>;
    get values(): () => IterableIterator<T>;
    get [Symbol.toStringTag](): string;
}
export declare class StringSet extends TypedSet<string> {
}
export declare class NumberSet extends TypedSet<number> {
}
export {};
