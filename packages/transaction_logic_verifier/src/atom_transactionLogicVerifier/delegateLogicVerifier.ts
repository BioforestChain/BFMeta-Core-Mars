import type { DelegateTransaction } from "@bfchain/core-model";
import { Injectable, QueneEventEmitter } from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";

const { ConsensusException } = CoreExceptionGenerator("VERIFIER", "DelegateLogicVerifier");

@Injectable()
export class DelegateLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: DelegateTransaction,
    currentBlockHeight: number,
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
    skipListenEvent = false,
  ) {
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

  async checkRegisterDelegateQuota(
    currentBlockHeight: number,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const { maxDelegateTxsPerRound } = this.configHelper;
    const txCount = await transactionGetterHelper.getNumberOfNewDelegate();
    let realMaxDelegateTxsPerRound = maxDelegateTxsPerRound;

    const curRound = this.blockHelper.calcRoundByHeight(currentBlockHeight);
    if (currentBlockHeight < this.configHelper.blockPerRound) {
      realMaxDelegateTxsPerRound = realMaxDelegateTxsPerRound + this.configHelper.delegates;
    }
    if (txCount >= realMaxDelegateTxsPerRound) {
      throw new ConsensusException(ERROR_LIST.REGISTER_DELEGTE_QUOTA_FULL, {
        round: curRound,
      });
    }
  }
}
