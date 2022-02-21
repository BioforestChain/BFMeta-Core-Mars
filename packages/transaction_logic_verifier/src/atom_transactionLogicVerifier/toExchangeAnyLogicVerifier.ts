import {
  ASSET_STATUS,
  NewTransactionRefuseReason,
  PARENT_ASSET_TYPE,
  ToExchangeAnyTransaction,
} from "@bfchain/core-model";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { Injectable, QueneEventEmitter } from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";

const { ConsensusException } = CoreExceptionGenerator(
  "VERIFIER",
  "ToExchangeSpecialAssetLogicVerifier",
);

@Injectable()
export class ToExchangeAnyLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: ToExchangeAnyTransaction,
    currentBlockHeight: number,
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const { sender } = await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountsInfo,
      accountGetterHelper,
      transactionGetterHelper,
    );

    const cloneAccountsAssets = {
      [transaction.senderId]: this.helperLogicVerifier.deepClone(sender.accountAssets),
    };

    const toExchangeAny = transaction.asset.toExchangeAny;
    const {
      toExchangeChainName,
      toExchangeSource,
      toExchangeParentAssetType,
      toExchangeAssetType,
      beExchangeSource,
      beExchangeChainName,
      beExchangeParentAssetType,
      beExchangeAssetType,
    } = toExchangeAny;

    const eventEmitter = new QueneEventEmitter() as BFChainCore.ApplyTransactionEventEmitter;

    const { eventLogicVerifier } = this;

    eventLogicVerifier.listenEventFee(cloneAccountsAssets, eventEmitter);

    if (toExchangeParentAssetType === PARENT_ASSET_TYPE.ASSETS) {
      await this.helperLogicVerifier.isAssetExist(
        toExchangeChainName,
        toExchangeSource,
        toExchangeAssetType,
        accountGetterHelper,
      );
      eventLogicVerifier.listenEventFrozenAsset(cloneAccountsAssets, eventEmitter);
    }
    // 冻结 dappid
    else if (toExchangeParentAssetType === PARENT_ASSET_TYPE.DAPP) {
      eventLogicVerifier.listenEventFrozenDAppid(
        currentBlockHeight,
        accountGetterHelper,
        eventEmitter,
      );
    }
    // 冻结 locationName
    else if (toExchangeParentAssetType === PARENT_ASSET_TYPE.LOCATION_NAME) {
      eventLogicVerifier.listenEventFrozenLocationName(
        currentBlockHeight,
        accountGetterHelper,
        eventEmitter,
      );
    }
    // 冻结 entity
    else if (toExchangeParentAssetType === PARENT_ASSET_TYPE.ENTITY) {
      eventLogicVerifier.listenEventFrozenEntity(
        currentBlockHeight,
        accountGetterHelper,
        eventEmitter,
      );

      eventLogicVerifier.listenEventFrozenAsset(cloneAccountsAssets, eventEmitter);

      eventLogicVerifier.listenEventPayTax(currentBlockHeight, accountGetterHelper, eventEmitter);
    } else {
      throw new ConsensusException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `toExchangeParentAssetType ${toExchangeParentAssetType}`,
        target: "transaction.asset.toExchangeAny",
      });
    }

    if (beExchangeParentAssetType === PARENT_ASSET_TYPE.ASSETS) {
      await this.helperLogicVerifier.isAssetExist(
        beExchangeChainName,
        beExchangeSource,
        beExchangeAssetType,
        accountGetterHelper,
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
      if (memEntity.status === ASSET_STATUS.DESTORY) {
        throw new ConsensusException(ERROR_LIST.CAN_NOT_DESTORY_ENTITY, {
          entityId: beExchangeAssetType,
          reason: "Entity already be destory",
        });
      }
    } else {
      throw new ConsensusException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `beExchangeParentAssetType ${beExchangeParentAssetType}`,
        target: "transaction.asset.toExchangeAny",
      });
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
