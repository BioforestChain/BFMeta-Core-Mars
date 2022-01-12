import { TransactionFactory } from "./_txbase";
import {
  AccountBaseHelper,
  TransactionHelper,
  BaseHelper,
  ConfigHelper,
  ChainAssetInfoHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import {
  ToExchangeSpecialAssetTransaction,
  EXCHANGE_DIRECTION,
  SPECIAL_ASSET_TYPE,
  ASSET_STATUS,
} from "@bfchain/core-model";
import { Injectable, wrapTaskList } from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "ToExchangeSpecialAssetTransactionFactory",
);

/**
 * toExchangeSpecialAsset 交易工厂
 *
 */
@Injectable()
export class ToExchangeSpecialAssetTransactionFactory extends TransactionFactory<ToExchangeSpecialAssetTransaction> {
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
   * @param toExchangeSpecialAssetAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    toExchangeSpecialAssetAsset: BFChainCore.ToExchangeSpecialAssetAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, toExchangeSpecialAssetAsset, config);

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

    if (body.range.includes(body.senderId)) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_INCLUDE, {
        prop: "range",
        value: body.senderId,
        ...Function_Exception_Detail,
      });
    }

    const toExchangeSpecialAsset = toExchangeSpecialAssetAsset.toExchangeSpecialAsset;

    this.verifyExchangeSpecialAsset(toExchangeSpecialAsset);

    if (body.storage) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_EXIST, {
        prop: "storage",
        ...Function_Exception_Detail,
      });
    }
  }

  verifyExchangeSpecialAsset(toExchangeSpecialAsset: BFChainCore.ToExchangeSpecialAssetJSON) {
    if (!toExchangeSpecialAsset) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "toExchangeSpecialAsset",
      });
    }

    const { baseHelper } = this;

    const ToExchangeSpecialAssetAsset_Exception_Detail = {
      target: "toExchangeSpecialAssetAsset",
    } as const;

    if (!baseHelper.isValidCipherPublicKeys(toExchangeSpecialAsset.cipherPublicKeys)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
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
    if (
      exchangeAssetType !== SPECIAL_ASSET_TYPE.DAPP_ID &&
      exchangeAssetType !== SPECIAL_ASSET_TYPE.LOCATION_NAME &&
      exchangeAssetType !== SPECIAL_ASSET_TYPE.ENTITY
    ) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: exchangeAssetType,
        ...ToExchangeSpecialAssetAsset_Exception_Detail,
      });
    }

    const exchangeDirection = toExchangeSpecialAsset.exchangeDirection;
    if (
      exchangeDirection !== EXCHANGE_DIRECTION.ASSET_FROM_SENDER &&
      exchangeDirection !== EXCHANGE_DIRECTION.ASSET_FROM_RECIPIENT
    ) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: exchangeDirection,
        ...ToExchangeSpecialAssetAsset_Exception_Detail,
      });
    }

    if (exchangeDirection === EXCHANGE_DIRECTION.ASSET_FROM_RECIPIENT) {
      if (exchangeAssetType === SPECIAL_ASSET_TYPE.DAPP_ID) {
        if (!baseHelper.isValidDAppId(beExchangeAsset)) {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
            prop: `beExchangeAsset ${beExchangeAsset}`,
            ...ToExchangeSpecialAssetAsset_Exception_Detail,
          });
        }
      } else if (exchangeAssetType === SPECIAL_ASSET_TYPE.LOCATION_NAME) {
        if (!baseHelper.isValidLnsName(beExchangeAsset)) {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
            prop: `beExchangeAsset ${beExchangeAsset}`,
            ...ToExchangeSpecialAssetAsset_Exception_Detail,
          });
        }
      } else if (exchangeAssetType === SPECIAL_ASSET_TYPE.ENTITY) {
        if (!baseHelper.isValidEntityId(beExchangeAsset)) {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
            prop: `beExchangeAsset ${beExchangeAsset}`,
            ...ToExchangeSpecialAssetAsset_Exception_Detail,
          });
        }
      }
      if (!baseHelper.isValidAssetType(toExchangeAsset)) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: `toExchangeAsset ${toExchangeAsset}`,
          ...ToExchangeSpecialAssetAsset_Exception_Detail,
        });
      }
    } else {
      if (exchangeAssetType === SPECIAL_ASSET_TYPE.DAPP_ID) {
        if (!baseHelper.isValidDAppId(toExchangeAsset)) {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
            prop: `toExchangeAsset ${toExchangeAsset}`,
            ...ToExchangeSpecialAssetAsset_Exception_Detail,
          });
        }
      } else if (exchangeAssetType === SPECIAL_ASSET_TYPE.LOCATION_NAME) {
        if (!baseHelper.isValidLnsName(toExchangeAsset)) {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
            prop: `toExchangeAsset ${toExchangeAsset}`,
            ...ToExchangeSpecialAssetAsset_Exception_Detail,
          });
        }
      } else if (exchangeAssetType === SPECIAL_ASSET_TYPE.ENTITY) {
        if (!baseHelper.isValidEntityId(toExchangeAsset)) {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
            prop: `toExchangeAsset ${toExchangeAsset}`,
            ...ToExchangeSpecialAssetAsset_Exception_Detail,
          });
        }
      }
      if (!baseHelper.isValidAssetType(beExchangeAsset)) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: `beExchangeAsset ${beExchangeAsset}`,
          ...ToExchangeSpecialAssetAsset_Exception_Detail,
        });
      }
    }

    if (!toExchangeSpecialAsset.exchangeNumber) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "beExchangeNumber",
        ...ToExchangeSpecialAssetAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidAssetNumber(toExchangeSpecialAsset.exchangeNumber)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `beExchangeNumber ${toExchangeSpecialAsset.exchangeNumber}`,
        type: "asset number",
        ...ToExchangeSpecialAssetAsset_Exception_Detail,
      });
    }
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
    return wrapTaskList((taskList) => {
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);
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
        taskList.next = eventEmitter.emit("frozenAsset", {
          type: "frozenAsset",
          transaction,
          applyInfo: {
            address: transaction.senderId,
            publicKeyBuffer: transaction.senderPublicKeyBuffer,
            assetInfo,
            amount: `-${exchangeNumber}`,
            sourceAmount: exchangeNumber,
            maxEffectiveHeight:
              this.transactionHelper.getTransactionMaxEffectiveHeight(transaction),
            minEffectiveHeight:
              this.transactionHelper.getTransactionMinEffectiveHeight(transaction),
            frozenIdBuffer: transaction.signatureBuffer,
          },
        });
      } else {
        const senderId = transaction.senderId;
        if (exchangeAssetType === SPECIAL_ASSET_TYPE.DAPP_ID) {
          // 冻结 dappid
          taskList.next = eventEmitter.emit("frozenDAppid", {
            type: "frozenDAppid",
            transaction,
            applyInfo: {
              address: senderId,
              sourceChainMagic: toExchangeSource,
              dappid: toExchangeAsset,
              minEffectiveHeight:
                this.transactionHelper.getTransactionMinEffectiveHeight(transaction),
              maxEffectiveHeight:
                this.transactionHelper.getTransactionMaxEffectiveHeight(transaction),
              status: ASSET_STATUS.FROZEN,
            },
          });
        } else if (exchangeAssetType === SPECIAL_ASSET_TYPE.LOCATION_NAME) {
          // 冻结位名
          taskList.next = eventEmitter.emit("frozenLocationName", {
            type: "frozenLocationName",
            transaction,
            applyInfo: {
              address: senderId,
              sourceChainMagic: toExchangeSource,
              name: toExchangeAsset,
              minEffectiveHeight:
                this.transactionHelper.getTransactionMinEffectiveHeight(transaction),
              maxEffectiveHeight:
                this.transactionHelper.getTransactionMaxEffectiveHeight(transaction),
              status: ASSET_STATUS.FROZEN,
            },
          });
        } else if (exchangeAssetType === SPECIAL_ASSET_TYPE.ENTITY) {
          // 冻结 entityId
          taskList.next = eventEmitter.emit("frozenEntity", {
            type: "frozenEntity",
            transaction,
            applyInfo: {
              address: senderId,
              sourceChainMagic: toExchangeSource,
              entityId: toExchangeAsset,
              minEffectiveHeight:
                this.transactionHelper.getTransactionMinEffectiveHeight(transaction),
              maxEffectiveHeight:
                this.transactionHelper.getTransactionMaxEffectiveHeight(transaction),
              status: ASSET_STATUS.FROZEN,
            },
          });
        } else {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
            prop: `exchangeAssetType ${exchangeAssetType}`,
            target: "transaction.asset.toExchangeSpecialAssetAsset",
          });
        }
      }
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
    transaction: ToExchangeSpecialAssetTransaction,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    const { magic, assetType } = argv;
    const { toExchangeSource, toExchangeAsset, exchangeDirection, exchangeNumber } =
      transaction.asset.toExchangeSpecialAsset;
    if (
      exchangeDirection === EXCHANGE_DIRECTION.ASSET_FROM_RECIPIENT &&
      magic === toExchangeSource &&
      assetType === toExchangeAsset
    ) {
      return exchangeNumber;
    }
    return "0";
  }
}
