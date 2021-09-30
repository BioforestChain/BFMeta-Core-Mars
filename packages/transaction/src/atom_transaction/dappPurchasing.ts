import { TransactionFactory } from "./_txbase";
import { DAppPurchasingTransaction, DAPP_TYPE } from "@bfchain/core-model";
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
  NOT_MATCH,
  PROP_IS_REQUIRE,
  SHOULD_BE,
  SHOULD_NOT_BE,
} from "@bfchain/core-util-exception";
import { DAppTransactionFactory } from "./dapp";
import { Injectable, wrapTaskList } from "@bfchain/util";
const { ArgumentIllegalException } = CoreExceptionGenerator(
  "CONTROLLER",
  "DAppPurchasingTransactionFactory",
);

/**
 * dappPurchasing 交易工厂
 *
 */
@Injectable()
export class DAppPurchasingTransactionFactory extends TransactionFactory<DAppPurchasingTransaction> {
  constructor(
    public accountBaseHelper: AccountBaseHelper,
    public transactionHelper: TransactionHelper,
    public baseHelper: BaseHelper,
    public configHelper: ConfigHelper,
    public chainAssetInfoHelper: ChainAssetInfoHelper,
    private dappTransactionFactory: DAppTransactionFactory,
  ) {
    super();
  }

  /**
   * 校验输入信息
   *
   * @param body
   * @param dappPurchasingAsset
   */
  async verifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    dappPurchasingAsset: BFChainCore.DAppPurchasingAssetJSON,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, dappPurchasingAsset, config);

    const Function_Exception_Detail = {
      target: "body",
      function: "verifyTransactionBody",
    } as const;

    this.emptyRangeType(body, Function_Exception_Detail);

    const recipientId = body.recipientId;
    if (!recipientId) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "recipientId",
        ...Function_Exception_Detail,
      });
    }
    // if (body.senderId === recipientId) {
    //   throw new ArgumentIllegalException(SHOULD_NOT_BE, {
    //     to_compare_prop: "senderId",
    //     to_target: "body",
    //     be_compare_prop: "recipientId",
    //     ...Function_Exception_Detail,
    //   });
    // }

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
    if (storage.key !== "dappid") {
      throw new ArgumentIllegalException(SHOULD_BE, {
        to_compare_prop: `storage.key ${storage.key}`,
        to_target: "storage",
        be_compare_prop: "dappid",
        ...Function_Exception_Detail,
      });
    }

    const dappPurchasing = dappPurchasingAsset.dappPurchasing;

    if (!dappPurchasing) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "dappPurchasing",
        function: "verifyTransactionBody",
      });
    }

    const DappPurchasingAsset_Exception_Detail = {
      ...Function_Exception_Detail,
      target: "dappPurchasingAsset",
    } as const;

    const { dappAsset } = dappPurchasing;

    this.dappTransactionFactory.verifyDAppAsset(dappAsset);

    if (storage.value !== dappAsset.dappid) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: `storage.value ${storage.value}`,
        be_compare_prop: `dappid ${dappAsset.dappid}`,
        to_target: "storage",
        be_target: "dapp",
        ...DappPurchasingAsset_Exception_Detail,
      });
    }

    if (dappAsset.type !== DAPP_TYPE.PAID_APP) {
      throw new ArgumentIllegalException(SHOULD_NOT_BE, {
        to_compare_prop: `type ${dappAsset.type}`,
        to_target: "dappAsset",
        be_compare_prop: DAPP_TYPE.PAID_APP,
        ...DappPurchasingAsset_Exception_Detail,
      });
    }
  }

  /**
   * 初始化 dappPurchasing 交易
   *
   * @param body
   * @param dappPurchasingAsset
   */
  init(body: BFChainCore.TxBodyJSON, dappPurchasingAsset: BFChainCore.DAppPurchasingAssetJSON) {
    const transaction = DAppPurchasingTransaction.fromObject({
      ...body,
      asset: dappPurchasingAsset,
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
    transaction: DAppPurchasingTransaction,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
    config = this.configHelper,
  ) {
    return wrapTaskList((taskList) => {
      taskList.next = super.applyTransaction(transaction, eventEmitter, config);
      const { magic, assetType } = config;
      const { purchaseAsset } = transaction.asset.dappPurchasing.dappAsset;

      const assetInfo = this.chainAssetInfoHelper.getAssetInfo(magic, assetType);
      // 扣除资产
      taskList.next = this._applyTransactionEmitAsset(
        eventEmitter,
        transaction,
        purchaseAsset as string,
        {
          senderId: transaction.senderId,
          senderPublicKeyBuffer: transaction.senderPublicKeyBuffer,
          recipientId: transaction.recipientId,
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
    transaction: DAppPurchasingTransaction,
    argv = {
      magic: this.configHelper.magic,
      assetType: this.configHelper.assetType,
    },
  ) {
    const { sourceChainMagic, purchaseAsset } = transaction.asset.dappPurchasing.dappAsset;
    if (argv.magic === sourceChainMagic && argv.assetType === this.configHelper.assetType) {
      return purchaseAsset || "0";
    }
    return "0";
  }
}
