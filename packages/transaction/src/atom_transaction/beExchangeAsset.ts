import { TransactionFactory } from "./_txbase";
import { BeExchangeAssetTransaction } from "@bfchain/core-model";
import {
  AccountBaseHelper,
  TransactionHelper,
  BaseHelper,
  ConfigHelper,
  JSBIHelper,
  ChainAssetInfoHelper,
} from "@bfchain/core-helper";
import {
  CoreExceptionGenerator,
  SHOULD_NOT_BE,
  PROP_IS_REQUIRE,
  SHOULD_BE,
  PARAM_LOST,
  PROP_IS_INVALID,
  NOT_MATCH,
  NOT_EXIST,
  PROP_SHOULD_GTE_FIELD,
  SHOULD_NOT_EXIST,
  PROP_SHOULD_GT_FIELD,
  PROP_SHOULD_LTE_FIELD,
} from "@bfchain/core-util-exception";
import { ToExchangeAssetTransactionFactory } from "./toExchangeAsset";
import { Injectable, TaskList, parseHexToArrayBuffer } from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "BeExchangeAssetTransactionFactory",
);

/**
 * beExchangeAsset 交易工厂
 *
 */
@Injectable()
export class BeExchangeAssetTransactionFactory extends TransactionFactory<
  BeExchangeAssetTransaction
> {
  constructor(
    public accountBaseHelper: AccountBaseHelper,
    public transactionHelper: TransactionHelper,
    public baseHelper: BaseHelper,
    public configHelper: ConfigHelper,
    public chainAssetInfoHelper: ChainAssetInfoHelper,
    public jsbiHelper: JSBIHelper,
    public toExchangeAssetTransactionFactory: ToExchangeAssetTransactionFactory,
  ) {
    super();
  }

  /**
   * 校验输入信息
   * 要验证 beExchangeAsset 交易的基础信息是否合法和 asset 信息是否存在
   * 交易的手续费必须大于 0
   * 交易的 rangeType 必须是 empty
   * 必须携带交易的接收账户地址(是 toExchangeAsset 交易的发起账户地址)
   * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
   * 必须携带查询用的索引存储
   * key 值必须是 "transactionSignature" value 值必须是 to 交易的签名
   * asset 是完整的 beExchangeAsset 的交易
   * 必须携带 toExchangeAsset 的签名
   * 必须携带用于交换的资产数量和交换得到的资产数量
   * 必须携带 toExchangeAsset 的发起交易高度
   * 如果 toExchangeAsset 有指定开始交易高度间隔，则必须携带则个值
   * 如果 toExchangeAsset 有指定交易的有效区块高度，则必须携带这个值
   * 必须携带 申请资产交换交易 的 接收范围类型 rangeType
   * 必须携带 申请资产交换交易 的 接收范围 range
   *  如果 range 长度大于 0
   *    rangeType === MULTI_ADDRESS 交易的发起账户地址必须在 range 中
   *    rangeType === MULTI_DAPPID 交易的 dappid 必须在 range 中
   *    rangeType === MULTI_LOCATION_NAME 交易的 lns 必须在 range 中
   * 用于交换的资产数量必须等于被交换资产数量价格转换后得到的资产数量
   * 如果是公钥模式，则密文必须存在，且密文签名合法
   *
   * @param body
   * @param beExchangeAssetAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    beExchangeAssetAsset: BFChainCore.BeExchangeAssetAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, beExchangeAssetAsset, config);

    const Function_Exception_Detail = {
      target: "body",
      function: "verifyTransactionBody",
    } as const;

    this.emptyRangeType(body, Function_Exception_Detail);

    const { baseHelper, jsbiHelper } = this;

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

    const beExchangeAsset = beExchangeAssetAsset.beExchangeAsset;

    if (!beExchangeAsset) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "beExchangeAsset",
        function: "verifyTransactionBody",
      });
    }

    const BeExchangeAssetAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "beExchangeAsset",
    } as const;

    const { transactionSignature } = beExchangeAsset;
    if (!transactionSignature) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "transactionSignature",
        ...BeExchangeAssetAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidSignature(transactionSignature)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `transactionSignature ${transactionSignature}`,
        type: "transaction signature",
        ...BeExchangeAssetAsset_Exception_Detail,
      });
    }

    if (storage.value !== transactionSignature) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: `storage.value ${storage.value}`,
        be_compare_prop: `transactionSignature ${transactionSignature}`,
        to_target: "storage",
        be_target: "beExchangeAsset",
        ...Function_Exception_Detail,
      });
    }

    const { toExchangeNumber, beExchangeNumber } = beExchangeAsset;

    if (!toExchangeNumber) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "toExchangeNumber",
        ...BeExchangeAssetAsset_Exception_Detail,
      });
    }
    if (!baseHelper.isValidAssetNumber(toExchangeNumber)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "toExchangeNumber",
        type: "asset number",
        ...BeExchangeAssetAsset_Exception_Detail,
      });
    }

    if (!beExchangeNumber) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "beExchangeNumber",
        ...BeExchangeAssetAsset_Exception_Detail,
      });
    }
    if (!baseHelper.isValidAssetNumber(beExchangeNumber)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "beExchangeNumber",
        type: "asset number",
        ...BeExchangeAssetAsset_Exception_Detail,
      });
    }
    if (beExchangeNumber === "0") {
      throw new ArgumentIllegalException(PROP_SHOULD_GT_FIELD, {
        prop: "beExchangeNumber",
        field: "0",
        ...BeExchangeAssetAsset_Exception_Detail,
      });
    }

    const { exchangeAsset, ciphertextSignature } = beExchangeAsset;

    /**校验`exchangeAsset`的基本格式 */
    this.toExchangeAssetTransactionFactory.verifyToExchangeAsset(exchangeAsset);
    // 这里的 to 就是 to 交易发起人给出权益，be 是 be 交易发起人给出的权益
    if (BigInt(toExchangeNumber) > BigInt(exchangeAsset.toExchangeNumber)) {
      throw new ArgumentIllegalException(PROP_SHOULD_LTE_FIELD, {
        prop: `toExchangeNumber ${toExchangeNumber}`,
        field: exchangeAsset.toExchangeNumber,
        ...BeExchangeAssetAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidRate(exchangeAsset.exchangeRate)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `exchangeRate ${exchangeAsset.exchangeRate}`,
        type: "rate",
        ...BeExchangeAssetAsset_Exception_Detail,
      });
    }

    // 这里是用 to 算 be，所以是 to / 兑换比例，即 to * 兑换比例的倒数
    const minBeExchangeNumber_BI = jsbiHelper.multiplyRoundFraction(
      beExchangeAsset.toExchangeNumber,
      {
        numerator: exchangeAsset.exchangeRate.nextWeight,
        denominator: exchangeAsset.exchangeRate.prevWeight,
      },
    );
    if (minBeExchangeNumber_BI > BigInt(beExchangeAsset.beExchangeNumber)) {
      throw new ArgumentIllegalException(PROP_SHOULD_GTE_FIELD, {
        prop: `beExchangeNumber ${beExchangeNumber}`,
        field: minBeExchangeNumber_BI.toString(),
        ...BeExchangeAssetAsset_Exception_Detail,
      });
    }

    const { cipherPublicKeys } = exchangeAsset;
    /**如果是公钥模式，那么必须存在密文 */
    if (cipherPublicKeys.length > 0) {
      if (!ciphertextSignature) {
        throw new ArgumentIllegalException(NOT_EXIST, {
          prop: `ciphertextSignature ${ciphertextSignature}`,
          ...BeExchangeAssetAsset_Exception_Detail,
        });
      }

      if (!baseHelper.isValidAccountSignature(ciphertextSignature)) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: `ciphertextSignature ${ciphertextSignature}`,
          ...BeExchangeAssetAsset_Exception_Detail,
        });
      }

      const { signature, publicKey } = ciphertextSignature;

      if (!cipherPublicKeys.includes(publicKey)) {
        throw new ArgumentIllegalException(NOT_MATCH, {
          to_compare_prop: `publicKey ${publicKey}`,
          be_compare_prop: "cipherPublicKeys",
          to_target: "ciphertextSignature",
          be_target: "cipherPublicKeys",
          ...BeExchangeAssetAsset_Exception_Detail,
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
          ...BeExchangeAssetAsset_Exception_Detail,
        });
      }
    } else {
      if (ciphertextSignature) {
        throw new ArgumentIllegalException(SHOULD_NOT_EXIST, {
          prop: `ciphertextSignature ${ciphertextSignature}`,
          ...BeExchangeAssetAsset_Exception_Detail,
        });
      }
    }
  }

  /**
   * 初始化 beExchangeAsset 交易
   *
   * @param body
   * @param beExchangeAsset
   */
  init(body: BFChainCore.TxBodyJSON, beExchangeAsset: BFChainCore.BeExchangeAssetAssetJSON) {
    const transaction = BeExchangeAssetTransaction.fromObject({
      ...body,
      asset: beExchangeAsset,
    });

    return transaction;
  }

  /**
   * 交易生效，对账务产生影响
   *
   * @param transaction
   * @param eventEmitter
   */
  async applyTransaction(
    transaction: BeExchangeAssetTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    const tasks = new TaskList();
    tasks.next = super.applyTransaction(transaction, eventEmitter, config);
    const { exchangeAsset, toExchangeNumber, beExchangeNumber } = transaction.asset.beExchangeAsset;
    const { toExchangeSource, toExchangeAsset, beExchangeSource, beExchangeAsset } = exchangeAsset;

    const beAssetInfo = this.chainAssetInfoHelper.getAssetInfo(beExchangeSource, beExchangeAsset);
    // 扣除发起账户用于交换资产
    tasks.next = eventEmitter.emit("asset", {
      type: "asset",
      transaction,
      applyInfo: {
        address: transaction.senderId,
        publicKeyBuffer: transaction.senderPublicKeyBuffer,
        assetInfo: beAssetInfo,
        amount: `-${beExchangeNumber}`,
        sourceAmount: beExchangeNumber,
      },
    });

    // 累加接收账户交换得到的资产
    const recipientId = transaction.recipientId;
    tasks.next = eventEmitter.emit("asset", {
      type: "asset",
      transaction,
      applyInfo: {
        address: recipientId,
        assetInfo: beAssetInfo,
        amount: beExchangeNumber,
        sourceAmount: beExchangeNumber,
      },
    });

    const toAssetInfo = this.chainAssetInfoHelper.getAssetInfo(toExchangeSource, toExchangeAsset);

    // 累加发起账户交换得到的资产
    tasks.next = eventEmitter.emit("unfrozenAsset", {
      type: "unfrozenAsset",
      transaction,
      applyInfo: {
        address: transaction.senderId,
        publicKeyBuffer: transaction.senderPublicKeyBuffer,
        assetInfo: toAssetInfo,
        amount: toExchangeNumber,
        sourceAmount: toExchangeNumber,
        frozenIdBuffer: transaction.asset.beExchangeAsset.transactionSignatureBuffer,
        recipientId, // 资产冻结账户
      },
    });
    return tasks.toPromise();
  }
}
