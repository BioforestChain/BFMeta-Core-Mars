import { TransactionFactory } from "./_txbase";
import { DestroyAssetTransaction } from "@bfchain/core-model";
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
  "DestroyAssetTransactionFactory",
);

/**
 * destroyAsset 交易工厂
 *
 */
@Injectable()
export class DestroyAssetTransactionFactory extends TransactionFactory<DestroyAssetTransaction> {
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
   * 要验证 destroyAsset 交易的基础信息是否合法和 asset 信息是否存在
   * 交易的手续费必须大于 0
   * 交易的 rangeType 必须是 empty
   * 不能携带交易的接收者账户
   * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
   * 必须携带查询用的索引存储
   * key 值必须是 "assetType" value 值必须是设定的值
   * asset 是完整的 destroyAsset 信息
   * 需要携带合法的资产所属链名称,并且是本链
   * 需要携带合法的资产所属链的网络标识符,并且是本链
   * 需要携带合法的资产名称，并且不是链资产
   * 需要携带销毁的资产数量，并且大于 0
   *
   *
   * @param body
   * @param destroyAssetAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    destroyAssetAsset: BFChainCore.DestroyAssetAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, destroyAssetAsset, config);

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

    if (body.senderId === recipientId) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_BE, {
        to_compare_prop: `senderId ${body.senderId}`,
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

    const destroyAsset = destroyAssetAsset.destroyAsset;

    if (!destroyAsset) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "destroyAsset",
      });
    }

    const DestroyAssetAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "destroyAssetAsset",
    } as const;

    const { sourceChainMagic, sourceChainName, assetType } = destroyAsset;

    // this.checkChainName(sourceChainName, "sourceChainName", DestroyAssetAsset_Exception_Detail);

    if (sourceChainName !== config.chainName) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: "sourceChainName",
        to_target: "body",
        be_compare_prop: "local chain name",
        ...DestroyAssetAsset_Exception_Detail,
      });
    }

    // this.checkChainMagic(sourceChainMagic, "sourceChainMagic", DestroyAssetAsset_Exception_Detail);

    if (sourceChainMagic !== config.magic) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: "sourceChainMagic",
        to_target: "body",
        be_compare_prop: "local chain magic",
        ...DestroyAssetAsset_Exception_Detail,
      });
    }

    this.checkAsset(assetType, "assetType", DestroyAssetAsset_Exception_Detail);

    // if (assetType === config.assetType) {
    //   throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_BE, {
    //     to_compare_prop: "assetType",
    //     to_target: "destroyAsset",
    //     be_compare_prop: config.assetType,
    //     ...DestroyAssetAsset_Exception_Detail,
    //   });
    // }

    if (storage.value !== assetType) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `storage.value ${storage.value}`,
        be_compare_prop: `assetType ${assetType}`,
        to_target: "storage",
        be_target: "destroyAsset",
        ...Function_Exception_Detail,
      });
    }

    this.checkAssetAmount(destroyAsset.amount, "amount", DestroyAssetAsset_Exception_Detail);
  }

  /**
   * 初始化 destroyAsset 交易
   *
   * @param body
   * @param destroyAsset
   */
  init(body: BFChainCore.TxBodyJSON, destroyAsset: BFChainCore.DestroyAssetAssetJSON) {
    const transaction = DestroyAssetTransaction.fromObject({
      ...body,
      asset: destroyAsset,
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
    transaction: DestroyAssetTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);
      const { senderId, senderPublicKeyBuffer, recipientId } = transaction;
      const { amount, assetType, sourceChainMagic, sourceChainName } =
        transaction.asset.destroyAsset;
      const assetInfo = this.chainAssetInfoHelper.getAssetInfo(
        sourceChainName,
        sourceChainMagic,
        assetType,
      );

      // 发起账户扣除资产
      taskList.next = eventEmitter.emit("asset", {
        type: "asset",
        transaction,
        applyInfo: {
          address: senderId,
          publicKeyBuffer: senderPublicKeyBuffer,
          assetInfo,
          amount: `-${amount}`,
          sourceAmount: amount,
        },
      });
      // 接收账户累加资产
      taskList.next = eventEmitter.emit("asset", {
        type: "asset",
        transaction,
        applyInfo: {
          address: recipientId,
          publicKeyBuffer: senderPublicKeyBuffer,
          assetInfo,
          amount,
          sourceAmount: amount,
        },
      });
      // 赎回链资产
      taskList.next = eventEmitter.emit("destroyAsset", {
        type: "destroyAsset",
        transaction,
        applyInfo: {
          address: senderId,
          publicKeyBuffer: transaction.senderPublicKeyBuffer,
          assetsApplyAddress: recipientId,
          assetInfo,
          amount,
          sourceAmount: amount,
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
    transaction: DestroyAssetTransaction,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    const { sourceChainMagic, assetType, amount } = transaction.asset.destroyAsset;
    if (argv.magic === sourceChainMagic && argv.assetType === assetType) {
      return amount;
    }
    return "0";
  }
}
