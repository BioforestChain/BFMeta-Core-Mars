import type { DestoryAssetTransaction } from "@bfchain/core-model";
import { Injectable, QueneEventEmitter } from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";

const { ConsensusException } = CoreExceptionGenerator("VERIFIER", "TransactionLogicVerifier");

@Injectable()
export class DestoryAssetLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: DestoryAssetTransaction,
    currentBlockHeight: number,
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
    skipListenEvent = false,
  ) {
    const { sourceChainMagic, assetType, sourceChainName } = transaction.asset.destoryAsset;

    const memAssets = await this.helperLogicVerifier.isAssetExist(
      sourceChainName,
      sourceChainMagic,
      assetType,
      accountGetterHelper,
    );

    if (memAssets.applyAddress !== transaction.recipientId) {
      throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `recipientId ${transaction.recipientId}`,
        to_target: "transaction",
        be_compare_prop: `asset apply account address ${memAssets.applyAddress}`,
      });
    }

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
}
