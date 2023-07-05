import { TransactionFactory } from "./_txbase";
import { IssueCertificateTransaction, CERTIFICATE_TYPE, ASSET_STATUS } from "@bfchain/core-model";
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
  "IssueCertificateTransactionFactory",
);

/**
 * issueCertificate 交易工厂
 *
 */
@Injectable()
export class IssueCertificateTransactionFactory extends TransactionFactory<IssueCertificateTransaction> {
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
   * @param issueCertificateAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    issueCertificateAsset: BFChainCore.IssueCertificateAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, issueCertificateAsset, config);

    const Function_Exception_Detail = {
      target: "body",
    } as const;

    this.emptyRangeType(body, Function_Exception_Detail);

    const { baseHelper } = this;

    const recipientId = body.recipientId;

    if (!body.recipientId) {
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

    const issueCertificate = issueCertificateAsset.issueCertificate;

    if (!issueCertificate) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "issueCertificate",
      });
    }

    const IssueCertificateAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "issueCertificateAsset",
    } as const;

    const { sourceChainMagic, sourceChainName, certificateId, type } = issueCertificate;

    this.checkChainName(sourceChainName, "sourceChainName", IssueCertificateAsset_Exception_Detail);

    if (sourceChainName !== config.chainName) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `sourceChainName ${sourceChainName}`,
        to_target: "body",
        be_compare_prop: "local chain name",
        ...Function_Exception_Detail,
      });
    }

    this.checkChainMagic(
      sourceChainMagic,
      "sourceChainMagic",
      IssueCertificateAsset_Exception_Detail,
    );

    if (sourceChainMagic !== config.magic) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `sourceChainMagic ${sourceChainName}`,
        to_target: "body",
        be_compare_prop: "local chain magic",
        ...Function_Exception_Detail,
      });
    }

    if (!certificateId) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "certificateId",
        ...IssueCertificateAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidCertificateId(certificateId)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `certificateId ${certificateId}`,
        ...IssueCertificateAsset_Exception_Detail,
      });
    }

    if (
      type !== CERTIFICATE_TYPE.DESTORY_FORBIDDEN &&
      type !== CERTIFICATE_TYPE.DESTORY_BY_APPLICANT &&
      type !== CERTIFICATE_TYPE.DESTORY_BY_POSSESSOR
    ) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `type ${type}`,
        be_compare_prop: "type",
        to_target: "dapp",
        be_target: "CERTIFICATE_TYPE",
      });
    }

    if (storage.value !== certificateId) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `storage.value ${storage.value}`,
        be_compare_prop: `certificateId ${certificateId}`,
        to_target: "storage",
        be_target: "issueCertificate",
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 初始化 issueCertificate 交易
   *
   * @param body
   * @param issueCertificateAsset
   */
  init(body: BFChainCore.TxBodyJSON, issueCertificateAsset: BFChainCore.IssueCertificateAssetJSON) {
    const transaction = IssueCertificateTransaction.fromObject({
      ...body,
      asset: issueCertificateAsset,
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
    transaction: IssueCertificateTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);
      const { senderId, recipientId, senderPublicKeyBuffer } = transaction;
      const { sourceChainName, sourceChainMagic, certificateId, type } =
        transaction.asset.issueCertificate;
      // 发行数字资产
      taskList.next = eventEmitter.emit("issueCertificate", {
        type: "issueCertificate",
        transaction,
        applyInfo: {
          address: senderId,
          possessorAddress: recipientId,
          publicKeyBuffer: senderPublicKeyBuffer,
          sourceChainName,
          sourceChainMagic,
          certificateId,
          type,
          status: ASSET_STATUS.NORMAL,
          issueId: transaction.signature,
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
    transaction: IssueCertificateTransaction,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    return "0";
  }
}
