import { TransactionFactory } from "./_txbase";
import { DelegateTransaction } from "@bfchain/core-model";
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
  NOT_MATCH,
  PROP_IS_REQUIRE,
  PROP_IS_INVALID,
  SHOULD_BE,
  SHOULD_NOT_EXIST,
} from "@bfchain/core-util-exception";
import { Injectable, TaskList } from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "DelegateTransactionFactory",
);

/**
 * delegate 交易工厂
 *
 */
@Injectable()
export class DelegateTransactionFactory extends TransactionFactory<DelegateTransaction> {
  constructor(
    public accountHelper: AccountBaseHelper,
    public transactionHelper: TransactionHelper,
    public baseHelper: BaseHelper,
    public configHelper: ConfigHelper,
    public chainAssetInfoHelper: ChainAssetInfoHelper,
  ) {
    super();
  }

  /**
   * 校验输入信息
   * 要验证 delegate 交易的基础信息是否合法和 asset 信息是否存在
   * 交易的手续费必须大于 0
   * 交易的 rangeType 必须是 empty
   * 不能携带交易的接收者账户
   * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
   * 必须携带查询用的索引存储
   * key 值必须是 "username" value 值必须是设定的值
   * asset 是完整的 delegate 信息
   * 需要携带合法的账户名
   * 需要携带合法的账户公钥，且与发起账户公钥相等
   *
   * @param body
   * @param delegateAsset
   */
  verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    delegateAsset: BFChainCore.DelegateAssetJSON,
    config = this.configHelper,
  ) {
    super.verifyTransactionBody(body, delegateAsset, config);

    const Function_Exception_Detail = {
      target: "body",
      function: "verifyTransactionBody",
    } as const;

    this.emptyRangeType(body, Function_Exception_Detail);

    const { baseHelper } = this;

    if (body.recipientId) {
      throw new ArgumentIllegalException(SHOULD_NOT_EXIST, {
        prop: "recipientId",
        target: "body",
        ...Function_Exception_Detail,
      });
    }

    if (body.fromMagic !== config.magic) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "fromMagic",
        to_target: "body",
        be_compare_prop: "chain magic",
        target: "body",
        ...Function_Exception_Detail,
      });
    }

    if (body.toMagic !== config.magic) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "toMagic",
        to_target: "body",
        be_compare_prop: "chain magic",
        target: "body",
        ...Function_Exception_Detail,
      });
    }

    if (!body.storage) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "storage",
        target: "body",
        ...Function_Exception_Detail,
      });
    }

    const storage = body.storage;
    if (storage.key !== "username") {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "key",
        to_target: "storage",
        be_compare_prop: "username",
        ...Function_Exception_Detail,
      });
    }

    const delegate = delegateAsset.delegate;

    if (!delegate) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "delegate",
        function: "verifyTransactionBody",
      });
    }

    const DelegateAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "delegateAsset",
    } as const;

    const username = delegate.username;
    if (!username) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "username",
        ...DelegateAsset_Exception_Detail,
      });
    }

    if (body.applyBlockHeight === 1) {
      if (!baseHelper.isValidGenesisUsername(username)) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "username",
          type: "genesis username",
          ...DelegateAsset_Exception_Detail,
        });
      }
    } else {
      if (!baseHelper.isValidUsername(username)) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "username",
          type: "username",
          ...DelegateAsset_Exception_Detail,
        });
      }
    }

    if (storage.value !== username) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: "value",
        be_compare_prop: "username",
        to_target: "storage",
        be_target: "delegate",
        ...Function_Exception_Detail,
      });
    }

    const publicKey = delegate.publicKey;
    if (!publicKey) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "publicKey",
        ...DelegateAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidPublicKey(publicKey)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "publicKey",
        type: "account publicKey",
        ...DelegateAsset_Exception_Detail,
      });
    }

    if (publicKey !== body.senderPublicKey) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: "publicKey",
        be_compare_prop: "senderPublicKey",
        to_target: "delegate",
        be_target: "body",
        ...DelegateAsset_Exception_Detail,
      });
    }
  }

  /**
   * 初始化 delegate 交易
   *
   * @param body
   * @param delegateAsset
   */
  init(body: BFChainCore.TxBodyJSON, delegateAsset: BFChainCore.DelegateAssetJSON) {
    const transaction = DelegateTransaction.fromObject({
      ...body,
      asset: delegateAsset,
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
    transaction: DelegateTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    const tasks = new TaskList();
    tasks.next = super.applyTransaction(transaction, eventEmitter, config);
    // 注册受托人
    tasks.next = eventEmitter.emit("registerToDelegate", {
      type: "registerToDelegate",
      transaction: transaction,
      applyInfo: {
        address: transaction.senderId,
        publicKeyBuffer: transaction.senderPublicKeyBuffer,
      },
    });
    return tasks.tryToPromise();
  }
}
