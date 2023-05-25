import { Injectable, QueneEventEmitter } from "@bfchain/util";
import { VoteTransaction, NewTransactionRefuseReason } from "@bfchain/core-model";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "VoteLogicVerifier",
);

@Injectable()
export class VoteLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: VoteTransaction,
    currentBlockHeight: number,
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
    skipListenEvent = false,
  ) {
    const accountInfo = await this.helperLogicVerifier.getAccountInfoForce(
      accountMap,
      transaction.recipientId,
      currentBlockHeight,
      accountGetterHelper,
    );
    if (!accountInfo.isDelegate) {
      throw new ConsensusException(ERROR_LIST.ACCOUNT_IS_NOT_AN_DELEGATE, {
        address: accountInfo.address,
        errorId: NewTransactionRefuseReason.ACCOUNT_IS_NOT_AN_DELEGATE,
      });
    }
    if (!accountInfo.isAcceptVote) {
      throw new ConsensusException(ERROR_LIST.DELEGATE_IS_ALREADY_REJECT_VOTE, {
        address: accountInfo.address,
        errorId: NewTransactionRefuseReason.DELEGATE_IS_ALREADY_REJECT_VOTE,
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
