import { TransactionFactory } from "./_txbase";
import { TrustAssetTransaction } from "@bfchain/core-model";
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
  "TrustAssetTransactionFactory",
);

/**
 * trustAsset 交易工厂
 *
 */
@Injectable()
export class TrustAssetTransactionFactory extends TransactionFactory<TrustAssetTransaction> {
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
   * 要验证 trustAsset 交易的基础信息是否合法和 asset 信息是否存在
   * 交易的手续费必须大于 0
   * 交易的 rangeType 必须是 empty
   * 必须携带交易的接收账户地址，并且不能是交易的发起账户(是 trust amount 的接收人)
   * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
   * 必须携带查询用的索引存储
   * key 值必须是 "assetType" value 值必须是设定的值
   * asset 是完整的 trustAsset 信息
   * 必须携带委托账户：合法的账户地址组成的数组，长度大于 0，不能包含发起账户
   * 必须携带签收交易需要的委托人签名数量 n，n 不能大于最大签名数量(max = 发起账户 + 接收账户 + 委托账户)，最小为 1
   * 如果携带开始抢的区块间隔，这个间隔必须是正整数
   * 必须携带合法的委托的数字资产所属链名
   * 必须携带合法的委托的数字资产所属链网络标识符
   * 必须携带合法的委托的数字资产名
   * 必须携带合法的委托的数字资产数量，并且大于 0
   * 如果交易指定了过期区块间隔 n 和开始解冻区块间隔 m，则 m 必须小于 n
   *
   * @param body
   * @param trustAssetAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    trustAssetAsset: BFChainCore.TrustAssetAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, trustAssetAsset, config);

    const Function_Exception_Detail = {
      target: "body",
    } as const;

    this.emptyRangeType(body, Function_Exception_Detail);

    const { senderId, recipientId } = body;

    if (!recipientId) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "recipientId",
        ...Function_Exception_Detail,
      });
    }

    if (senderId === recipientId) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_BE, {
        to_compare_prop: `senderId ${senderId}`,
        to_target: "body",
        be_compare_prop: `recipientId ${recipientId}`,
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
    if (storage.key !== "assetType") {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `storage.key ${storage.key}`,
        to_target: "storage",
        be_compare_prop: "assetType",
        ...Function_Exception_Detail,
      });
    }

    const trustAsset = trustAssetAsset.trustAsset;

    await this.verifyTrustAsset(trustAsset);

    const trustees = trustAsset.trustees;

    if (!trustees.includes(senderId)) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_INCLUDE, {
        prop: "trustees",
        value: `senderId ${senderId}`,
        ...Function_Exception_Detail,
        target: "trustAsset",
      });
    }

    if (!trustees.includes(recipientId)) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_INCLUDE, {
        prop: "trustee",
        value: `recipientId ${recipientId}`,
        ...Function_Exception_Detail,
        target: "trustAsset",
      });
    }

    if (storage.value !== trustAsset.assetType) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `storage.value ${storage.value}`,
        be_compare_prop: `assetType ${trustAsset.assetType}`,
        to_target: "storage",
        be_target: "trustAsset",
        ...Function_Exception_Detail,
      });
    }
  }

  async verifyTrustAsset(trustAsset: BFChainCore.TrustAssetJSON) {
    const { baseHelper, accountBaseHelper } = this;

    if (!trustAsset) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "trustAsset",
      });
    }

    const TrustAssetAsset_Exception_Detail = {
      target: "trustAssetAsset",
    } as const;

    const { trustees, numberOfSignFor, sourceChainName, sourceChainMagic } = trustAsset;

    if (!baseHelper.isArray(trustees)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "trustees",
        type: "string array",
        ...TrustAssetAsset_Exception_Detail,
        target: "trustAsset",
      });
    }

    if (trustees.length < 0) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: `trustees length ${trustees.length}`,
        ...TrustAssetAsset_Exception_Detail,
      });
    }

    for (const trustee of trustees) {
      if (!(await accountBaseHelper.isAddress(trustee))) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: `trustee ${trustee}`,
          type: "account address",
          target: "trustees",
        });
      }
    }

    const trusteeList = [...new Set(trustees)];

    if (trustees.length !== trusteeList.length) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_DUPLICATE, {
        prop: "trustee",
        ...TrustAssetAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(numberOfSignFor)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `numberOfSignFor ${numberOfSignFor}`,
        type: "positive integer",
        ...TrustAssetAsset_Exception_Detail,
      });
    }

    // max = 发起账户 + 接收账户 + 委托账户数量
    const maxSifnFor = trustees.length + 2;
    if (numberOfSignFor > maxSifnFor) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_LTE_FIELD, {
        prop: `numberOfSignFor ${numberOfSignFor}`,
        field: maxSifnFor,
        ...TrustAssetAsset_Exception_Detail,
        target: "trustAsset",
      });
    }

    // min = 1
    if (numberOfSignFor < 1) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_GTE_FIELD, {
        prop: `numberOfSignFor ${numberOfSignFor}`,
        field: 1,
        ...TrustAssetAsset_Exception_Detail,
        target: "trustAsset",
      });
    }

    if (sourceChainMagic === this.configHelper.magic) {
      this.checkChainName(sourceChainName, "sourceChainName", TrustAssetAsset_Exception_Detail);

      this.checkChainMagic(sourceChainMagic, "sourceChainMagic", TrustAssetAsset_Exception_Detail);

      this.checkAsset(trustAsset.assetType, "assetType", TrustAssetAsset_Exception_Detail);
    }

    this.checkAssetAmount(trustAsset.amount, "amount", TrustAssetAsset_Exception_Detail);

    if (trustAsset.amount === "0") {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_GT_FIELD, {
        prop: `amount ${trustAsset.amount}`,
        fueld: "0",
        ...TrustAssetAsset_Exception_Detail,
      });
    }
  }

  /**
   * 初始化 trustAsset 交易
   *
   * @param body
   * @param trustAssetAsset
   */
  init(body: BFChainCore.TxBodyJSON, trustAssetAsset: BFChainCore.TrustAssetAssetJSON) {
    const transaction = TrustAssetTransaction.fromObject({
      ...body,
      asset: trustAssetAsset,
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
    transaction: TrustAssetTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);
      const { amount, assetType, sourceChainMagic, numberOfSignFor } = transaction.asset.trustAsset;
      const assetInfo = this.chainAssetInfoHelper.getAssetInfo(sourceChainMagic, assetType);
      // 冻结发起账户用于交换的资产
      taskList.next = eventEmitter.emit("frozenAsset", {
        type: "frozenAsset",
        transaction,
        applyInfo: {
          address: transaction.senderId,
          publicKeyBuffer: transaction.senderPublicKeyBuffer,
          assetInfo,
          amount: `-${amount}`,
          sourceAmount: amount,
          maxEffectiveHeight: this.transactionHelper.getTransactionMaxEffectiveHeight(transaction),
          minEffectiveHeight: this.transactionHelper.getTransactionMinEffectiveHeight(transaction),
          frozenId: transaction.signature,
          totalUnfrozenTimes: numberOfSignFor,
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
    transaction: TrustAssetTransaction,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    const { sourceChainMagic, assetType, amount } = transaction.asset.trustAsset;
    if (argv.magic === sourceChainMagic && argv.assetType === assetType) {
      return amount;
    }
    return "0";
  }
}
