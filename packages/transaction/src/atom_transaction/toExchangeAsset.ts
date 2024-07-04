import { TransactionFactory } from "./_txbase";
import { FROZEN_REASON, ToExchangeAssetTransaction } from "@bfchain/core-model";
import {
  AccountBaseHelper,
  TransactionHelper,
  BaseHelper,
  ConfigHelper,
  ChainAssetInfoHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
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
    } as const;

    if (body.recipientId) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_EXIST, {
        prop: "recipientId",
        ...Function_Exception_Detail,
      });
    }

    if (body.fromMagic !== config.magic) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `fromMagic ${body.fromMagic}`,
        to_target: "body",
        be_compare_prop: "local chain magic",
        ...Function_Exception_Detail,
      });
    }

    if (body.toMagic !== config.magic) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `toMagic ${body.toMagic}`,
        to_target: "body",
        be_compare_prop: "local chain magic",
        ...Function_Exception_Detail,
      });
    }

    const toExchangeAsset = toExchangeAssetAsset.toExchangeAsset;

    this.verifyToExchangeAsset(toExchangeAsset, config);

    if (toExchangeAsset.toExchangeNumber === "0") {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_GT_FIELD, {
        prop: "toExchangeNumber",
        field: "0",
        target: "toExchangeAsset",
      });
    }
    const { numberOfEffectiveBlocks } = toExchangeAsset;
    if (numberOfEffectiveBlocks !== undefined) {
      if (this.baseHelper.isPositiveInteger(numberOfEffectiveBlocks) === false) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: `numberOfEffectiveBlocks ${numberOfEffectiveBlocks}`,
          target: "toExchangeAsset",
        });
      }
      if (numberOfEffectiveBlocks + body.applyBlockHeight < body.effectiveBlockHeight) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_GTE_FIELD, {
          prop: `numberOfEffectiveBlocks ${numberOfEffectiveBlocks}`,
          target: "toExchangeAsset",
          field: body.effectiveBlockHeight - body.applyBlockHeight,
        });
      }
    }

    if (body.storage) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_EXIST, {
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

    if (!toExchangeAsset) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "toExchangeAsset",
      });
    }

    const ToExchangeAssetAsset_Exception_Detail = {
      target: "toExchangeAssetAsset",
    } as const;

    const cipherPublicKeys = toExchangeAsset.cipherPublicKeys;
    const cipherPublicKeySet = new Set(cipherPublicKeys);
    if (cipherPublicKeys.length !== cipherPublicKeySet.size) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_DUPLICATE, {
        prop: "cipherPublicKeys",
        ...ToExchangeAssetAsset_Exception_Detail,
      });
    }
    if (!baseHelper.isValidCipherPublicKeys(cipherPublicKeys)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "cipherPublicKeys",
        ...ToExchangeAssetAsset_Exception_Detail,
      });
    }

    if (toExchangeAsset.toExchangeSource === this.configHelper.magic) {
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
    }

    if (toExchangeAsset.beExchangeSource === this.configHelper.magic) {
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
    }

    if (!toExchangeAsset.toExchangeNumber) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "toExchangeNumber",
        ...ToExchangeAssetAsset_Exception_Detail,
      });
    }
    if (!baseHelper.isValidAssetNumber(toExchangeAsset.toExchangeNumber)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "toExchangeNumber",
        type: "asset number",
        ...ToExchangeAssetAsset_Exception_Detail,
      });
    }

    if (toExchangeAsset.toExchangeNumber === "0") {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_GT_FIELD, {
        prop: "toExchangeNumber",
        field: "0",
        ...ToExchangeAssetAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidRate(toExchangeAsset.exchangeRate)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `exchangeRate ${JSON.stringify(toExchangeAsset.exchangeRate)}`,
        type: "rate",
        ...ToExchangeAssetAsset_Exception_Detail,
      });
    }

    if (toExchangeAsset.toExchangeAsset === toExchangeAsset.beExchangeAsset) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_BE, {
        to_compare_prop: `toExchangeAsset ${toExchangeAsset.toExchangeAsset}`,
        to_target: "toExchangeAsset",
        be_compare_prop: toExchangeAsset.beExchangeAsset,
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
      const {
        toExchangeChainName,
        toExchangeSource,
        toExchangeAsset,
        toExchangeNumber,
        numberOfEffectiveBlocks,
      } = transaction.asset.toExchangeAsset;
      let maxEffectiveHeight = this.transactionHelper.getTransactionMaxEffectiveHeight(transaction);
      if (numberOfEffectiveBlocks !== undefined) {
        maxEffectiveHeight = transaction.applyBlockHeight + numberOfEffectiveBlocks;
      }

      const toAssetInfo = this.chainAssetInfoHelper.getAssetInfo(
        toExchangeChainName,
        toExchangeSource,
        toExchangeAsset,
      );
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
          maxEffectiveHeight,
          minEffectiveHeight: this.transactionHelper.getTransactionMinEffectiveHeight(transaction),
          frozenId: transaction.signature,
          frozenReason: FROZEN_REASON.EXCHANGE,
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
