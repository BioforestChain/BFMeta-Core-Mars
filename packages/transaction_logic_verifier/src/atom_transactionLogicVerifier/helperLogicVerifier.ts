import { Injectable, Inject } from "@bfchain/util";
import { ConfigHelper } from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { NewTransactionRefuseReason } from "@bfchain/core-model-channel";
const { ConsensusException } = CoreExceptionGenerator("VERIFIER", "HelperLogicVerifier");

@Injectable()
export class HelperLogicVerifier {
  @Inject(ConfigHelper)
  protected configHelper!: ConfigHelper;

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
   * @param address
   * @param assets
   * @param accountGetterHelper
   * @param configHelper
   */
  async isPossessAssetExceptChainAsset(
    address: string,
    assets: BFChainCore.AccountAssets,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    configHelper = this.configHelper,
  ) {
    for (const magic in assets) {
      const magicAssets = assets[magic];
      for (const assetType in magicAssets) {
        if (assetType !== configHelper.assetType) {
          if (magicAssets[assetType].assetNumber > BigInt(0)) {
            throw new ConsensusException(ERROR_LIST.POSSESS_ASSET_EXCEPT_CHAIN_ASSET);
          }
        }
      }
    }
    const isPossess = await accountGetterHelper.isPossessFrozenAssetExceptMain(address);
    if (isPossess) {
      throw new ConsensusException(ERROR_LIST.POSSESS_FROZEN_ASSET_EXCEPT_CHAIN_ASSET);
    }
  }

  async isDAppPossessor(
    address: string,
    configHelper = this.configHelper,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
  ) {
    // 资产的发行账户不能是dapp的拥有者
    const isDAppPossessor = await accountGetterHelper.isDAppPossessor(configHelper.magic, address);
    if (isDAppPossessor) {
      throw new ConsensusException(ERROR_LIST.ACCOUNT_CAN_NOT_BE_FROZEN, {
        address,
        reason: "DApp id possessor can not initiate a frozen account transaction",
      });
    }
  }

  async isLnsPossessorOrManager(
    address: string,
    configHelper = this.configHelper,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
  ) {
    // 资产的发行账户不能是位名的拥有者账户或管理账户
    const isLnsPossessor = await accountGetterHelper.isLocationNamePossessor(
      configHelper.magic,
      address,
    );
    if (isLnsPossessor) {
      throw new ConsensusException(ERROR_LIST.ACCOUNT_CAN_NOT_BE_FROZEN, {
        address,
        reason: "Location name possessor or manager can not initiate a frozen account transaction",
      });
    }
  }

  async isEntityFactoryPossessor(
    address: string,
    configHelper = this.configHelper,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
  ) {
    // 发起账户账户不能是entityFactory拥有者
    const isEntityFactoryPossessor = await accountGetterHelper.isEntityFactoryPossessor(
      configHelper.magic,
      address,
    );
    if (isEntityFactoryPossessor) {
      throw new ConsensusException(ERROR_LIST.ACCOUNT_CAN_NOT_BE_FROZEN, {
        address,
        reason: "EntityFactory possessor can not initiate a frozen account transaction",
      });
    }
  }

  async isEntityPossessor(
    address: string,
    configHelper = this.configHelper,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
  ) {
    // 发起账户不能是entity拥有者
    const isEntityPossessor = await accountGetterHelper.isEntityPossessor(
      configHelper.magic,
      address,
    );
    if (isEntityPossessor) {
      throw new ConsensusException(ERROR_LIST.ACCOUNT_CAN_NOT_BE_FROZEN, {
        address,
        reason: "Entity possessor can not initiate a frozen account transaction",
      });
    }
  }

  async isAssetExist(
    sourceChainName: string,
    sourceChainMagic: string,
    assetType: string,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
  ) {
    const memAsset = await accountGetterHelper.getAsset(sourceChainMagic, assetType);

    if (!memAsset) {
      throw new ConsensusException(ERROR_LIST.NOT_EXIST, {
        prop: `asset with magic ${sourceChainMagic} assetType ${assetType}`,
        target: "blockChain",
      });
    }

    if (memAsset.sourceChainName !== sourceChainName) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `sourceChainName ${memAsset.sourceChainName}`,
        be_compare_prop: `sourceChainName ${sourceChainName}`,
        to_target: `blockChain magic ${sourceChainMagic} assetType ${assetType}`,
        be_target: `transaction magic ${sourceChainMagic} assetType ${assetType}`,
      });
    }

    return memAsset;
  }

  async isDAppExist(
    sourceChainName: string,
    sourceChainMagic: string,
    dappid: string,
    currentBlockHeight: number,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
  ) {
    const memDApp = await accountGetterHelper.getDApp(sourceChainMagic, dappid, currentBlockHeight);

    if (!memDApp) {
      throw new ConsensusException(ERROR_LIST.DAPPID_IS_NOT_EXIST, {
        dappid,
        errorId: NewTransactionRefuseReason.DAPPID_NOT_EXIST,
      });
    }

    if (memDApp.sourceChainName !== sourceChainName) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `sourceChainName ${memDApp.sourceChainName}`,
        be_compare_prop: `sourceChainName ${sourceChainName}`,
        to_target: `blockChain magic ${sourceChainMagic} dappid ${dappid}`,
        be_target: `transaction magic ${sourceChainMagic} dappid ${dappid}`,
      });
    }

    return memDApp;
  }

  async isLocationNameExist(
    sourceChainName: string,
    sourceChainMagic: string,
    locationName: string,
    currentBlockHeight: number,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
  ) {
    const memLocationName = await accountGetterHelper.getLocationName(
      sourceChainMagic,
      locationName,
      currentBlockHeight,
    );

    if (!memLocationName) {
      throw new ConsensusException(ERROR_LIST.LOCATION_NAME_IS_NOT_EXIST, {
        locationName,
        errorId: NewTransactionRefuseReason.LOCATION_NAME_NOT_EXIST,
      });
    }

    if (memLocationName.sourceChainName !== sourceChainName) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `sourceChainName ${memLocationName.sourceChainName}`,
        be_compare_prop: `sourceChainName ${sourceChainName}`,
        to_target: `blockChain magic ${sourceChainMagic} locationName ${locationName}`,
        be_target: `transaction magic ${sourceChainMagic} locationName ${locationName}`,
      });
    }

    return memLocationName;
  }

  async isEntityExist(
    sourceChainName: string,
    sourceChainMagic: string,
    entityId: string,
    currentBlockHeight: number,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
  ) {
    const memEntity = await accountGetterHelper.getEntity(
      sourceChainMagic,
      entityId,
      currentBlockHeight,
    );

    if (!memEntity) {
      throw new ConsensusException(ERROR_LIST.ENTITY_IS_NOT_EXIST, {
        entityId,
        errorId: NewTransactionRefuseReason.ENTITY_NOT_EXIST,
      });
    }

    if (memEntity.sourceChainName !== sourceChainName) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `sourceChainName ${memEntity.sourceChainName}`,
        be_compare_prop: `sourceChainName ${sourceChainName}`,
        to_target: `blockChain magic ${sourceChainMagic} entityId ${entityId}`,
        be_target: `transaction magic ${sourceChainMagic} entityId ${entityId}`,
      });
    }

    return memEntity;
  }

  async getAccountForce(
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    address: string,
    currentBlockHeight: number,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
  ) {
    let account = accountMap.get(address);
    if (!(account && account.accountInfo && account.accountAssets)) {
      account = await accountGetterHelper.getAccountInfoAndAssets(address, currentBlockHeight);
      if (!account) {
        throw new ConsensusException(ERROR_LIST.NOT_EXIST, {
          prop: `Account with address ${address}`,
          target: "blockChain",
        });
      }
      accountMap.set(address, account);
    }
    return account;
  }

  async getAccountInfoForce(
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    address: string,
    currentBlockHeight: number,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
  ) {
    const account = await this.getAccountForce(
      accountMap,
      address,
      currentBlockHeight,
      accountGetterHelper,
    );
    return account.accountInfo;
  }

  async getAccountAssetsForce(
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    address: string,
    currentBlockHeight: number,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
  ) {
    const account = await this.getAccountForce(
      accountMap,
      address,
      currentBlockHeight,
      accountGetterHelper,
    );
    return account.accountAssets;
  }
}
