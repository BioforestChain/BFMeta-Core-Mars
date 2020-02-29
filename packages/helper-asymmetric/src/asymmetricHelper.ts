import { Injectable, Inject, BBuffer } from "@bfchain/util";

/**非对称模块
 * 签名
 * 加密解密
 */
@Injectable()
export class AsymmetricHelper {
  constructor(
    @Inject("cryptoHelper") public cryptoHelper: BFChainCore.CryptoHelperInterface,
    @Inject("keypairHelper") public keypairHelper: BFChainCore.KeypairHelperInterface,
    @Inject("ed2curveHelper") public ed2curveHelper: BFChainCore.Ed2curveHelperInterface,
  ) {}
  /**
   * 签名方法
   *
   * @param keypair
   * @param hash
   */
  async detachedSign(message: Uint8Array, secretKey: Uint8Array) {
    const hash = await this.cryptoHelper.sha256(message);
    return this.keypairHelper.detached_sign(hash, secretKey);
  }
  async detachedVeriy(
    message: Uint8Array,
    signatureBuffer: Uint8Array,
    publicKeyBuffer: Uint8Array,
  ) {
    const hash = await this.cryptoHelper.sha256(message);
    return this.keypairHelper.detached_verify(hash, signatureBuffer, publicKeyBuffer);
  }
  async signToString(
    message: Uint8Array,
    secretKey: Uint8Array,
    encode: BFChainUtil.HexBase64Latin1Encoding = "hex",
  ) {
    return (await this.detachedSign(message, secretKey)).toString(encode);
  }

  /**
   * 非对称加密
   *
   * @param msg
   * @param decryptPK
   * @param encryptSK
   */
  async asymmetricEncrypt(msg: Uint8Array, decryptPK: Uint8Array, encryptSK: Uint8Array) {
    const curveDecryptPK = await this.ed2curveHelper.convertPublicKey(decryptPK);
    if (!curveDecryptPK) {
      throw new Error("decryptPK convertPublicKey fail");
    }
    const curveEncryptSK = await this.ed2curveHelper.convertSecretKey(encryptSK);
    return this.keypairHelper.box(msg, curveDecryptPK, curveEncryptSK);
  }

  /**
   * 非对称解密
   *
   * @param encryptedMessage
   * @param nonce
   * @param encryptPK
   * @param decryptSK
   */
  async asymmetricDecrypt(
    encryptedMessage: Uint8Array,
    encryptPK: Uint8Array,
    decryptSK: Uint8Array,
    nonce = new Uint8Array(24),
  ) {
    const curveEncryptPK = await this.ed2curveHelper.convertPublicKey(encryptPK);
    if (!curveEncryptPK) {
      throw new Error("decryptPK convertPublicKey fail");
    }
    const curveDecryptSK = await this.ed2curveHelper.convertSecretKey(decryptSK);
    const decryptedMessage = await this.keypairHelper.open(
      encryptedMessage,
      curveEncryptPK,
      curveDecryptSK,
      nonce,
    );
    return decryptedMessage;
  }
}
