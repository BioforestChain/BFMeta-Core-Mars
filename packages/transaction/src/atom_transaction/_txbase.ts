import type {
  TransactionHelper,
  ChainAssetInfoHelper,
  AccountBaseHelper,
  BaseHelper,
  ConfigHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import {
  Transaction,
  RANGE_TYPE,
  TransactionInBlock,
  PARENT_ASSET_TYPE,
} from "@bfchain/core-model";
import { wrapTaskList } from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator("CONTROLLER", "_txbase");

type FunctionExceptionDetail = {
  target: string;
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
    if (!keypair) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "keypair",
      });
    }

    const Keypair_Exception_Detail = {
      target: "keypair",
    } as const;

    if (!keypair.publicKey) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "publicKey",
        ...Keypair_Exception_Detail,
      });
    }

    if (!keypair.secretKey) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
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
    if (!keypair) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "keypair",
      });
    }

    const Keypair_Exception_Detail = {
      target: "keypair",
    } as const;

    if (!keypair.publicKey) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "publicKey",
        ...Keypair_Exception_Detail,
      });
    }

    if (!keypair.secretKey) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
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
    if (!body) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "body",
      });
    }

    if (!asset) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "asset",
      });
    }

    const TransactionBody_Exception_Detail = {
      target: "body",
    } as const;

    const { baseHelper, accountBaseHelper } = this;

    if (!baseHelper.isPositiveInteger(body.version)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "version",
        ...TransactionBody_Exception_Detail,
      });
    }

    if (!body.type) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "type",
        ...TransactionBody_Exception_Detail,
      });
    }

    if (!baseHelper.isValidTransactionType(body.type)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "type",
        type: "transaction type",
        ...TransactionBody_Exception_Detail,
      });
    }

    if (!body.senderId) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "senderId",
        ...TransactionBody_Exception_Detail,
      });
    }

    if (!(await accountBaseHelper.isAddress(body.senderId))) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `senderId ${body.senderId}`,
        type: "account address",
        ...TransactionBody_Exception_Detail,
      });
    }

    if (!body.senderPublicKey) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "senderPublicKey",
        ...TransactionBody_Exception_Detail,
      });
    }

    if (!baseHelper.isValidPublicKey(body.senderPublicKey)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `senderPublicKey ${body.senderPublicKey}`,
        type: "account publicKey",
        ...TransactionBody_Exception_Detail,
      });
    }

    const address = await accountBaseHelper.getAddressFromPublicKeyString(body.senderPublicKey);
    if (body.senderId !== address) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `senderId ${body.senderId}`,
        be_compare_prop: `publicKey => address ${address}`,
        to_target: "senderPublicKey",
        be_target: "body",
        ...TransactionBody_Exception_Detail,
      });
    }

    if (body.senderSecondPublicKey) {
      if (!baseHelper.isValidPublicKey(body.senderSecondPublicKey)) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: `senderSecondPublicKey ${body.senderSecondPublicKey}`,
          type: "account publicKey",
          ...TransactionBody_Exception_Detail,
        });
      }
    }

    if (body.recipientId !== undefined) {
      if (!(await accountBaseHelper.isAddress(body.recipientId))) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: `recipientId ${body.recipientId}`,
          type: "account address",
          ...TransactionBody_Exception_Detail,
        });
      }
    }

    if (!(await this.baseHelper.isValidRange(body.rangeType, body.range))) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `range ${body.rangeType}`,
        type: "transaction range",
        ...TransactionBody_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(body.timestamp)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `timestamp ${body.timestamp}`,
        type: "natural number",
        ...TransactionBody_Exception_Detail,
      });
    }

    const applyBlockHeight = body.applyBlockHeight;
    if (!baseHelper.isPositiveInteger(applyBlockHeight)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `applyBlockHeight ${applyBlockHeight}`,
        type: "positive integer",
        ...TransactionBody_Exception_Detail,
      });
    }

    const effectiveBlockHeight = body.effectiveBlockHeight;
    if (!baseHelper.isPositiveInteger(effectiveBlockHeight)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `effectiveBlockHeight ${effectiveBlockHeight}`,
        type: "positive integer",
        ...TransactionBody_Exception_Detail,
      });
    }

    if (effectiveBlockHeight < applyBlockHeight) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_GTE_FIELD, {
        prop: `effectiveBlockHeight ${effectiveBlockHeight}`,
        field: applyBlockHeight,
        ...TransactionBody_Exception_Detail,
      });
    }

    const { maxApplyAndConfirmedBlockHeightDiff } = config;
    const maxEffectiveBlockHeight = applyBlockHeight + maxApplyAndConfirmedBlockHeightDiff;
    if (effectiveBlockHeight > maxEffectiveBlockHeight) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_LTE_FIELD, {
        prop: `effectiveBlockHeight ${effectiveBlockHeight}`,
        field: maxEffectiveBlockHeight,
        ...TransactionBody_Exception_Detail,
      });
    }

    // 校验花费手续费
    this.checkTrsBaseFee(body.fee, TransactionBody_Exception_Detail);

    if (!body.fromMagic) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "fromMagic",
        ...TransactionBody_Exception_Detail,
      });
    }

    if (!baseHelper.isValidChainMagic(body.fromMagic)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `fromMagic ${body.fromMagic}`,
        type: "chain magic",
        ...TransactionBody_Exception_Detail,
      });
    }

    if (!body.toMagic) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "toMagic",
        ...TransactionBody_Exception_Detail,
      });
    }

    if (!baseHelper.isValidChainMagic(body.toMagic)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `toMagic ${body.toMagic}`,
        type: "chain magic",
        ...TransactionBody_Exception_Detail,
      });
    }

    if (body.sourceIP !== undefined) {
      if (!baseHelper.isIp(body.sourceIP)) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: `sourceIP ${body.sourceIP}`,
          type: "ip",
          ...TransactionBody_Exception_Detail,
        });
      }
    }

    if (body.dappid !== undefined) {
      if (!baseHelper.isValidDAppId(body.dappid)) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: `dappid ${body.dappid}`,
          type: "dappid",
          ...TransactionBody_Exception_Detail,
        });
      }
    }

    if (body.lns !== undefined) {
      if (!baseHelper.isValidLocationName(body.lns, config.chainName)) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: `lns ${body.lns}`,
          type: "location name",
          ...TransactionBody_Exception_Detail,
        });
      }
    }

    const remark = body.remark;
    if (!remark) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "remark",
        ...TransactionBody_Exception_Detail,
      });
    }
    if (baseHelper.getVariableType(remark) !== "[object Object]") {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "remark",
        ...TransactionBody_Exception_Detail,
      });
    }
    for (const key in remark) {
      if (!baseHelper.isString(remark[key])) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
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
    if (!transaction) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "transaction",
      });
    }

    await this.verifyTransactionBody(transaction, transaction.asset, config);

    const Trs_Exception_Detail = {
      target: "transaction",
    } as const;

    const { baseHelper } = this;

    if (!transaction.signature) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "signature",
        ...Trs_Exception_Detail,
      });
    }

    if (!baseHelper.isValidSignature(transaction.signature)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `signature ${transaction.signature}`,
        type: "signature",
        ...Trs_Exception_Detail,
      });
    }

    if (transaction.signSignature) {
      if (!baseHelper.isValidSignature(transaction.signSignature)) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: `signSignature ${transaction.signSignature}`,
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

  verifyTransactionSize(transaction: T) {
    this.transactionHelper.verifyTransactionSize(transaction);
  }

  verifyTransactionBlobSize(transaction: T) {
    this.transactionHelper.verifyTransactionBlobSize(transaction);
  }
  /**
   * 校验完整交易
   *
   * @param transaction
   */
  async verify(transaction: T, config = this.configHelper) {
    await this.verifyBaseInfo(transaction, config);
    this.verifyTransactionSize(transaction);
    this.verifyTransactionBlobSize(transaction);
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
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: propName,
        ...Function_Exception_Detail,
      });
    }

    const { baseHelper } = this;

    if (!baseHelper.isValidAssetNumber(amount)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `${propName} ${amount}`,
        type: "asset number",
        ...Function_Exception_Detail,
      });
    }

    const minAmount = BigInt(0);
    const inputAmount = BigInt(amount);
    if (minAmount >= inputAmount) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_GT_FIELD, {
        prop: `${propName} ${amount}`,
        field: "0",
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 校验权益数
   *
   * @param assetPrealnum
   * @param propName
   * @param Function_Exception_Detail
   */
  checkAssetPrealnum(
    assetPrealnum: any,
    propName: string,
    Function_Exception_Detail: FunctionExceptionDetail,
  ) {
    this.checkBaseAssetPrealnum(Function_Exception_Detail, propName, assetPrealnum);
    this.isAssetPrealnumGtZero(assetPrealnum, propName, Function_Exception_Detail);
  }

  /**
   * 校验基础权益数
   *
   * @param assetPrealnum
   * @param propName
   * @param Function_Exception_Detail
   */
  checkBaseAssetPrealnum(
    assetPrealnum: any,
    propName: string,
    Function_Exception_Detail: FunctionExceptionDetail,
  ) {
    if (!assetPrealnum) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: propName,
        ...Function_Exception_Detail,
      });
    }

    const { baseHelper } = this;

    if (!baseHelper.isValidAssetNumber(assetPrealnum)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `${propName} ${assetPrealnum}`,
        type: "asset prealnum",
        ...Function_Exception_Detail,
      });
    }

    const minAssetPrealnum = BigInt(0);
    const formatAssetPrealnum = BigInt(assetPrealnum);
    if (minAssetPrealnum > formatAssetPrealnum) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_GTE_FIELD, {
        prop: `${propName} ${assetPrealnum}`,
        field: "0",
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 权益数是否大于 0
   *
   * @param assetPrealnum
   * @param propName
   * @param Function_Exception_Detail
   */
  isAssetPrealnumGtZero(
    assetPrealnum: string,
    propName: string,
    Function_Exception_Detail: FunctionExceptionDetail,
  ) {
    if (assetPrealnum === "0") {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_GT_FIELD, {
        prop: `${propName} ${assetPrealnum}`,
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
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "fee",
        ...Function_Exception_Detail,
      });
    }

    const { baseHelper } = this;

    if (!baseHelper.isValidAssetNumber(fee)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `fee ${fee}`,
        type: "asset number",
        ...Function_Exception_Detail,
      });
    }

    const inputFee = BigInt(fee);
    const miniUnit = BigInt("0");
    if (miniUnit > inputFee) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_GTE_FIELD, {
        prop: `fee ${fee}`,
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
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `rangeType ${body.rangeType}`,
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
    chainName: any,
    propName: string,
    Function_Exception_Detail: FunctionExceptionDetail,
  ) {
    if (!chainName) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: propName,
        ...Function_Exception_Detail,
      });
    }
    if (!this.baseHelper.isValidChainName(chainName)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `${propName} ${chainName}`,
        type: "chain name",
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 链网络标识符是否合法
   *
   * @param chainMagic
   * @param propName
   * @param Function_Exception_Detail
   */
  checkChainMagic(
    chainMagic: any,
    propName: string,
    Function_Exception_Detail: FunctionExceptionDetail,
  ) {
    if (!chainMagic) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: propName,
        ...Function_Exception_Detail,
      });
    }
    if (!this.baseHelper.isValidChainMagic(chainMagic)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `${propName} ${chainMagic}`,
        type: "chain magic",
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 资产大类是否合法
   *
   * @param parentAssetType
   * @param propName
   * @param Function_Exception_Detail
   */
  checkParentAssetType(
    parentAssetType: any,
    propName: string,
    Function_Exception_Detail: FunctionExceptionDetail,
  ) {
    if (!parentAssetType) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: propName,
        ...Function_Exception_Detail,
      });
    }
    if (!PARENT_ASSET_TYPE[parentAssetType]) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `${propName} ${parentAssetType}`,
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 同质权益名是否合法
   *
   * @param assetType
   * @param propName
   * @param Function_Exception_Detail
   */
  checkAsset(assetType: any, propName: string, Function_Exception_Detail: FunctionExceptionDetail) {
    if (!assetType) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: propName,
        ...Function_Exception_Detail,
      });
    }
    if (!this.baseHelper.isValidAssetType(assetType)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `${propName} ${assetType}`,
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * dappid 是否合法
   *
   * @param dappid
   * @param propName
   * @param Function_Exception_Detail
   */
  checkDAppId(dappid: any, propName: string, Function_Exception_Detail: FunctionExceptionDetail) {
    if (!dappid) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: propName,
        ...Function_Exception_Detail,
      });
    }
    if (!this.baseHelper.isValidDAppId(dappid)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `${propName} ${dappid}`,
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * locationName 是否合法
   *
   * @param locationName
   * @param propName
   * @param Function_Exception_Detail
   */
  checkLocationName(
    locationName: any,
    propName: string,
    Function_Exception_Detail: FunctionExceptionDetail,
  ) {
    if (!locationName) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: propName,
        ...Function_Exception_Detail,
      });
    }
    if (!this.baseHelper.isValidLocationName(locationName)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `${propName} ${locationName}`,
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * entity factory id 是否合法
   *
   * @param factoryId
   * @param propName
   * @param Function_Exception_Detail
   */
  checkEntityFactoryId(
    factoryId: any,
    propName: string,
    Function_Exception_Detail: FunctionExceptionDetail,
  ) {
    if (!factoryId) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: propName,
        ...Function_Exception_Detail,
      });
    }
    if (!this.baseHelper.isValidEntityFactoryId(factoryId)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `${propName} ${factoryId}`,
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * entity id 是否合法
   *
   * @param entityId
   * @param propName
   * @param Function_Exception_Detail
   */
  checkEntityId(
    entityId: any,
    propName: string,
    Function_Exception_Detail: FunctionExceptionDetail,
  ) {
    if (!entityId) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: propName,
        ...Function_Exception_Detail,
      });
    }
    if (!this.baseHelper.isValidEntityId(entityId)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `${propName} ${entityId}`,
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * certificate id 是否合法
   *
   * @param certificateId
   * @param propName
   * @param Function_Exception_Detail
   */
  checkCertificateId(
    certificateId: any,
    propName: string,
    Function_Exception_Detail: FunctionExceptionDetail,
  ) {
    if (!certificateId) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: propName,
        ...Function_Exception_Detail,
      });
    }
    if (!this.baseHelper.isValidCertificateId(certificateId)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `${propName} ${certificateId}`,
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 资产名是否合法
   *
   * @param parentAssetType
   * @param assetType
   * @param propName
   * @param Function_Exception_Detail
   * @returns
   */
  checkAssetType(
    parentAssetType: BFChainCore.PARENT_ASSET_TYPE,
    assetType: any,
    propName: string,
    Function_Exception_Detail: FunctionExceptionDetail,
  ) {
    if (parentAssetType === PARENT_ASSET_TYPE.ASSETS) {
      this.checkAsset(assetType, propName, Function_Exception_Detail);
      return;
    }
    if (parentAssetType === PARENT_ASSET_TYPE.DAPP) {
      this.checkDAppId(assetType, propName, Function_Exception_Detail);
      return;
    }
    if (parentAssetType === PARENT_ASSET_TYPE.LOCATION_NAME) {
      this.checkLocationName(assetType, propName, Function_Exception_Detail);
      return;
    }
    if (parentAssetType === PARENT_ASSET_TYPE.ENTITY) {
      this.checkEntityId(assetType, propName, Function_Exception_Detail);
      return;
    }
    if (parentAssetType === PARENT_ASSET_TYPE.CERTIFICATE) {
      this.checkCertificateId(assetType, propName, Function_Exception_Detail);
      return;
    }
    throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
      prop: `parentAssetType ${parentAssetType}`,
      ...Function_Exception_Detail,
    });
  }

  /**
   * 校验纳税信息
   *
   * @param taxInformation
   * @param Function_Exception_Detail
   */
  async checkTaxInformation(
    Function_Exception_Detail: FunctionExceptionDetail,
    taxInformation?: BFChainCore.TaxInformationJson,
  ) {
    if (!taxInformation) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "taxInformation",
        ...Function_Exception_Detail,
      });
    }
    const { taxCollector, taxAssetPrealnum } = taxInformation;
    if (!taxCollector) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "taxInformation.taxCollector",
        ...Function_Exception_Detail,
      });
    }
    if (!(await this.accountBaseHelper.isAddress(taxCollector))) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `taxInformation.taxCollector ${taxCollector}`,
        ...Function_Exception_Detail,
      });
    }
    if (!taxAssetPrealnum) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "taxInformation.taxAssetPrealnum",
        ...Function_Exception_Detail,
      });
    }
    if (!this.baseHelper.isValidAssetPrealnum(taxAssetPrealnum)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `taxInformation.taxAssetPrealnum ${taxAssetPrealnum}`,
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
    await event.emit("count", {
      type: "count",
      transaction: trs,
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
    return wrapTaskList((taskList) => {
      taskList.next = event.emit("asset", {
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
        taskList.next = event.emit("asset", {
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
    transaction: T,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    return "0";
  }
}
