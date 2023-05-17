import { Injectable, Inject, wrapTaskList, $safeEnd } from "@bfchain/util";
import { MacroCallTransaction, MACRO_INPUT_TYPE, MACRO_NUMBER_FORMAT } from "@bfchain/core-model";
import {
  AccountBaseHelper,
  TransactionHelper,
  BaseHelper,
  ConfigHelper,
  ChainAssetInfoHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { TransactionCore, TransactionFactory } from "@bfchain/core-transaction";
import * as calc from "@bnqkl/calc";

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
  @Inject("bfchain-core:TransactionCore", { dynamics: true })
  public transactionCore!: TransactionCore;
  async generateTransaction<T extends BFChainCore.Transaction>(
    template: T,
    defineInputs: BFChainCore.Macro.InputJSON[],
    inputs: BFChainCore.MacroCallInputs,
  ) {
    /// 复制出一份JSON
    const transaction = template.toJSON();
    for (const defineInput of defineInputs) {
      let value: unknown = inputs[defineInput.name];
      if (typeof value !== "string") {
        throw new SyntaxError(`miss input:${defineInput.name}`);
      }
      if (defineInput.pattern && new RegExp(defineInput.pattern).test(value) === false) {
        throw new TypeError(`input:${defineInput.name} not match pattern`);
      }
      switch (defineInput.type) {
        case MACRO_INPUT_TYPE.ADDRESS:
          if ((await this.accountBaseHelper.isAddress(value)) === false) {
            throw new TypeError(`input:${defineInput.name} should be an address`);
          }
          break;
        case MACRO_INPUT_TYPE.SIGNATURE:
          if (this.transactionHelper.isValidTransactionSignature(value) === false) {
            throw new TypeError(`input:${defineInput.name} should be an signature`);
          }
          break;
        case MACRO_INPUT_TYPE.TEXT:
          break;
        case MACRO_INPUT_TYPE.CALC:
          value = calc.evaluate(defineInput.calc, inputs);
        case MACRO_INPUT_TYPE.NUMBER:
          if (defineInput.format === MACRO_NUMBER_FORMAT.LITERAL) {
            value = Number(value);
          }
          /// TODO 这里需要进行 max/min/step 的判定
          break;
        default:
          $safeEnd(defineInput);
      }
      /// 写入值
      if (this.trySet(transaction, defineInput.keyPath, value) === false) {
        throw new SyntaxError(`invalid keyPath:${defineInput.keyPath}`);
      }
    }
    const transactionModel = await this.transactionCore.recombineTransaction<T>(transaction);
    return transactionModel;
  }
  trySet(target: object, keyPath: string, value: unknown) {
    let setPath: string;
    if (keyPath.includes(".")) {
      const getsPath = keyPath.split(".");
      setPath = getsPath.pop()!;
      for (const getPath of getsPath) {
        if (target.hasOwnProperty(getPath) === false) {
          return false;
        }
        target = (target as any)[getPath];
      }
    } else {
      setPath = keyPath;
    }

    if (target.hasOwnProperty(setPath) === false) {
      return false;
    }
    (target as any)[setPath] = value;
    return true;
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
