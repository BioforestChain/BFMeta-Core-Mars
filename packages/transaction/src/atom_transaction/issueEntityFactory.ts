import { TransactionFactory } from "./_txbase";
import { IssueEntityFactoryTransaction, ACCOUNT_STATUS, ASSET_STATUS } from "@bfchain/core-model";
import {
  AccountBaseHelper,
  TransactionHelper,
  BaseHelper,
  ConfigHelper,
  ChainAssetInfoHelper,
  JSBIHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { Injectable, wrapTaskList } from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "IssueEntityFactoryTransactionFactory",
);

/**
 * issueEntiryFactory 交易工厂
 *
 */
@Injectable()
export class IssueEntityFactoryTransactionFactory extends TransactionFactory<IssueEntityFactoryTransaction> {
  constructor(
    public accountBaseHelper: AccountBaseHelper,
    public transactionHelper: TransactionHelper,
    public baseHelper: BaseHelper,
    public configHelper: ConfigHelper,
    public chainAssetInfoHelper: ChainAssetInfoHelper,
    public jsbiHelper: JSBIHelper,
  ) {
    super();
  }

  async commonVerifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    issueEntityFactoryAssetJSON: BFChainCore.IssueEntityFactoryAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, issueEntityFactoryAssetJSON, config);

    const Function_Exception_Detail = {
      target: "body",
    } as const;

    this.emptyRangeType(body, Function_Exception_Detail);

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

    if (storage.key !== "factoryId") {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `storage.key ${storage.key}`,
        to_target: "storage",
        be_compare_prop: "factoryId",
        ...Function_Exception_Detail,
      });
    }

    const issueEntityFactory = issueEntityFactoryAssetJSON.issueEntityFactory;

    this.verifyIssueEntityFactoryAsset(issueEntityFactory, config);

    if (storage.value !== issueEntityFactory.factoryId) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `storage.value ${storage.value}`,
        be_compare_prop: `factoryId ${issueEntityFactory.factoryId}`,
        to_target: "storage",
        be_target: "dapp",
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 校验输入信息
   *
   * @param body
   * @param dappAsset
   * @param config
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    issueEntityFactoryAssetJSON: BFChainCore.IssueEntityFactoryAssetJSON,
    config = this.configHelper,
  ) {
    await this.commonVerifyTransactionBody(body, issueEntityFactoryAssetJSON, config);

    if (body.senderId === body.recipientId) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_BE, {
        to_compare_prop: `senderId ${body.senderId}`,
        to_target: "body",
        be_compare_prop: `recipientId ${body.recipientId}`,
        target: "body",
      });
    }
  }

  verifyIssueEntityFactoryAsset(
    issueEntityFactory: BFChainCore.IssueEntityFactoryJSON,
    config = this.configHelper,
  ) {
    const { baseHelper } = this;

    const Function_Exception_Detail = {
      target: "body",
    } as const;

    if (!issueEntityFactory) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "issueEntityFactory",
        ...Function_Exception_Detail,
      });
    }

    const IssueEntityFactoryAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "issueEntityFactory",
    } as const;

    const {
      sourceChainMagic,
      sourceChainName,
      factoryId,
      entityPrealnum,
      entityFrozenAssetPrealnum,
      purchaseAssetPrealnum,
    } = issueEntityFactory;

    if (sourceChainName !== config.chainName) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `sourceChainName ${sourceChainName}`,
        to_target: "body",
        be_compare_prop: "local chain name",
        ...Function_Exception_Detail,
      });
    }

    if (sourceChainMagic !== config.magic) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `sourceChainMagic ${sourceChainMagic}`,
        to_target: "body",
        be_compare_prop: "local chain magic",

        ...Function_Exception_Detail,
      });
    }

    if (!factoryId) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "factoryId",
        ...IssueEntityFactoryAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isString(factoryId)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `factoryId ${factoryId}`,
        type: "string",
        ...IssueEntityFactoryAsset_Exception_Detail,
      });
    }

    const len = factoryId.length;
    if (len < 3 || len > 15) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_IN_EXPECTED_RANGE, {
        prop: `factoryId ${factoryId}`,
        type: "string length",
        min: 3,
        max: 15,
        ...IssueEntityFactoryAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isLowerCaseLetterOrNumber(factoryId)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `factoryId ${factoryId}`,
        type: "lowercase letter or number",
        ...IssueEntityFactoryAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveStringNumber(entityPrealnum)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `entityPrealnum ${entityPrealnum}`,
        type: "positive integer",
        IssueEntityFactoryAsset_Exception_Detail,
      });
    }

    if (!entityFrozenAssetPrealnum) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "entityFrozenAssetPrealnum",
        ...IssueEntityFactoryAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidAssetPrealnum(entityFrozenAssetPrealnum)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `entityFrozenAssetPrealnum ${entityFrozenAssetPrealnum}`,
        type: "string number",
        ...IssueEntityFactoryAsset_Exception_Detail,
      });
    }

    if (!purchaseAssetPrealnum) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "purchaseAssetPrealnum",
        ...IssueEntityFactoryAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidAssetPrealnum(purchaseAssetPrealnum)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `purchaseAssetPrealnum ${purchaseAssetPrealnum}`,
        type: "string number",
        ...IssueEntityFactoryAsset_Exception_Detail,
      });
    }
  }

  /**
   * 初始化 issueEntityFactory 交易
   *
   * @param body
   * @param issueEntityFactoryAsset
   */
  async init(
    body: BFChainCore.TxBodyJSON,
    issueEntityFactoryAsset: BFChainCore.IssueEntityFactoryAssetJSON,
  ) {
    const transaction = IssueEntityFactoryTransaction.fromObject({
      ...body,
      asset: issueEntityFactoryAsset,
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
  async applyTransaction(
    transaction: IssueEntityFactoryTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);
      const {
        sourceChainName,
        sourceChainMagic,
        factoryId,
        entityPrealnum,
        entityFrozenAssetPrealnum,
        purchaseAssetPrealnum,
      } = transaction.asset.issueEntityFactory;
      // 冻结发起账户
      taskList.next = eventEmitter.emit("frozenAccount", {
        type: "frozenAccount",
        transaction,
        applyInfo: {
          address: transaction.senderId,
          publicKeyBuffer: transaction.senderPublicKeyBuffer,
          accountStatus: ACCOUNT_STATUS.FROZEN_OUT,
        },
      });
      // 发行 entityFactory
      taskList.next = eventEmitter.emit("issueEntityFactoryByFrozen", {
        type: "issueEntityFactoryByFrozen",
        transaction,
        applyInfo: {
          address: transaction.senderId,
          publicKeyBuffer: transaction.senderPublicKeyBuffer,
          sourceChainName,
          sourceChainMagic,
          factoryId,
          entityPrealnum,
          entityFrozenAssetPrealnum,
          possessorAddress: transaction.recipientId,
          purchaseAssetPrealnum,
          status: ASSET_STATUS.NORMAL,
        },
      });
    });
  }
}
