declare namespace BFChainCore {
  //#region Apply Transaction to Account
  /**处理交易事件的基类 */
  interface ApplyTransactionEvent<ApplyInfo, EVENTNAME, T extends Transaction = Transaction> {
    type: string;
    transaction: T;
    applyInfo: ApplyInfo;
  }
  /**处理交易流程相关的事件 */
  interface ApplyTransactionFlowEvent<EVENTNAME, T extends Transaction = Transaction>
    extends ApplyTransactionEvent<undefined, EVENTNAME, T> {}

  type ApplyInfo_Asset = {
    address: string;
    publicKeyBuffer?: Uint8Array;
    assetInfo: AssetInfoJSON;
    amount: string;
    sourceAmount: string;
  };
  /**资产相关事件 */
  type ApplyTransactionAssetEvent<
    EVENTNAME,
    T extends Transaction = Transaction
  > = ApplyTransactionEvent<ApplyInfo_Asset, EVENTNAME, T>;
  interface ApplyInfo_FeeFromUnfrozenAsset extends ApplyInfo_Asset {
    /**冻结的索引 */
    frozenIdBuffer: Uint8Array;
  }
  type ApplyTransactionFeeEvent<
    EVENTNAME extends "fee" | "feeFromUnfrozen" = "fee",
    T extends Transaction = Transaction
  > = EVENTNAME extends "fee"
    ? ApplyTransactionEvent<ApplyInfo_Asset, "fee", T>
    : ApplyTransactionEvent<ApplyInfo_FeeFromUnfrozenAsset, "feeFromUnfrozen", T>;
  interface ApplyInfo_FrozenAsset extends ApplyInfo_Asset {
    /**冻结的索引 */
    frozenIdBuffer: Uint8Array;
    /**最小有效高度 */
    minEffectiveHeight: number;
    /**最大有效高度 */
    maxEffectiveHeight: number;
    /**总可解冻次数 */
    totalUnfrozenTimes?: number;
  }
  type ApplyTransactionFrozenAssetEvent<
    EVENTNAME,
    T extends Transaction = Transaction
  > = ApplyTransactionEvent<ApplyInfo_FrozenAsset, EVENTNAME, T>;
  interface ApplyInfo_UnfrozenAsset extends ApplyInfo_Asset {
    /**冻结的索引 */
    frozenIdBuffer: Uint8Array;
    /**解冻者的账户地址
     * 这里的解冻者本质是资金的接收者
     * 如果要将解冻资产是否要回到冻结者账户上,那就填自己就完事了
     */
    recipientId: string;
  }
  type ApplyTransactionUnfrozenAssetEvent<
    EVENTNAME,
    T extends Transaction = Transaction
  > = ApplyTransactionEvent<ApplyInfo_UnfrozenAsset, EVENTNAME, T>;
  type ApplyInfo_Account = {
    address: string;
    publicKeyBuffer: Uint8Array;
  };
  /**账户基础信息相关事件 */
  type ApplyTransactionAccountEvent<
    EVENTNAME,
    T extends Transaction
    // AssetModel extends object = object,
    // AssetJSON extends object = object
  > = ApplyTransactionEvent<ApplyInfo_Account, EVENTNAME, T>;
  type ApplyInfo_Equity = {
    address: string;
    publicKeyBuffer: Uint8Array;
    equity: string;
    sourceEquity: string;
    recipientId: string;
  };
  /**投票权益的相关事件 */
  type ApplyTransactionEquityEvent<
    EVENTNAME,
    T extends Transaction = Transaction
  > = ApplyTransactionEvent<ApplyInfo_Equity, EVENTNAME, T>;
  type ApplyInfo_Username = {
    address: string;
    publicKeyBuffer: Uint8Array;
    alias: string;
  };
  /**设置用户名的相关事件 */
  type ApplyTransactionUsernameEvent<
    EVENTNAME,
    T extends Transaction = Transaction
  > = ApplyTransactionEvent<ApplyInfo_Username, EVENTNAME, T>;
  type ApplyInfo_Signature = {
    address: string;
    publicKeyBuffer: Uint8Array;
    secondPublicKeyBuffer: Uint8Array;
  };
  /**设置二次密码的相关事件 */
  type ApplyTransactionSignatureEvent<
    EVENTNAME,
    T extends Transaction = Transaction
  > = ApplyTransactionEvent<ApplyInfo_Signature, EVENTNAME, T>;
  type ACCOUNT_STATUS = import("@bfchain/core-model-constants").ACCOUNT_STATUS;
  type ApplyInfo_FrozenAccount = {
    address: string;
    publicKeyBuffer: Uint8Array;
    accountStatus: ACCOUNT_STATUS;
  };
  /**账户冻结的相关事件 */
  type ApplyTransactionFrozenAccountEvent<
    EVENTNAME,
    T extends Transaction = Transaction
  > = ApplyTransactionEvent<ApplyInfo_FrozenAccount, EVENTNAME, T>;
  /**dapp 相关事件 */
  type ApplyInfo_IssueDAppid = {
    address: string;
    publicKeyBuffer?: Uint8Array;
    sourceChainName: string;
    sourceChainMagic: string;
    dappid: string;
    possessorAddress: string;
    type: DAPP_TYPE;
    purchaseAsset?: DAppPurchaseAssetJSON;
  };
  /**发行 dappid 的相关事件 */
  type ApplyTransactionIssueDAppidEvent<
    EVENTNAME,
    T extends Transaction = Transaction
  > = ApplyTransactionEvent<ApplyInfo_IssueDAppid, EVENTNAME, T>;
  type ApplyInfo_SaleDAppid = {
    address: string;
    publicKeyBuffer?: Uint8Array;
    dappid: string;
    sourceChainMagic: string;
    minEffectiveHeight: number;
    maxEffectiveHeight: number;
  };
  /**出售 dappid */
  type ApplyTransactionSaleDAppidEvent<
    EVENTNAME,
    T extends Transaction = Transaction
  > = ApplyTransactionEvent<ApplyInfo_SaleDAppid, EVENTNAME, T>;
  type ApplyInfo_PurchaseDAppid = {
    address: string;
    publicKeyBuffer?: Uint8Array;
    possessorAddress: string;
    dappid: string;
    sourceChainMagic: string;
  };
  /**购买 dappid */
  type ApplyTransactionPurchaseDAppidEvent<
    EVENTNAME,
    T extends Transaction = Transaction
  > = ApplyTransactionEvent<ApplyInfo_PurchaseDAppid, EVENTNAME, T>;
  type ApplyInfo_IssueAsset = {
    address: string;
    publicKeyBuffer?: Uint8Array;
    applyAddress: string;
    sourceChainName: string;
    sourceChainMagic: string;
    assetType: string;
    genesisAddress: string;
    expectedIssuedAssets: string;
    remainAssets: string;
  };
  /**发行数字资产的相关事件 */
  type ApplyTransactionIssueAssetEvent<
    EVENTNAME,
    T extends Transaction = Transaction
  > = ApplyTransactionEvent<ApplyInfo_IssueAsset, EVENTNAME, T>;
  type ApplyInfo_IssueSubchain = {
    address: string;
    publicKeyBuffer?: Uint8Array;
    chainName: string;
    assetType: string;
    magic: string;
    bnid: string;
    maxTPSPerBlock: number;
    blockPerRound: number;
    delegates: number;
    genesisBlock: import("@bfchain/core-model-block").GenesisBlock;
  };
  /**发行子链的相关事件 */
  type ApplyTransactionIssueSubchainEvent<
    EVENTNAME,
    T extends Transaction = Transaction
  > = ApplyTransactionEvent<ApplyInfo_IssueSubchain, EVENTNAME, T>;
  /**链域名相关事件 */
  type ApplyInfo_LocationNameRegistration = {
    address: string;
    publicKeyBuffer?: Uint8Array;
    name: string;
    sourceChainName: string;
    sourceChainMagic: string;
  };
  /**注册链域名 */
  type ApplyTransactionRegisterLocationNameEvent<
    EVENTNAME,
    T extends Transaction = Transaction
  > = ApplyTransactionEvent<ApplyInfo_LocationNameRegistration, EVENTNAME, T>;
  type ApplyInfo_LocationNameCancellation = {
    address: string;
    publicKeyBuffer?: Uint8Array;
    name: string;
    sourceChainMagic: string;
  };
  /**注销链域名 */
  type ApplyTransactionCancelLocationNameEvent<
    EVENTNAME,
    T extends Transaction = Transaction
  > = ApplyTransactionEvent<ApplyInfo_LocationNameCancellation, EVENTNAME, T>;
  type ApplyInfo_SetLnsManager = {
    address: string;
    publicKeyBuffer?: Uint8Array;
    name: string;
    sourceChainMagic: string;
    manager: string;
  };
  /**设置链域名管理员 */
  type ApplyTransactionSetLnsManagerEvent<
    EVENTNAME,
    T extends Transaction = Transaction
  > = ApplyTransactionEvent<ApplyInfo_SetLnsManager, EVENTNAME, T>;
  type ApplyInfo_SetLnsRecordValue = {
    address: string;
    publicKeyBuffer?: Uint8Array;
    name: string;
    sourceChainMagic: string;
    operationType: RECORD_OPERATION_TYPE;
    addRecord?: LocationNameRecordJSON;
    deleteRecord?: LocationNameRecordJSON;
  };
  /**设置链域名解析值 */
  type ApplyTransactionSetLnsRecordValueEvent<
    EVENTNAME,
    T extends Transaction = Transaction
  > = ApplyTransactionEvent<ApplyInfo_SetLnsRecordValue, EVENTNAME, T>;
  type ApplyInfo_SaleLocationName = {
    address: string;
    publicKeyBuffer?: Uint8Array;
    name: string;
    sourceChainMagic: string;
    minEffectiveHeight: number;
    maxEffectiveHeight: number;
  };
  /**出售链域名 */
  type ApplyTransactionSaleLocationNameEvent<
    EVENTNAME,
    T extends Transaction = Transaction
  > = ApplyTransactionEvent<ApplyInfo_SaleLocationName, EVENTNAME, T>;
  type ApplyInfo_PurchaseLocationName = {
    address: string;
    publicKeyBuffer?: Uint8Array;
    possessorAddress: string;
    name: string;
    sourceChainMagic: string;
  };
  /**购买链域名 */
  type ApplyTransactionPurchaseLocationNameEvent<
    EVENTNAME,
    T extends Transaction = Transaction
  > = ApplyTransactionEvent<ApplyInfo_PurchaseLocationName, EVENTNAME, T>;
  type ApplyTransactionEventMap<EM extends BFChainUtil.EventInOutMap = {}> = EM & {
    /**交易交易的POW */
    verifyTransactionProfOfWork: BFChainUtil.EventInOut<
      {
        transaction: Transaction;
        count: number;
      },
      boolean
    >;
    /**开始处理某一笔交易 */
    beginDealTransaction: BFChainUtil.EventInOut<ApplyTransactionFlowEvent<"beginDealTransaction">>;

    /**扣除手续费 */
    fee: BFChainUtil.EventInOut<ApplyTransactionFeeEvent<"fee", Transaction>, void>;
    feeFromUnfrozen: BFChainUtil.EventInOut<ApplyTransactionFeeEvent<"feeFromUnfrozen">>;

    /**扣除资产数量 */
    asset: BFChainUtil.EventInOut<ApplyTransactionAssetEvent<"asset">>;

    /**扣除权益数量 */
    voteEquity: BFChainUtil.EventInOut<
      ApplyTransactionEquityEvent<
        "voteEquity",
        | import("@bfchain/core-model-transaction").VoteTransaction
        | import("@bfchain/core-model-transaction").CustomTransaction
      >
    >;
    /**注册为受托人 */
    registerToDelegate: BFChainUtil.EventInOut<
      ApplyTransactionAccountEvent<
        "delegate",
        | import("@bfchain/core-model-transaction").DelegateTransaction
        | import("@bfchain/core-model-transaction").CustomTransaction
      >
    >;
    /**设置用户名 */
    setUsername: BFChainUtil.EventInOut<
      ApplyTransactionUsernameEvent<
        "username",
        | import("@bfchain/core-model-transaction").UsernameTransaction
        | import("@bfchain/core-model-transaction").CustomTransaction
      >
    >;
    /**设置二次密码 */
    setSecondPublicKey: BFChainUtil.EventInOut<
      ApplyTransactionSignatureEvent<
        "secondPublicKey",
        | import("@bfchain/core-model-transaction").SignatureTransaction
        | import("@bfchain/core-model-transaction").CustomTransaction
      >
    >;
    /**接收投票 */
    acceptVote: BFChainUtil.EventInOut<
      ApplyTransactionAccountEvent<
        "acceptVote",
        | import("@bfchain/core-model-transaction").AcceptVoteTransaction
        | import("@bfchain/core-model-transaction").CustomTransaction
      >
    >;
    /**拒绝投票 */
    rejectVote: BFChainUtil.EventInOut<
      ApplyTransactionAccountEvent<
        "rejectVote",
        | import("@bfchain/core-model-transaction").RejectVoteTransaction
        | import("@bfchain/core-model-transaction").CustomTransaction
      >
    >;
    /**销毁资产 */
    destoryAsset: BFChainUtil.EventInOut<
      ApplyTransactionAssetEvent<
        "destoryAsset",
        | import("@bfchain/core-model-transaction").DestoryAssetTransaction
        | import("@bfchain/core-model-transaction").CustomTransaction
      >
    >;
    /**冻结账户 */
    frozenAccount: BFChainUtil.EventInOut<
      ApplyTransactionFrozenAccountEvent<
        "frozenAccount",
        | import("@bfchain/core-model-transaction").IssueAssetTransaction
        | import("@bfchain/core-model-subchain").IssueSubchainTransaction
        | import("@bfchain/core-model-transaction").EmigrateAssetTransaction
        | import("@bfchain/core-model-transaction").CustomTransaction
      >
    >;
    /**冻结资产 */
    frozenAsset: BFChainUtil.EventInOut<
      ApplyTransactionFrozenAssetEvent<
        "frozenAsset",
        | import("@bfchain/core-model-transaction").ToExchangeAssetTransaction
        | import("@bfchain/core-model-transaction").GiftAssetTransaction
        | import("@bfchain/core-model-transaction").TrustAssetTransaction
        | import("@bfchain/core-model-transaction").SignForAssetTransaction
        | import("@bfchain/core-model-transaction").ToExchangeSpecialAssetTransaction
        | import("@bfchain/core-model-transaction").BeExchangeSpecialAssetTransaction
        | import("@bfchain/core-model-transaction").CustomTransaction
      >
    >;
    /**解冻资产 */
    unfrozenAsset: BFChainUtil.EventInOut<
      ApplyTransactionUnfrozenAssetEvent<
        "unfrozenAsset",
        | import("@bfchain/core-model-transaction").BeExchangeAssetTransaction
        | import("@bfchain/core-model-transaction").GrabAssetTransaction
        | import("@bfchain/core-model-transaction").TrustAssetTransaction
        | import("@bfchain/core-model-transaction").SignForAssetTransaction
        | import("@bfchain/core-model-transaction").ToExchangeSpecialAssetTransaction
        | import("@bfchain/core-model-transaction").BeExchangeSpecialAssetTransaction
        | import("@bfchain/core-model-transaction").CustomTransaction
      >
    >;
    /**发行 dappid */
    issueDAppid: BFChainUtil.EventInOut<
      ApplyTransactionIssueDAppidEvent<
        "issueDAppid",
        | import("@bfchain/core-model-transaction").DAppTransaction
        | import("@bfchain/core-model-transaction").CustomTransaction
      >
    >;
    /**出售 dappid */
    saleDAppid: BFChainUtil.EventInOut<
      ApplyTransactionSaleDAppidEvent<
        "saleDAppid",
        | import("@bfchain/core-model-transaction").ToExchangeSpecialAssetTransaction
        | import("@bfchain/core-model-transaction").CustomTransaction
      >
    >;
    /**购买 dappid */
    purchaseDAppid: BFChainUtil.EventInOut<
      ApplyTransactionPurchaseDAppidEvent<
        "purchaseDAppid",
        | import("@bfchain/core-model-transaction").BeExchangeSpecialAssetTransaction
        | import("@bfchain/core-model-transaction").CustomTransaction
      >
    >;
    /**发行数字资产 */
    issueAsset: BFChainUtil.EventInOut<
      ApplyTransactionIssueAssetEvent<
        "issueAsset",
        | import("@bfchain/core-model-transaction").IssueAssetTransaction
        | import("@bfchain/core-model-transaction").CustomTransaction
      >
    >;
    /**发行子链 */
    issueSubchain: BFChainUtil.EventInOut<
      ApplyTransactionIssueSubchainEvent<
        "issueSubchain",
        | import("@bfchain/core-model-subchain").IssueSubchainTransaction
        | import("@bfchain/core-model-transaction").CustomTransaction
      >
    >;
    /**注册链域名 */
    registerLocationName: BFChainUtil.EventInOut<
      ApplyTransactionRegisterLocationNameEvent<
        "registerLocationName",
        | import("@bfchain/core-model-transaction").LocationNameTransaction
        | import("@bfchain/core-model-transaction").CustomTransaction
      >
    >;
    /**注销链域名 */
    cancelLocationName: BFChainUtil.EventInOut<
      ApplyTransactionCancelLocationNameEvent<
        "cancelLocationName",
        | import("@bfchain/core-model-transaction").LocationNameTransaction
        | import("@bfchain/core-model-transaction").CustomTransaction
      >
    >;
    /**设置链域名管理员 */
    setLnsManager: BFChainUtil.EventInOut<
      ApplyTransactionSetLnsManagerEvent<
        "setLnsManager",
        | import("@bfchain/core-model-transaction").SetLnsManagerTransaction
        | import("@bfchain/core-model-transaction").CustomTransaction
      >
    >;
    /**设置链域名解析值 */
    setLnsRecordValue: BFChainUtil.EventInOut<
      ApplyTransactionSetLnsRecordValueEvent<
        "setLnsRecordValue",
        | import("@bfchain/core-model-transaction").SetLnsRecordValueTransaction
        | import("@bfchain/core-model-transaction").CustomTransaction
      >
    >;
    /**出售链域名 */
    saleLocationName: BFChainUtil.EventInOut<
      ApplyTransactionSaleLocationNameEvent<
        "saleLocationName",
        | import("@bfchain/core-model-transaction").ToExchangeSpecialAssetTransaction
        | import("@bfchain/core-model-transaction").CustomTransaction
      >
    >;
    /**购买链域名 */
    purchaseLocationName: BFChainUtil.EventInOut<
      ApplyTransactionPurchaseLocationNameEvent<
        "purchaseLocationName",
        | import("@bfchain/core-model-transaction").BeExchangeSpecialAssetTransaction
        | import("@bfchain/core-model-transaction").CustomTransaction
      >
    >;

    endDealTransaction: BFChainUtil.EventInOut<{
      transactionInBlock: TransactionInBlock;
    }>;
    nearMaxPayloadLength: BFChainUtil.EventInOut<{
      payloadLength: number;
    }>;
    /**处理完成所有交易 */
    finishedDealTransactions: BFChainUtil.EventInOut<Block>;
    beforeGenerateBlock: BFChainUtil.EventInOut<BFChainCore.BlockBody>;
    /**
     * 处理完成所有交易,完整产出区块，
     * 这时候账户、交易、区块都已经写定
     * 可以在这个事件中进行最后的资源释放了
     * 或者准备广播交易需要的动作
     */
    generatedBlock: BFChainUtil.EventInOut<Block>;
    error: BFChainUtil.EventInOut<
      {
        type: string;
        err: Error | import("@bfchain/util").Exception;
        transactionInBlock: TransactionInBlock;
      },
      {
        continue: boolean;
      }
    >;
  };
  type ApplyTransactionEventEmitter<ES extends BFChainUtil.EventInOutMap = {}> = {
    assetChangesGetter?: (tib: TransactionInBlock) => TransactionInBlock["transactionAssetChanges"];
  } & BFChainUtil.QueneEventEmitter<ApplyTransactionEventMap<ES>>;

  //#endregion
}
