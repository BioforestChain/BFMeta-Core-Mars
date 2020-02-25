export declare class Base58 {
    private readonly ALPHABET;
    private readonly BASE;
    private readonly ALPHABET_MAP;
    private readonly LEADER;
    constructor(ALPHABET?: string);
    encode(source: Uint8Array): string;
    decodeUnsafe(string: string): Uint8Array | undefined;
    decode(string: string): Uint8Array;
}
export declare const base58: Base58;
