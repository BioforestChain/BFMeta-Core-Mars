import { TransactionFactory } from "./_txbase";
import { UsernameTransaction } from "@bfchain/core-model";
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
  SHOULD_NOT_BE,
  NOT_IN_EXPECTED_RANGE,
  SHOULD_NOT_EXIST,
  SHOULD_BE,
  SHOULD_NOT_INCLUDE,
} from "@bfchain/core-util-exception";
import { Injectable, TaskList } from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "UsernameTransactionFactory",
);

/**
 * username 交易工厂
 *
 */
@Injectable()
export class UsernameTransactionFactory extends TransactionFactory<UsernameTransaction> {
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
   * 要验证 username 交易的基础信息是否合法和 asset 信息是否存在
   * 交易的 rangeType 必须是 empty
   * 不能携带交易的接收者账户
   * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
   * 必须携带查询用的索引存储
   * key 值必须是 "alias" value 值必须是设定的值
   * asset 是完整的 username 信息
   * 用户名必须是 1-20 位 大小写字母、数字、下划线 1-20 组成的字符串
   * 用户名不能包含 ifmchain/bfchain
   * 必须携带设置用户名账户的公钥并且与发起账户公钥一致
   *
   * @param body
   * @param usernameAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    usernameAsset: BFChainCore.UsernameAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, usernameAsset, config);

    const Function_Exception_Detail = {
      target: "body",
      function: "verifyTransactionBody",
    } as const;

    this.emptyRangeType(body, Function_Exception_Detail);

    const { baseHelper, accountBaseHelper } = this;

    if (body.recipientId) {
      throw new ArgumentIllegalException(SHOULD_NOT_EXIST, {
        prop: "recipientId",
        ...Function_Exception_Detail,
      });
    }

    if (body.fromMagic !== config.magic) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "fromMagic",
        to_target: "body",
        be_compare_prop: "local chain magic",
        ...Function_Exception_Detail,
      });
    }

    if (body.toMagic !== config.magic) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "toMagic",
        to_target: "body",
        be_compare_prop: "local chain magic",
        ...Function_Exception_Detail,
      });
    }

    if (!body.storage) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "storage",
        ...Function_Exception_Detail,
      });
    }

    const storage = body.storage;
    if (storage.key !== "alias") {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "key",
        to_target: "storage",
        be_compare_prop: "alias",
        ...Function_Exception_Detail,
      });
    }

    const username = usernameAsset.username;

    if (!username) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "username",
        function: "verifyTransactionBody",
      });
    }

    const UsernameAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "usernameAsset",
    } as const;

    const alias = username.alias;
    if (!alias) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "alias",
        ...UsernameAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isString(alias)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "username",
        type: "string",
        ...UsernameAsset_Exception_Detail,
      });
    }

    const allowSymbols = /^[A-Za-z0-9_]{1,20}$/;
    // 创世受托人的用户名 是 链名 + 索引
    if (body.applyBlockHeight === 1) {
      if (!allowSymbols.test(alias)) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "alias",
          type: "genesis username",
          ...UsernameAsset_Exception_Detail,
        });
      }
    } else {
      if (!allowSymbols.test(alias)) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "alias",
          type: "username",
          ...UsernameAsset_Exception_Detail,
        });
      }

      if (alias.toLowerCase().includes(this.configHelper.chainName)) {
        throw new ArgumentIllegalException(SHOULD_NOT_INCLUDE, {
          prop: "alias",
          value: "chain name",
          ...UsernameAsset_Exception_Detail,
        });
      }
    }

    if (storage.value !== alias) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: "value",
        be_compare_prop: "alias",
        to_target: "storage",
        be_target: "username",
        ...Function_Exception_Detail,
      });
    }

    if (await accountBaseHelper.isAddress(alias)) {
      throw new ArgumentIllegalException(SHOULD_NOT_BE, {
        to_compare_prop: username,
        to_target: "usernameAsset",
        be_compare_prop: "address",
        ...UsernameAsset_Exception_Detail,
      });
    }

    if (alias.length === 0 || alias.length > 20) {
      throw new ArgumentIllegalException(NOT_IN_EXPECTED_RANGE, {
        prop: "alias",
        min: 1,
        max: 20,
        ...UsernameAsset_Exception_Detail,
      });
    }

    const publicKey = username.publicKey;
    if (!publicKey) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "publicKey",
        ...UsernameAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidPublicKey(publicKey)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "publicKey",
        type: "account publicKey",
        ...UsernameAsset_Exception_Detail,
      });
    }

    if (publicKey !== body.senderPublicKey) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: "publicKey",
        be_compare_prop: "senderPublicKey",
        to_target: "username",
        be_target: "body",
        ...UsernameAsset_Exception_Detail,
      });
    }
  }

  /**
   * 初始化 username 交易
   *
   * @param body
   * @param usernameAsset
   */
  init(body: BFChainCore.TxBodyJSON, usernameAsset: BFChainCore.UsernameAssetJSON) {
    const transaction = UsernameTransaction.fromObject({
      ...body,
      asset: usernameAsset,
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
    transaction: UsernameTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    const tasks = new TaskList();
    tasks.next = super.applyTransaction(transaction, eventEmitter, config);
    // 设置用户名
    tasks.next = eventEmitter.emit("setUsername", {
      type: "setUsername",
      transaction,
      applyInfo: {
        address: transaction.senderId,
        publicKeyBuffer: transaction.senderPublicKeyBuffer,
        alias: transaction.asset.username.alias,
      },
    });
    return tasks.tryToPromise();
  }
}
