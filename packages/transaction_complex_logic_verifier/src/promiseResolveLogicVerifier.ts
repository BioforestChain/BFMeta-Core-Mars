import { PromiseResolveTransaction, PromiseTransaction } from "@bfchain/core-model";
import { Injectable, Inject, getHexFromArrayBuffer } from "@bfchain/util";
import { TransactionCore } from "@bfchain/core-transaction";
import {
  TransactionLogicVerifier,
  TransactionLogicVerifierCore,
} from "@bfchain/core-transaction-logic-verifier";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { ComplexTransactionLogicHelper } from "./complexTransactionLogicHelper";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "PromiseResolveLogicVerifier",
);

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

    const { promiseId, transaction: subTransaction } = transaction.asset.resolve;
    const promiseTransactionJson = await this.transactionGetterHelper.getTransactionBySignature(
      promiseId,
      this.transactionHelper.calcTransactionQueryRange(currentBlockHeight),
    );
    if (!promiseTransactionJson) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST_OR_EXPIRED, {
        prop: `Transaction with signature ${promiseId}`,
        target: "blockChain",
      });
    }
    const model = await this.transactionCore.recombineTransaction(promiseTransactionJson);
    const doPomiseTransaction = model.as(PromiseTransaction, promiseId);
    if (!doPomiseTransaction) {
      throw new ConsensusException(ERROR_LIST.NOT_EXPECTED_RELATED_TRANSACTION, {
        signature: `${promiseId}`,
      });
    }
    if (transaction.senderId !== doPomiseTransaction.recipientId) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `senderId ${transaction.senderId}`,
        be_compare_prop: `recipientId ${doPomiseTransaction.recipientId}`,
        to_target: "promiseResolveTransaction",
        be_target: "doPromiseTransaction",
      });
    }
    if (transaction.recipientId !== doPomiseTransaction.senderId) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `recipientId ${transaction.recipientId}`,
        be_compare_prop: `senderId ${doPomiseTransaction.senderId}`,
        to_target: "promiseResolveTransaction",
        be_target: "doPromiseTransaction",
      });
    }
    const promiseTransaction = await this.complexTransactionLogicHelper.getPromiseTransaction(
      promiseId,
    );
    if (
      getHexFromArrayBuffer(subTransaction.getBytes()) !==
      getHexFromArrayBuffer(promiseTransaction.getBytes())
    ) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `transaction with promiseId ${promiseId}`,
        be_compare_prop: `transaction with promiseId ${promiseId}`,
        to_target: "promiseResolveTransaction",
        be_target: "blockChain",
      });
    }
    const logicVerify = this.transactionLogicVerifierCore.getTransactionLogicVerifierFromType(
      subTransaction.type,
    );
    if (subTransaction.applyBlockHeight > currentBlockHeight) {
      throw new ConsensusException(ERROR_LIST.NOT_BEGIN_RESOLVE_YET, {
        promiseId,
      });
    }
    if (subTransaction.effectiveBlockHeight < currentBlockHeight) {
      throw new ConsensusException(ERROR_LIST.ALREADY_EXPIRED, {
        prop: `promise transaction ${promiseId}`,
        target: "blockChain",
      });
    }

    await logicVerify.verify(subTransaction, currentBlockHeight, accountMap, true, eventEmitter);

    return true;
  }

  /**
   * 校验交易的手续费是否大于等于网络手续费
   *
   * @param transaction
   * @param byteLength
   */
  checkTrsFeeAndWebFee(transaction: PromiseResolveTransaction, byteLength: number) {
    const resp = super.checkTrsFeeAndWebFee(transaction, byteLength);
    if (resp.isFeeEnough === false) {
      return resp;
    }
    const promiseTransaction = transaction.asset.resolve.transaction;
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
    transaction: PromiseResolveTransaction,
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
    const promiseTransaction = transaction.asset.resolve.transaction;
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
  checkTransactionBlobSize(
    transaction: PromiseResolveTransaction,
    miningMachineMaxBlobSize?: number,
  ) {
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
    const promiseTransaction = transaction.asset.resolve.transaction;
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

  /**
   * 不能二次操作同一笔交易(权益赠送/权益委托/权益迁入)
   *
   * @param transaction
   * @param currentBlockHeight
   */
  async checkSecondaryTransaction(
    transaction: PromiseResolveTransaction,
    currentBlockHeight: number,
  ) {
    const subTransaction = transaction.asset.resolve.transaction;
    const logicVerify = this.transactionLogicVerifierCore.getTransactionLogicVerifierFromType(
      subTransaction.type,
    );
    if (logicVerify.checkSecondaryTransaction) {
      await logicVerify.checkSecondaryTransaction(subTransaction, currentBlockHeight);
    }
  }

  /**
   * 校验注册受托人名额是否充足
   *
   * @param transaction
   * @param currentBlockHeight
   */
  async checkRegisterDelegateQuota(
    transaction: PromiseResolveTransaction,
    currentBlockHeight: number,
  ) {
    const subTransaction = transaction.asset.resolve.transaction;
    const logicVerify = this.transactionLogicVerifierCore.getTransactionLogicVerifierFromType(
      subTransaction.type,
    );
    if (logicVerify.checkRegisterDelegateQuota) {
      await logicVerify.checkRegisterDelegateQuota(subTransaction, currentBlockHeight);
    }
  }

  /**
   * 接收交易时调用
   *
   * @param transaction
   * @param currentBlockHeight
   */
  checkCertificateOnChainHeight(
    transaction: PromiseResolveTransaction,
    currentBlockHeight: number,
  ) {
    const subTransaction = transaction.asset.resolve.transaction;
    const logicVerify = this.transactionLogicVerifierCore.getTransactionLogicVerifierFromType(
      subTransaction.type,
    );
    if (logicVerify.checkCertificateOnChainHeight) {
      logicVerify.checkCertificateOnChainHeight(subTransaction, currentBlockHeight);
    }
  }

  /**
   * 在锻造区块，同步和重建时调用
   *
   * @param transaction
   * @param currentBlockHeight
   */
  isCertificateOnChainHeight(transaction: PromiseResolveTransaction, currentBlockHeight: number) {
    const subTransaction = transaction.asset.resolve.transaction;
    const logicVerify = this.transactionLogicVerifierCore.getTransactionLogicVerifierFromType(
      subTransaction.type,
    );
    if (logicVerify.isCertificateOnChainHeight) {
      logicVerify.isCertificateOnChainHeight(subTransaction, currentBlockHeight);
    }
  }

  /**
   * 获取需要被加锁的数据
   *
   * @param transaction
   */
  getLockData(transaction: PromiseResolveTransaction) {
    const { transaction: subTransaction, promiseId } = transaction.asset.resolve;
    const logicVerify = this.transactionLogicVerifierCore.getTransactionLogicVerifierFromType(
      subTransaction.type,
    );
    const locks = logicVerify.getLockData(subTransaction);
    locks.push(promiseId);
    return locks;
  }
}
