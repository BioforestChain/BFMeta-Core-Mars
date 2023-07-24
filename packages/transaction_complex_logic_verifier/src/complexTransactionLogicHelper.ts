import type {
  MacroCallTransaction,
  MultipleTransaction,
  PromiseResolveTransaction,
  PromiseTransaction,
} from "@bfchain/core-model-transaction-complex";
import { Injectable, Inject } from "@bfchain/util";
import { TransactionHelper } from "@bfchain/core-helper-transaction";
import { TransactionCore } from "@bfchain/core-transaction";
import {
  MemoryCache,
  TransactionLogicVerifierCore,
} from "@bfchain/core-transaction-logic-verifier";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";

const { NoFoundException } = CoreExceptionGenerator("VERIFIER", "LogicHelper");

@Injectable()
export class ComplexTransactionLogicHelper {
  @Inject(MemoryCache)
  protected memoryCache!: MemoryCache;
  @Inject(TransactionHelper)
  protected transactionHelper!: TransactionHelper;

  @Inject("bfchain-core:TransactionCore", { dynamics: true })
  public transactionCore!: TransactionCore;
  @Inject("bfchain-core:TransactionLogicVerifierCore", { dynamics: true })
  public transactionLogicVerifierCore!: TransactionLogicVerifierCore;
  @Inject("transactionGetterHelper", { dynamics: true })
  protected transactionGetterHelper!: BFChainCore.TransactionGetterHelperInterface;

  async getMacroCallTransaction(transaction: MacroCallTransaction) {
    const { macroId, inputs } = transaction.asset.call;
    let macroTransaction = this.memoryCache.getCache(macroId);
    if (macroTransaction === undefined) {
      const macroTransactionJson = await this.transactionGetterHelper.getMacroCallTransaction(
        macroId,
        inputs,
      );
      if (!macroTransactionJson) {
        throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
          prop: `Macro call transaction with macroId ${macroId}`,
          target: "blockChain",
        });
      }
      macroTransaction = await this.transactionCore.recombineTransaction(macroTransactionJson);
      this.memoryCache.setCache(macroId, macroTransaction);
    }
    return macroTransaction;
  }

  async getPromiseTransaction(promiseId: string) {
    let promiseTransaction = this.memoryCache.getCache(promiseId);
    if (promiseTransaction === undefined) {
      const promiseTransactionJson = await this.transactionGetterHelper.getPromiseTransaction(
        promiseId,
      );
      if (!promiseTransactionJson) {
        throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
          prop: `Promise transaction ${promiseId}`,
          target: "blockChain",
        });
      }
      promiseTransaction = await this.transactionCore.recombineTransaction(promiseTransactionJson);
      this.memoryCache.setCache(promiseId, promiseTransaction);
    }
    return promiseTransaction;
  }

  async getCheckRepeatInfo(transaction: BFChainCore.Transaction, skipPromise = false) {
    let count = 0;
    let minHeight = transaction.applyBlockHeight;
    const ids: string[] = [];
    const func = async (trs: BFChainCore.Transaction) => {
      switch (trs.type) {
        case this.transactionHelper.MULTIPLE: {
          const subTransactions = (trs as MultipleTransaction).asset.multiple.transactions;
          for (const subTransaction of subTransactions) {
            await func(subTransaction);
          }
          break;
        }
        case this.transactionHelper.MACRO_CALL: {
          const macroTransaction = await this.getMacroCallTransaction(trs as MacroCallTransaction);
          await func(macroTransaction);
          break;
        }
        case this.transactionHelper.PROMISE: {
          /// 打块的时候所有交易都没有上链
          /// 重建的时候除了 promise 外其他交易都已经上链了
          if (skipPromise === false) {
            const promiseTransaction = (trs as PromiseTransaction).asset.promise.transaction;
            await func(promiseTransaction);
          }
          break;
        }
        case this.transactionHelper.PROMISE_RESOLVE: {
          const promiseTransaction = await this.getPromiseTransaction(
            (trs as PromiseResolveTransaction).asset.resolve.promiseId,
          );
          await func(promiseTransaction);
          break;
        }
        default:
          break;
      }
      if (minHeight > trs.applyBlockHeight) {
        minHeight = trs.applyBlockHeight;
      }
      count += 1;
      ids.push(trs.signature);
    };
    await func(transaction);
    return {
      minHeight,
      count,
      ids,
    };
  }
}
