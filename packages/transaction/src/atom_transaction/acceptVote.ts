import { TransactionFactory } from "./_txbase";
import { AcceptVoteTransaction } from "@bfchain/core-model";
import {
  AccountBaseHelper,
  TransactionHelper,
  BaseHelper,
  ConfigHelper,
  ChainAssetInfoHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator, SHOULD_BE, SHOULD_NOT_EXIST } from "@bfchain/core-util-exception";
import { Injectable, TaskList } from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "AcceptVoteTransactionFactory",
);

/**
 * acceptVote 交易工厂
 *
 */
@Injectable()
export class AcceptVoteTransactionFactory extends TransactionFactory<AcceptVoteTransaction> {
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
   * 要验证 acceptVote 交易的基础信息是否合法和 asset 信息是否存在
   * 交易的手续费必须大于 0
   * 交易的 rangeType 必须是 empty
   * 不能携带交易的接收者账户
   * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
   *
   * @param body
   * @param acceptVoteAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    acceptVoteAsset: BFChainCore.AcceptVoteAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, acceptVoteAsset, config);

    const Function_Exception_Detail = {
      target: "body",
      function: "verifyTransactionBody",
    } as const;

    this.emptyRangeType(body, Function_Exception_Detail);

    if (body.recipientId) {
      throw new ArgumentIllegalException(SHOULD_NOT_EXIST, {
        prop: "recipientId",
        ...Function_Exception_Detail,
      });
    }

    if (body.fromMagic !== config.magic) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `fromMagic ${body.fromMagic}`,
        to_target: "body",
        be_compare_prop: "local chain magic",
        ...Function_Exception_Detail,
      });
    }

    if (body.toMagic !== config.magic) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `toMagic ${body.toMagic}`,
        to_target: "body",
        be_compare_prop: "local chain magic",
        ...Function_Exception_Detail,
      });
    }

    if (body.storage) {
      throw new ArgumentIllegalException(SHOULD_NOT_EXIST, {
        prop: "storage",
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 初始化 acceptVote 交易
   *
   * @param body
   * @param acceptVoteAsset
   */
  init(body: BFChainCore.TxBodyJSON, acceptVoteAsset: BFChainCore.AcceptVoteAssetJSON) {
    const transaction = AcceptVoteTransaction.fromObject({
      ...body,
      asset: acceptVoteAsset,
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
    transaction: AcceptVoteTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    const tasks = new TaskList();
    tasks.next = super.applyTransaction(transaction, eventEmitter, config);
    // 接收投票
    tasks.next = eventEmitter.emit("acceptVote", {
      type: "acceptVote",
      transaction,
      applyInfo: {
        address: transaction.senderId,
        publicKeyBuffer: transaction.senderPublicKeyBuffer,
      },
    });
    return tasks.tryToPromise();
  }
}
