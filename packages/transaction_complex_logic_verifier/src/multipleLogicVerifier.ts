import type { MultipleTransaction } from "@bfchain/core-model";
import { Injectable, Inject } from "@bfchain/util";
import {
  TransactionLogicVerifier,
  TransactionLogicVerifierCore,
} from "@bfchain/core-transaction-logic-verifier";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "MultipleLogicVerifier",
);

@Injectable()
export class MultipleLogicVerifier extends TransactionLogicVerifier {
  @Inject("bfchain-core:TransactionLogicVerifierCore", { dynamics: true })
  public transactionLogicVerifierCore!: TransactionLogicVerifierCore;

  constructor() {
    super();
  }

  async verify(
    transaction: MultipleTransaction,
    currentBlockHeight: number,
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    skipListenEvent: boolean,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    await this.logicVerify(transaction, currentBlockHeight, accountMap);

    const { eventLogicVerifier } = this;

    if (skipListenEvent === false) {
      eventLogicVerifier.listenEvent(accountMap, currentBlockHeight, eventEmitter);
    }

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    const { transactions } = transaction.asset.multiple;

    for (const subTransaction of transactions) {
      const logicVerify = this.transactionLogicVerifierCore.getTransactionLogicVerifierFromType(
        subTransaction.type,
      );

      await logicVerify.verify(subTransaction, currentBlockHeight, accountMap, true, eventEmitter);
    }

    return true;
  }

  /**
   * 查询交易是否已经在链上
   *
   * @param transaction
   * @param currentBlockHeight
   * @param numberOfTransaction
   */
  async checkRepeatInBlockChainTransaction(
    transaction: MultipleTransaction,
    currentBlockHeight: number,
    numberOfTransaction: 0 | 1 = 0,
  ) {
    const { transactions } = transaction.asset.multiple;
    const signatures = [transaction.signature];
    let applyBlockHeight = transaction.applyBlockHeight;
    for (const subTransaction of transactions) {
      signatures.push(subTransaction.signature);
      if (applyBlockHeight > subTransaction.applyBlockHeight) {
        applyBlockHeight = subTransaction.applyBlockHeight;
      }
    }
    const txCount = await this.transactionGetterHelper.countTransactionsInBlockChainBySignature(
      signatures,
      this.transactionHelper.calcTransactionQueryRangeByApplyBlockHeight(
        applyBlockHeight,
        currentBlockHeight,
      ),
    );
    const maxTxCount = numberOfTransaction === 0 ? 0 : transactions.length + 1;
    if (txCount > maxTxCount) {
      throw new ConsensusException(ERROR_LIST.ALREADY_EXIST, {
        prop: `One of transactions with signatures ${signatures
          .slice(0, 3)
          .map((item) => item.slice(0, 8))
          .join(",")}`,
        target: "blockChain",
      });
    }
  }
}
