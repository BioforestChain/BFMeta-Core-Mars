import { TransactionFactory } from "./_txbase";
import { FROZEN_REASON, StakeAssetTransaction } from "@bfchain/core-model";
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
  "StakeAssetTransactionFactory",
);

/**
 * stakeAsset 交易工厂
 *
 */
@Injectable()
export class StakeAssetTransactionFactory extends TransactionFactory<StakeAssetTransaction> {
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
   * @param stakeAssetAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    stakeAssetAsset: BFChainCore.StakeAssetAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, stakeAssetAsset, config);

    const Function_Exception_Detail = {
      target: "body",
    } as const;

    this.emptyRangeType(body, Function_Exception_Detail);

    if (body.recipientId) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_NOT_EXIST, {
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
    if (storage.key !== "stakeId") {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `storage.key ${storage.key}`,
        to_target: "storage",
        be_compare_prop: "stakeId",
        ...Function_Exception_Detail,
      });
    }

    const stakeAsset = stakeAssetAsset.stakeAsset;

    if (!stakeAsset) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "stakeAsset",
      });
    }

    const StakeAssetAsset_Exception_Detail = {
      target: "stakeAssetAsset",
    } as const;

    const { baseHelper } = this;

    const { stakeId, sourceChainName, sourceChainMagic, assetType, assetPrealnum, unstakeHeight } =
      stakeAsset;

    if (baseHelper.isValidStakeId(stakeId) === false) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `stakeId ${stakeId}`,
        ...StakeAssetAsset_Exception_Detail,
      });
    }

    if (sourceChainMagic === this.configHelper.magic) {
      this.checkChainName(sourceChainName, "sourceChainName", StakeAssetAsset_Exception_Detail);

      this.checkChainMagic(sourceChainMagic, "sourceChainMagic", StakeAssetAsset_Exception_Detail);

      this.checkAsset(assetType, "assetType", StakeAssetAsset_Exception_Detail);
    }

    this.checkAssetAmount(assetPrealnum, "assetPrealnum", StakeAssetAsset_Exception_Detail);

    if (assetPrealnum === "0") {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_GT_FIELD, {
        prop: `assetPrealnum ${assetPrealnum}`,
        fueld: "0",
        ...StakeAssetAsset_Exception_Detail,
      });
    }

    if (baseHelper.isPositiveInteger(unstakeHeight) === false) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `unstakeHeight ${unstakeHeight}`,
        ...StakeAssetAsset_Exception_Detail,
      });
    }

    if (stakeAsset.unstakeHeight <= body.applyBlockHeight) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_GT_FIELD, {
        prop: `unstakeHeight ${stakeAsset.unstakeHeight}`,
        fueld: body.applyBlockHeight,
        target: "stakeAssetAsset",
      });
    }

    if (storage.value !== stakeAsset.stakeId) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `storage.value ${storage.value}`,
        be_compare_prop: `stakeId ${stakeAsset.stakeId}`,
        to_target: "storage",
        be_target: "stakeAsset",
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 初始化 stakeAsset 交易
   *
   * @param body
   * @param stakeAssetAsset
   */
  init(body: BFChainCore.TxBodyJSON, stakeAssetAsset: BFChainCore.StakeAssetAssetJSON) {
    const transaction = StakeAssetTransaction.fromObject({
      ...body,
      asset: stakeAssetAsset,
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
    transaction: StakeAssetTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);
      const { senderId, senderPublicKeyBuffer } = transaction;
      const { stakeId, assetType, sourceChainMagic, assetPrealnum, unstakeHeight } =
        transaction.asset.stakeAsset;
      const assetInfo = this.chainAssetInfoHelper.getAssetInfo(sourceChainMagic, assetType);
      // 冻结发起账户用于交换的资产
      taskList.next = eventEmitter.emit("frozenAsset", {
        type: "frozenAsset",
        transaction,
        applyInfo: {
          address: senderId,
          publicKeyBuffer: senderPublicKeyBuffer,
          assetInfo,
          amount: `-${assetPrealnum}`,
          sourceAmount: assetPrealnum,
          minEffectiveHeight: unstakeHeight,
          maxEffectiveHeight: this.transactionHelper.getTransactionMaxEffectiveHeight(transaction),
          frozenId: this.transactionHelper.getStakeSaveId(stakeId, senderId),
          frozenReason: FROZEN_REASON.STAKE,
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
    transaction: StakeAssetTransaction,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    const { sourceChainMagic, assetType, assetPrealnum } = transaction.asset.stakeAsset;
    if (argv.magic === sourceChainMagic && argv.assetType === assetType) {
      return assetPrealnum;
    }
    return "0";
  }
}
