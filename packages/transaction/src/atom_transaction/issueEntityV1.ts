import { IssueEntityTransactionFactory } from "./issueEntity";
import { IssueEntityTransactionV1, ASSET_STATUS } from "@bfchain/core-model";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { Injectable, wrapTaskList } from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "IssueEntityTransactionFactory",
);

/**
 * issueEntity 交易工厂
 *
 */
@Injectable()
export class IssueEntityTransactionFactoryV1 extends IssueEntityTransactionFactory<IssueEntityTransactionV1> {
  /**
   * 校验输入信息
   *
   * @param body
   * @param issueAssetAsset
   * @param config
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    issueEntityAsset: BFChainCore.IssueEntityAssetV1JSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, issueEntityAsset, config);

    const IssueEntityAsset_Exception_Detail = {
      target: "issueEntityAsset",
    } as const;

    const { taxAssetPrealnum } = issueEntityAsset.issueEntity;

    if (!taxAssetPrealnum) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "taxAssetPrealnum",
        ...IssueEntityAsset_Exception_Detail,
      });
    }

    if (!this.baseHelper.isValidAssetPrealnum(taxAssetPrealnum)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `taxAssetPrealnum ${taxAssetPrealnum}`,
        ...IssueEntityAsset_Exception_Detail,
      });
    }
  }

  /**
   * 初始化 isuseEntity 交易
   *
   * @param body
   * @param issueEntityAsset
   */
  async init(body: BFChainCore.TxBodyJSON, issueEntityAsset: BFChainCore.IssueEntityAssetV1JSON) {
    const transaction = IssueEntityTransactionV1.fromObject({
      ...body,
      asset: issueEntityAsset,
    });

    transaction.subIdBuffer = await this.transactionHelper.generateSubId(transaction.getSubBytes());
    return transaction;
  }

  /**
   * 交易生效，对账务产生影响
   *
   * @param transaction
   * @param eventEmitter
   */
  async applyTransaction(
    transaction: IssueEntityTransactionV1,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      const { senderId, recipientId, senderPublicKeyBuffer, signatureBuffer, fee } = transaction;
      const {
        sourceChainName,
        sourceChainMagic,
        entityId,
        taxAssetPrealnum,
        entityFactoryPossessor,
        entityFactory,
      } = transaction.asset.issueEntity;
      const { factoryId, entityFrozenAssetPrealnum, purchaseAssetPrealnum } = entityFactory;
      // 扣除手续费
      const assetInfo = this.chainAssetInfoHelper.getAssetInfo(config.magic, config.assetType);
      taskList.next = eventEmitter.emit("fee", {
        type: "fee",
        transaction,
        applyInfo: {
          address: senderId,
          publicKeyBuffer: senderPublicKeyBuffer,
          assetInfo,
          amount: "-" + fee,
          sourceAmount: fee,
        },
      });
      // 发行 entity
      taskList.next = eventEmitter.emit("issueEntityV1", {
        type: "issueEntityV1",
        transaction,
        applyInfo: {
          address: senderId,
          publicKeyBuffer: senderPublicKeyBuffer,
          sourceChainName,
          sourceChainMagic,
          factoryId,
          entityId,
          taxAssetPrealnum,
          possessorAddress: recipientId,
          entityFactoryPossessorAddress: entityFactoryPossessor,
          entityFrozenAssetPrealnum,
          issueIdBuffer: signatureBuffer,
          status: ASSET_STATUS.NORMAL,
        },
      });
      // 冻结主权益，销毁时赎回
      if (entityFrozenAssetPrealnum !== "0") {
        const minEffectiveHeight =
          this.transactionHelper.getTransactionMinEffectiveHeight(transaction);
        const maxEffectiveHeight = Number.MAX_SAFE_INTEGER;
        taskList.next = eventEmitter.emit("frozenAsset", {
          type: "frozenAsset",
          transaction,
          applyInfo: {
            address: senderId,
            publicKeyBuffer: senderPublicKeyBuffer,
            assetInfo,
            amount: `-${entityFrozenAssetPrealnum}`,
            sourceAmount: entityFrozenAssetPrealnum,
            frozenIdBuffer: signatureBuffer,
            minEffectiveHeight,
            maxEffectiveHeight,
            totalUnfrozenTimes: 1,
          },
        });
      }
      // 付费
      if (purchaseAssetPrealnum !== "0") {
        // 扣除资产
        taskList.next = this._applyTransactionEmitAsset(
          eventEmitter,
          transaction,
          purchaseAssetPrealnum,
          {
            senderId,
            senderPublicKeyBuffer: senderPublicKeyBuffer,
            recipientId: entityFactoryPossessor,
            assetInfo,
          },
        );
      }
    });
  }

  /**
   * 获取变动的权益数
   *
   * @param transaction
   * @param argv
   * @returns
   */
  getMoveAmount(
    transaction: IssueEntityTransactionV1,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    const { sourceChainMagic, entityFrozenAssetPrealnum, purchaseAssetPrealnum } =
      transaction.asset.issueEntity.entityFactory;
    if (argv.magic === sourceChainMagic && argv.assetType === this.configHelper.assetType) {
      return (BigInt(entityFrozenAssetPrealnum) + BigInt(purchaseAssetPrealnum)).toString();
    }
    return "0";
  }
}
