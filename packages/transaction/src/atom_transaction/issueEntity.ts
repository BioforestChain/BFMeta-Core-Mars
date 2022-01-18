import { TransactionFactory } from "./_txbase";
import { IssueEntityTransaction, ASSET_STATUS } from "@bfchain/core-model";
import {
  AccountBaseHelper,
  TransactionHelper,
  BaseHelper,
  ConfigHelper,
  ChainAssetInfoHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { Injectable, wrapTaskList } from "@bfchain/util";
import { IssueEntityFactoryTransactionFactory } from "./issueEntityFactory";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "IssueEntityTransactionFactory",
);

/**
 * issueEntity 交易工厂
 *
 */
@Injectable()
export class IssueEntityTransactionFactory extends TransactionFactory<IssueEntityTransaction> {
  constructor(
    public accountBaseHelper: AccountBaseHelper,
    public transactionHelper: TransactionHelper,
    public baseHelper: BaseHelper,
    public configHelper: ConfigHelper,
    public chainAssetInfoHelper: ChainAssetInfoHelper,
    private issueEntityFactoryTransactionFactory: IssueEntityFactoryTransactionFactory,
  ) {
    super();
  }

  /**
   * 校验输入信息
   *
   * @param body
   * @param issueAssetAsset
   * @param config
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    issueEntityAsset: BFChainCore.IssueEntityAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, issueEntityAsset, config);

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
    if (storage.key !== "entityId") {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `storage.key ${storage.key}`,
        to_target: "storage",
        be_compare_prop: "entityId",
        ...Function_Exception_Detail,
      });
    }

    const issueEntity = issueEntityAsset.issueEntity;

    if (!issueEntity) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "issueEntity",
      });
    }

    const IssueEntityAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "issueEntityAsset",
    } as const;

    const { sourceChainName, sourceChainMagic, entityId, entityFactoryPossessor, entityFactory } =
      issueEntity;

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
        to_compare_prop: `sourceChainMagic ${sourceChainName}`,
        to_target: "body",
        be_compare_prop: "local chain magic",
        ...Function_Exception_Detail,
      });
    }

    if (!entityFactoryPossessor) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "entityFactoryPossessor",
        ...Function_Exception_Detail,
      });
    }

    if (!(await this.accountBaseHelper.isAddress(entityFactoryPossessor))) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `entityFactoryPossessor ${entityFactoryPossessor}`,
        type: "account address",
        ...Function_Exception_Detail,
        target: "issueEntity",
      });
    }

    if (body.senderId === entityFactoryPossessor) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_BE, {
        to_compare_prop: `senderId ${body.senderId}`,
        to_target: "body",
        be_compare_prop: `entityFactoryPossessor ${entityFactoryPossessor}`,
        ...Function_Exception_Detail,
      });
    }

    if (recipientId === entityFactoryPossessor) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_BE, {
        to_compare_prop: `recipientId ${recipientId}`,
        to_target: "body",
        be_compare_prop: `entityFactoryPossessor ${entityFactoryPossessor}`,
        ...Function_Exception_Detail,
      });
    }

    if (!entityId) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "entityId",
        ...IssueEntityAsset_Exception_Detail,
      });
    }

    const factoryAndEntity = entityId.split("_");
    if (factoryAndEntity.length !== 2) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `entityId ${entityId}`,
        ...IssueEntityAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidEntityFactoryId(factoryAndEntity[0])) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `factoryId ${factoryAndEntity[0]}`,
        ...IssueEntityAsset_Exception_Detail,
      });
    }

    const len = factoryAndEntity[1].length;
    if (len < 3 || len > 30) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_IN_EXPECTED_RANGE, {
        prop: `entityId ${factoryAndEntity[1]}`,
        type: "string length",
        min: 3,
        max: 30,
        ...IssueEntityAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isLowerCaseLetterOrNumber(factoryAndEntity[1])) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `entityId ${factoryAndEntity[1]}`,
        type: "lowercase or number",
        ...IssueEntityAsset_Exception_Detail,
      });
    }

    if (storage.value !== entityId) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `storage.value ${storage.value}`,
        be_compare_prop: `entityId ${entityId}`,
        to_target: "storage",
        be_target: "issueEntityAsset",
        ...Function_Exception_Detail,
      });
    }

    this.issueEntityFactoryTransactionFactory.verifyIssueEntityFactoryAsset(entityFactory);

    if (factoryAndEntity[0] !== entityFactory.factoryId) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `factoryId ${factoryAndEntity[0]}`,
        be_compare_prop: `factoryId ${entityFactory.factoryId}`,
        to_target: "entityId",
        be_target: "entityFactory",
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 初始化 isuseEntity 交易
   *
   * @param body
   * @param issueEntityAsset
   */
  init(body: BFChainCore.TxBodyJSON, issueEntityAsset: BFChainCore.IssueEntityAssetJSON) {
    const transaction = IssueEntityTransaction.fromObject({
      ...body,
      asset: issueEntityAsset,
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
    transaction: IssueEntityTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);
      const { senderId, recipientId, senderPublicKeyBuffer, signatureBuffer } = transaction;
      const { sourceChainName, sourceChainMagic, entityId, entityFactoryPossessor, entityFactory } =
        transaction.asset.issueEntity;
      const { factoryId, entityFrozenAssetPrealnum, purchaseAssetPrealnum } = entityFactory;
      // 发行 entity
      taskList.next = eventEmitter.emit("issueEntity", {
        type: "issueEntity",
        transaction,
        applyInfo: {
          address: senderId,
          publicKeyBuffer: senderPublicKeyBuffer,
          sourceChainName,
          sourceChainMagic,
          factoryId,
          entityId,
          possessorAddress: recipientId,
          entityFactoryPossessorAddress: entityFactoryPossessor,
          entityFrozenAssetPrealnum,
          issueIdBuffer: signatureBuffer,
          status: ASSET_STATUS.NORMAL,
        },
      });
      const assetInfo = this.chainAssetInfoHelper.getAssetInfo(
        this.configHelper.magic,
        this.configHelper.assetType,
      );
      // 冻结主权益，销毁时赎回
      if (entityFrozenAssetPrealnum !== "0") {
        const minEffectiveHeight =
          this.transactionHelper.getTransactionMinEffectiveHeight(transaction);
        const maxEffectiveHeight = Number.MAX_SAFE_INTEGER;
        taskList.next = eventEmitter.emit("frozenAsset", {
          type: "frozenAsset",
          transaction,
          applyInfo: {
            address: senderId,
            publicKeyBuffer: senderPublicKeyBuffer,
            assetInfo,
            amount: `-${entityFrozenAssetPrealnum}`,
            sourceAmount: entityFrozenAssetPrealnum,
            frozenIdBuffer: signatureBuffer,
            minEffectiveHeight,
            maxEffectiveHeight,
            totalUnfrozenTimes: 1,
          },
        });
      }
      // 付费
      if (purchaseAssetPrealnum !== "0") {
        // 扣除资产
        taskList.next = this._applyTransactionEmitAsset(
          eventEmitter,
          transaction,
          purchaseAssetPrealnum,
          {
            senderId,
            senderPublicKeyBuffer: senderPublicKeyBuffer,
            recipientId: entityFactoryPossessor,
            assetInfo,
          },
        );
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
    transaction: IssueEntityTransaction,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    const { sourceChainMagic, entityFrozenAssetPrealnum, purchaseAssetPrealnum } =
      transaction.asset.issueEntity.entityFactory;
    if (argv.magic === sourceChainMagic && argv.assetType === this.configHelper.assetType) {
      return (BigInt(entityFrozenAssetPrealnum) + BigInt(purchaseAssetPrealnum)).toString();
    }
    return "0";
  }
}
