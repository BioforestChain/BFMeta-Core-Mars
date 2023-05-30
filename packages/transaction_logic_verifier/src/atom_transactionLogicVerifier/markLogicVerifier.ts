import type { MarkTransaction } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";

const { ConsensusException } = CoreExceptionGenerator("VERIFIER", "MarkLogicVerifier");

@Injectable()
export class MarkLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: MarkTransaction,
    currentBlockHeight: number,
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    skipListenEvent: boolean,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    await this.isDAppidMatch(transaction, currentBlockHeight);

    await this.logicVerify(transaction, currentBlockHeight, accountMap);

    const { eventLogicVerifier } = this;

    if (skipListenEvent === false) {
      eventLogicVerifier.listenEvent(accountMap, currentBlockHeight, eventEmitter);
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
  private async isDAppidMatch(transaction: MarkTransaction, currentBlockHeight: number) {
    const { dapp } = transaction.asset.mark;
    const { sourceChainMagic, dappid } = dapp;
    const memDapp = await this.accountGetterHelper.getDApp(
      sourceChainMagic,
      dappid,
      currentBlockHeight,
    );
    if (!memDapp) {
      throw new ConsensusException(ERROR_LIST.DAPPID_IS_NOT_EXIST, {
        dappid,
      });
    }
    if (dapp.sourceChainName !== memDapp.sourceChainName || dapp.type !== memDapp.type) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `dapp ${JSON.stringify(dapp.toJSON())}`,
        be_compare_prop: `dapp ${JSON.stringify({
          sourceChainMagic: dapp.sourceChainMagic,
          sourceChainName: memDapp.sourceChainName,
          dappid,
          type: memDapp.type,
        })}`,
        to_target: "MarkTransaction.asset.mark",
        be_target: "blockChain dapp",
      });
    }
    if (memDapp.purchaseAsset) {
      if (!dapp.purchaseAsset) {
        throw new ConsensusException(ERROR_LIST.PROP_IS_REQUIRE, {
          prop: "purchaseAsset",
          target: "MarkTransaction.asset.mark.dapp",
        });
      }
      if (dapp.purchaseAsset !== memDapp.purchaseAsset) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `dapp ${JSON.stringify(dapp.toJSON())}`,
          be_compare_prop: `dapp ${JSON.stringify({
            sourceChainMagic: dapp.sourceChainMagic,
            sourceChainName: memDapp.sourceChainName,
            dappid,
            type: memDapp.type,
            purchaseAsset: memDapp.purchaseAsset,
          })}`,
          to_target: "MarkTransaction.asset.mark",
          be_target: "blockChain dapp",
        });
      }
    } else {
      if (dapp.purchaseAsset) {
        throw new ConsensusException(ERROR_LIST.SHOULD_NOT_EXIST, {
          prop: "purchaseAsset",
          target: "MarkTransaction.asset.mark.dapp",
        });
      }
    }
  }
}
