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
    /**交易的有效区块高度 */
    effectiveBlockHeight: number;
    /**交易POW噪点 */
    nonce?: number;
    /**交易的备注信息 */
    remark: { [key: string]: string };
    /**查询用的索引存储 */
    storage?: BFChainCore.TransactionStorageJSON;
  }

  // #region
  type MachineStatusJSON = {
    loadingModules: number;
    /**重启中... */
    restarting: number;
    rebuilding: number;
    peerScan: number;
    checkisync: number;
    peerConsensus: number;
    unBanSetInterval: number;
    syncing: number;
    free: number;
    receivedBlock: number;
    verifyBlock: number;
    dealTransaction: number;
    createBlock: number;
    sendingBlock: number;
    insufficientDiskSpace: number;
  };

  type DefaultConstantsJSON = {
    maxBatchSizeBytes: number;
    genesisAmount: string;
    miniUnit: string;
    fixedPoint: number;
    machineStatus: MachineStatusJSON;
    disableAssetType: string[];
    preRegisteredLNSName: string[];
    disableLNSName: string[];
  };
  // #endregion
}
