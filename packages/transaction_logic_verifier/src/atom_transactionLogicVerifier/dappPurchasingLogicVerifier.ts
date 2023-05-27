import type { DAppPurchasingTransaction } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";

const { ConsensusException } = CoreExceptionGenerator("VERIFIER", "DAppPurchasingLogicVerifier");

@Injectable()
export class DAppPurchasingLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: DAppPurchasingTransaction,
    currentBlockHeight: number,
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
    skipListenEvent: boolean,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    await this.isDAppidMatch(transaction, currentBlockHeight, accountGetterHelper);

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
   * dapp 是否匹配
   *
   * @param transaction
   * @param currentBlockHeight
   * @param accountGetterHelper
   */
  private async isDAppidMatch(
    transaction: DAppPurchasingTransaction,
    currentBlockHeight: number,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
  ) {
    const { dappAsset } = transaction.asset.dappPurchasing;
    const { sourceChainMagic, dappid } = dappAsset;
    const memDapp = await accountGetterHelper.getDApp(sourceChainMagic, dappid, currentBlockHeight);
    if (!memDapp) {
      throw new ConsensusException(ERROR_LIST.DAPPID_IS_NOT_EXIST, {
        dappid,
      });
    }
    if (transaction.recipientId !== memDapp.possessorAddress) {
      throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `recipientId ${transaction.recipientId}`,
        to_target: "DAppPurchasingTransaction",
        be_compare_prop: `dapp possessor ${memDapp.possessorAddress}`,
      });
    }
    if (dappAsset.sourceChainName !== memDapp.sourceChainName || dappAsset.type !== memDapp.type) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `dapp ${JSON.stringify(dappAsset.toJSON())}`,
        be_compare_prop: `dapp ${JSON.stringify({
          sourceChainMagic: dappAsset.sourceChainMagic,
          sourceChainName: memDapp.sourceChainName,
          dappid,
          type: memDapp.type,
        })}`,
        to_target: "DAppPurchasingTransaction.asset.dappPurchasing",
        be_target: "blockChain dapp",
      });
    }
    if (memDapp.purchaseAsset) {
      if (!dappAsset.purchaseAsset) {
        throw new ConsensusException(ERROR_LIST.PROP_IS_REQUIRE, {
          prop: "purchaseAsset",
          target: "DAppPurchasingTransaction.asset.dappPurchasing.dappAsset",
        });
      }
      if (dappAsset.purchaseAsset !== memDapp.purchaseAsset) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `dapp ${JSON.stringify(dappAsset.toJSON())}`,
          be_compare_prop: `dapp ${JSON.stringify({
            sourceChainMagic: dappAsset.sourceChainMagic,
            sourceChainName: memDapp.sourceChainName,
            dappid,
            type: memDapp.type,
            purchaseAsset: memDapp.purchaseAsset,
          })}`,
          to_target: "DAppPurchasingTransaction.asset.dappPurchasing",
          be_target: "blockChain dapp",
        });
      }
    } else {
      if (dappAsset.purchaseAsset) {
        throw new ConsensusException(ERROR_LIST.SHOULD_NOT_EXIST, {
          prop: "purchaseAsset",
          target: "DAppPurchasingTransaction.asset.dappPurchasing.dappAsset",
        });
      }
    }
  }
}
