declare namespace BFChainCore {
  type AccountInfo = {
    address: string;
    publicKey?: string;
    vote: bigint;
    username?: string;
    secondPublicKey?: string;
    accountStatus: number;
    isDelegate: boolean;
    isAcceptVote: boolean;
    fixedEquityInfo: {
      round: number;
      equity: bigint;
    };
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

  type ChainInfo = {
    genesisBlock: BlockJSON<GenesisBlockRemarkJSON>;
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

  interface AccountGetterHelperInterface {
    /**根据地址数组获取账户 */
    getAccounts<T extends AccountBaseInfo = AccountBaseInfo>(addressArr: string[]): Promise<T[]>;
    /** 获取准备下一轮上榜的受托人 */
    getNextRoundDelegates<T extends AccountBaseInfo = AccountBaseInfo>(): Promise<T[]>;
    /** 获取准备计算的受托人 */
    getDelegates<T extends AccountBaseInfo = AccountBaseInfo>(
      currentGeneraterPublicKeyList: (Uint8Array | string)[],
    ): Promise<T[]>;
    /**获取账户信息 */
    getAccountInfo<T extends AccountInfo = AccountInfo>(address: string): Promise<T | undefined>;
    /**获取账户的块内交易 */
    getAccountTxCountInBlock(address: string): Promise<number | undefined>;
    /**获取账户资产信息 */
    getAccountAssets<T extends AccountAssets = AccountAssets>(
      address: string,
    ): Promise<T | undefined>;
    /**获取账户信息和账户资产信息 */
    getAccountInfoAndAssets<T extends AccountInfoAndAssets = AccountInfoAndAssets>(
      address: string,
    ): Promise<T | undefined>;
    /**获取指定的 dapp */
    getDApp<T extends DAppInfo = DAppInfo>(
      sourceChainMagic: string,
      dappid: string,
      currentBlockHeight: number,
    ): Promise<T | undefined>;
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
    getLocationName<T extends LocationNameInfo = LocationNameInfo>(
      sourceChainMagic: string,
      locationName: string,
      currentBlockHeight: number,
    ): Promise<T | undefined>;
    /**指定账户是否持有或关联指定的域名 */
    isLocationNamePossessor(sourceChainMagic: string, address: string): Promise<boolean>;
    /**指定域名是否存在子域名 */
    isSubLocationNameExist(sourceChainMagic: string, endsWith: string): Promise<boolean>;
    /**链域名是否被禁用 */
    isLocationNameForbidden(name: string): Promise<boolean>;
    /**查询冻结的资产 */
    getFrozenAsset<T extends FrozenAsset = FrozenAsset>(
      address: string,
      signature: string,
    ): Promise<T | undefined>;
    /**查询指定的数字资产 */
    getAsset<T extends IssuedAssetInfo = IssuedAssetInfo>(
      magic: string,
      assetType: string,
    ): Promise<T | undefined>;
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
    /**重置受托人获得的权益 */
    resetDelegateVote(height: number): Promise<void>;
    /**获取某个账户的投票信息 */
    getAccountVoteInfo(height: number, address: string): Promise<string[]>;
    /**获取矿机中的受托人账户 */
    getMemoryDelegates(): Promise<string[]>;
  }
}
