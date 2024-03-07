import { Injectable, Inject } from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
const { NoFoundException } = CoreExceptionGenerator("helper-account", "accountHelper");

@Injectable()
export class AccountHelper<
  ABI extends BFChainCore.AccountBaseInfo = BFChainCore.AccountBaseInfo,
  FSAI extends BFChainCore.ForSortAccountInfo = BFChainCore.ForSortAccountInfo,
  AI extends BFChainCore.AccountInfo = BFChainCore.AccountInfo,
  DI extends BFChainCore.DAppInfo = BFChainCore.DAppInfo,
  LNI extends BFChainCore.LocationNameInfo = BFChainCore.LocationNameInfo,
  FAI extends BFChainCore.FrozenAssetInfo = BFChainCore.FrozenAssetInfo,
  IAI extends BFChainCore.IssuedAssetInfo = BFChainCore.IssuedAssetInfo,
  CI extends BFChainCore.CurrencyInfo = BFChainCore.CurrencyInfo,
  MG extends BFChainCore.MagicInfo = BFChainCore.MagicInfo,
  IEFI extends BFChainCore.IssueEntityFactoryInfo = BFChainCore.IssueEntityFactoryInfo,
  IEI extends BFChainCore.IssueEntityInfo = BFChainCore.IssueEntityInfo,
  MCI extends BFChainCore.MigrateCertificateInfo = BFChainCore.MigrateCertificateInfo,
  ICI extends BFChainCore.IssueCertificateInfo = BFChainCore.IssueCertificateInfo,
  EHI extends BFChainCore.EntityHolderInfo = BFChainCore.EntityHolderInfo,
  SAI extends BFChainCore.StakeAssetInfo = BFChainCore.StakeAssetInfo,
> {
  @Inject("accountGetterHelper", { optional: true })
  private accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<
    ABI,
    FSAI,
    AI,
    DI,
    LNI,
    FAI,
    IAI,
    CI,
    MG,
    IEFI,
    IEI,
    MCI,
    ICI,
    EHI,
    SAI
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

  getNextRoundGenerators<T extends BFChainCore.ForSortAccountInfo = BFChainCore.ForSortAccountInfo>(
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getNextRoundGenerators"
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
    return accountGetterHelper.getNextRoundGenerators() as Promise<T[]>;
  }

  getAccountInfo(
    address: string,
    currentBlockHeight: number,
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
    return accountGetterHelper.getAccountInfo(address, currentBlockHeight);
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
    assetType: string,
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getFrozenAsset"
    >,
  ): Promise<BFChainCore.FrozenAssetInfo | undefined> {
    if (!accountGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
      });
    }
    return accountGetterHelper.getFrozenAsset(address, frozenId, assetType);
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
}
