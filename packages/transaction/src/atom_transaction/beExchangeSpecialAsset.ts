import { TransactionFactory } from "./_txbase";
import { ToExchangeSpecialAssetTransactionFactory } from "./toExchangeSpecialAsset";
import { Injectable, wrapTaskList, parseHexToArrayBuffer } from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import {
  ASSET_STATUS,
  BeExchangeSpecialAssetTransaction,
  EXCHANGE_DIRECTION,
  SPECIAL_ASSET_TYPE,
} from "@bfchain/core-model";
import {
  AccountBaseHelper,
  TransactionHelper,
  BaseHelper,
  ConfigHelper,
  ChainAssetInfoHelper,
  JSBIHelper,
} from "@bfchain/core-helper";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "BeExchangeSpecialAssetTransactionFactory",
);

/**
 * beExchangeSpecialAsset 交易工厂
 *
 */
@Injectable()
export class BeExchangeSpecialAssetTransactionFactory extends TransactionFactory<BeExchangeSpecialAssetTransaction> {
  constructor(
    public accountBaseHelper: AccountBaseHelper,
    public transactionHelper: TransactionHelper,
    public baseHelper: BaseHelper,
    public configHelper: ConfigHelper,
    public chainAssetInfoHelper: ChainAssetInfoHelper,
    public jsbiHelper: JSBIHelper,
    public toExchangeSpecialAssetTransactionFactory: ToExchangeSpecialAssetTransactionFactory,
  ) {
    super();
  }

  /**
   * 校验输入信息
   *
   * @param body
   * @param beExchangeSpecialAssetAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    beExchangeSpecialAssetAsset: BFChainCore.BeExchangeSpecialAssetAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, beExchangeSpecialAssetAsset, config);

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

    if (body.senderId === recipientId) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_BE, {
        to_compare_prop: `senderId ${body.senderId}`,
        to_target: "body",
        be_compare_prop: `recipientId ${recipientId}`,
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
    if (storage.key !== "transactionSubId") {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `storage.key ${storage.key}`,
        to_target: "storage",
        be_compare_prop: "transactionSubId",
        ...Function_Exception_Detail,
      });
    }

    const beExchangeSpecialAsset = beExchangeSpecialAssetAsset.beExchangeSpecialAsset;

    if (!beExchangeSpecialAsset) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "beExchangeSpecialAsset",
        ...Function_Exception_Detail,
      });
    }

    const BeExchangeSpecialAssetAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "beExchangeSpecialAsset",
    } as const;

    const transactionSubId = beExchangeSpecialAsset.transactionSubId;
    if (!transactionSubId) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "transactionSubId",
        ...BeExchangeSpecialAssetAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidTransactionId(transactionSubId)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `transactionSubId ${transactionSubId}`,
        type: "transaction id",
        ...BeExchangeSpecialAssetAsset_Exception_Detail,
      });
    }

    if (storage.value !== transactionSubId) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `storage.value ${storage.value}`,
        be_compare_prop: `transactionSubId ${transactionSubId}`,
        to_target: "storage",
        be_target: "beExchangeSpecialAsset",
        ...Function_Exception_Detail,
      });
    }

    const { exchangeSpecialAsset, ciphertextSignature } = beExchangeSpecialAsset;

    /**校验`exchangeSpecialAsset`的基本格式 */
    this.toExchangeSpecialAssetTransactionFactory.verifyExchangeSpecialAsset(exchangeSpecialAsset);

    const { cipherPublicKeys } = exchangeSpecialAsset;

    /**如果是公钥模式，那么必须存在密文 */
    if (cipherPublicKeys.length > 0) {
      if (!ciphertextSignature) {
        throw new ArgumentIllegalException(ERROR_LIST.NOT_EXIST, {
          prop: `ciphertextSignature ${ciphertextSignature}`,
          ...BeExchangeSpecialAssetAsset_Exception_Detail,
        });
      }

      if (!baseHelper.isValidAccountSignature(ciphertextSignature)) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: `ciphertextSignature ${ciphertextSignature}`,
          ...BeExchangeSpecialAssetAsset_Exception_Detail,
        });
      }

      const { signature, publicKey } = ciphertextSignature;

      if (!cipherPublicKeys.includes(publicKey)) {
        throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `publicKey ${publicKey}`,
          be_compare_prop: "cipherPublicKeys",
          to_target: "ciphertextSignature",
          be_target: "cipherPublicKeys",
          ...BeExchangeSpecialAssetAsset_Exception_Detail,
        });
      }

      /// 对密文进行解码校验
      if (
        !(await this.transactionHelper.verifyCiphertextSignature({
          secretPublicKey: parseHexToArrayBuffer(publicKey),
          ciphertextSignatureBuffer: parseHexToArrayBuffer(signature),
          transactionSubIdBuffer: parseHexToArrayBuffer(transactionSubId),
          senderId: body.senderId,
        }))
      ) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: `ciphertextSignature ${signature}`,
          type: "signature",
          ...BeExchangeSpecialAssetAsset_Exception_Detail,
        });
      }
    } else {
      if (ciphertextSignature) {
        throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_EXIST, {
          prop: `ciphertextSignature ${beExchangeSpecialAsset.ciphertextSignature}`,
          ...BeExchangeSpecialAssetAsset_Exception_Detail,
        });
      }
    }
  }

  /**
   * 初始化 beExchangeSpecialAsset 交易
   *
   * @param body
   * @param beExchangeSpecialAsset
   */
  async init(
    body: BFChainCore.TxBodyJSON,
    beExchangeSpecialAsset: BFChainCore.BeExchangeSpecialAssetAssetJSON,
  ) {
    const transaction = BeExchangeSpecialAssetTransaction.fromObject({
      ...body,
      asset: beExchangeSpecialAsset,
    });

    transaction.subIdBuffer = await this.transactionHelper.generateSubId(transaction.getSubBytes());
    return transaction;
  }

  /**
   * 交易生效，对账务产生影响
   *
   * @param transaction
   * @param eventEmitter
   */
  applyTransaction(
    transaction: BeExchangeSpecialAssetTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);
      const { exchangeSpecialAsset, transactionSubIdBuffer } =
        transaction.asset.beExchangeSpecialAsset;
      const {
        toExchangeChainName,
        toExchangeSource,
        toExchangeAsset,
        beExchangeChainName,
        beExchangeSource,
        beExchangeAsset,
        exchangeDirection,
        exchangeNumber,
        exchangeAssetType,
      } = exchangeSpecialAsset;
      const { senderId, senderPublicKeyBuffer, recipientId } = transaction;
      // ASSET_FROM_RECIPIENT 特殊资产来自 be 交易的发起账户
      if (exchangeDirection === EXCHANGE_DIRECTION.ASSET_FROM_RECIPIENT) {
        // to 交易是购买交易
        const toAssetInfo = this.chainAssetInfoHelper.getAssetInfo(
          toExchangeSource,
          toExchangeAsset,
        );
        // 发起账户将得到的资产解冻并收入账下(发起账户是出售特殊资产)
        taskList.next = eventEmitter.emit("unfrozenAsset", {
          type: "unfrozenAsset",
          transaction,
          applyInfo: {
            address: senderId,
            publicKeyBuffer: senderPublicKeyBuffer,
            assetInfo: toAssetInfo,
            amount: exchangeNumber,
            sourceAmount: exchangeNumber,
            frozenIdBuffer: transactionSubIdBuffer,
            recipientId, // 资产冻结账户
          },
        });
        if (exchangeAssetType === SPECIAL_ASSET_TYPE.DAPP_ID) {
          // 接收账户成为 dappid 的拥有者
          taskList.next = eventEmitter.emit("changeDAppidPossessor", {
            type: "changeDAppidPossessor",
            transaction,
            applyInfo: {
              address: senderId,
              publicKeyBuffer: senderPublicKeyBuffer,
              possessorAddress: recipientId,
              sourceChainName: beExchangeChainName,
              sourceChainMagic: beExchangeSource,
              dappid: beExchangeAsset,
            },
          });
        } else if (exchangeAssetType === SPECIAL_ASSET_TYPE.LOCATION_NAME) {
          // 接收账户成为位名的拥有者
          taskList.next = eventEmitter.emit("changeLocationNamePossessor", {
            type: "changeLocationNamePossessor",
            transaction,
            applyInfo: {
              address: senderId,
              publicKeyBuffer: senderPublicKeyBuffer,
              possessorAddress: recipientId,
              sourceChainName: beExchangeChainName,
              sourceChainMagic: beExchangeSource,
              name: beExchangeAsset,
            },
          });
        } else if (exchangeAssetType === SPECIAL_ASSET_TYPE.ENTITY) {
          // 接收账户成为 entityId 的拥有者
          taskList.next = eventEmitter.emit("changeEntityPossessor", {
            type: "changeEntityPossessor",
            transaction,
            applyInfo: {
              address: senderId,
              publicKeyBuffer: senderPublicKeyBuffer,
              possessorAddress: recipientId,
              sourceChainName: beExchangeChainName,
              sourceChainMagic: beExchangeSource,
              entityId: beExchangeAsset,
            },
          });
        }
      } else {
        // to 交易时出售交易
        const beAssetInfo = this.chainAssetInfoHelper.getAssetInfo(
          beExchangeSource,
          beExchangeAsset,
        );
        // 扣除发起账户用于交换资产(发起账户是购买资产)
        taskList.next = eventEmitter.emit("asset", {
          type: "asset",
          transaction,
          applyInfo: {
            address: transaction.senderId,
            publicKeyBuffer: senderPublicKeyBuffer,
            assetInfo: beAssetInfo,
            amount: `-${exchangeNumber}`,
            sourceAmount: exchangeNumber,
          },
        });
        // 累加接收账户得到的资产
        taskList.next = eventEmitter.emit("asset", {
          type: "asset",
          transaction,
          applyInfo: {
            address: recipientId,
            assetInfo: beAssetInfo,
            amount: exchangeNumber,
            sourceAmount: exchangeNumber,
          },
        });
        if (exchangeAssetType === SPECIAL_ASSET_TYPE.DAPP_ID) {
          // 发起账户成为 dappid 的拥有者
          taskList.next = eventEmitter.emit("unfrozenDAppid", {
            type: "unfrozenDAppid",
            transaction,
            applyInfo: {
              address: senderId,
              publicKeyBuffer: senderPublicKeyBuffer,
              possessorAddress: senderId,
              sourceChainName: toExchangeChainName,
              sourceChainMagic: toExchangeSource,
              dappid: toExchangeAsset,
              status: ASSET_STATUS.NORMAL,
            },
          });
        } else if (exchangeAssetType === SPECIAL_ASSET_TYPE.LOCATION_NAME) {
          // 发起账户成为位名的拥有者
          taskList.next = eventEmitter.emit("unfrozenLocationName", {
            type: "unfrozenLocationName",
            transaction,
            applyInfo: {
              address: senderId,
              publicKeyBuffer: senderPublicKeyBuffer,
              possessorAddress: senderId,
              sourceChainName: toExchangeChainName,
              sourceChainMagic: toExchangeSource,
              name: toExchangeAsset,
              status: ASSET_STATUS.NORMAL,
            },
          });
        } else if (exchangeAssetType === SPECIAL_ASSET_TYPE.ENTITY) {
          // 发起账户成为 entityId 的拥有者
          taskList.next = eventEmitter.emit("unfrozenEntity", {
            type: "unfrozenEntity",
            transaction,
            applyInfo: {
              address: senderId,
              publicKeyBuffer: senderPublicKeyBuffer,
              possessorAddress: senderId,
              sourceChainName: toExchangeChainName,
              sourceChainMagic: toExchangeSource,
              entityId: toExchangeAsset,
              status: ASSET_STATUS.NORMAL,
            },
          });
        } else {
          throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
            prop: `exchangeAssetType ${exchangeAssetType}`,
            target: "transaction.asset.beExchangeSpecialAssetAsset.exchangeSpecialAsset",
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
    transaction: BeExchangeSpecialAssetTransaction,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    const { magic, assetType } = argv;
    const { toExchangeSource, toExchangeAsset, beExchangeAsset, beExchangeSource, exchangeNumber } =
      transaction.asset.beExchangeSpecialAsset.exchangeSpecialAsset;
    if (magic === toExchangeSource && assetType === toExchangeAsset) {
      return exchangeNumber;
    }
    if (magic === beExchangeSource && assetType === beExchangeAsset) {
      return exchangeNumber;
    }
    return "0";
  }
}
