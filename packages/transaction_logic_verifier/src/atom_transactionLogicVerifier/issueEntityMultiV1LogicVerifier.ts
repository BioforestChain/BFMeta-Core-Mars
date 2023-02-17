import { IssueEntityMultiTransactionV1, NewTransactionRefuseReason } from "@bfchain/core-model";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { Injectable, Inject, QueneEventEmitter } from "@bfchain/util";
import { AccountBaseHelper, TransactionHelper } from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";

const { ConsensusException } = CoreExceptionGenerator(
  "CONTROLLER",
  "IssueEntityMultiV1LogicVerifier",
);

@Injectable()
export class IssueEntityMultiV1LogicVerifier extends TransactionLogicVerifier {
  constructor(
    @Inject(AccountBaseHelper) public accountBaseHelper: AccountBaseHelper,
    @Inject(TransactionHelper) public transactionHelper: TransactionHelper,
  ) {
    super();
  }

  async verify(
    transaction: IssueEntityMultiTransactionV1,
    currentBlockHeight: number,
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    this.__checkTrsFee(transaction);

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
    this.eventLogicVerifier.listenEventIssueEntityMultiV1(
      accountAssets,
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    await this.eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }

  private __checkTrsFee(transaction: IssueEntityMultiTransactionV1) {
    const minFee = this.transactionHelper.calcTransactionMinFeeByMulti(
      transaction,
      transaction.asset.issueEntityMulti.entityStructList.length,
    );
    if (BigInt(transaction.fee) < BigInt(minFee)) {
      throw new ConsensusException(ERROR_LIST.TRANSACTION_FEE_NOT_ENOUGH, {
        errorId: NewTransactionRefuseReason.TRANSACTION_FEE_NOT_ENOUGH,
        minFee,
        target: "transaction",
      });
    }
  }

  /**
   * 校验交易的手续费是否大于等于网络手续费
   *
   * @param transaction
   * @param byteLength
   */
  checkTrsFeeAndWebFee(transaction: IssueEntityMultiTransactionV1, byteLength: number) {
    return this.isFeeEnough(
      transaction.fee,
      (
        this.transactionHelper.calcTransactionMinFeeByMulti(
          transaction,
          transaction.asset.issueEntityMulti.entityStructList.length,
        ) + this.transactionHelper.calcTransactionBlobFee(transaction)
      ).toString(),
    );
  }

  /**
   * 检验交易的手续费是否大于等于矿机手续费和网络手续费
   *
   * @param transaction
   * @param byteLength
   * @param miningMachineMinFeePerByte
   */
  checkTrsFeeAndMiningMachineFeeAndWebFee(
    transaction: IssueEntityMultiTransactionV1,
    byteLength: number,
    miningMachineMinFeePerByte: BFChainCore.FractionJSON,
  ) {
    return this.isFeeEnough(
      transaction.fee,
      (
        this.transactionHelper.calcTransactionMinFeeByMulti(
          transaction,
          transaction.asset.issueEntityMulti.entityStructList.length,
          undefined,
          miningMachineMinFeePerByte,
        ) + this.transactionHelper.calcTransactionBlobFee(transaction, miningMachineMinFeePerByte)
      ).toString(),
    );
  }

  /**
   * 获取需要被加锁的数据
   *
   * @param transaction
   */
  getLockData(transaction: IssueEntityMultiTransactionV1) {
    return [transaction.asset.issueEntityMulti.entityFactoryPossessor];
  }
}
