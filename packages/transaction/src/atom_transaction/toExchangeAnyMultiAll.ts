import { TransactionFactory } from "./_txbase";
import {
  ASSET_STATUS,
  PARENT_ASSET_TYPE,
  ToExchangeAnyMultiAllTransaction,
} from "@bfchain/core-model";
import {
  AccountBaseHelper,
  TransactionHelper,
  BaseHelper,
  ConfigHelper,
  ChainAssetInfoHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { Injectable, Inject, wrapTaskList } from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "ToExchangeAnyMultiAllTransactionFactory",
);

/**
 * toExchangeAnyMultiAll 交易工厂
 *
 */
@Injectable()
export class ToExchangeAnyMultiAllTransactionFactory extends TransactionFactory<ToExchangeAnyMultiAllTransaction> {
  constructor(
    @Inject("Buffer")
    public Buffer: BFChainUtil.BufferConstructor,
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
   * @param toExchangeAnyMultiAllAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    toExchangeAnyMultiAllAsset: BFChainCore.ToExchangeAnyMultiAllAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, toExchangeAnyMultiAllAsset, config);

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

    const toExchangeAnyMultiAll = toExchangeAnyMultiAllAsset.toExchangeAnyMultiAll;

    if (!toExchangeAnyMultiAll) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "toExchangeAnyMultiAll",
        ...Function_Exception_Detail,
      });
    }

    if (!this.baseHelper.isValidCipherPublicKeys(toExchangeAnyMultiAll.cipherPublicKeys)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "toExchangeAnyMultiAll.cipherPublicKeys",
        ...Function_Exception_Detail,
      });
    }

    const { toExchangeAssets, beExchangeAssets } = toExchangeAnyMultiAll;
    await this.verifyExchangeAnyMultiAll(
      "toExchangeAnyMultiAll",
      toExchangeAssets,
      beExchangeAssets,
      config,
    );
    for (const { beExchangeParentAssetType, beExchangeAssetPrealnum } of beExchangeAssets) {
      if (beExchangeParentAssetType === PARENT_ASSET_TYPE.ASSETS) {
        if (beExchangeAssetPrealnum === "0") {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_GT_FIELD, {
            prop: "beExchangeAssetPrealnum",
            field: "0",
            target: "toExchangeAnyMultiAll.beExchangeAssets.beExchangeAsset",
          });
        }
      } else {
        if (beExchangeAssetPrealnum !== "1") {
          throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
            to_compare_prop: `beExchangeAssetPrealnum ${beExchangeAssetPrealnum}`,
            to_target: "toExchangeAnyMultiAll.beExchangeAssets.beExchangeAsset",
            be_compare_prop: "1",
          });
        }
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
   * 校验 toExchangeAnyMultiAll 内容
   *
   * @param propName
   * @param toExchangeAssets
   * @param beExchangeAssets
   * @param config
   */
  async verifyExchangeAnyMultiAll(
    propName: string,
    toExchangeAssets: BFChainCore.ToExchangeAssetV2JSON[],
    beExchangeAssets: BFChainCore.BeExchangeAssetV2JSON[],
    config = this.configHelper,
  ) {
    const { baseHelper } = this;

    if (!toExchangeAssets) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: `${propName}.toExchangeAssets`,
      });
    }
    if (!beExchangeAssets) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: `${propName}.beExchangeAssets`,
      });
    }
    if (toExchangeAssets.length <= 0) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_LENGTH_SHOULD_GT_FIELD, {
        prop: "toExchangeAssets",
        target: propName,
        field: 0,
      });
    }
    if (beExchangeAssets.length <= 0) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_LENGTH_SHOULD_GT_FIELD, {
        prop: "beExchangeAssets",
        target: propName,
        field: 0,
      });
    }

    const chainMagic = this.configHelper.magic;

    const toAssetTypeSet = new Set<string>();
    const ToExchangeAssets_Exception_Detail = {
      target: `${propName}.toExchangeAssets.toExchangeAsset`,
    };
    for (const toExchangeAsset of toExchangeAssets) {
      const {
        toExchangeChainName,
        toExchangeSource,
        toExchangeParentAssetType,
        toExchangeAssetType,
        toExchangeAssetPrealnum,
        taxInformation,
      } = toExchangeAsset;
      const key = `${toExchangeSource}-${toExchangeAssetType}`;
      if (toAssetTypeSet.has(key)) {
        throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_DUPLICATE, {
          prop: `toExchangeAssets.toExchangeAsset ${JSON.stringify(toExchangeAsset)}`,
          target: propName,
        });
      }
      toAssetTypeSet.add(key);
      this.checkParentAssetType(
        toExchangeParentAssetType,
        "toExchangeParentAssetType",
        ToExchangeAssets_Exception_Detail,
      );
      if (toExchangeSource === chainMagic) {
        this.checkChainName(
          toExchangeChainName,
          "toExchangeChainName",
          ToExchangeAssets_Exception_Detail,
        );
        this.checkChainMagic(
          toExchangeSource,
          "toExchangeSource",
          ToExchangeAssets_Exception_Detail,
        );
        this.checkAssetType(
          toExchangeParentAssetType,
          toExchangeAssetType,
          "toExchangeAssetType",
          ToExchangeAssets_Exception_Detail,
        );
      }
      if (!toExchangeAssetPrealnum) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
          prop: "toExchangeAssetPrealnum",
          ...ToExchangeAssets_Exception_Detail,
        });
      }
      if (!baseHelper.isValidAssetNumber(toExchangeAssetPrealnum)) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: "toExchangeAssetPrealnum",
          ...ToExchangeAssets_Exception_Detail,
        });
      }
      if (toExchangeParentAssetType === PARENT_ASSET_TYPE.ENTITY) {
        await this.checkTaxInformation(ToExchangeAssets_Exception_Detail, taxInformation);
      } else {
        if (taxInformation) {
          throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_EXIST, {
            prop: "taxInformation",
            ...ToExchangeAssets_Exception_Detail,
          });
        }
      }
      if (toExchangeParentAssetType === PARENT_ASSET_TYPE.ASSETS) {
        if (toExchangeAssetPrealnum === "0") {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_GT_FIELD, {
            prop: "toExchangeAssetPrealnum",
            field: "0",
            target: `${propName}.toExchangeAssets.toExchangeAsset`,
          });
        }
      } else {
        if (toExchangeAssetPrealnum !== "1") {
          throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
            to_compare_prop: `toExchangeAssetPrealnum ${toExchangeAssetPrealnum}`,
            to_target: `${propName}.toExchangeAssets.toExchangeAsset`,
            be_compare_prop: "1",
          });
        }
      }
    }

    const BeExchangeAssets_Exception_Detail = {
      target: `${propName}.beExchangeAssets.beExchangeAsset`,
    };
    const beAssetTypeSet = new Set<string>();
    for (const beExchangeAsset of beExchangeAssets) {
      const {
        beExchangeChainName,
        beExchangeSource,
        beExchangeParentAssetType,
        beExchangeAssetType,
        beExchangeAssetPrealnum,
        taxInformation,
      } = beExchangeAsset;
      const key = `${beExchangeSource}-${beExchangeAssetType}`;
      if (toAssetTypeSet.has(key)) {
        throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_BE, {
          to_compare_prop: `beExchangeAssetType ${beExchangeAssetType}`,
          to_target: "toExchangeAnyMultiAll.beExchangeAssets",
          be_compare_prop: beExchangeAssetType,
        });
      }
      if (beAssetTypeSet.has(key)) {
        throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_DUPLICATE, {
          prop: `beExchangeAssets.beExchangeAsset ${JSON.stringify(beExchangeAsset)}`,
          target: propName,
        });
      }
      beAssetTypeSet.add(key);
      this.checkParentAssetType(
        beExchangeParentAssetType,
        "beExchangeParentAssetType",
        BeExchangeAssets_Exception_Detail,
      );
      if (beExchangeSource === chainMagic) {
        this.checkChainName(
          beExchangeChainName,
          "beExchangeChainName",
          BeExchangeAssets_Exception_Detail,
        );
        this.checkChainMagic(
          beExchangeSource,
          "beExchangeSource",
          BeExchangeAssets_Exception_Detail,
        );
        this.checkAssetType(
          beExchangeParentAssetType,
          beExchangeAssetType,
          "beExchangeAssetType",
          BeExchangeAssets_Exception_Detail,
        );
      }
      if (!beExchangeAssetPrealnum) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
          prop: "beExchangeAssetPrealnum",
          ...BeExchangeAssets_Exception_Detail,
        });
      }
      if (!baseHelper.isValidAssetNumber(beExchangeAssetPrealnum)) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: "beExchangeAssetPrealnum",
          ...BeExchangeAssets_Exception_Detail,
        });
      }
      if (beExchangeParentAssetType === PARENT_ASSET_TYPE.ENTITY) {
        await this.checkTaxInformation(BeExchangeAssets_Exception_Detail, taxInformation);
      } else {
        if (taxInformation) {
          throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_EXIST, {
            prop: "taxInformation",
            target: `${propName}.beExchangeAssets.beExchangeAsset`,
          });
        }
      }
    }
  }

  /**
   * 初始化 toExchangeAnyMultiAll 交易
   *
   * @param body
   * @param toExchangeAnyMultiAll
   */
  init(
    body: BFChainCore.TxBodyJSON,
    toExchangeAnyMultiAll: BFChainCore.ToExchangeAnyMultiAllAssetJSON,
  ) {
    const transaction = ToExchangeAnyMultiAllTransaction.fromObject({
      ...body,
      asset: toExchangeAnyMultiAll,
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
    transaction: ToExchangeAnyMultiAllTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);
      const { senderId, senderPublicKeyBuffer, signature } = transaction;
      const { toExchangeAssets, beExchangeAssets } = transaction.asset.toExchangeAnyMultiAll;

      let frozenAmount = BigInt(0);
      for (const toExchangeAsset of toExchangeAssets) {
        const {
          toExchangeSource,
          toExchangeChainName,
          toExchangeParentAssetType,
          toExchangeAssetType,
          toExchangeAssetPrealnum,
          taxInformation,
        } = toExchangeAsset;

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
              frozenAmount += BigInt(taxInformation.taxAssetPrealnum);
            }
          }
        } else {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
            prop: `toExchangeParentAssetType ${toExchangeParentAssetType}`,
            target: "toExchangeAnyMultiAll.toExchangeAssets.toExchangeAsset",
          });
        }
      }
      if (frozenAmount !== BigInt(0)) {
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
            amount: `-${frozenAmount.toString()}`,
            sourceAmount: frozenAmount.toString(),
            maxEffectiveHeight:
              this.transactionHelper.getTransactionMaxEffectiveHeight(transaction),
            minEffectiveHeight:
              this.transactionHelper.getTransactionMinEffectiveHeight(transaction),
            // 因为 nft 的版税，导致一条交易出现多条冻结记录，但是又不能混合
            // 这里就简单的把冻结 id 搞一些花里胡哨的东西
            // 这个交易本来就比尿还骚，加一些骚东西也是没办法的
            frozenId: signature + this.Buffer.from("_entity").toString("hex"),
          },
        });
      }
      for (const beExchangeAsset of beExchangeAssets) {
        if (beExchangeAsset.taxInformation) {
          // 纳税
          taskList.next = eventEmitter.emit("payTax", {
            type: "payTax",
            transaction,
            applyInfo: {
              sourceChainName: beExchangeAsset.beExchangeChainName,
              sourceChainMagic: beExchangeAsset.beExchangeSource,
              parentAssetType: beExchangeAsset.beExchangeParentAssetType,
              assetType: beExchangeAsset.beExchangeAssetType,
              taxInformation: beExchangeAsset.taxInformation.toJSON(),
            },
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
    transaction: ToExchangeAnyMultiAllTransaction,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    const { magic, assetType } = argv;
    const toExchangeAssets = transaction.asset.toExchangeAnyMultiAll.toExchangeAssets;
    for (const toExchangeAsset of toExchangeAssets) {
      const { toExchangeSource, toExchangeAssetType, toExchangeAssetPrealnum } = toExchangeAsset;
      if (magic === toExchangeSource && assetType === toExchangeAssetType) {
        return toExchangeAssetPrealnum;
      }
    }
    return "0";
  }
}
