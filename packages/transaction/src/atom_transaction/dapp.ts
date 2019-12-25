import { TransactionFactory } from "./_txbase";
import { DAppTransaction, DAPP_TYPE } from "@bfchain/core-model";
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
  NOT_IN_EXPECTED_RANGE,
} from "@bfchain/core-util-exception";
import { Injectable, TaskList } from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator("CONTROLLER", "DAppTransactionFactory");

/**
 * dapp 交易工厂
 *
 */
@Injectable()
export class DAppTransactionFactory extends TransactionFactory<DAppTransaction> {
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
   * 要验证 dapp 交易的基础信息是否合法和 asset 信息是否存在
   * 交易的手续费必须大于 0
   * 交易的 rangeType 必须是 empty
   * 不能携带交易的接收者账户
   * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
   * 必须携带查询用的索引存储
   * key 值必须是 "dappid" value 值必须是设定的值
   * dappid 必须存在，长度为 6 的字符串，只能是大写字母或数字
   * asset 是完整的 dapp 信息
   * 需要携带合法的 dappid
   * 需要携带合法的 dapp 所属链的名称,并且是本链
   * 需要携带合法的 dapp 所属链的网络标识符,并且是本链
   * 需要携带合法且存在的 dapp 类型
   * 如果是付费应用，如果没有携带指定合法的购买资产，则报错
   * 如果是免费应用，如果携带购买资产，则报错
   *
   * @param body
   * @param dappAsset
   */
  verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    dappAsset: BFChainCore.DAppAssetJSON,
    config = this.configHelper,
  ) {
    super.verifyTransactionBody(body, dappAsset, config);

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

    if (storage.key !== "dappid") {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "key",
        to_target: "storage",
        be_compare_prop: "dappid",
        ...Function_Exception_Detail,
      });
    }

    const dapp = dappAsset.dapp;

    this.verifyDAppAsset(dapp, config);

    if (storage.value !== dapp.dappid) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: "value",
        be_compare_prop: "dappid",
        to_target: "storage",
        be_target: "dapp",
        ...Function_Exception_Detail,
      });
    }
  }

  verifyDAppAsset(dapp: BFChainCore.DAppJSON, config = this.configHelper) {
    const { baseHelper } = this;

    const Function_Exception_Detail = { function: "verifyTransactionBody" } as const;

    if (!dapp) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "dapp",
        ...Function_Exception_Detail,
      });
    }

    const DappAsset_Exception_Detail = {
      target: "dappAsset",
      ...Function_Exception_Detail,
    } as const;

    const { dappid, sourceChainMagic, sourceChainName, type, purchaseAsset } = dapp;

    if (!dappid) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "dappid",
        ...DappAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isString(dappid)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "dappid",
        type: "string",
        ...DappAsset_Exception_Detail,
      });
    }

    const len = dappid.length;
    if (len < 17 || len > 32) {
      throw new ArgumentIllegalException(NOT_IN_EXPECTED_RANGE, {
        prop: "dappid",
        target: "dapp length",
        min: 17,
        max: 32,
        ...DappAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isUpperCaseOrNumber(dappid)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "dappid",
        type: "uppercase or number",
        ...DappAsset_Exception_Detail,
      });
    }

    this.checkChainName(sourceChainName, "sourceChainName", DappAsset_Exception_Detail);

    if (sourceChainName !== config.chainName) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "sourceChainName",
        to_target: "body",
        be_compare_prop: "local chain name",
        target: "body",
        ...Function_Exception_Detail,
      });
    }

    this.checkChainMagic(sourceChainMagic, "sourceChainMagic", DappAsset_Exception_Detail);

    if (sourceChainMagic !== config.magic) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "sourceChainMagic",
        to_target: "body",
        be_compare_prop: "local chain magic",
        target: "body",
        ...Function_Exception_Detail,
      });
    }

    if (!DAPP_TYPE[type]) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: "type",
        be_compare_prop: "dappType",
        to_target: "dapp",
        be_target: "DAPP_TYPE",
        ...DappAsset_Exception_Detail,
      });
    }

    if (type === DAPP_TYPE.PAID_APP) {
      if (!purchaseAsset) {
        throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
          prop: "sourceChainMagic",
          ...DappAsset_Exception_Detail,
        });
      }

      if (!baseHelper.isObject(purchaseAsset)) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "purchaseAsset",
          type: "purchase asset object",
          ...DappAsset_Exception_Detail,
        });
      }

      const { sourceChainMagic, sourceChainName, assetType, amount } = purchaseAsset;

      this.checkChainName(sourceChainName, "sourceChainName", DappAsset_Exception_Detail);

      this.checkChainMagic(sourceChainMagic, "sourceChainMagic", DappAsset_Exception_Detail);

      this.checkAssetType(assetType, "assetType", DappAsset_Exception_Detail);

      this.checkAssetAmount(amount, "amount", DappAsset_Exception_Detail);
    } else if (type === DAPP_TYPE.FREE_APP) {
      if (purchaseAsset) {
        throw new ArgumentIllegalException(SHOULD_NOT_EXIST, {
          prop: "purchaseAmount",
          ...DappAsset_Exception_Detail,
        });
      }
    }
  }

  /**
   * 初始化 dapp 交易
   *
   * @param body
   * @param dappAsset
   */
  init(body: BFChainCore.TxBodyJSON, dappAsset: BFChainCore.DAppAssetJSON) {
    const transaction = DAppTransaction.fromObject({
      ...body,
      asset: dappAsset,
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
    transaction: DAppTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    const tasks = new TaskList();
    tasks.next = super.applyTransaction(transaction, eventEmitter, config);
    const {
      sourceChainName,
      sourceChainMagic,
      dappid,
      type,
      purchaseAsset,
    } = transaction.asset.dapp;
    // 发行 dappid
    tasks.next = eventEmitter.emit("issueDAppid", {
      type: "issueDAppid",
      transaction,
      applyInfo: {
        address: transaction.senderId,
        publicKeyBuffer: transaction.senderPublicKeyBuffer,
        sourceChainName,
        sourceChainMagic,
        dappid,
        possessorAddress: transaction.senderId,
        type,
        purchaseAsset: purchaseAsset ? purchaseAsset.toJSON() : undefined,
      },
    });
    return tasks.tryToPromise();
  }
}
