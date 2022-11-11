import { TransferTransactionFactory } from "./_transfer";
import { TransferAssetTransaction } from "@bfchain/core-model";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { Injectable, wrapTaskList } from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "TransferAssetTransactionFactory",
);

/**
 * transferAsset 交易工厂
 *
 */
@Injectable()
export class TransferAssetTransactionFactory extends TransferTransactionFactory<TransferAssetTransaction> {
  /**
   * 校验输入信息
   *
   * @param body
   * @param transferAssetAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    transferAssetAsset: BFChainCore.TransferAssetAssetJSON,
    config = this.configHelper,
  ) {
    const TransferAssetAsset_Exception_Detail = {
      target: "transferAssetAsset",
    } as const;

    const storage = await super.commonVerifyTransactionBody(body, transferAssetAsset, config);

    const transferAsset = transferAssetAsset.transferAsset;

    if (!transferAsset) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "transferAsset",
      });
    }

    const { sourceChainMagic, sourceChainName, assetType, amount } = transferAsset;

    this.checkChainName(sourceChainName, "sourceChainName", TransferAssetAsset_Exception_Detail);

    this.checkChainMagic(sourceChainMagic, "sourceChainMagic", TransferAssetAsset_Exception_Detail);

    this.checkAsset(assetType, "assetType", TransferAssetAsset_Exception_Detail);

    if (storage.value !== assetType) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `storage.value ${storage.value}`,
        be_compare_prop: `assetType ${assetType}`,
        to_target: "storage",
        be_target: "transferAsset",
      });
    }

    this.checkAssetAmount(amount, "amount", TransferAssetAsset_Exception_Detail);
  }

  /**
   * 初始化 transferAsset 交易
   *
   * @param body
   * @param transferAssetAsset
   */
  async init(body: BFChainCore.TxBodyJSON, transferAssetAsset: BFChainCore.TransferAssetAssetJSON) {
    const transaction = TransferAssetTransaction.fromObject({
      ...body,
      asset: transferAssetAsset,
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
  applyTransaction(
    transaction: TransferAssetTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);
      const { amount, assetType, sourceChainMagic } = transaction.asset.transferAsset;
      const assetInfo = this.chainAssetInfoHelper.getAssetInfo(sourceChainMagic, assetType);
      // 扣除资产
      taskList.next = this._applyTransactionEmitAsset(eventEmitter, transaction, amount, {
        senderId: transaction.senderId,
        senderPublicKeyBuffer: transaction.senderPublicKeyBuffer,
        recipientId: transaction.recipientId,
        assetInfo,
      });
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
    transaction: TransferAssetTransaction,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    const { sourceChainMagic, assetType, amount } = transaction.asset.transferAsset;
    if (argv.magic === sourceChainMagic && argv.assetType === assetType) {
      return amount;
    }
    return "0";
  }
}
