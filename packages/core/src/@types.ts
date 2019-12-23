declare namespace BFChainCore {
  type TransactionFactory<T extends Transaction> = import("./transaction/index").TransactionFactory<
    T
  >;
  type TransactionFactoryConstructor<T extends Transaction = any> = new (
    ...args: any[]
  ) => TransactionFactory<T>;
  type TransactionLogicVerifier<
    T extends Transaction
  > = import("./transactionLogicVerifier/index").TransactionLogicVerifier<T>;
  type TransactionLogicVerifierConstructor<T extends Transaction = any> = new (
    ...args: any[]
  ) => TransactionLogicVerifier<T>;
  type TransactonPoWOptions<T extends Transaction = any> = {
    count: number;
    participation: string;
    event?: BFChainUtil.QueneEventEmitter<TransactonPoWControllerEvents<T>>;
    calculator?: import("./transaction").TransactionCore["transactionPowCalculator"];
  };
  type TransactonPoWControllerEvents<T extends Transaction = any> = {
    start: BFChainUtil.EventInOut<{ diff: string; transaction: T }, { break: boolean }>;
    work: BFChainUtil.EventInOut<{ nonce: number; transaction: T }, { break: boolean }>;
    done: BFChainUtil.EventInOut<{ transaction: T }, any>;
    error: BFChainUtil.EventInOut<{ transaction: T }, any>;
  };

  //#region Block

  type BlockFactory<T extends Block> = import("./block/index").BlockFactory<T>;
  type BlockFactoryConstructor<T extends Block = any> = new (...args: any[]) => BlockFactory<T>;
  type BlockLogicVerifier<
    T extends Block
  > = import("./blockLogicVerifier/index").BlockLogicVerifier<T>;
  type BlockLogicVerifierConstructor<T extends Block = any> = new (
    ...args: any[]
  ) => BlockLogicVerifier<T>;
  type BlockTicker<T extends Block> = import("./blockTicker/index").BlockTicker<T>;
  type BlockTickerConstructor<T extends Block = any> = new (...args: any[]) => BlockTicker<T>;
  //#endregion

  //#region BlockGetterHelperInterface
  type GeneratorAddressCache = Map<number, { id: string; timestamp: number; address: string }>;
  type AccountChangeResultInfo = {
    [address: string]: {
      [magicAndAssetType: string]: string;
    };
  };
  type LastBlockInfo = {
    id: string;
    height: number;
    timestamp: number;
    blockSize: number;
    blockSignature: string;
    generatorPublicKey: string;
    numberOfTransactions: number;
    payloadHash: string;
    payloadLength: number;
    previousBlock: string;
    totalAmount: string;
    totalFee: string;
    reward: string;
    magic: string;
    remark: {
      blockParticipation: string;
    };
  };
  type TickResultInfo = {
    maxBeginBalance?: string;
    maxTxCount?: number;
    rate?: string;
  };
  type VoterInfo = {
    equity: bigint;
    address: string;
  };
  type BlockUpdateDataInfo = {
    reward: bigint;
    vrewards: bigint;
    vrewardsRemaining: bigint;
    blockFee: bigint;
    blockReward: bigint;
    totalEquity: bigint;
    voters: VoterInfo[];
  };
  type VoteRecordInfo = {
    [address: string]: bigint;
  };
  type VoteRecord = {
    [address: string]: VoteRecordInfo;
  };
  type BlockPlotChecker = Readonly<{
    height: number;
    timestamp: number;
    /**参与度 */
    blockParticipation: bigint;
    /**交易量 */
    numberOfTransactions: number;
    /**手续费 */
    totalFee: bigint;
    /**区块id,如果没有id,就用`ff*128` */
    blockId: string;
    previousBlockId: string;
  }>;
  type CurrentGenerateBlockInfo =
    | Omit<NewBlockArgJSON, "blockId">
    | Omit<BlockPlotChecker, "blockId">;
  interface BlockGetterHelperInterface<
    CC extends import("./channel").ChainChannel = import("./channel").ChainChannel
  > {
    /**根据高度获取区块 */
    getBlockByHeight(height: number): Promise<Block | undefined>;
    /**根据区块 id 获取区块 */
    getBlockById(id: string): Promise<Block | undefined>;
    getBlockGeneratorPublicKeyBufferByHeight?: (height: number) => Promise<Uint8Array | undefined>;
    getBlockSignatureByHeight?: (height: number) => Promise<Uint8Array | undefined>;
    getLastBlock(): Promise<Block>;
    getCurrentGenerateBlock?(): Promise<CurrentGenerateBlockInfo | undefined>;
    getCurrentSyncBlockInfo?(): Promise<
      | {
          block: Block;
          blockGetterHelper: BlockGetterHelperInterface;
          chainChannelGroup?: import("..").ChainChannelGroup<CC>;
        }
      | undefined
    >;
    /**记录链区块分叉信息 */
    chainBlockFork?(block: BFChainCore.Block, cause: number): Promise<void>;
    /**获取新一轮的打块受托人 */
    getNewForgingDelegates?(
      lastBlock: LastBlockInfo,
      currentGeneraterPublicKey: string,
    ): Promise<AccountBaseInfo[]>;
    /**查询交易是否存在 */
    getCountBlock?(args: {
      /**区块高度 */
      height?: number;
      /**区块的锻造者公钥 */
      generatorPublicKey?: string;
      /**区块的签名 */
      id?: string;
      /**区块的版本号 */
      version?: number;
    }): Promise<number>;
    /**统计区块 tick */
    countBlockTick?(height: number): Promise<number>;
    /**获取给某个账户投票的账户 */
    getVoteForDelegate?(generatorAddress: string, height: number): Promise<VoterInfo[]>;
    /**获取投票记录 */
    getVoteRecords?(): Promise<VoteRecord>;
  }
  // #endregion

  //#region BlockTickGetterHelperInterface
  type VoterRewardListInfo = {
    [address: string]: bigint;
  };
  interface BlockTickGetterHelperInterface<
    CC extends import("./channel").ChainChannel = import("..").ChainChannel
  > {
    /**保存参与投票账户的权益 */
    saveVotingAccountEquity(height: number): Promise<void>;
    /**更新投票账户轮某时余额/交易和权益 */
    saveVotingAccountLastInfoAndEquity(height: number): Promise<void>;
    /**获取投票账户最大初始余额和最大交易量和二者比值 */
    getMaxBeginBalanceAndMaxTxCountAndRate(
      round: number,
    ): {
      maxBeginBalance: string;
      maxTxCount: number;
      rate: string;
    };
    /**更新打块账户 */
    updateForgingAccount(block: BFChainCore.Block, forgingReward: bigint): Promise<void>;
    /**更新投票账户 */
    updateVotingAccount(block: Block, voteRewardList: VoterRewardListInfo): Promise<void>;
  }
  // endregion

  // #region AccountGetterHelperInterface type
  type AccountBaseInfo = {
    productivity: number;
    address: string;
    publicKey: string;
    vote: bigint;
  };
  type AccountInfo = {
    address: string;
    publicKey?: string;
    vote: bigint;
    username?: string;
    secondPublicKey?: string;
    accountStatus: number;
    isDelegate: number;
    isAcceptVote: number;
    equityInfo: {
      round: number;
      equity: bigint;
    };
  };
  type AssetInfo = {
    sourceChainMagic: string;
    assetType: string;
    sourceChainName?: string;
    assetNumber: bigint;
  };
  type AccountAssets = {
    [sourceChainMagic: string]: {
      [assetType: string]: AssetInfo;
    };
  };
  type AccountInfoAndAssets = {
    accountInfo: AccountInfo;
    accountAssets: AccountAssets;
  };
  type DAppInfo = {
    dappid: string;
    possessorAddress: string;
    sourceChainName: string;
    sourceChainMagic: string;
    type: number;
    height: number;
    status: number;
    maxFrozenBlockHeight: number;
    purchaseAsset?: BFChainCore.DAppPurchaseAssetJSON;
  };
  type LocationNameRecordInfo = {
    [recordType: string]: {
      [recordValue: string]: boolean;
    };
  };
  type LocationNameInfo = {
    name: string;
    sourceChainName: string;
    sourceChainMagic: string;
    possessorAddress: string;
    manager: string;
    records: LocationNameRecordInfo;
    level: string;
    height: number;
    status: number;
    maxFrozenBlockHeight: number;
    isDelete?: boolean;
  };
  type FrozenAssetInfo = {
    sourceChainMagic: string;
    assetType: string;
    amount: bigint;
  };
  type IssuedAssetInfo = {
    applyAddress: string;
    genesisAddress: string;
    sourceChainName: string;
    sourceChainMagic: string;
    assetType: string;
    expectedIssuedAssets: bigint;
    originalFrozenAssets: bigint;
    remainAssets: bigint;
    height: number;
  };

  interface FrozenAssetBaseInfo extends FrozenAssetInfo {
    transactionSignature: string;
    address: string;
    minEffectiveHeight: number;
    maxEffectiveHeight: number;
    remainUnfrozenTimes?: number;
  }

  interface FrozenAsset extends FrozenAssetBaseInfo {
    height: number;
  }
  type IssuedSubchainInfo = {
    chainName: string;
    assetType: string;
    magic: string;
    bnid: string;
    maxTPSPerBlock: number;
    blockPerRound: number;
    delegates: number;
    height: number;
  };
  type AccountAccumulationInfo = {
    [address: string]: number;
  };
  type AccountEquityInfo = {
    [delegateAddress: string]: bigint;
  };
  // #endregion
  interface AccountGetterHelperInterface<T extends AccountBaseInfo> {
    /**根据地址数组获取账户 */
    getAccounts(addressArr: string[]): Promise<T[]>;
    /** 获取准备下一轮上榜的受托人 */
    getNextRoundDelegates(): Promise<T[]>;
    /** 获取准备计算的受托人 */
    getDelegates(currentGeneraterPublicKeyList: (Uint8Array | string)[]): Promise<T[]>;
    /**获取账户信息 */
    getAccountInfo(address: string): Promise<AccountInfo | undefined>;
    /**获取账户资产信息 */
    getAccountAssets(address: string): Promise<AccountAssets | undefined>;
    /**获取账户信息和账户资产信息 */
    getAccountInfoAndAssets(address: string): Promise<AccountInfoAndAssets | undefined>;
    /**查询指定的 dapp */
    getDApp(
      sourceChainMagic: string,
      dappid: string,
      currentBlockHeight: number,
      spec?: {
        /** 某个账户是否持有指定的 dappid*/
        address: string;
      },
    ): Promise<boolean | DAppInfo | undefined>;
    /**某个账户是否给指定收托人投票(最近 2 轮) */
    getVoteForDelegate(
      address: string,
      delegate: string,
      dappid: string,
      /**当前轮次 */
      round: number,
    ): Promise<boolean>;
    /**查询指定的 LocationName */
    getLocationName(
      sourceChainMagic: string,
      locationName: string,
      currentBlockHeight: number,
      spec?: {
        /**指定账户是否持有或关联指定的域名 */
        address?: string;
        /**指定域名是否存在子域名 */
        endsWith?: string;
      },
    ): Promise<boolean | LocationNameInfo | undefined>;
    /**链域名是否被禁用 */
    isLocationNameForbidden(name: string): Promise<boolean>;
    /**查询冻结的资产 */
    getFrozenAsset(address: string, id: string): Promise<FrozenAsset | undefined>;
    /**查询指定的数字资产 */
    getAsset(magic: string, assetType: string): Promise<IssuedAssetInfo | undefined>;
    /**查询指定的资产名 */
    getCurrency(assetType: string): Promise<number | undefined>;
    /**资产名是否被禁用 */
    isCurrencyForbidden(assetType: string): Promise<boolean>;
    /**获取子链每个块的最大交易量 */
    getChainMaxTPSPerBlock(): Promise<number>;
    /**查询指定的子链 */
    getSubchain(magic: string): Promise<IssuedSubchainInfo | undefined>;
    /**查询指定的用户名 */
    getAlias(alias: string): Promise<number | undefined>;
    /**初始化账户公钥 */
    initAccountPublicKey(
      address: string,
      publicKey: string,
      currentBlockHeight: number,
    ): Promise<void>;
    /**更新账户掉块数量 */
    mergeAccountMissedBlock(
      height: number,
      accountAccumulation: AccountAccumulationInfo,
    ): Promise<void>;
    /**更新账户权益 */
    mergeAccountEquity(height: number, accountEquity: AccountEquityInfo): Promise<void>;
    /**重置受托人获得的权益 */
    resetDelegateVote(height: number): Promise<void>;
  }
  interface TransactionGetterHelperInterface<
    CC extends import("./channel").ChainChannel = import("..").ChainChannel
  > {
    /**根据交易 id 获取交易 */
    getTransactionById(id: string): Promise<TransactionJSON | undefined>;
    /**查询交易是否存在 */
    getCountTransaction(args: {
      /**交易类型 */
      type?: string;
      /**交易的发起账户 */
      senderId?: string;
      /**交易的接收账户 */
      recipientId?: string;
      /**交易的签名 */
      id?: string;
      /**索引值 */
      storageValue?: string;
    }): Promise<number>;
    /**某个账户是否购买指定的 dappid */
    getPurchaseDApp(address: string, dappid: string): Promise<boolean>;
    /**查询交易是否已经在未处理交易中 */
    checkRepeatInUntreatedTransaction(senderId: string, id: string): Promise<boolean>;
    /**查询交易是否已经在链上 */
    checkRepeatInBlockChainTransaction(id: string): Promise<boolean>;
    /**查询新生成的受托人 */
    getNewDelegates(height: number): Promise<string[]>;
  }
  //#endregion

  //#region ChannelHelper
  type ChainChannelHanlderEventMap = {
    handleMessageError: {
      in: Error;
      out: undefined;
    };
    onQueryTransaction: {
      in: import("@bfchain/core-model").QueryTransactionArgModel;
      out: QueryTransactionReturnParams | undefined;
    };
    onNewTransaction: {
      in: import("@bfchain/core-model").NewTransactionArgModel;
      out: NewTransactionReturnParams | undefined;
    };
    onQueryBlock: {
      in: import("@bfchain/core-model").QueryBlockArgModel;
      out: QueryBlockReturnParams | undefined;
    };
    onNewBlock: {
      in: import("@bfchain/core-model").NewBlockArgModel;
      out: NewBlockReturnParams | undefined;
    };
    onGetPeerInfo: {
      in: import("@bfchain/core-model").GetPeerInfoArgModel;
      out: GetPeerInfoReturnParams | undefined;
    };
  };
  type EventListenerRemover = () => void;
  interface ChannelEndpointInterface<T = Uint8Array> {
    onMessage(handle: (messageData: T) => any): EventListenerRemover;
    postMessage(messageData: T): void;
    onClose(
      handle: (error: import("@bfchain/util").InterruptedException) => any,
    ): EventListenerRemover;
    close(reason?: string): void;
  }
  type ChannelRequestOptions = {
    /**超时 */
    timeout?: number;
    /**红包的密码 */
    grabSecret?: string;
  };
  //#endregion

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
  type AssetInfoJSON = {
    magic: string;
    assetType: string;
  };
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
  type ACCOUNT_STATUS = import("@bfchain/core-model").ACCOUNT_STATUS;
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
    genesisBlock: import("@bfchain/core-model").GenesisBlock;
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
        | import("@bfchain/core-model").VoteTransaction
        | import("@bfchain/core-model").CustomTransaction
      >
    >;
    /**注册为受托人 */
    registerToDelegate: BFChainUtil.EventInOut<
      ApplyTransactionAccountEvent<
        "delegate",
        | import("@bfchain/core-model").DelegateTransaction
        | import("@bfchain/core-model").CustomTransaction
      >
    >;
    /**设置用户名 */
    setUsername: BFChainUtil.EventInOut<
      ApplyTransactionUsernameEvent<
        "username",
        | import("@bfchain/core-model").UsernameTransaction
        | import("@bfchain/core-model").CustomTransaction
      >
    >;
    /**设置二次密码 */
    setSecondPublicKey: BFChainUtil.EventInOut<
      ApplyTransactionSignatureEvent<
        "secondPublicKey",
        | import("@bfchain/core-model").SignatureTransaction
        | import("@bfchain/core-model").CustomTransaction
      >
    >;
    /**接收投票 */
    acceptVote: BFChainUtil.EventInOut<
      ApplyTransactionAccountEvent<
        "acceptVote",
        | import("@bfchain/core-model").AcceptVoteTransaction
        | import("@bfchain/core-model").CustomTransaction
      >
    >;
    /**拒绝投票 */
    rejectVote: BFChainUtil.EventInOut<
      ApplyTransactionAccountEvent<
        "rejectVote",
        | import("@bfchain/core-model").RejectVoteTransaction
        | import("@bfchain/core-model").CustomTransaction
      >
    >;
    /**销毁资产 */
    destoryAsset: BFChainUtil.EventInOut<
      ApplyTransactionAssetEvent<
        "destoryAsset",
        | import("@bfchain/core-model").DestoryAssetTransaction
        | import("@bfchain/core-model").CustomTransaction
      >
    >;
    /**冻结账户 */
    frozenAccount: BFChainUtil.EventInOut<
      ApplyTransactionFrozenAccountEvent<
        "frozenAccount",
        | import("@bfchain/core-model").IssueAssetTransaction
        | import("@bfchain/core-model").IssueSubchainTransaction
        | import("@bfchain/core-model").EmigrateAssetTransaction
        | import("@bfchain/core-model").CustomTransaction
      >
    >;
    /**冻结资产 */
    frozenAsset: BFChainUtil.EventInOut<
      ApplyTransactionFrozenAssetEvent<
        "frozenAsset",
        | import("@bfchain/core-model").ToExchangeAssetTransaction
        | import("@bfchain/core-model").GiftAssetTransaction
        | import("@bfchain/core-model").TrustAssetTransaction
        | import("@bfchain/core-model").SignForAssetTransaction
        | import("@bfchain/core-model").ToExchangeSpecialAssetTransaction
        | import("@bfchain/core-model").BeExchangeSpecialAssetTransaction
        | import("@bfchain/core-model").CustomTransaction
      >
    >;
    /**解冻资产 */
    unfrozenAsset: BFChainUtil.EventInOut<
      ApplyTransactionUnfrozenAssetEvent<
        "unfrozenAsset",
        | import("@bfchain/core-model").BeExchangeAssetTransaction
        | import("@bfchain/core-model").GrabAssetTransaction
        | import("@bfchain/core-model").TrustAssetTransaction
        | import("@bfchain/core-model").SignForAssetTransaction
        | import("@bfchain/core-model").ToExchangeSpecialAssetTransaction
        | import("@bfchain/core-model").BeExchangeSpecialAssetTransaction
        | import("@bfchain/core-model").CustomTransaction
      >
    >;
    /**发行 dappid */
    issueDAppid: BFChainUtil.EventInOut<
      ApplyTransactionIssueDAppidEvent<
        "issueDAppid",
        | import("@bfchain/core-model").DAppTransaction
        | import("@bfchain/core-model").CustomTransaction
      >
    >;
    /**出售 dappid */
    saleDAppid: BFChainUtil.EventInOut<
      ApplyTransactionSaleDAppidEvent<
        "saleDAppid",
        | import("@bfchain/core-model").ToExchangeSpecialAssetTransaction
        | import("@bfchain/core-model").CustomTransaction
      >
    >;
    /**购买 dappid */
    purchaseDAppid: BFChainUtil.EventInOut<
      ApplyTransactionPurchaseDAppidEvent<
        "purchaseDAppid",
        | import("@bfchain/core-model").BeExchangeSpecialAssetTransaction
        | import("@bfchain/core-model").CustomTransaction
      >
    >;
    /**发行数字资产 */
    issueAsset: BFChainUtil.EventInOut<
      ApplyTransactionIssueAssetEvent<
        "issueAsset",
        | import("@bfchain/core-model").IssueAssetTransaction
        | import("@bfchain/core-model").CustomTransaction
      >
    >;
    /**发行子链 */
    issueSubchain: BFChainUtil.EventInOut<
      ApplyTransactionIssueSubchainEvent<
        "issueSubchain",
        | import("@bfchain/core-model").IssueSubchainTransaction
        | import("@bfchain/core-model").CustomTransaction
      >
    >;
    /**注册链域名 */
    registerLocationName: BFChainUtil.EventInOut<
      ApplyTransactionRegisterLocationNameEvent<
        "registerLocationName",
        | import("@bfchain/core-model").LocationNameTransaction
        | import("@bfchain/core-model").CustomTransaction
      >
    >;
    /**注销链域名 */
    cancelLocationName: BFChainUtil.EventInOut<
      ApplyTransactionCancelLocationNameEvent<
        "cancelLocationName",
        | import("@bfchain/core-model").LocationNameTransaction
        | import("@bfchain/core-model").CustomTransaction
      >
    >;
    /**设置链域名管理员 */
    setLnsManager: BFChainUtil.EventInOut<
      ApplyTransactionSetLnsManagerEvent<
        "setLnsManager",
        | import("@bfchain/core-model").SetLnsManagerTransaction
        | import("@bfchain/core-model").CustomTransaction
      >
    >;
    /**设置链域名解析值 */
    setLnsRecordValue: BFChainUtil.EventInOut<
      ApplyTransactionSetLnsRecordValueEvent<
        "setLnsRecordValue",
        | import("@bfchain/core-model").SetLnsRecordValueTransaction
        | import("@bfchain/core-model").CustomTransaction
      >
    >;
    /**出售链域名 */
    saleLocationName: BFChainUtil.EventInOut<
      ApplyTransactionSaleLocationNameEvent<
        "saleLocationName",
        | import("@bfchain/core-model").ToExchangeSpecialAssetTransaction
        | import("@bfchain/core-model").CustomTransaction
      >
    >;
    /**购买链域名 */
    purchaseLocationName: BFChainUtil.EventInOut<
      ApplyTransactionPurchaseLocationNameEvent<
        "purchaseLocationName",
        | import("@bfchain/core-model").BeExchangeSpecialAssetTransaction
        | import("@bfchain/core-model").CustomTransaction
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
    beforeGenerateBlock: BFChainUtil.EventInOut<import("..").BlockBody>;
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
  } & import("@bfchain/util").QueneEventEmitter<ApplyTransactionEventMap<ES>>;

  //#endregion

  //#region Subchain

  type StatisticWeekMapKey = {
    height: number;
    generatorPublicKey: string;
  };

  type EmergencyDelegateAddressCacheMap = Map<
    number,
    { round: number; delegateAddressList: string[]; times: Map<number, string> }
  >;

  //#region SubChainCenter
  interface ApplyResult_SetSecondPublicKeyJSON {
    type: "setSecondPublicKey";
    applyInfo: {
      address: string;
      publicKey: string;
      secondPublicKey: string;
    };
  }
  interface ApplyResult_SetUsernameJSON {
    type: "setUsername";
    applyInfo: {
      address: string;
      publicKey: string;
      alias: string;
    };
  }
  interface ApplyResult_RegisterToDelegateJSON {
    type: "registerToDelegate";
    applyInfo: {
      address: string;
      publicKey: string;
    };
  }
  interface ApplyResult_AcceptVoteJSON {
    type: "acceptVote";
    applyInfo: {
      address: string;
      publicKey: string;
    };
  }
  interface ApplyResult_RejectVoteJSON {
    type: "rejectVote";
    applyInfo: {
      address: string;
      publicKey: string;
    };
  }
  interface ApplyResult_VoteEquityJSON {
    type: "voteEquity";
    applyInfo: {
      address: string;
      publicKey: string;
      equity: string;
      recipientId: string;
    };
  }
  interface ApplyResult_AssetJSON {
    type: "asset";
    applyInfo: {
      address: string;
      publicKey?: string;
      magic: string;
      assetType: string;
      amount: string;
      action: string;
    };
  }
  interface ApplyResult_DestoryAssetJSON {
    type: "destoryAsset";
    applyInfo: {
      address: string;
      publicKey: string;
      magic: string;
      assetType: string;
      amount: string;
    };
  }
  interface ApplyResult_FrozenAssetJSON {
    type: "frozenAsset";
    applyInfo: {
      address: string;
      publicKey: string;
      magic: string;
      assetType: string;
      amount: string;
      minEffectiveHeight: number;
      maxEffectiveHeight: number;
      totalUnfrozenTimes?: number;
    };
  }
  interface ApplyResult_UnfrozenAssetJSON {
    type: "unfrozenAsset";
    applyInfo: {
      address: string;
      publicKey: string;
      magic: string;
      assetType: string;
      amount: string;
      frozenId: string;
      recipientId: string;
    };
  }

  interface ApplyResult_FrozenAccountJSON {
    type: "frozenAccount";
    applyInfo: {
      address: string;
      publicKey: string;
      accountStatus: ACCOUNT_STATUS;
    };
  }

  interface ApplyResult_IssueDAppidJSON {
    type: "issueDAppid";
    applyInfo: {
      address: string;
      publicKey: string;
      sourceChainName: string;
      sourceChainMagic: string;
      dappid: string;
      possessorAddress: string;
      type: DAPP_TYPE;
      purchaseAsset?: DAppPurchaseAssetJSON;
    };
  }

  interface ApplyResult_SaleDAppidJSON {
    type: "saleDAppid";
    applyInfo: {
      address: string;
      publicKey: string;
      dappid: string;
      sourceChainMagic: string;
      minEffectiveHeight: number;
      maxEffectiveHeight: number;
    };
  }

  interface ApplyResult_PurchaseDAppidJSON {
    type: "purchaseDAppid";
    applyInfo: {
      address: string;
      publicKey: string;
      dappid: string;
      possessorAddress: string;
      sourceChainMagic: string;
    };
  }

  interface ApplyResult_IssueAssetJSON {
    type: "issueAsset";
    applyInfo: {
      address: string;
      publicKey: string;
      applyAddress: string;
      sourceChainName: string;
      sourceChainMagic: string;
      assetType: string;
      genesisAddress: string;
      expectedIssuedAssets: string;
      remainAssets: string;
    };
  }

  interface ApplyResult_IssueSubchainJSON {
    type: "issueSubchain";
    applyInfo: {
      address: string;
      publicKey: string;
      chainName: string;
      assetType: string;
      magic: string;
      bnid: string;
      maxTPSPerBlock: number;
      blockPerRound: number;
      delegates: number;
      genesisBlock: BlockJSON<GenesisBlockRemarkJSON>;
    };
  }

  interface ApplyResult_RegisterLocationNameJSON {
    type: "registerLocationName";
    applyInfo: {
      address: string;
      publicKey: string;
      name: string;
      sourceChainName: string;
      sourceChainMagic: string;
    };
  }

  interface ApplyResult_CancelLocationNameJSON {
    type: "cancelLocationName";
    applyInfo: {
      address: string;
      publicKey: string;
      name: string;
      sourceChainMagic: string;
    };
  }

  interface ApplyResult_SetLnsManagerJSON {
    type: "setLnsManager";
    applyInfo: {
      address: string;
      publicKey: string;
      name: string;
      sourceChainMagic: string;
      manager: string;
    };
  }

  interface ApplyResult_SetLnsRecordValueJSON {
    type: "setLnsRecordValue";
    applyInfo: {
      address: string;
      publicKey: string;
      name: string;
      sourceChainMagic: string;
      operationType: RECORD_OPERATION_TYPE;
      addRecord?: LocationNameRecordJSON;
      deleteRecord?: LocationNameRecordJSON;
    };
  }

  interface ApplyResult_SaleLocationNameJSON {
    type: "saleLocationName";
    applyInfo: {
      address: string;
      publicKey: string;
      name: string;
      sourceChainMagic: string;
      minEffectiveHeight: number;
      maxEffectiveHeight: number;
    };
  }

  interface ApplyResult_PurchaseLocationNameJSON {
    type: "purchaseLocationName";
    applyInfo: {
      address: string;
      publicKey: string;
      possessorAddress: string;
      name: string;
      sourceChainMagic: string;
    };
  }

  type ApplyResultJSON =
    | ApplyResult_SetSecondPublicKeyJSON
    | ApplyResult_SetUsernameJSON
    | ApplyResult_RegisterToDelegateJSON
    | ApplyResult_AcceptVoteJSON
    | ApplyResult_RejectVoteJSON
    | ApplyResult_VoteEquityJSON
    | ApplyResult_AssetJSON
    | ApplyResult_DestoryAssetJSON
    | ApplyResult_FrozenAssetJSON
    | ApplyResult_UnfrozenAssetJSON
    | ApplyResult_FrozenAccountJSON
    | ApplyResult_IssueDAppidJSON
    | ApplyResult_SaleDAppidJSON
    | ApplyResult_PurchaseDAppidJSON
    | ApplyResult_IssueAssetJSON
    | ApplyResult_IssueSubchainJSON
    | ApplyResult_RegisterLocationNameJSON
    | ApplyResult_CancelLocationNameJSON
    | ApplyResult_SetLnsManagerJSON
    | ApplyResult_SetLnsRecordValueJSON
    | ApplyResult_SaleLocationNameJSON
    | ApplyResult_PurchaseLocationNameJSON;

  interface CustomTrCenterInterface {
    verify(
      body: TxBodyJSON,
      customAsset: CustomAssetJSON,
      config: import("./configHelper").ConfigHelper,
    ): { ret: boolean; message?: string };
    apply(
      tx: BFChainCore.Transaction,
      config: import("./configHelper").ConfigHelper,
    ): ApplyResultJSON[];
    logicVerify(tx: BFChainCore.Transaction): Promise<{ ret: boolean; message?: string }>;
  }

  interface AccountApiInterface {
    getAccountUsername(address: string): Promise<string | undefined>;
    getAccountIsDelegate(address: string): Promise<number>;
    getAccountIsAcceptVote(address: string): Promise<number>;
    getAccountSecondPublicKey(address: string): Promise<string | undefined>;
    getAccountMissedBlocks(address: string): Promise<number>;
    getAccountProducedBlocks(address: string): Promise<number>;
    getAccountStatus(address: string): Promise<number>;
    getAccountVote(address: string): Promise<string>;
    getAccountEquityInfo(
      address: string,
    ): Promise<{
      round: number;
      equity: string;
    }>;
    getAccountAsset(address: string, magic: string, assetType: string): Promise<string>;
  }

  interface TransactionApiInterface {
    // FIXME: remove
    getTransactionByTransactionSignature(transactionSignature: string): Promise<TransactionJSON>;
    // FIXME: remove
    getTransactionBySenderIdAndType(
      senderId: string,
      type?: string,
      limit?: number,
      offset?: number,
    ): Promise<TransactionJSON[]>;
    // FIXME: remove
    getTransactionByRecipientIdAndType(
      recipientId: string,
      type?: string,
      limit?: number,
      offset?: number,
    ): Promise<TransactionJSON[]>;
    getTransactionByQueryOptions(
      queryOptions: TransactionQueryOptionsJSON,
    ): Promise<TransactionInBlockJSON[]>;
  }

  interface BlockApiInterface {
    getLastBlockHeight(): Promise<number>;
    getBlockByBlockHeight(blockHeight: number): Promise<BlockJSON<any>>;
    getBlockByBlockSignature(blockSignature: string): Promise<BlockJSON<any>>;
    getBlockByBlocksGenerator(
      generatorPublicKey: string,
      limit?: number,
      offset?: number,
    ): Promise<BlockJSON<any>>;
  }

  interface BFChainApiInterface {
    readonly api: {
      readonly blockApi: BlockApiInterface;
      readonly accountApi: AccountApiInterface;
      readonly transactionApi: TransactionApiInterface;
      readonly configHelper: import("@bfchain/core-helper").ConfigHelper;
    };
  }
  //#endregion
}
