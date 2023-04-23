import type { DestoryEntityTransaction } from "@bfchain/core-model";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { Injectable, QueneEventEmitter } from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "GrabAssetLogicVerifier",
);

@Injectable()
export class DestoryEntityLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: DestoryEntityTransaction,
    currentBlockHeight: number,
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const destoryEntity = transaction.asset.destoryEntity;

    const { transactionSignature } = destoryEntity;
    const trsWithBlockSign =
      await transactionGetterHelper.getTransactionAndBlockSignatureBySignature(
        transactionSignature,
        this.transactionHelper.calcTransactionQueryRange(currentBlockHeight),
      );

    if (!trsWithBlockSign) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST_OR_EXPIRED, {
        prop: `Transaction with signature ${transactionSignature}`,
        target: "destoryEntity",
      });
    }

    const trs = trsWithBlockSign.transaction;
    if (trs.type === this.transactionHelper.ISSUE_ENTITY) {
      const entityInfo = (trs as BFChainCore.IssueEntityTransactionJSON).asset.issueEntity;
      if (entityInfo.entityId !== destoryEntity.entityId) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `entityId ${destoryEntity.entityId}`,
          be_compare_prop: `entityId ${entityInfo.entityId}`,
          to_target: "transaction",
          be_target: "issueEntityTransaction",
        });
      }
    } else if (trs.type === this.transactionHelper.ISSUE_ENTITY_MULTI) {
      const entityList = (
        trs as BFChainCore.IssueEntityMultiTransactionV1JSON
      ).asset.issueEntityMulti.entityStructList.map((item) => item.entityId);
      if (!entityList.includes(destoryEntity.entityId)) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `entityId ${destoryEntity.entityId}`,
          be_compare_prop: `entityId [${entityList.slice(0, 3).join(",")}...]`,
          to_target: "transaction",
          be_target: "issueEntityTransaction",
        });
      }
    } else {
      throw new ConsensusException(ERROR_LIST.NOT_EXPECTED_RELATED_TRANSACTION, {
        signature: `${transactionSignature}`,
      });
    }

    if (transaction.recipientId !== trs.senderId) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `recipientId ${transaction.recipientId}`,
        be_compare_prop: `entityApplicant ${trs.senderId}`,
        to_target: "transaction",
        be_target: "issueEntityTransaction",
      });
    }

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

    // 赎回单项冻结的资产
    this.eventLogicVerifier.listenEventUnfrozenAsset(
      currentBlockHeight,
      accountGetterHelper,
      eventEmitter,
    );

    // 销毁 entity
    this.eventLogicVerifier.listenEventDestoryEntity(
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
  getLockData(transaction: DestoryEntityTransaction) {
    const { entityFactoryApplicant, entityFactoryPossessor, entityId } =
      transaction.asset.destoryEntity;
    return [entityFactoryApplicant, entityFactoryPossessor, entityId];
  }
}
