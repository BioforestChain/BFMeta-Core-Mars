import { TransactionFactory } from "./_txbase";
import {
  ASSET_STATUS,
  BeExchangeAnyMultiTransaction,
  PARENT_ASSET_TYPE,
} from "@bfchain/core-model";
import {
  AccountBaseHelper,
  TransactionHelper,
  BaseHelper,
  ConfigHelper,
  ChainAssetInfoHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import {
  Injectable,
  Inject,
  wrapTaskList,
  getHexFromArrayBuffer,
  parseHexToArrayBuffer,
} from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "BeExchangeAnyMultiTransactionFactory",
);

/**
 * beExchangeAnyMulti 交易工厂
 *
 */
@Injectable()
export class BeExchangeAnyMultiTransactionFactory extends TransactionFactory<BeExchangeAnyMultiTransaction> {
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
      if (toExchangeParentAssetType !== PARENT_ASSET_TYPE.ASSETS) {
        isNeedBeExchangeAssetPrealnum = true;
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
        if (toExchangeParentAssetType === PARENT_ASSET_TYPE.ENTITY) {
          await this.checkTaxInformation(ToExchangeAssets_Exception_Detail, taxInformation);
        }
      } else {
        if (taxInformation) {
          throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_EXIST, {
            prop: "taxInformation",
            ...ToExchangeAssets_Exception_Detail,
          });
        }
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
    }

    return isNeedBeExchangeAssetPrealnum;
  }

  /**
   * 校验输入信息
   *
   * @param body
   * @param beExchangeAnyMultiAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    beExchangeAnyMultiAsset: BFChainCore.BeExchangeAnyMultiAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, beExchangeAnyMultiAsset, config);

    const Function_Exception_Detail = {
      target: "body",
    } as const;

    this.emptyRangeType(body, Function_Exception_Detail);

    const { baseHelper } = this;

    const recipientId = body.recipientId;

    if (!recipientId) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
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

    if (!body.storage) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "storage",
        ...Function_Exception_Detail,
      });
    }

    const storage = body.storage;
    if (storage.key !== "transactionSignature") {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `storage.key ${storage.key}`,
        to_target: "storage",
        be_compare_prop: "transactionSignature",
        ...Function_Exception_Detail,
      });
    }

    const beExchangeAnyMulti = beExchangeAnyMultiAsset.beExchangeAnyMulti;

    if (!beExchangeAnyMulti) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "beExchangeAnyMulti",
      });
    }

    const BeExchangeAnyMultiAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "beExchangeAnyMulti",
    } as const;

    const { transactionSignature } = beExchangeAnyMulti;
    if (!transactionSignature) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "transactionSignature",
        ...BeExchangeAnyMultiAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidSignature(transactionSignature)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `transactionSignature ${transactionSignature}`,
        type: "transaction signature",
        ...BeExchangeAnyMultiAsset_Exception_Detail,
      });
    }

    if (storage.value !== transactionSignature) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `storage.value ${storage.value}`,
        be_compare_prop: `transactionSignature ${transactionSignature}`,
        to_target: "storage",
        be_target: "beExchangeAnyMulti",
        ...Function_Exception_Detail,
      });
    }

    const { toExchangeAssets, beExchangeAsset, ciphertextSignature } = beExchangeAnyMulti;

    /**校验`beExchangeAnyMulti`的基本格式 */
    await this.verifyToExchangeAnyMulti(
      "beExchangeAnyMulti",
      toExchangeAssets,
      beExchangeAsset,
      config,
    );

    const { beExchangeParentAssetType, beExchangeAssetPrealnum, taxInformation } = beExchangeAsset;

    if (!beExchangeAssetPrealnum) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "beExchangeAsset.beExchangeAssetPrealnum",
        ...BeExchangeAnyMultiAsset_Exception_Detail,
      });
    }

    // 非同质资产需要携带流通版税
    if (beExchangeParentAssetType === PARENT_ASSET_TYPE.ENTITY) {
      await this.checkTaxInformation(BeExchangeAnyMultiAsset_Exception_Detail, taxInformation);
    } else {
      if (beExchangeAsset.taxInformation) {
        throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_EXIST, {
          prop: "beExchangeAsset.taxInformation",
          ...BeExchangeAnyMultiAsset_Exception_Detail,
        });
      }
    }

    /**如果是公钥模式，那么必须存在密文 */
    if (ciphertextSignature) {
      if (!baseHelper.isValidAccountSignature(ciphertextSignature)) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: `ciphertextSignature ${ciphertextSignature}`,
          ...BeExchangeAnyMultiAsset_Exception_Detail,
        });
      }
      const { signature, publicKey } = ciphertextSignature;
      /// 对密文进行解码校验
      if (
        !(await this.transactionHelper.verifyCiphertextSignature({
          secretPublicKey: parseHexToArrayBuffer(publicKey),
          ciphertextSignatureBuffer: parseHexToArrayBuffer(signature),
          transactionSignatureBuffer: parseHexToArrayBuffer(transactionSignature),
          senderId: body.senderId,
        }))
      ) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: `ciphertextSignature ${signature}`,
          type: "signature",
          ...BeExchangeAnyMultiAsset_Exception_Detail,
        });
      }
    }
  }

  /**
   * 初始化 beExchangeAnyMulti 交易
   *
   * @param body
   * @param beExchangeAnyMulti
   */
  init(body: BFChainCore.TxBodyJSON, beExchangeAnyMulti: BFChainCore.BeExchangeAnyMultiAssetJSON) {
    const transaction = BeExchangeAnyMultiTransaction.fromObject({
      ...body,
      asset: beExchangeAnyMulti,
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
    transaction: BeExchangeAnyMultiTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);
      const { senderId, recipientId, senderPublicKeyBuffer } = transaction;
      const { toExchangeAssets, beExchangeAsset, transactionSignature } =
        transaction.asset.beExchangeAnyMulti;

      const {
        beExchangeChainName,
        beExchangeSource,
        beExchangeParentAssetType,
        beExchangeAssetType,
        beExchangeAssetPrealnum,
      } = beExchangeAsset;

      /**支付同质资产的次数 */
      let paidTimes = 0;
      for (const toExchangeAsset of toExchangeAssets) {
        const {
          toExchangeSource,
          toExchangeChainName,
          toExchangeParentAssetType,
          toExchangeAssetType,
          toExchangeAssetPrealnum,
          taxInformation,
        } = toExchangeAsset;

        // 发起交易冻结了同质资产
        if (toExchangeParentAssetType === PARENT_ASSET_TYPE.ASSETS) {
          // 发起账户将得到的资产解冻并收入账下
          const toAssetInfo = this.chainAssetInfoHelper.getAssetInfo(
            toExchangeSource,
            toExchangeAssetType,
          );
          taskList.next = eventEmitter.emit("unfrozenAsset", {
            type: "unfrozenAsset",
            transaction,
            applyInfo: {
              address: senderId,
              publicKeyBuffer: senderPublicKeyBuffer,
              assetInfo: toAssetInfo,
              amount: toExchangeAssetPrealnum,
              sourceAmount: toExchangeAssetPrealnum,
              frozenId: transactionSignature,
              recipientId, // 资产冻结账户
            },
          });
          paidTimes++;
        } else {
          // 发起交易冻结的不是同质资产
          // 发起账户成为不可数资产的拥有者
          let possessorAddress = senderId;
          if (toExchangeAssetPrealnum === "0") {
            // 白给，不可数资产的拥有者没有变化，只需要解冻
            possessorAddress = recipientId;
          }
          if (toExchangeParentAssetType === PARENT_ASSET_TYPE.DAPP) {
            taskList.next = eventEmitter.emit("unfrozenDAppid", {
              type: "unfrozenDAppid",
              transaction,
              applyInfo: {
                address: senderId,
                publicKeyBuffer: senderPublicKeyBuffer,
                possessorAddress,
                sourceChainName: toExchangeChainName,
                sourceChainMagic: toExchangeSource,
                dappid: toExchangeAssetType,
                status: ASSET_STATUS.NORMAL,
                frozenId: transactionSignature,
              },
            });
            paidTimes++;
          } else if (toExchangeParentAssetType === PARENT_ASSET_TYPE.LOCATION_NAME) {
            taskList.next = eventEmitter.emit("unfrozenLocationName", {
              type: "unfrozenLocationName",
              transaction,
              applyInfo: {
                address: senderId,
                publicKeyBuffer: senderPublicKeyBuffer,
                possessorAddress,
                sourceChainName: toExchangeChainName,
                sourceChainMagic: toExchangeSource,
                name: toExchangeAssetType,
                status: ASSET_STATUS.NORMAL,
                frozenId: transactionSignature,
              },
            });
            paidTimes++;
          } else if (toExchangeParentAssetType === PARENT_ASSET_TYPE.ENTITY) {
            taskList.next = eventEmitter.emit("unfrozenEntity", {
              type: "unfrozenEntity",
              transaction,
              applyInfo: {
                address: senderId,
                publicKeyBuffer: senderPublicKeyBuffer,
                possessorAddress,
                sourceChainName: toExchangeChainName,
                sourceChainMagic: toExchangeSource,
                entityId: toExchangeAssetType,
                status: ASSET_STATUS.NORMAL,
                frozenId: transactionSignature,
              },
            });
            paidTimes++;
            if (
              // 非同质资产流通
              toExchangeAssetPrealnum !== "0" &&
              taxInformation &&
              taxInformation.taxAssetPrealnum !== "0"
            ) {
              const chainAssetInfo = this.chainAssetInfoHelper.getAssetInfo(
                config.magic,
                config.assetType,
              );
              const { taxCollector, taxAssetPrealnum } = taxInformation;
              taskList.next = eventEmitter.emit("unfrozenAsset", {
                type: "unfrozenAsset",
                transaction,
                applyInfo: {
                  address: taxCollector,
                  assetInfo: chainAssetInfo,
                  amount: taxAssetPrealnum,
                  sourceAmount: taxAssetPrealnum,
                  // 因为 nft 的版税，导致一条交易出现多条冻结记录，但是又不能混合
                  // 这里就简单的把冻结 id 搞一些花里胡哨的东西
                  // 这个交易本来就比尿还骚，加一些骚东西也是没办法的
                  frozenId: transactionSignature + this.Buffer.from("_entity").toString("hex"),
                  recipientId, // 资产冻结账户
                },
              });
            }
          } else {
            throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
              prop: `toExchangeParentAssetType ${toExchangeParentAssetType}`,
              target: "transaction.asset.beExchangeAnyMulti.toExchangeAsset",
            });
          }
        }
      }

      if (
        beExchangeParentAssetType === PARENT_ASSET_TYPE.ENTITY &&
        beExchangeAsset.taxInformation
      ) {
        // 纳税
        taskList.next = eventEmitter.emit("payTax", {
          type: "payTax",
          transaction,
          applyInfo: {
            sourceChainName: beExchangeChainName,
            sourceChainMagic: beExchangeSource,
            parentAssetType: beExchangeParentAssetType,
            assetType: beExchangeAssetType,
            taxInformation: beExchangeAsset.taxInformation.toJSON(),
          },
        });
      }

      // 主动解冻
      if (beExchangeAssetPrealnum === "0") {
        return;
      }

      // 被动解冻
      // 被交换的是同质资产
      if (beExchangeParentAssetType === PARENT_ASSET_TYPE.ASSETS) {
        // 扣除发起账户用于交换资产
        const beAssetInfo = this.chainAssetInfoHelper.getAssetInfo(
          beExchangeSource,
          beExchangeAssetType,
        );
        const amount = (BigInt(beExchangeAssetPrealnum as string) * BigInt(paidTimes)).toString();
        taskList.next = eventEmitter.emit("asset", {
          type: "asset",
          transaction,
          applyInfo: {
            address: senderId,
            publicKeyBuffer: senderPublicKeyBuffer,
            assetInfo: beAssetInfo,
            amount: `-${amount}`,
            sourceAmount: amount,
          },
        });

        // 累加接收账户交换得到的资产
        taskList.next = eventEmitter.emit("asset", {
          type: "asset",
          transaction,
          applyInfo: {
            address: recipientId,
            assetInfo: beAssetInfo,
            amount,
            sourceAmount: amount,
          },
        });
      }
      // 被交换的是非质资产
      // 接收账户成为 dappid 的拥有者
      else if (beExchangeParentAssetType === PARENT_ASSET_TYPE.DAPP) {
        taskList.next = eventEmitter.emit("changeDAppidPossessor", {
          type: "changeDAppidPossessor",
          transaction,
          applyInfo: {
            address: senderId,
            publicKeyBuffer: senderPublicKeyBuffer,
            possessorAddress: recipientId,
            sourceChainName: beExchangeChainName,
            sourceChainMagic: beExchangeSource,
            dappid: beExchangeAssetType,
          },
        });
      }
      // 接收账户成为位名的拥有者
      else if (beExchangeParentAssetType === PARENT_ASSET_TYPE.LOCATION_NAME) {
        taskList.next = eventEmitter.emit("changeLocationNamePossessor", {
          type: "changeLocationNamePossessor",
          transaction,
          applyInfo: {
            address: senderId,
            publicKeyBuffer: senderPublicKeyBuffer,
            possessorAddress: recipientId,
            sourceChainName: beExchangeChainName,
            sourceChainMagic: beExchangeSource,
            name: beExchangeAssetType,
          },
        });
      }
      // 接收账户成为 entityId 的拥有者
      else if (beExchangeParentAssetType === PARENT_ASSET_TYPE.ENTITY) {
        taskList.next = eventEmitter.emit("changeEntityPossessor", {
          type: "changeEntityPossessor",
          transaction,
          applyInfo: {
            address: senderId,
            publicKeyBuffer: senderPublicKeyBuffer,
            possessorAddress: recipientId,
            sourceChainName: beExchangeChainName,
            sourceChainMagic: beExchangeSource,
            entityId: beExchangeAssetType,
          },
        });
        const taxInformation = beExchangeAsset.taxInformation;
        if (taxInformation) {
          if (taxInformation.taxAssetPrealnum !== "0") {
            const chainAssetInfo = this.chainAssetInfoHelper.getAssetInfo(
              config.magic,
              config.assetType,
            );
            taskList.next = this._applyTransactionEmitAsset(
              eventEmitter,
              transaction,
              taxInformation.taxAssetPrealnum,
              {
                senderId,
                senderPublicKeyBuffer,
                recipientId: taxInformation.taxCollector,
                assetInfo: chainAssetInfo,
              },
            );
          }
        }
      } else {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: `beExchangeParentAssetType ${beExchangeParentAssetType}`,
          target: "transaction.asset.beExchangeAnyMulti.beExchangeAsset",
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
    transaction: BeExchangeAnyMultiTransaction,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    const { magic, assetType } = argv;
    const { toExchangeAssets, beExchangeAsset } = transaction.asset.beExchangeAnyMulti;
    for (const toExchangeAsset of toExchangeAssets) {
      const { toExchangeSource, toExchangeAssetType, toExchangeAssetPrealnum } = toExchangeAsset;
      if (magic === toExchangeSource && assetType === toExchangeAssetType) {
        return toExchangeAssetPrealnum;
      }
    }
    if (
      magic === beExchangeAsset.beExchangeSource &&
      assetType === beExchangeAsset.beExchangeAssetType
    ) {
      return beExchangeAsset.beExchangeAssetPrealnum as string;
    }
    return "0";
  }
}
