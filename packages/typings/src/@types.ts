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
    create(secretHash: Uint8Array): BFChainUtil.PromiseMaybe<KeypairData>;
    /**非对称签名 */
    detached_sign(hash: Uint8Array, secretKey: Uint8Array): BFChainUtil.PromiseMaybe<Uint8Array>;
    /**非对称验签 */
    detached_verify(
      hash: Uint8Array,
      signatureBuffer: Uint8Array,
      publicKeyBuffer: Uint8Array,
    ): BFChainUtil.PromiseMaybe<boolean>;
    /**非对称加密 */
    box(
      msg: Uint8Array,
      publicKey: Uint8Array,
      secretKey: Uint8Array,
      nonce?: Uint8Array,
    ): BFChainUtil.PromiseMaybe<{
      nonce: Uint8Array;
      encryptedMessage: Uint8Array;
    }>;
    /**非对称解密 */
    open(
      msg: Uint8Array,
      publicKey: Uint8Array,
      secretKey: Uint8Array,
      nonce: Uint8Array,
    ): BFChainUtil.PromiseMaybe<Uint8Array | false>;
  }
  type Keypair = {
    publicKey: Buffer;
    secretKey: Buffer;
  };
  type KeypairData = {
    publicKey: Uint8Array;
    secretKey: Uint8Array;
  };
  //#endregion

  //#region Ed2curveHelperInterface

  interface Ed2curveHelperInterface {
    convertPublicKey(pk: Uint8Array): BFChainUtil.PromiseMaybe<Uint8Array>;
    convertSecretKey(sk: Uint8Array): BFChainUtil.PromiseMaybe<Uint8Array>;
  }
  //#endregion

  //#region CryptoHelper
  interface CryptoHelperInterface {
    sha256(data: ArrayBufferView | ArrayBuffer): BFChainUtil.PromiseMaybe<Uint8Array>;
    // sha512(): Hash;
    md5(data: ArrayBufferView | ArrayBuffer): BFChainUtil.PromiseMaybe<Uint8Array>;
    ripemd160(data: ArrayBufferView | ArrayBuffer): BFChainUtil.PromiseMaybe<Uint8Array>;
  }
  //#endregion
}
