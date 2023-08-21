import { NewTransactionRefuseReason, PromiseTransaction } from "@bfchain/core-model";
import { Injectable, Inject } from "@bfchain/util";
import {
  TransactionLogicVerifier,
  TransactionLogicVerifierCore,
} from "@bfchain/core-transaction-logic-verifier";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { ComplexTransactionLogicHelper } from "./complexTransactionLogicHelper";

const { ConsensusException } = CoreExceptionGenerator("VERIFIER", "PromiseLogicVerifier");

@Injectable()
export class PromiseLogicVerifier extends TransactionLogicVerifier {
  @Inject(ComplexTransactionLogicHelper)
  protected complexTransactionLogicHelper!: ComplexTransactionLogicHelper;
  @Inject("bfchain-core:TransactionLogicVerifierCore", { dynamics: true })
  public transactionLogicVerifierCore!: TransactionLogicVerifierCore;

  constructor() {
    super();
  }

  async verify(
    transaction: PromiseTransaction,
    currentBlockHeight: number,
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    skipListenEvent: boolean,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    const subTransaction = transaction.asset.promise.transaction;
    const { signature } = subTransaction;
    const promiseTransactionJson = await this.transactionGetterHelper.getTransactionBySignature(
      signature,
      this.transactionHelper.calcTransactionQueryRange(currentBlockHeight),
    );
    if (promiseTransactionJson) {
      throw new ConsensusException(ERROR_LIST.ALREADY_EXIST, {
        prop: `promiseTransaction ${signature}`,
        target: "blockChain",
        errorId: NewTransactionRefuseReason.TRANSACTION_IN_TRS,
      });
    }

    await this.logicVerify(transaction, currentBlockHeight, accountMap);

    const { eventLogicVerifier } = this;

    if (skipListenEvent === false) {
      eventLogicVerifier.listenEvent(accountMap, currentBlockHeight, eventEmitter);
    }

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    const logicVerify = this.transactionLogicVerifierCore.getTransactionLogicVerifierFromType(
      subTransaction.type,
    );
    await logicVerify.verify(subTransaction, currentBlockHeight, accountMap, true, eventEmitter);

    return true;
  }

  /**
   * 校验交易的手续费是否大于等于网络手续费
   *
   * @param transaction
   * @param byteLength
   */
  checkTrsFeeAndWebFee(transaction: PromiseTransaction, byteLength: number) {
    const resp = super.checkTrsFeeAndWebFee(transaction, byteLength);
    if (resp.isFeeEnough === false) {
      return resp;
    }
    const promiseTransaction = transaction.asset.promise.transaction;
    const logicVerify = this.transactionLogicVerifierCore.getTransactionLogicVerifierFromType(
      promiseTransaction.type,
    );
    const result = logicVerify.checkTrsFeeAndWebFee(
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
  checkTrsFeeAndMiningMachineFeeAndWebFee(
    transaction: PromiseTransaction,
    byteLength: number,
    miningMachineMinFeePerByte: BFChainCore.FractionJSON,
  ) {
    const resp = super.checkTrsFeeAndMiningMachineFeeAndWebFee(
      transaction,
      byteLength,
      miningMachineMinFeePerByte,
    );
    if (resp.isFeeEnough === false) {
      return resp;
    }
    const promiseTransaction = transaction.asset.promise.transaction;
    const logicVerify = this.transactionLogicVerifierCore.getTransactionLogicVerifierFromType(
      promiseTransaction.type,
    );
    const result = logicVerify.checkTrsFeeAndMiningMachineFeeAndWebFee(
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
   * 检验交易的 blobSize 是否大于矿机和网络最大 blobSize
   *
   * @param transaction
   * @param miningMachineMaxBlobSize
   */
  checkTransactionBlobSize(transaction: PromiseTransaction, miningMachineMaxBlobSize?: number) {
    const { maxBlockBlobSize } = this.configHelper;
    const maxBlobSize =
      miningMachineMaxBlobSize === undefined
        ? maxBlockBlobSize
        : maxBlockBlobSize < miningMachineMaxBlobSize
        ? maxBlockBlobSize
        : miningMachineMaxBlobSize;
    const blobSize = transaction.getBlobSize(true);
    if (blobSize > maxBlobSize) {
      throw new ConsensusException(ERROR_LIST.PROP_SHOULD_LTE_FIELD, {
        prop: `transaction blob size ${blobSize}`,
        target: "transaction",
        field: maxBlobSize,
      });
    }
    const promiseTransaction = transaction.asset.promise.transaction;
    const logicVerify = this.transactionLogicVerifierCore.getTransactionLogicVerifierFromType(
      promiseTransaction.type,
    );
    logicVerify.checkTransactionBlobSize(promiseTransaction, miningMachineMaxBlobSize);
  }

  /**
   * 查询交易是否已经在链上
   *
   * @param transaction
   * @param currentBlockHeight
   * @param numberOfTransaction
   */
  async checkRepeatInBlockChainTransaction(
    transaction: PromiseTransaction,
    currentBlockHeight: number,
    numberOfTransaction: 0 | 1 = 0,
  ) {
    /// 这里写的这么麻烦是为了减少查询，简单粗暴就直接调用每个交易各自的 checkRepeat
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
