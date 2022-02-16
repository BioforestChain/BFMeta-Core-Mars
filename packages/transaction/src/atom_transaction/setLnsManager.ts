import { TransactionFactory } from "./_txbase";
import { SetLnsManagerTransaction } from "@bfchain/core-model";
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
  "SetLnsManagerTransactionFactory",
);

/**
 * setLnsManager 交易工厂
 *
 */
@Injectable()
export class SetLnsManagerTransactionFactory extends TransactionFactory<SetLnsManagerTransaction> {
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
   * 要验证 lnsManager 交易的基础信息是否合法和 asset 信息是否存在
   * 交易的手续费必须大于 0
   * 交易的 rangeType 必须是 empty
   * 必须携带交易的接收者账户，并且不能和发起账户地址相等(是新的管理员账户地址)
   * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
   * 必须携带查询用的索引存储
   *  key 值必须是 "name" value 值必须是设定的值
   * asset 是完整的 lnsManager 信息
   * 必须携带合法的欲设置管理员的位名
   * 必须携带合法的欲设置管理员的位名所属链的名称
   * 必须携带合法的欲设置管理员的位名所属链的网络标识符
   * 必须携带合法的新的管理员账户地址
   * 新的管理员账户地址和交易的接收者必须相等
   *
   * @param body
   * @param setLnsManagerAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    lnsManagerAsset: BFChainCore.SetLnsManagerAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, lnsManagerAsset, config);

    const Function_Exception_Detail = {
      target: "body",
    } as const;

    this.emptyRangeType(body, Function_Exception_Detail);

    const { baseHelper } = this;

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
    if (storage.key !== "name") {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `storage.key ${storage.key}`,
        to_target: "storage",
        be_compare_prop: "name",
        ...Function_Exception_Detail,
      });
    }

    const lnsManager = lnsManagerAsset.lnsManager;

    if (!lnsManager) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "lnsManager",
      });
    }

    const LnsManagerAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "lnsManagerAsset",
    } as const;

    const name = lnsManager.name;

    if (!name) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "name",
        ...LnsManagerAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidLocationName(name)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `name ${name}`,
        type: "location name",
        ...LnsManagerAsset_Exception_Detail,
      });
    }

    if (storage.value !== name) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `storage.value ${storage.value}`,
        be_compare_prop: `name ${name}`,
        to_target: "storage",
        be_target: "lnsManager",
        ...Function_Exception_Detail,
      });
    }

    const { sourceChainName, sourceChainMagic } = lnsManager;

    this.checkChainName(sourceChainName, "sourceChainName", LnsManagerAsset_Exception_Detail);

    this.checkChainMagic(sourceChainMagic, "sourceChainMagic", LnsManagerAsset_Exception_Detail);
  }

  /**
   * 初始化 setLnsManager 交易
   *
   * @param body
   * @param setLnsManagerAsset
   */
  init(body: BFChainCore.TxBodyJSON, lnsManagerAsset: BFChainCore.SetLnsManagerAssetJSON) {
    const transaction = SetLnsManagerTransaction.fromObject({
      ...body,
      asset: lnsManagerAsset,
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
    transaction: SetLnsManagerTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);
      const { name, sourceChainMagic, sourceChainName } = transaction.asset.lnsManager;
      taskList.next = eventEmitter.emit("setLnsManager", {
        type: "setLnsManager",
        transaction,
        applyInfo: {
          address: transaction.senderId,
          publicKeyBuffer: transaction.senderPublicKeyBuffer,
          sourceChainName,
          sourceChainMagic,
          name,
          manager: transaction.recipientId,
        },
      });
    });
  }
}
