import { TransferTransactionFactory } from "./_transfer";
import { PARENT_ASSET_TYPE, TransferAnyTransaction } from "@bfchain/core-model";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { Injectable, wrapTaskList } from "@bfchain/util";

const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "TransferAnyTransactionFactory",
);

/**
 * transferAny 交易工厂
 *
 */
@Injectable()
export class TransferAnyTransactionFactory extends TransferTransactionFactory<TransferAnyTransaction> {
  /**
   * 校验输入信息
   *
   * @param body
   * @param transferAnyAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    transferAnyAsset: BFChainCore.TransferAnyAssetJSON,
    config = this.configHelper,
  ) {
    const storage = await super.commonVerifyTransactionBody(body, transferAnyAsset, config);

    const TransferAnyAsset_Exception_Detail = {
      target: "transferAnyAsset",
    } as const;

    if (storage.key !== "assetType") {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `storage.key ${storage.key}`,
        to_target: "storage",
        be_compare_prop: "assetType",
        ...TransferAnyAsset_Exception_Detail,
      });
    }

    const transferAny = transferAnyAsset.transferAny;

    if (!transferAny) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "transferAny",
      });
    }

    const { sourceChainMagic, sourceChainName, parentAssetType, assetType, taxInformation } =
      transferAny;

    this.checkChainName(sourceChainName, "sourceChainName", TransferAnyAsset_Exception_Detail);

    this.checkChainMagic(sourceChainMagic, "sourceChainMagic", TransferAnyAsset_Exception_Detail);

    this.checkAssetType(parentAssetType, assetType, "assetType", TransferAnyAsset_Exception_Detail);

    if (storage.value !== assetType) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `storage.value ${storage.value}`,
        be_compare_prop: `assetType ${assetType}`,
        to_target: "storage",
        be_target: "transferAny",
        ...TransferAnyAsset_Exception_Detail,
      });
    }

    this.checkAssetAmount(transferAny.amount, "amount", TransferAnyAsset_Exception_Detail);

    if (parentAssetType !== PARENT_ASSET_TYPE.ASSETS) {
      if (transferAny.amount !== "1") {
        throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `amount ${transferAny.amount}`,
          to_target: "transferAny",
          be_compare_prop: "1",
        });
      }
    }

    if (parentAssetType === PARENT_ASSET_TYPE.ENTITY) {
      await this.checkTaxInformation(TransferAnyAsset_Exception_Detail, taxInformation);
    } else {
      if (taxInformation) {
        throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_EXIST, {
          prop: "taxInformation",
          ...TransferAnyAsset_Exception_Detail,
        });
      }
    }
  }

  /**
   * 初始化 transferAny 交易
   *
   * @param body
   * @param transferAnyAsset
   */
  init(body: BFChainCore.TxBodyJSON, transferAnyAsset: BFChainCore.TransferAnyAssetJSON) {
    const transaction = TransferAnyTransaction.fromObject({
      ...body,
      asset: transferAnyAsset,
    });

    return transaction;
  }

  /**
   * 交易生效，对账务产生影响
   *
   * @param transaction
   * @param eventEmitter
   */
  applyTransaction(
    transaction: TransferAnyTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);
      const { senderId, senderPublicKeyBuffer, recipientId, asset } = transaction;
      const {
        amount,
        assetType,
        sourceChainMagic,
        sourceChainName,
        parentAssetType,
        taxInformation,
      } = asset.transferAny;

      // 同质资产转移
      if (parentAssetType === PARENT_ASSET_TYPE.ASSETS) {
        const assetInfo = this.chainAssetInfoHelper.getAssetInfo(sourceChainMagic, assetType);
        // 扣除资产
        taskList.next = this._applyTransactionEmitAsset(eventEmitter, transaction, amount, {
          senderId,
          senderPublicKeyBuffer,
          recipientId,
          assetInfo,
        });
      }
      // dapp 转移
      else if (parentAssetType === PARENT_ASSET_TYPE.DAPP) {
        // 发起账户成为 dapp 的拥有者
        taskList.next = eventEmitter.emit("changeDAppidPossessor", {
          type: "changeDAppidPossessor",
          transaction,
          applyInfo: {
            address: senderId,
            publicKeyBuffer: senderPublicKeyBuffer,
            possessorAddress: recipientId,
            sourceChainName,
            sourceChainMagic,
            dappid: assetType,
          },
        });
      }
      // 位名转移
      else if (parentAssetType === PARENT_ASSET_TYPE.LOCATION_NAME) {
        // 发起账户成为位名的拥有者
        taskList.next = eventEmitter.emit("changeLocationNamePossessor", {
          type: "changeLocationNamePossessor",
          transaction,
          applyInfo: {
            address: senderId,
            publicKeyBuffer: senderPublicKeyBuffer,
            possessorAddress: recipientId,
            sourceChainName,
            sourceChainMagic,
            name: assetType,
          },
        });
      }
      // 非同质资产转移
      else if (parentAssetType === PARENT_ASSET_TYPE.ENTITY && taxInformation) {
        // 发起账户成为 entityId 的拥有者
        taskList.next = eventEmitter.emit("changeEntityPossessor", {
          type: "changeEntityPossessor",
          transaction,
          applyInfo: {
            address: senderId,
            publicKeyBuffer: senderPublicKeyBuffer,
            possessorAddress: recipientId,
            sourceChainName,
            sourceChainMagic,
            entityId: assetType,
          },
        });
        // 纳税
        taskList.next = eventEmitter.emit("payTax", {
          type: "payTax",
          transaction,
          applyInfo: {
            sourceChainName,
            sourceChainMagic,
            parentAssetType,
            assetType,
            taxInformation: taxInformation.toJSON(),
          },
        });
        const chainAssetInfo = this.chainAssetInfoHelper.getAssetInfo(
          config.magic,
          config.assetType,
        );
        taskList.next = this._applyTransactionEmitAsset(
          eventEmitter,
          transaction,
          taxInformation.taxAssetPrealnum,
          {
            senderId,
            senderPublicKeyBuffer,
            recipientId: taxInformation.taxCollector,
            assetInfo: chainAssetInfo,
          },
        );
      } else {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: `parentAssetType ${parentAssetType}`,
          target: "transaction.asset.transferAsset",
        });
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
    transaction: TransferAnyTransaction,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    const { sourceChainMagic, assetType, amount } = transaction.asset.transferAny;
    if (argv.magic === sourceChainMagic && argv.assetType === assetType) {
      return amount;
    }
    return "0";
  }
}
