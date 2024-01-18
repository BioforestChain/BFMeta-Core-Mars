import { Injectable, Inject, wrapTaskList, $safeEnd } from "@bfchain/util";
import {
  MacroCallTransaction,
  MACRO_INPUT_TYPE,
  MACRO_NUMBER_FORMAT,
  StringKeyJsonValueMap,
} from "@bfchain/core-model";
import {
  AccountBaseHelper,
  TransactionHelper,
  BaseHelper,
  ConfigHelper,
  ChainAssetInfoHelper,
  JSBIHelper,
  AsymmetricHelper,
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
    public asymmetricHelper: AsymmetricHelper,
    public transactionHelper: TransactionHelper,
    public baseHelper: BaseHelper,
    public configHelper: ConfigHelper,
    public chainAssetInfoHelper: ChainAssetInfoHelper,
    public jsbiHelper: JSBIHelper,
  ) {
    super();
  }
  @Inject("bfchain-core:TransactionCore", { dynamics: true })
  public transactionCore!: TransactionCore;

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

  parseToMacroCallInputs(inputs: { [name: string]: any }): BFChainCore.MacroCallInputs {
    return Object.fromEntries(
      Object.entries(inputs).map((kv) => {
        return [kv[0], JSON.stringify(kv[1])] as const;
      }),
    );
  }

  async generateTransactionWithJsonInput<T extends BFChainCore.Transaction>(
    template: T,
    defineInputs: BFChainCore.Macro.InputJSON[],
    jsonInputs: { [name: string]: any },
    skipVerify = true,
  ) {
    return await this.generateTransaction(
      template,
      defineInputs,
      this.parseToMacroCallInputs(jsonInputs),
      skipVerify,
    );
  }

  async generateTransaction<T extends BFChainCore.Transaction>(
    template: T,
    defineInputs: BFChainCore.Macro.InputJSON[],
    jsonInputs: BFChainCore.MacroCallInputs,
    skipVerify = true,
  ) {
    const inputMap = new StringKeyJsonValueMap(jsonInputs);
    const baseHelper = this.baseHelper;
    /// 复制出一份JSON
    const transaction = template.toJSON();
    for (const defineInput of defineInputs) {
      const { name, pattern, repeat } = defineInput;
      let result = inputMap.get(name);
      const verifyFunc = async (value: unknown) => {
        if (typeof value !== "string") {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
            prop: `${defineInput.name} ${value}`,
            target: "inputs",
          });
        }
        if (pattern && new RegExp(pattern).test(value) === false) {
          throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
            to_compare_prop: `${name} ${value}`,
            to_target: "inputs",
            be_compare_prop: `pattern ${pattern}`,
            be_target: "defineInput",
          });
        }
        switch (defineInput.type) {
          case MACRO_INPUT_TYPE.ADDRESS:
            if ((await this.accountBaseHelper.isAddress(value)) === false) {
              throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
                to_compare_prop: `${name} ${value}`,
                to_target: "inputs",
                be_compare_prop: `pattern chain address`,
                be_target: "defineInput",
              });
            }
            break;
          case MACRO_INPUT_TYPE.PUBLICKEY:
            if (this.baseHelper.isValidPublicKey(value) === false) {
              throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
                to_compare_prop: `${name} ${value}`,
                to_target: "inputs",
                be_compare_prop: `pattern chain publicKey`,
                be_target: "defineInput",
              });
            }
            break;
          case MACRO_INPUT_TYPE.SIGNATURE:
            if (this.transactionHelper.isValidTransactionSignature(value) === false) {
              throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
                to_compare_prop: `${name} ${value}`,
                to_target: "inputs",
                be_compare_prop: `pattern chain signature`,
                be_target: "defineInput",
              });
            }
            break;
          case MACRO_INPUT_TYPE.TEXT:
            break;
          case MACRO_INPUT_TYPE.CALC:
            /// 不知道咋验证啊
            /// FIXME: @GauBee
            value = calc.evaluate(defineInput.calc, inputMap.toObject() as any);
          case MACRO_INPUT_TYPE.NUMBER: {
            if ((value as string).includes(".")) {
              const items = (value as string).split(".");
              /// 拦截 0.0，10.0，20.0 ...
              if (BigInt(items[1]) === BigInt(0)) {
                throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
                  to_compare_prop: `name ${name}(${value})`,
                  to_target: "inputs",
                  be_compare_prop: items[0],
                });
              }
            }
            const base = defineInput.base || {
              numerator: "0",
              denominator: "1",
            };
            let formatValue = this.jsbiHelper.toFraction(value as string);
            if (
              defineInput.min &&
              this.jsbiHelper.compareFraction(defineInput.min, formatValue) === 1
            ) {
              throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_GTE_FIELD, {
                prop: `name ${name} ${value}`,
                target: "inputs",
                field: JSON.stringify(defineInput.min),
              });
            }
            if (
              defineInput.max &&
              this.jsbiHelper.compareFraction(defineInput.max, formatValue) === -1
            ) {
              throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_LTE_FIELD, {
                prop: `name ${name} ${value}`,
                target: "inputs",
                field: JSON.stringify(defineInput.max),
              });
            }
            // 扣除 base 后验证步长
            formatValue = this.jsbiHelper.minusFraction(formatValue, base);
            const step = defineInput.step || {
              numerator: "1",
              denominator: "1",
            };
            const multiple = this.jsbiHelper.divisionFractionAndCeil(formatValue, step);
            if (
              this.jsbiHelper.compareFraction(
                formatValue,
                this.jsbiHelper.multiplyFraction(
                  {
                    numerator: multiple,
                    denominator: BigInt(1),
                  },
                  step,
                ),
              ) !== 0
            ) {
              throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
                to_compare_prop: `name ${name}(${value})'s step`,
                to_target: "inputs",
                be_compare_prop: JSON.stringify(defineInput.step),
              });
            }
            if (defineInput.format === MACRO_NUMBER_FORMAT.LITERAL) {
              value = Number(value);
            }
            break;
          }
          default:
            $safeEnd(defineInput);
        }
        return value as string;
      };
      if (repeat) {
        if (baseHelper.isArray(result) === false) {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
            prop: `${defineInput.name}(repeat ${repeat}) ${result}`,
            target: "inputs",
          });
        }
        const values: string[] = [];
        for (const item of result) {
          values.push(await verifyFunc(item));
        }
        /// 写入值
        if (this.trySet(transaction, defineInput.keyPath, values) === false) {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
            prop: `name ${name}`,
            target: "inputs",
          });
        }
      } else {
        const value = await verifyFunc(result);
        /// 写入值
        if (this.trySet(transaction, defineInput.keyPath, value) === false) {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
            prop: `name ${name}`,
            target: "inputs",
          });
        }
      }
    }
    const transactionModel = await this.transactionCore.recombineTransaction<T>(transaction);
    /// 验证 json，number 类型的会被 protobuf 自动转换 100.1 => 100
    for (const defineInput of defineInputs) {
      if (defineInput.type === MACRO_INPUT_TYPE.NUMBER) {
        const items = defineInput.keyPath.split(".");
        let prev = transaction as any;
        let next = transactionModel as any;
        for (const item of items) {
          prev = prev[item];
          next = next[item];
        }
        if (prev.toString() !== next.toString()) {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
            prop: `${defineInput.name} ${prev}`,
            target: "inputs",
          });
        }
      }
    }
    if (skipVerify === false) {
      const factory = this.transactionCore.getTransactionFactoryFromType(transactionModel.type);
      await factory.verify(transactionModel, this.configHelper);
    }
    return transactionModel;
  }

  async signTransaction<T extends BFChainCore.Transaction>(
    transaction: T,
    secret: string,
    secondSecret?: string,
  ) {
    const template = await this.transactionCore.recombineTransaction<T>(transaction.toJSON());
    const { accountBaseHelper, asymmetricHelper } = this;
    const keypair = await accountBaseHelper.createSecretKeypair(secret);
    template.signatureBuffer = await asymmetricHelper.detachedSign(
      template.getBytes(true, true),
      keypair.secretKey,
    );
    let secondKeypair!: BFChainCore.Keypair;
    if (secondSecret) {
      secondKeypair = await accountBaseHelper.createSecondSecretKeypair(secret, secondSecret);
      template.signSignatureBuffer = await asymmetricHelper.detachedSign(
        template.getBytes(false, true),
        secondKeypair.secretKey,
      );
      await this.transactionHelper.verifyTransactionSignature(template);
    }
    return template;
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

    const { macroId, inputs, transaction } = call;

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

    if (!transaction) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "transaction",
        ...MacroCallAsset_Exception_Detail,
      });
    }

    /// 基础校验
    const trs = await this.transactionCore.recombineTransaction(transaction);
    const factory = this.transactionCore.getTransactionFactoryFromType(trs.type);
    await factory.verify(trs);

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
