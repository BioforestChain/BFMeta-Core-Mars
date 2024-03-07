import { TransactionFactory } from "./_txbase";
import { FROZEN_REASON, UnstakeAssetTransaction } from "@bfchain/core-model";
import {
  AccountBaseHelper,
  TransactionHelper,
  BaseHelper,
  ConfigHelper,
  ChainAssetInfoHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { Injectable, wrapTaskList } from "@bfchain/util";
import { StakeAssetTransactionFactory } from "./stakeAsset";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "UnstakeAssetTransactionFactory",
);

/**
 * unstakeAsset 交易工厂
 *
 */
@Injectable()
export class UnstakeAssetTransactionFactory extends TransactionFactory<UnstakeAssetTransaction> {
  constructor(
    public accountBaseHelper: AccountBaseHelper,
    public transactionHelper: TransactionHelper,
    public baseHelper: BaseHelper,
    public configHelper: ConfigHelper,
    public chainAssetInfoHelper: ChainAssetInfoHelper,
    private stakeAssetTransactionFactory: StakeAssetTransactionFactory,
  ) {
    super();
  }

  /**
   * 校验输入信息
   *
   * @param body
   * @param UnstakeAssetAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    UnstakeAssetAsset: BFChainCore.UnstakeAssetAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, UnstakeAssetAsset, config);

    const Function_Exception_Detail = {
      target: "body",
    } as const;

    this.emptyRangeType(body, Function_Exception_Detail);

    const { baseHelper, accountBaseHelper } = this;

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

    const unstakeAsset = UnstakeAssetAsset.unstakeAsset;

    if (!unstakeAsset) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "unstakeAsset",
      });
    }

    const UnstakeAssetAsset_Exception_Detail = {
      target: "unstakeAssetAsset",
    } as const;

    const { stakeId, sourceChainName, sourceChainMagic, assetType, assetPrealnum } = unstakeAsset;

    if (baseHelper.isValidStakeId(stakeId) === false) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `stakeId ${stakeId}`,
        ...UnstakeAssetAsset_Exception_Detail,
      });
    }

    if (sourceChainMagic === this.configHelper.magic) {
      this.checkChainName(sourceChainName, "sourceChainName", UnstakeAssetAsset_Exception_Detail);

      this.checkChainMagic(
        sourceChainMagic,
        "sourceChainMagic",
        UnstakeAssetAsset_Exception_Detail,
      );

      this.checkAsset(assetType, "assetType", UnstakeAssetAsset_Exception_Detail);
    }

    this.checkAssetAmount(assetPrealnum, "assetPrealnum", UnstakeAssetAsset_Exception_Detail);

    if (assetPrealnum === "0") {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_GT_FIELD, {
        prop: `assetPrealnum ${assetPrealnum}`,
        fueld: "0",
        ...UnstakeAssetAsset_Exception_Detail,
      });
    }

    if (storage.value !== stakeId) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `storage.value ${storage.value}`,
        be_compare_prop: `stakeId ${stakeId}`,
        to_target: "storage",
        be_target: "unstakeAsset",
        ...Function_Exception_Detail,
      });
    }

    this.checkAssetAmount(assetPrealnum, "assetPrealnum", UnstakeAssetAsset_Exception_Detail);

    if (assetPrealnum === "0") {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_GT_FIELD, {
        prop: `assetPrealnum ${assetPrealnum}`,
        fueld: "0",
        ...UnstakeAssetAsset_Exception_Detail,
      });
    }
  }

  /**
   * 初始化 UnstakeAsset 交易
   *
   * @param body
   * @param UnstakeAssetAsset
   */
  init(body: BFChainCore.TxBodyJSON, UnstakeAssetAsset: BFChainCore.UnstakeAssetAssetJSON) {
    const transaction = UnstakeAssetTransaction.fromObject({
      ...body,
      asset: UnstakeAssetAsset,
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
    transaction: UnstakeAssetTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);
      const { senderId } = transaction;
      const { stakeId, sourceChainName, sourceChainMagic, assetType, assetPrealnum } =
        transaction.asset.unstakeAsset;
      const assetInfo = this.chainAssetInfoHelper.getAssetInfo(
        sourceChainName,
        sourceChainMagic,
        assetType,
      );
      // 扣除解除质押的资产
      taskList.next = eventEmitter.emit("unstakeAsset", {
        type: "unstakeAsset",
        transaction,
        applyInfo: {
          address: senderId,
          publicKeyBuffer: transaction.senderPublicKeyBuffer,
          assetInfo,
          amount: assetPrealnum,
          sourceAmount: assetPrealnum,
          stakeId,
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
    transaction: UnstakeAssetTransaction,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    const { sourceChainMagic, assetType, assetPrealnum } = transaction.asset.unstakeAsset;
    if (argv.magic === sourceChainMagic && argv.assetType === assetType) {
      return assetPrealnum;
    }
    return "0";
  }
}
