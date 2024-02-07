import { Injectable, wrapTaskList } from "@bfchain/util";
import { IssueEntityMultiTransaction, ASSET_STATUS, FROZEN_REASON } from "@bfchain/core-model";
import {
  AccountBaseHelper,
  TransactionHelper,
  BaseHelper,
  ConfigHelper,
  ChainAssetInfoHelper,
  JSBIHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { TransactionFactory } from "./_txbase";
import { IssueEntityFactoryTransactionFactory } from "./issueEntityFactory";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "IssueEntityMultiTransactionV1",
);

/**
 * issueEntityMulti 交易工厂
 *
 */
@Injectable()
export class IssueEntityMultiTransactionFactory extends TransactionFactory<IssueEntityMultiTransaction> {
  constructor(
    public accountBaseHelper: AccountBaseHelper,
    public transactionHelper: TransactionHelper,
    public baseHelper: BaseHelper,
    public configHelper: ConfigHelper,
    public chainAssetInfoHelper: ChainAssetInfoHelper,
    public jsbiHelper: JSBIHelper,
    public issueEntityFactoryTransactionFactory: IssueEntityFactoryTransactionFactory,
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
    issueEntityMultiAsset: BFChainCore.IssueEntityMultiAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, issueEntityMultiAsset, config);

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
    if (storage.key !== "factoryId") {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `storage.key ${storage.key}`,
        to_target: "storage",
        be_compare_prop: "factoryId",
        ...Function_Exception_Detail,
      });
    }

    const issueEntityMulti = issueEntityMultiAsset.issueEntityMulti;

    if (!issueEntityMulti) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "issueEntityMulti",
      });
    }

    const IssueEntityMultiAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "issueEntityMultiAsset",
    } as const;

    const {
      sourceChainName,
      sourceChainMagic,
      entityStructList,
      entityFactoryPossessor,
      entityFactory,
    } = issueEntityMulti;

    this.issueEntityFactoryTransactionFactory.verifyIssueEntityFactoryAsset(entityFactory);

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
        target: "issueEntityMulti",
      });
    }

    const numberOfEntities = entityStructList.length;
    if (!(baseHelper.isArray(entityStructList) && numberOfEntities > 0)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `entityStructList ${JSON.stringify(entityStructList)}`,
        ...Function_Exception_Detail,
        target: "issueEntityMulti",
      });
    }

    const factoryId = entityFactory.factoryId;
    const entityIdSet = new Set<string>();
    for (const { entityId, taxAssetPrealnum } of entityStructList) {
      if (!entityId) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
          prop: "entityId",
          ...IssueEntityMultiAsset_Exception_Detail,
        });
      }
      entityIdSet.add(entityId);
      const factoryAndEntity = entityId.split("_");
      if (factoryAndEntity.length !== 3) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: `entityId ${entityId}`,
          target: "issueEntityMulti.entityStructList",
        });
      }

      if (factoryAndEntity[0] !== "m") {
        throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `entityId first item ${factoryAndEntity[0]}`,
          be_compare_prop: "m",
          to_target: "issueEntityMulti.entityStructList",
        });
      }

      if (!baseHelper.isValidEntityFactoryId(factoryAndEntity[1])) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: `factoryId ${factoryAndEntity[0]}`,
          target: "issueEntityMulti.entityStructList",
        });
      }

      if (factoryAndEntity[1] !== factoryId) {
        throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `factoryId ${factoryAndEntity[1]}`,
          be_compare_prop: `factoryId ${factoryId}`,
          to_target: "entityId",
          be_target: "entityFactory",
          ...Function_Exception_Detail,
        });
      }

      const len = factoryAndEntity[2].length;
      if (len < 3 || len > 30) {
        throw new ArgumentIllegalException(ERROR_LIST.NOT_IN_EXPECTED_RANGE, {
          prop: `entityId ${factoryAndEntity[2]}`,
          min: 3,
          max: 30,
          target: "issueEntityMulti.entityStructList",
        });
      }

      if (!baseHelper.isLowerCaseLetterOrNumber(factoryAndEntity[2])) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: `entityId ${factoryAndEntity[2]}`,
          target: "issueEntityMulti.entityStructList",
        });
      }

      if (!taxAssetPrealnum) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
          prop: "taxAssetPrealnum",
          target: "issueEntityMulti.entityStructList",
        });
      }

      if (!this.baseHelper.isValidAssetPrealnum(taxAssetPrealnum)) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: `taxAssetPrealnum ${taxAssetPrealnum}`,
          target: `issueEntityMulti.entityStructList ${entityId}`,
        });
      }
    }

    if (entityIdSet.size < numberOfEntities) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_DUPLICATE, {
        prop: `entityStructList ${JSON.stringify(entityStructList)}`,
        target: "issueEntityMulti",
      });
    }

    if (storage.value !== factoryId) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `storage.value ${storage.value}`,
        be_compare_prop: `factoryId ${factoryId}`,
        to_target: "storage",
        be_target: "issueEntityMultiAsset",
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 初始化 isuseEntityMulti 交易
   *
   * @param body
   * @param issueEntityMultiAsset
   */
  init(body: BFChainCore.TxBodyJSON, issueEntityMultiAsset: BFChainCore.IssueEntityMultiAssetJSON) {
    const transaction = IssueEntityMultiTransaction.fromObject({
      ...body,
      asset: issueEntityMultiAsset,
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
    transaction: IssueEntityMultiTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      const { senderId, recipientId, senderPublicKeyBuffer, signature, fee } = transaction;
      const {
        sourceChainName,
        sourceChainMagic,
        entityStructList,
        entityFactoryPossessor,
        entityFactory,
      } = transaction.asset.issueEntityMulti;
      const { factoryId, entityFrozenAssetPrealnum, purchaseAssetPrealnum } = entityFactory;
      // 扣除手续费并且统计交易数量
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);

      // 发行 entity
      taskList.next = eventEmitter.emit("issueEntityMulti", {
        type: "issueEntityMulti",
        transaction,
        applyInfo: {
          address: senderId,
          publicKeyBuffer: senderPublicKeyBuffer,
          sourceChainName,
          sourceChainMagic,
          factoryId,
          entityStructList,
          possessorAddress: recipientId,
          entityFactoryPossessorAddress: entityFactoryPossessor,
          entityFrozenAssetPrealnum,
          issueId: signature,
          status: ASSET_STATUS.NORMAL,
        },
      });
      const numberOfEntities = entityStructList.length;
      // 冻结主权益，销毁时赎回
      const assetInfo = this.chainAssetInfoHelper.getAssetInfo(config.magic, config.assetType);
      if (entityFrozenAssetPrealnum !== "0") {
        const sourceAmount = (
          BigInt(entityFrozenAssetPrealnum) * BigInt(numberOfEntities)
        ).toString();
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
            amount: `-${sourceAmount}`,
            sourceAmount,
            minEffectiveHeight,
            maxEffectiveHeight,
            totalUnfrozenTimes: numberOfEntities,
            frozenId: signature,
            frozenReason: FROZEN_REASON.ENTITY,
          },
        });
      }
      /// 就算是 purchaseAssetPrealnum 0，也要让 entityFactoryPossessor 出现在 assetChange 里面
      // 付费
      taskList.next = this._applyTransactionEmitAsset(
        eventEmitter,
        transaction,
        (BigInt(purchaseAssetPrealnum) * BigInt(numberOfEntities)).toString(),
        {
          senderId,
          senderPublicKeyBuffer: senderPublicKeyBuffer,
          recipientId: entityFactoryPossessor,
          assetInfo,
        },
      );
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
    transaction: IssueEntityMultiTransaction,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    const { entityStructList, entityFactory } = transaction.asset.issueEntityMulti;
    const { sourceChainMagic, entityFrozenAssetPrealnum, purchaseAssetPrealnum } = entityFactory;
    if (argv.magic === sourceChainMagic && argv.assetType === this.configHelper.assetType) {
      const len = entityStructList.length;
      return (
        BigInt(entityFrozenAssetPrealnum) * BigInt(len) +
        BigInt(purchaseAssetPrealnum) * BigInt(len)
      ).toString();
    }
    return "0";
  }
}
