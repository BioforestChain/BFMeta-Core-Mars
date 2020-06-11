import type {
  TransactionHelper,
  ChainAssetInfoHelper,
  AccountBaseHelper,
  BaseHelper,
  ConfigHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator } from "@bfchain/core-util-exception";
import {
  PARAM_LOST,
  PROP_IS_REQUIRE,
  PROP_IS_INVALID,
  NOT_MATCH,
  PROP_SHOULD_GTE_FIELD,
  PROP_SHOULD_LTE_FIELD,
  SHOULD_BE,
} from "@bfchain/core-util-exception-errorcode";
import { Transaction, RANGE_TYPE, TransactionInBlock } from "@bfchain/core-model";
import { TaskList } from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator("CONTROLLER", "_txbase");

type FunctionExceptionDetail = {
  target: string;
  function: string;
};

export abstract class TransactionFactory<T extends Transaction = Transaction> {
  abstract accountBaseHelper: AccountBaseHelper;
  abstract transactionHelper: TransactionHelper;
  abstract baseHelper: BaseHelper;
  abstract configHelper: ConfigHelper;
  abstract chainAssetInfoHelper: ChainAssetInfoHelper;

  abstract init(body: BFChainCore.TxBodyJSON, asset: BFChainCore.GetTransactionAssetJSON<T>): T;
  /**
   * 从 json 转出 protobuf-message
   * JSON格式一般是进程内部通讯在使用,所以JSON格式默认不校验
   */
  async fromJSON(
    trs: BFChainCore.TransactionJSON<BFChainCore.GetTransactionAssetJSON<T>>,
    opts?: { verify?: boolean; config?: ConfigHelper },
  ) {
    const transaction = this.init(trs, trs.asset);
    if (opts && opts.verify) {
      await this.verify(transaction, opts.config);
    }
    return transaction;
  }

  /**
   * 验证主密码的密钥对是否合法
   *
   * @param keypair
   */
  verifyKeypair(keypair: BFChainCore.Keypair) {
    const Function_Exception_Detail = {
      function: "verifyKeypair",
    } as const;

    if (!keypair) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "keypair",
        ...Function_Exception_Detail,
      });
    }

    const Keypair_Exception_Detail = {
      target: "keypair",
    } as const;

    if (!keypair.publicKey) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "publicKey",
        ...Keypair_Exception_Detail,
      });
    }

    if (!keypair.secretKey) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        param: "secretKey",
        ...Keypair_Exception_Detail,
      });
    }
  }

  /**
   * 验证二次密码的密钥对是否合法
   *
   * @param keypair
   */
  verifySecondKeypair(keypair: BFChainCore.Keypair) {
    const Function_Exception_Detail = {
      function: "verifySecondKeypair",
    } as const;

    if (!keypair) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "keypair",
        ...Function_Exception_Detail,
      });
    }

    const Keypair_Exception_Detail = {
      target: "keypair",
    } as const;

    if (!keypair.publicKey) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "publicKey",
        ...Keypair_Exception_Detail,
      });
    }

    if (!keypair.secretKey) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        param: "secretKey",
        ...Keypair_Exception_Detail,
      });
    }
  }

  /**
   * 创建完交易后的校验
   *
   * @param body
   * @param asset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    asset: BFChainCore.GetTransactionAssetJSON<T>,
    config = this.configHelper,
  ) {
    const Function_Exception_Detail = {
      function: "verifyTransactionBody",
    } as const;

    if (!body) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "body",
        ...Function_Exception_Detail,
      });
    }

    if (!asset) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "asset",
        ...Function_Exception_Detail,
      });
    }

    const TransactionBody_Exception_Detail = {
      target: "body",
      ...Function_Exception_Detail,
    } as const;

    const { baseHelper, accountBaseHelper } = this;

    if (!baseHelper.isPositiveInteger(body.version)) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "version",
        ...TransactionBody_Exception_Detail,
      });
    }

    if (!body.type) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "type",
        ...TransactionBody_Exception_Detail,
      });
    }

    if (!baseHelper.isValidTransactionType(body.type)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "type",
        type: "transaction type",
        ...TransactionBody_Exception_Detail,
      });
    }

    if (!body.senderId) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "senderId",
        ...TransactionBody_Exception_Detail,
      });
    }

    if (!(await accountBaseHelper.isAddress(body.senderId))) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "senderId",
        type: "account address",
        ...TransactionBody_Exception_Detail,
      });
    }

    if (!body.senderPublicKey) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "senderPublicKey",
        ...TransactionBody_Exception_Detail,
      });
    }

    if (!baseHelper.isValidPublicKey(body.senderPublicKey)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "senderPublicKey",
        type: "account publicKey",
        ...TransactionBody_Exception_Detail,
      });
    }

    if (
      body.senderId !==
      (await accountBaseHelper.getAddressFromPublicKeyString(body.senderPublicKey))
    ) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: body.senderId,
        be_compare_prop: await accountBaseHelper.getAddressFromPublicKeyString(
          body.senderPublicKey,
        ),
        to_target: "senderPublicKey",
        be_target: "body",
        ...TransactionBody_Exception_Detail,
      });
    }

    if (body.senderSecondPublicKey) {
      if (!baseHelper.isValidPublicKey(body.senderSecondPublicKey)) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "senderSecondPublicKey",
          type: "account publicKey",
          ...TransactionBody_Exception_Detail,
        });
      }
    }

    if (body.recipientId !== undefined) {
      if (!(await accountBaseHelper.isAddress(body.recipientId))) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "recipientId",
          type: "account address",
          ...TransactionBody_Exception_Detail,
        });
      }
    }

    if (!(await this.baseHelper.isValidRange(body.rangeType, body.range))) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "range",
        type: "transaction range",
        ...TransactionBody_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(body.timestamp)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "timestamp",
        type: "natural number",
        ...TransactionBody_Exception_Detail,
      });
    }

    const applyBlockHeight = body.applyBlockHeight;
    if (!baseHelper.isPositiveInteger(applyBlockHeight)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "applyBlockHeight",
        type: "positive integer",
        ...TransactionBody_Exception_Detail,
      });
    }

    const effectiveBlockHeight = body.effectiveBlockHeight;
    if (!baseHelper.isPositiveInteger(effectiveBlockHeight)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "effectiveBlockHeight",
        type: "positive integer",
        ...TransactionBody_Exception_Detail,
      });
    }

    if (effectiveBlockHeight < applyBlockHeight) {
      throw new ArgumentIllegalException(PROP_SHOULD_GTE_FIELD, {
        prop: "effectiveBlockHeight",
        field: applyBlockHeight,
        ...TransactionBody_Exception_Detail,
      });
    }

    const { maxApplyAndConfirmedBlockHeightDiff } = config;
    const maxEffectiveBlockHeight = applyBlockHeight + maxApplyAndConfirmedBlockHeightDiff;
    if (effectiveBlockHeight > maxEffectiveBlockHeight) {
      throw new ArgumentIllegalException(PROP_SHOULD_LTE_FIELD, {
        prop: "effectiveBlockHeight",
        field: maxEffectiveBlockHeight,
        ...TransactionBody_Exception_Detail,
      });
    }

    // 校验花费手续费
    this.checkTrsBaseFee(body.fee, TransactionBody_Exception_Detail);

    if (!body.fromMagic) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "fromMagic",
        ...TransactionBody_Exception_Detail,
      });
    }

    if (!baseHelper.isValidChainMagic(body.fromMagic)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "fromMagic",
        type: "chain magic",
        ...TransactionBody_Exception_Detail,
      });
    }

    if (!body.toMagic) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "toMagic",
        ...TransactionBody_Exception_Detail,
      });
    }

    if (!baseHelper.isValidChainMagic(body.toMagic)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "toMagic",
        type: "chain magic",
        ...TransactionBody_Exception_Detail,
      });
    }

    if (body.sourceIP !== undefined) {
      if (!baseHelper.isIp(body.sourceIP)) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "sourceIP",
          type: "ip",
          ...TransactionBody_Exception_Detail,
        });
      }
    }

    if (body.dappid !== undefined) {
      if (!baseHelper.isValidDAppId(body.dappid)) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "dappid",
          type: "dappid",
          ...TransactionBody_Exception_Detail,
        });
      }
    }

    if (body.lns !== undefined) {
      if (!baseHelper.isValidLnsName(body.lns, config.chainName)) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "lns",
          type: "location name",
          ...TransactionBody_Exception_Detail,
        });
      }
    }

    const remark = body.remark;
    for (const key in remark) {
      if (!baseHelper.isString(remark[key])) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "remark",
          ...TransactionBody_Exception_Detail,
        });
      }
    }
  }

  /**
   * 校验基础信息
   *
   * @param transaction
   */
  async verifyBaseInfo(transaction: T, config = this.configHelper) {
    const Function_Exception_Detail = {
      function: "verify",
    } as const;
    if (!transaction) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "transaction",
        ...Function_Exception_Detail,
      });
    }

    await this.verifyTransactionBody(transaction, transaction.asset, config);

    const Trs_Exception_Detail = {
      target: "transaction",
      ...Function_Exception_Detail,
    } as const;

    const { baseHelper } = this;

    if (!transaction.signature) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "signature",
        ...Trs_Exception_Detail,
      });
    }

    if (!baseHelper.isValidSignature(transaction.signature)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "signature",
        type: "signature",
        ...Trs_Exception_Detail,
      });
    }

    if (transaction.signSignature) {
      if (!baseHelper.isValidSignature(transaction.signSignature)) {
        throw new ArgumentIllegalException(PROP_IS_INVALID, {
          prop: "signSignature",
          type: "signature",
          ...Trs_Exception_Detail,
        });
      }
    }
  }

  /**
   * 校验签名
   *
   * @param transaction
   */
  async verifySignature(transaction: T) {
    await this.transactionHelper.verifyTransactionSignature(transaction);
  }

  /**
   * 校验交易 remark 大小
   *
   * @param transaction
   */
  verifyRemarkSize(transaction: T) {
    this.transactionHelper.verifyTransactionRemarkSize(transaction);
  }

  verifyTransactionSize(transaction: T) {
    this.transactionHelper.verifyTransactionSize(transaction);
  }

  /**
   * 校验完整交易
   *
   * @param transaction
   */
  async verify(transaction: T, config = this.configHelper) {
    await this.verifyBaseInfo(transaction, config);
    this.verifyRemarkSize(transaction);
    this.verifyTransactionSize(transaction);
    await this.verifySignature(transaction);
  }

  /**
   * 校验金额
   *
   * @param amount
   * @param propName
   * @param Function_Exception_Detail
   */
  checkAssetAmount(
    amount: string,
    propName: string,
    Function_Exception_Detail: FunctionExceptionDetail,
  ) {
    if (!amount) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: propName,
        ...Function_Exception_Detail,
      });
    }

    const { baseHelper } = this;

    if (!baseHelper.isValidAssetNumber(amount)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: propName,
        type: "asset number",
        ...Function_Exception_Detail,
      });
    }

    const minAmount = BigInt(0);
    const inputAmount = BigInt(amount);
    if (minAmount >= inputAmount) {
      throw new ArgumentIllegalException(PROP_SHOULD_GTE_FIELD, {
        prop: propName,
        field: "0",
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 校验交易花费手续费
   *
   * @param fee
   * @param Function_Exception_Detail
   */
  checkTrsBaseFee(fee: string, Function_Exception_Detail: FunctionExceptionDetail) {
    if (!fee) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "fee",
        ...Function_Exception_Detail,
      });
    }

    const { baseHelper } = this;

    if (!baseHelper.isValidAssetNumber(fee)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "fee",
        type: "asset number",
        ...Function_Exception_Detail,
      });
    }

    const inputFee = BigInt(fee);
    const miniUnit = BigInt("0");
    if (miniUnit > inputFee) {
      throw new ArgumentIllegalException(PROP_SHOULD_GTE_FIELD, {
        prop: "fee",
        field: "0",
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 必须是不限定范围
   *
   * @param body
   * @param Function_Exception_Detail
   */
  emptyRangeType(body: BFChainCore.TxBodyJSON, Function_Exception_Detail: FunctionExceptionDetail) {
    if (body.rangeType !== RANGE_TYPE.EMPTY) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "rangeType",
        to_target: "body",
        be_compare_prop: "RANGE_TYPE.EMPTY",
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 链名是否合法
   *
   * @param chainName
   * @param propName
   * @param Function_Exception_Detail
   */
  checkChainName(
    chainName: string,
    propName: string,
    Function_Exception_Detail: FunctionExceptionDetail,
  ) {
    if (!chainName) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: propName,
        ...Function_Exception_Detail,
      });
    }
    if (!this.baseHelper.isValidChainName(chainName)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: propName,
        type: "chain name",
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 链名是否合法
   *
   * @param chainMagic
   * @param propName
   * @param Function_Exception_Detail
   */
  checkChainMagic(
    chainMagic: string,
    propName: string,
    Function_Exception_Detail: FunctionExceptionDetail,
  ) {
    if (!chainMagic) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: propName,
        ...Function_Exception_Detail,
      });
    }
    if (!this.baseHelper.isValidChainMagic(chainMagic)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: propName,
        type: "chain magic",
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 链名是否合法
   *
   * @param assetType
   * @param propName
   * @param Function_Exception_Detail
   */
  checkAssetType(
    assetType: string,
    propName: string,
    Function_Exception_Detail: FunctionExceptionDetail,
  ) {
    if (!assetType) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: propName,
        ...Function_Exception_Detail,
      });
    }
    if (!this.baseHelper.isValidAssetType(assetType)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: propName,
        type: "asset type",
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 交易生效，对账务产生影响
   *
   * @param trs
   * @param event
   */
  async applyTransaction(
    trs: T,
    event: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ): Promise<unknown> {
    const assetInfo = this.chainAssetInfoHelper.getAssetInfo(config.magic, config.assetType);
    await event.emit("fee", {
      type: "fee",
      transaction: trs,
      applyInfo: {
        address: trs.senderId,
        publicKeyBuffer: trs.senderPublicKeyBuffer,
        assetInfo,
        amount: "-" + trs.fee,
        sourceAmount: trs.fee,
      },
    });
    return;
  }

  /**
   * 开始处理事件的钩子
   *
   * @param trs
   * @param event
   */
  beginDealTransaction(trs: T, event: BFChainCore.ApplyTransactionEventEmitter) {
    return event.emit("beginDealTransaction", {
      type: "beginDealTransaction",
      transaction: trs,
      applyInfo: undefined,
    });
  }
  /**
   * 结束处理事件的钩子
   * @param transactionInBlock
   * @param event
   */
  endDealTransaction(
    transactionInBlock: TransactionInBlock<T>,
    event: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    return event.emit("endDealTransaction", { transactionInBlock });
  }

  protected _applyTransactionEmitAsset(
    event: BFChainCore.ApplyTransactionEventEmitter,
    transaction: T,
    amount: string,
    detail: {
      senderId: string;
      senderPublicKeyBuffer: Uint8Array;
      recipientId?: string;
      recipientPublicKeyBuffer?: Uint8Array;
      assetInfo: BFChainCore.AssetInfoJSON;
    },
  ) {
    const tasks = new TaskList();
    tasks.next = event.emit("asset", {
      type: "asset",
      transaction,
      applyInfo: {
        address: detail.senderId,
        publicKeyBuffer: detail.senderPublicKeyBuffer,
        assetInfo: detail.assetInfo,
        amount: "-" + amount,
        sourceAmount: amount,
      },
    });
    if (detail.recipientId) {
      tasks.next = event.emit("asset", {
        type: "asset",
        transaction,
        applyInfo: {
          address: detail.recipientId,
          publicKeyBuffer: detail.recipientPublicKeyBuffer,

          assetInfo: detail.assetInfo,
          amount,
          sourceAmount: amount,
        },
      });
    }
    return tasks.tryToPromise();
  }
}
