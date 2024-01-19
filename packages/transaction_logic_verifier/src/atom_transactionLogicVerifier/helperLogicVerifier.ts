import { Injectable, Inject } from "@bfchain/util";
import { ConfigHelper } from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { NewTransactionRefuseReason } from "@bfchain/core-model-channel";
import { ACCOUNT_STATUS } from "@bfchain/core-model-constants";

const { ConsensusException } = CoreExceptionGenerator("VERIFIER", "HelperLogicVerifier");

@Injectable()
export class HelperLogicVerifier {
  @Inject(ConfigHelper)
  protected configHelper!: ConfigHelper;
  @Inject("accountGetterHelper", { dynamics: true })
  protected accountGetterHelper!: BFChainCore.AccountGetterHelperInterface;

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

  async isAccountFrozen(address: string, height: number) {
    const account = await this.accountGetterHelper.getAccountInfo(address, height);
    if (account && account.accountStatus !== ACCOUNT_STATUS.NORMAL) {
      throw new ConsensusException(ERROR_LIST.ACCOUNT_FROZEN, {
        address: address,
        status: account.accountStatus,
      });
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
    const isPossess = await this.accountGetterHelper.isPossessFrozenAssetExceptMain(address);
    if (isPossess) {
      throw new ConsensusException(ERROR_LIST.POSSESS_FROZEN_ASSET_EXCEPT_CHAIN_ASSET);
    }
  }

  async isDAppPossessor(address: string, configHelper = this.configHelper) {
    // 资产的发行账户不能是dapp的拥有者
    const isDAppPossessor = await this.accountGetterHelper.isDAppPossessor(
      configHelper.magic,
      address,
    );
    if (isDAppPossessor) {
      throw new ConsensusException(ERROR_LIST.ACCOUNT_CAN_NOT_BE_FROZEN, {
        address,
        reason: "DApp id possessor can not initiate a frozen account transaction",
      });
    }
  }

  async isLnsPossessorOrManager(address: string, configHelper = this.configHelper) {
    // 资产的发行账户不能是位名的拥有者账户或管理账户
    const isLnsPossessor = await this.accountGetterHelper.isLocationNamePossessor(
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

  async isEntityFactoryPossessor(address: string, configHelper = this.configHelper) {
    // 发起账户账户不能是entityFactory拥有者
    const isEntityFactoryPossessor = await this.accountGetterHelper.isEntityFactoryPossessor(
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

  async isEntityPossessor(address: string, configHelper = this.configHelper) {
    // 发起账户不能是entity拥有者
    const isEntityPossessor = await this.accountGetterHelper.isEntityPossessor(
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

  async isCertApplicantOrPossessor(address: string, configHelper = this.configHelper) {
    // 发起账户不能是凭证的发行者或拥有者
    const isCertPossessor = await this.accountGetterHelper.isCertApplicantOrPossessor(
      configHelper.magic,
      address,
    );
    if (isCertPossessor) {
      throw new ConsensusException(ERROR_LIST.ACCOUNT_CAN_NOT_BE_FROZEN, {
        address,
        reason: "Certificate applicant or possessor can not initiate a frozen account transaction",
      });
    }
  }

  async isChainAssetPossessor(address: string) {
    // 账户不能是 dapp 的拥有者
    await this.isDAppPossessor(address, this.configHelper);
    // 账户不能是 locationName 的拥有者或管理员
    await this.isLnsPossessorOrManager(address, this.configHelper);
    // 账户不能是 entityFactory 拥有者
    await this.isEntityFactoryPossessor(address, this.configHelper);
    // 账户不能是 entity 拥有者
    await this.isEntityPossessor(address, this.configHelper);
    // 账户不能是 certificate 的发行者或拥有者
    await this.isCertApplicantOrPossessor(address, this.configHelper);
  }

  async isAssetExist(sourceChainName: string, sourceChainMagic: string, assetType: string) {
    const memAsset = await this.accountGetterHelper.getAsset(sourceChainMagic, assetType);
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
  ) {
    const memDApp = await this.accountGetterHelper.getDApp(
      sourceChainMagic,
      dappid,
      currentBlockHeight,
    );
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
  ) {
    const memLocationName = await this.accountGetterHelper.getLocationName(
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

  async isEntityFactoryExist(
    sourceChainName: string,
    sourceChainMagic: string,
    factoryId: string,
    currentBlockHeight: number,
  ) {
    const memEntityFactory = await this.accountGetterHelper.getEntityFactory(
      sourceChainMagic,
      factoryId,
      currentBlockHeight,
    );
    if (!memEntityFactory) {
      throw new ConsensusException(ERROR_LIST.ENTITY_FACTORY_IS_NOT_EXIST, {
        factoryId,
        errorId: NewTransactionRefuseReason.ENTITY_FACTORY_NOT_EXIST,
      });
    }
    if (memEntityFactory.sourceChainName !== sourceChainName) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `sourceChainName ${memEntityFactory.sourceChainName}`,
        be_compare_prop: `sourceChainName ${sourceChainName}`,
        to_target: `blockChain magic ${sourceChainMagic} factoryId ${factoryId}`,
        be_target: `transaction magic ${sourceChainMagic} factoryId ${factoryId}`,
      });
    }
    return memEntityFactory;
  }

  async isEntityExist(
    sourceChainName: string,
    sourceChainMagic: string,
    entityId: string,
    currentBlockHeight: number,
  ) {
    const memEntity = await this.accountGetterHelper.getEntity(
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

  async isCertificateExist(
    sourceChainName: string,
    sourceChainMagic: string,
    certificateId: string,
    currentBlockHeight: number,
  ) {
    const memCertificate = await this.accountGetterHelper.getCertificate(
      sourceChainMagic,
      certificateId,
      currentBlockHeight,
    );
    if (!memCertificate) {
      throw new ConsensusException(ERROR_LIST.CERTIFICATE_IS_NOT_EXIST, {
        certificateId,
        errorId: NewTransactionRefuseReason.CERTIFICATE_NOT_EXIST,
      });
    }
    if (memCertificate.sourceChainName !== sourceChainName) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `sourceChainName ${memCertificate.sourceChainName}`,
        be_compare_prop: `sourceChainName ${sourceChainName}`,
        to_target: `blockChain magic ${sourceChainMagic} certificateId ${certificateId}`,
        be_target: `transaction magic ${sourceChainMagic} certificateId ${certificateId}`,
      });
    }
    return memCertificate;
  }

  async getAccountForce(
    accountMap: Map<string, BFChainCore.AccountInfo>,
    address: string,
    currentBlockHeight: number,
  ) {
    let account = accountMap.get(address);
    if (!account) {
      account = await this.accountGetterHelper.getAccountInfo(address, currentBlockHeight);
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
}
