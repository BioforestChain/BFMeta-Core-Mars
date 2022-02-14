import type { IssueEntityTransactionV1 } from "@bfchain/core-model";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { Injectable, Inject, QueneEventEmitter } from "@bfchain/util";
import { AccountBaseHelper, TransactionHelper } from "@bfchain/core-helper";

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
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const { sender, recipient } = await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountsInfo,
      accountGetterHelper,
      transactionGetterHelper,
    );

    const cloneAccountsAssets = {
      [transaction.senderId]: this.helperLogicVerifier.deepClone(sender.accountAssets),
    };
    if (recipient && recipient.accountInfo && recipient.accountAssets) {
      const address = recipient.accountInfo.address;
      cloneAccountsAssets[address] = this.helperLogicVerifier.deepClone(recipient.accountAssets);
    }

    const eventEmitter = new QueneEventEmitter() as BFChainCore.ApplyTransactionEventEmitter;

    // 手续费
    this.eventLogicVerifier.listenEventFee(cloneAccountsAssets, eventEmitter);

    // 单项冻结
    this.eventLogicVerifier.listenEventFrozenAsset(cloneAccountsAssets, eventEmitter);

    // 购买 entityFactory 使用权
    this.eventLogicVerifier.listenEventAsset(cloneAccountsAssets, eventEmitter);

    // 发行 entityId
    const accountAssets = this.helperLogicVerifier.deepClone(sender.accountAssets);
    this.eventLogicVerifier.listenEventIssueEntityV1(
      accountAssets,
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    await this.eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }

  /**
   * 获取需要被加锁的数据
   *
   * @param transaction
   */
  getLockData(transaction: IssueEntityTransactionV1) {
    return [transaction.type];
  }
}
