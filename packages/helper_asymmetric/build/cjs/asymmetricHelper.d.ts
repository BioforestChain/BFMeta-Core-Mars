/// <reference types="node" />
/**非对称模块
 * 签名
 * 加密解密
 */
export declare class AsymmetricHelper {
    cryptoHelper: BFChainCore.CryptoHelperInterface;
    keypairHelper: BFChainCore.KeypairHelperInterface;
    ed2curveHelper: BFChainCore.Ed2curveHelperInterface;
    constructor(cryptoHelper: BFChainCore.CryptoHelperInterface, keypairHelper: BFChainCore.KeypairHelperInterface, ed2curveHelper: BFChainCore.Ed2curveHelperInterface);
    /**
     * 签名方法
     *
     * @param keypair
     * @param hash
     */
    detachedSign(message: Uint8Array, secretKey: Uint8Array): Buffer;
    detachedVeriy(message: Uint8Array, signatureBuffer: Uint8Array, publicKeyBuffer: Uint8Array): boolean;
    signToString(message: Uint8Array, secretKey: Uint8Array, encode?: BFChainUtil.HexBase64Latin1Encoding): string;
    /**
     * 非对称加密
     *
     * @param msg
     * @param decryptPK
     * @param encryptSK
     */
    asymmetricEncrypt(msg: Uint8Array, decryptPK: Uint8Array, encryptSK: Uint8Array): {
        encryptedMessage: Uint8Array;
        nonce: Uint8Array;
    };
    /**
     * 非对称解密
     *
     * @param encryptedMessage
     * @param nonce
     * @param encryptPK
     * @param decryptSK
     */
    asymmetricDecrypt(encryptedMessage: Uint8Array, encryptPK: Uint8Array, decryptSK: Uint8Array, nonce?: Uint8Array): Uint8Array | null;
}
//# sourceMappingURL=asymmetricHelper.d.ts.map