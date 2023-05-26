import type { PromiseResolveTransaction } from "@bfchain/core-model";
import { Injectable, Inject } from "@bfchain/util";
import { TransactionCore } from "@bfchain/core-transaction";
import {
  TransactionLogicVerifier,
  TransactionLogicVerifierCore,
} from "@bfchain/core-transaction-logic-verifier";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { ComplexTransactionLogicHelper } from "./complexTransactionLogicHelper";

const { ConsensusException } = CoreExceptionGenerator("VERIFIER", "PromiseResolveLogicVerifier");

@Injectable()
export class PromiseResolveLogicVerifier extends TransactionLogicVerifier {
  @Inject(ComplexTransactionLogicHelper)
  protected complexTransactionLogicHelper!: ComplexTransactionLogicHelper;
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
    skipListenEvent: boolean,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    await this.logicVerify(transaction, currentBlockHeight, accountMap);

    const { eventLogicVerifier } = this;

    if (skipListenEvent === false) {
      eventLogicVerifier.listenEvent(accountMap, currentBlockHeight, eventEmitter);
    }

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    const { promiseId } = transaction.asset.resolve;
    const promiseTransaction = await this.complexTransactionLogicHelper.getPromiseTransaction(
      promiseId,
    );
    const logicVerify = this.transactionLogicVerifierCore.getTransactionLogicVerifierFromType(
      promiseTransaction.type,
    );
    if (promiseTransaction.applyBlockHeight > currentBlockHeight) {
      throw new ConsensusException(ERROR_LIST.NOT_BEGIN_RESOLVE_YET, {
        promiseId,
      });
    }
    if (promiseTransaction.effectiveBlockHeight < currentBlockHeight) {
      throw new ConsensusException(ERROR_LIST.ALREADY_EXPIRED, {
        prop: `Promise transaction ${promiseId}`,
        target: "blockChain",
      });
    }

    await logicVerify.verify(
      promiseTransaction,
      currentBlockHeight,
      accountMap,
      true,
      eventEmitter,
    );

    return true;
  }

  /**
   * 校验交易的手续费是否大于等于网络手续费
   *
   * @param transaction
   * @param byteLength
   */
  async checkTrsFeeAndWebFee(transaction: PromiseResolveTransaction, byteLength: number) {
    const resp = await super.checkTrsFeeAndWebFee(transaction, byteLength);
    if (resp.isFeeEnough === false) {
      return resp;
    }
    const promiseTransaction = await this.complexTransactionLogicHelper.getPromiseTransaction(
      transaction.asset.resolve.promiseId,
    );
    const logicVerify = this.transactionLogicVerifierCore.getTransactionLogicVerifierFromType(
      promiseTransaction.type,
    );
    const result = await logicVerify.checkTrsFeeAndWebFee(
      promiseTransaction,
      promiseTransaction.getBytes().length,
    );
    if (result.isFeeEnough === false) {
      return result;
    }
    return resp;
  }

  /**
   * 检验交易的手续费是否大于等于矿机手续费和网络手续费
   *
   * @param transaction
   * @param byteLength
   * @param miningMachineMinFeePerByte
   */
  async checkTrsFeeAndMiningMachineFeeAndWebFee(
    transaction: PromiseResolveTransaction,
    byteLength: number,
    miningMachineMinFeePerByte: BFChainCore.FractionJSON,
  ) {
    const resp = await super.checkTrsFeeAndMiningMachineFeeAndWebFee(
      transaction,
      byteLength,
      miningMachineMinFeePerByte,
    );
    if (resp.isFeeEnough === false) {
      return resp;
    }
    const promiseTransaction = await this.complexTransactionLogicHelper.getPromiseTransaction(
      transaction.asset.resolve.promiseId,
    );
    const logicVerify = this.transactionLogicVerifierCore.getTransactionLogicVerifierFromType(
      promiseTransaction.type,
    );
    const result = await logicVerify.checkTrsFeeAndMiningMachineFeeAndWebFee(
      promiseTransaction,
      promiseTransaction.getBytes().length,
      miningMachineMinFeePerByte,
    );
    if (result.isFeeEnough === false) {
      return result;
    }
    return resp;
  }

  /**
   * 查询交易是否已经在链上
   *
   * @param transaction
   * @param currentBlockHeight
   * @param numberOfTransaction
   */
  async checkRepeatInBlockChainTransaction(
    transaction: PromiseResolveTransaction,
    currentBlockHeight: number,
    numberOfTransaction = 0,
  ) {
    const { minHeight, count, ids } = await this.complexTransactionLogicHelper.getCheckRepeatInfo(
      transaction,
      numberOfTransaction !== 0,
    );
    const txCount = await this.transactionGetterHelper.countTransactionsInBlockChainBySignature(
      ids,
      this.transactionHelper.calcTransactionQueryRangeByApplyBlockHeight(
        minHeight,
        currentBlockHeight,
      ),
    );
    const maxTxCount = numberOfTransaction === 0 ? 0 : count;
    if (txCount > maxTxCount) {
      throw new ConsensusException(ERROR_LIST.ALREADY_EXIST, {
        prop: `One of transactions with signatures [${ids.slice(0, 3).join(",")}${
          ids.length > 3 ? "..." : ""
        }]`,
        target: "blockChain",
      });
    }
  }
}
