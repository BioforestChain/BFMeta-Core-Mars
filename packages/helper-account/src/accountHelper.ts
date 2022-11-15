import { Injectable, Inject } from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
const { NoFoundException } = CoreExceptionGenerator("helper-account", "accountHelper");

@Injectable()
export class AccountHelper<
  ABI extends BFChainCore.AccountBaseInfo = BFChainCore.AccountBaseInfo,
  FSAI extends BFChainCore.ForSortAccountInfo = BFChainCore.ForSortAccountInfo,
  AI extends BFChainCore.AccountInfo = BFChainCore.AccountInfo,
  AA extends BFChainCore.AccountAssets = BFChainCore.AccountAssets,
  AIAA extends BFChainCore.AccountInfoAndAssets = BFChainCore.AccountInfoAndAssets,
  DI extends BFChainCore.DAppInfo = BFChainCore.DAppInfo,
  LNI extends BFChainCore.LocationNameInfo = BFChainCore.LocationNameInfo,
  FA extends BFChainCore.FrozenAsset = BFChainCore.FrozenAsset,
  IAI extends BFChainCore.IssuedAssetInfo = BFChainCore.IssuedAssetInfo,
  CI extends BFChainCore.CurrencyInfo = BFChainCore.CurrencyInfo,
  MG extends BFChainCore.MagicInfo = BFChainCore.MagicInfo,
  ALI extends BFChainCore.AliasInfo = BFChainCore.AliasInfo,
  IEFI extends BFChainCore.IssueEntityFactoryInfo = BFChainCore.IssueEntityFactoryInfo,
  IEI extends BFChainCore.IssueEntityInfo = BFChainCore.IssueEntityInfo,
  MCI extends BFChainCore.MigrateCertificateInfo = BFChainCore.MigrateCertificateInfo,
> {
  @Inject("accountGetterHelper", { optional: true })
  private accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<
    ABI,
    FSAI,
    AI,
    AA,
    AIAA,
    DI,
    LNI,
    FA,
    IAI,
    CI,
    MG,
    ALI,
    IEFI,
    IEI,
    MCI
  >;

  getAccounts(
    addressArr: string[],
    currentBlockHeight: number,
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getAccounts"
    >,
  ) {
    if (!accountGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
      });
    }
    return accountGetterHelper.getAccounts(addressArr, currentBlockHeight);
  }

  getNextRoundDelegates<T extends BFChainCore.ForSortAccountInfo = BFChainCore.ForSortAccountInfo>(
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getNextRoundDelegates"
    >,
  ) {
    if (!accountGetterHelper) {
      if (!accountGetterHelper) {
        throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
          prop: "accountGetterHelper",
          target: "moduleStroge",
        });
      }
    }
    return accountGetterHelper.getNextRoundDelegates() as Promise<T[]>;
  }
  getDelegates(
    currentGeneraterPublicKeyList: (string | Uint8Array)[],
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getDelegates"
    >,
  ) {
    if (!accountGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
      });
    }
    return accountGetterHelper.getDelegates(currentGeneraterPublicKeyList);
  }
  getAccountInfo(
    address: string,
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getAccountInfo"
    >,
  ): Promise<BFChainCore.AccountInfo | undefined> {
    if (!accountGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
      });
    }
    return accountGetterHelper.getAccountInfo(address);
  }
  getAccountTxCountInBlock(
    address: string,
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getAccountTxCountInBlock"
    >,
  ): Promise<number | undefined> {
    if (!accountGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
      });
    }
    return accountGetterHelper.getAccountTxCountInBlock(address);
  }
  getAccountAssets(
    address: string,
    currentBlockHeight: number,
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getAccountAssets"
    >,
  ): Promise<BFChainCore.AccountAssets | undefined> {
    if (!accountGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
      });
    }
    return accountGetterHelper.getAccountAssets(address, currentBlockHeight);
  }
  getAccountInfoAndAssets(
    address: string,
    currentBlockHeight: number,
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getAccountInfoAndAssets"
    >,
  ): Promise<BFChainCore.AccountInfoAndAssets | undefined> {
    if (!accountGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
      });
    }
    return accountGetterHelper.getAccountInfoAndAssets(address, currentBlockHeight);
  }
  getDApp(
    sourceChainMagic: string,
    dappid: string,
    currentBlockHeight: number,
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getDApp"
    >,
  ): Promise<BFChainCore.DAppInfo | undefined> {
    if (!accountGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
      });
    }
    return accountGetterHelper.getDApp(sourceChainMagic, dappid, currentBlockHeight);
  }
  isDAppPossessor(
    sourceChainMagic: string,
    address: string,
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "isDAppPossessor"
    >,
  ): Promise<boolean> {
    if (!accountGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
      });
    }
    return accountGetterHelper.isDAppPossessor(sourceChainMagic, address);
  }
  isVoteForDelegate(
    address: string,
    delegate: string,
    round: number,
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "isVoteForDelegate"
    >,
  ): Promise<boolean> {
    if (!accountGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
      });
    }
    return accountGetterHelper.isVoteForDelegate(address, delegate, round);
  }
  getLocationName(
    sourceChainMagic: string,
    locationName: string,
    currentBlockHeight: number,
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getLocationName"
    >,
  ): Promise<BFChainCore.LocationNameInfo | undefined> {
    if (!accountGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
      });
    }
    return accountGetterHelper.getLocationName(sourceChainMagic, locationName, currentBlockHeight);
  }
  isLocationNamePossessor(
    sourceChainMagic: string,
    address: string,
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "isLocationNamePossessor"
    >,
  ): Promise<boolean> {
    if (!accountGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
      });
    }
    return accountGetterHelper.isLocationNamePossessor(sourceChainMagic, address);
  }
  isSubLocationNameExist(
    sourceChainMagic: string,
    endsWith: string,
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "isSubLocationNameExist"
    >,
  ): Promise<boolean> {
    if (!accountGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
      });
    }
    return accountGetterHelper.isSubLocationNameExist(sourceChainMagic, endsWith);
  }
  isLocationNameForbidden(
    name: string,
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "isLocationNameForbidden"
    >,
  ): Promise<boolean> {
    if (!accountGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
      });
    }
    return accountGetterHelper.isLocationNameForbidden(name);
  }
  getFrozenAsset(
    address: string,
    frozenId: string,
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getFrozenAsset"
    >,
  ): Promise<BFChainCore.FrozenAsset | undefined> {
    if (!accountGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
      });
    }
    return accountGetterHelper.getFrozenAsset(address, frozenId);
  }
  getAsset(
    magic: string,
    assetType: string,
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getAsset"
    >,
  ): Promise<BFChainCore.IssuedAssetInfo | undefined> {
    if (!accountGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
      });
    }
    return accountGetterHelper.getAsset(magic, assetType);
  }
  getCurrency(
    assetType: string,
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getCurrency"
    >,
  ): Promise<BFChainCore.CurrencyInfo | undefined> {
    if (!accountGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
      });
    }
    return accountGetterHelper.getCurrency(assetType);
  }
  isCurrencyForbidden(
    assetType: string,
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "isCurrencyForbidden"
    >,
  ): Promise<boolean> {
    if (!accountGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
      });
    }
    return accountGetterHelper.isCurrencyForbidden(assetType);
  }
  getMagic(
    magic: string,
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getMagic"
    >,
  ): Promise<BFChainCore.MagicInfo | undefined> {
    if (!accountGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
      });
    }
    return accountGetterHelper.getMagic(magic);
  }
  getChain(
    magic: string,
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getChain"
    >,
  ): Promise<BFChainCore.ChainInfo | undefined> {
    if (!accountGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
      });
    }
    return accountGetterHelper.getChain(magic);
  }
  getAlias(
    alias: string,
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getAlias"
    >,
  ): Promise<BFChainCore.AliasInfo | undefined> {
    if (!accountGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
      });
    }
    return accountGetterHelper.getAlias(alias);
  }
  getMigrateCertificate(
    migrateCertificateId: string,
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getMigrateCertificate"
    >,
  ): Promise<BFChainCore.MigrateCertificateInfo | undefined> {
    if (!accountGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
      });
    }
    return accountGetterHelper.getMigrateCertificate(migrateCertificateId);
  }
  mergeAccountMissedBlock(
    height: number,
    accountAccumulation: BFChainCore.AccountAccumulationInfo,
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "mergeAccountMissedBlock"
    >,
  ): Promise<void> {
    if (!accountGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
      });
    }
    return accountGetterHelper.mergeAccountMissedBlock(height, accountAccumulation);
  }
  mergeAccountEquity(
    height: number,
    accountEquity: BFChainCore.AccountEquityInfo,
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "mergeAccountEquity"
    >,
  ): Promise<void> {
    if (!accountGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
      });
    }
    return accountGetterHelper.mergeAccountEquity(height, accountEquity);
  }
  getAccountVoteInfo(
    height: number,
    address: string,
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getAccountVoteInfo"
    >,
  ): Promise<string[]> {
    if (!accountGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
      });
    }
    return accountGetterHelper.getAccountVoteInfo(height, address);
  }
  getMemoryDelegates(
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getMemoryDelegates"
    >,
  ): Promise<string[]> {
    if (!accountGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
      });
    }
    return accountGetterHelper.getMemoryDelegates();
  }
}
