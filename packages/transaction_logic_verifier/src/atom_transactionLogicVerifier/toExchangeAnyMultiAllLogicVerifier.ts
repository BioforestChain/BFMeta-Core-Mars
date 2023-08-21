import { Injectable } from "@bfchain/util";
import {
  ASSET_STATUS,
  NewTransactionRefuseReason,
  PARENT_ASSET_TYPE,
  ToExchangeAnyMultiAllTransaction,
} from "@bfchain/core-model";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";

const { ConsensusException } = CoreExceptionGenerator(
  "VERIFIER",
  "ToExchangeAnyMultiAllLogicVerifier",
);

@Injectable()
export class ToExchangeAnyMultiAllLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: ToExchangeAnyMultiAllTransaction,
    currentBlockHeight: number,
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    skipListenEvent: boolean,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    this.__checkTrsFee(transaction);

    const toExchangeAnyMultiAll = transaction.asset.toExchangeAnyMultiAll;
    const { beExchangeAssets } = toExchangeAnyMultiAll;

    const accountGetterHelper = this.accountGetterHelper;
    for (const beExchangeAsset of beExchangeAssets) {
      const {
        beExchangeSource,
        beExchangeChainName,
        beExchangeParentAssetType,
        beExchangeAssetType,
      } = beExchangeAsset;
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
          target: "transaction.asset.toExchangeAnyMultiAll.beExchangeAssets.beExchangeAsset",
        });
      }
    }

    await this.logicVerify(transaction, currentBlockHeight, accountMap);

    const { eventLogicVerifier } = this;

    if (skipListenEvent === false) {
      eventLogicVerifier.listenEvent(accountMap, currentBlockHeight, eventEmitter);
    }

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }

  private __checkTrsFee(transaction: ToExchangeAnyMultiAllTransaction) {
    const { toExchangeAssets, beExchangeAssets } = transaction.asset.toExchangeAnyMultiAll;
    const minFee = this.transactionHelper.calcTransactionMinFeeByMulti(
      transaction,
      toExchangeAssets.length + beExchangeAssets.length,
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
  checkTrsFeeAndWebFee(transaction: ToExchangeAnyMultiAllTransaction, byteLength: number) {
    const { toExchangeAssets, beExchangeAssets } = transaction.asset.toExchangeAnyMultiAll;
    return this.isFeeEnough(
      transaction.signature,
      transaction.fee,
      (
        this.transactionHelper.calcTransactionMinFeeByMulti(
          transaction,
          toExchangeAssets.length + beExchangeAssets.length,
        ) + this.transactionHelper.calcTransactionBlobFee(transaction)
      ).toString(),
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
    transaction: ToExchangeAnyMultiAllTransaction,
    byteLength: number,
    miningMachineMinFeePerByte: BFChainCore.FractionJSON,
  ) {
    const { toExchangeAssets, beExchangeAssets } = transaction.asset.toExchangeAnyMultiAll;
    return this.isFeeEnough(
      transaction.signature,
      transaction.fee,
      (
        this.transactionHelper.calcTransactionMinFeeByMulti(
          transaction,
          toExchangeAssets.length + beExchangeAssets.length,
          undefined,
          miningMachineMinFeePerByte,
        ) + this.transactionHelper.calcTransactionBlobFee(transaction, miningMachineMinFeePerByte)
      ).toString(),
    );
  }

  /**
   * 获取需要被加锁的数据
   *
   * @param transaction
   */
  getLockData(transaction: ToExchangeAnyMultiAllTransaction) {
    const { toExchangeAssets } = transaction.asset.toExchangeAnyMultiAll;
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
