export declare class Base58Helper {
    cryptoHelper: BFChainCore.CryptoHelperInterface;
    Buffer: BFChainUtil.BufferConstructor;
    constructor(cryptoHelper: BFChainCore.CryptoHelperInterface, Buffer: BFChainUtil.BufferConstructor);
    bs58: import("@bfchain/core-util-base58").Base58;
    sha256x2(buffer: Uint8Array): BFChainUtil.Buffer;
    encode(payload: Uint8Array): string;
    decodeRaw(buffer: Uint8Array): BFChainUtil.Buffer | undefined;
    decodeUnsafe(string: string): BFChainUtil.Buffer | undefined;
    decode(string: string): BFChainUtil.Buffer;
}
//# sourceMappingURL=base58Helper.d.ts.map