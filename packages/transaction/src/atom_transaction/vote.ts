import { TransactionFactory } from "./_txbase";
import { VoteTransaction } from "@bfchain/core-model";
import {
  AccountBaseHelper,
  TransactionHelper,
  BaseHelper,
  ConfigHelper,
  ChainAssetInfoHelper,
} from "@bfchain/core-helper";
import {
  CoreExceptionGenerator,
  PROP_IS_INVALID,
  SHOULD_BE,
  PARAM_LOST,
  PROP_IS_REQUIRE,
} from "@bfchain/core-util-exception";
import { Injectable, TaskList } from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator("CONTROLLER", "VoteTransactionFactory");

/**
 * vote 交易工厂
 *
 */
@Injectable()
export class VoteTransactionFactory extends TransactionFactory<VoteTransaction> {
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
   * 要验证 vote 交易的基础信息是否合法和 asset 信息是否存在
   * 交易的手续费必须大于 0
   * 交易的 rangeType 必须是 empty
   * 必须携带交易的接收者账户
   * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
   * 必须携带生成投票的合法数据
   * asset 是完整的 vote 信息
   * 必须携带合法的投出权益数量
   *
   * @param body
   * @param voteAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    voteAsset: BFChainCore.VoteAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, voteAsset, config);

    const Function_Exception_Detail = {
      target: "body",
      function: "verifyTransactionBody",
    } as const;

    this.emptyRangeType(body, Function_Exception_Detail);

    const { baseHelper } = this;

    if (!body.recipientId) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
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

    const vote = voteAsset.vote;

    if (!vote) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "voteAsset",
        function: "verifyTransactionBody",
      });
    }

    const VoteAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "voteAsset",
    } as const;

    if (!baseHelper.isValidAccountEquity(vote.equity)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `equity ${vote.equity}`,
        type: "account equity",
        ...VoteAsset_Exception_Detail,
      });
    }
  }

  /**
   * 初始化 vote 交易
   *
   * @param body
   * @param voteAsset
   */
  init(body: BFChainCore.TxBodyJSON, voteAsset: BFChainCore.VoteAssetJSON) {
    const transaction = VoteTransaction.fromObject({
      ...body,
      asset: voteAsset,
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
    transaction: VoteTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    const equity = transaction.asset.vote.equity;
    const tasks = new TaskList();
    tasks.next = super.applyTransaction(transaction, eventEmitter, config);
    // 扣除投票权益
    tasks.next = eventEmitter.emit("voteEquity", {
      type: "voteEquity",
      transaction,
      applyInfo: {
        address: transaction.senderId,
        publicKeyBuffer: transaction.senderPublicKeyBuffer,
        equity: "-" + equity,
        sourceEquity: equity,
        recipientId: transaction.recipientId as string,
      },
    });
    return tasks.tryToPromise();
  }
}
