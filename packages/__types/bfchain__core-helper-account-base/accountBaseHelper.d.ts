/// <reference types="node" />
import { ConfigHelper } from "@bfchain/core-helper-config";
import { Base58Helper } from "./base58Helper";
export declare class AccountBaseHelper {
    cryptoHelper: BFChainCore.CryptoHelperInterface;
    keypairHelperInterface: BFChainCore.KeypairHelperInterface;
    Buffer: BFChainUtil.BufferConstructor;
    base58Helper: Base58Helper;
    config: ConfigHelper;
    constructor(cryptoHelper: BFChainCore.CryptoHelperInterface, keypairHelperInterface: BFChainCore.KeypairHelperInterface, Buffer: BFChainUtil.BufferConstructor, base58Helper: Base58Helper, config: ConfigHelper);
    private get _prefix();
    checkSecret(secret: string): boolean;
    createSecretKeypair(secret: string): BFChainCore.Keypair;
    getPublicKeyFromSecret(secret: string): Buffer;
    getPublicKeyStringFromSecret(secret: string, encode?: BFChainUtil.HexBase64Latin1Encoding): string;
    getBinaryAddressFromPublicKey(publicKey: Uint8Array): BFChainUtil.Buffer;
    getAddressFromPublicKey(publicKey: Uint8Array): string;
    getAddressFromPublicKeyString(publicKey: string): string;
    getAddressFromSecret(secret: string): string;
    isAddress(address: any): boolean;
    createSecondSecretKeypair(secret: string, secondSecret: string): BFChainCore.Keypair;
    getPublicKeyFromSecondSecret(secret: string, secondSecret: string): Buffer;
    getPublicKeyStringFromSecondSecret(secret: string, secondSecret: string, encode?: BFChainUtil.HexBase64Latin1Encoding): string;
    checkSecondSecret(secret: string, secondSecret: string, secondPublicKey: string): boolean;
}
