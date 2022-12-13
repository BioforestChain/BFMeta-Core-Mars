declare namespace BFChainCore {
  // #region converter

  namespace RegisterChain {
    type GenesisBlockInfo = {
      /**创世账户 */
      genesisAccount: {
        /**创世账户公钥 */
        address: string;
        /**创世账户公钥 */
        publicKey: string;
      };
      /**链创世块签名 */
      genesisBlockSignature: string;
      /**链名 */
      chainName: string;
      /**链主权益名 */
      assetType: string;
      /**链网络标识符 */
      magic: string;
      /**链网络类型，只能是 'b' 或 'c'，b 为正式网络，c 为测试网络 */
      bnid: BFChainCore.BNID_TYPE;
      /**链创世时间 */
      beginEpochTime: number;
      /**链创世位名 */
      genesisLocationName: string;
      /**每轮的区块数量 */
      blockPerRound: number;
      /**创世受托人数量 */
      delegates: number;
      /**区块间隔 */
      forgeInterval: number;
      /**创世受托人列表 */
      genesisDelegates: {
        /**创世受托人地址 */
        address: string;
        /**创世受托人公钥 */
        publicKey: string;
      }[];
    };

    type RegisterChainCertificateBodyJSON = {
      /**凭证版本 */
      version: string;
      /**迁出凭证生成时间 Date.now().getTimes() */
      timestamp: number;
      /**创世块信息 */
      genesisBlockInfo: GenesisBlockInfo;
    };

    type RegisterChainCertificateWithoutSignatureJSON = {
      /**凭证信息 */
      body: RegisterChainCertificateBodyJSON;
      /**链创世账户密钥生成的公钥 */
      publicKey: string;
      /**链创世账户安全密钥生成的公钥 */
      secondPublicKey?: string;
    };

    interface RegisterChainCertificateJSON extends RegisterChainCertificateWithoutSignatureJSON {
      /**链创世账户公钥生成的签名 */
      signature: string;
      /**链创世账户安全公钥生成的签名 */
      signSignature?: string;
    }

    type GenerateRegisterChainCertificateArgs = {
      /**创建账户密钥 */
      generatorSecret: string;
      /**创建账户安全密钥 */
      generatorSecondSecret?: string;
      /**凭证版本号 */
      version?: string;
      /**迁出凭证生成时间 Date.now().getTimes() */
      timestamp?: number;
      /**创世块信息 */
      genesisBlockInfo: {
        /**链创世块签名 */
        genesisBlockSignature: string;
        /**链名 */
        chainName: string;
        /**链主权益名 */
        assetType: string;
        /**链网络标识符 */
        magic: string;
        /**链网络类型，只能是 'b' 或 'c'，b 为正式网络，c 为测试网络 */
        bnid: BFChainCore.BNID_TYPE;
        /**链创世时间 */
        beginEpochTime: number;
        /**链创世位名 */
        genesisLocationName: string;
        /**每轮的区块数量 */
        blockPerRound: number;
        /**创世受托人数量 */
        delegates: number;
        /**区块间隔 */
        forgeInterval: number;
        /**创世受托人列表 */
        genesisDelegates: {
          /**创世受托人地址 */
          address: string;
          /**创世受托人公钥 */
          publicKey: string;
        }[];
      };
    };
  }
  // #endregion
}
