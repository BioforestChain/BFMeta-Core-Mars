import { Injectable, Inject, wrapTaskList } from "@bfchain/util";
import { MultipleTransaction } from "@bfchain/core-model";
import {
  AccountBaseHelper,
  TransactionHelper,
  BaseHelper,
  ConfigHelper,
  ChainAssetInfoHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { TransactionFactory, TransactionCore } from "@bfchain/core-transaction";

const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "MultipleTransactionFactory",
);

/**
 * multiple 交易工厂
 *
 */
@Injectable()
export class MultipleTransactionFactory extends TransactionFactory<MultipleTransaction> {
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
   * @param multipleAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    multipleAsset: BFChainCore.MultipleAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, multipleAsset, config);

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

    const multiple = multipleAsset.multiple;

    if (!multiple) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "multiple",
      });
    }

    const MultipleAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "multiple",
    } as const;

    const { transactions } = multiple;
    if (!transactions) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "transactions",
        ...MultipleAsset_Exception_Detail,
      });
    }

    if (transactions.length === 0) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_LENGTH_SHOULD_GT_FIELD, {
        prop: "transactions",
        field: 0,
        ...MultipleAsset_Exception_Detail,
      });
    }

    const signatureSet = new Set<string>();
    for (const trsJson of transactions) {
      const { signature } = trsJson;
      if (signatureSet.has(signature)) {
        throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_DUPLICATE, {
          prop: `transactions ${signature}`,
          ...MultipleAsset_Exception_Detail,
        });
      }
      signatureSet.add(signature);
      const factory = this.transactionCore.getTransactionFactoryFromType(trsJson.type);
      const transaction = await factory.fromJSON(trsJson);
      await factory.verify(transaction);
    }
  }

  /**
   * 初始化 multiple 交易
   *
   * @param body
   * @param multipleAsset
   */
  init(body: BFChainCore.TxBodyJSON, multipleAsset: BFChainCore.MultipleAssetJSON) {
    const transaction = MultipleTransaction.fromObject({
      ...body,
      asset: multipleAsset,
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
    transaction: MultipleTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      /// 这里不做娃子交易的的 applyTransaction，再合适的时机自己调用，避免重复触发事件
      /// multiple 交易由于娃子交易是完整的，所以可以在这里触发，但是 macroCall 和
      /// promiseResolve 这里是没有完善的娃子交易的，所以这里统一不做触发
      /// pc 是在 logicVerify(逻辑校验) 和 applyTransaction(上下帐)
      /// 参见 packages\transaction_complex_logic_verifier\src\multipleLogicVerifier.ts
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
    transaction: MultipleTransaction,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    return "0";
  }
}
