import { Injectable, Inject, wrapTaskList } from "@bfchain/util";
import { PromiseTransaction } from "@bfchain/core-model";
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
  "PromiseTransactionFactory",
);

/**
 * promise 交易工厂
 *
 */
@Injectable()
export class PromiseTransactionFactory extends TransactionFactory<PromiseTransaction> {
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
   * @param promiseAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    promiseAsset: BFChainCore.PromiseAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, promiseAsset, config);

    const Function_Exception_Detail = {
      target: "body",
    } as const;

    this.emptyRangeType(body, Function_Exception_Detail);

    if (!body.recipientId) {
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

    if (body.storage) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_EXIST, {
        prop: "storage",
        ...Function_Exception_Detail,
      });
    }

    const promise = promiseAsset.promise;

    if (!promise) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "promise",
      });
    }

    const PromiseAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "promise",
    } as const;

    const { transaction: trsJson } = promise;
    if (!trsJson) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "transaction",
        ...PromiseAsset_Exception_Detail,
      });
    }

    const factory = this.transactionCore.getTransactionFactoryFromType(trsJson.type);
    const transaction = await factory.fromJSON(trsJson);
    await factory.verify(transaction);
  }

  /**
   * 初始化 promise 交易
   *
   * @param body
   * @param promiseAsset
   */
  init(body: BFChainCore.TxBodyJSON, promiseAsset: BFChainCore.PromiseAssetJSON) {
    const transaction = PromiseTransaction.fromObject({
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
    transaction: PromiseTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);
      // const promise = transaction.asset.promise.transaction;
      // const factory = this.transactionCore.getTransactionFactoryFromType(promise.type);
      // factory.applyTransaction(promise, eventEmitter, config);
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
    transaction: PromiseTransaction,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    return "0";
  }
}
