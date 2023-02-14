import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { MarkTransaction } from "@bfchain/core-model";
import { Injectable, QueneEventEmitter } from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";

const { ConsensusException } = CoreExceptionGenerator("VERIFIER", "MarkLogicVerifier");

@Injectable()
export class MarkLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: MarkTransaction,
    currentBlockHeight: number,
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    await this.isDAppidMatch(transaction, currentBlockHeight, accountGetterHelper);

    const { sender, recipient } = await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountsInfo,
      accountGetterHelper,
      transactionGetterHelper,
    );

    const cloneAccountsAssets = {
      [transaction.senderId]: this.helperLogicVerifier.deepClone(sender.accountAssets),
    };
    const cloneAccountsInfo = {
      [transaction.senderId]: this.helperLogicVerifier.deepClone(sender.accountInfo),
    };
    if (recipient && recipient.accountInfo && recipient.accountAssets) {
      const address = recipient.accountInfo.address;
      cloneAccountsAssets[address] = this.helperLogicVerifier.deepClone(recipient.accountAssets);
      cloneAccountsInfo[address] = this.helperLogicVerifier.deepClone(recipient.accountInfo);
    }

    const eventEmitter = new QueneEventEmitter() as BFChainCore.ApplyTransactionEventEmitter;

    const { eventLogicVerifier } = this;

    eventLogicVerifier.listenEventFee(cloneAccountsAssets, eventEmitter);

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
    transaction: MarkTransaction,
    currentBlockHeight: number,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
  ) {
    const { dapp } = transaction.asset.mark;
    const { sourceChainMagic, dappid } = dapp;
    const memDapp = await accountGetterHelper.getDApp(sourceChainMagic, dappid, currentBlockHeight);
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
