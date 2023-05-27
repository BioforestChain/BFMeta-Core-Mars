import type { IssueEntityTransactionV1 } from "@bfchain/core-model";
import { Injectable, Inject } from "@bfchain/util";
import { AccountBaseHelper, TransactionHelper } from "@bfchain/core-helper";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";

@Injectable()
export class IssueEntityV1LogicVerifier extends TransactionLogicVerifier {
  constructor(
    @Inject(AccountBaseHelper) public accountBaseHelper: AccountBaseHelper,
    @Inject(TransactionHelper) public transactionHelper: TransactionHelper,
  ) {
    super();
  }

  async verify(
    transaction: IssueEntityTransactionV1,
    currentBlockHeight: number,
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
    skipListenEvent: boolean,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountMap,
      accountGetterHelper,
      transactionGetterHelper,
    );

    const { eventLogicVerifier } = this;

    if (skipListenEvent === false) {
      eventLogicVerifier.listenEvent(
        accountMap,
        currentBlockHeight,
        accountGetterHelper,
        eventEmitter,
      );
    }

    await this.eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }

  /**
   * 获取需要被加锁的数据
   *
   * @param transaction
   */
  getLockData(transaction: IssueEntityTransactionV1) {
    return [transaction.asset.issueEntity.entityFactoryPossessor];
  }
}
