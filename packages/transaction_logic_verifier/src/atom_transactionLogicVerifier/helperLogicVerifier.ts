import { Injectable, Inject } from "@bfchain/util";
import { ConfigHelper } from "@bfchain/core-helper";
import {
  CoreExceptionGenerator,
  POSSESS_ASSET_EXCEPT_CHAIN_ASSET,
  ACCOUNT_CAN_NOT_BE_FROZEN,
  NOT_EXIST,
} from "@bfchain/core-util-exception";
const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "HelperLogicVerifier",
);

@Injectable()
export class HelperLogicVerifier {
  @Inject(ConfigHelper)
  protected configHelper!: ConfigHelper;
  @Inject("accountGetterHelper", { optional: true, dynamics: true })
  protected accountGetterHelper?: BFChainCore.AccountGetterHelperInterface;

  deepClone<T>(obj: T): T {
    const result = Array.isArray(obj) ? ([] as any) : ({} as T);
    if (typeof obj === "object") {
      for (const key in obj) {
        if (obj[key] && typeof obj[key] === "object") {
          result[key] = this.deepClone(obj[key]);
        } else {
          result[key] = obj[key];
        }
      }
      return result;
    } else {
      return obj;
    }
  }

  /**
   * 账户是否持有除链资产外其他资产
   *
   * @param assets
   */
  isPossessAssetExceptForChainAsset(
    assets: BFChainCore.AccountAssets,
    configHelper = this.configHelper,
  ) {
    for (const magic in assets) {
      const magicAssets = assets[magic];
      for (const assetType in magicAssets) {
        if (assetType !== configHelper.assetType) {
          if (magicAssets[assetType].assetNumber > BigInt(0)) {
            throw new ConsensusException(POSSESS_ASSET_EXCEPT_CHAIN_ASSET, {
              function: "isPossessAssetExceptForChainAsset",
            });
          }
        }
      }
    }
  }

  async isDAppPossessor(
    address: string,
    configHelper = this.configHelper,
    accountGetterHelper = this.accountGetterHelper,
  ) {
    const Function_Exception_Detail = {
      function: "isDAppPossessor",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }

    // 资产的发行账户不能是dapp的拥有者
    const isDAppPossessor = await accountGetterHelper.isDAppPossessor(configHelper.magic, address);
    if (isDAppPossessor) {
      throw new ConsensusException(ACCOUNT_CAN_NOT_BE_FROZEN, {
        address,
        reason: "DApp id possessor can not initiate a frozen account transaction",
        ...Function_Exception_Detail,
      });
    }
  }

  async isLnsPossessorOrManager(
    address: string,
    configHelper = this.configHelper,
    accountGetterHelper = this.accountGetterHelper,
  ) {
    const Function_Exception_Detail = {
      function: "isLnsPossessorOrManager",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }

    // 资产的发行账户不能是链域名的拥有者账户或管理账户
    const isLnsPossessor = await accountGetterHelper.isLocationNamePossessor(
      configHelper.magic,
      address,
    );
    if (isLnsPossessor) {
      throw new ConsensusException(ACCOUNT_CAN_NOT_BE_FROZEN, {
        address,
        reason: "Location name possessor or manager can not initiate a frozen account transaction",
        ...Function_Exception_Detail,
      });
    }
  }
}
