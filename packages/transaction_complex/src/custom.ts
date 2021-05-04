import { TransactionFactory } from "@bfchain/core-transaction";
import { CustomTransaction } from "@bfchain/core-model";
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
  CUSTOM_TRANS_VERIFY_FAIL,
} from "@bfchain/core-util-exception";
import { Injectable, TaskList, Inject } from "@bfchain/util";
import { CustomTransactionEvent } from "./custom.event";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "CustomTransactionFactory",
);

/**
 *  交易工厂
 *
 */
@Injectable()
export class CustomTransactionFactory extends TransactionFactory<CustomTransaction> {
  constructor(
    public accountBaseHelper: AccountBaseHelper,
    public transactionHelper: TransactionHelper,
    public baseHelper: BaseHelper,
    public configHelper: ConfigHelper,
    public chainAssetInfoHelper: ChainAssetInfoHelper,
    public customTransactionEvent: CustomTransactionEvent,
  ) {
    super();
  }
  @Inject("customTransactionCenter")
  customTransactionCenter?: BFChainCore.CustomTrCenterInterface;

  /**
   * 校验输入信息
   * 要验证 custom 交易的基础信息是否合法和 asset 信息是否存在
   * @param body
   * @param customAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    customAsset: BFChainCore.CustomAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, customAsset, config);

    const custom = customAsset.custom;

    // const { baseHelper } = this;

    const Function_Exception_Detail = { function: "verifyTransactionBody" };

    // if (body.recipientId) {
    //   throw new ArgumentIllegalException(SHOULD_NOT_EXIST, {
    //     prop: "recipientId",
    //     target: "body",
    //     ...Function_Exception_Detail,
    //   });
    // }

    if (!custom) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "custom",
        ...Function_Exception_Detail,
      });
    }

    //  获取对应自定义交易中心信息，与之通讯获取自定义asset的校验结果...
    if (this.customTransactionCenter) {
      const res = await this.customTransactionCenter.verify(body, customAsset);
      if (!res.ret) {
        throw new ArgumentIllegalException(CUSTOM_TRANS_VERIFY_FAIL, {
          message: res.message,
        });
      }
    }
  }

  /**
   * 初始化 custom 交易
   *
   * @param body
   * @param customAsset
   */
  init(body: BFChainCore.TxBodyJSON, customAsset: BFChainCore.CustomAssetJSON) {
    const transaction = CustomTransaction.fromObject({
      ...body,
      asset: customAsset,
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
    transaction: CustomTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    const tasks = new TaskList();
    tasks.next = super.applyTransaction(transaction, eventEmitter);
    // TODO....账务处理
    if (this.customTransactionCenter) {
      const applyResults = await this.customTransactionCenter.apply(transaction);
      for (const applyResult of applyResults) {
        await this.customTransactionEvent.verifyApplyResult(applyResult, transaction);
        tasks.next = this.customTransactionEvent.combineApplyEvent(
          transaction,
          eventEmitter,
          applyResult,
        );
      }
    }
    //  ....
    return tasks.toPromise();
  }
}
