import { TransactionFactory } from "./_txbase";
import { FROZEN_REASON, TrustAssetTransaction } from "@bfchain/core-model";
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

    await this.verifyTrustAsset(trustAsset, senderId, recipientId);

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

  async verifyTrustAsset(
    trustAsset: BFChainCore.TrustAssetJSON,
    trustSenderId: string,
    trustRecipientId: string,
  ) {
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

    const trusteeList = [...new Set([...trustees, trustSenderId, trustRecipientId])];
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
    if (numberOfSignFor > trusteeList.length) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_LTE_FIELD, {
        prop: `numberOfSignFor ${numberOfSignFor}`,
        field: trusteeList.length,
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
      const { amount, assetType, sourceChainMagic, sourceChainName, numberOfSignFor } =
        transaction.asset.trustAsset;
      const assetInfo = this.chainAssetInfoHelper.getAssetInfo(
        sourceChainName,
        sourceChainMagic,
        assetType,
      );
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
          totalUnfrozenTimes: numberOfSignFor,
          frozenId: transaction.signature,
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
