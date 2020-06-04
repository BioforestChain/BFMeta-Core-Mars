import { TransactionFactory } from "@bfchain/core-transaction";
import { RegisterChainTransaction, ACCOUNT_STATUS } from "@bfchain/core-model";
import {
  TransactionHelper,
  AccountBaseHelper,
  BaseHelper,
  ConfigHelper,
  ConfigHelperMap,
  ChainAssetInfoHelper,
} from "@bfchain/core-helper";
import {
  CoreExceptionGenerator,
  PARAM_LOST,
  PROP_IS_REQUIRE,
  SHOULD_BE,
  SHOULD_NOT_EXIST,
  NOT_MATCH,
} from "@bfchain/core-util-exception";
import { Injectable, Inject, TaskList } from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "RegisterChainTransactionFactory",
);

/**
 * registerChain 交易工厂
 *
 */
@Injectable()
export class RegisterChainTransactionFactory extends TransactionFactory<RegisterChainTransaction> {
  constructor(
    public accountBaseHelper: AccountBaseHelper,
    public transactionHelper: TransactionHelper,
    public baseHelper: BaseHelper,
    public configHelper: ConfigHelper,
    public chainAssetInfoHelper: ChainAssetInfoHelper,
    private configMap: ConfigHelperMap,
  ) {
    super();
  }

  /**
   * 校验输入信息
   * 要验证 registerChain 交易的基础信息是否合法和 asset 信息是否存在
   * 交易的手续费必须大于 0
   * 交易的 rangeType 必须是 empty
   * 必须携带交易的接收者账户，并且是 dapp 的拥有者地址
   * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
   * 必须携带查询用的索引存储
   *  key 值必须是 "magic" value 值必须是设定的值
   * asset 是完整的 registerChain 信息
   * 需要携带要注册的链的创世块
   * 验证创世块信息是否合法
   *
   * @param body
   * @param registerChainAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    registerChainAsset: BFChainCore.RegisterChainAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, registerChainAsset, config);

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
        to_compare_prop: "fromMagic",
        to_target: "body",
        be_compare_prop: "chain magic",
        ...Function_Exception_Detail,
      });
    }

    if (body.toMagic !== config.magic) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "toMagic",
        to_target: "body",
        be_compare_prop: "chain magic",
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
    if (storage.key !== "magic") {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "key",
        to_target: "storage",
        be_compare_prop: "magic",
        ...Function_Exception_Detail,
      });
    }

    const registerChain = registerChainAsset.registerChain;

    if (!registerChain) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "registerChain",
        function: "verifyTransactionBody",
      });
    }

    const RegisterChainAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "registerChainAsset",
    } as const;

    const genesisBlockJson = registerChain.genesisBlock;
    if (!genesisBlockJson) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "genesisBlock",
        ...RegisterChainAsset_Exception_Detail,
      });
    }

    if (config.initials !== genesisBlockJson.remark.bnid) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: config.initials,
        be_compare_prop: genesisBlockJson.remark.bnid,
        to_target: "config",
        be_target: "genesisBlockJson.remark",
        ...Function_Exception_Detail,
      });
    }

    let chainConfig = this.configMap.get(genesisBlockJson.magic);
    if (!chainConfig) {
      // FIXME: 没有注册链的配置文件就生成一个
      chainConfig = new ConfigHelper(genesisBlockJson, this.configHelper.business);
    }

    const genesisBlock = await this._blockCore.recombineBlock(genesisBlockJson);
    await this._blockCore
      .getBlockFactoryFromHeight<BFChainCore.Block<BFChainCore.GenesisBlockRemarkJSON>>(
        genesisBlockJson.height,
      )
      .verify(genesisBlock, chainConfig);
  }

  @Inject("bfchain-core:BlockCore")
  private _blockCore!: import("@bfchain/core-block").BlockCore;

  /**
   * 初始化 registerChain 交易
   *
   * @param body
   * @param registerChain
   */
  init(body: BFChainCore.TxBodyJSON, registerChain: BFChainCore.RegisterChainAssetJSON) {
    const transaction = RegisterChainTransaction.fromObject({
      ...body,
      asset: registerChain,
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
    transaction: RegisterChainTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    const tasks = new TaskList();
    tasks.next = super.applyTransaction(transaction, eventEmitter, config);
    const { senderId, senderPublicKeyBuffer } = transaction;
    const { genesisBlock } = transaction.asset.registerChain;
    // 冻结发起账户
    tasks.next = eventEmitter.emit("frozenAccount", {
      type: "frozenAccount",
      transaction,
      applyInfo: {
        address: senderId,
        publicKeyBuffer: senderPublicKeyBuffer,
        accountStatus: ACCOUNT_STATUS.FROZEN_OUT,
      },
    });
    // 注册链
    tasks.next = eventEmitter.emit("registerChain", {
      type: "registerChain",
      transaction,
      applyInfo: {
        address: senderId,
        publicKeyBuffer: senderPublicKeyBuffer,
        genesisBlock,
      },
    });
    return tasks.tryToPromise();
  }
}
