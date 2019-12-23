declare namespace BFChainCore {
  interface TxBodyJSON {
    /**交易的版本号 */
    version: number;
    /**交易类型 */
    type?: string;
    /**交易的发起账户地址 */
    senderId: string;
    /**交易的发起账户公钥 */
    senderPublicKey: string;
    /**交易的发起账户二次公钥 */
    senderSecondPublicKey?: string;
    /**交易的接收账户地址 */
    recipientId?: string;
    /**交易的接收类型 */
    rangeType: RANGE_TYPE;
    /**交易的接收范围 */
    range: string[];
    /**交易的手续费 */
    fee: string;
    /**交易的时间戳 */
    timestamp: number;
    /**交易所属的 dapp id */
    dappid?: string;
    /**交易所属的 域 */
    lns?: string;
    /**交易的来源 ip */
    sourceIP?: string;
    /**交易来源链的网络标识符 */
    fromMagic: string;
    /**交易去往链的网络标识符 */
    toMagic: string;
    /**交易的发起高度 */
    applyBlockHeight: number;
    /**有效区块数量 */
    numberOfEffectiveBlocks?: number;
    /**交易POW噪点 */
    nonce?: number;
    /**交易的备注信息 */
    remark: { [key: string]: string };
    /**查询用的索引存储 */
    storage?: BFChainCore.TransactionStorageJSON;
  }

  //#region TransactionHelper
  namespace TransactionHelper {
    /**
     * generateGrabAsset 方法的参数
     */
    type GenerateGrabAssetOptions = {
      /**抢红包者的地址 */
      grabId?: string;
      /**抢红包者的主密码 */
      mainSecret: string;
      /**抢红包者的二次密码，如果有的话 */
      secondSecret?: string;
      /**红包开启的密码，用于生成交易中的 ciphertextSignature */
      grabSecret?: string;
    };
  }
  //#endregion

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
