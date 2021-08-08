declare namespace BFChainCore {
  interface ChainBaseInfo {
    /**链名 */
    chainName: string;
    /**链网络标识符 */
    magic: string;
    /**链创世块签名 */
    genesisBlockSignature: string;
  }

  interface MigrateCertificate {
    /**迁移信息 */
    body: {
      /**凭证版本 */
      version: string;
      /**发起账户 */
      senderId: string;
      /**接受账户 */
      recipientId: string;
      /**迁出凭证生成时间 Date.now().getTimes() */
      timestamp: number;
      /**迁出链信息 */
      fromChain: ChainBaseInfo;
      /**迁入链信息 */
      toChain: ChainBaseInfo;
      /**迁出的权益名 */
      assetType: string;
      /**迁出的权益数量，0-9 组成并且不包含小数点，必须大于0 */
      assets: string;
    };
    /**发起账户签名 */
    signature: BFChainCore.AccountSignatureJSON;
    /**迁出链的授权签名 */
    fromAuthSignature?: BFChainCore.AccountSignatureJSON;
    /**迁入链的授权签名 */
    toAuthSignature?: BFChainCore.AccountSignatureJSON;
  }

  interface GenerateMigrateCertificateArgs {
    /**申请账户密钥 */
    senderSecret: string;
    /**申请账户安全密钥 */
    senderSecondSecret?: string;
    /**接收账户 */
    recipientId: string;
    /**去往链信息 */
    toChainInfo: ChainBaseInfo;
    /**迁移的数量 */
    assets: string;
  }

  interface AuthSignMigrateCertificateArgs {
    /**授权账户密钥 */
    authSecret: string;
    /**授权账户安全密钥 */
    authSecondSecret?: string;
    /**迁移凭证 */
    migrateCertificate: import("@bfchain/core-model-common").MigrateCertificateModel;
  }

  interface ChainBaseConfig extends ChainBaseInfo {
    generatorPublicKey: string;
    genesisDelegates: string[];
  }

  interface MigrateCertificateVerifyOptions {
    /**验证迁出信息 */
    forceCheckFrom?: boolean;
    /**验证迁入信息 */
    forceCheckTo?: boolean;
    /**迁出链的基础配置信息 */
    fromChainBaseConfig?: ChainBaseConfig;
    /**迁入链的基础配置信息 */
    toChainBaseConfig?: ChainBaseConfig;
  }
}
