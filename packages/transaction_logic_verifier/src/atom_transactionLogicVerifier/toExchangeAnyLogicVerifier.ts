import { Injectable } from "@bfchain/util";
import {
  ASSET_STATUS,
  NewTransactionRefuseReason,
  PARENT_ASSET_TYPE,
  ToExchangeAnyTransaction,
} from "@bfchain/core-model";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";

const { ConsensusException } = CoreExceptionGenerator("VERIFIER", "ToExchangeAnyLogicVerifier");

@Injectable()
export class ToExchangeAnyLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: ToExchangeAnyTransaction,
    currentBlockHeight: number,
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    skipListenEvent: boolean,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    const toExchangeAny = transaction.asset.toExchangeAny;
    const {
      beExchangeSource,
      beExchangeChainName,
      beExchangeParentAssetType,
      beExchangeAssetType,
    } = toExchangeAny;

    const accountGetterHelper = this.accountGetterHelper;
    if (beExchangeParentAssetType === PARENT_ASSET_TYPE.ASSETS) {
      await this.helperLogicVerifier.isAssetExist(
        beExchangeChainName,
        beExchangeSource,
        beExchangeAssetType,
      );
    } else if (beExchangeParentAssetType === PARENT_ASSET_TYPE.DAPP) {
      const memDapp = await accountGetterHelper.getDApp(
        beExchangeSource,
        beExchangeAssetType,
        currentBlockHeight,
      );
      if (!memDapp) {
        throw new ConsensusException(ERROR_LIST.DAPPID_IS_NOT_EXIST, {
          dappid: beExchangeAssetType,
        });
      }
    } else if (beExchangeParentAssetType === PARENT_ASSET_TYPE.LOCATION_NAME) {
      // 只有顶级域名才能交换
      if (beExchangeAssetType.split(",").length > 2) {
        throw new ConsensusException(ERROR_LIST.ONLY_TOP_LEVEL_LOCATION_NAME_CAN_EXCHANGE);
      }
      const memLocation = await accountGetterHelper.getLocationName(
        beExchangeSource,
        beExchangeAssetType,
        currentBlockHeight,
      );
      if (!memLocation) {
        throw new ConsensusException(ERROR_LIST.LOCATION_NAME_IS_NOT_EXIST, {
          locationName: beExchangeAssetType,
          errorId: NewTransactionRefuseReason.LOCATION_NAME_NOT_EXIST,
        });
      }
    } else if (beExchangeParentAssetType === PARENT_ASSET_TYPE.ENTITY) {
      const memEntity = await accountGetterHelper.getEntity(
        beExchangeSource,
        beExchangeAssetType,
        currentBlockHeight,
      );
      if (!memEntity) {
        throw new ConsensusException(ERROR_LIST.ENTITY_IS_NOT_EXIST, {
          entityId: beExchangeAssetType,
          errorId: NewTransactionRefuseReason.ENTITY_NOT_EXIST,
        });
      }
      if (memEntity.status === ASSET_STATUS.DESTROY) {
        throw new ConsensusException(ERROR_LIST.ENTITY_ALREADY_DESTROY, {
          entityId: beExchangeAssetType,
          reason: "Entity already be destroy",
        });
      }
    } else {
      throw new ConsensusException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `beExchangeParentAssetType ${beExchangeParentAssetType}`,
        target: "transaction.asset.toExchangeAny",
      });
    }

    await this.logicVerify(transaction, currentBlockHeight, accountMap);

    const { eventLogicVerifier } = this;

    if (skipListenEvent === false) {
      eventLogicVerifier.listenEvent(accountMap, currentBlockHeight, eventEmitter);
    }

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }

  /**
   * 获取需要被加锁的数据
   *
   * @param transaction
   */
  getLockData(transaction: ToExchangeAnyTransaction) {
    const { toExchangeParentAssetType, toExchangeAssetType } = transaction.asset.toExchangeAny;
    const locks: string[] = [];
    if (
      toExchangeParentAssetType === PARENT_ASSET_TYPE.DAPP ||
      toExchangeParentAssetType === PARENT_ASSET_TYPE.LOCATION_NAME ||
      toExchangeParentAssetType === PARENT_ASSET_TYPE.ENTITY
    ) {
      locks.push(toExchangeAssetType);
    }
    return locks;
  }
}
