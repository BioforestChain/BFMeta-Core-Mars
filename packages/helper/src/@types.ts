declare namespace BFChainCore {
  interface TxBodyJSON {
    /**交易的版本号 */
    version: number;
    maxFee: string;

    subId?: string;
    /**环境变量 */
    subEnvParams: BFChainCore.SubEnvironmentParametersJSON;

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
    /**交易所属的 dapp id */
    dappid?: string;
    /**交易所属的 域 */
    lns?: string;
    /**交易来源链的网络标识符 */
    fromMagic: string;
    /**交易去往链的网络标识符 */
    toMagic: string;
    /**交易的备注信息 */
    remark: { [key: string]: string };
    /**查询用的索引存储 */
    storage?: BFChainCore.TransactionStorageJSON;

    /**交易的手续费 */
    fee: string;
    /**交易的时间戳 */
    timestamp: number;
    /**交易的发起高度 */
    applyBlockHeight: number;
    /**交易的有效区块高度 */
    effectiveBlockHeight: number;
    /**交易的来源 ip */
    sourceIP?: string;
    /**交易POW噪点 */
    nonce?: number;
  }

  // #region
  type MachineStatusJSON = {
    /**初始化 */
    init: number;
    /**重启中 */
    restarting: number;
    /**关闭中 */
    closing: number;
    /**运行中 */
    running: number;
  };
  type PeerStatusJSON = {
    /**重建区块链 */
    rebuilding: number;
    /**同步区块 */
    syncing: number;
    /**空闲 */
    free: number;
    /**锻造区块 */
    createBlock: number;
    /**回滚区块 */
    rollback: number;
  };
  type DefaultConstantsJSON = {
    maxBatchSizeBytes: number;
    genesisAmount: string;
    miniUnit: string;
    fixedPoint: number;
    machineStatus: MachineStatusJSON;
    peerStatus: PeerStatusJSON;
    disableAssetType: string[];
    preRegisteredLNSName: string[];
    disableLNSName: string[];
  };
  // #endregion
}
