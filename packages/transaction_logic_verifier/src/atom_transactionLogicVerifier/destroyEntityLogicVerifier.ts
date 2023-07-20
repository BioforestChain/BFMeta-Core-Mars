import {
  IssueEntityTransactionV1,
  IssueEntityMultiTransactionV1,
  DestroyEntityTransaction,
} from "@bfchain/core-model";
import { Injectable, Inject } from "@bfchain/util";
import { TransactionCore } from "@bfchain/core-transaction";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "DestroyEntityLogicVerifier",
);

@Injectable()
export class DestroyEntityLogicVerifier extends TransactionLogicVerifier {
  @Inject("bfchain-core:TransactionCore", { dynamics: true })
  public transactionCore!: TransactionCore;

  constructor() {
    super();
  }

  async verify(
    transaction: DestroyEntityTransaction,
    currentBlockHeight: number,
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    skipListenEvent: boolean,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    const destroyEntity = transaction.asset.destroyEntity;

    const { transactionSignature } = destroyEntity;
    const trsWithBlockSign =
      await this.transactionGetterHelper.getTransactionAndBlockSignatureBySignature(
        transactionSignature,
        this.transactionHelper.calcTransactionQueryRange(currentBlockHeight),
      );
    if (!trsWithBlockSign) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST_OR_EXPIRED, {
        prop: `Transaction with signature ${transactionSignature}`,
        target: "destroyEntity",
      });
    }
    let issueEntitySenderId = "";
    const trsJson = trsWithBlockSign.transaction;
    const model = await this.transactionCore.recombineTransaction(trsJson);
    const issueEntityTransaction = model.as(IssueEntityTransactionV1, transactionSignature);
    if (issueEntityTransaction) {
      const entityInfo = issueEntityTransaction.asset.issueEntity;
      if (entityInfo.entityId !== destroyEntity.entityId) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `entityId ${destroyEntity.entityId}`,
          be_compare_prop: `entityId ${entityInfo.entityId}`,
          to_target: "transaction",
          be_target: "issueEntityTransaction",
        });
      }
      issueEntitySenderId = issueEntityTransaction.senderId;
    } else {
      const issueEntityMultiTransaction = model.as(
        IssueEntityMultiTransactionV1,
        transactionSignature,
      );
      if (!issueEntityMultiTransaction) {
        throw new ConsensusException(ERROR_LIST.NOT_EXPECTED_RELATED_TRANSACTION, {
          signature: `${transactionSignature}`,
        });
      }
      const entityList = issueEntityMultiTransaction.asset.issueEntityMulti.entityStructList.map(
        (item) => item.entityId,
      );
      if (!entityList.includes(destroyEntity.entityId)) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `entityId ${destroyEntity.entityId}`,
          be_compare_prop: `entityId [${entityList.slice(0, 3).join(",")}...]`,
          to_target: "transaction",
          be_target: "issueEntityMultiTransaction",
        });
      }
      issueEntitySenderId = issueEntityMultiTransaction.senderId;
    }
    if (transaction.recipientId !== issueEntitySenderId) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `recipientId ${transaction.recipientId}`,
        be_compare_prop: `entityApplicant ${issueEntitySenderId}`,
        to_target: "transaction",
        be_target: "issueEntityTransaction",
      });
    }

    await this.logicVerify(transaction, currentBlockHeight, accountMap);

    const { eventLogicVerifier } = this;

    if (skipListenEvent === false) {
      eventLogicVerifier.listenEvent(accountMap, currentBlockHeight, eventEmitter);
    }

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }

  /**
   * 获取需要被加锁的数据
   *
   * @param transaction
   */
  getLockData(transaction: DestroyEntityTransaction) {
    const { entityFactoryApplicant, entityFactoryPossessor, entityId } =
      transaction.asset.destroyEntity;
    return [entityFactoryApplicant, entityFactoryPossessor, entityId];
  }
}
