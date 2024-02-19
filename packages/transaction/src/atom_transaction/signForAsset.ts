import { TransactionFactory } from "./_txbase";
import { FROZEN_REASON, SignForAssetTransaction } from "@bfchain/core-model";
import {
  AccountBaseHelper,
  TransactionHelper,
  BaseHelper,
  ConfigHelper,
  ChainAssetInfoHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { TrustAssetTransactionFactory } from "./trustAsset";
import { Injectable, wrapTaskList } from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "signForAssetTransactionFactory",
);

/**
 * sigForAsset 交易工厂
 *
 */
@Injectable()
export class SignForAssetTransactionFactory extends TransactionFactory<SignForAssetTransaction> {
  constructor(
    public accountBaseHelper: AccountBaseHelper,
    public transactionHelper: TransactionHelper,
    public baseHelper: BaseHelper,
    public configHelper: ConfigHelper,
    public chainAssetInfoHelper: ChainAssetInfoHelper,
    private trustAssetTransactionFactory: TrustAssetTransactionFactory,
  ) {
    super();
  }

  /**
   * 校验输入信息
   *
   * @param body
   * @param signForAssetAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    signForAssetAsset: BFChainCore.SignForAssetAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, signForAssetAsset, config);

    const Function_Exception_Detail = {
      target: "body",
    } as const;

    this.emptyRangeType(body, Function_Exception_Detail);

    const { baseHelper, accountBaseHelper, transactionHelper } = this;

    const recipientId = body.recipientId;

    if (!recipientId) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "recipientId",
        ...Function_Exception_Detail,
      });
    }

    const senderId = body.senderId;

    // if (senderId === recipientId) {
    //   throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_BE, {
    //     to_compare_prop: "senderId",
    //     to_target: "body",
    //     be_compare_prop: "recipientId",
    //     ...Function_Exception_Detail,
    //   });
    // }

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
    if (storage.key !== "transactionSignature") {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `storage.key ${storage.key}`,
        to_target: "storage",
        be_compare_prop: "transactionSignature",
        ...Function_Exception_Detail,
      });
    }

    const SignForAssetAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "signForAssetAsset",
    } as const;

    const signForAsset = signForAssetAsset.signForAsset;

    if (!signForAsset) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "signForAsset",
      });
    }

    const { trustAsset, trustSenderId, trustRecipientId, transactionSignature } = signForAsset;
    if (!transactionSignature) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "transactionSignature",
        ...SignForAssetAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidSignature(transactionSignature)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `transactionSignature ${transactionSignature}`,
        type: "transaction signature",
        ...SignForAssetAsset_Exception_Detail,
      });
    }

    if (storage.value !== transactionSignature) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `storage.value ${storage.value}`,
        be_compare_prop: `transactionSignature ${transactionSignature}`,
        to_target: "storage",
        be_target: "signForAsset",
        ...Function_Exception_Detail,
      });
    }

    if (!trustSenderId) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "trustSenderId",
        ...SignForAssetAsset_Exception_Detail,
      });
    }

    if (!(await accountBaseHelper.isAddress(trustSenderId))) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `trustSenderId ${trustSenderId}`,
        type: "account address",
        ...Function_Exception_Detail,
        target: "trustAsset",
      });
    }

    if (!trustRecipientId) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "trustRecipientId",
        ...SignForAssetAsset_Exception_Detail,
      });
    }

    if (!(await accountBaseHelper.isAddress(trustRecipientId))) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `trustRecipientId ${trustRecipientId}`,
        type: "account address",
        ...SignForAssetAsset_Exception_Detail,
      });
    }

    if (recipientId !== trustRecipientId) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `recipientId ${recipientId}`,
        to_target: "body",
        be_compare_prop: `trustRecipientId ${trustRecipientId}`,
        ...SignForAssetAsset_Exception_Detail,
      });
    }

    /**
     * 校验`trustAsset`的基本格式
     */
    await this.trustAssetTransactionFactory.verifyTrustAsset(
      trustAsset,
      trustSenderId,
      trustRecipientId,
    );

    const { trustees } = trustAsset;

    const tempTrustees = [...new Set([...trustees, trustSenderId, trustRecipientId])];

    if (!tempTrustees.includes(senderId)) {
      throw new ArgumentIllegalException(ERROR_LIST.PERMISSION_DENIED, {
        operationName: `sign for asset ${transactionSignature}`,
        ...SignForAssetAsset_Exception_Detail,
      });
    }
  }

  /**
   * 初始化 signForAsset 交易
   *
   * @param body
   * @param signForAssetAsset
   */
  init(body: BFChainCore.TxBodyJSON, signForAssetAsset: BFChainCore.SignForAssetAssetJSON) {
    const transaction = SignForAssetTransaction.fromObject({
      ...body,
      asset: signForAssetAsset,
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
    transaction: SignForAssetTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);
      const { transactionSignature, trustSenderId, trustRecipientId, trustAsset } =
        transaction.asset.signForAsset;
      const assetInfo = this.chainAssetInfoHelper.getAssetInfo(
        trustAsset.sourceChainName,
        trustAsset.sourceChainMagic,
        trustAsset.assetType,
      );
      // 接收账户(委托交易指定的签收人)将得到的资产解冻并收入账下
      taskList.next = eventEmitter.emit("signForAsset", {
        type: "signForAsset",
        transaction,
        applyInfo: {
          address: transaction.senderId,
          publicKeyBuffer: transaction.senderPublicKeyBuffer,
          assetInfo,
          frozenAddress: trustSenderId,
          recipientId: trustRecipientId, // 接收资产的账户
          frozenId: transactionSignature,
          frozenReason: FROZEN_REASON.TRUST,
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
    transaction: SignForAssetTransaction,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    const { sourceChainMagic, assetType, amount } = transaction.asset.signForAsset.trustAsset;
    if (argv.magic === sourceChainMagic && argv.assetType === assetType) {
      return amount;
    }
    return "0";
  }
}
