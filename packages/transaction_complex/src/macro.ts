import { Injectable, Inject, wrapTaskList } from "@bfchain/util";
import { MacroTransaction } from "@bfchain/core-model";
import {
  AccountBaseHelper,
  TransactionHelper,
  BaseHelper,
  ConfigHelper,
  ChainAssetInfoHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { TransactionFactory, TransactionCore } from "@bfchain/core-transaction";

const { ArgumentIllegalException } = CoreExceptionGenerator("CONTROLLER", "MacrotionFactory");

/**
 * macro 交易工厂
 *
 */
@Injectable()
export class MacroTransactionFactory extends TransactionFactory<MacroTransaction> {
  @Inject("bfchain-core:TransactionCore", { dynamics: true })
  public transactionCore!: TransactionCore;

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
   * @param macroAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    macroAsset: BFChainCore.MacroAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, macroAsset, config);

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

    if (body.storage) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_EXIST, {
        prop: "storage",
        ...Function_Exception_Detail,
      });
    }

    const macro = macroAsset.macro;

    if (!macro) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "macro",
      });
    }

    const MacroAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "macro",
    } as const;

    const { inputs, template } = macro;
    if (!inputs) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "inputs",
        ...MacroAsset_Exception_Detail,
      });
    }

    if (inputs.length === 0) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_LENGTH_SHOULD_GT_FIELD, {
        prop: "inputs",
        field: 0,
        ...MacroAsset_Exception_Detail,
      });
    }

    for (const input of inputs) {
      /// FIXME: 完善校验
    }

    if (!template) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "template",
        ...MacroAsset_Exception_Detail,
      });
    }

    const factory = this.transactionCore.getTransactionFactoryFromType(template.type);
    const transaction = await factory.fromJSON(template);
    await factory.verify(transaction);
  }

  /**
   * 初始化 macro 交易
   *
   * @param body
   * @param macroAsset
   */
  init(body: BFChainCore.TxBodyJSON, macroAsset: BFChainCore.MacroAssetJSON) {
    const transaction = MacroTransaction.fromObject({
      ...body,
      asset: macroAsset,
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
    transaction: MacroTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);
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
    transaction: MacroTransaction,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    return "0";
  }
}
