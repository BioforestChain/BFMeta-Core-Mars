import type { DestoryAssetTransaction } from "@bfchain/core-model";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { Injectable, QueneEventEmitter } from "@bfchain/util";
import { CoreExceptionGenerator, NOT_EXIST, NOT_MATCH } from "@bfchain/core-util-exception";

const { ConsensusException } = CoreExceptionGenerator("VERIFIER", "TransactionLogicVerifier");

@Injectable()
export class DestoryAssetLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: DestoryAssetTransaction,
    currentBlockHeight: number,
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const Function_Exception_Detail = {
      function: "logicVerify",
    } as const;

    const { sourceChainMagic, assetType, sourceChainName } = transaction.asset.destoryAsset;

    const memAsset = await accountGetterHelper.getAsset(sourceChainMagic, assetType);

    if (!memAsset) {
      throw new ConsensusException(NOT_EXIST, {
        prop: `chain with magic ${sourceChainMagic}`,
        target: "blockChain",
        ...Function_Exception_Detail,
      });
    }

    if (memAsset.sourceChainName !== sourceChainName) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: memAsset.sourceChainName,
        be_compare_prop: sourceChainName,
        to_target: "chain asset",
        be_target: "destoryAsset",
        ...Function_Exception_Detail,
      });
    }

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

    if (recipient && recipient.accountInfo && recipient.accountAssets) {
      const address = recipient.accountInfo.address;
      cloneAccountsAssets[address] = this.helperLogicVerifier.deepClone(recipient.accountAssets);
    }

    const eventEmitter = new QueneEventEmitter() as BFChainCore.ApplyTransactionEventEmitter;

    this.eventLogicVerifier.listenEventFee(cloneAccountsAssets, transaction, eventEmitter);

    this.eventLogicVerifier.listenEventAsset(cloneAccountsAssets, transaction, eventEmitter);

    this.eventLogicVerifier.listenEventDestoryAsset(transaction, accountGetterHelper, eventEmitter);

    await this.eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }
}
