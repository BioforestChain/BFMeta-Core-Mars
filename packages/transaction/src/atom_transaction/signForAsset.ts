import { TransactionFactory } from "./_txbase";
import { SignForAssetTransaction } from "@bfchain/core-model";
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
   * 要验证 signForAsset 交易的基础信息是否合法和 asset 信息是否存在
   * 交易的手续费必须大于 0
   * 交易的 rangeType 必须是 empty
   * 必须携带交易的接收账户地址，并且不能是交易的发起账户(是 signForAsset 交易的发起账户地址)
   * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
   * 必须携带查询用的索引存储
   * key 值必须是 "transactionSubId" value 必须是 trustAsset 的签名
   * asset 是完整的 signForAsset 信息
   * 必须携带 trustAsset 交易的签名
   * 必须携带 trustAsset 的发起交易高度
   * 如果 trustAsset 有指定开始交易高度间隔，则必须携带则个值
   * 如果 trustAsset 有指定交易的有效区块高度，则必须携带这个值
   * 必须携带 trustAsset 交易的发起账户地址
   * 必须携带 trustAsset 交易的接收账户地址
   * 必须携带委托方签名，签名合法，且签名人是 trustAsset 的发起人/接收人/指定的委托账户
   * 委托方签名数量必须大于等于 trustAsset 指定的有效的委托方签名数量
   * 委托方的签名和二次签名必须合法
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
    if (storage.key !== "transactionSubId") {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `storage.key ${storage.key}`,
        to_target: "storage",
        be_compare_prop: "transactionSubId",
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

    const { trustAsset, trustSenderId, trustRecipientId, transactionSubId } = signForAsset;
    if (!transactionSubId) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "transactionSubId",
        ...SignForAssetAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidTransactionId(transactionSubId)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `transactionSubId ${transactionSubId}`,
        type: "transaction id",
        ...SignForAssetAsset_Exception_Detail,
      });
    }

    if (storage.value !== transactionSubId) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `storage.value ${storage.value}`,
        be_compare_prop: `transactionSubId ${transactionSubId}`,
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
    await this.trustAssetTransactionFactory.verifyTrustAsset(trustAsset);

    const { trustees } = trustAsset;

    const tempTrustees = [...trustees];
    tempTrustees[tempTrustees.length] = trustSenderId;
    tempTrustees[tempTrustees.length] = trustRecipientId;

    if (!tempTrustees.includes(senderId)) {
      throw new ArgumentIllegalException(ERROR_LIST.PERMISSION_DENIED, {
        operationName: `sign for asset ${transactionSubId}`,
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
      const { transactionSubIdBuffer, trustSenderId, trustRecipientId } =
        transaction.asset.signForAsset;
      // 接收账户(委托交易指定的签收人)将得到的资产解冻并收入账下
      taskList.next = eventEmitter.emit("signForAsset", {
        type: "signForAsset",
        transaction,
        applyInfo: {
          address: transaction.senderId,
          publicKeyBuffer: transaction.senderPublicKeyBuffer,
          frozenIdBuffer: transactionSubIdBuffer,
          frozenAddress: trustSenderId,
          recipientId: trustRecipientId, // 接收资产的账户
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
