import { TransactionFactory } from "./_txbase";
import { IssueAssetTransaction, ACCOUNT_STATUS } from "@bfchain/core-model";
import {
  AccountBaseHelper,
  TransactionHelper,
  BaseHelper,
  ConfigHelper,
  ChainAssetInfoHelper,
} from "@bfchain/core-helper";
import {
  CoreExceptionGenerator,
  PARAM_LOST,
  PROP_IS_REQUIRE,
  PROP_IS_INVALID,
  NOT_IN_EXPECTED_RANGE,
  SHOULD_BE,
  SHOULD_NOT_BE,
  NOT_MATCH,
  PROP_SHOULD_GT_FIELD,
} from "@bfchain/core-util-exception";
import { Injectable, wrapTaskList } from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "IssueAssetTransactionFactory",
);

/**
 * issueAsset 交易工厂
 *
 */
@Injectable()
export class IssueAssetTransactionFactory extends TransactionFactory<IssueAssetTransaction> {
  constructor(
    public accountBaseHelper: AccountBaseHelper,
    public transactionHelper: TransactionHelper,
    public baseHelper: BaseHelper,
    public configHelper: ConfigHelper,
    public chainAssetInfoHelper: ChainAssetInfoHelper,
  ) {
    super();
  }

  /**
   * 校验输入信息
   * 要验证 issueAsset 交易的基础信息是否合法和 asset 信息是否存在
   * 交易的手续费必须大于 0
   * 交易的 rangeType 必须是 empty
   * 必须携带交易的接收者账户，并且不能是交易的发起账户地址，并且是数字资产的创世账户地址
   * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
   * 必须携带查询用的索引存储
   * key 值必须是 "assetType" value 值必须是设定的值
   * asset 是完整的 issueAsset 信息
   * 需要携带合法的资产所属链名称,并且是本链
   * 需要携带合法的资产所属链的网络标识符,并且是本链
   * 需要携带合法的资产缩写：3-5 位 大小写字母组成的字符串
   * 需要携带合法的预计发行资产信息
   * 需要携带合法的资产创世账户地址
   * 资产的创世账户地址不能是交易的发起账户
   * 资产的创世账户地址必须和交易的接收账户地址一致
   *
   * @param body
   * @param issueAssetAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    issueAssetAsset: BFChainCore.IssueAssetAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, issueAssetAsset, config);

    const Function_Exception_Detail = {
      target: "body",
      function: "verifyTransactionBody",
    } as const;

    this.emptyRangeType(body, Function_Exception_Detail);

    const { baseHelper } = this;

    const recipientId = body.recipientId;

    if (!body.recipientId) {
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
    if (storage.key !== "assetType") {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `storage.key ${storage.key}`,
        to_target: "storage",
        be_compare_prop: "assetType",
        ...Function_Exception_Detail,
      });
    }

    const issueAsset = issueAssetAsset.issueAsset;

    if (!issueAsset) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "issueAsset",
        function: "verifyTransactionBody",
      });
    }

    const IssueAssetAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "issueAssetAsset",
    } as const;

    const { sourceChainName, sourceChainMagic, assetType, expectedIssuedAssets } = issueAsset;

    this.checkChainName(sourceChainName, "sourceChainName", IssueAssetAsset_Exception_Detail);

    if (sourceChainName !== config.chainName) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `sourceChainName ${sourceChainName}`,
        to_target: "body",
        be_compare_prop: "local chain name",
        ...Function_Exception_Detail,
      });
    }

    this.checkChainMagic(sourceChainMagic, "sourceChainMagic", IssueAssetAsset_Exception_Detail);

    if (sourceChainMagic !== config.magic) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `sourceChainMagic ${sourceChainName}`,
        to_target: "body",
        be_compare_prop: "local chain magic",
        ...Function_Exception_Detail,
      });
    }

    if (!assetType) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "assetType",
        ...IssueAssetAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isUpperCaseLetter(assetType)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `assetType ${assetType}`,
        type: "uppercase",
        ...IssueAssetAsset_Exception_Detail,
      });
    }

    const len = assetType.length;
    if (len < 3 || len > 5) {
      throw new ArgumentIllegalException(NOT_IN_EXPECTED_RANGE, {
        prop: `assetType ${assetType}`,
        type: "string length",
        min: 3,
        max: 5,
        ...IssueAssetAsset_Exception_Detail,
      });
    }

    if (storage.value !== assetType) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: `storage.value ${storage.value}`,
        be_compare_prop: `assetType ${assetType}`,
        to_target: "storage",
        be_target: "issueAsset",
        ...Function_Exception_Detail,
      });
    }

    if (!expectedIssuedAssets) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "expectedIssuedAssets",
        ...IssueAssetAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidAssetNumber(expectedIssuedAssets)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `expectedIssuedAssets ${expectedIssuedAssets}`,
        type: "asset number",
        ...IssueAssetAsset_Exception_Detail,
      });
    }

    if (BigInt(expectedIssuedAssets) <= BigInt(0)) {
      throw new ArgumentIllegalException(PROP_SHOULD_GT_FIELD, {
        prop: "expectedIssuedAssets",
        field: "0",
        ...IssueAssetAsset_Exception_Detail,
      });
    }
  }

  /**
   * 初始化 issueAsset 交易
   *
   * @param body
   * @param issueAsset
   */
  init(body: BFChainCore.TxBodyJSON, issueAsset: BFChainCore.IssueAssetAssetJSON) {
    const transaction = IssueAssetTransaction.fromObject({
      ...body,
      asset: issueAsset,
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
    transaction: IssueAssetTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);
      const { senderId, recipientId, senderPublicKeyBuffer } = transaction;
      const { sourceChainName, sourceChainMagic, assetType, expectedIssuedAssets } =
        transaction.asset.issueAsset;
      // 冻结发起账户
      taskList.next = eventEmitter.emit("frozenAccount", {
        type: "frozenAccount",
        transaction,
        applyInfo: {
          address: senderId,
          publicKeyBuffer: senderPublicKeyBuffer,
          accountStatus: ACCOUNT_STATUS.FROZEN_OUT,
        },
      });
      const assetInfo = this.chainAssetInfoHelper.getAssetInfo(sourceChainMagic, assetType);
      // 发行数字资产
      taskList.next = eventEmitter.emit("issueAsset", {
        type: "issueAsset",
        transaction,
        applyInfo: {
          address: senderId,
          genesisAddress: recipientId,
          publicKeyBuffer: senderPublicKeyBuffer,
          sourceChainName,
          assetInfo,
          amount: expectedIssuedAssets,
          sourceAmount: expectedIssuedAssets,
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
    transaction: IssueAssetTransaction,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    const { sourceChainMagic, assetType, expectedIssuedAssets } = transaction.asset.issueAsset;
    if (argv.magic === sourceChainMagic && argv.assetType === assetType) {
      return expectedIssuedAssets;
    }
    return "0";
  }
}
