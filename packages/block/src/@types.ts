declare namespace BFChainCore {
  // #region
  type BlockFactory<T extends Block> = import("./atom_block/_blockbase").BlockFactory<T>;
  type BlockFactoryConstructor<T extends Block = any> = new (...args: any[]) => BlockFactory<T>;
  // #endregion
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
}
