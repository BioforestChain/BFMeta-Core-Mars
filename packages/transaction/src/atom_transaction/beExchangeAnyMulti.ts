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
  JSBIHelper,
  ChainAssetInfoHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { ToExchangeAnyMultiTransactionFactory } from "./toExchangeAnyMulti";
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
    public jsbiHelper: JSBIHelper,
    public toExchangeAnyMultiTransactionFactory: ToExchangeAnyMultiTransactionFactory,
  ) {
    super();
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
    await this.toExchangeAnyMultiTransactionFactory.verifyToExchangeAnyMulti(
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

    if (
      beExchangeParentAssetType !== PARENT_ASSET_TYPE.ASSETS &&
      body.senderId !== body.recipientId
    ) {
      if (beExchangeAssetPrealnum !== "1") {
        throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `beExchangeAssetPrealnum ${beExchangeAssetPrealnum}`,
          to_target: "beExchangeAnyMulti.beExchangeAsset",
          be_compare_prop: "1",
        });
      }
    }

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

    const beapn = BigInt(beExchangeAssetPrealnum);
    for (const toExchangeAsset of toExchangeAssets) {
      const { toExchangeParentAssetType, toExchangeAssetPrealnum, assetExchangeWeightRatio } =
        toExchangeAsset;
      if (toExchangeParentAssetType === PARENT_ASSET_TYPE.ASSETS) {
        // 这里的 to 就是 to 交易发起人给出权益，be 是 be 交易发起人给出的权益
        if (BigInt(toExchangeAssetPrealnum) > BigInt(toExchangeAssetPrealnum)) {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_LTE_FIELD, {
            prop: `toExchangeAssetPrealnum ${toExchangeAssetPrealnum}`,
            field: toExchangeAssetPrealnum,
            ...BeExchangeAnyMultiAsset_Exception_Detail,
          });
        }
        // 主动解冻
        if (body.senderId === recipientId) {
          if (beExchangeAssetPrealnum !== "0") {
            throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_EQ_FIELD, {
              prop: `beExchangeAssetPrealnum ${beExchangeAssetPrealnum}`,
              field: "0",
              ...BeExchangeAnyMultiAsset_Exception_Detail,
            });
          }
        }
        // 被动解冻
        else {
          if (assetExchangeWeightRatio) {
            // 按比例计算验证是否满足最少需要付的钱，允许多付钱
            // 这里是用 to 算 be，所以是 to / 兑换比例，即 to * 兑换比例的倒数
            const minBeExchangePrealnum_BI = jsbiHelper.multiplyRoundFraction(
              toExchangeAssetPrealnum,
              {
                numerator: assetExchangeWeightRatio.beExchangeAssetWeight,
                denominator: assetExchangeWeightRatio.toExchangeAssetWeight,
              },
            );
            if (minBeExchangePrealnum_BI > beapn) {
              throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_GTE_FIELD, {
                prop: `beExchangeAssetPrealnum ${beExchangeAssetPrealnum}`,
                field: minBeExchangePrealnum_BI.toString(),
                ...BeExchangeAnyMultiAsset_Exception_Detail,
              });
            }
          }
        }
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
      const { transactionSignatureBuffer, toExchangeAssets, beExchangeAsset } =
        transaction.asset.beExchangeAnyMulti;
      // 因为 nft 的版税，导致一条交易出现多条冻结记录，但是又不能混合
      // 这里就简单的把冻结 id 搞一些花里胡哨的东西
      // 这个交易本来就比尿还骚，加一些骚东西也是没办法的
      const entityFrozenIdBuffer = parseHexToArrayBuffer(
        getHexFromArrayBuffer(transactionSignatureBuffer) +
          this.Buffer.from("_entity").toString("hex"),
      );

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
              frozenIdBuffer: transactionSignatureBuffer,
              recipientId, // 资产冻结账户
            },
          });
          paidTimes++;
        }
        // 发起交易冻结的不是同质资产
        // 发起账户成为 dappid 的拥有者
        else if (toExchangeParentAssetType === PARENT_ASSET_TYPE.DAPP) {
          taskList.next = eventEmitter.emit("unfrozenDAppid", {
            type: "unfrozenDAppid",
            transaction,
            applyInfo: {
              address: senderId,
              publicKeyBuffer: senderPublicKeyBuffer,
              possessorAddress: senderId,
              sourceChainName: toExchangeChainName,
              sourceChainMagic: toExchangeSource,
              dappid: toExchangeAssetType,
              status: ASSET_STATUS.NORMAL,
            },
          });
          paidTimes++;
        }
        // 发起账户成为位名的拥有者
        else if (toExchangeParentAssetType === PARENT_ASSET_TYPE.LOCATION_NAME) {
          taskList.next = eventEmitter.emit("unfrozenLocationName", {
            type: "unfrozenLocationName",
            transaction,
            applyInfo: {
              address: senderId,
              publicKeyBuffer: senderPublicKeyBuffer,
              possessorAddress: senderId,
              sourceChainName: toExchangeChainName,
              sourceChainMagic: toExchangeSource,
              name: toExchangeAssetType,
              status: ASSET_STATUS.NORMAL,
            },
          });
          paidTimes++;
        }
        // 发起账户成为 entityId 的拥有者
        else if (toExchangeParentAssetType === PARENT_ASSET_TYPE.ENTITY) {
          taskList.next = eventEmitter.emit("unfrozenEntity", {
            type: "unfrozenEntity",
            transaction,
            applyInfo: {
              address: senderId,
              publicKeyBuffer: senderPublicKeyBuffer,
              possessorAddress: senderId,
              sourceChainName: toExchangeChainName,
              sourceChainMagic: toExchangeSource,
              entityId: toExchangeAssetType,
              status: ASSET_STATUS.NORMAL,
            },
          });
          paidTimes++;
          if (taxInformation && taxInformation.taxAssetPrealnum !== "0") {
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
                frozenIdBuffer: entityFrozenIdBuffer,
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
          // 纳税
          taskList.next = eventEmitter.emit("payTax", {
            type: "payTax",
            transaction,
            applyInfo: {
              sourceChainName: beExchangeChainName,
              sourceChainMagic: beExchangeSource,
              parentAssetType: beExchangeParentAssetType,
              assetType: beExchangeAssetType,
              taxCollector: taxInformation.taxCollector,
            },
          });
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
