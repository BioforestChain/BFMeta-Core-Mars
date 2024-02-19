import { TransactionFactory } from "./_txbase";
import { IncreaseAssetTransaction, PARENT_ASSET_TYPE } from "@bfchain/core-model";
import {
  AccountBaseHelper,
  TransactionHelper,
  BaseHelper,
  ConfigHelper,
  ChainAssetInfoHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { Injectable, wrapTaskList } from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "IncreaseAssetTransactionFactory",
);

/**
 * increaseAsset 交易工厂
 *
 */
@Injectable()
export class IncreaseAssetTransactionFactory extends TransactionFactory<IncreaseAssetTransaction> {
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
   * @param increaseAssetAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    increaseAssetAsset: BFChainCore.IncreaseAssetAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, increaseAssetAsset, config);

    const Function_Exception_Detail = {
      target: "body",
    } as const;

    this.emptyRangeType(body, Function_Exception_Detail);

    const { baseHelper } = this;

    const recipientId = body.recipientId;

    if (!body.recipientId) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "recipientId",
        ...Function_Exception_Detail,
      });
    }

    if (body.senderId === recipientId) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_BE, {
        to_compare_prop: `senderId ${body.senderId}`,
        to_target: "body",
        be_compare_prop: `recipientId ${recipientId}`,
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
    if (storage.key !== "assetType") {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `storage.key ${storage.key}`,
        to_target: "storage",
        be_compare_prop: "assetType",
        ...Function_Exception_Detail,
      });
    }

    const increaseAsset = increaseAssetAsset.increaseAsset;

    if (!increaseAsset) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "increaseAsset",
      });
    }

    const IncreaseAssetAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "increaseAssetAsset",
    } as const;

    const {
      sourceChainName,
      sourceChainMagic,
      assetType,
      increasedAssetPrealnum,
      frozenMainAssetPrealnum,
    } = increaseAsset;

    this.checkChainName(sourceChainName, "sourceChainName", IncreaseAssetAsset_Exception_Detail);
    if (sourceChainName !== config.chainName) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `sourceChainName ${sourceChainName}`,
        to_target: "body",
        be_compare_prop: "local chain name",
        ...Function_Exception_Detail,
      });
    }

    this.checkChainMagic(sourceChainMagic, "sourceChainMagic", IncreaseAssetAsset_Exception_Detail);
    if (sourceChainMagic !== config.magic) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `sourceChainMagic ${sourceChainMagic}`,
        to_target: "body",
        be_compare_prop: "local chain magic",
        ...Function_Exception_Detail,
      });
    }

    this.checkAssetType(
      PARENT_ASSET_TYPE.ASSETS,
      assetType,
      "assetType",
      IncreaseAssetAsset_Exception_Detail,
    );
    if (assetType === config.assetType) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_BE, {
        to_compare_prop: `assetType ${assetType}`,
        to_target: "body",
        be_compare_prop: "local chain assetType",
        ...Function_Exception_Detail,
      });
    }

    if (storage.value !== assetType) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `storage.value ${storage.value}`,
        be_compare_prop: `assetType ${assetType}`,
        to_target: "storage",
        be_target: "increaseAsset",
        ...Function_Exception_Detail,
      });
    }

    if (!increasedAssetPrealnum) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "increasedAssetPrealnum",
        ...IncreaseAssetAsset_Exception_Detail,
      });
    }
    if (!baseHelper.isValidAssetNumber(increasedAssetPrealnum)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `increasedAssetPrealnum ${increasedAssetPrealnum}`,
        type: "asset number",
        ...IncreaseAssetAsset_Exception_Detail,
      });
    }
    if (BigInt(increasedAssetPrealnum) <= BigInt(0)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_GT_FIELD, {
        prop: "increasedAssetPrealnum",
        field: "0",
        ...IncreaseAssetAsset_Exception_Detail,
      });
    }

    if (!frozenMainAssetPrealnum) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "frozenMainAssetPrealnum",
        ...IncreaseAssetAsset_Exception_Detail,
      });
    }
    if (!baseHelper.isValidAssetNumber(frozenMainAssetPrealnum)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `frozenMainAssetPrealnum ${frozenMainAssetPrealnum}`,
        type: "asset number",
        ...IncreaseAssetAsset_Exception_Detail,
      });
    }
  }

  /**
   * 初始化 increaseAsset 交易
   *
   * @param body
   * @param increaseAsset
   */
  init(body: BFChainCore.TxBodyJSON, increaseAsset: BFChainCore.IncreaseAssetAssetJSON) {
    const transaction = IncreaseAssetTransaction.fromObject({
      ...body,
      asset: increaseAsset,
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
    transaction: IncreaseAssetTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);
      const { senderId, recipientId, senderPublicKeyBuffer } = transaction;
      const {
        sourceChainName,
        sourceChainMagic,
        assetType,
        increasedAssetPrealnum,
        frozenMainAssetPrealnum,
      } = transaction.asset.increaseAsset;
      const assetInfo = this.chainAssetInfoHelper.getAssetInfo(
        sourceChainName,
        sourceChainMagic,
        assetType,
      );
      // 增发同质资产
      taskList.next = eventEmitter.emit("increaseAsset", {
        type: "increaseAsset",
        transaction,
        applyInfo: {
          address: senderId,
          applyAddress: recipientId,
          publicKeyBuffer: senderPublicKeyBuffer,
          sourceChainName,
          assetInfo,
          amount: increasedAssetPrealnum,
          sourceAmount: increasedAssetPrealnum,
          frozenMainAssetPrealnum,
        },
      });
      const mainAssetInfo = this.chainAssetInfoHelper.getAssetInfo(
        config.chainName,
        config.magic,
        config.assetType,
      );
      // 扣除主权益
      taskList.next = this._applyTransactionEmitAsset(
        eventEmitter,
        transaction,
        frozenMainAssetPrealnum,
        {
          senderId: transaction.senderId,
          senderPublicKeyBuffer: transaction.senderPublicKeyBuffer,
          recipientId: transaction.recipientId,
          assetInfo: mainAssetInfo,
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
    transaction: IncreaseAssetTransaction,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    const { sourceChainMagic, assetType, increasedAssetPrealnum } = transaction.asset.increaseAsset;
    if (argv.magic === sourceChainMagic && argv.assetType === assetType) {
      return increasedAssetPrealnum;
    }
    return "0";
  }
}
