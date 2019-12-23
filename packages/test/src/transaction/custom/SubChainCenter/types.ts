declare namespace SubChainCenter {
  interface JSONAble<T = unknown> {
    toJSON(): T;
  }

  /** 验证函数
   * 返回值ret: 是否通过验证
   * 返回值message: 如果不通过，附加信息 */
  type VERIFY_RES = { ret: boolean; message?: string };
  type VerifyFunc = (txBody: any, customAsset: any) => VERIFY_RES;
  type ApplyFunc = () => VERIFY_RES;

  /**接收范围 */
  export enum RANGE_TYPE {
    /**不限定范围 */
    EMPTY = 0,
    /**多地址 */
    MULTI_ADDRESS = 1,
    /**DAppid范围 */
    MULTI_DAPPID = 2,
    /**链域名范围 */
    MULTI_LOCATION_NAME = 4,
  }

  /**生成交易体的数据模型 */
  type TxBodyJSON = {
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
  };

  /**
   * 线程数据传递的interface
   */
  export interface IWorkerMsg {
    opcode: number;
  }
}
