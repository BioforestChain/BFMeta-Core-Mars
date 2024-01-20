import type { MultipleTransaction } from "@bfchain/core-model";
import { Injectable, Inject } from "@bfchain/util";
import {
  TransactionLogicVerifier,
  TransactionLogicVerifierCore,
} from "@bfchain/core-transaction-logic-verifier";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { ComplexTransactionLogicHelper } from "./complexTransactionLogicHelper";

const { ConsensusException } = CoreExceptionGenerator("VERIFIER", "MultipleLogicVerifier");

@Injectable()
export class MultipleLogicVerifier extends TransactionLogicVerifier {
  @Inject(ComplexTransactionLogicHelper)
  protected complexTransactionLogicHelper!: ComplexTransactionLogicHelper;
  @Inject("bfchain-core:TransactionLogicVerifierCore", { dynamics: true })
  public transactionLogicVerifierCore!: TransactionLogicVerifierCore;

  constructor() {
    super();
  }

  async verify(
    transaction: MultipleTransaction,
    currentBlockHeight: number,
    accountMap: Map<string, BFChainCore.AccountInfo>,
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
   * 校验交易的手续费是否大于等于网络手续费
   *
   * @param transaction
   * @param byteLength
   */
  checkTrsFeeAndWebFee(transaction: MultipleTransaction, byteLength: number) {
    const resp = super.checkTrsFeeAndWebFee(transaction, byteLength);
    if (resp.isFeeEnough === false) {
      return resp;
    }
    let result!: {
      signature: string;
      isFeeEnough: boolean;
      minFee: string;
    };
    const { transactions } = transaction.asset.multiple;
    for (const subTransaction of transactions) {
      const verifier = this.transactionLogicVerifierCore.getTransactionLogicVerifierFromType(
        subTransaction.type,
      );
      result = verifier.checkTrsFeeAndWebFee(subTransaction, subTransaction.getBytes().length);
      if (result.isFeeEnough === false) {
        return result;
      }
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
    transaction: MultipleTransaction,
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
    let result!: {
      signature: string;
      isFeeEnough: boolean;
      minFee: string;
    };
    const { transactions } = transaction.asset.multiple;
    for (const subTransaction of transactions) {
      const verifier = this.transactionLogicVerifierCore.getTransactionLogicVerifierFromType(
        subTransaction.type,
      );
      result = verifier.checkTrsFeeAndMiningMachineFeeAndWebFee(
        subTransaction,
        subTransaction.getBytes().length,
        miningMachineMinFeePerByte,
      );
      if (result.isFeeEnough === false) {
        return result;
      }
    }
    return resp;
  }

  /**
   * 检验交易的 blobSize 是否大于矿机和网络最大 blobSize
   *
   * @param transaction
   * @param miningMachineMaxBlobSize
   */
  checkTransactionBlobSize(transaction: MultipleTransaction, miningMachineMaxBlobSize?: number) {
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
    const { transactions } = transaction.asset.multiple;
    for (const subTransaction of transactions) {
      const verifier = this.transactionLogicVerifierCore.getTransactionLogicVerifierFromType(
        subTransaction.type,
      );
      verifier.checkTransactionBlobSize(subTransaction, miningMachineMaxBlobSize);
    }
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

  /**
   * 不能二次操作同一笔交易(权益赠送/权益委托/权益迁入)
   *
   * @param transaction
   * @param currentBlockHeight
   */
  async checkSecondaryTransaction(transaction: MultipleTransaction, currentBlockHeight: number) {
    const { transactions } = transaction.asset.multiple;
    for (const subTransaction of transactions) {
      const logicVerify = this.transactionLogicVerifierCore.getTransactionLogicVerifierFromType(
        subTransaction.type,
      );
      if (logicVerify.checkSecondaryTransaction) {
        await logicVerify.checkSecondaryTransaction(subTransaction, currentBlockHeight);
      }
    }
  }

  /**
   * 接收交易时调用
   *
   * @param transaction
   * @param currentBlockHeight
   */
  checkCertificateOnChainHeight(transaction: MultipleTransaction, currentBlockHeight: number) {
    const { transactions } = transaction.asset.multiple;
    for (const subTransaction of transactions) {
      const logicVerify = this.transactionLogicVerifierCore.getTransactionLogicVerifierFromType(
        subTransaction.type,
      );
      if (logicVerify.checkCertificateOnChainHeight) {
        logicVerify.checkCertificateOnChainHeight(subTransaction, currentBlockHeight);
      }
    }
  }

  /**
   * 在锻造区块，同步和重建时调用
   *
   * @param transaction
   * @param currentBlockHeight
   */
  isCertificateOnChainHeight(transaction: MultipleTransaction, currentBlockHeight: number) {
    const { transactions } = transaction.asset.multiple;
    for (const subTransaction of transactions) {
      const logicVerify = this.transactionLogicVerifierCore.getTransactionLogicVerifierFromType(
        subTransaction.type,
      );
      if (logicVerify.isCertificateOnChainHeight) {
        logicVerify.isCertificateOnChainHeight(subTransaction, currentBlockHeight);
      }
    }
  }

  /**
   * 获取需要被加锁的数据
   *
   * @param transaction
   */
  getLockData(transaction: MultipleTransaction) {
    const { transactions } = transaction.asset.multiple;
    const locks: string[] = [];
    for (const subTransaction of transactions) {
      const logicVerify = this.transactionLogicVerifierCore.getTransactionLogicVerifierFromType(
        subTransaction.type,
      );
      const results = logicVerify.getLockData(subTransaction);
      locks.push(...results);
    }
    return locks;
  }
}
