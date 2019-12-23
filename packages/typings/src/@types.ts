declare namespace BFChainCore {
  type ToJSONReturnType<T extends BFChainUtil.JSONAble> = ReturnType<T["toJSON"]>;
  type JSONToModelType<J extends object = object> = J & BFChainUtil.JSONAble<J>;
  type AssetJSONToModelType<J extends object = object> = JSONToModelType<J>;
  type AssetInfoJSON = {
    magic: string;
    assetType: string;
  };

  //#region KeypairHelper
  interface KeypairHelperInterface {
    /**生成公私钥对 */
    create(secret: string): Keypair;
    /**非对称签名 */
    detached_sign(hash: Uint8Array, secretKey: Uint8Array): Buffer;
    /**非对称验签 */
    detached_verify(
      hash: Uint8Array,
      signatureBuffer: Uint8Array,
      publicKeyBuffer: Uint8Array,
    ): boolean;
    /**非对称加密 */
    box(
      msg: Uint8Array,
      publicKey: Uint8Array,
      secretKey: Uint8Array,
      nonce?: Uint8Array,
    ): {
      nonce: Uint8Array;
      encryptedMessage: Uint8Array;
    };
    /**非对称解密 */
    open(
      msg: Uint8Array,
      publicKey: Uint8Array,
      secretKey: Uint8Array,
      nonce: Uint8Array,
    ): Uint8Array | null;
  }
  type Keypair = {
    publicKey: Buffer;
    secretKey: Buffer;
  };
  //#endregion

  //#region Ed2curveHelperInterface

  interface Ed2curveHelperInterface {
    convertPublicKey(pk: Uint8Array): Uint8Array;
    convertSecretKey(sk: Uint8Array): Uint8Array;
  }
  //#endregion

  //#region CryptoHelper
  interface CryptoHelperInterface {
    sha256(): BFChainUtil.Hash;
    // sha512(): Hash;
    md5(): BFChainUtil.Hash;
    ripemd160(): BFChainUtil.Hash;
  }
  //#endregion
}
