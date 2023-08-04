import { Injectable, Inject, wrapTaskList } from "@bfchain/util";
import {
  MacroTransaction,
  MACRO_INPUT_TYPE,
  MACRO_NUMBER_FORMAT,
  Transaction,
} from "@bfchain/core-model";
import {
  AccountBaseHelper,
  TransactionHelper,
  BaseHelper,
  ConfigHelper,
  ChainAssetInfoHelper,
  JSBIHelper,
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
    public jsbiHelper: JSBIHelper,
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

    const { inputs, template: tempTemplate } = macro;
    const template = tempTemplate instanceof Transaction ? tempTemplate.toJSON() : tempTemplate;
    if (!inputs) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "inputs",
        ...MacroAsset_Exception_Detail,
      });
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

    const baseHelper = this.baseHelper;
    const nameSet = new Set<string>();
    const keyPathSet = new Set<string>();
    for (const input of inputs) {
      const { type, name, keyPath } = input;
      if (!name) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
          prop: "name",
          target: `macro.inputs.input ${JSON.stringify(input)}`,
        });
      }
      if (baseHelper.isValidMacroInputName(name) === false) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
          prop: "name",
          target: `macro.inputs.input ${JSON.stringify(input)}`,
        });
      }
      if (nameSet.has(name)) {
        throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_DUPLICATE, {
          prop: `name ${name}`,
          target: `macro.inputs.input ${JSON.stringify(input)}`,
        });
      }
      nameSet.add(name);
      if (!keyPath) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
          prop: "keyPath",
          target: `macro.inputs.input ${JSON.stringify(input)}`,
        });
      }
      if (keyPathSet.has(keyPath)) {
        throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_DUPLICATE, {
          prop: `keyPath ${keyPath}`,
          target: `macro.inputs.input ${JSON.stringify(input)}`,
        });
      }
      keyPathSet.add(keyPath);
      if (!type) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
          prop: "type",
          target: `macro.inputs.input ${JSON.stringify(input)}`,
        });
      }
      if (keyPath.includes(".")) {
        let target = template as Object;
        const properties = keyPath.split(".");
        const lastProperty = properties.pop()!;
        for (const property of properties) {
          if (target.hasOwnProperty(property) === false) {
            throw new ArgumentIllegalException(ERROR_LIST.NOT_EXIST, {
              prop: `keyPath ${keyPath}`,
              target: `macro.template`,
            });
          }
          target = (target as any)[property];
        }
        if (target.hasOwnProperty(lastProperty) === false) {
          throw new ArgumentIllegalException(ERROR_LIST.NOT_EXIST, {
            prop: `keyPath ${keyPath}`,
            target: `macro.template`,
          });
        }
      } else {
        if ((template as object).hasOwnProperty(keyPath) === false) {
          throw new ArgumentIllegalException(ERROR_LIST.NOT_EXIST, {
            prop: `keyPath ${keyPath}`,
            target: `macro.template`,
          });
        }
      }
      if (type === MACRO_INPUT_TYPE.NUMBER || type === MACRO_INPUT_TYPE.CALC) {
        const { base, min, max, step, format } = input as BFChainCore.Macro.NumberInputJSON;
        if (format === undefined) {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
            prop: "format",
            target: `macro.inputs.input ${JSON.stringify(input)}`,
          });
        }
        if (format !== MACRO_NUMBER_FORMAT.LITERAL && format !== MACRO_NUMBER_FORMAT.STRING) {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
            prop: `format ${format}`,
            target: `macro.inputs.input ${JSON.stringify(input)}`,
          });
        }
        if (base && baseHelper.isPositiveBigFloatContainZero(base) === false) {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
            prop: "base",
            target: `macro.inputs.input ${JSON.stringify(input)}`,
          });
        }
        if (min && baseHelper.isPositiveBigFloatContainZero(min) === false) {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
            prop: "min",
            target: `macro.inputs.input ${JSON.stringify(input)}`,
          });
        }
        if (max) {
          if (baseHelper.isPositiveBigFloatContainZero(max) === false) {
            throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
              prop: "max",
              target: `macro.inputs.input ${JSON.stringify(input)}`,
            });
          }
          if (base && this.jsbiHelper.compareFraction(max, base) === -1) {
            throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_LTE_FIELD, {
              prop: "base",
              target: `macro.inputs.input ${JSON.stringify(input)}`,
              field: JSON.stringify(max),
            });
          }
        }
        if (step) {
          if (baseHelper.isPositiveBigFloatContainZero(step) === false) {
            throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
              prop: "step",
              target: `macro.inputs.input ${JSON.stringify(input)}`,
            });
          }
          if (this.jsbiHelper.compareFraction(step, { numerator: "0", denominator: "1" }) < 1) {
            throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_GT_FIELD, {
              prop: "step",
              target: `macro.inputs.input ${JSON.stringify(input)}`,
              field: "0",
            });
          }
        }
        if (type === MACRO_INPUT_TYPE.CALC) {
          const { calc } = input as BFChainCore.Macro.CalcInputJSON;
          if (calc === undefined) {
            throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
              prop: "calc",
              target: `macro.inputs.input ${JSON.stringify(input)}`,
            });
          }
        }
      } else if (
        (type === MACRO_INPUT_TYPE.TEXT ||
          type === MACRO_INPUT_TYPE.ADDRESS ||
          type === MACRO_INPUT_TYPE.PUBLICKEY ||
          type === MACRO_INPUT_TYPE.SIGNATURE) === false
      ) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: `type ${type}`,
          target: `macro.inputs.input ${JSON.stringify(input)}`,
        });
      }
    }
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
