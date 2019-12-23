import { TransactionFactory } from "./_txbase";
import { TrustAssetTransaction } from "../../model";
import {
  AccountBaseHelper,
  CoreExceptionGenerator,
  TransactionHelper,
  BaseHelper,
  ConfigHelper,
  ChainAssetInfoHelper,
} from "@bfchain/core-helper";
import {
  PARAM_LOST,
  PROP_IS_REQUIRE,
  PROP_IS_INVALID,
  SHOULD_NOT_BE,
  SHOULD_BE,
  NOT_MATCH,
  PROP_SHOULD_LTE_FIELD,
  PROP_SHOULD_GTE_FIELD,
} from "../../../helper/src/exception/errorCode";
import { Injectable, TaskList } from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "TrustAssetTransactionFactory",
);

/**
 * trustAsset 交易工厂
 *
 */
@Injectable()
export class TrustAssetTransactionFactory extends TransactionFactory<TrustAssetTransaction> {
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
   * 要验证 trustAsset 交易的基础信息是否合法和 asset 信息是否存在
   * 交易的手续费必须大于 0
   * 交易的 rangeType 必须是 empty
   * 必须携带交易的接收账户地址，并且不能是交易的发起账户(是 trust amount 的接收人)
   * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
   * 必须携带查询用的索引存储
   * key 值必须是 "assetType" value 值必须是设定的值
   * asset 是完整的 trustAsset 信息
   * 必须携带委托账户：合法的账户地址组成的数组，长度大于 0，不能包含发起账户
   * 必须携带签收交易需要的委托人签名数量 n，n 不能大于最大签名数量(max = 发起账户 + 接收账户 + 委托账户)，最小为 1
   * 如果携带开始抢的区块间隔，这个间隔必须是正整数
   * 必须携带合法的委托的数字资产所属链名
   * 必须携带合法的委托的数字资产所属链网络标识符
   * 必须携带合法的委托的数字资产名
   * 必须携带合法的委托的数字资产数量，并且大于 0
   * 如果交易指定了过期区块间隔 n 和开始解冻区块间隔 m，则 m 必须小于 n
   *
   * @param body
   * @param trustAssetAsset
   */
  verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    trustAssetAsset: BFChainCore.TrustAssetAssetJSON,
    config = this.configHelper,
  ) {
    super.verifyTransactionBody(body, trustAssetAsset, config);

    const Function_Exception_Detail = {
      target: "body",
      function: "verifyTransactionBody",
    } as const;

    this.emptyRangeType(body, Function_Exception_Detail);

    const recipientId = body.recipientId;

    if (!recipientId) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "recipientId",
        target: "body",
        ...Function_Exception_Detail,
      });
    }

    if (body.senderId === recipientId) {
      throw new ArgumentIllegalException(SHOULD_NOT_BE, {
        to_compare_prop: "senderId",
        to_target: "body",
        be_compare_prop: "recipientId",
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
        target: "body",
        ...Function_Exception_Detail,
      });
    }

    const storage = body.storage;
    if (storage.key !== "assetType") {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "key",
        to_target: "storage",
        be_compare_prop: "assetType",
        ...Function_Exception_Detail,
      });
    }

    const trustAsset = trustAssetAsset.trustAsset;

    this.verifyTrustAsset(trustAsset);

    if (trustAsset.trustees.includes(body.senderId)) {
      throw new ArgumentIllegalException(SHOULD_NOT_BE, {
        to_compare_prop: "trustee",
        to_target: "trustAsset",
        be_compare_prop: "senderId",
        ...Function_Exception_Detail,
      });
    }

    if (storage.value !== trustAsset.assetType) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: "value",
        be_compare_prop: "assetType",
        to_target: "storage",
        be_target: "trustAsset",
        ...Function_Exception_Detail,
      });
    }

    // if (body.numberOfEffectiveBlocks && trustAsset.numberOfBeginUnfrozenBlocks) {
    //   if (trustAsset.numberOfBeginUnfrozenBlocks >= body.numberOfEffectiveBlocks) {
    //     throw new ArgumentIllegalException(PROP_SHOULD_LT_FIELD, {
    //       prop: "numberOfBeginUnfrozenBlocks",
    //       field: body.numberOfEffectiveBlocks,
    //       ...Function_Exception_Detail,
    //       target: "trustAsset",
    //     });
    //   }
    // }
  }

  verifyTrustAsset(trustAsset: BFChainCore.TrustAssetJSON) {
    const { baseHelper, accountHelper } = this;

    const Function_Exception_Detail = { function: "verifyTransactionBody" } as const;

    if (!trustAsset) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "trustAsset",
        ...Function_Exception_Detail,
      });
    }

    const TrustAssetAsset_Exception_Detail = {
      target: "trustAssetAsset",
      ...Function_Exception_Detail,
    } as const;

    const {
      trustees,
      numberOfSignFor,
      sourceChainName,
      sourceChainMagic,
      // numberOfBeginUnfrozenBlocks,
    } = trustAsset;

    if (!baseHelper.isArray(trustees)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "trustees",
        target: "trustAsset",
        type: "string array",
        ...TrustAssetAsset_Exception_Detail,
      });
    }

    if (trustees.length <= 0) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "trustee",
        ...TrustAssetAsset_Exception_Detail,
      });
    }

    for (const trustee of trustees) {
      if (!accountHelper.isAddress(trustee)) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "trustee",
          type: "account address",
          target: "trustees",
          ...Function_Exception_Detail,
        });
      }
    }

    if (!baseHelper.isPositiveInteger(numberOfSignFor)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "numberOfSignFor",
        type: "positive integer",
        ...TrustAssetAsset_Exception_Detail,
      });
    }

    // max = 发起账户 + 接收账户 + 委托账户数量
    const maxSifnFor = trustees.length + 2;
    if (numberOfSignFor > maxSifnFor) {
      throw new ArgumentIllegalException(PROP_SHOULD_LTE_FIELD, {
        prop: "numberOfSignFor",
        target: "trustAsset",
        field: maxSifnFor,
        ...TrustAssetAsset_Exception_Detail,
      });
    }

    // min = 1
    if (numberOfSignFor < 1) {
      throw new ArgumentIllegalException(PROP_SHOULD_GTE_FIELD, {
        prop: "numberOfSignFor",
        target: "trustAsset",
        field: 1,
        ...TrustAssetAsset_Exception_Detail,
      });
    }

    // if (
    //   numberOfBeginUnfrozenBlocks !== undefined &&
    //   !baseHelper.isNaturalNumber(numberOfBeginUnfrozenBlocks)
    // ) {
    //   throw new ArgumentIllegalException(PROP_IS_INVALID, {
    //     prop: "numberOfBeginUnfrozenBlocks",
    //     type: "positive integer or 0",
    //     ...TrustAssetAsset_Exception_Detail,
    //   });
    // }

    this.checkChainName(sourceChainName, "sourceChainName", TrustAssetAsset_Exception_Detail);

    this.checkChainMagic(sourceChainMagic, "sourceChainMagic", TrustAssetAsset_Exception_Detail);

    this.checkAssetType(trustAsset.assetType, "assetType", TrustAssetAsset_Exception_Detail);

    this.checkAssetAmount(trustAsset.amount, "amount", TrustAssetAsset_Exception_Detail);
  }

  /**
   * 初始化 trustAsset 交易
   *
   * @param body
   * @param trustAssetAsset
   */
  init(body: BFChainCore.TxBodyJSON, trustAssetAsset: BFChainCore.TrustAssetAssetJSON) {
    const transaction = TrustAssetTransaction.fromObject({
      ...body,
      asset: trustAssetAsset,
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
    transaction: TrustAssetTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    const tasks = new TaskList();
    tasks.next = super.applyTransaction(transaction, eventEmitter, config);
    const { amount, assetType, sourceChainMagic } = transaction.asset.trustAsset;
    const assetInfo = this.chainAssetInfoHelper.getAssetInfo(sourceChainMagic, assetType);
    // 冻结发起账户用于交换的资产
    tasks.next = eventEmitter.emit("frozenAsset", {
      type: "frozenAsset",
      transaction,
      applyInfo: {
        address: transaction.senderId,
        publicKeyBuffer: transaction.senderPublicKeyBuffer,
        assetInfo: assetInfo,
        amount: `-${amount}`,
        sourceAmount: amount,
        maxEffectiveHeight: this.transactionHelper.getTransactionMaxEffectiveHeight(transaction),
        minEffectiveHeight: this.transactionHelper.getTransactionMinEffectiveHeight(transaction),
        frozenIdBuffer: transaction.signatureBuffer,
      },
    });
    return tasks.tryToPromise();
  }
}
