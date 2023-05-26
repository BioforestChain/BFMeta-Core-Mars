import type { MacroCallTransaction } from "@bfchain/core-model";
import { Injectable, Inject } from "@bfchain/util";
import { TransactionCore } from "@bfchain/core-transaction";
import {
  TransactionLogicVerifier,
  TransactionLogicVerifierCore,
} from "@bfchain/core-transaction-logic-verifier";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "MacroCallLogicVerifier",
);

@Injectable()
export class MacroCallLogicVerifier extends TransactionLogicVerifier {
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
    await this.logicVerify(transaction, currentBlockHeight, accountMap);

    const { eventLogicVerifier } = this;

    if (skipListenEvent === false) {
      eventLogicVerifier.listenEvent(accountMap, currentBlockHeight, eventEmitter);
    }

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    const { macroId, inputs } = transaction.asset.call;

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

    const logicVerify = this.transactionLogicVerifierCore.getTransactionLogicVerifierFromType(
      macroTransactionJson.type,
    );
    const macroTransaction = await this.transactionCore.recombineTransaction(macroTransactionJson);
    await logicVerify.verify(macroTransaction, currentBlockHeight, accountMap, true, eventEmitter);

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
    transaction: MacroCallTransaction,
    currentBlockHeight: number,
    numberOfTransaction: 0 | 1 = 0,
  ) {
    const { macroId, inputs } = transaction.asset.call;
    const macroTransaction = await this.transactionGetterHelper.getMacroCallTransaction(
      macroId,
      inputs,
    );
    if (!macroTransaction) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: `Macro transaction with macroId ${macroId}`,
        target: "blockChain",
      });
    }
    const signatures = [transaction.signature, macroTransaction.signature];
    const applyBlockHeight =
      transaction.applyBlockHeight > macroTransaction.applyBlockHeight
        ? macroTransaction.applyBlockHeight
        : transaction.applyBlockHeight;
    const txCount = await this.transactionGetterHelper.countTransactionsInBlockChainBySignature(
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
