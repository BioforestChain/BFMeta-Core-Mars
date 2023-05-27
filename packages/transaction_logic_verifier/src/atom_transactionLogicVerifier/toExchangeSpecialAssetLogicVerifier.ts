import { Injectable } from "@bfchain/util";
import {
  ToExchangeSpecialAssetTransaction,
  EXCHANGE_DIRECTION,
  SPECIAL_ASSET_TYPE,
} from "@bfchain/core-model";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";

const { ConsensusException } = CoreExceptionGenerator(
  "VERIFIER",
  "ToExchangeSpecialAssetLogicVerifier",
);

@Injectable()
export class ToExchangeSpecialAssetLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: ToExchangeSpecialAssetTransaction,
    currentBlockHeight: number,
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
    skipListenEvent: boolean,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    const toExchangeSpecialAssetAsset = transaction.asset.toExchangeSpecialAsset;
    const {
      toExchangeChainName,
      toExchangeSource,
      toExchangeAsset,
      beExchangeSource,
      beExchangeChainName,
      beExchangeAsset,
      exchangeDirection,
      exchangeAssetType,
    } = toExchangeSpecialAssetAsset;
    if (exchangeDirection === EXCHANGE_DIRECTION.ASSET_FROM_SENDER) {
      // 特殊资产来自发起账户，则要交换的 数字资产必须存在
      await this.helperLogicVerifier.isAssetExist(
        beExchangeChainName,
        beExchangeSource,
        beExchangeAsset,
        accountGetterHelper,
      );
    } else if (exchangeDirection === EXCHANGE_DIRECTION.ASSET_FROM_RECIPIENT) {
      // 特殊资产来自发起账户，则要交换的 数字资产必须存在
      await this.helperLogicVerifier.isAssetExist(
        toExchangeChainName,
        toExchangeSource,
        toExchangeAsset,
        accountGetterHelper,
      );
    } else {
      throw new ConsensusException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "exchangeDirection",
        target: "toExchangeSpecialAssetAsset",
      });
    }

    await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountMap,
      accountGetterHelper,
      transactionGetterHelper,
    );

    const { eventLogicVerifier } = this;

    if (skipListenEvent === false) {
      eventLogicVerifier.listenEvent(
        accountMap,
        currentBlockHeight,
        accountGetterHelper,
        eventEmitter,
      );
    }

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }

  /**
   * 获取需要被加锁的数据
   *
   * @param transaction
   */
  getLockData(transaction: ToExchangeSpecialAssetTransaction) {
    const { exchangeAssetType, exchangeDirection, toExchangeAsset } =
      transaction.asset.toExchangeSpecialAsset;
    const locks: string[] = [];
    if (exchangeDirection === EXCHANGE_DIRECTION.ASSET_FROM_SENDER) {
      if (
        exchangeAssetType === SPECIAL_ASSET_TYPE.DAPP_ID ||
        exchangeAssetType === SPECIAL_ASSET_TYPE.LOCATION_NAME ||
        exchangeAssetType === SPECIAL_ASSET_TYPE.ENTITY
      ) {
        locks.push(toExchangeAsset);
      }
    }
    return locks;
  }
}
