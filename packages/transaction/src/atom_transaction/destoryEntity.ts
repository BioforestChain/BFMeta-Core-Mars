import { TransactionFactory } from "./_txbase";
import { DestoryEntityTransaction, ASSET_STATUS, PARENT_ASSET_TYPE } from "@bfchain/core-model";
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
  SHOULD_BE,
  NOT_MATCH,
  PROP_IS_INVALID,
} from "@bfchain/core-util-exception";
import { Injectable, wrapTaskList } from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "DestoryEntityTransactionFactory",
);

/**
 * destoryEntity 交易工厂
 *
 */
@Injectable()
export class DestoryEntityTransactionFactory extends TransactionFactory<DestoryEntityTransaction> {
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
   *
   * @param body
   * @param destoryEntityAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    destoryEntityAsset: BFChainCore.DestoryEntityAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, destoryEntityAsset, config);

    const Function_Exception_Detail = {
      target: "body",
      function: "verifyTransactionBody",
    } as const;

    this.emptyRangeType(body, Function_Exception_Detail);

    if (!body.recipientId) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "recipientId",
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
    if (storage.key !== "entityId") {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `storage.key ${storage.key}`,
        to_target: "storage",
        be_compare_prop: "entityId",
        ...Function_Exception_Detail,
      });
    }

    const destoryEntity = destoryEntityAsset.destoryEntity;

    if (!destoryEntity) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "destoryEntity",
        function: "verifyTransactionBody",
      });
    }

    const DestoryEntityAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "destoryAssetAsset",
    } as const;

    const {
      sourceChainMagic,
      sourceChainName,
      entityId,
      entityFrozenAssetPrealnum,
      transactionSignature,
    } = destoryEntity;

    if (sourceChainName !== config.chainName) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "sourceChainName",
        to_target: "body",
        be_compare_prop: "local chain name",
        ...DestoryEntityAsset_Exception_Detail,
      });
    }

    if (sourceChainMagic !== config.magic) {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: "sourceChainMagic",
        to_target: "body",
        be_compare_prop: "local chain magic",
        ...DestoryEntityAsset_Exception_Detail,
      });
    }

    const baseHelper = this.baseHelper;

    if (!entityId) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "entityId",
        ...DestoryEntityAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidEntityId(entityId)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `entityId ${entityId}`,
        type: "entityId",
        ...DestoryEntityAsset_Exception_Detail,
      });
    }

    if (storage.value !== entityId) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: `storage.value ${storage.value}`,
        be_compare_prop: `entityId ${entityId}`,
        to_target: "storage",
        be_target: "destoryEntity",
        ...Function_Exception_Detail,
      });
    }

    if (!entityFrozenAssetPrealnum) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "entityFrozenAssetPrealnum",
        ...DestoryEntityAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidAssetPrealnum(entityFrozenAssetPrealnum)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `entityFrozenAssetPrealnum ${entityFrozenAssetPrealnum}`,
        type: "string number",
        ...DestoryEntityAsset_Exception_Detail,
      });
    }

    if (!transactionSignature) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "transactionSignature",
        ...DestoryEntityAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidTransactionSignature(transactionSignature)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `transactionSignature ${transactionSignature}`,
        type: "transaction signature",
        ...DestoryEntityAsset_Exception_Detail,
      });
    }
  }

  /**
   * 初始化 destoryEntity 交易
   *
   * @param body
   * @param destoryEntity
   */
  init(body: BFChainCore.TxBodyJSON, destoryEntity: BFChainCore.DestoryEntityAssetJSON) {
    const transaction = DestoryEntityTransaction.fromObject({
      ...body,
      asset: destoryEntity,
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
    transaction: DestoryEntityTransaction,
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
        entityFrozenAssetPrealnum,
        transactionSignatureBuffer,
      } = transaction.asset.destoryEntity;
      // 销毁 entity
      taskList.next = eventEmitter.emit("destoryEntity", {
        type: "destoryEntity",
        transaction,
        applyInfo: {
          address: senderId,
          publicKeyBuffer: senderPublicKeyBuffer,
          sourceChainMagic,
          sourceChainName,
          entityId,
          entityFrozenAssetPrealnum,
          frozenIdBuffer: transactionSignatureBuffer,
          status: ASSET_STATUS.DESTORY,
        },
      });
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
            frozenIdBuffer: transactionSignatureBuffer,
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
    transaction: DestoryEntityTransaction,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    const { sourceChainMagic, entityFrozenAssetPrealnum } = transaction.asset.destoryEntity;
    if (argv.magic === sourceChainMagic && argv.assetType === this.configHelper.assetType) {
      return entityFrozenAssetPrealnum;
    }
    return "0";
  }
}
