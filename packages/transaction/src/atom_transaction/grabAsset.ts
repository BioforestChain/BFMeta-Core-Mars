import { TransactionFactory } from "./_txbase";
import {
  GrabAssetTransaction,
  GIFT_DISTRIBUTION_RULE,
  GrabAssetModel,
  RANGE_TYPE,
} from "@bfchain/core-model";
import {
  AccountBaseHelper,
  TransactionHelper,
  BaseHelper,
  ConfigHelper,
  ChainAssetInfoHelper,
  AsymmetricHelper,
} from "@bfchain/core-helper";
import {
  CoreExceptionGenerator,
  PARAM_LOST,
  PROP_IS_REQUIRE,
  PROP_IS_INVALID,
  SHOULD_BE,
  NOT_MATCH,
  NOT_EXIST,
} from "@bfchain/core-util-exception";
import { GiftAssetTransactionFactory } from "./giftAsset";
import { Injectable, Inject, parseHexToArrayBuffer, TaskList } from "@bfchain/util";
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
    private giftAssetTransactionFactory: GiftAssetTransactionFactory,
    private asymmetricHelper: AsymmetricHelper,
    @Inject("cryptoHelper") private cryptoHelper: BFChainCore.CryptoHelperInterface,
    @Inject("Buffer") private Buffer: BFChainUtil.BufferConstructor,
  ) {
    super();
  }

  /**
   * 校验输入信息
   * 要验证 grabAsset 交易的基础信息是否合法和 asset 信息是否存在
   * 交易的 rangeType 必须是 empty
   * 必须携带交易的接收账户地址(是 giftAsset 交易的发起账户地址)
   * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
   * 必须携带查询用的索引存储
   * key 值必须是 "transactionSignature" value 必须是 giftAsset 的签名
   * asset 是完整的 grabAsset 信息
   * 必须携带 发红包交易 被确认的区块签名
   * 必须携带 发红包交易 的签名
   * 必须携带 发红包交易 的 接收范围类型 rangeType
   * 必须携带 发红包交易 的 接收范围 range
   *  如果 range 长度大于 0
   *    rangeType === MULTI_ADDRESS 交易的发起账户地址必须在 range 中
   *    rangeType === MULTI_DAPPID 交易的 dappid 必须在 range 中
   *    rangeType === MULTI_LOCATION_NAME 交易的 lns 必须在 range 中
   * 必须携带 发红包交易 的发起交易高度
   * 如果 发红包交易 有指定开始交易高度间隔，则必须携带则个值
   * 如果 发红包交易 有指定交易的有效区块高度，则必须携带这个值
   * 如果是公钥模式，则密文必须存在，且密文签名合法
   * 根据 发红包交易 的模式，校验金额是否正确
   *
   * @param body
   * @param grabAssetAsset
   */
  verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    grabAssetAsset: BFChainCore.GrabAssetAssetJSON,
    config = this.configHelper,
  ) {
    super.verifyTransactionBody(body, grabAssetAsset, config);

    const Function_Exception_Detail = {
      target: "body",
      function: "verifyTransactionBody",
    } as const;

    this.emptyRangeType(body, Function_Exception_Detail);

    const { baseHelper } = this;

    const recipientId = body.recipientId;

    if (!recipientId) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "recipientId",
        ...Function_Exception_Detail,
      });
    }

    if (body.fromMagic !== config.magic) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "fromMagic",
        to_target: "body",
        be_compare_prop: "local chain magic",
        ...Function_Exception_Detail,
      });
    }

    if (body.toMagic !== config.magic) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "toMagic",
        to_target: "body",
        be_compare_prop: "local chain magic",
        ...Function_Exception_Detail,
      });
    }

    if (!body.storage) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "storage",
        ...Function_Exception_Detail,
      });
    }

    const storage = body.storage;
    if (storage.key !== "transactionSignature") {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "key",
        to_target: "storage",
        be_compare_prop: "transactionSignature",
        ...Function_Exception_Detail,
      });
    }

    const grabAsset = grabAssetAsset.grabAsset;

    if (!grabAsset) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "grabAsset",
        function: "verifyTransactionBody",
      });
    }

    const GrabAssetAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "grabAssetAsset",
    } as const;

    const {
      blockSignature,
      transactionSignature,
      transactionRangeType,
      transactionRange,
    } = grabAsset;

    if (!blockSignature) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "blockSignature",
        ...GrabAssetAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidSignature(blockSignature)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "blockSignature",
        type: "block signature",
        ...GrabAssetAsset_Exception_Detail,
      });
    }

    if (!transactionSignature) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "transactionSignature",
        ...GrabAssetAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidSignature(transactionSignature)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "transactionSignature",
        type: "transaction signature",
        ...GrabAssetAsset_Exception_Detail,
      });
    }

    if (storage.value !== transactionSignature) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: "value",
        be_compare_prop: "transactionSignature",
        to_target: "storage",
        be_target: "grabAsset",
        ...Function_Exception_Detail,
      });
    }

    if (!baseHelper.isValidRange(transactionRangeType, transactionRange)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "transactionRange",
        type: "transaction recipient",
        ...GrabAssetAsset_Exception_Detail,
      });
    }

    if (transactionRangeType & RANGE_TYPE.MULTI_ADDRESS) {
      if (!transactionRange.includes(body.senderId)) {
        throw new ArgumentIllegalException(SHOULD_BE, {
          to_compare_prop: "senderId",
          to_target: "body",
          be_compare_prop: "transactionRange",
          ...GrabAssetAsset_Exception_Detail,
        });
      }
    } else if (transactionRangeType & RANGE_TYPE.MULTI_DAPPID) {
      if (!body.dappid || !transactionRange.includes(body.dappid)) {
        throw new ArgumentIllegalException(SHOULD_BE, {
          to_compare_prop: "dappid",
          to_target: "body",
          be_compare_prop: "transactionRange",
          ...GrabAssetAsset_Exception_Detail,
        });
      }
    } else if (transactionRangeType & RANGE_TYPE.MULTI_LOCATION_NAME) {
      if (!body.lns || !transactionRange.includes(body.lns)) {
        throw new ArgumentIllegalException(SHOULD_BE, {
          to_compare_prop: "lns",
          to_target: "body",
          be_compare_prop: "transactionRange",
          ...GrabAssetAsset_Exception_Detail,
        });
      }
    }

    if (!baseHelper.isPositiveInteger(grabAsset.applyBlockHeight)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "applyBlockHeight",
        type: "positive integer",
        ...GrabAssetAsset_Exception_Detail,
      });
    }

    if (grabAsset.beginUnfrozenBlockHeight) {
      if (!baseHelper.isPositiveInteger(grabAsset.beginUnfrozenBlockHeight)) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "beginUnfrozenBlockHeight",
          type: "positive integer",
          ...GrabAssetAsset_Exception_Detail,
        });
      }
    }

    if (!baseHelper.isPositiveInteger(grabAsset.effectiveBlockHeight)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "effectiveBlockHeight",
        type: "positive integer",
        ...GrabAssetAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidAssetNumber(grabAsset.amount)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "amount",
        type: "asset number",
        ...GrabAssetAsset_Exception_Detail,
      });
    }

    const { giftAsset } = grabAsset;
    /**
     * 校验`giftAsset`的基本格式
     */
    this.giftAssetTransactionFactory.verifyGiftAsset(giftAsset);

    const { cipherPublicKeys } = giftAsset;
    const trsSignBuffer = parseHexToArrayBuffer(transactionSignature);
    const blockSignBuffer = parseHexToArrayBuffer(blockSignature);

    /**如果是公钥模式，那么必须存在密文 */
    if (cipherPublicKeys.length > 0) {
      const { ciphertextSignature } = grabAsset;
      if (!ciphertextSignature) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "ciphertextSignature",
          type: "grabAsset",
          ...GrabAssetAsset_Exception_Detail,
        });
      }

      if (!baseHelper.isValidAccountSignature(ciphertextSignature)) {
        throw new ArgumentIllegalException(NOT_EXIST, {
          prop: "ciphertextSignature",
          type: "signature",
          ...GrabAssetAsset_Exception_Detail,
        });
      }

      const { publicKey, signature } = ciphertextSignature;

      if (!cipherPublicKeys.includes(publicKey)) {
        throw new ArgumentIllegalException(NOT_MATCH, {
          to_compare_prop: "publicKey",
          be_compare_prop: "cipherPublicKeys",
          to_target: "ciphertextSignature",
          be_target: "cipherPublicKeys",
          ...GrabAssetAsset_Exception_Detail,
        });
      }

      /// 对密文进行解码校验
      if (
        !this.transactionHelper.verifyCiphertextSignature({
          secretPublicKey: parseHexToArrayBuffer(publicKey),
          ciphertextSignatureBuffer: parseHexToArrayBuffer(signature),
          transactionSignatureBuffer: trsSignBuffer,
          senderId: body.senderId,
        })
      ) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "ciphertextSignature",
          type: "signature",
          ...GrabAssetAsset_Exception_Detail,
        });
      }
    }

    /**校验金额 */
    let should_grap_amount_BI: bigint | undefined;
    switch (giftAsset.giftDistributionRule) {
      case GIFT_DISTRIBUTION_RULE.AVERAGE:
        should_grap_amount_BI = this.transactionHelper.calcGrabAverageGiftAssetNumber(
          giftAsset.amount,
          giftAsset.totalGrabableTimes,
        );
        break;
      case GIFT_DISTRIBUTION_RULE.RANDOM:
        should_grap_amount_BI = this.transactionHelper.calcGrabRandomGiftAssetNumber(
          body.senderId,
          blockSignBuffer,
          trsSignBuffer,
          recipientId,
          giftAsset.amount,
          giftAsset.totalGrabableTimes,
        );
        break;
      case GIFT_DISTRIBUTION_RULE.RECIPIENT_RANDOM:
        should_grap_amount_BI = this.transactionHelper.calcGrabRecipientRandomGiftAssetNumber(
          body.senderId,
          blockSignBuffer,
          trsSignBuffer,
          recipientId,
          grabAsset.transactionRange,
          giftAsset.amount,
        );
        break;
    }

    if (!should_grap_amount_BI) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "calculate amount",
        ...Function_Exception_Detail,
        target: "giftAsset",
      });
    }

    if (should_grap_amount_BI.toString() !== grabAsset.amount) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "amount",
        to_target: "grabAsset",
        be_compare_prop: should_grap_amount_BI.toString(),
        ...Function_Exception_Detail,
      });
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
    const tasks = new TaskList();
    const { chainAssetInfoHelper } = this;
    const { grabAsset } = transaction.asset;
    const { amount, giftTransactionSignatureBuffer } = grabAsset;
    const { assetType, sourceChainMagic /* unitReserveFee */ } = grabAsset.giftAsset;
    const recipientId = transaction.recipientId;
    const assetInfo = chainAssetInfoHelper.getAssetInfo(sourceChainMagic, assetType);
    // 发起账户将得到的资产解冻并收入账下
    tasks.next = eventEmitter.emit("unfrozenAsset", {
      type: "unfrozenAsset",
      transaction: transaction,
      applyInfo: {
        address: transaction.senderId,
        publicKeyBuffer: transaction.senderPublicKeyBuffer,
        assetInfo,
        amount: amount,
        sourceAmount: amount,
        frozenIdBuffer: giftTransactionSignatureBuffer,
        recipientId, // 资产冻结账户
      },
    });

    return tasks.tryToPromise();
  }
}
