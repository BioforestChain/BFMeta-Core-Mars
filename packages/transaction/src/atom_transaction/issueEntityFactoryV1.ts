import { Injectable, wrapTaskList } from "@bfchain/util";
import { IssueEntityFactoryTransactionV1, ASSET_STATUS, TOKEN_TO_BEN } from "@bfchain/core-model";
import { IssueEntityFactoryTransactionFactory } from "./issueEntityFactory";

/**
 * issueEntiryFactory 交易工厂
 *
 */
@Injectable()
export class IssueEntityFactoryTransactionFactoryV1 extends IssueEntityFactoryTransactionFactory {
  /**
   * 校验输入信息
   *
   * @param body
   * @param dappAsset
   * @param config
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    issueEntityFactoryAssetJSON: BFChainCore.IssueEntityFactoryAssetJSON,
    config = this.configHelper,
  ) {
    await this.commonVerifyTransactionBody(body, issueEntityFactoryAssetJSON, config);
  }

  /**
   * 初始化 issueEntityFactory 交易
   *
   * @param body
   * @param issueEntityFactoryAsset
   */
  init(
    body: BFChainCore.TxBodyJSON,
    issueEntityFactoryAsset: BFChainCore.IssueEntityFactoryAssetJSON,
  ) {
    const transaction = IssueEntityFactoryTransactionV1.fromObject({
      ...body,
      asset: issueEntityFactoryAsset,
    });

    return transaction;
  }

  /**
   * 交易生效，对账务产生影响
   *
   * @param transaction
   * @param eventEmitter
   */
  async applyTransaction(
    transaction: IssueEntityFactoryTransactionV1,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      const { senderId, recipientId, senderPublicKeyBuffer, fee } = transaction;

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

      const {
        sourceChainName,
        sourceChainMagic,
        factoryId,
        entityPrealnum,
        entityFrozenAssetPrealnum,
        purchaseAssetPrealnum,
      } = transaction.asset.issueEntityFactory;

      // 计算需要销毁的主权益数
      const destroyAssets = this.transactionHelper.calcDestroyMainAssetsOfIsseuEntityFactory(
        entityPrealnum,
        config,
      );

      // 发起账户扣除主权益
      taskList.next = eventEmitter.emit("asset", {
        type: "asset",
        transaction,
        applyInfo: {
          address: senderId,
          publicKeyBuffer: senderPublicKeyBuffer,
          assetInfo,
          amount: "-" + destroyAssets,
          sourceAmount: destroyAssets,
        },
      });

      // 销毁主权益
      taskList.next = eventEmitter.emit("destroyMainAsset", {
        type: "destroyMainAsset",
        transaction,
        applyInfo: {
          address: senderId,
          publicKeyBuffer: senderPublicKeyBuffer,
          assetInfo,
          amount: "-" + destroyAssets,
          sourceAmount: destroyAssets,
        },
      });

      // 发行 entityFactory
      taskList.next = eventEmitter.emit("issueEntityFactoryByDestroy", {
        type: "issueEntityFactoryByDestroy",
        transaction,
        applyInfo: {
          address: transaction.senderId,
          publicKeyBuffer: transaction.senderPublicKeyBuffer,
          sourceChainName,
          sourceChainMagic,
          factoryId,
          entityPrealnum,
          entityFrozenAssetPrealnum,
          possessorAddress: transaction.recipientId,
          purchaseAssetPrealnum,
          status: ASSET_STATUS.NORMAL,
        },
      });
    });
  }
}
