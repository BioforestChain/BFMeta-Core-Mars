import {
  ASSET_STATUS,
  NewTransactionRefuseReason,
  PARENT_ASSET_TYPE,
  ToExchangeAnyMultiTransaction,
} from "@bfchain/core-model";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { Injectable, QueneEventEmitter } from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";

const { ConsensusException } = CoreExceptionGenerator(
  "VERIFIER",
  "ToExchangeAnyMultiLogicVerifier",
);

@Injectable()
export class ToExchangeAnyMultiLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: ToExchangeAnyMultiTransaction,
    currentBlockHeight: number,
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    this.__checkTrsFee(transaction);

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

    const toExchangeAnyMulti = transaction.asset.toExchangeAnyMulti;
    const { toExchangeAssets, beExchangeAsset } = toExchangeAnyMulti;

    const eventEmitter = new QueneEventEmitter() as BFChainCore.ApplyTransactionEventEmitter;

    const { eventLogicVerifier } = this;

    eventLogicVerifier.listenEventFee(cloneAccountsAssets, eventEmitter);

    const {
      beExchangeSource,
      beExchangeChainName,
      beExchangeParentAssetType,
      beExchangeAssetType,
    } = beExchangeAsset;

    let alreadyListenPayTax = false;

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
        throw new ConsensusException(ERROR_LIST.ENTITY_ALREADY_DESTORY, {
          entityId: beExchangeAssetType,
          reason: "Entity already be destory",
        });
      }

      eventLogicVerifier.listenEventPayTax(currentBlockHeight, accountGetterHelper, eventEmitter);
      alreadyListenPayTax = true;
    } else {
      throw new ConsensusException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `beExchangeParentAssetType ${beExchangeParentAssetType}`,
        target: "transaction.asset.toExchangeAnyMulti",
      });
    }

    let alreadyListenFrozenAsset = false;
    let alreadyListenFrozenDAppid = false;
    let alreadyListenFrozenLocationName = false;
    let alreadyListenFrozenEntity = false;

    for (const toExchangeAsset of toExchangeAssets) {
      const {
        toExchangeChainName,
        toExchangeSource,
        toExchangeParentAssetType,
        toExchangeAssetType,
      } = toExchangeAsset;

      if (toExchangeParentAssetType === PARENT_ASSET_TYPE.ASSETS) {
        await this.helperLogicVerifier.isAssetExist(
          toExchangeChainName,
          toExchangeSource,
          toExchangeAssetType,
          accountGetterHelper,
        );
        if (alreadyListenFrozenAsset) {
          continue;
        }
        eventLogicVerifier.listenEventFrozenAsset(cloneAccountsAssets, eventEmitter);
        alreadyListenFrozenAsset = true;
      }
      // 冻结 dappid
      else if (toExchangeParentAssetType === PARENT_ASSET_TYPE.DAPP) {
        if (alreadyListenFrozenDAppid) {
          continue;
        }
        eventLogicVerifier.listenEventFrozenDAppid(
          currentBlockHeight,
          accountGetterHelper,
          eventEmitter,
        );
        alreadyListenFrozenDAppid = true;
      }
      // 冻结 locationName
      else if (toExchangeParentAssetType === PARENT_ASSET_TYPE.LOCATION_NAME) {
        if (alreadyListenFrozenLocationName) {
          continue;
        }
        eventLogicVerifier.listenEventFrozenLocationName(
          currentBlockHeight,
          accountGetterHelper,
          eventEmitter,
        );
        alreadyListenFrozenLocationName = true;
      }
      // 冻结 entity
      else if (toExchangeParentAssetType === PARENT_ASSET_TYPE.ENTITY) {
        if (!alreadyListenFrozenEntity) {
          eventLogicVerifier.listenEventFrozenEntity(
            currentBlockHeight,
            accountGetterHelper,
            eventEmitter,
          );
          alreadyListenFrozenEntity = true;
        }
        if (!alreadyListenFrozenAsset) {
          eventLogicVerifier.listenEventFrozenAsset(cloneAccountsAssets, eventEmitter);
          alreadyListenFrozenAsset = true;
        }
        if (!alreadyListenPayTax) {
          eventLogicVerifier.listenEventPayTax(
            currentBlockHeight,
            accountGetterHelper,
            eventEmitter,
          );
          alreadyListenPayTax = true;
        }
      } else {
        throw new ConsensusException(ERROR_LIST.PROP_IS_INVALID, {
          prop: `toExchangeParentAssetType ${toExchangeParentAssetType}`,
          target: "transaction.asset.toExchangeAnyMulti",
        });
      }
    }

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }

  private __checkTrsFee(transaction: ToExchangeAnyMultiTransaction) {
    const minFee = this.transactionHelper.calcTransactionMinFeeByMulti(
      transaction,
      transaction.asset.toExchangeAnyMulti.toExchangeAssets.length,
    );
    if (BigInt(transaction.fee) < BigInt(minFee)) {
      throw new ConsensusException(ERROR_LIST.TRANSACTION_FEE_NOT_ENOUGH, {
        errorId: NewTransactionRefuseReason.TRANSACTION_FEE_NOT_ENOUGH,
        minFee,
        target: "transaction",
      });
    }
  }

  /**
   * 校验交易的手续费是否大于等于网络手续费
   *
   * @param transaction
   * @param byteLength
   */
  checkTrsFeeAndWebFee(transaction: ToExchangeAnyMultiTransaction, byteLength: number) {
    return this.isFeeEnough(
      transaction.fee,
      this.transactionHelper.calcTransactionMinFeeByMulti(
        transaction,
        transaction.asset.toExchangeAnyMulti.toExchangeAssets.length,
      ),
    );
  }

  /**
   * 检验交易的手续费是否大于等于矿机手续费和网络手续费
   *
   * @param transaction
   * @param byteLength
   * @param miningMachineMinFeePerByte
   */
  checkTrsFeeAndMiningMachineFeeAndWebFee(
    transaction: ToExchangeAnyMultiTransaction,
    byteLength: number,
    miningMachineMinFeePerByte: BFChainCore.FractionJSON,
  ) {
    return this.isFeeEnough(
      transaction.fee,
      this.transactionHelper.calcTransactionMinFeeByMulti(
        transaction,
        transaction.asset.toExchangeAnyMulti.toExchangeAssets.length,
        undefined,
        miningMachineMinFeePerByte,
      ),
    );
  }

  /**
   * 获取需要被加锁的数据
   *
   * @param transaction
   */
  getLockData(transaction: ToExchangeAnyMultiTransaction) {
    const { toExchangeAssets } = transaction.asset.toExchangeAnyMulti;
    const locks: string[] = [];
    for (const toExchangeAsset of toExchangeAssets) {
      const { toExchangeParentAssetType, toExchangeAssetType } = toExchangeAsset;
      if (
        toExchangeParentAssetType === PARENT_ASSET_TYPE.DAPP ||
        toExchangeParentAssetType === PARENT_ASSET_TYPE.LOCATION_NAME ||
        toExchangeParentAssetType === PARENT_ASSET_TYPE.ENTITY
      ) {
        locks.push(toExchangeAssetType);
      }
    }
    return locks;
  }
}
