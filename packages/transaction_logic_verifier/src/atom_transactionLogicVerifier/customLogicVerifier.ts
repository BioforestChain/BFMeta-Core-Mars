import type { CustomTransaction } from "@bfchain/core-model";
import { Injectable, Inject } from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";

const { NoFoundException, ArgumentIllegalException, ConsensusException } = CoreExceptionGenerator(
  "VERIFIER",
  "CustomLogicVerifier",
);

@Injectable()
export class CustomLogicVerifier extends TransactionLogicVerifier {
  @Inject("customTransactionCenter", { optional: true, dynamics: true })
  customTransactionCenter?: BFChainCore.CustomTrCenterInterface;

  constructor() {
    super();
  }

  async verify(
    transaction: CustomTransaction,
    currentBlockHeight: number,
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
    skipListenEvent = false,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ): Promise<boolean> {
    await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountMap,
      accountGetterHelper,
      transactionGetterHelper,
    );

    const { eventLogicVerifier, helperLogicVerifier } = this;

    if (skipListenEvent === false) {
      eventLogicVerifier.listenEvent(
        accountMap,
        currentBlockHeight,
        accountGetterHelper,
        eventEmitter,
      );
    }

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    if (!this.customTransactionCenter) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "customTransactionCenter",
        target: "moduleStroge",
      });
    }

    const result = await this.customTransactionCenter.logicVerify(transaction);

    if (!(result && result.ret)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "transaction",
        target: "transaction",
      });
    }

    return true;
  }

  async checkRegisterDelegateQuota(
    currentBlockHeight: number,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const { maxDelegateTxsPerRound } = this.configHelper;
    const txCount = await transactionGetterHelper.getNumberOfNewDelegate();
    let realMaxDelegateTxsPerRound = maxDelegateTxsPerRound;

    const curRound = this.blockHelper.calcRoundByHeight(currentBlockHeight);
    if (currentBlockHeight < this.configHelper.blockPerRound) {
      realMaxDelegateTxsPerRound = realMaxDelegateTxsPerRound + this.configHelper.delegates;
    }
    if (txCount >= realMaxDelegateTxsPerRound) {
      throw new ConsensusException(ERROR_LIST.REGISTER_DELEGTE_QUOTA_FULL, {
        round: curRound,
      });
    }
  }
}
