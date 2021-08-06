declare namespace BFChainCore {
  interface FractionJSON<T extends number | bigint | string = number> {
    /**分子 */
    numerator: T;
    /**分母 */
    denominator: T;
  }
  interface RangeJSON {
    start: number;
    end: number;
  }
  interface RateJSON<T extends number | bigint | string = number> {
    /**前部权重 */
    prevWeight: T;
    /**后部权重 */
    nextWeight: T;
  }

  interface AccountSignatureJSON {
    /**账户密钥生成的公钥 */
    publicKey: string;
    /**账户公钥生成的签名 */
    signature: string;
    /**账户安全密钥生成的公钥 */
    secondPublicKey?: string;
    /**账户安全公钥生成的签名 */
    signSignature?: string;
  }

  interface MigrateCertificateJSON {
    /**凭证版本 */
    version: string;
    /**发起账户的唯一标识 version/address */
    fromUserId: string;
    /**接收账户的唯一标识 version/address */
    toUserId: string;
    /**迁出凭证生成时间 Date.now().getTimes() */
    timestamp: number;
    /**迁出链的唯一标识 version+自定义格式，目前是 version/magic/chainName/genesisBlockSignature */
    fromChainId: string;
    /**迁入链的唯一标识 version+自定义格式，目前是 version/magic/chainName/genesisBlockSignature */
    toChainId: string;
    /**迁出的权益：version/assetType */
    assetTypeId: string;
    /**迁出的权益数量，0-9 组成并且不包含小数点，必须大于0 */
    assets: string;
    /**发起账户签名 version/publicKey-signature/secondPublicKey-signSignature */
    signature: string;
    /**创世受托人签名 version/publicKey-signature/secondPublicKey-signSignature */
    authSignature: string;
  }

  type MigrateCertificateModel = import("./migrateCertificate.model").MigrateCertificateModel;
}
