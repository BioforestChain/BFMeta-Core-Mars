import { TransactionFactory } from "./_txbase";
import { ASSET_STATUS, BeExchangeAnyTransaction, PARENT_ASSET_TYPE } from "@bfchain/core-model";
import {
  AccountBaseHelper,
  TransactionHelper,
  BaseHelper,
  ConfigHelper,
  JSBIHelper,
  ChainAssetInfoHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { ToExchangeAnyTransactionFactory } from "./toExchangeAny";
import { Injectable, wrapTaskList, parseHexToArrayBuffer } from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "BeExchangeAnyTransactionFactory",
);

/**
 * beExchangeAny 交易工厂
 *
 */
@Injectable()
export class BeExchangeAnyTransactionFactory extends TransactionFactory<BeExchangeAnyTransaction> {
  constructor(
    public accountBaseHelper: AccountBaseHelper,
    public transactionHelper: TransactionHelper,
    public baseHelper: BaseHelper,
    public configHelper: ConfigHelper,
    public chainAssetInfoHelper: ChainAssetInfoHelper,
    public jsbiHelper: JSBIHelper,
    public toExchangeAnyTransactionFactory: ToExchangeAnyTransactionFactory,
  ) {
    super();
  }

  /**
   * 校验输入信息
   *
   * @param body
   * @param beExchangeAnyAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    beExchangeAnyAsset: BFChainCore.BeExchangeAnyAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, beExchangeAnyAsset, config);

    const Function_Exception_Detail = {
      target: "body",
    } as const;

    this.emptyRangeType(body, Function_Exception_Detail);

    const { baseHelper, jsbiHelper } = this;

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

    const beExchangeAny = beExchangeAnyAsset.beExchangeAny;

    if (!beExchangeAny) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "beExchangeAny",
      });
    }

    const BeExchangeAnyAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "beExchangeAny",
    } as const;

    const { transactionSignature } = beExchangeAny;
    if (!transactionSignature) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "transactionSignature",
        ...BeExchangeAnyAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidSignature(transactionSignature)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `transactionSignature ${transactionSignature}`,
        type: "transaction signature",
        ...BeExchangeAnyAsset_Exception_Detail,
      });
    }

    if (storage.value !== transactionSignature) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `storage.value ${storage.value}`,
        be_compare_prop: `transactionSignature ${transactionSignature}`,
        to_target: "storage",
        be_target: "beExchangeAny",
        ...Function_Exception_Detail,
      });
    }

    const { toExchangeAssetPrealnum, beExchangeAssetPrealnum } = beExchangeAny;

    if (!toExchangeAssetPrealnum) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "toExchangeAssetPrealnum",
        ...BeExchangeAnyAsset_Exception_Detail,
      });
    }
    if (!baseHelper.isValidAssetNumber(toExchangeAssetPrealnum)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "toExchangeAssetPrealnum",
        type: "asset prealnum",
        ...BeExchangeAnyAsset_Exception_Detail,
      });
    }

    if (!beExchangeAssetPrealnum) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "beExchangeAssetPrealnum",
        ...BeExchangeAnyAsset_Exception_Detail,
      });
    }
    if (!baseHelper.isValidAssetNumber(beExchangeAssetPrealnum)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "beExchangeAssetPrealnum",
        type: "asset prealnum",
        ...BeExchangeAnyAsset_Exception_Detail,
      });
    }

    const { exchangeAny, ciphertextSignature } = beExchangeAny;

    /**校验`exchangeAny`的基本格式 */
    await this.toExchangeAnyTransactionFactory.verifyToExchangeAny(exchangeAny);
    const { beExchangeParentAssetType, assetExchangeWeightRatio, taxInformation } = exchangeAny;

    // 这里的 to 就是 to 交易发起人给出权益，be 是 be 交易发起人给出的权益
    const bigIntToExchangeAssetPrealnum = BigInt(toExchangeAssetPrealnum);
    if (bigIntToExchangeAssetPrealnum > BigInt(exchangeAny.toExchangeAssetPrealnum)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_LTE_FIELD, {
        prop: `toExchangeAssetPrealnum ${toExchangeAssetPrealnum}`,
        field: exchangeAny.toExchangeAssetPrealnum,
        ...BeExchangeAnyAsset_Exception_Detail,
      });
    }
    // 非同质资产需要携带流通版税
    if (beExchangeParentAssetType === PARENT_ASSET_TYPE.ENTITY) {
      await this.checkTaxInformation(
        BeExchangeAnyAsset_Exception_Detail,
        beExchangeAny.taxInformation,
      );
    } else {
      if (beExchangeAny.taxInformation) {
        throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_EXIST, {
          prop: "taxInformation",
          ...BeExchangeAnyAsset_Exception_Detail,
        });
      }
    }
    if (body.senderId === recipientId) {
      // 主动解冻
      if (exchangeAny.toExchangeParentAssetType === PARENT_ASSET_TYPE.ASSETS) {
        // 可数资产自己赎回也要大于 0 份
        if (bigIntToExchangeAssetPrealnum < BigInt(1)) {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_GT_FIELD, {
            prop: `toExchangeAssetPrealnum ${toExchangeAssetPrealnum}`,
            field: "0",
            ...BeExchangeAnyAsset_Exception_Detail,
          });
        }
      } else {
        // 不可数资产只有 1 份
        if (toExchangeAssetPrealnum !== "1") {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_EQ_FIELD, {
            prop: `toExchangeAssetPrealnum ${toExchangeAssetPrealnum}`,
            field: "1",
            ...BeExchangeAnyAsset_Exception_Detail,
          });
        }
      }
      if (beExchangeAssetPrealnum !== "0") {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_EQ_FIELD, {
          prop: `beExchangeAssetPrealnum ${beExchangeAssetPrealnum}`,
          field: "0",
          ...BeExchangeAnyAsset_Exception_Detail,
        });
      }
    } else {
      // 被动解冻
      if (toExchangeAssetPrealnum === "0" && beExchangeAssetPrealnum === "0") {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_GT_FIELD, {
          prop: `beExchangeAssetPrealnum ${beExchangeAssetPrealnum}`,
          field: "0",
          ...BeExchangeAnyAsset_Exception_Detail,
        });
      }
      if (assetExchangeWeightRatio) {
        // 按比例计算验证是否满足最少需要付的钱，允许多付钱
        // 这里是用 to 算 be，所以是 to / 兑换比例，即 to * 兑换比例的倒数
        const minBeExchangePrealnum_BI = jsbiHelper.multiplyRoundFraction(toExchangeAssetPrealnum, {
          numerator: assetExchangeWeightRatio.beExchangeAssetWeight,
          denominator: assetExchangeWeightRatio.toExchangeAssetWeight,
        });
        if (minBeExchangePrealnum_BI > BigInt(beExchangeAssetPrealnum)) {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_GTE_FIELD, {
            prop: `beExchangeAssetPrealnum ${beExchangeAssetPrealnum}`,
            field: minBeExchangePrealnum_BI.toString(),
            ...BeExchangeAnyAsset_Exception_Detail,
          });
        }
      } else {
        // 允许多付钱
        if (beExchangeParentAssetType === PARENT_ASSET_TYPE.ASSETS) {
          // 这里的 to 就是 to 交易发起人给出权益，be 是 be 交易发起人给出的权益
          if (BigInt(beExchangeAssetPrealnum) < BigInt(exchangeAny.beExchangeAssetPrealnum)) {
            throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_LTE_FIELD, {
              prop: `beExchangeAssetPrealnum ${beExchangeAssetPrealnum}`,
              field: exchangeAny.beExchangeAssetPrealnum,
              ...BeExchangeAnyAsset_Exception_Detail,
            });
          }
        } else {
          if (beExchangeAssetPrealnum !== "1") {
            throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_EQ_FIELD, {
              prop: `beExchangeAssetPrealnum ${beExchangeAssetPrealnum}`,
              field: "1",
              ...BeExchangeAnyAsset_Exception_Detail,
            });
          }
        }
      }
    }

    const { cipherPublicKeys } = exchangeAny;
    /**如果是公钥模式，那么必须存在密文 */
    if (cipherPublicKeys.length > 0) {
      if (!ciphertextSignature) {
        throw new ArgumentIllegalException(ERROR_LIST.NOT_EXIST, {
          prop: `ciphertextSignature ${ciphertextSignature}`,
          ...BeExchangeAnyAsset_Exception_Detail,
        });
      }

      if (!baseHelper.isValidAccountSignature(ciphertextSignature)) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: `ciphertextSignature ${ciphertextSignature}`,
          ...BeExchangeAnyAsset_Exception_Detail,
        });
      }

      const { signature, publicKey } = ciphertextSignature;

      if (!cipherPublicKeys.includes(publicKey)) {
        throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `publicKey ${publicKey}`,
          be_compare_prop: "cipherPublicKeys",
          to_target: "ciphertextSignature",
          be_target: "cipherPublicKeys",
          ...BeExchangeAnyAsset_Exception_Detail,
        });
      }

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
          ...BeExchangeAnyAsset_Exception_Detail,
        });
      }
    } else {
      if (ciphertextSignature) {
        throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_EXIST, {
          prop: `ciphertextSignature ${ciphertextSignature}`,
          ...BeExchangeAnyAsset_Exception_Detail,
        });
      }
    }
  }

  /**
   * 初始化 beExchangeAny 交易
   *
   * @param body
   * @param beExchangeAny
   */
  init(body: BFChainCore.TxBodyJSON, beExchangeAny: BFChainCore.BeExchangeAnyAssetJSON) {
    const transaction = BeExchangeAnyTransaction.fromObject({
      ...body,
      asset: beExchangeAny,
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
    transaction: BeExchangeAnyTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);
      const { senderId, recipientId, senderPublicKeyBuffer } = transaction;
      const {
        exchangeAny,
        toExchangeAssetPrealnum,
        beExchangeAssetPrealnum,
        taxInformation,
        transactionSignature,
      } = transaction.asset.beExchangeAny;
      const {
        toExchangeChainName,
        toExchangeSource,
        toExchangeParentAssetType,
        toExchangeAssetType,
        beExchangeChainName,
        beExchangeSource,
        beExchangeParentAssetType,
        beExchangeAssetType,
      } = exchangeAny;

      if (toExchangeParentAssetType === PARENT_ASSET_TYPE.ASSETS) {
        // 发起交易冻结了同质资产
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
          if (
            // 非同质资产流通
            toExchangeAssetPrealnum === "1" &&
            exchangeAny.taxInformation &&
            exchangeAny.taxInformation.taxAssetPrealnum !== "0"
          ) {
            const chainAssetInfo = this.chainAssetInfoHelper.getAssetInfo(
              config.magic,
              config.assetType,
            );
            const { taxCollector, taxAssetPrealnum } = exchangeAny.taxInformation;
            taskList.next = eventEmitter.emit("unfrozenAsset", {
              type: "unfrozenAsset",
              transaction,
              applyInfo: {
                address: taxCollector,
                publicKeyBuffer: senderPublicKeyBuffer,
                assetInfo: chainAssetInfo,
                amount: taxAssetPrealnum,
                sourceAmount: taxAssetPrealnum,
                frozenId: transactionSignature,
                recipientId, // 资产冻结账户
              },
            });
          }
        } else {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
            prop: `toExchangeParentAssetType ${toExchangeParentAssetType}`,
            target: "transaction.asset.beExchangeAny.exchangeAny",
          });
        }
      }

      if (beExchangeParentAssetType === PARENT_ASSET_TYPE.ENTITY && taxInformation) {
        // 纳税
        taskList.next = eventEmitter.emit("payTax", {
          type: "payTax",
          transaction,
          applyInfo: {
            sourceChainName: beExchangeChainName,
            sourceChainMagic: beExchangeSource,
            parentAssetType: beExchangeParentAssetType,
            assetType: beExchangeAssetType,
            taxInformation: taxInformation.toJSON(),
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
        taskList.next = eventEmitter.emit("asset", {
          type: "asset",
          transaction,
          applyInfo: {
            address: senderId,
            publicKeyBuffer: senderPublicKeyBuffer,
            assetInfo: beAssetInfo,
            amount: `-${beExchangeAssetPrealnum}`,
            sourceAmount: beExchangeAssetPrealnum,
          },
        });

        // 累加接收账户交换得到的资产
        taskList.next = eventEmitter.emit("asset", {
          type: "asset",
          transaction,
          applyInfo: {
            address: recipientId,
            assetInfo: beAssetInfo,
            amount: beExchangeAssetPrealnum,
            sourceAmount: beExchangeAssetPrealnum,
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
          target: "transaction.asset.beExchangeAny.exchangeAny",
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
    transaction: BeExchangeAnyTransaction,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    const { magic, assetType } = argv;
    const { exchangeAny, toExchangeAssetPrealnum, beExchangeAssetPrealnum } =
      transaction.asset.beExchangeAny;
    const { toExchangeSource, beExchangeSource, toExchangeAssetType, beExchangeAssetType } =
      exchangeAny;
    if (magic === toExchangeSource && assetType === toExchangeAssetType) {
      return toExchangeAssetPrealnum;
    }
    if (magic === beExchangeSource && assetType === beExchangeAssetType) {
      return beExchangeAssetPrealnum;
    }
    return "0";
  }
}
