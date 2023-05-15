import { Injectable, Inject, wrapTaskList } from "@bfchain/util";
import { MacroCallTransaction } from "@bfchain/core-model";
import {
  AccountBaseHelper,
  TransactionHelper,
  BaseHelper,
  ConfigHelper,
  ChainAssetInfoHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { TransactionFactory } from "@bfchain/core-transaction";

const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "MacroCallTransactionFactory",
);

/**
 * macroCall 交易工厂
 *
 */
@Injectable()
export class MacroCallTransactionFactory extends TransactionFactory<MacroCallTransaction> {
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
   * @param macroCallAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    macroCallAsset: BFChainCore.MacroCallAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, macroCallAsset, config);

    const Function_Exception_Detail = {
      target: "body",
    } as const;

    this.emptyRangeType(body, Function_Exception_Detail);

    if (body.recipientId) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_EXIST, {
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
    if (storage.key !== "macroId") {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `storage.key ${storage.key}`,
        to_target: "storage",
        be_compare_prop: "macroId",
        ...Function_Exception_Detail,
      });
    }

    const call = macroCallAsset.call;

    if (!call) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "call",
      });
    }

    const MacroCallAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "call",
    } as const;

    const { macroId, inputs } = call;

    if (!macroId) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "macroId",
        ...MacroCallAsset_Exception_Detail,
      });
    }

    if (!this.baseHelper.isValidSignature(macroId)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `macroId ${macroId}`,
        type: "transaction signature",
        ...MacroCallAsset_Exception_Detail,
      });
    }

    if (!inputs) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "inputs",
        ...MacroCallAsset_Exception_Detail,
      });
    }

    for (const input in inputs) {
      ///
    }

    if (storage.value !== macroId) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `storage.value ${storage.value}`,
        be_compare_prop: `macroId ${macroId}`,
        to_target: "storage",
        be_target: "call",
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 初始化 promise 交易
   *
   * @param body
   * @param promiseAsset
   */
  init(body: BFChainCore.TxBodyJSON, promiseAsset: BFChainCore.MacroCallAssetJSON) {
    const transaction = MacroCallTransaction.fromObject({
      ...body,
      asset: promiseAsset,
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
    transaction: MacroCallTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);

      const { macroId, inputs } = transaction.asset.call;
      taskList.next = eventEmitter.emit("macroCall", {
        type: "macroCall",
        transaction,
        applyInfo: {
          macroId,
          inputs,
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
    transaction: MacroCallTransaction,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    return "0";
  }
}
