import { TransactionFactory } from "../_txbase";
import { GiftAssetTransactionFactory } from "../gift";
import { GrabAssetTransaction } from "@bfchain/core-model";
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
  "GrabAssetTransactionFactory",
);

/**
 * grabAsset 交易工厂
 *
 */
@Injectable()
export class GrabAssetTransactionFactory extends TransactionFactory<GrabAssetTransaction> {
  constructor(
    public accountBaseHelper: AccountBaseHelper,
    public transactionHelper: TransactionHelper,
    public baseHelper: BaseHelper,
    public configHelper: ConfigHelper,
    public chainAssetInfoHelper: ChainAssetInfoHelper,
    private __giftAssetTransactionFactory: GiftAssetTransactionFactory,
  ) {
    super();
  }

  /**
   * 校验输入信息
   *
   * @param body
   * @param grabAssetAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    grabAssetAsset: BFChainCore.GrabAssetAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, grabAssetAsset, config);

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
    if (storage.key !== "transactionSubId") {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `storage.key ${storage.key}`,
        to_target: "storage",
        be_compare_prop: "transactionSubId",
        ...Function_Exception_Detail,
      });
    }

    const grabAsset = grabAssetAsset.grabAsset;

    if (!grabAsset) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "grabAsset",
      });
    }

    const GrabAssetAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "grabAssetAsset",
    } as const;

    const { blockId, transactionSubId } = grabAsset;

    if (!blockId) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "blockId",
        ...GrabAssetAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidBlockId(blockId)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `blockId ${blockId}`,
        type: "block id",
        ...GrabAssetAsset_Exception_Detail,
      });
    }

    if (!transactionSubId) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "transactionSubId",
        ...GrabAssetAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidTransactionId(transactionSubId)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `transactionSubId ${transactionSubId}`,
        type: "transaction id",
        ...GrabAssetAsset_Exception_Detail,
      });
    }

    if (storage.value !== transactionSubId) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `storage.value ${storage.value}`,
        be_compare_prop: `transactionSubId ${transactionSubId}`,
        to_target: "storage",
        be_target: "grabAsset",
        ...Function_Exception_Detail,
      });
    }

    this.checkAssetAmount(grabAsset.amount, "amount", GrabAssetAsset_Exception_Detail);

    const { giftAsset, ciphertextSignature } = grabAsset;
    /**
     * 校验`giftAsset`的基本格式
     */
    this.__giftAssetTransactionFactory.verifyGiftAsset(giftAsset);

    const { cipherPublicKeys } = giftAsset;
    /**如果是公钥模式，那么必须存在密文 */
    if (cipherPublicKeys.length > 0) {
      if (!ciphertextSignature) {
        throw new ArgumentIllegalException(ERROR_LIST.NOT_EXIST, {
          prop: `ciphertextSignature ${ciphertextSignature}`,
          ...GrabAssetAsset_Exception_Detail,
        });
      }

      if (!baseHelper.isValidAccountSignature(ciphertextSignature)) {
        throw new ArgumentIllegalException(ERROR_LIST.NOT_EXIST, {
          prop: `ciphertextSignature ${ciphertextSignature}`,
          ...GrabAssetAsset_Exception_Detail,
        });
      }

      const { publicKey, signature } = ciphertextSignature;

      if (!cipherPublicKeys.includes(publicKey)) {
        throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `publicKey ${publicKey}`,
          be_compare_prop: "cipherPublicKeys",
          to_target: "ciphertextSignature",
          be_target: "cipherPublicKeys",
          ...GrabAssetAsset_Exception_Detail,
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
          ...GrabAssetAsset_Exception_Detail,
        });
      }
    } else {
      if (ciphertextSignature) {
        throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_EXIST, {
          prop: `ciphertextSignature ${ciphertextSignature}`,
          type: "grabAsset",
          ...GrabAssetAsset_Exception_Detail,
        });
      }
    }
  }

  /**
   * 初始化 grabAsset 交易
   *
   * @param body
   * @param grabAsset
   */
  init(body: BFChainCore.TxBodyJSON, grabAsset: BFChainCore.GrabAssetAssetJSON) {
    const transaction = GrabAssetTransaction.fromObject({
      ...body,
      asset: grabAsset,
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
    transaction: GrabAssetTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      const { chainAssetInfoHelper } = this;
      const { grabAsset } = transaction.asset;
      const { amount, transactionSubIdBuffer } = grabAsset;
      const { assetType, sourceChainMagic /* unitReserveFee */ } = grabAsset.giftAsset;
      const recipientId = transaction.recipientId;
      const assetInfo = chainAssetInfoHelper.getAssetInfo(sourceChainMagic, assetType);
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);
      // 发起账户将得到的资产解冻并收入账下
      taskList.next = eventEmitter.emit("unfrozenAsset", {
        type: "unfrozenAsset",
        transaction,
        applyInfo: {
          address: transaction.senderId,
          publicKeyBuffer: transaction.senderPublicKeyBuffer,
          assetInfo,
          amount,
          sourceAmount: amount,
          frozenIdBuffer: transactionSubIdBuffer,
          recipientId, // 资产冻结账户
        },
      });
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
    transaction: GrabAssetTransaction,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    const { amount, giftAsset } = transaction.asset.grabAsset;
    const { sourceChainMagic, assetType } = giftAsset;
    if (argv.magic === sourceChainMagic && argv.assetType === assetType) {
      return amount;
    }
    return "0";
  }
}
