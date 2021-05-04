import { TransactionFactory } from "./_txbase";
import { TransferAssetTransaction } from "@bfchain/core-model";
import {
  AccountBaseHelper,
  TransactionHelper,
  BaseHelper,
  ConfigHelper,
  ChainAssetInfoHelper,
} from "@bfchain/core-helper";
import {
  CoreExceptionGenerator,
  PARAM_LOST,
  PROP_IS_REQUIRE,
  SHOULD_NOT_BE,
  SHOULD_BE,
  NOT_MATCH,
} from "@bfchain/core-util-exception";
import { Injectable, TaskList } from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "TransferAssetTransactionFactory",
);

/**
 * transferAsset 交易工厂
 *
 */
@Injectable()
export class TransferAssetTransactionFactory extends TransactionFactory<TransferAssetTransaction> {
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
   * 要验证 transferAsset 交易的基础信息是否合法和 asset 信息是否存在
   * 交易的手续费必须大于 0
   * 交易的 rangeType 必须是 empty
   * 必须携带交易的接收者账户，并且不能和发起账户地址相等
   * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
   * 必须携带查询用的索引存储
   * key 值必须是 "assetType" value 值必须是设定的值
   * asset 是完整的 transferAsset 信息
   * 需要携带合法的资产所属链名称
   * 需要携带合法的资产所属链的网络标识符
   * 需要携带合法的资产名称，并且不是链资产
   * 需要携带转出的资产数量，并且大于 0
   *
   * @param body
   * @param transferAssetAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    transferAssetAsset: BFChainCore.TransferAssetAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, transferAssetAsset, config);

    const Function_Exception_Detail = {
      target: "body",
      function: "verifyTransactionBody",
    } as const;

    this.emptyRangeType(body, Function_Exception_Detail);

    const recipientId = body.recipientId;

    if (!recipientId) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "recipientId",
        ...Function_Exception_Detail,
      });
    }

    if (body.senderId === recipientId) {
      throw new ArgumentIllegalException(SHOULD_NOT_BE, {
        to_compare_prop: `senderId ${body.senderId}`,
        to_target: "body",
        be_compare_prop: `recipientId ${recipientId}`,
        ...Function_Exception_Detail,
      });
    }

    if (body.fromMagic !== config.magic) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `fromMagic ${body.fromMagic}`,
        to_target: "body",
        be_compare_prop: "local chain magic",
        ...Function_Exception_Detail,
      });
    }

    if (body.toMagic !== config.magic) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `toMagic ${body.toMagic}`,
        to_target: "body",
        be_compare_prop: "local chain magic",
        ...Function_Exception_Detail,
      });
    }

    if (!body.storage) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "storage",
        ...Function_Exception_Detail,
      });
    }

    const storage = body.storage;
    if (storage.key !== "assetType") {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `storage.key ${storage.key}`,
        to_target: "storage",
        be_compare_prop: "assetType",
        ...Function_Exception_Detail,
      });
    }

    const transferAsset = transferAssetAsset.transferAsset;

    if (!transferAsset) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "transferAsset",
        function: "verifyTransactionBody",
      });
    }

    const TransferAssetAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "transferAssetAsset",
    } as const;

    const { sourceChainMagic, sourceChainName, assetType } = transferAsset;

    this.checkChainName(sourceChainName, "sourceChainName", TransferAssetAsset_Exception_Detail);

    this.checkChainMagic(sourceChainMagic, "sourceChainMagic", TransferAssetAsset_Exception_Detail);

    this.checkAssetType(assetType, "assetType", TransferAssetAsset_Exception_Detail);

    if (storage.value !== assetType) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: `storage.value ${storage.value}`,
        be_compare_prop: `assetType ${assetType}`,
        to_target: "storage",
        be_target: "transferAsset",
        ...Function_Exception_Detail,
      });
    }

    this.checkAssetAmount(transferAsset.amount, "amount", TransferAssetAsset_Exception_Detail);
  }

  /**
   * 初始化 transferAsset 交易
   *
   * @param body
   * @param transferAssetAsset
   */
  init(body: BFChainCore.TxBodyJSON, transferAssetAsset: BFChainCore.TransferAssetAssetJSON) {
    const transaction = TransferAssetTransaction.fromObject({
      ...body,
      asset: transferAssetAsset,
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
    transaction: TransferAssetTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    const tasks = new TaskList();
    tasks.next = super.applyTransaction(transaction, eventEmitter, config);
    const { amount, assetType, sourceChainMagic } = transaction.asset.transferAsset;
    const assetInfo = this.chainAssetInfoHelper.getAssetInfo(sourceChainMagic, assetType);
    // 扣除资产
    tasks.next = this._applyTransactionEmitAsset(eventEmitter, transaction, amount, {
      senderId: transaction.senderId,
      senderPublicKeyBuffer: transaction.senderPublicKeyBuffer,
      recipientId: transaction.recipientId,
      assetInfo,
    });
    return tasks.toPromise();
  }
}
