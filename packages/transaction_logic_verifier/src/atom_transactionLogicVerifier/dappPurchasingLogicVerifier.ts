import type { DAppPurchasingTransaction } from "@bfchain/core-model";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { Injectable, QueneEventEmitter } from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";

const { ConsensusException } = CoreExceptionGenerator("VERIFIER", "DAppPurchasingLogicVerifier");

@Injectable()
export class DAppPurchasingLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: DAppPurchasingTransaction,
    currentBlockHeight: number,
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    await this.isDAppidMatch(transaction, currentBlockHeight, accountGetterHelper);

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

    eventLogicVerifier.listenEventFee(cloneAccountsAssets, eventEmitter);

    eventLogicVerifier.listenEventAsset(cloneAccountsAssets, eventEmitter);

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
    if (dappAsset.sourceChainName !== memDapp.sourceChainName || dappAsset.type !== memDapp.type) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `dapp ${JSON.stringify(dappAsset.toJSON())}`,
        be_compare_prop: `dapp ${JSON.stringify({
          sourceChainMagic: dappAsset.sourceChainMagic,
          sourceChainName: memDapp.sourceChainName,
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
