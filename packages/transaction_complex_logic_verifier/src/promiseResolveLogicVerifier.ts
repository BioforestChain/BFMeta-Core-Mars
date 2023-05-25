import type { PromiseResolveTransaction } from "@bfchain/core-model";
import { Injectable, Inject, QueneEventEmitter } from "@bfchain/util";
import { TransactionCore } from "@bfchain/core-transaction";
import {
  TransactionLogicVerifier,
  TransactionLogicVerifierCore,
} from "@bfchain/core-transaction-logic-verifier";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "PromiseResolveLogicVerifier",
);

@Injectable()
export class PromiseResolveLogicVerifier extends TransactionLogicVerifier {
  @Inject("bfchain-core:TransactionCore", { dynamics: true })
  public transactionCore!: TransactionCore;
  @Inject("bfchain-core:TransactionLogicVerifierCore", { dynamics: true })
  public transactionLogicVerifierCore!: TransactionLogicVerifierCore;

  constructor() {
    super();
  }

  async verify(
    transaction: PromiseResolveTransaction,
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

    const { promiseId } = transaction.asset.resolve;
    const promiseTransactionJson = await transactionGetterHelper.getPromiseTransaction(promiseId);
    if (!promiseTransactionJson) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: `Promise transaction ${promiseId}`,
        target: "blockChain",
      });
    }
    if (promiseTransactionJson.applyBlockHeight > currentBlockHeight) {
      throw new ConsensusException(ERROR_LIST.NOT_BEGIN_RESOLVE_YET, {
        promiseId,
      });
    }
    if (promiseTransactionJson.effectiveBlockHeight < currentBlockHeight) {
      throw new ConsensusException(ERROR_LIST.ALREADY_EXPIRED, {
        prop: `Promise transaction ${promiseId}`,
        target: "blockChain",
      });
    }
    const logicVerify = this.transactionLogicVerifierCore.getTransactionLogicVerifierFromType(
      promiseTransactionJson.type,
    );
    const promiseTransaction = await this.transactionCore.recombineTransaction(
      promiseTransactionJson,
    );
    await logicVerify.verify(
      promiseTransaction,
      currentBlockHeight,
      accountMap,
      accountGetterHelper,
      transactionGetterHelper,
      true,
    );

    return true;
  }

  /**
   * 查询交易是否已经在链上
   *
   * @param transaction
   * @param currentBlockHeight
   * @param numberOfTransaction
   * @param transactionGetterHelper
   */
  async checkRepeatInBlockChainTransaction(
    transaction: PromiseResolveTransaction,
    currentBlockHeight: number,
    numberOfTransaction = 0,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const { promiseId } = transaction.asset.resolve;
    const promiseTransaction = await transactionGetterHelper.getPromiseTransaction(promiseId);
    if (!promiseTransaction) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: `Promise transaction ${promiseId}`,
        target: "blockChain",
      });
    }
    const signatures = [transaction.signature, promiseTransaction.signature];
    const applyBlockHeight =
      transaction.applyBlockHeight > promiseTransaction.applyBlockHeight
        ? promiseTransaction.applyBlockHeight
        : transaction.applyBlockHeight;
    const txCount = await transactionGetterHelper.countTransactionsInBlockChainBySignature(
      signatures,
      this.transactionHelper.calcTransactionQueryRangeByApplyBlockHeight(
        applyBlockHeight,
        currentBlockHeight,
      ),
    );
    const maxTxCount = numberOfTransaction === 0 ? 0 : 2;
    if (txCount > maxTxCount) {
      throw new ConsensusException(ERROR_LIST.ALREADY_EXIST, {
        prop: `One of transactions with signatures ${signatures.join(",")}`,
        target: "blockChain",
      });
    }
  }
}
