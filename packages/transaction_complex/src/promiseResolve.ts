import { Injectable, wrapTaskList } from "@bfchain/util";
import { PromiseResolveTransaction } from "@bfchain/core-model";
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
  "PromiseResolveTransactionFactory",
);

/**
 * promiseResolve 交易工厂
 *
 */
@Injectable()
export class PromiseResolveTransactionFactory extends TransactionFactory<PromiseResolveTransaction> {
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
   * @param promiseResolveAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    promiseResolveAsset: BFChainCore.PromiseResolveAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, promiseResolveAsset, config);

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

    if (!body.storage) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "storage",
        ...Function_Exception_Detail,
      });
    }

    const storage = body.storage;
    if (storage.key !== "promiseId") {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `storage.key ${storage.key}`,
        to_target: "storage",
        be_compare_prop: "promiseId",
        ...Function_Exception_Detail,
      });
    }

    const resolve = promiseResolveAsset.resolve;

    if (!resolve) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "resolve",
      });
    }

    const PromiseResolveAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "resolve",
    } as const;

    const { promiseId } = resolve;
    if (!promiseId) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "promiseId",
        ...PromiseResolveAsset_Exception_Detail,
      });
    }

    if (this.baseHelper.isValidSignature(promiseId) === false) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `promiseId ${promiseId}`,
        ...PromiseResolveAsset_Exception_Detail,
      });
    }

    if (storage.value !== promiseId) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `storage.value ${storage.value}`,
        be_compare_prop: `promiseId ${promiseId}`,
        to_target: "storage",
        be_target: "resolve",
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 初始化 promiseResolve 交易
   *
   * @param body
   * @param promiseResolveAsset
   */
  init(body: BFChainCore.TxBodyJSON, promiseResolveAsset: BFChainCore.PromiseResolveAssetJSON) {
    const transaction = PromiseResolveTransaction.fromObject({
      ...body,
      asset: promiseResolveAsset,
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
    transaction: PromiseResolveTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);

      taskList.next = eventEmitter.emit("promiseResolve", {
        type: "promiseResolve",
        transaction,
        applyInfo: {
          promiseId: transaction.asset.resolve.promiseId,
          recipientId: transaction.recipientId,
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
    transaction: PromiseResolveTransaction,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    return "0";
  }
}
