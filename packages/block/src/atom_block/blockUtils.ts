import type {
  MacroCallTransaction,
  MultipleTransaction,
  PromiseResolveTransaction,
} from "@bfchain/core-model-transaction-complex";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { Injectable, Inject } from "@bfchain/util";
const { ConsensusException } = CoreExceptionGenerator("CONTROLLER", "_blockbase");

@Injectable()
export class BlockUtils {
  @Inject("bfchain-core:TransactionCore")
  public transactionCore!: import("@bfchain/core-transaction").TransactionCore;

  async applyTransaction(
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
    transaction: BFChainCore.Transaction,
  ) {
    const type = transaction.type;
    const transactionCore = this.transactionCore;
    const transactionHelper = transactionCore.transactionHelper;
    const txFactory = transactionCore.getTransactionFactoryFromType(type);
    /// 把自己生效
    await txFactory.applyTransaction(transaction, eventEmitter);
    /// 把龟儿子生效
    if (type === transactionHelper.MULTIPLE) {
      const { transactions } = (transaction as MultipleTransaction).asset.multiple;
      for (const subTransaction of transactions) {
        await this.applyTransaction(eventEmitter, transactionGetterHelper, subTransaction);
      }
    } else if (type === transactionHelper.PROMISE_RESOLVE) {
      const { promiseId } = (transaction as PromiseResolveTransaction).asset.resolve;
      const promiseTransactionJson = await transactionGetterHelper.getPromiseTransaction(promiseId);
      if (!promiseTransactionJson) {
        throw new ConsensusException(ERROR_LIST.NOT_EXIST, {
          prop: `promise transaction ${promiseId}`,
          target: "blockChain",
        });
      }
      const promiseTransaction = await transactionCore.recombineTransaction(promiseTransactionJson);
      const promiseType = promiseTransaction.type;
      if (
        promiseType === transactionHelper.MULTIPLE ||
        promiseType === transactionHelper.PROMISE_RESOLVE ||
        promiseType === transactionHelper.MACRO_CALL
      ) {
        await this.applyTransaction(eventEmitter, transactionGetterHelper, promiseTransaction);
      } else {
        const factory = transactionCore.getTransactionFactoryFromType(promiseTransaction.type);
        await factory.applyTransaction(promiseTransaction, eventEmitter);
      }
    } else if (type === transactionHelper.MACRO_CALL) {
      const { macroId, inputs } = (transaction as MacroCallTransaction).asset.call;
      const macroTransactionJson = await transactionGetterHelper.getMacroCallTransaction(
        macroId,
        inputs,
      );
      if (!macroTransactionJson) {
        throw new ConsensusException(ERROR_LIST.NOT_EXIST, {
          prop: `macro transaction ${macroId}`,
          target: "blockChain",
        });
      }
      const macroTransaction = await transactionCore.recombineTransaction(macroTransactionJson);
      const macroType = macroTransaction.type;
      if (
        macroType === transactionHelper.MULTIPLE ||
        macroType === transactionHelper.PROMISE_RESOLVE ||
        macroType === transactionHelper.MACRO_CALL
      ) {
        await this.applyTransaction(eventEmitter, transactionGetterHelper, macroTransaction);
      } else {
        const factory = transactionCore.getTransactionFactoryFromType(macroTransaction.type);
        await factory.applyTransaction(macroTransaction, eventEmitter);
      }
    }
  }
}
