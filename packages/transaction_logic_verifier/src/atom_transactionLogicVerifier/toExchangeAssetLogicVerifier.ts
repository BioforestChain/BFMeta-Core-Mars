import type { ToExchangeAssetTransaction, ToExchangeAssetModel } from "@bfchain/core-model";
import { Injectable, QueneEventEmitter } from "@bfchain/util";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";

@Injectable()
export class ToExchangeAssetLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: ToExchangeAssetTransaction,
    currentBlockHeight: number,
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
    skipListenEvent = false,
  ) {
    const toExchangeAsset = transaction.asset.toExchangeAsset;
    await this.isExchangeAssetAlreadyExist(toExchangeAsset, accountGetterHelper);

    await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountMap,
      accountGetterHelper,
      transactionGetterHelper,
    );

    const eventEmitter = new QueneEventEmitter() as BFChainCore.ApplyTransactionEventEmitter;

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
   * 交换的双方资产是否已经存在
   *
   * @param toExchangeAssetAsset
   */
  private async isExchangeAssetAlreadyExist(
    toExchangeAssetAsset: ToExchangeAssetModel,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
  ) {
    const {
      toExchangeSource,
      toExchangeChainName,
      toExchangeAsset,
      beExchangeSource,
      beExchangeChainName,
      beExchangeAsset,
    } = toExchangeAssetAsset;

    await this.helperLogicVerifier.isAssetExist(
      toExchangeChainName,
      toExchangeSource,
      toExchangeAsset,
      accountGetterHelper,
    );

    await this.helperLogicVerifier.isAssetExist(
      beExchangeChainName,
      beExchangeSource,
      beExchangeAsset,
      accountGetterHelper,
    );
  }
}
