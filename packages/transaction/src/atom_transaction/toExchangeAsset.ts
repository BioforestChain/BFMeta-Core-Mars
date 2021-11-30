import { TransactionFactory } from "./_txbase";
import { ToExchangeAssetTransaction } from "@bfchain/core-model";
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
  PROP_IS_INVALID,
  SHOULD_BE,
  SHOULD_NOT_EXIST,
  SHOULD_NOT_INCLUDE,
  PROP_IS_REQUIRE,
} from "@bfchain/core-util-exception";
import { Injectable, wrapTaskList } from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "ToExchangeAssetTransactionFactory",
);

/**
 * toExchangeAsset 交易工厂
 *
 */
@Injectable()
export class ToExchangeAssetTransactionFactory extends TransactionFactory<ToExchangeAssetTransaction> {
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
   * 要验证 toExchangeAsset 交易的基础信息是否合法和 asset 信息是否存在
   * 交易的手续费必须大于 0
   * 不能携带交易的接收者账户
   * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
   * 交易体的 range 不能包含交易的发起账户地址
   * asset 是完整的 toExchangeAsset 信息
   * 必须携带合法的密文公钥组，必须是一个数组，可为空，每一项都必须是公钥
   * 必须要携带合法的用于交换的资产的来源链网络标识符
   * 必须要携带合法的被交换的资产的来源链网络标识符
   * 必须要携带合法的用于交换的资产的来源链名
   * 必须要携带合法的被交换的资产的来源链名
   * 必须要携带合法的用于交换的资产名
   * 必须要携带合法的被交换的资产名
   * 必须要携带合法的用于交换的资产数量
   * 必须携带交换比例
   * 如果携带了开始交换高度间隔，这个高度间隔必须是自然数
   * 如果交易指定了过期区块间隔 n 和开始解冻区块间隔 m，则 m 必须小于 n
   *
   * @param body
   * @param toExchangeAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    toExchangeAssetAsset: BFChainCore.ToExchangeAssetAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, toExchangeAssetAsset, config);

    const Function_Exception_Detail = {
      target: "body",
      function: "verifyTransactionBody",
    } as const;

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

    if (body.range.includes(body.senderId)) {
      throw new ArgumentIllegalException(SHOULD_NOT_INCLUDE, {
        prop: "range",
        value: body.senderId,
        ...Function_Exception_Detail,
      });
    }

    const toExchangeAsset = toExchangeAssetAsset.toExchangeAsset;

    this.verifyToExchangeAsset(toExchangeAsset, config);

    if (body.storage) {
      throw new ArgumentIllegalException(SHOULD_NOT_EXIST, {
        prop: "storage",
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 校验 toExchangeAsset 内容
   *
   * @param toExchangeAsset
   */
  verifyToExchangeAsset(
    toExchangeAsset: BFChainCore.ToExchangeAssetJSON,
    config = this.configHelper,
  ) {
    const { baseHelper } = this;
    const Function_Exception_Detail = { function: "verifyTransactionBody" } as const;

    if (!toExchangeAsset) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "toExchangeAsset",
        ...Function_Exception_Detail,
      });
    }

    const ToExchangeAssetAsset_Exception_Detail = {
      target: "toExchangeAssetAsset",
      ...Function_Exception_Detail,
    } as const;

    if (!baseHelper.isValidCipherPublicKeys(toExchangeAsset.cipherPublicKeys)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "cipherPublicKeys",
        type: "cipher publicKeys",
        ...ToExchangeAssetAsset_Exception_Detail,
      });
    }

    this.checkChainName(
      toExchangeAsset.toExchangeChainName,
      "toExchangeChainName",
      ToExchangeAssetAsset_Exception_Detail,
    );

    this.checkChainMagic(
      toExchangeAsset.toExchangeSource,
      "toExchangeSource",
      ToExchangeAssetAsset_Exception_Detail,
    );

    this.checkAsset(
      toExchangeAsset.toExchangeAsset,
      "toExchangeAsset",
      ToExchangeAssetAsset_Exception_Detail,
    );

    this.checkChainName(
      toExchangeAsset.beExchangeChainName,
      "beExchangeChainName",
      ToExchangeAssetAsset_Exception_Detail,
    );

    this.checkChainMagic(
      toExchangeAsset.beExchangeSource,
      "beExchangeSource",
      ToExchangeAssetAsset_Exception_Detail,
    );

    this.checkAsset(
      toExchangeAsset.beExchangeAsset,
      "beExchangeAsset",
      ToExchangeAssetAsset_Exception_Detail,
    );

    if (!toExchangeAsset.toExchangeNumber) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "toExchangeNumber",
        ...ToExchangeAssetAsset_Exception_Detail,
      });
    }
    if (!baseHelper.isValidAssetNumber(toExchangeAsset.toExchangeNumber)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "toExchangeNumber",
        type: "asset number",
        ...ToExchangeAssetAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidRate(toExchangeAsset.exchangeRate)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `exchangeRate ${toExchangeAsset.exchangeRate}`,
        type: "rate",
        ...ToExchangeAssetAsset_Exception_Detail,
      });
    }
  }

  /**
   * 初始化 toExchangeAsset 交易
   *
   * @param body
   * @param toExchangeAsset
   */
  init(body: BFChainCore.TxBodyJSON, toExchangeAsset: BFChainCore.ToExchangeAssetAssetJSON) {
    const transaction = ToExchangeAssetTransaction.fromObject({
      ...body,
      asset: toExchangeAsset,
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
    transaction: ToExchangeAssetTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);
      const { toExchangeSource, toExchangeAsset, toExchangeNumber } =
        transaction.asset.toExchangeAsset;
      const toAssetInfo = this.chainAssetInfoHelper.getAssetInfo(toExchangeSource, toExchangeAsset);
      // 冻结发起账户用于交换的资产
      taskList.next = eventEmitter.emit("frozenAsset", {
        type: "frozenAsset",
        transaction,
        applyInfo: {
          address: transaction.senderId,
          publicKeyBuffer: transaction.senderPublicKeyBuffer,
          assetInfo: toAssetInfo,
          amount: `-${toExchangeNumber}`,
          sourceAmount: toExchangeNumber,
          maxEffectiveHeight: this.transactionHelper.getTransactionMaxEffectiveHeight(transaction),
          minEffectiveHeight: this.transactionHelper.getTransactionMinEffectiveHeight(transaction),
          frozenIdBuffer: transaction.signatureBuffer,
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
    transaction: ToExchangeAssetTransaction,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    const { magic, assetType } = argv;
    const { toExchangeSource, toExchangeAsset, toExchangeNumber } =
      transaction.asset.toExchangeAsset;
    if (magic === toExchangeSource && assetType === toExchangeAsset) {
      return toExchangeNumber;
    }
    return "0";
  }
}
