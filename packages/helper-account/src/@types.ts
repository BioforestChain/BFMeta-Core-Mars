declare namespace BFChainCore {
  type AccountInfo = {
    address: string;
    publicKey?: string;
    username?: string;
    secondPublicKey?: string;
    accountStatus: number;
    isDelegate: boolean;
    isAcceptVote: boolean;
    voteInfo: {
      round: number;
      vote: bigint;
    };
    equityInfo: {
      round: number;
      equity: bigint;
      fixedEquity: bigint;
    };
    lastRoundInfo: {
      round: number;
      assetNumber: bigint;
      txCount: number;
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
    issuedAssetPrealnum: bigint;
    frozenMainAssetPrealnum: bigint;
    remainAssetPrealnum: bigint;
    height: number;
  };

  type ChainInfo = {
    genesisBlock: BlockJSON<GenesisBlockAssetJSON>;
    height: number;
  };

  interface FrozenAssetBaseInfo extends FrozenAssetInfo {
    transactionSignature: string;
    address: string;
    minEffectiveHeight: number;
    maxEffectiveHeight: number;
    blockSignature?: string;
    remainUnfrozenTimes?: number;
  }

  interface FrozenAsset extends FrozenAssetBaseInfo {
    height: number;
  }
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
    isAcceptVote: boolean;
  };

  interface AccountGetterHelperInterface<
    ABI extends AccountBaseInfo = AccountBaseInfo,
    FSAI extends BFChainCore.ForSortAccountInfo = BFChainCore.ForSortAccountInfo,
    AI extends AccountInfo = AccountInfo,
    AA extends AccountAssets = AccountAssets,
    AIAA extends AccountInfoAndAssets = AccountInfoAndAssets,
    DI extends DAppInfo = DAppInfo,
    LNI extends LocationNameInfo = LocationNameInfo,
    FA extends FrozenAsset = FrozenAsset,
    IAI extends IssuedAssetInfo = IssuedAssetInfo
  > {
    /**根据地址数组获取账户 */
    getAccounts(addressArr: string[], curRound: number): Promise<FSAI[]>;
    /**获取准备下一轮上榜的受托人 */
    getNextRoundDelegates(): Promise<FSAI[]>;
    /**获取准备计算的受托人 */
    getDelegates(currentGeneraterPublicKeyList: (Uint8Array | string)[]): Promise<ABI[]>;
    /**获取全新的受托人账户(在线率 100%)  */
    getNewDelegates(limit: number, height: number): Promise<FSAI[]>;
    /**获取账户信息 */
    getAccountInfo(address: string): Promise<AI | undefined>;
    /**获取账户的块内交易 */
    getAccountTxCountInBlock(address: string): Promise<number | undefined>;
    /**获取账户资产信息 */
    getAccountAssets(address: string, currentBlockHeight: number): Promise<AA | undefined>;
    /**获取账户信息和账户资产信息 */
    getAccountInfoAndAssets(address: string, currentBlockHeight: number): Promise<AIAA | undefined>;
    /**获取指定的 dapp */
    getDApp(
      sourceChainMagic: string,
      dappid: string,
      currentBlockHeight: number,
    ): Promise<DI | undefined>;
    /**某个账户是否是某个的 dappid 的持有者 */
    isDAppPossessor(sourceChainMagic: string, address: string): Promise<boolean>;
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
    ): Promise<LNI | undefined>;
    /**指定账户是否持有或关联指定的域名 */
    isLocationNamePossessor(sourceChainMagic: string, address: string): Promise<boolean>;
    /**指定域名是否存在子域名 */
    isSubLocationNameExist(sourceChainMagic: string, endsWith: string): Promise<boolean>;
    /**链域名是否被禁用 */
    isLocationNameForbidden(name: string): Promise<boolean>;
    /**查询冻结的资产 */
    getFrozenAsset(address: string, signature: string): Promise<FA | undefined>;
    /**账户是否持有冻结的非主权益 */
    isPossessFrozenAssetExceptMain(address: string): Promise<number>;
    /**查询指定的数字资产 */
    getAsset(magic: string, assetType: string): Promise<IAI | undefined>;
    /**查询指定的资产名 */
    getCurrency(assetType: string): Promise<number | undefined>;
    /**资产名是否被禁用 */
    isCurrencyForbidden(assetType: string): Promise<boolean>;
    /**查询指定的链 */
    getChain(magic: string): Promise<ChainInfo | undefined>;
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
    /**获取某个账户的投票信息 */
    getAccountVoteInfo(height: number, address: string): Promise<string[]>;
    /**获取矿机中的受托人账户 */
    getMemoryDelegates(): Promise<string[]>;
  }
}
