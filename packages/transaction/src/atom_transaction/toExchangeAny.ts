import { TransactionFactory } from "./_txbase";
import { ASSET_STATUS, PARENT_ASSET_TYPE, ToExchangeAnyTransaction } from "@bfchain/core-model";
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
  "ToExchangeAnyTransactionFactory",
);

/**
 * toExchangeAny 交易工厂
 *
 */
@Injectable()
export class ToExchangeAnyTransactionFactory extends TransactionFactory<ToExchangeAnyTransaction> {
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
   * @param toExchangeAny
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    toExchangeAnyAsset: BFChainCore.ToExchangeAnyAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, toExchangeAnyAsset, config);

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
      });
    }

    const toExchangeAny = toExchangeAnyAsset.toExchangeAny;

    await this.verifyToExchangeAny(toExchangeAny, config);

    if (toExchangeAny.toExchangeAssetPrealnum === "0") {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_GT_FIELD, {
        prop: "toExchangeAssetPrealnum",
        field: "0",
        target: "toExchangeAny",
      });
    }

    if (body.storage) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_EXIST, {
        prop: "storage",
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 校验 toExchangeAny 内容
   *
   * @param toExchangeAny
   */
  async verifyToExchangeAny(
    toExchangeAny: BFChainCore.ToExchangeAnyJSON,
    config = this.configHelper,
  ) {
    const { baseHelper } = this;

    if (!toExchangeAny) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "toExchangeAny",
      });
    }

    const ToExchangeAnyAsset_Exception_Detail = {
      target: "toExchangeAnyAsset",
    } as const;

    if (!baseHelper.isValidCipherPublicKeys(toExchangeAny.cipherPublicKeys)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "cipherPublicKeys",
        ...ToExchangeAnyAsset_Exception_Detail,
      });
    }

    this.checkChainName(
      toExchangeAny.toExchangeChainName,
      "toExchangeChainName",
      ToExchangeAnyAsset_Exception_Detail,
    );

    this.checkChainName(
      toExchangeAny.beExchangeChainName,
      "beExchangeChainName",
      ToExchangeAnyAsset_Exception_Detail,
    );

    this.checkChainMagic(
      toExchangeAny.toExchangeSource,
      "toExchangeSource",
      ToExchangeAnyAsset_Exception_Detail,
    );

    this.checkChainMagic(
      toExchangeAny.beExchangeSource,
      "beExchangeSource",
      ToExchangeAnyAsset_Exception_Detail,
    );

    const {
      toExchangeParentAssetType,
      toExchangeAssetType,
      beExchangeParentAssetType,
      beExchangeAssetType,
    } = toExchangeAny;

    this.checkParentAssetType(
      toExchangeParentAssetType,
      "toExchangeParentAssetType",
      ToExchangeAnyAsset_Exception_Detail,
    );

    this.checkParentAssetType(
      beExchangeParentAssetType,
      "beExchangeParentAssetType",
      ToExchangeAnyAsset_Exception_Detail,
    );

    this.checkAssetType(
      toExchangeParentAssetType,
      toExchangeAssetType,
      "toExchangeAssetType",
      ToExchangeAnyAsset_Exception_Detail,
    );

    this.checkAssetType(
      beExchangeParentAssetType,
      beExchangeAssetType,
      "beExchangeAssetType",
      ToExchangeAnyAsset_Exception_Detail,
    );

    const {
      toExchangeAssetPrealnum,
      beExchangeAssetPrealnum,
      assetExchangeWeightRatio,
      taxInformation,
    } = toExchangeAny;

    if (!toExchangeAssetPrealnum) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "toExchangeAssetPrealnum",
        ...ToExchangeAnyAsset_Exception_Detail,
      });
    }
    if (!baseHelper.isValidAssetNumber(toExchangeAssetPrealnum)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "toExchangeAssetPrealnum",
        ...ToExchangeAnyAsset_Exception_Detail,
      });
    }

    if (toExchangeParentAssetType === PARENT_ASSET_TYPE.ASSETS) {
      // to 是同质资产
      // be 是同质资产
      if (beExchangeParentAssetType === PARENT_ASSET_TYPE.ASSETS) {
        if (beExchangeAssetPrealnum) {
          throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_EXIST, {
            prop: "beExchangeAssetPrealnum",
            ...ToExchangeAnyAsset_Exception_Detail,
          });
        }
        if (!assetExchangeWeightRatio) {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
            prop: "assetExchangeWeightRatio",
            ...ToExchangeAnyAsset_Exception_Detail,
          });
        }
        if (!baseHelper.isValidAssetExchangeWeightRatio(assetExchangeWeightRatio)) {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
            prop: `assetExchangeWeightRatio ${JSON.stringify(assetExchangeWeightRatio)}`,
            ...ToExchangeAnyAsset_Exception_Detail,
          });
        }
      }
      // be 是非同质资产
      else {
        if (!beExchangeAssetPrealnum) {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
            prop: "beExchangeAssetPrealnum",
            ...ToExchangeAnyAsset_Exception_Detail,
          });
        }
        // 非同质资产数量只能是 1
        if (beExchangeAssetPrealnum !== "1") {
          throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
            to_compare_prop: `beExchangeAssetPrealnum ${beExchangeAssetPrealnum}`,
            to_target: "toExchangeAnyAsset",
            be_compare_prop: "1",
          });
        }
        if (assetExchangeWeightRatio) {
          throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_EXIST, {
            prop: "assetExchangeWeightRatio",
            ...ToExchangeAnyAsset_Exception_Detail,
          });
        }
      }
    } else {
      // to 不是同质资产
      // 非同质资产不可分
      if (toExchangeAssetPrealnum !== "1") {
        throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `toExchangeAssetPrealnum ${toExchangeAssetPrealnum}`,
          to_target: "toExchangeAnyAsset",
          be_compare_prop: "1",
          ...ToExchangeAnyAsset_Exception_Detail,
        });
      }
      if (!beExchangeAssetPrealnum) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
          prop: "beExchangeAssetPrealnum",
          ...ToExchangeAnyAsset_Exception_Detail,
        });
      }
      if (assetExchangeWeightRatio) {
        throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_EXIST, {
          prop: "assetExchangeWeightRatio",
          ...ToExchangeAnyAsset_Exception_Detail,
        });
      }
      if (!baseHelper.isValidAssetNumber(beExchangeAssetPrealnum)) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: "beExchangeAssetPrealnum",
          ...ToExchangeAnyAsset_Exception_Detail,
        });
      }
      // be 不是同质资产
      if (beExchangeParentAssetType !== PARENT_ASSET_TYPE.ASSETS) {
        if (beExchangeAssetPrealnum !== "1") {
          throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
            to_compare_prop: `beExchangeAssetPrealnum ${beExchangeAssetPrealnum}`,
            to_target: "toExchangeAnyAsset",
            be_compare_prop: "1",
          });
        }
        // 没必要自己和自己换
        if (beExchangeAssetType === toExchangeAssetType) {
          throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_BE, {
            to_compare_prop: `beExchangeAssetType ${beExchangeAssetType}`,
            to_target: "toExchangeAny",
            be_compare_prop: toExchangeAssetType,
          });
        }
      }
    }

    // 只有 to 是 entity 时需要携带 taxInformation
    if (toExchangeParentAssetType === PARENT_ASSET_TYPE.ENTITY) {
      await this.checkTaxInformation(ToExchangeAnyAsset_Exception_Detail, taxInformation);
    } else {
      if (taxInformation) {
        throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_EXIST, {
          prop: "taxInformation",
          ...ToExchangeAnyAsset_Exception_Detail,
        });
      }
    }
  }

  /**
   * 初始化 toExchangeAny 交易
   *
   * @param body
   * @param toExchangeAny
   */
  init(body: BFChainCore.TxBodyJSON, toExchangeAny: BFChainCore.ToExchangeAnyAssetJSON) {
    const transaction = ToExchangeAnyTransaction.fromObject({
      ...body,
      asset: toExchangeAny,
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
    transaction: ToExchangeAnyTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);
      const { senderId, senderPublicKeyBuffer, signature } = transaction;
      const {
        toExchangeChainName,
        toExchangeSource,
        toExchangeParentAssetType,
        toExchangeAssetType,
        toExchangeAssetPrealnum,
        taxInformation,
      } = transaction.asset.toExchangeAny;

      if (toExchangeParentAssetType === PARENT_ASSET_TYPE.ASSETS) {
        const toAssetInfo = this.chainAssetInfoHelper.getAssetInfo(
          toExchangeSource,
          toExchangeAssetType,
        );
        // 冻结发起账户用于交换的资产
        taskList.next = eventEmitter.emit("frozenAsset", {
          type: "frozenAsset",
          transaction,
          applyInfo: {
            address: senderId,
            publicKeyBuffer: senderPublicKeyBuffer,
            assetInfo: toAssetInfo,
            amount: `-${toExchangeAssetPrealnum}`,
            sourceAmount: toExchangeAssetPrealnum,
            maxEffectiveHeight:
              this.transactionHelper.getTransactionMaxEffectiveHeight(transaction),
            minEffectiveHeight:
              this.transactionHelper.getTransactionMinEffectiveHeight(transaction),
            frozenId: signature,
          },
        });
      } else if (toExchangeParentAssetType === PARENT_ASSET_TYPE.DAPP) {
        // 冻结 dappid
        taskList.next = eventEmitter.emit("frozenDAppid", {
          type: "frozenDAppid",
          transaction,
          applyInfo: {
            address: senderId,
            sourceChainName: toExchangeChainName,
            sourceChainMagic: toExchangeSource,
            dappid: toExchangeAssetType,
            minEffectiveHeight:
              this.transactionHelper.getTransactionMinEffectiveHeight(transaction),
            maxEffectiveHeight:
              this.transactionHelper.getTransactionMaxEffectiveHeight(transaction),
            status: ASSET_STATUS.FROZEN,
            frozenId: signature,
          },
        });
      } else if (toExchangeParentAssetType === PARENT_ASSET_TYPE.LOCATION_NAME) {
        // 冻结位名
        taskList.next = eventEmitter.emit("frozenLocationName", {
          type: "frozenLocationName",
          transaction,
          applyInfo: {
            address: senderId,
            sourceChainName: toExchangeChainName,
            sourceChainMagic: toExchangeSource,
            name: toExchangeAssetType,
            minEffectiveHeight:
              this.transactionHelper.getTransactionMinEffectiveHeight(transaction),
            maxEffectiveHeight:
              this.transactionHelper.getTransactionMaxEffectiveHeight(transaction),
            status: ASSET_STATUS.FROZEN,
            frozenId: signature,
          },
        });
      } else if (toExchangeParentAssetType === PARENT_ASSET_TYPE.ENTITY) {
        // 冻结 entityId
        taskList.next = eventEmitter.emit("frozenEntity", {
          type: "frozenEntity",
          transaction,
          applyInfo: {
            address: senderId,
            sourceChainName: toExchangeChainName,
            sourceChainMagic: toExchangeSource,
            entityId: toExchangeAssetType,
            minEffectiveHeight:
              this.transactionHelper.getTransactionMinEffectiveHeight(transaction),
            maxEffectiveHeight:
              this.transactionHelper.getTransactionMaxEffectiveHeight(transaction),
            status: ASSET_STATUS.FROZEN,
            frozenId: signature,
          },
        });
        if (taxInformation) {
          // 纳税
          taskList.next = eventEmitter.emit("payTax", {
            type: "payTax",
            transaction,
            applyInfo: {
              sourceChainName: toExchangeChainName,
              sourceChainMagic: toExchangeSource,
              parentAssetType: toExchangeParentAssetType,
              assetType: toExchangeAssetType,
              taxInformation: taxInformation.toJSON(),
            },
          });
          const { taxAssetPrealnum } = taxInformation;
          if (taxAssetPrealnum !== "0") {
            const chainAssetInfo = this.chainAssetInfoHelper.getAssetInfo(
              config.magic,
              config.assetType,
            );
            taskList.next = eventEmitter.emit("frozenAsset", {
              type: "frozenAsset",
              transaction,
              applyInfo: {
                address: senderId,
                publicKeyBuffer: senderPublicKeyBuffer,
                assetInfo: chainAssetInfo,
                amount: `-${taxAssetPrealnum}`,
                sourceAmount: taxAssetPrealnum,
                maxEffectiveHeight:
                  this.transactionHelper.getTransactionMaxEffectiveHeight(transaction),
                minEffectiveHeight:
                  this.transactionHelper.getTransactionMinEffectiveHeight(transaction),
                frozenId: signature,
              },
            });
          }
        }
      } else {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: `toExchangeParentAssetType ${toExchangeParentAssetType}`,
          target: "transaction.asset.toExchangeAny",
        });
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
    transaction: ToExchangeAnyTransaction,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    const { magic, assetType } = argv;
    const { toExchangeSource, toExchangeAssetType, toExchangeAssetPrealnum } =
      transaction.asset.toExchangeAny;
    if (magic === toExchangeSource && assetType === toExchangeAssetType) {
      return toExchangeAssetPrealnum;
    }
    return "0";
  }
}
