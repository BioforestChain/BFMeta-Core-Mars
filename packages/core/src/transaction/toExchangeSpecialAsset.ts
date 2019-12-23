import { TransactionFactory } from "./_txbase";
import {
  CoreExceptionGenerator,
  AccountBaseHelper,
  TransactionHelper,
  BaseHelper,
  ConfigHelper,
  ChainAssetInfoHelper,
} from "@bfchain/core-helper";
import {
  PARAM_LOST,
  PROP_IS_REQUIRE,
  PROP_IS_INVALID,
  NOT_MATCH,
  SHOULD_BE,
  SHOULD_NOT_EXIST,
  SHOULD_NOT_INCLUDE,
} from "../../../helper/src/exception/errorCode";
import {
  ToExchangeSpecialAssetTransaction,
  EXCHANGE_DIRECTION,
  SPECIAL_ASSET_TYPE,
} from "../../model";
import { Injectable, TaskList } from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "ToExchangeSpecialAssetTransactionFactory",
);

/**
 * toExchangeSpecialAsset 交易工厂
 *
 */
@Injectable()
export class ToExchangeSpecialAssetTransactionFactory extends TransactionFactory<
  ToExchangeSpecialAssetTransaction
> {
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
   * 要验证 beExchangeSpecialAsset 交易的基础信息是否合法和 asset 信息是否存在
   * 交易的手续费必须大于 0
   * 不能携带交易的接收账户地址
   * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
   * 交易体的 range 不能包含交易的发起账户地址
   * asset 是完整的 toExchangeSpecialAsset 信息
   * 必须携带合法的密文公钥组，必须是一个数组，可为空，每一项都必须是公钥
   * 必须携带用于交换的资产所属链的网络标识符
   * 必须携带用于交换的资产所属链名
   * 必须携带被交换的资产所属链的网络标识符
   * 必须携带被交换的资产所属链名
   * 必须携带合法的交换的资产类型
   * 必须携带合法的交换的方向
   * 如果是购买特殊资产：如果是购买 dappid，必须携带合法的 dappid；如果是购买 lns，必须携带合法的 lns
   * 如果是出售特殊资产：如果是出售 dappid，必须携带合法的 dappid；如果是出售 lns，必须携带合法的 lns
   * 必须携带合法的 出售得到/用于购买的 资产数量
   * 如果 发起特殊资产交换交易指定开始交换的区块高度间隔，则必须携带这个值
   * 如果交易指定了过期区块间隔 n 和开始解冻区块间隔 m，则 m 必须小于 n
   *
   * @param body
   * @param toExchangeSpecialAssetAsset
   */
  verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    toExchangeSpecialAssetAsset: BFChainCore.ToExchangeSpecialAssetAssetJSON,
    config = this.configHelper,
  ) {
    super.verifyTransactionBody(body, toExchangeSpecialAssetAsset, config);

    const Function_Exception_Detail = {
      target: "body",
      function: "verifyTransactionBody",
    } as const;

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
        be_compare_prop: "local chain magic",
        target: "body",
        ...Function_Exception_Detail,
      });
    }

    if (body.toMagic !== config.magic) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "toMagic",
        to_target: "body",
        be_compare_prop: "local chain magic",
        target: "body",
        ...Function_Exception_Detail,
      });
    }

    if (body.range.includes(body.senderId)) {
      throw new ArgumentIllegalException(SHOULD_NOT_INCLUDE, {
        prop: "range",
        target: "body",
        value: body.senderId,
        ...Function_Exception_Detail,
      });
    }

    const toExchangeSpecialAsset = toExchangeSpecialAssetAsset.toExchangeSpecialAsset;

    this.verifyExchangeSpecialAsset(toExchangeSpecialAsset);

    // if (body.numberOfEffectiveBlocks && toExchangeSpecialAsset.numberOfBeginUnfrozenBlocks) {
    //   if (toExchangeSpecialAsset.numberOfBeginUnfrozenBlocks >= body.numberOfEffectiveBlocks) {
    //     throw new ArgumentIllegalException(PROP_SHOULD_LT_FIELD, {
    //       prop: "numberOfBeginUnfrozenBlocks",
    //       field: body.numberOfEffectiveBlocks,
    //       ...Function_Exception_Detail,
    //       target: "toExchangeSpecialAsset",
    //     });
    //   }
    // }
  }

  verifyExchangeSpecialAsset(toExchangeSpecialAsset: BFChainCore.ToExchangeSpecialAssetJSON) {
    const Function_Exception_Detail = { function: "verifyTransactionBody" } as const;

    if (!toExchangeSpecialAsset) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "toExchangeSpecialAsset",
        ...Function_Exception_Detail,
      });
    }

    const { baseHelper } = this;

    const ToExchangeSpecialAssetAsset_Exception_Detail = {
      target: "toExchangeSpecialAssetAsset",
      ...Function_Exception_Detail,
    } as const;

    if (!baseHelper.isValidCipherPublicKeys(toExchangeSpecialAsset.cipherPublicKeys)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "cipherPublicKeys",
        type: "cipher publicKeys",
        ...ToExchangeSpecialAssetAsset_Exception_Detail,
      });
    }

    const {
      toExchangeSource,
      toExchangeChainName,
      toExchangeAsset,
      beExchangeSource,
      beExchangeChainName,
      beExchangeAsset,
    } = toExchangeSpecialAsset;

    this.checkChainName(
      toExchangeChainName,
      "toExchangeChainName",
      ToExchangeSpecialAssetAsset_Exception_Detail,
    );

    this.checkChainMagic(
      toExchangeSource,
      "toExchangeSource",
      ToExchangeSpecialAssetAsset_Exception_Detail,
    );

    this.checkChainName(
      beExchangeChainName,
      "beExchangeChainName",
      ToExchangeSpecialAssetAsset_Exception_Detail,
    );

    this.checkChainMagic(
      beExchangeSource,
      "beExchangeSource",
      ToExchangeSpecialAssetAsset_Exception_Detail,
    );

    const exchangeAssetType = toExchangeSpecialAsset.exchangeAssetType;

    if (!SPECIAL_ASSET_TYPE[exchangeAssetType]) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: "exchangeAssetType",
        be_compare_prop: "exchangeAssetType",
        to_target: "toExchangeSpecialAsset",
        be_target: "SPECIAL_ASSET_TYPE",
        ...ToExchangeSpecialAssetAsset_Exception_Detail,
      });
    }

    const exchangeDirection = toExchangeSpecialAsset.exchangeDirection;

    if (!EXCHANGE_DIRECTION[exchangeDirection]) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: "exchangeDirection",
        be_compare_prop: "exchangeDirection",
        to_target: "toExchangeSpecialAsset",
        be_target: "EXCHANGE_DIRECTION",
        ...ToExchangeSpecialAssetAsset_Exception_Detail,
      });
    }

    if (exchangeDirection === EXCHANGE_DIRECTION.ASSET_FROM_RECIPIENT) {
      if (exchangeAssetType === SPECIAL_ASSET_TYPE.DAPP_ID) {
        if (!baseHelper.isValidDAppId(beExchangeAsset)) {
          throw new ArgumentIllegalException(PROP_IS_INVALID, {
            prop: "beExchangeAsset",
            ...ToExchangeSpecialAssetAsset_Exception_Detail,
          });
        }
      } else if (exchangeAssetType === SPECIAL_ASSET_TYPE.LOCATION_NAME) {
        if (!baseHelper.isValidLnsName(beExchangeAsset)) {
          throw new ArgumentIllegalException(PROP_IS_INVALID, {
            prop: "beExchangeAsset",
            ...ToExchangeSpecialAssetAsset_Exception_Detail,
          });
        }
      }
      if (!baseHelper.isValidAssetType(toExchangeAsset)) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "toExchangeAsset",
          ...ToExchangeSpecialAssetAsset_Exception_Detail,
        });
      }
    } else {
      if (exchangeAssetType === SPECIAL_ASSET_TYPE.DAPP_ID) {
        if (!baseHelper.isValidDAppId(toExchangeAsset)) {
          throw new ArgumentIllegalException(PROP_IS_INVALID, {
            prop: "toExchangeAsset",
            ...ToExchangeSpecialAssetAsset_Exception_Detail,
          });
        }
      } else if (exchangeAssetType === SPECIAL_ASSET_TYPE.LOCATION_NAME) {
        if (!baseHelper.isValidLnsName(toExchangeAsset)) {
          throw new ArgumentIllegalException(PROP_IS_INVALID, {
            prop: "toExchangeAsset",
            ...ToExchangeSpecialAssetAsset_Exception_Detail,
          });
        }
      }
      if (!baseHelper.isValidAssetType(beExchangeAsset)) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "beExchangeAsset",
          ...ToExchangeSpecialAssetAsset_Exception_Detail,
        });
      }
    }

    if (!toExchangeSpecialAsset.exchangeNumber) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "beExchangeNumber",
        ...ToExchangeSpecialAssetAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidAssetNumber(toExchangeSpecialAsset.exchangeNumber)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "beExchangeNumber",
        type: "asset number",
        ...ToExchangeSpecialAssetAsset_Exception_Detail,
      });
    }

    // if (
    //   toExchangeSpecialAsset.numberOfBeginUnfrozenBlocks !== undefined &&
    //   !baseHelper.isNaturalNumber(toExchangeSpecialAsset.numberOfBeginUnfrozenBlocks)
    // ) {
    //   throw new ArgumentIllegalException(PROP_IS_INVALID, {
    //     prop: "numberOfBeginUnfrozenBlocks",
    //     type: "positive integer or 0",
    //     ...ToExchangeSpecialAssetAsset_Exception_Detail,
    //   });
    // }
  }

  /**
   * 初始化 toExchangeSpecialAsset 交易
   *
   * @param body
   * @param toExchangeSpecialAssetAsset
   */
  init(
    body: BFChainCore.TxBodyJSON,
    toExchangeSpecialAssetAsset: BFChainCore.ToExchangeSpecialAssetAssetJSON,
  ) {
    const transaction = ToExchangeSpecialAssetTransaction.fromObject({
      ...body,
      asset: toExchangeSpecialAssetAsset,
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
    transaction: ToExchangeSpecialAssetTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    const tasks = new TaskList();
    tasks.next = super.applyTransaction(transaction, eventEmitter, config);
    const {
      toExchangeSource,
      toExchangeAsset,
      exchangeNumber,
      exchangeDirection,
      exchangeAssetType,
    } = transaction.asset.toExchangeSpecialAsset;
    // ASSET_FROM_RECIPIENT 特殊资产来自 be 交易的发起账户
    if (exchangeDirection === EXCHANGE_DIRECTION.ASSET_FROM_RECIPIENT) {
      const assetInfo = this.chainAssetInfoHelper.getAssetInfo(toExchangeSource, toExchangeAsset);
      // 冻结发起账户用于交换的资产
      tasks.next = eventEmitter.emit("frozenAsset", {
        type: "frozenAsset",
        transaction,
        applyInfo: {
          address: transaction.senderId,
          publicKeyBuffer: transaction.senderPublicKeyBuffer,
          assetInfo,
          amount: `-${exchangeNumber}`,
          sourceAmount: exchangeNumber,
          maxEffectiveHeight: this.transactionHelper.getTransactionMaxEffectiveHeight(transaction),
          minEffectiveHeight: this.transactionHelper.getTransactionMinEffectiveHeight(transaction),
          frozenIdBuffer: transaction.signatureBuffer,
        },
      });
    } else {
      const senderId = transaction.senderId;
      if (exchangeAssetType === SPECIAL_ASSET_TYPE.DAPP_ID) {
        // 出售 dappid
        tasks.next = eventEmitter.emit("saleDAppid", {
          type: "saleDAppid",
          transaction,
          applyInfo: {
            address: senderId,
            sourceChainMagic: toExchangeSource,
            dappid: toExchangeAsset,
            minEffectiveHeight: this.transactionHelper.getTransactionMinEffectiveHeight(
              transaction,
            ),
            maxEffectiveHeight: this.transactionHelper.getTransactionMaxEffectiveHeight(
              transaction,
            ),
          },
        });
      } else {
        // 出售链域名
        tasks.next = eventEmitter.emit("saleLocationName", {
          type: "saleLocationName",
          transaction,
          applyInfo: {
            address: senderId,
            sourceChainMagic: toExchangeSource,
            name: toExchangeAsset,
            minEffectiveHeight: this.transactionHelper.getTransactionMinEffectiveHeight(
              transaction,
            ),
            maxEffectiveHeight: this.transactionHelper.getTransactionMaxEffectiveHeight(
              transaction,
            ),
          },
        });
      }
    }
    return tasks.tryToPromise();
  }
}
