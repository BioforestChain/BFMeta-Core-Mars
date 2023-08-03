import { MacroTransaction, MacroCallTransaction } from "@bfchain/core-model";
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
  "MacroCallLogicVerifier",
);

@Injectable()
export class MacroCallLogicVerifier extends TransactionLogicVerifier {
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
    transaction: MacroCallTransaction,
    currentBlockHeight: number,
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    skipListenEvent: boolean,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    const { macroId, inputs } = transaction.asset.call;
    const macroTransactionJson = await this.transactionGetterHelper.getTransactionBySignature(
      macroId,
      this.transactionHelper.calcTransactionQueryRange(currentBlockHeight),
    );
    if (!macroTransactionJson) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST_OR_EXPIRED, {
        prop: `Transaction with signature ${macroId}`,
        target: "blockChain",
      });
    }
    const model = await this.transactionCore.recombineTransaction(macroTransactionJson);
    const macroTransaction = model.as(MacroTransaction, macroId);
    if (!macroTransaction) {
      throw new ConsensusException(ERROR_LIST.NOT_EXPECTED_RELATED_TRANSACTION, {
        signature: `${macroId}`,
      });
    }
    this.isInputMatch(inputs, macroTransaction.asset.macro.inputs);
    const subTransaction = await this.isTransactionMatch(macroId, transaction);

    await this.logicVerify(transaction, currentBlockHeight, accountMap);

    const { eventLogicVerifier } = this;

    if (skipListenEvent === false) {
      eventLogicVerifier.listenEvent(accountMap, currentBlockHeight, eventEmitter);
    }

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    /// 逻辑校验
    const logicVerify = this.transactionLogicVerifierCore.getTransactionLogicVerifierFromType(
      subTransaction.type,
    );
    await logicVerify.verify(subTransaction, currentBlockHeight, accountMap, true, eventEmitter);

    return true;
  }

  isInputMatch(inputs: BFChainCore.MacroCallInputs, defaultInputs: BFChainCore.Macro.InputJSON[]) {
    const inputNames = defaultInputs.map((input) => input.name);
    for (const inputName in inputs) {
      if (inputNames.includes(inputName) === false) {
        throw new ConsensusException(ERROR_LIST.SHOULD_NOT_EXIST, {
          prop: `input ${inputName}`,
          target: `inputs`,
        });
      }
    }
  }

  async isTransactionMatch(macroId: string, transaction: MacroCallTransaction) {
    const callTransaction = await this.complexTransactionLogicHelper.getMacroCallTransaction(
      transaction,
    );
    const subTransaction = transaction.asset.call.transaction;
    if (
      getHexFromArrayBuffer(subTransaction.getBytes()) !==
      getHexFromArrayBuffer(callTransaction.getBytes())
    ) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `transaction with macroId ${macroId}`,
        be_compare_prop: `transaction with macroId ${macroId}`,
        to_target: "MacroCallTransaction",
        be_target: "blockChain",
      });
    }
    return subTransaction;
  }

  /**
   * 校验交易的手续费是否大于等于网络手续费
   *
   * @param transaction
   * @param byteLength
   */
  async checkTrsFeeAndWebFee(transaction: MacroCallTransaction, byteLength: number) {
    const resp = await super.checkTrsFeeAndWebFee(transaction, byteLength);
    if (resp.isFeeEnough === false) {
      return resp;
    }
    const macroTransaction = transaction.asset.call.transaction;
    const logicVerify = this.transactionLogicVerifierCore.getTransactionLogicVerifierFromType(
      macroTransaction.type,
    );
    const result = await logicVerify.checkTrsFeeAndWebFee(
      macroTransaction,
      macroTransaction.getBytes().length,
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
    transaction: MacroCallTransaction,
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
    const macroTransaction = transaction.asset.call.transaction;
    const logicVerify = this.transactionLogicVerifierCore.getTransactionLogicVerifierFromType(
      macroTransaction.type,
    );
    const result = await logicVerify.checkTrsFeeAndMiningMachineFeeAndWebFee(
      macroTransaction,
      macroTransaction.getBytes().length,
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
    transaction: MacroCallTransaction,
    currentBlockHeight: number,
    numberOfTransaction: 0 | 1 = 0,
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
  async checkSecondaryTransaction(transaction: MacroCallTransaction, currentBlockHeight: number) {
    const subTransaction = transaction.asset.call.transaction;
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
  async checkRegisterDelegateQuota(transaction: MacroCallTransaction, currentBlockHeight: number) {
    const subTransaction = transaction.asset.call.transaction;
    const logicVerify = this.transactionLogicVerifierCore.getTransactionLogicVerifierFromType(
      subTransaction.type,
    );
    if (logicVerify.checkRegisterDelegateQuota) {
      await logicVerify.checkRegisterDelegateQuota(subTransaction, currentBlockHeight);
    }
  }

  /**
   * 获取需要被加锁的数据
   *
   * @param transaction
   */
  getLockData(transaction: MacroCallTransaction) {
    const { transaction: subTransaction, macroId } = transaction.asset.call;
    const logicVerify = this.transactionLogicVerifierCore.getTransactionLogicVerifierFromType(
      subTransaction.type,
    );
    const locks = logicVerify.getLockData(subTransaction);
    locks.push(macroId);
    return locks;
  }
}
