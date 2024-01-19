import type { ToExchangeAssetTransaction, ToExchangeAssetModel } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";

@Injectable()
export class ToExchangeAssetLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: ToExchangeAssetTransaction,
    currentBlockHeight: number,
    accountMap: Map<string, BFChainCore.AccountInfo>,
    skipListenEvent: boolean,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    const toExchangeAsset = transaction.asset.toExchangeAsset;
    await this.isExchangeAssetAlreadyExist(toExchangeAsset);

    await this.logicVerify(transaction, currentBlockHeight, accountMap);

    const { eventLogicVerifier } = this;

    if (skipListenEvent === false) {
      eventLogicVerifier.listenEvent(accountMap, currentBlockHeight, eventEmitter);
    }

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }

  /**
   * 交换的双方资产是否已经存在
   *
   * @param toExchangeAssetAsset
   */
  private async isExchangeAssetAlreadyExist(toExchangeAssetAsset: ToExchangeAssetModel) {
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
    );

    await this.helperLogicVerifier.isAssetExist(
      beExchangeChainName,
      beExchangeSource,
      beExchangeAsset,
    );
  }
}
