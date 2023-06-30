import { TransactionFactory } from "./_txbase";
import { ASSET_STATUS, DestroyCertificateTransaction } from "@bfchain/core-model";
import {
  AccountBaseHelper,
  TransactionHelper,
  BaseHelper,
  ConfigHelper,
  ChainAssetInfoHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { Injectable, wrapTaskList } from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "DestroyCertificateTransactionFactory",
);

/**
 * destroyCertificate 交易工厂
 *
 */
@Injectable()
export class DestroyCertificateTransactionFactory extends TransactionFactory<DestroyCertificateTransaction> {
  constructor(
    public accountBaseHelper: AccountBaseHelper,
    public transactionHelper: TransactionHelper,
    public baseHelper: BaseHelper,
    public configHelper: ConfigHelper,
    public chainAssetInfoHelper: ChainAssetInfoHelper,
  ) {
    super();
  }

  /**
   * 校验输入信息
   *
   * @param body
   * @param destroyCertificateAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    destroyCertificateAsset: BFChainCore.DestroyCertificateAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, destroyCertificateAsset, config);

    const Function_Exception_Detail = {
      target: "body",
    } as const;

    this.emptyRangeType(body, Function_Exception_Detail);

    const recipientId = body.recipientId;

    if (!recipientId) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "recipientId",
        ...Function_Exception_Detail,
      });
    }

    if (body.fromMagic !== config.magic) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `fromMagic ${body.fromMagic}`,
        to_target: "body",
        be_compare_prop: "local chain magic",
        ...Function_Exception_Detail,
      });
    }

    if (body.toMagic !== config.magic) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `toMagic ${body.toMagic}`,
        to_target: "body",
        be_compare_prop: "local chain magic",
        ...Function_Exception_Detail,
      });
    }

    if (!body.storage) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "storage",
        ...Function_Exception_Detail,
      });
    }

    const storage = body.storage;
    if (storage.key !== "certificateId") {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `storage.key ${storage.key}`,
        to_target: "storage",
        be_compare_prop: "certificateId",
        ...Function_Exception_Detail,
      });
    }

    const destroyCertificate = destroyCertificateAsset.destroyCertificate;

    if (!destroyCertificate) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "destroyCertificate",
      });
    }

    const DestroyCertificateAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "destroyCertificateAsset",
    } as const;

    const { sourceChainMagic, sourceChainName, certificateId, type } = destroyCertificate;

    if (sourceChainName !== config.chainName) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: "sourceChainName",
        to_target: "body",
        be_compare_prop: "local chain name",
        ...DestroyCertificateAsset_Exception_Detail,
      });
    }

    if (sourceChainMagic !== config.magic) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: "sourceChainMagic",
        to_target: "body",
        be_compare_prop: "local chain magic",
        ...DestroyCertificateAsset_Exception_Detail,
      });
    }

    if (!this.baseHelper.isValidCertificateId(certificateId)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `certificateId ${certificateId}`,
        ...DestroyCertificateAsset_Exception_Detail,
      });
    }

    if (storage.value !== certificateId) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `storage.value ${storage.value}`,
        be_compare_prop: `certificateId ${certificateId}`,
        to_target: "storage",
        be_target: "destroyCertificate",
      });
    }
  }

  /**
   * 初始化 destroyCertificate 交易
   *
   * @param body
   * @param destroyCertificateAsset
   */
  init(
    body: BFChainCore.TxBodyJSON,
    destroyCertificateAsset: BFChainCore.DestroyCertificateAssetJSON,
  ) {
    const transaction = DestroyCertificateTransaction.fromObject({
      ...body,
      asset: destroyCertificateAsset,
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
    transaction: DestroyCertificateTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);
      const { senderId, senderPublicKeyBuffer, recipientId } = transaction;
      const { sourceChainMagic, sourceChainName, certificateId, type } =
        transaction.asset.destroyCertificate;
      taskList.next = eventEmitter.emit("destroyCertificate", {
        type: "destroyCertificate",
        transaction,
        applyInfo: {
          address: senderId,
          possessorAddress: recipientId,
          publicKeyBuffer: senderPublicKeyBuffer,
          sourceChainName,
          sourceChainMagic,
          certificateId,
          status: ASSET_STATUS.DESTROY,
        },
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
    transaction: DestroyCertificateTransaction,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    return "0";
  }
}
