import { Injectable } from "@bfchain/util";
import { NewTransactionRefuseReason, UsernameTransaction } from "@bfchain/core-model";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";

const { ConsensusException } = CoreExceptionGenerator("VERIFIER", "UsernameLogicVerifier");

@Injectable()
export class UsernameLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: UsernameTransaction,
    currentBlockHeight: number,
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    skipListenEvent: boolean,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    const accountInfo = await this.helperLogicVerifier.getAccountInfoForce(
      accountMap,
      transaction.senderId,
      currentBlockHeight,
    );
    if (accountInfo.username) {
      throw new ConsensusException(ERROR_LIST.ACCOUNT_ALREADY_HAVE_USERNAME, {
        errorId: NewTransactionRefuseReason.ACCOUNT_ALREADY_HAVE_USERNAME,
      });
    }

    await this.logicVerify(transaction, currentBlockHeight, accountMap);

    const { eventLogicVerifier } = this;

    if (skipListenEvent === false) {
      eventLogicVerifier.listenEvent(accountMap, currentBlockHeight, eventEmitter);
    }

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }

  /**
   * 获取需要被加锁的数据
   *
   * @param transaction
   */
  getLockData(transaction: UsernameTransaction) {
    return [transaction.asset.username.alias];
  }
}
