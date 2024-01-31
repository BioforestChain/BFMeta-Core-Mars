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
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_Asset, EVENTNAME, T>;
  interface ApplyInfo_FeeFromUnfrozenAsset extends ApplyInfo_Asset {
    /**冻结的索引 */
    frozenId: string;
  }
  type ApplyTransactionFeeEvent<
    EVENTNAME extends "fee" | "feeFromUnfrozen" = "fee",
    T extends Transaction = Transaction,
  > = EVENTNAME extends "fee"
    ? ApplyTransactionEvent<ApplyInfo_Asset, "fee", T>
    : ApplyTransactionEvent<ApplyInfo_FeeFromUnfrozenAsset, "feeFromUnfrozen", T>;

  interface ApplyInfo_DestroyMainAsset extends ApplyInfo_Asset {}
  /**销毁主权益的相关事件 */
  type ApplyTransactionDestroyMainAssetEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_DestroyMainAsset, EVENTNAME, T>;

  interface ApplyInfo_FrozenAsset extends ApplyInfo_Asset {
    /**冻结的索引 */
    frozenId: string;
    /**最小有效高度 */
    minEffectiveHeight: number;
    /**最大有效高度 */
    maxEffectiveHeight: number;
    /**总可解冻次数 */
    totalUnfrozenTimes?: number;
  }
  type ApplyTransactionFrozenAssetEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_FrozenAsset, EVENTNAME, T>;

  interface ApplyInfo_UnfrozenAsset extends ApplyInfo_Asset {
    /**冻结的索引 */
    frozenId: string;
    /**解冻者的账户地址
     * 这里的解冻者本质是资金的接收者
     * 如果要将解冻资产是否要回到冻结者账户上,那就填自己就完事了
     */
    recipientId: string;
  }
  type ApplyTransactionUnfrozenAssetEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_UnfrozenAsset, EVENTNAME, T>;

  interface ApplyInfo_SignForAsset {
    address: string;
    publicKeyBuffer: Uint8Array;
    /**冻结的索引 */
    frozenId: string;
    frozenAddress: string;
    /**解冻者的账户地址
     * 这里的解冻者本质是资金的接收者
     * 如果要将解冻资产是否要回到冻结者账户上,那就填自己就完事了
     */
    recipientId: string;
    assetInfo: AssetInfoJSON;
  }
  type ApplyTransactionSignForAssetEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_SignForAsset, EVENTNAME, T>;

  type ApplyInfo_Account = {
    address: string;
    publicKeyBuffer: Uint8Array;
  };
  /**账户基础信息相关事件 */
  type ApplyTransactionAccountEvent<
    EVENTNAME,
    T extends Transaction,
    // AssetModel extends object = object,
    // AssetJSON extends object = object
  > = ApplyTransactionEvent<ApplyInfo_Account, EVENTNAME, T>;

  type ApplyInfo_Equity = {
    address: string;
    publicKeyBuffer: Uint8Array;
    /**投出的权益数 */
    equity: string;
    sourceEquity: string;
    /**被投的受托人 */
    recipientId: string;
  };
  /**投票权益的相关事件 */
  type ApplyTransactionEquityEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_Equity, EVENTNAME, T>;

  type ApplyInfo_Signature = {
    address: string;
    publicKeyBuffer: Uint8Array;
    secondPublicKeyBuffer: Uint8Array;
  };
  /**设置二次密码的相关事件 */
  type ApplyTransactionSignatureEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
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
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_FrozenAccount, EVENTNAME, T>;

  /**dapp 相关事件 */
  type ApplyInfo_IssueDAppid = {
    address: string;
    publicKeyBuffer?: Uint8Array;
    sourceChainName: string;
    sourceChainMagic: string;
    dappid: string;
    /**dappid 的拥有者地址 */
    possessorAddress: string;
    type: DAPP_TYPE;
    purchaseAsset?: string;
    status: ASSET_STATUS;
  };
  /**发行 dappid 的相关事件 */
  type ApplyTransactionIssueDAppidEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_IssueDAppid, EVENTNAME, T>;

  type ApplyInfo_FrozenDAppid = {
    address: string;
    publicKeyBuffer?: Uint8Array;
    sourceChainName: string;
    sourceChainMagic: string;
    dappid: string;
    minEffectiveHeight: number;
    maxEffectiveHeight: number;
    status: ASSET_STATUS;
    frozenId: string;
  };
  /**冻结 dappid */
  type ApplyTransactionFrozenDAppidEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_FrozenDAppid, EVENTNAME, T>;

  type ApplyInfo_UnfrozenDAppid = {
    address: string;
    publicKeyBuffer?: Uint8Array;
    sourceChainMagic: string;
    sourceChainName: string;
    dappid: string;
    /**新的 dappid 的拥有者地址 */
    possessorAddress: string;
    status: ASSET_STATUS;
    frozenId: string;
  };
  /**解冻 dappid */
  type ApplyTransactionUnfrozenDAppidEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_UnfrozenDAppid, EVENTNAME, T>;

  type ApplyInfo_ChangeDAppidPossessor = {
    address: string;
    publicKeyBuffer?: Uint8Array;
    sourceChainName: string;
    sourceChainMagic: string;
    /**新的 dappid 的拥有者地址 */
    possessorAddress: string;
    dappid: string;
  };
  /**更改 dappid 拥有者 */
  type ApplyTransactionChangeDAppidPossessorEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_ChangeDAppidPossessor, EVENTNAME, T>;

  interface ApplyInfo_IssueAsset extends ApplyInfo_Asset {
    address: string;
    publicKeyBuffer?: Uint8Array;
    sourceChainName: string;
    genesisAddress: string;
  }
  /**发行同质资产的相关事件 */
  type ApplyTransactionIssueAssetEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_IssueAsset, EVENTNAME, T>;

  interface ApplyInfo_IncreaseAsset extends ApplyInfo_Asset {
    address: string;
    publicKeyBuffer?: Uint8Array;
    sourceChainName: string;
    applyAddress: string;
  }
  /**增发同质资产的相关事件 */
  type ApplyTransactionIncreaseAssetEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_IncreaseAsset, EVENTNAME, T>;

  interface ApplyInfo_DestroyAsset extends ApplyInfo_Asset {
    address: string;
    publicKeyBuffer?: Uint8Array;
    assetsApplyAddress: string;
  }
  /**销毁同质资产的相关事件 */
  type ApplyTransactionDestroyAssetEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_DestroyAsset, EVENTNAME, T>;

  type ApplyInfo_RegisterChain = {
    address: string;
    publicKeyBuffer?: Uint8Array;
    genesisBlock: BFChainCore.RegisterChainBlockInfoJSON;
  };
  /**注册链的相关事件 */
  type ApplyTransactionRegisterChainEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_RegisterChain, EVENTNAME, T>;

  /**位名相关事件 */
  type ApplyInfo_LocationNameRegistration = {
    address: string;
    publicKeyBuffer?: Uint8Array;
    name: string;
    sourceChainName: string;
    sourceChainMagic: string;
    /**位名的拥有者地址 */
    possessorAddress: string;
    status: ASSET_STATUS;
  };
  /**注册位名 */
  type ApplyTransactionRegisterLocationNameEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_LocationNameRegistration, EVENTNAME, T>;

  type ApplyInfo_LocationNameCancellation = {
    address: string;
    publicKeyBuffer?: Uint8Array;
    sourceChainName: string;
    sourceChainMagic: string;
    name: string;
    status: ASSET_STATUS;
  };
  /**注销位名 */
  type ApplyTransactionCancelLocationNameEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_LocationNameCancellation, EVENTNAME, T>;

  type ApplyInfo_SetLnsManager = {
    address: string;
    publicKeyBuffer?: Uint8Array;
    sourceChainName: string;
    sourceChainMagic: string;
    name: string;
    manager: string;
  };
  /**设置位名管理员 */
  type ApplyTransactionSetLnsManagerEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_SetLnsManager, EVENTNAME, T>;

  type ApplyInfo_SetLnsRecordValue = {
    address: string;
    publicKeyBuffer?: Uint8Array;
    sourceChainName: string;
    sourceChainMagic: string;
    name: string;
    operationType: RECORD_OPERATION_TYPE;
    addRecord?: LocationNameRecordJSON;
    deleteRecord?: LocationNameRecordJSON;
  };
  /**设置位名解析值 */
  type ApplyTransactionSetLnsRecordValueEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_SetLnsRecordValue, EVENTNAME, T>;

  type ApplyInfo_FrozenLocationName = {
    address: string;
    publicKeyBuffer?: Uint8Array;
    sourceChainName: string;
    sourceChainMagic: string;
    name: string;
    minEffectiveHeight: number;
    maxEffectiveHeight: number;
    status: ASSET_STATUS;
    frozenId: string;
  };
  /**冻结位名 */
  type ApplyTransactionFrozenLocationNameEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_FrozenLocationName, EVENTNAME, T>;

  type ApplyInfo_UnfrozenLocationName = {
    address: string;
    publicKeyBuffer?: Uint8Array;
    sourceChainName: string;
    sourceChainMagic: string;
    name: string;
    /**位名的拥有者地址 */
    possessorAddress: string;
    status: ASSET_STATUS;
    frozenId: string;
  };
  /**解冻位名 */
  type ApplyTransactionUnfrozenLocationNameEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_UnfrozenLocationName, EVENTNAME, T>;

  type ApplyInfo_ChangeLocationNamePossessor = {
    address: string;
    publicKeyBuffer?: Uint8Array;
    sourceChainName: string;
    sourceChainMagic: string;
    /**位名的拥有者地址 */
    possessorAddress: string;
    name: string;
  };
  /**更改位名拥有者 */
  type ApplyTransactionChangeLocationNamePossessorEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_ChangeLocationNamePossessor, EVENTNAME, T>;

  type ApplyInfo_IssueEntityFactory = {
    address: string;
    publicKeyBuffer?: Uint8Array;
    sourceChainName: string;
    sourceChainMagic: string;
    factoryId: string;
    /**entityFactory 的拥有者地址 */
    possessorAddress: string;
    /**entity 数量 */
    entityPrealnum: string;
    /**单个 entity 冻结的主权益数量 */
    entityFrozenAssetPrealnum: string;
    /**购买 entity factory 使用权需要的主权益数量 */
    purchaseAssetPrealnum: string;
    status: ASSET_STATUS;
  };
  /**发行 entityFactory */
  type ApplyTransactionIssueEntityFactoryEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_IssueEntityFactory, EVENTNAME, T>;

  interface ApplyInfo_IssueEntity_Base {
    address: string;
    publicKeyBuffer?: Uint8Array;
    sourceChainName: string;
    sourceChainMagic: string;
    factoryId: string;
    /**entity 的拥有者地址 */
    possessorAddress: string;
    /**entityFactory 的拥有者地址 */
    entityFactoryPossessorAddress: string;
    /**单个 entity 冻结的主权益数量 */
    entityFrozenAssetPrealnum: string;
    /**发行 entity 的事件 id */
    issueId: string;
    /**entity 状态 */
    status: ASSET_STATUS;
  }

  interface ApplyInfo_IssueEntity extends ApplyInfo_IssueEntity_Base {
    entityId: string;
    taxAssetPrealnum: string;
  }
  /**发行 entity */
  type ApplyTransactionIssueEntityEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_IssueEntity, EVENTNAME, T>;

  interface ApplyInfo_IssueEntityMulti extends ApplyInfo_IssueEntity_Base {
    entityStructList: BFChainCore.EntityStructJSON[];
  }
  /**发行 entity */
  type ApplyTransactionIssueEntityMultiEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_IssueEntityMulti, EVENTNAME, T>;

  type ApplyInfo_DestroyEntity = {
    address: string;
    publicKeyBuffer?: Uint8Array;
    sourceChainName: string;
    sourceChainMagic: string;
    entityId: string;
    /**entityFactory 的发行者地址 */
    entityFactoryApplicantAddress: string;
    /**entityFactory 的拥有者地址 */
    entityFactoryPossessorAddress: string;
    entityFactory: BFChainCore.IssueEntityFactoryJSON;
    /**发行 entity 的事件 id */
    frozenId: string;
    /**entity 状态 */
    status: ASSET_STATUS;
  };
  /**销毁 entity */
  type ApplyTransactionDestroyEntityEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_DestroyEntity, EVENTNAME, T>;

  type ApplyInfo_FrozenEntity = {
    address: string;
    publicKeyBuffer?: Uint8Array;
    sourceChainName: string;
    sourceChainMagic: string;
    entityId: string;
    minEffectiveHeight: number;
    maxEffectiveHeight: number;
    status: ASSET_STATUS;
    frozenId: string;
  };
  /**冻结 entityId */
  type ApplyTransactionFrozenEntityEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_FrozenEntity, EVENTNAME, T>;

  type ApplyInfo_UnfrozenEntity = {
    address: string;
    publicKeyBuffer?: Uint8Array;
    sourceChainName: string;
    sourceChainMagic: string;
    entityId: string;
    /**entityId 的拥有者地址 */
    possessorAddress: string;
    status: ASSET_STATUS;
    frozenId: string;
  };
  /**解冻 entityId */
  type ApplyTransactionUnfrozenEntityEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_UnfrozenEntity, EVENTNAME, T>;

  type ApplyInfo_ChangeEntityPossessor = {
    address: string;
    publicKeyBuffer?: Uint8Array;
    sourceChainName: string;
    sourceChainMagic: string;
    entityId: string;
    /**entityId 的拥有者地址 */
    possessorAddress: string;
  };
  /**更改 entityId 拥有者 */
  type ApplyTransactionChangeEntityPossessorEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_ChangeEntityPossessor, EVENTNAME, T>;

  type ApplyInfo_MigrateCertificate = {
    migrateCertificateId: string;
    assetInfo: AssetInfoJSON;
    assets: string;
    migrateIdBuffer: Uint8Array;
  };
  /**跨链凭证 */
  type ApplyTransactionMigrateCertificateEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_MigrateCertificate, EVENTNAME, T>;

  type ApplyInfo_PayTax = {
    sourceChainName: string;
    sourceChainMagic: string;
    parentAssetType: BFChainCore.PARENT_ASSET_TYPE;
    assetType: string;
    taxInformation: BFChainCore.TaxInformationJson;
  };
  /**验证纳税信息 */
  type ApplyTransactionPayTaxEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_PayTax, EVENTNAME, T>;

  interface ApplyInfo_PromiseResolve {
    /**承诺的索引 */
    promiseId: string;
    recipientId: string;
  }
  type ApplyTransactionPromiseResolveEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_PromiseResolve, EVENTNAME, T>;

  interface ApplyInfo_MacroCall {
    /**承诺的索引 */
    macroId: string;
    inputs: { [key: string]: string };
  }
  type ApplyTransactionMacroCallEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_MacroCall, EVENTNAME, T>;

  type ApplyInfo_IssueCertificate = {
    address: string;
    publicKeyBuffer?: Uint8Array;
    /**certificateId 的拥有者地址 */
    possessorAddress: string;
    sourceChainName: string;
    sourceChainMagic: string;
    certificateId: string;
    type: BFChainCore.CERTIFICATE_TYPE;
    status: ASSET_STATUS;
    issueId: string;
  };
  /**发行凭证 */
  type ApplyTransactionIssueCertificateEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_IssueCertificate, EVENTNAME, T>;

  type ApplyInfo_DestroyCertificate = {
    address: string;
    publicKeyBuffer?: Uint8Array;
    /**certificateId 的拥有者地址 */
    possessorAddress: string;
    sourceChainName: string;
    sourceChainMagic: string;
    certificateId: string;
    status: ASSET_STATUS;
  };
  /**销毁凭证 */
  type ApplyTransactionDestroyCertificateEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_DestroyCertificate, EVENTNAME, T>;

  type ApplyInfo_FrozenCertificate = {
    address: string;
    publicKeyBuffer?: Uint8Array;
    sourceChainName: string;
    sourceChainMagic: string;
    certificateId: string;
    minEffectiveHeight: number;
    maxEffectiveHeight: number;
    status: ASSET_STATUS;
    frozenId: string;
  };
  /**冻结 certificateId */
  type ApplyTransactionFrozenCertificateEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_FrozenCertificate, EVENTNAME, T>;

  type ApplyInfo_UnfrozenCertificate = {
    address: string;
    publicKeyBuffer?: Uint8Array;
    sourceChainMagic: string;
    sourceChainName: string;
    certificateId: string;
    /**新的 certificateId 的拥有者地址 */
    possessorAddress: string;
    status: ASSET_STATUS;
    frozenId: string;
  };
  /**解冻 certificateId */
  type ApplyTransactionUnfrozenCertificateEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_UnfrozenCertificate, EVENTNAME, T>;

  type ApplyInfo_ChangeCertificatePossessor = {
    address: string;
    publicKeyBuffer?: Uint8Array;
    sourceChainName: string;
    sourceChainMagic: string;
    /**新的 certificateId 的拥有者地址 */
    possessorAddress: string;
    certificateId: string;
  };
  /**更改 certificateId 拥有者 */
  type ApplyTransactionChangeCertificatePossessorEvent<
    EVENTNAME,
    T extends Transaction = Transaction,
  > = ApplyTransactionEvent<ApplyInfo_ChangeCertificatePossessor, EVENTNAME, T>;

  interface ApplyTransactionCountEvent<EVENTNAME, T extends Transaction = Transaction> {
    type: EVENTNAME;
    transaction: T;
  }

  type ApplyTransactionEventMap<EM extends BFChainUtil.EventInOutMap = {}> = EM & {
    /**开始处理某一笔交易 */
    beginDealTransaction: BFChainUtil.EventInOut<ApplyTransactionFlowEvent<"beginDealTransaction">>;

    /**扣除手续费 */
    fee: BFChainUtil.EventInOut<ApplyTransactionFeeEvent<"fee", Transaction>, void>;
    feeFromUnfrozen: BFChainUtil.EventInOut<ApplyTransactionFeeEvent<"feeFromUnfrozen">>;

    /**销毁主权益 */
    destroyMainAsset: BFChainUtil.EventInOut<
      ApplyTransactionDestroyMainAssetEvent<
        "destroyMainAsset",
        import("@bfchain/core-model-transaction").IssueEntityFactoryTransactionV1
      >,
      void
    >;

    /**扣除资产数量 */
    asset: BFChainUtil.EventInOut<ApplyTransactionAssetEvent<"asset">>;

    /**设置二次密码 */
    setSecondPublicKey: BFChainUtil.EventInOut<
      ApplyTransactionSignatureEvent<
        "secondPublicKey",
        import("@bfchain/core-model-transaction").SignatureTransaction
      >
    >;

    /**销毁资产 */
    destroyAsset: BFChainUtil.EventInOut<
      ApplyTransactionDestroyAssetEvent<
        "destroyAsset",
        import("@bfchain/core-model-transaction").DestroyAssetTransaction
      >
    >;
    /**冻结账户 */
    frozenAccount: BFChainUtil.EventInOut<
      ApplyTransactionFrozenAccountEvent<
        "frozenAccount",
        | import("@bfchain/core-model-transaction").IssueAssetTransaction
        | import("@bfchain/core-model-transaction").IssueEntityFactoryTransaction
        | import("@bfchain/core-model-transaction-complex").RegisterChainTransaction
        | import("@bfchain/core-model-transaction").EmigrateAssetTransaction
      >
    >;
    /**冻结资产 */
    frozenAsset: BFChainUtil.EventInOut<
      ApplyTransactionFrozenAssetEvent<
        "frozenAsset",
        | import("@bfchain/core-model-transaction").GiftAssetTransaction
        | import("@bfchain/core-model-transaction").GiftAnyTransaction
        | import("@bfchain/core-model-transaction").TrustAssetTransaction
        | import("@bfchain/core-model-transaction").SignForAssetTransaction
        | import("@bfchain/core-model-transaction").ToExchangeAssetTransaction
        | import("@bfchain/core-model-transaction").IssueEntityTransaction
        | import("@bfchain/core-model-transaction").IssueEntityMultiTransaction
        | import("@bfchain/core-model-transaction").ToExchangeAnyTransaction
        | import("@bfchain/core-model-transaction").ToExchangeAnyMultiTransaction
        | import("@bfchain/core-model-transaction").ToExchangeAnyMultiAllTransaction
      >
    >;
    /**解冻资产 */
    unfrozenAsset: BFChainUtil.EventInOut<
      ApplyTransactionUnfrozenAssetEvent<
        "unfrozenAsset",
        | import("@bfchain/core-model-transaction").BeExchangeAssetTransaction
        | import("@bfchain/core-model-transaction").GrabAnyTransaction
        | import("@bfchain/core-model-transaction").GrabAssetTransaction
        | import("@bfchain/core-model-transaction").SignForAssetTransaction
        | import("@bfchain/core-model-transaction").DestroyEntityTransaction
        | import("@bfchain/core-model-transaction").BeExchangeAnyTransaction
        | import("@bfchain/core-model-transaction").BeExchangeAnyMultiTransaction
        | import("@bfchain/core-model-transaction").BeExchangeAnyMultiAllTransaction
      >
    >;
    /**签收资产 */
    signForAsset: BFChainUtil.EventInOut<
      ApplyTransactionSignForAssetEvent<
        "signForAsset",
        import("@bfchain/core-model-transaction").SignForAssetTransaction
      >
    >;
    /**发行 dappid */
    issueDAppid: BFChainUtil.EventInOut<
      ApplyTransactionIssueDAppidEvent<
        "issueDAppid",
        import("@bfchain/core-model-transaction").DAppTransaction
      >
    >;
    /**冻结 dappid */
    frozenDAppid: BFChainUtil.EventInOut<
      ApplyTransactionFrozenDAppidEvent<
        "frozenDAppid",
        | import("@bfchain/core-model-transaction").GiftAnyTransaction
        | import("@bfchain/core-model-transaction").ToExchangeAnyTransaction
        | import("@bfchain/core-model-transaction").ToExchangeAnyMultiTransaction
        | import("@bfchain/core-model-transaction").ToExchangeAnyMultiAllTransaction
      >
    >;
    /**解冻 dappid */
    unfrozenDAppid: BFChainUtil.EventInOut<
      ApplyTransactionUnfrozenDAppidEvent<
        "unfrozenDAppid",
        | import("@bfchain/core-model-transaction").GrabAnyTransaction
        | import("@bfchain/core-model-transaction").BeExchangeAnyTransaction
        | import("@bfchain/core-model-transaction").BeExchangeAnyMultiTransaction
        | import("@bfchain/core-model-transaction").BeExchangeAnyMultiAllTransaction
      >
    >;
    /**更改 dappid 拥有者 */
    changeDAppidPossessor: BFChainUtil.EventInOut<
      ApplyTransactionChangeDAppidPossessorEvent<
        "changeDAppidPossessor",
        | import("@bfchain/core-model-transaction").TransferAnyTransaction
        | import("@bfchain/core-model-transaction").BeExchangeAnyTransaction
        | import("@bfchain/core-model-transaction").BeExchangeAnyMultiTransaction
        | import("@bfchain/core-model-transaction").BeExchangeAnyMultiAllTransaction
      >
    >;
    /**发行同质资产 */
    issueAsset: BFChainUtil.EventInOut<
      ApplyTransactionIssueAssetEvent<
        "issueAsset",
        import("@bfchain/core-model-transaction").IssueAssetTransaction
      >
    >;
    /**增发同质资产 */
    increaseAsset: BFChainUtil.EventInOut<
      ApplyTransactionIncreaseAssetEvent<
        "increaseAsset",
        import("@bfchain/core-model-transaction").IncreaseAssetTransaction
      >
    >;
    /**注册链 */
    registerChain: BFChainUtil.EventInOut<
      ApplyTransactionRegisterChainEvent<
        "registerChain",
        import("@bfchain/core-model-transaction-complex").RegisterChainTransaction
      >
    >;
    /**注册位名 */
    registerLocationName: BFChainUtil.EventInOut<
      ApplyTransactionRegisterLocationNameEvent<
        "registerLocationName",
        import("@bfchain/core-model-transaction").LocationNameTransaction
      >
    >;
    /**注销位名 */
    cancelLocationName: BFChainUtil.EventInOut<
      ApplyTransactionCancelLocationNameEvent<
        "cancelLocationName",
        import("@bfchain/core-model-transaction").LocationNameTransaction
      >
    >;
    /**设置位名管理员 */
    setLnsManager: BFChainUtil.EventInOut<
      ApplyTransactionSetLnsManagerEvent<
        "setLnsManager",
        import("@bfchain/core-model-transaction").SetLnsManagerTransaction
      >
    >;
    /**设置位名解析值 */
    setLnsRecordValue: BFChainUtil.EventInOut<
      ApplyTransactionSetLnsRecordValueEvent<
        "setLnsRecordValue",
        import("@bfchain/core-model-transaction").SetLnsRecordValueTransaction
      >
    >;
    /**冻结位名 */
    frozenLocationName: BFChainUtil.EventInOut<
      ApplyTransactionFrozenLocationNameEvent<
        "frozenLocationName",
        | import("@bfchain/core-model-transaction").GiftAnyTransaction
        | import("@bfchain/core-model-transaction").ToExchangeAnyTransaction
        | import("@bfchain/core-model-transaction").ToExchangeAnyMultiTransaction
        | import("@bfchain/core-model-transaction").ToExchangeAnyMultiAllTransaction
      >
    >;
    /**解冻位名 */
    unfrozenLocationName: BFChainUtil.EventInOut<
      ApplyTransactionUnfrozenLocationNameEvent<
        "unfrozenLocationName",
        | import("@bfchain/core-model-transaction").GrabAnyTransaction
        | import("@bfchain/core-model-transaction").BeExchangeAnyTransaction
        | import("@bfchain/core-model-transaction").BeExchangeAnyMultiTransaction
        | import("@bfchain/core-model-transaction").BeExchangeAnyMultiAllTransaction
      >
    >;
    /**更改位名拥有者 */
    changeLocationNamePossessor: BFChainUtil.EventInOut<
      ApplyTransactionChangeLocationNamePossessorEvent<
        "changeLocationNamePossessor",
        | import("@bfchain/core-model-transaction").TransferAnyTransaction
        | import("@bfchain/core-model-transaction").BeExchangeAnyTransaction
        | import("@bfchain/core-model-transaction").BeExchangeAnyMultiTransaction
        | import("@bfchain/core-model-transaction").BeExchangeAnyMultiAllTransaction
      >
    >;
    /**发行 entityFactory */
    issueEntityFactoryByFrozen: BFChainUtil.EventInOut<
      ApplyTransactionIssueEntityFactoryEvent<
        "issueEntityFactoryByFrozen",
        import("@bfchain/core-model-transaction").IssueEntityFactoryTransaction
      >
    >;
    issueEntityFactoryByDestroy: BFChainUtil.EventInOut<
      ApplyTransactionIssueEntityFactoryEvent<
        "issueEntityFactoryByDestroy",
        import("@bfchain/core-model-transaction").IssueEntityFactoryTransactionV1
      >
    >;
    /**发行 entity */
    issueEntity: BFChainUtil.EventInOut<
      ApplyTransactionIssueEntityEvent<
        "issueEntity",
        import("@bfchain/core-model-transaction").IssueEntityTransaction
      >
    >;
    /**批量发行 entity */
    issueEntityMulti: BFChainUtil.EventInOut<
      ApplyTransactionIssueEntityMultiEvent<
        "issueEntityMulti",
        import("@bfchain/core-model-transaction").IssueEntityMultiTransaction
      >
    >;
    /**销毁 entity */
    destroyEntity: BFChainUtil.EventInOut<
      ApplyTransactionDestroyEntityEvent<
        "destroyEntity",
        import("@bfchain/core-model-transaction").DestroyEntityTransaction
      >
    >;
    /**冻结 entity */
    frozenEntity: BFChainUtil.EventInOut<
      ApplyTransactionFrozenEntityEvent<
        "frozenEntity",
        | import("@bfchain/core-model-transaction").GiftAnyTransaction
        | import("@bfchain/core-model-transaction").ToExchangeAnyTransaction
        | import("@bfchain/core-model-transaction").ToExchangeAnyMultiTransaction
        | import("@bfchain/core-model-transaction").ToExchangeAnyMultiAllTransaction
      >
    >;
    /**解冻 entity */
    unfrozenEntity: BFChainUtil.EventInOut<
      ApplyTransactionUnfrozenEntityEvent<
        "unfrozenEntity",
        | import("@bfchain/core-model-transaction").GrabAnyTransaction
        | import("@bfchain/core-model-transaction").BeExchangeAnyTransaction
        | import("@bfchain/core-model-transaction").BeExchangeAnyMultiTransaction
        | import("@bfchain/core-model-transaction").BeExchangeAnyMultiAllTransaction
      >
    >;
    /**更改 entityId 拥有者 */
    changeEntityPossessor: BFChainUtil.EventInOut<
      ApplyTransactionChangeEntityPossessorEvent<
        "changeEntityPossessor",
        | import("@bfchain/core-model-transaction").TransferAnyTransaction
        | import("@bfchain/core-model-transaction").BeExchangeAnyTransaction
        | import("@bfchain/core-model-transaction").BeExchangeAnyMultiTransaction
        | import("@bfchain/core-model-transaction").BeExchangeAnyMultiAllTransaction
      >
    >;

    migrateCertificate: BFChainUtil.EventInOut<
      ApplyTransactionMigrateCertificateEvent<
        "migrateCertificate",
        import("@bfchain/core-model-transaction").ImmigrateAssetTransaction
      >
    >;

    payTax: BFChainUtil.EventInOut<
      ApplyTransactionPayTaxEvent<
        "payTax",
        | import("@bfchain/core-model-transaction").TransferAnyTransaction
        | import("@bfchain/core-model-transaction").GiftAnyTransaction
        | import("@bfchain/core-model-transaction").GiftAssetTransaction
        | import("@bfchain/core-model-transaction").ToExchangeAnyTransaction
        | import("@bfchain/core-model-transaction").BeExchangeAnyTransaction
        | import("@bfchain/core-model-transaction").ToExchangeAnyMultiTransaction
        | import("@bfchain/core-model-transaction").BeExchangeAnyMultiTransaction
        | import("@bfchain/core-model-transaction").ToExchangeAnyMultiAllTransaction
        | import("@bfchain/core-model-transaction").BeExchangeAnyMultiAllTransaction
      >
    >;

    promiseResolve: BFChainUtil.EventInOut<
      ApplyTransactionPromiseResolveEvent<
        "promiseResolve",
        import("@bfchain/core-model-transaction-complex").PromiseResolveTransaction
      >
    >;

    macroCall: BFChainUtil.EventInOut<
      ApplyTransactionMacroCallEvent<
        "macroCall",
        import("@bfchain/core-model-transaction-complex").MacroCallTransaction
      >
    >;

    issueCertificate: BFChainUtil.EventInOut<
      ApplyTransactionIssueCertificateEvent<
        "issueCertificate",
        import("@bfchain/core-model-transaction").IssueCertificateTransaction
      >
    >;
    destroyCertificate: BFChainUtil.EventInOut<
      ApplyTransactionDestroyCertificateEvent<
        "destroyCertificate",
        import("@bfchain/core-model-transaction").DestroyCertificateTransaction
      >
    >;
    /**冻结 certificateId */
    frozenCertificate: BFChainUtil.EventInOut<
      ApplyTransactionFrozenCertificateEvent<
        "frozenCertificate",
        | import("@bfchain/core-model-transaction").GiftAnyTransaction
        | import("@bfchain/core-model-transaction").ToExchangeAnyTransaction
        | import("@bfchain/core-model-transaction").ToExchangeAnyMultiTransaction
        | import("@bfchain/core-model-transaction").ToExchangeAnyMultiAllTransaction
      >
    >;
    /**解冻 certificateId */
    unfrozenCertificate: BFChainUtil.EventInOut<
      ApplyTransactionUnfrozenCertificateEvent<
        "unfrozenCertificate",
        | import("@bfchain/core-model-transaction").GrabAnyTransaction
        | import("@bfchain/core-model-transaction").BeExchangeAnyTransaction
        | import("@bfchain/core-model-transaction").BeExchangeAnyMultiTransaction
        | import("@bfchain/core-model-transaction").BeExchangeAnyMultiAllTransaction
      >
    >;
    /**更改 certificateId 拥有者 */
    changeCertificatePossessor: BFChainUtil.EventInOut<
      ApplyTransactionChangeCertificatePossessorEvent<
        "changeCertificatePossessor",
        | import("@bfchain/core-model-transaction").TransferAnyTransaction
        | import("@bfchain/core-model-transaction").BeExchangeAnyTransaction
        | import("@bfchain/core-model-transaction").BeExchangeAnyMultiTransaction
        | import("@bfchain/core-model-transaction").BeExchangeAnyMultiAllTransaction
      >
    >;

    /**交易计数 */
    count: BFChainUtil.EventInOut<
      ApplyTransactionCountEvent<"count", BFChainCore.Transaction>,
      void
    >;

    endDealTransaction: BFChainUtil.EventInOut<{
      transactionInBlock: TransactionInBlock;
    }>;
    nearMaxPayloadLength: BFChainUtil.EventInOut<{
      payloadLength: number;
    }>;
    nearMaxBlobSize: BFChainUtil.EventInOut<{
      blobSize: number;
    }>;
    /**处理完成所有交易 */
    finishedDealTransactions: BFChainUtil.EventInOut<Block>;

    error: BFChainUtil.EventInOut<
      {
        type: string;
        error: unknown;
        transactionInBlock: TransactionInBlock;
      },
      {
        continue: boolean;
      }
    >;
  };
  type ApplyTransactionEventEmitter<ES extends BFChainUtil.EventInOutMap = {}> = {
    taskname?: string;
    customMaxBlobSizeGetter?: () => number;
    tIndexGetter?: (
      tib: TransactionInBlock,
    ) => BFChainUtil.PromiseMaybe<TransactionInBlock["tIndex"]>;
    startTindexGetter?: () => BFChainUtil.PromiseMaybe<TransactionInBlock["tIndex"]>;
    assetPrealnumGetter?: (
      tib: TransactionInBlock,
    ) => BFChainUtil.PromiseMaybe<
      import("@bfchain/core-model-transaction").AssetPrealnumModel | undefined
    >;
    blockRewardsGetter?: (height: number) => BFChainUtil.PromiseMaybe<string>;
  } & BFChainUtil.QueneEventEmitter<ApplyTransactionEventMap<ES>>;

  type GenerateBlockEventEmitter<
    B extends Block = Block,
    ES extends BFChainUtil.EventInOutMap = {},
  > = ApplyTransactionEventEmitter<
    {
      beforeGenerateBlock: BFChainUtil.EventInOut<BFChainCore.BlockBody>;
      /**在区块签名前
       * 这里可以对区块做最后的调整
       */
      beforeSignatureBlock: BFChainUtil.EventInOut<B>;
      /**
       * 处理完成所有交易,完整产出区块，
       * 这时候账户、交易、区块都已经写定
       * 可以在这个事件中进行最后的资源释放了
       * 或者准备广播交易需要的动作
       */
      generatedBlock: BFChainUtil.EventInOut<B>;
      /**
       * 扩展异常信息
       */
      blockError: BFChainUtil.EventInOut<
        {
          type: string;
          error: unknown;
          blockBody: BlockBody | B;
        },
        void
      >;
    } & ES
  >;
  //#endregion
}
