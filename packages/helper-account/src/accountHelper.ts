import { Injectable, Inject } from "@bfchain/util";
import { CoreExceptionGenerator, NOT_EXIST } from "@bfchain/core-util-exception";
const { NoFoundException } = CoreExceptionGenerator("helper-account", "accountHelper");

@Injectable()
export class AccountHelper {
  @Inject("accountGetterHelper", { optional: true })
  private accountGetterHelper?: BFChainCore.AccountGetterHelperInterface;

  getAccounts<T extends BFChainCore.AccountBaseInfo>(
    addressArr: string[],
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getAccounts"
    >,
  ): Promise<T[]> {
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        function: "AccountHelper.getAccounts",
      });
    }
    return accountGetterHelper.getAccounts<T>(addressArr);
  }

  getNextRoundDelegates<T extends BFChainCore.AccountBaseInfo>(
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getNextRoundDelegates"
    >,
  ): Promise<T[]> {
    if (!accountGetterHelper) {
      if (!accountGetterHelper) {
        throw new NoFoundException(NOT_EXIST, {
          prop: "accountGetterHelper",
          target: "moduleStroge",
          function: "AccountHelper.getNextRoundDelegates",
        });
      }
    }
    return accountGetterHelper.getNextRoundDelegates<T>();
  }
  getDelegates<T extends BFChainCore.AccountBaseInfo>(
    currentGeneraterPublicKeyList: (string | Uint8Array)[],
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getDelegates"
    >,
  ): Promise<T[]> {
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        function: "AccountHelper.getAccounts",
      });
    }
    return accountGetterHelper.getDelegates<T>(currentGeneraterPublicKeyList);
  }
  getAccountInfo<T extends BFChainCore.AccountInfo>(
    address: string,
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getAccountInfo"
    >,
  ): Promise<BFChainCore.AccountInfo | undefined> {
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        function: "AccountHelper.getAccounts",
      });
    }
    return accountGetterHelper.getAccountInfo<T>(address);
  }
  getAccountTxCountInBlock(
    address: string,
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getAccountTxCountInBlock"
    >,
  ): Promise<number | undefined> {
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        function: "AccountHelper.getAccounts",
      });
    }
    return accountGetterHelper.getAccountTxCountInBlock(address);
  }
  getAccountAssets<T extends BFChainCore.AccountAssets>(
    address: string,
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getAccountAssets"
    >,
  ): Promise<BFChainCore.AccountAssets | undefined> {
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        function: "AccountHelper.getAccounts",
      });
    }
    return accountGetterHelper.getAccountAssets<T>(address);
  }
  getAccountInfoAndAssets<T extends BFChainCore.AccountInfoAndAssets>(
    address: string,
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getAccountInfoAndAssets"
    >,
  ): Promise<BFChainCore.AccountInfoAndAssets | undefined> {
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        function: "AccountHelper.getAccounts",
      });
    }
    return accountGetterHelper.getAccountInfoAndAssets<T>(address);
  }
  getDApp<T extends BFChainCore.DAppInfo>(
    sourceChainMagic: string,
    dappid: string,
    currentBlockHeight: number,
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getDApp"
    >,
  ): Promise<BFChainCore.DAppInfo | undefined> {
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        function: "AccountHelper.getAccounts",
      });
    }
    return accountGetterHelper.getDApp<T>(sourceChainMagic, dappid, currentBlockHeight);
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
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        function: "AccountHelper.getAccounts",
      });
    }
    return accountGetterHelper.isDAppPossessor(sourceChainMagic, address);
  }
  getVoteForDelegate(
    address: string,
    delegate: string,
    dappid: string,
    round: number,
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getVoteForDelegate"
    >,
  ): Promise<boolean> {
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        function: "AccountHelper.getAccounts",
      });
    }
    return accountGetterHelper.getVoteForDelegate(address, delegate, dappid, round);
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
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        function: "AccountHelper.getAccounts",
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
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        function: "AccountHelper.getAccounts",
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
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        function: "AccountHelper.getAccounts",
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
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        function: "AccountHelper.getAccounts",
      });
    }
    return accountGetterHelper.isLocationNameForbidden(name);
  }
  getFrozenAsset(
    address: string,
    signature: string,
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getFrozenAsset"
    >,
  ): Promise<BFChainCore.FrozenAsset | undefined> {
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        function: "AccountHelper.getAccounts",
      });
    }
    return accountGetterHelper.getFrozenAsset(address, signature);
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
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        function: "AccountHelper.getAccounts",
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
  ): Promise<number | undefined> {
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        function: "AccountHelper.getAccounts",
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
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        function: "AccountHelper.getAccounts",
      });
    }
    return accountGetterHelper.isCurrencyForbidden(assetType);
  }
  getChain(
    magic: string,
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "getChain"
    >,
  ): Promise<BFChainCore.ChainInfo | undefined> {
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        function: "AccountHelper.getAccounts",
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
  ): Promise<number | undefined> {
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        function: "AccountHelper.getAccounts",
      });
    }
    return accountGetterHelper.getAlias(alias);
  }
  initAccountPublicKey(
    address: string,
    publicKey: string,
    currentBlockHeight: number,
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "initAccountPublicKey"
    >,
  ): Promise<void> {
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        function: "AccountHelper.getAccounts",
      });
    }
    return accountGetterHelper.initAccountPublicKey(address, publicKey, currentBlockHeight);
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
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        function: "AccountHelper.getAccounts",
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
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        function: "AccountHelper.getAccounts",
      });
    }
    return accountGetterHelper.mergeAccountEquity(height, accountEquity);
  }
  resetDelegateVote(
    height: number,
    accountGetterHelper = this.accountGetterHelper as Pick<
      BFChainCore.AccountGetterHelperInterface,
      "resetDelegateVote"
    >,
  ): Promise<void> {
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        function: "AccountHelper.getAccounts",
      });
    }
    return accountGetterHelper.resetDelegateVote(height);
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
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        function: "AccountHelper.getAccounts",
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
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        function: "AccountHelper.getAccounts",
      });
    }
    return accountGetterHelper.getMemoryDelegates();
  }
}
