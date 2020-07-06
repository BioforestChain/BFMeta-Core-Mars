/// <reference lib="dom"/>
declare namespace BFChainCore {
  type RESPONSE_STATUS = import("./").RESPONSE_STATUS;
  type BLOCKCHAIN_STATUS = import("./").BLOCKCHAIN_STATUS;
  type NewTransactionStatus = import("./").NewTransactionStatus;

  interface ErrorMessageJSON {
    message: string;
    detailJSON: string;
    PLATFORM?: string;
    CHANNEL?: string;
    BUSINESS?: string;
    MODULE?: string;
    FILE?: string;
    CODE?: string;
  }
  interface CommonResponseJSON {
    status: RESPONSE_STATUS;
    error?: ErrorMessageJSON;
  }

  /**查询交易的查询条件 */
  type TransactionQueryOptionsJSON = {
    /**交易类型 */
    type?: string;
    /**交易唯一编号 */
    signature?: string;
    /**交易发送者地址 */
    senderId?: string;
    /**交易接收者地址 */
    recipientId?: string;
    /**交易来源 dappid */
    dappid?: string;
    /**交易来源 lns */
    lns?: string;
    /**查询自定义存储的KV */
    storage?: TransactionStorageJSON;
    /**查询的区块的signature */
    blockSignature?: string;
    /**查询的区块的最小高度 */
    minHeight?: number;
    /**查询的区块的最大高度 */
    maxHeight?: number;
    /**交易发起账户的第 i 笔交易 */
    numberOfSenderTransactions?: number;
    /**交易见证者地址 */
    trusteeId?: string;
    /**购买的 dappid */
    purchaseDAppid?: string;
    /**交易的范围 */
    range?: string;
    /**查询结果分页：起始下标 */
    offset: number;
    /**查询结果分页：返回数量， */
    limit?: number;
  };

  /**查询交易的排序选项 */
  type TransactionSortOptionsJSON = {
    /**根据交易时间戳排序 */
    index?: -1 | 1;
    height?: -1 | 1;
  };
  /**查询交易的传入参数 */
  type QueryTransactionArgJSON = {
    /**查询参数 */
    query: TransactionQueryOptionsJSON;
    /**排序参数 */
    sort: TransactionSortOptionsJSON;
  };
  /**查询交易的返回结果 */
  interface QueryTransactionReturnJSON extends CommonResponseJSON, QueryTransactionReturnParams {}
  interface QueryTransactionReturnParams {
    transactions: TransactionInBlockJSON[];
  }

  /**接收交易的参数 */
  type NewTransactionArgJSON = {
    /**红包的密码 */
    grabSecret?: string;

    transaction: TransactionJSON<any> | Transaction;
  };
  /**接收交易的返回 */
  interface NewTransactionReturnJSON extends CommonResponseJSON, NewTransactionReturnParams {}
  interface NewTransactionReturnParams {
    /**交易的接收状态 */
    newTrsStatus: NewTransactionStatus;
    /**最低手续费 */
    minFee: string;
    /**拒绝的错误码 */
    refuseReason?: import("./").NewTransactionRefuseReason;
  }
  /**查询交易的查询条件 */
  type BlockQueryOptionsJSON = {
    signature?: string;
    height?: number;
  };
  /**查询交易的传入对象 */
  type QueryBlockArgJSON = {
    query: BlockQueryOptionsJSON;
  };
  /**查询交易的返回结果 */
  interface QueryBlockReturnJSON<B extends BlockJSON = BlockJSON> extends CommonResponseJSON {
    someBlock?: SomeBlockJSON<B>;
  }
  interface QueryBlockReturnParams {
    block?: BlockJSON;
  }
  /**接收交易的传入对象 */
  type NewBlockArgJSON = {
    /**区块高度 */
    height: number;
    /**区块 signature */
    signature: string;
    /**前块 signature */
    previousBlockSignature: string;
    /**区块事件戳 */
    timestamp: number;
    /**区块总手续费 */
    totalFee: string;
    /**区块处理的交易数量 */
    numberOfTransactions: number;
    /**区块的打开账户 */
    generatorPublicKey: string;
    /**区块的参与度 */
    blockParticipation: string;
  };
  /**接收交易的返回结果 */
  interface NewBlockReturnJSON extends CommonResponseJSON, NewBlockReturnParams {}
  interface NewBlockReturnParams {}

  //#region WebRTC 建立连接
  //#region 第一步：握手，申请`rtcUid`资源

  /**节点收到WebRTC返回 */
  interface WebRTCPeerConnectionReturnJSON
    extends CommonResponseJSON,
      WebRTCPeerConnectionReturnParams {}
  interface WebRTCPeerConnectionReturnParams {
    answerSdp: string;
    rtcUid: number;
  }
  //#endregion
  //#region 第二步：交换 `iceCandidate`
  type WebRTCIceCandidateArgJSON = {
    rtcUid: number;
    ice?: RTCIceCandidateInit;
  };
  interface WebRTCIceCandidateReturnJSON
    extends CommonResponseJSON,
      WebRTCIceCandidateReturnParams {}
  interface WebRTCIceCandidateReturnParams {}
  //#endregion
  //#endregion

  // i18n基本信息
  type serviceI18nBaseModel = {
    [langusage: string]: string;
  };

  // i18n图片信息
  type serviceI18nScreenModel = {
    [langusage: string]: {
      small: string;
      large: string;
    };
  };

  // i18n备注信息
  type serviceI18nRemarkModel = {
    [langusage: string]: {
      online: number;
      title: string;
      subTitle: string;
      description: string;
    };
  };
  /**服务市场信息 */
  type ServiceInfoJSON = {
    id: string;
    dappid: string;
    version: string;
    name: string;
    category?: string[];
    defaultLanguage: string;
    tags: string[];
    icon: string;
    i18n: {
      name: serviceI18nBaseModel[];
      screen: serviceI18nScreenModel[];
      slider: serviceI18nScreenModel[];
      shortDescription: serviceI18nBaseModel[];
      description: serviceI18nBaseModel[];
      remark: serviceI18nRemarkModel[];
    };
    // i18n: {
    //   name: string;
    //   shortDescription: string;
    //   description: string;
    //   screen?: {
    //     small: string;
    //     large: string;
    //   }[];
    //   slider?: {
    //     small: string;
    //     large: string;
    //   };
    //   remark?: {
    //     title?: string;
    //     subTitle?: string;
    //     description?: string;
    //   };
    // };
    /**是否需要向矿工投票才能使用服务 */
    needVote: boolean;
    /**用户用的服务包信息 */
    userUI: {
      fileName: string;
      md5: string;
    };
    /**管理员用的服务包信息 */
    adminUI: {
      fileName: string;
      md5: string;
    };
  };

  /** 节点相关信息 */
  type ServicePeerInfoJSON = {
    peerInfoDelay: number; // 流畅度
    onlineUser: number; // 在线用户
    productivity: number; // 在线率
    paidSourceChainMagic: string; // 资产来源链名：bfchain
    paidsourceChainName: string; // 资产来源网络标识符：5F720C81E82CFC99
    paidAssetType: string; // 资产的英文缩写(unique)：BFT
    paidAmount: string; // 付费金额
    paidType: string; // 支付类型： 0:付费运用 1:免费运用
    serviceNotesName: string; // 节点服务名称
    noteIP: string; // 节点IP
    delegateAddress: string; // 受托人地址
    developerVote: boolean; // 开发者投票(数据上链投票)
    systemDelegateVote: boolean; // 矿机机主投票(使用投票)
    dappOnChainBuy: boolean; // DAPP上链付费
  };

  /**节点共识信息 */
  type PeerConsensusJSON = {
    /**节点时间 */
    peerTime: number;
  };
  /**获取节点信息传入的对象 */
  type GetPeerInfoArgJSON = {
    /**
     * 申请将自己的uid分配成指定uid，
     * 如果指定了`uid`，
     * 那么可以认为是要求将自己的缺省的`0.0.0.0`配置成`ff.ff.ff.ff(uid)`
     */
    uid?: number;
  };
  interface BlockchainStatusJSON<S extends BLOCKCHAIN_STATUS = any> {
    status: S;
    progressEvent?: BlockchainStatus.StatusProgressEventMap<S>;
  }
  namespace BlockchainStatus {
    type OFFLINE = import("./").BLOCKCHAIN_STATUS.OFFLINE;
    type FREE = import("./").BLOCKCHAIN_STATUS.FREE;
    type REBUIDING = import("./").BLOCKCHAIN_STATUS.REBUIDING;
    type PEER_SCANNING = import("./").BLOCKCHAIN_STATUS.PEER_SCANNING;
    type REPLAY_BLOCK = import("./").BLOCKCHAIN_STATUS.REPLAY_BLOCK;
    type GENERATING = import("./").BLOCKCHAIN_STATUS.GENERATING;
    type ROLLBACK = import("./").BLOCKCHAIN_STATUS.ROLLBACK;

    type StatusProgressEventMap<S extends BLOCKCHAIN_STATUS> = S extends OFFLINE
      ? undefined
      : S extends FREE
      ? undefined
      : S extends REBUIDING
      ? BlockchainRebuildingProgressEventJSON
      : S extends PEER_SCANNING
      ? BlockchainPeerScanningProgressEventJSON
      : S extends REPLAY_BLOCK
      ? BlockchainReplayBlockProgressEventJSON
      : S extends GENERATING
      ? BlockchainGeneratingProgressEventJSON
      : S extends ROLLBACK
      ? BlockchainRollbackProgressEventJSON
      : never;
  }

  type PeerInfoJSON = {
    /**
     * @property {uint32} 返回的节点信息中，因为有过peers，所以这里自定义一个uid用来区分自己与其它节点
     * 这里一般是`1`，除非`getPeerInfo`中，对方节点申请成为`1`，否则对方节点默认配分配成`0`
     * **1** : 可以理解成`192.168.0.1`的`1`，往往指代路由器，就是对面那台节点
     * **0** : 可以理解成`0.0.0.0`的`0`
     */
    uid: number;
    /**区块高度 */
    height: number;
    /**区块状态 */
    blockchainStatus: BlockchainStatusJSON;
    /**服务市场信息 */
    serviceInfo?: ServiceInfoJSON[];
    /**服务市场节点相关信息 */
    servicePeerInfo?: ServicePeerInfoJSON[];
    /**节点共识信息 */
    peerConsensus: PeerConsensusJSON;
    /**节点连接的数量 */
    peerLinkCount: number;
  };

  interface GetPeerInfoReturnParams {
    /**节点信息 */
    peerInfo?: BFChainCore.PeerInfoJSON;
  }
  interface GetPeerInfoReturnJSON extends CommonResponseJSON, GetPeerInfoReturnParams {}
}
