declare namespace BFChainCore {
  //#region ChannelHelper
  type BroadcastNewTransactionEvents<DH extends import("./atom_channel").ChainChannel> = {
    startBroadcasting: BFChainUtil.EventInOut<{ chainChannelList: DH[] }, { break: boolean }>;
    broadcasted: BFChainUtil.EventInOut<
      {
        error: boolean;
        result: import("@bfchain/core-model-channel").NewTransactionReturnModel | Error;
        chainChannel: DH;
      },
      { break: boolean }
    >;
    endBroadcast: BFChainUtil.EventInOut<{ duraction: number }, any>;
  };
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
    | Omit<BFChainCore.NewBlockArgJSON, "blockId">
    | Omit<BlockPlotChecker, "blockId">;

  interface BlockGetterHelperInterface<
    CC extends import("./atom_channel").ChainChannel = import("./atom_channel").ChainChannel
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
          chainChannelGroup?: import("../src/atom_channel").ChainChannelGroup<CC>;
        }
      | undefined
    >;
    /**记录链区块分叉信息 */
    chainBlockFork?(block: BFChainCore.Block, cause: number): Promise<void>;
    /**获取新一轮的打块受托人 */
    getNewForgingDelegates?(
      lastBlock: LastBlockInfo,
      currentGeneraterPublicKey: string,
    ): Promise<BFChainCore.AccountBaseInfo[]>;
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
    CC extends import("./atom_channel").ChainChannel = import("./atom_channel").ChainChannel
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

  type AccountBaseInfo = {
    productivity: number;
    address: string;
    publicKey: string;
    vote: bigint;
  };

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
  // #endregion

  // #region TransactionGetterHelperInterface
  interface TransactionGetterHelperInterface<
    CC extends import("./atom_channel").ChainChannel = import("./atom_channel").ChainChannel
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
  // #endregion
}
