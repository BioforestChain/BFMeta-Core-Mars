import { TransactionFactory } from "../_txbase";
import { GiftAnyTransactionFactory } from "../gift";
import { ASSET_STATUS, GrabAnyTransaction, PARENT_ASSET_TYPE } from "@bfchain/core-model";
import {
  AccountBaseHelper,
  TransactionHelper,
  BaseHelper,
  ConfigHelper,
  ChainAssetInfoHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { Injectable, parseHexToArrayBuffer, wrapTaskList } from "@bfchain/util";

const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "GrabAnyTransactionFactory",
);

/**
 * grabAny 交易工厂
 *
 */
@Injectable()
export class GrabAnyTransactionFactory extends TransactionFactory<GrabAnyTransaction> {
  constructor(
    public accountBaseHelper: AccountBaseHelper,
    public transactionHelper: TransactionHelper,
    public baseHelper: BaseHelper,
    public configHelper: ConfigHelper,
    public chainAssetInfoHelper: ChainAssetInfoHelper,
    private __giftAnyTransactionFactory: GiftAnyTransactionFactory,
  ) {
    super();
  }

  /**
   * 校验输入信息
   *
   * @param body
   * @param grabAnyAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    grabAnyAsset: BFChainCore.GrabAnyAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, grabAnyAsset, config);

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

    const grabAny = grabAnyAsset.grabAny;

    if (!grabAny) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "grabAny",
      });
    }

    const GrabAnyAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "grabAnyAsset",
    } as const;

    const { blockSignature, transactionSignature } = grabAny;

    if (!blockSignature) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "blockSignature",
        ...GrabAnyAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidSignature(blockSignature)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `blockSignature ${blockSignature}`,
        type: "block signature",
        ...GrabAnyAsset_Exception_Detail,
      });
    }

    if (!transactionSignature) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "transactionSignature",
        ...GrabAnyAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidSignature(transactionSignature)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `transactionSignature ${transactionSignature}`,
        type: "transaction signature",
        ...GrabAnyAsset_Exception_Detail,
      });
    }

    if (storage.value !== transactionSignature) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `storage.value ${storage.value}`,
        be_compare_prop: `transactionSignature ${transactionSignature}`,
        to_target: "storage",
        be_target: "grabAsset",
        ...Function_Exception_Detail,
      });
    }

    this.checkAssetAmount(grabAny.amount, "amount", GrabAnyAsset_Exception_Detail);

    const { giftAny, ciphertextSignature } = grabAny;

    /**
     * 校验`giftAny`的基本格式
     */
    await this.__giftAnyTransactionFactory.verifyGiftAny(giftAny);

    const { cipherPublicKeys } = giftAny;
    /**如果是公钥模式，那么必须存在密文 */
    if (cipherPublicKeys.length > 0) {
      if (!ciphertextSignature) {
        throw new ArgumentIllegalException(ERROR_LIST.NOT_EXIST, {
          prop: `ciphertextSignature ${ciphertextSignature}`,
          ...GrabAnyAsset_Exception_Detail,
        });
      }

      if (!baseHelper.isValidAccountSignature(ciphertextSignature)) {
        throw new ArgumentIllegalException(ERROR_LIST.NOT_EXIST, {
          prop: `ciphertextSignature ${ciphertextSignature}`,
          ...GrabAnyAsset_Exception_Detail,
        });
      }

      const { publicKey, signature } = ciphertextSignature;

      if (!cipherPublicKeys.includes(publicKey)) {
        throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `publicKey ${publicKey}`,
          be_compare_prop: "cipherPublicKeys",
          to_target: "ciphertextSignature",
          be_target: "cipherPublicKeys",
          ...GrabAnyAsset_Exception_Detail,
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
          ...GrabAnyAsset_Exception_Detail,
        });
      }
    } else {
      if (ciphertextSignature) {
        throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_EXIST, {
          prop: `ciphertextSignature ${ciphertextSignature}`,
          type: "grabAsset",
          ...GrabAnyAsset_Exception_Detail,
        });
      }
    }
  }

  /**
   * 初始化 grabAny 交易
   *
   * @param body
   * @param grabAny
   */
  init(body: BFChainCore.TxBodyJSON, grabAny: BFChainCore.GrabAnyAssetJSON) {
    const transaction = GrabAnyTransaction.fromObject({
      ...body,
      asset: grabAny,
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
    transaction: GrabAnyTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      const { chainAssetInfoHelper } = this;
      const { senderId, recipientId, senderPublicKeyBuffer, asset } = transaction;
      const { amount, giftAny, transactionSignature } = asset.grabAny;
      const { assetType, parentAssetType, sourceChainMagic, sourceChainName } = giftAny;

      const assetInfo = chainAssetInfoHelper.getAssetInfo(sourceChainMagic, assetType);
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);

      if (parentAssetType === PARENT_ASSET_TYPE.ASSETS) {
        // 发起账户将得到的资产解冻并收入账下
        taskList.next = eventEmitter.emit("unfrozenAsset", {
          type: "unfrozenAsset",
          transaction,
          applyInfo: {
            address: senderId,
            publicKeyBuffer: senderPublicKeyBuffer,
            assetInfo,
            amount,
            sourceAmount: amount,
            recipientId, // 资产冻结账户
            frozenId: transactionSignature,
          },
        });
      } else if (parentAssetType === PARENT_ASSET_TYPE.DAPP) {
        taskList.next = eventEmitter.emit("unfrozenDAppid", {
          type: "unfrozenDAppid",
          transaction,
          applyInfo: {
            address: senderId,
            publicKeyBuffer: senderPublicKeyBuffer,
            possessorAddress: senderId,
            sourceChainName,
            sourceChainMagic,
            dappid: assetType,
            status: ASSET_STATUS.NORMAL,
            frozenId: transactionSignature,
          },
        });
      } else if (parentAssetType === PARENT_ASSET_TYPE.LOCATION_NAME) {
        taskList.next = eventEmitter.emit("unfrozenLocationName", {
          type: "unfrozenLocationName",
          transaction,
          applyInfo: {
            address: senderId,
            publicKeyBuffer: senderPublicKeyBuffer,
            possessorAddress: senderId,
            sourceChainName,
            sourceChainMagic,
            name: assetType,
            status: ASSET_STATUS.NORMAL,
            frozenId: transactionSignature,
          },
        });
      } else if (parentAssetType === PARENT_ASSET_TYPE.ENTITY) {
        taskList.next = eventEmitter.emit("unfrozenEntity", {
          type: "unfrozenEntity",
          transaction,
          applyInfo: {
            address: senderId,
            publicKeyBuffer: senderPublicKeyBuffer,
            possessorAddress: senderId,
            sourceChainName,
            sourceChainMagic,
            entityId: assetType,
            status: ASSET_STATUS.NORMAL,
            frozenId: transactionSignature,
          },
        });
        if (giftAny.taxInformation && giftAny.taxInformation.taxAssetPrealnum !== "0") {
          const { taxCollector, taxAssetPrealnum } = giftAny.taxInformation;
          const chainAssetInfo = this.chainAssetInfoHelper.getAssetInfo(
            config.magic,
            config.assetType,
          );
          taskList.next = eventEmitter.emit("unfrozenAsset", {
            type: "unfrozenAsset",
            transaction,
            applyInfo: {
              address: taxCollector,
              publicKeyBuffer: senderPublicKeyBuffer,
              assetInfo: chainAssetInfo,
              amount: taxAssetPrealnum,
              sourceAmount: taxAssetPrealnum,
              recipientId, // 资产冻结账户
              frozenId: transactionSignature,
            },
          });
        }
      } else {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: `parentAssetType ${parentAssetType}`,
          target: "transaction.asset.grabAny.giftAny",
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
    transaction: GrabAnyTransaction,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    const { amount, giftAny } = transaction.asset.grabAny;
    const { sourceChainMagic, assetType } = giftAny;
    if (argv.magic === sourceChainMagic && argv.assetType === assetType) {
      return amount;
    }
    return "0";
  }
}
