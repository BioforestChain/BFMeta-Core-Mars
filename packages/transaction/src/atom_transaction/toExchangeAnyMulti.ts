import { TransactionFactory } from "./_txbase";
import {
  ASSET_STATUS,
  PARENT_ASSET_TYPE,
  ToExchangeAnyMultiTransaction,
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
  "ToExchangeAnyMultiTransactionFactory",
);

/**
 * toExchangeAnyMulti 交易工厂
 *
 */
@Injectable()
export class ToExchangeAnyMultiTransactionFactory extends TransactionFactory<ToExchangeAnyMultiTransaction> {
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
   * @param toExchangeAny
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    toExchangeAnyMultiAsset: BFChainCore.ToExchangeAnyMultiAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, toExchangeAnyMultiAsset, config);

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

    const toExchangeAnyMulti = toExchangeAnyMultiAsset.toExchangeAnyMulti;

    if (!toExchangeAnyMulti) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "toExchangeAnyMulti",
        ...Function_Exception_Detail,
      });
    }

    if (!this.baseHelper.isValidCipherPublicKeys(toExchangeAnyMulti.cipherPublicKeys)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "toExchangeAnyMulti.cipherPublicKeys",
        ...Function_Exception_Detail,
      });
    }

    const { toExchangeAssets, beExchangeAsset } = toExchangeAnyMulti;
    const isNeedBeExchangeAssetPrealnum = await this.verifyToExchangeAnyMulti(
      "toExchangeAnyMulti",
      toExchangeAssets,
      beExchangeAsset,
      config,
    );

    for (const toExchangeAsset of toExchangeAssets) {
      if (toExchangeAsset.toExchangeAssetPrealnum === "0") {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_GT_FIELD, {
          prop: "toExchangeAssetPrealnum",
          field: "0",
          target: "toExchangeAnyMulti.toExchangeAssets.toExchangeAsset",
        });
      }
    }

    const beExchangeAssetPrealnum = beExchangeAsset.beExchangeAssetPrealnum;

    if (isNeedBeExchangeAssetPrealnum) {
      if (beExchangeAsset.beExchangeParentAssetType !== PARENT_ASSET_TYPE.ASSETS) {
        if (beExchangeAssetPrealnum !== "1") {
          throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
            to_compare_prop: `beExchangeAssetPrealnum ${beExchangeAssetPrealnum}`,
            to_target: "toExchangeAnyMulti.beExchangeAsset",
            be_compare_prop: "1",
          });
        }
      } else {
        if (beExchangeAssetPrealnum === "0") {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_GT_FIELD, {
            prop: `beExchangeAssetPrealnum ${beExchangeAssetPrealnum}`,
            target: "toExchangeAnyMulti.beExchangeAsset",
            field: "0",
          });
        }
      }
    } else {
      if (beExchangeAssetPrealnum) {
        throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_EXIST, {
          prop: "beExchangeAssetPrealnum",
          target: "toExchangeAnyMulti.beExchangeAsset",
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
   * 校验 toExchangeAny 内容
   *
   * @param toExchangeAny
   */
  async verifyToExchangeAnyMulti(
    propName: string,
    toExchangeAssets: BFChainCore.ToExchangeAssetV1JSON[],
    beExchangeAsset: BFChainCore.BeExchangeAssetV1JSON,
    config = this.configHelper,
  ) {
    const { baseHelper } = this;

    if (!toExchangeAssets) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: `${propName}.toExchangeAssets`,
      });
    }
    if (!beExchangeAsset) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: `${propName}.beExchangeAsset`,
      });
    }

    if (toExchangeAssets.length <= 0) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_LENGTH_SHOULD_GT_FIELD, {
        prop: "toExchangeAssets",
        target: propName,
        field: 0,
      });
    }

    const {
      beExchangeChainName,
      beExchangeSource,
      beExchangeParentAssetType,
      beExchangeAssetType,
      beExchangeAssetPrealnum,
    } = beExchangeAsset;

    const BeExchangeAsset_Exception_Detail = { target: `${propName}.beExchangeAsset` };

    this.checkChainName(
      beExchangeChainName,
      "beExchangeChainName",
      BeExchangeAsset_Exception_Detail,
    );
    this.checkChainMagic(beExchangeSource, "beExchangeSource", BeExchangeAsset_Exception_Detail);
    this.checkParentAssetType(
      beExchangeParentAssetType,
      "beExchangeParentAssetType",
      BeExchangeAsset_Exception_Detail,
    );
    this.checkAssetType(
      beExchangeParentAssetType,
      beExchangeAssetType,
      "beExchangeAssetType",
      BeExchangeAsset_Exception_Detail,
    );

    let isNeedBeExchangeAssetPrealnum = false;
    let assetTypeSet = new Set<string>();

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
        assetExchangeWeightRatio,
        taxInformation,
      } = toExchangeAsset;
      if (assetTypeSet.has(toExchangeAssetType)) {
        throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_DUPLICATE, {
          prop: `toExchangeAssets ${JSON.stringify(toExchangeAssets)}`,
          target: propName,
        });
      }
      assetTypeSet.add(toExchangeAssetType);
      this.checkChainName(
        toExchangeChainName,
        "toExchangeChainName",
        ToExchangeAssets_Exception_Detail,
      );
      this.checkChainMagic(toExchangeSource, "toExchangeSource", ToExchangeAssets_Exception_Detail);
      this.checkParentAssetType(
        toExchangeParentAssetType,
        "toExchangeParentAssetType",
        ToExchangeAssets_Exception_Detail,
      );
      this.checkAssetType(
        toExchangeParentAssetType,
        toExchangeAssetType,
        "toExchangeAssetType",
        ToExchangeAssets_Exception_Detail,
      );
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
      if (toExchangeParentAssetType !== PARENT_ASSET_TYPE.ASSETS) {
        isNeedBeExchangeAssetPrealnum = true;
        if (toExchangeAssetPrealnum !== "1") {
          throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
            to_compare_prop: `toExchangeAssetPrealnum ${toExchangeAssetPrealnum}`,
            to_target: "toExchangeAnyMulti.toExchangeAssets",
            be_compare_prop: "1",
          });
        }
        if (assetExchangeWeightRatio) {
          throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_EXIST, {
            prop: "assetExchangeWeightRatio",
            ...ToExchangeAssets_Exception_Detail,
          });
        }
        if (beExchangeParentAssetType !== PARENT_ASSET_TYPE.ASSETS) {
          // 没必要自己和自己换
          if (beExchangeAssetType === toExchangeAssetType) {
            throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_BE, {
              to_compare_prop: `beExchangeAssetType ${beExchangeAssetType}`,
              to_target: "toExchangeAnyMulti.beExchangeAsset",
              be_compare_prop: toExchangeAssetType,
            });
          }
        }
      } else {
        if (beExchangeParentAssetType === PARENT_ASSET_TYPE.ASSETS) {
          if (!assetExchangeWeightRatio) {
            throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
              prop: "assetExchangeWeightRatio",
              ...ToExchangeAssets_Exception_Detail,
            });
          }
          if (!baseHelper.isValidAssetExchangeWeightRatio(assetExchangeWeightRatio)) {
            throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
              prop: `assetExchangeWeightRatio ${assetExchangeWeightRatio}`,
              ...ToExchangeAssets_Exception_Detail,
            });
          }
        } else {
          if (assetExchangeWeightRatio) {
            throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_EXIST, {
              prop: "assetExchangeWeightRatio",
              ...ToExchangeAssets_Exception_Detail,
            });
          }
          // to 是同质资产，be 是非同质资产必须指明希望得到的资产数量
          isNeedBeExchangeAssetPrealnum = true;
        }
      }
    }
    if (isNeedBeExchangeAssetPrealnum) {
      if (!beExchangeAssetPrealnum) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
          prop: "beExchangeAssetPrealnum",
          ...BeExchangeAsset_Exception_Detail,
        });
      }
      if (!baseHelper.isValidAssetNumber(beExchangeAssetPrealnum)) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: "beExchangeAssetPrealnum",
          ...BeExchangeAsset_Exception_Detail,
        });
      }
    }

    if (beExchangeParentAssetType === PARENT_ASSET_TYPE.ENTITY) {
      this.checkTaxInformation(BeExchangeAsset_Exception_Detail, beExchangeAsset.taxInformation);
    } else {
      if (beExchangeAsset.taxInformation) {
        throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_EXIST, {
          prop: "taxInformation",
          target: `${propName}.toExchangeAssets.beExchangeAsset`,
        });
      }
    }

    return isNeedBeExchangeAssetPrealnum;
  }

  /**
   * 初始化 toExchangeAnyMulti 交易
   *
   * @param body
   * @param toExchangeAnyMulti
   */
  init(body: BFChainCore.TxBodyJSON, toExchangeAnyMulti: BFChainCore.ToExchangeAnyMultiAssetJSON) {
    const transaction = ToExchangeAnyMultiTransaction.fromObject({
      ...body,
      asset: toExchangeAnyMulti,
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
    transaction: ToExchangeAnyMultiTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);
      const { senderId, senderPublicKeyBuffer, signature } = transaction;
      const { toExchangeAssets } = transaction.asset.toExchangeAnyMulti;

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
            target: "transaction.asset.toExchangeAnyMulti",
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
    transaction: ToExchangeAnyMultiTransaction,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    const { magic, assetType } = argv;
    const toExchangeAssets = transaction.asset.toExchangeAnyMulti.toExchangeAssets;
    for (const toExchangeAsset of toExchangeAssets) {
      const { toExchangeSource, toExchangeAssetType, toExchangeAssetPrealnum } = toExchangeAsset;
      if (magic === toExchangeSource && assetType === toExchangeAssetType) {
        return toExchangeAssetPrealnum;
      }
    }
    return "0";
  }
}
