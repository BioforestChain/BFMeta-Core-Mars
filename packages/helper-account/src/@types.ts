declare namespace BFChainCore {
  type EntityHolderInfo = {
    address: string;
    numberOfShareEntities: number;
  };
  type AccountInfo = {
    address: string;
    publicKey: string;
    secondPublicKey?: string;
    accountStatus: number;
    numberOfForgeEntities: number;
    numberOfShareEntities: number;
    assets: AccountAssets;
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
  type DAppInfo = {
    dappid: string;
    possessorAddress: string;
    sourceChainName: string;
    sourceChainMagic: string;
    type: number;
    height: number;
    status: number;
    maxFrozenBlockHeight: number;
    purchaseAsset?: string;
    frozenId: string;
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
    type: string;
    level: number;
    height: number;
    status: number;
    maxFrozenBlockHeight: number;
    isDelete?: boolean;
    frozenId: string;
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
    remainAssetPrealnum: bigint;
    circulatedAssetPrealnum: bigint;
    frozenMainAssetPrealnum: bigint;
    height: number;
  };

  type ChainInfo = {
    genesisBlock: BFChainCore.RegisterChainBlockInfoJSON;
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

  type AccountBaseInfo = {
    address: string;
    publicKey: string;
    numberOfForgeEntities: number;
    numberOfShareEntities: number;
    producedblocks: number;
  };
  type ForSortAccountInfo = AccountBaseInfo;

  type CurrencyInfo = {
    name: string;
    height: number;
  };

  type MagicInfo = {
    magic: string;
    height: Number;
  };

  type IssueEntityFactoryInfo = {
    applyAddress: string;
    possessorAddress: string;
    sourceChainName: string;
    sourceChainMagic: string;
    factoryId: string;
    entityPrealnum: bigint;
    remainEntityPrealnum: bigint;
    destroyedEntityPrealnum: bigint;
    entityFrozenAssetPrealnum: string;
    purchaseAssetPrealnum: string;
    height: number;
    status: number;
    maxFrozenBlockHeight: number;
  };

  type IssueEntityInfo = {
    issueId: string;
    applyAddress: string;
    possessorAddress: string;
    sourceChainName: string;
    sourceChainMagic: string;
    factoryId: string;
    entityId: string;
    entityFrozenAssetPrealnum: string;
    height: number;
    status: number;
    maxFrozenBlockHeight: number;
    taxAssetPrealnum: string;
    frozenId: string;
  };

  type MigrateCertificateInfo = {
    migrateCertificateId: string;
    height: number;
  };

  type IssueCertificateInfo = {
    issueId: string;
    applyAddress: string;
    possessorAddress: string;
    sourceChainName: string;
    sourceChainMagic: string;
    certificateId: string;
    type: BFChainCore.CERTIFICATE_TYPE;
    height: number;
    status: number;
    maxFrozenBlockHeight: number;
    frozenId: string;
  };

  type AccountsAssetsChange = {
    [magic: string]: {
      [address: string]: {
        [assetType: string]: string;
      };
    };
  };

  interface AccountGetterHelperInterface<
    ABI extends AccountBaseInfo = AccountBaseInfo,
    FSAI extends BFChainCore.ForSortAccountInfo = BFChainCore.ForSortAccountInfo,
    AI extends AccountInfo = AccountInfo,
    DI extends DAppInfo = DAppInfo,
    LNI extends LocationNameInfo = LocationNameInfo,
    FA extends FrozenAsset = FrozenAsset,
    IAI extends IssuedAssetInfo = IssuedAssetInfo,
    CI extends CurrencyInfo = CurrencyInfo,
    MG extends MagicInfo = MagicInfo,
    IEFI extends IssueEntityFactoryInfo = IssueEntityFactoryInfo,
    IEI extends IssueEntityInfo = IssueEntityInfo,
    MCI extends MigrateCertificateInfo = MigrateCertificateInfo,
    ICI extends IssueCertificateInfo = IssueCertificateInfo,
    EHI extends EntityHolderInfo = EntityHolderInfo,
  > {
    /**根据地址数组获取账户 */
    getAccounts(addressArr: string[], curRound: number): Promise<FSAI[]>;
    /**获取准备下一轮上榜的锻造者 */
    getNextRoundGenerators(): Promise<FSAI[]>;
    /**获取准备计算的锻造者 */
    getGenerators(currentGeneraterPublicKeyList: (Uint8Array | string)[]): Promise<ABI[]>;
    /**获取账户信息 */
    getAccountInfo(address: string, currentBlockHeight: number): Promise<AI | undefined>;
    /**获取账户的块内交易 */
    getAccountTxCountInBlock(address: string): Promise<number | undefined>;
    /**获取指定的 dapp */
    getDApp(
      sourceChainMagic: string,
      dappid: string,
      currentBlockHeight: number,
    ): Promise<DI | undefined>;
    /**是否是某个的 dappid 的持有者 */
    isDAppPossessor(sourceChainMagic: string, address: string): Promise<boolean>;
    /**查询指定的 LocationName */
    getLocationName(
      sourceChainMagic: string,
      locationName: string,
      currentBlockHeight: number,
    ): Promise<LNI | undefined>;
    /**是否持有或关联指定的位名 */
    isLocationNamePossessor(sourceChainMagic: string, address: string): Promise<boolean>;
    /**指定位名是否存在子位名 */
    isSubLocationNameExist(sourceChainMagic: string, endsWith: string): Promise<boolean>;
    /**位名是否被禁用 */
    isLocationNameForbidden(locationName: string): Promise<boolean>;
    /**查询冻结的资产 */
    getFrozenAsset(address: string, signature: string, assetType: string): Promise<FA | undefined>;
    /**账户是否持有冻结的非主权益 */
    isPossessFrozenAssetExceptMain(address: string): Promise<boolean>;
    /**是否冻结权益 */
    isFrozenAsset(address: string): Promise<boolean>;
    /**查询指定的数字资产 */
    getAsset(magic: string, assetType: string): Promise<IAI | undefined>;
    /**查询指定的资产名 */
    getCurrency(currencyName: string): Promise<CI | undefined>;
    /**资产名是否被禁用 */
    isCurrencyForbidden(assetType: string): Promise<boolean>;
    /**查询指定的 magic */
    getMagic(magic: string): Promise<MG | undefined>;
    /**查询指定的链 */
    getChain(magic: string): Promise<ChainInfo | undefined>;
    /**查询迁移凭证 */
    getMigrateCertificate(migrateCertificateId: string): Promise<MCI | undefined>;
    /**查询指定的 factoryId */
    getEntityFactory(
      sourceChainMagic: string,
      factoryId: string,
      currentBlockHeight: number,
    ): Promise<IEFI | undefined>;
    /**查询指定的 entityId */
    getEntity(
      sourceChainMagic: string,
      entityId: string,
      currentBlockHeight: number,
    ): Promise<IEI | undefined>;
    /**指定账户是否持有某个 entityFactory */
    isEntityFactoryPossessor(sourceChainMagic: string, address: string): Promise<boolean>;
    /**指定账户是否持有某个 entity */
    isEntityPossessor(sourceChainMagic: string, address: string): Promise<boolean>;
    /**查询指定的 certificateId */
    getCertificate(
      sourceChainMagic: string,
      certificateId: string,
      currentBlockHeight: number,
    ): Promise<ICI | undefined>;
    /**指定账户是否发行或者持有某个 certificate */
    isCertApplicantOrPossessor(sourceChainMagic: string, address: string): Promise<boolean>;
    /**
     * 根据高度获取区块的资产变动信息
     *
     * @param height
     */
    getAccountsAssetsChange(height: number): Promise<BFChainCore.AccountsAssetsChange>;
    /**获取 锻造entity 持有者 按照持有量sort */
    getForgeEntityHolders(offset?: number): Promise<AI[]>;
    /**获取 分红entity 持有者 按照持有量sort */
    getShareEntityHolders(offset?: number): Promise<EHI[]>;
  }
}
