import { TransactionFactory } from "./_txbase";
import { ToExchangeSpecialAssetTransactionFactory } from "./toExchangeSpecialAsset";
import { Injectable, wrapTaskList, parseHexToArrayBuffer } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  PROP_IS_REQUIRE,
  SHOULD_NOT_BE,
  SHOULD_BE,
  PARAM_LOST,
  PROP_IS_INVALID,
  NOT_MATCH,
  NOT_EXIST,
  SHOULD_NOT_EXIST,
} from "@bfchain/core-util-exception";
import {
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
   * 要验证 beExchangeSpecialAsset 交易的基础信息是否合法和 asset 信息是否存在
   * 交易的手续费必须大于 0
   * 交易的 rangeType 必须是 empty
   * 必须携带交易的接收账户地址，并且不能是交易的发起账户(是 toExchangeSpecialAsset 交易的发起账户地址)
   * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
   * 必须携带查询用索引存储
   * key 值必须是 "transactionSignature"，value 必须是 申请特殊资产交换交易 的签名
   * 必须携带生成接收特殊资产交换交易的合法数据
   * 必须携带 申请特殊资产交换交易 的签名
   * 必须携带 申请特殊资产交换交易 的发起交易高度
   * 如果 申请特殊资产交换交易 有指定开始交易高度间隔，则必须携带则个值
   * 如果 申请特殊资产交换交易 有指定交易的有效区块高度，则必须携带这个值
   * 必须携带 申请特殊资产交换交易 的 接收范围类型 rangeType
   * 必须携带 申请特殊资产交换交易 的 接收范围 range
   *  如果 range 长度大于 0
   *    rangeType === MULTI_ADDRESS 交易的发起账户地址必须在 range 中
   *    rangeType === MULTI_DAPPID 交易的 dappid 必须在 range 中
   *    rangeType === MULTI_LOCATION_NAME 交易的 lns 必须在 range 中
   * 如果是公钥模式，则密文必须存在，且密文签名合法
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

    if (body.senderId === recipientId) {
      throw new ArgumentIllegalException(SHOULD_NOT_BE, {
        to_compare_prop: `senderId ${body.senderId}`,
        to_target: "body",
        be_compare_prop: `recipientId ${recipientId}`,
        ...Function_Exception_Detail,
      });
    }

    if (body.fromMagic !== config.magic) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `fromMagic ${body.fromMagic}`,
        to_target: "body",
        be_compare_prop: "local chain magic",
        ...Function_Exception_Detail,
      });
    }

    if (body.toMagic !== config.magic) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `toMagic ${body.toMagic}`,
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
        to_compare_prop: `storage.key ${storage.key}`,
        to_target: "storage",
        be_compare_prop: "transactionSignature",
        ...Function_Exception_Detail,
      });
    }

    const beExchangeSpecialAsset = beExchangeSpecialAssetAsset.beExchangeSpecialAsset;

    if (!beExchangeSpecialAsset) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "beExchangeSpecialAsset",
        ...Function_Exception_Detail,
      });
    }

    const BeExchangeSpecialAssetAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "beExchangeSpecialAsset",
    } as const;

    const transactionSignature = beExchangeSpecialAsset.transactionSignature;
    if (!transactionSignature) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "transactionSignature",
        ...BeExchangeSpecialAssetAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidSignature(transactionSignature)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `transactionSignature ${transactionSignature}`,
        type: "transaction signature",
        ...BeExchangeSpecialAssetAsset_Exception_Detail,
      });
    }

    if (storage.value !== transactionSignature) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: `storage.value ${storage.value}`,
        be_compare_prop: `transactionSignature ${transactionSignature}`,
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
        throw new ArgumentIllegalException(NOT_EXIST, {
          prop: `ciphertextSignature ${ciphertextSignature}`,
          ...BeExchangeSpecialAssetAsset_Exception_Detail,
        });
      }

      if (!baseHelper.isValidAccountSignature(ciphertextSignature)) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: `ciphertextSignature ${ciphertextSignature}`,
          ...BeExchangeSpecialAssetAsset_Exception_Detail,
        });
      }

      const { signature, publicKey } = ciphertextSignature;

      if (!cipherPublicKeys.includes(publicKey)) {
        throw new ArgumentIllegalException(NOT_MATCH, {
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
          transactionSignatureBuffer: parseHexToArrayBuffer(transactionSignature),
          senderId: body.senderId,
        }))
      ) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: `ciphertextSignature ${signature}`,
          type: "signature",
          ...BeExchangeSpecialAssetAsset_Exception_Detail,
        });
      }
    } else {
      if (ciphertextSignature) {
        throw new ArgumentIllegalException(SHOULD_NOT_EXIST, {
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
  init(
    body: BFChainCore.TxBodyJSON,
    beExchangeSpecialAsset: BFChainCore.BeExchangeSpecialAssetAssetJSON,
  ) {
    const transaction = BeExchangeSpecialAssetTransaction.fromObject({
      ...body,
      asset: beExchangeSpecialAsset,
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
    transaction: BeExchangeSpecialAssetTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);
      const { exchangeSpecialAsset, transactionSignatureBuffer } =
        transaction.asset.beExchangeSpecialAsset;
      const {
        toExchangeSource,
        toExchangeAsset,
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
            frozenIdBuffer: transactionSignatureBuffer,
            recipientId, // 资产冻结账户
          },
        });
        if (exchangeAssetType === SPECIAL_ASSET_TYPE.DAPP_ID) {
          // 接收账户成为 dappid 的拥有者
          taskList.next = eventEmitter.emit("purchaseDAppid", {
            type: "purchaseDAppid",
            transaction,
            applyInfo: {
              address: senderId,
              publicKeyBuffer: senderPublicKeyBuffer,
              possessorAddress: recipientId,
              sourceChainMagic: beExchangeSource,
              dappid: beExchangeAsset,
            },
          });
        } else {
          // 接收账户成为链域名的拥有者
          taskList.next = eventEmitter.emit("purchaseLocationName", {
            type: "purchaseLocationName",
            transaction,
            applyInfo: {
              address: senderId,
              publicKeyBuffer: senderPublicKeyBuffer,
              possessorAddress: recipientId,
              sourceChainMagic: beExchangeSource,
              name: beExchangeAsset,
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
          taskList.next = eventEmitter.emit("purchaseDAppid", {
            type: "purchaseDAppid",
            transaction,
            applyInfo: {
              address: senderId,
              publicKeyBuffer: senderPublicKeyBuffer,
              possessorAddress: senderId,
              sourceChainMagic: toExchangeSource,
              dappid: toExchangeAsset,
            },
          });
        } else {
          // 发起账户成为链域名的拥有者
          taskList.next = eventEmitter.emit("purchaseLocationName", {
            type: "purchaseLocationName",
            transaction,
            applyInfo: {
              address: senderId,
              publicKeyBuffer: senderPublicKeyBuffer,
              possessorAddress: senderId,
              sourceChainMagic: toExchangeSource,
              name: toExchangeAsset,
            },
          });
        }
      }
      return taskList.toPromise();
    });
  }
}
