declare namespace BFChainCore {
  //#region 类型别名
  // type PrealnumJSON = string;
  // type asset_amount = string
  // type chain_name = string;
  // type chain_magic = string;
  //#endregion

  type ToJSONReturnType<T extends BFChainUtil.JSONAble> = ReturnType<T["toJSON"]>;
  type JSONToModelType<J extends object = object> = J & BFChainUtil.JSONAble<J>;
  type AssetJSONToModelType<J extends object = object> = JSONToModelType<J>;
  type AssetInfoJSON = {
    /**权益所属的链名 */
    chainName: string;
    /**权益所属的链网络标识，大写字母或数字组成，5 个字符，最后一位是校验位 */
    magic: string;
    /**权益名，大写字母组成，3-10 个字符 */
    assetType: string;
  };

  //#region KeypairHelper
  interface KeypairHelperInterface {
    /**生成公私钥对 */
    create(secretHash: Uint8Array): BFChainUtil.PromiseMaybe<Keypair>;
    /**非对称签名 */
    detached_sign(hash: Uint8Array, secretKey: Uint8Array): BFChainUtil.PromiseMaybe<Buffer>;
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
      nonce: Uint8Array,
      publicKey: Uint8Array,
      secretKey: Uint8Array,
    ): BFChainUtil.PromiseMaybe<Uint8Array | false>;
  }
  type Keypair = {
    publicKey: Buffer;
    secretKey: Buffer;
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
    sha256(): CryptoAsyncHash;
    sha256(data: BFChainUtil.BinaryLike): BFChainUtil.PromiseMaybe<Buffer>;
    md5(): CryptoAsyncHash;
    md5(data: BFChainUtil.BinaryLike): BFChainUtil.PromiseMaybe<Buffer>;
    ripemd160(): CryptoAsyncHash;
    ripemd160(data: BFChainUtil.BinaryLike): BFChainUtil.PromiseMaybe<Buffer>;
  }
  interface CryptoAsyncHash {
    update(data: BFChainUtil.BinaryLike): this;
    update(data: string, input_encoding: BFChainUtil.Utf8AsciiLatin1Encoding): this;
    digest(): BFChainUtil.PromiseMaybe<Buffer>;
    digest(encoding: BFChainUtil.HexBase64Latin1Encoding): BFChainUtil.PromiseMaybe<string>;
  }

  // type HashInputData = HashInputData.Binary | HashInputData.Stream;
  // namespace HashInputData {
  //   type Binary =
  //     | ArrayBuffer
  //     | SharedArrayBuffer
  //     | DataView
  //     | Uint8Array
  //     | Uint8ClampedArray
  //     | Uint16Array
  //     | Uint32Array
  //     | Int8Array
  //     | Int16Array
  //     | Int32Array
  //     | Float32Array
  //     | Float64Array;

  //   /**
  //    * @TODO 完善`ReadableStream | NodeJS.ReadableStream`的支持
  //    */
  //   interface Stream {
  //     readable: AsyncIterable<Binary>;
  //   }
  // }
  //#endregion

  type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
  };
}
