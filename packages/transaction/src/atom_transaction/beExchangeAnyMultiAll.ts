import { TransactionFactory } from "./_txbase";
import {
  ASSET_STATUS,
  BeExchangeAnyMultiAllTransaction,
  FROZEN_REASON,
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
import { ToExchangeAnyMultiAllTransactionFactory } from "./toExchangeAnyMultiAll";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "BeExchangeAnyMultiAllTransactionFactory",
);

/**
 * beExchangeAnyMultiAll 交易工厂
 *
 */
@Injectable()
export class BeExchangeAnyMultiAllTransactionFactory extends TransactionFactory<BeExchangeAnyMultiAllTransaction> {
  constructor(
    @Inject("Buffer")
    public Buffer: BFChainUtil.BufferConstructor,
    public accountBaseHelper: AccountBaseHelper,
    public transactionHelper: TransactionHelper,
    public baseHelper: BaseHelper,
    public configHelper: ConfigHelper,
    public chainAssetInfoHelper: ChainAssetInfoHelper,
    public toExchangeAnyMultiAllTransactionFactory: ToExchangeAnyMultiAllTransactionFactory,
  ) {
    super();
  }

  /**
   * 校验输入信息
   *
   * @param body
   * @param beExchangeAnyMultiAllAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    beExchangeAnyMultiAllAsset: BFChainCore.BeExchangeAnyMultiAllAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, beExchangeAnyMultiAllAsset, config);

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

    const beExchangeAnyMultiAll = beExchangeAnyMultiAllAsset.beExchangeAnyMultiAll;

    if (!beExchangeAnyMultiAll) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "beExchangeAnyMultiAll",
      });
    }

    const BeExchangeAnyMultiAllAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "beExchangeAnyMultiAll",
    } as const;

    const { transactionSignature } = beExchangeAnyMultiAll;
    if (!transactionSignature) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "transactionSignature",
        ...BeExchangeAnyMultiAllAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidSignature(transactionSignature)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `transactionSignature ${transactionSignature}`,
        type: "transaction signature",
        ...BeExchangeAnyMultiAllAsset_Exception_Detail,
      });
    }

    if (storage.value !== transactionSignature) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `storage.value ${storage.value}`,
        be_compare_prop: `transactionSignature ${transactionSignature}`,
        to_target: "storage",
        be_target: "beExchangeAnyMultiAll",
        ...Function_Exception_Detail,
      });
    }

    const { toExchangeAssets, beExchangeAssets, ciphertextSignature } = beExchangeAnyMultiAll;

    /**校验`beExchangeAnyMulti`的基本格式 */
    await this.toExchangeAnyMultiAllTransactionFactory.verifyExchangeAnyMultiAll(
      "beExchangeAnyMultiAll",
      toExchangeAssets,
      beExchangeAssets,
      config,
    );

    /**如果是公钥模式，那么必须存在密文 */
    if (ciphertextSignature) {
      if (!baseHelper.isValidAccountSignature(ciphertextSignature)) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: `ciphertextSignature ${ciphertextSignature}`,
          ...BeExchangeAnyMultiAllAsset_Exception_Detail,
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
          ...BeExchangeAnyMultiAllAsset_Exception_Detail,
        });
      }
    }
  }

  /**
   * 初始化 beExchangeAnyMultiAll 交易
   *
   * @param body
   * @param beExchangeAnyMultiAll
   */
  init(
    body: BFChainCore.TxBodyJSON,
    beExchangeAnyMultiAll: BFChainCore.BeExchangeAnyMultiAllAssetJSON,
  ) {
    const transaction = BeExchangeAnyMultiAllTransaction.fromObject({
      ...body,
      asset: beExchangeAnyMultiAll,
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
    transaction: BeExchangeAnyMultiAllTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);
      const { senderId, recipientId, senderPublicKeyBuffer } = transaction;
      const { toExchangeAssets, beExchangeAssets, transactionSignature } =
        transaction.asset.beExchangeAnyMultiAll;

      /**支付同质资产的次数 */
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
              frozenReason: FROZEN_REASON.EXCHANGE,
            },
          });
        } else {
          // 发起交易冻结的不是同质资产
          // 发起账户成为不可数资产的拥有者
          const possessorAddress = senderId;
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
            if (taxInformation) {
              const { taxCollector, taxAssetPrealnum } = taxInformation;
              /// 就算是 taxAssetPrealnum 0，也要让 taxCollector 出现在 assetChange 里面
              if (taxAssetPrealnum === "0") {
                const chainAssetInfo = this.chainAssetInfoHelper.getAssetInfo(
                  config.magic,
                  config.assetType,
                );
                taskList.next = this._applyTransactionEmitAsset(
                  eventEmitter,
                  transaction,
                  taxAssetPrealnum,
                  {
                    senderId,
                    senderPublicKeyBuffer,
                    recipientId: taxCollector,
                    assetInfo: chainAssetInfo,
                  },
                );
              } else {
                const chainAssetInfo = this.chainAssetInfoHelper.getAssetInfo(
                  config.magic,
                  config.assetType,
                );
                taskList.next = eventEmitter.emit("unfrozenAsset", {
                  type: "unfrozenAsset",
                  transaction,
                  applyInfo: {
                    address: taxCollector,
                    assetInfo: chainAssetInfo,
                    amount: taxAssetPrealnum,
                    sourceAmount: taxAssetPrealnum,
                    recipientId, // 资产冻结账户
                    // 因为 nft 的版税，导致一条交易出现多条冻结记录，但是又不能混合
                    // 这里就简单的把冻结 id 搞一些花里胡哨的东西
                    // 这个交易本来就比尿还骚，加一些骚东西也是没办法的
                    frozenId: transactionSignature + this.Buffer.from("_entity").toString("hex"),
                    frozenReason: FROZEN_REASON.EXCHANGE,
                  },
                });
              }
            }
          } else if (toExchangeParentAssetType === PARENT_ASSET_TYPE.CERTIFICATE) {
            taskList.next = eventEmitter.emit("unfrozenCertificate", {
              type: "unfrozenCertificate",
              transaction,
              applyInfo: {
                address: senderId,
                publicKeyBuffer: senderPublicKeyBuffer,
                possessorAddress,
                sourceChainName: toExchangeChainName,
                sourceChainMagic: toExchangeSource,
                certificateId: toExchangeAssetType,
                status: ASSET_STATUS.NORMAL,
                frozenId: transactionSignature,
              },
            });
          } else {
            throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
              prop: `toExchangeParentAssetType ${toExchangeParentAssetType}`,
              target: "beExchangeAnyMultiAll.toExchangeAssets.toExchangeAsset",
            });
          }
        }
      }

      for (const beExchangeAsset of beExchangeAssets) {
        const {
          beExchangeChainName,
          beExchangeSource,
          beExchangeParentAssetType,
          beExchangeAssetType,
          beExchangeAssetPrealnum,
          taxInformation,
        } = beExchangeAsset;
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
          /// 就算是 taxAssetPrealnum 退回，也要让 taxCollector 出现在 assetChange 里面
          if (beExchangeAsset.taxInformation) {
            const chainAssetInfo = this.chainAssetInfoHelper.getAssetInfo(
              config.magic,
              config.assetType,
            );
            taskList.next = this._applyTransactionEmitAsset(eventEmitter, transaction, "0", {
              senderId,
              senderPublicKeyBuffer,
              recipientId: beExchangeAsset.taxInformation.taxCollector,
              assetInfo: chainAssetInfo,
            });
          }
          continue;
        }
        // 被动解冻
        // 被交换的是同质资产
        if (beExchangeParentAssetType === PARENT_ASSET_TYPE.ASSETS) {
          // 扣除发起账户用于交换资产
          const beAssetInfo = this.chainAssetInfoHelper.getAssetInfo(
            beExchangeSource,
            beExchangeAssetType,
          );
          const amount = beExchangeAssetPrealnum;
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
          if (taxInformation) {
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
        // 接收账户成为 certificateId 的拥有者
        else if (beExchangeParentAssetType === PARENT_ASSET_TYPE.CERTIFICATE) {
          taskList.next = eventEmitter.emit("changeCertificatePossessor", {
            type: "changeCertificatePossessor",
            transaction,
            applyInfo: {
              address: senderId,
              publicKeyBuffer: senderPublicKeyBuffer,
              possessorAddress: recipientId,
              sourceChainName: beExchangeChainName,
              sourceChainMagic: beExchangeSource,
              certificateId: beExchangeAssetType,
            },
          });
        } else {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
            prop: `beExchangeParentAssetType ${beExchangeParentAssetType}`,
            target: "beExchangeAnyMultiAll.beExchangeAssets.beExchangeAsset",
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
    transaction: BeExchangeAnyMultiAllTransaction,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    const { magic, assetType } = argv;
    const { toExchangeAssets, beExchangeAssets } = transaction.asset.beExchangeAnyMultiAll;
    for (const toExchangeAsset of toExchangeAssets) {
      const { toExchangeSource, toExchangeAssetType, toExchangeAssetPrealnum } = toExchangeAsset;
      if (magic === toExchangeSource && assetType === toExchangeAssetType) {
        return toExchangeAssetPrealnum;
      }
    }
    for (const beExchangeAsset of beExchangeAssets) {
      if (
        magic === beExchangeAsset.beExchangeSource &&
        assetType === beExchangeAsset.beExchangeAssetType
      ) {
        return beExchangeAsset.beExchangeAssetPrealnum as string;
      }
    }
    return "0";
  }
}
