/// <reference types="node" />
export declare class AsymmetricHelper {
    cryptoHelper: BFChainCore.CryptoHelperInterface;
    keypairHelper: BFChainCore.KeypairHelperInterface;
    ed2curveHelper: BFChainCore.Ed2curveHelperInterface;
    constructor(cryptoHelper: BFChainCore.CryptoHelperInterface, keypairHelper: BFChainCore.KeypairHelperInterface, ed2curveHelper: BFChainCore.Ed2curveHelperInterface);
    detachedSign(message: Uint8Array, secretKey: Uint8Array): Buffer;
    detachedVeriy(message: Uint8Array, signatureBuffer: Uint8Array, publicKeyBuffer: Uint8Array): boolean;
    signToString(message: Uint8Array, secretKey: Uint8Array, encode?: BFChainUtil.HexBase64Latin1Encoding): string;
    asymmetricEncrypt(msg: Uint8Array, decryptPK: Uint8Array, encryptSK: Uint8Array): {
        encryptedMessage: Uint8Array;
        nonce: Uint8Array;
    };
    asymmetricDecrypt(encryptedMessage: Uint8Array, encryptPK: Uint8Array, decryptSK: Uint8Array, nonce?: Uint8Array): false | Uint8Array;
}
