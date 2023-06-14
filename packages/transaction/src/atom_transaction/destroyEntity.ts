import { TransactionFactory } from "./_txbase";
import { DestroyEntityTransaction, ASSET_STATUS } from "@bfchain/core-model";
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
  "DestroyEntityTransactionFactory",
);

/**
 * destroyEntity 交易工厂
 *
 */
@Injectable()
export class DestroyEntityTransactionFactory extends TransactionFactory<DestroyEntityTransaction> {
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
   * @param destroyEntityAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    destroyEntityAsset: BFChainCore.DestroyEntityAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, destroyEntityAsset, config);

    const Function_Exception_Detail = {
      target: "body",
    } as const;

    this.emptyRangeType(body, Function_Exception_Detail);

    if (!body.recipientId) {
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

    const destroyEntity = destroyEntityAsset.destroyEntity;

    if (!destroyEntity) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "destroyEntity",
      });
    }

    const DestroyEntityAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "destroyAssetAsset",
    } as const;

    const {
      sourceChainMagic,
      sourceChainName,
      entityId,
      entityFactoryApplicant,
      entityFactoryPossessor,
      entityFactory,
      transactionSignature,
    } = destroyEntity;

    if (sourceChainName !== config.chainName) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: "sourceChainName",
        to_target: "body",
        be_compare_prop: "local chain name",
        ...DestroyEntityAsset_Exception_Detail,
      });
    }

    if (sourceChainMagic !== config.magic) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: "sourceChainMagic",
        to_target: "body",
        be_compare_prop: "local chain magic",
        ...DestroyEntityAsset_Exception_Detail,
      });
    }

    const baseHelper = this.baseHelper;

    if (!entityId) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "entityId",
        ...DestroyEntityAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidEntityId(entityId)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `entityId ${entityId}`,
        type: "entityId",
        ...DestroyEntityAsset_Exception_Detail,
      });
    }

    if (storage.value !== entityId) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `storage.value ${storage.value}`,
        be_compare_prop: `entityId ${entityId}`,
        to_target: "storage",
        be_target: "destroyEntity",
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
        target: "destroyEntity",
      });
    }

    if (!entityFactoryApplicant) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "entityFactoryApplicant",
        ...Function_Exception_Detail,
      });
    }

    if (!(await this.accountBaseHelper.isAddress(entityFactoryApplicant))) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `entityFactoryApplicant ${entityFactoryApplicant}`,
        type: "account address",
        ...Function_Exception_Detail,
        target: "destroyEntity",
      });
    }

    this.issueEntityFactoryTransactionFactory.verifyIssueEntityFactoryAsset(entityFactory);

    const factoryId = this.transactionHelper.getFactoryIdByEntityId(entityId);
    if (factoryId !== entityFactory.factoryId) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `factoryId ${factoryId}`,
        be_compare_prop: `factoryId ${entityFactory.factoryId}`,
        to_target: "entityId",
        be_target: "entityFactory",
        ...Function_Exception_Detail,
      });
    }

    if (!transactionSignature) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "transactionSignature",
        ...DestroyEntityAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidTransactionSignature(transactionSignature)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `transactionSignature ${transactionSignature}`,
        type: "transaction signature",
        ...DestroyEntityAsset_Exception_Detail,
      });
    }
  }

  /**
   * 初始化 destroyEntity 交易
   *
   * @param body
   * @param destroyEntity
   */
  init(body: BFChainCore.TxBodyJSON, destroyEntity: BFChainCore.DestroyEntityAssetJSON) {
    const transaction = DestroyEntityTransaction.fromObject({
      ...body,
      asset: destroyEntity,
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
    transaction: DestroyEntityTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);
      const { senderId, senderPublicKeyBuffer, recipientId } = transaction;
      const {
        sourceChainMagic,
        sourceChainName,
        entityId,
        entityFactoryApplicant,
        entityFactoryPossessor,
        entityFactory,
        transactionSignature,
      } = transaction.asset.destroyEntity;
      // 销毁 entity
      taskList.next = eventEmitter.emit("destroyEntity", {
        type: "destroyEntity",
        transaction,
        applyInfo: {
          address: senderId,
          publicKeyBuffer: senderPublicKeyBuffer,
          sourceChainMagic,
          sourceChainName,
          entityId,
          entityFactoryApplicantAddress: entityFactoryApplicant,
          entityFactoryPossessorAddress: entityFactoryPossessor,
          entityFactory: entityFactory.toJSON(),
          frozenId: transactionSignature,
          status: ASSET_STATUS.DESTROY,
        },
      });
      const entityFrozenAssetPrealnum = entityFactory.entityFrozenAssetPrealnum;
      if (entityFrozenAssetPrealnum !== "0") {
        // 赎回链资产
        const assetInfo = this.chainAssetInfoHelper.getAssetInfo(
          this.configHelper.magic,
          this.configHelper.assetType,
        );
        taskList.next = eventEmitter.emit("unfrozenAsset", {
          type: "unfrozenAsset",
          transaction,
          applyInfo: {
            address: transaction.senderId,
            publicKeyBuffer: transaction.senderPublicKeyBuffer,
            assetInfo,
            amount: entityFrozenAssetPrealnum,
            sourceAmount: entityFrozenAssetPrealnum,
            frozenId: transactionSignature,
            recipientId, // 资产冻结账户
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
    transaction: DestroyEntityTransaction,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    const { sourceChainMagic, entityFactory } = transaction.asset.destroyEntity;
    if (argv.magic === sourceChainMagic && argv.assetType === this.configHelper.assetType) {
      return entityFactory.entityFrozenAssetPrealnum;
    }
    return "0";
  }
}
