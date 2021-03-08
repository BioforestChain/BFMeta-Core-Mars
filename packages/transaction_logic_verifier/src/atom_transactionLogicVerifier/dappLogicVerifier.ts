import { DAppTransaction, NewTransactionRefuseReason } from "@bfchain/core-model";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { Injectable, QueneEventEmitter } from "@bfchain/util";
import { CoreExceptionGenerator, USE_MAIN_ASSET_PURCHASE_ONLY } from "@bfchain/core-util-exception";

const { ConsensusException } = CoreExceptionGenerator("VERIFIER", "TrustAssetLogicVerifier");

@Injectable()
export class DAppLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: DAppTransaction,
    currentBlockHeight: number,
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const purchaseAsset = transaction.asset.dapp.purchaseAsset;
    if (purchaseAsset) {
      const { sourceChainMagic, assetType } = purchaseAsset;
      if (
        !(sourceChainMagic === this.configHelper.magic && assetType === this.configHelper.assetType)
      ) {
        throw new ConsensusException(USE_MAIN_ASSET_PURCHASE_ONLY, {
          assetType,
          mainAsset: this.configHelper.assetType,
          errorId: NewTransactionRefuseReason.USE_MAIN_ASSET_PURCHASE_ONLY,
          function: "verify",
        });
      }
    }

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

    const eventEmitter = new QueneEventEmitter() as BFChainCore.ApplyTransactionEventEmitter;

    const { eventLogicVerifier } = this;

    eventLogicVerifier.listenEventFee(cloneAccountsAssets, transaction, eventEmitter);

    eventLogicVerifier.listenEventIssueDAppid(
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }
}
