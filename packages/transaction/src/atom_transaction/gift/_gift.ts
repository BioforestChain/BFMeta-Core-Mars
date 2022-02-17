import {
  GiftAnyTransaction,
  GiftAssetTransaction,
  NewTransactionRefuseReason,
} from "@bfchain/core-model";
import { TransactionFactory } from "../_txbase";
import {
  AccountBaseHelper,
  TransactionHelper,
  BaseHelper,
  ConfigHelper,
  ChainAssetInfoHelper,
  JSBIHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { Injectable } from "@bfchain/util";

const { ArgumentIllegalException } = CoreExceptionGenerator("CONTROLLER", "GiftTransactionFactory");

/**
 * gift 交易工厂
 *
 */
@Injectable()
export abstract class GiftTransactionFactory<
  T extends GiftAssetTransaction | GiftAnyTransaction,
> extends TransactionFactory<T> {
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

  /**
   * 校验输入信息
   *
   * @param body
   * @param asset
   */
  async commonVerifyTransactionBody(
    body: BFChainCore.TxBodyJSON,
    asset: BFChainCore.GetTransactionAssetJSON<T>,
    config = this.configHelper,
  ) {
    await super.verifyTransactionBody(body, asset, config);

    const Function_Exception_Detail = {
      target: "body",
    } as const;

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
    if (storage.key !== "assetType") {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `storage.key ${storage.key}`,
        to_target: "storage",
        be_compare_prop: "assetType",
        ...Function_Exception_Detail,
      });
    }

    return storage;
  }

  checkTransactionFee(fee: string, totalGrabableTimes: number, config = this.configHelper) {
    const { maxTransactionSize, minTransactionFeePerByte } = config;
    const byteLength = maxTransactionSize * (totalGrabableTimes + 1);
    const feePerByte = {
      numerator: BigInt(fee),
      denominator: byteLength,
    };
    const result = this.jsbiHelper.compareFraction(feePerByte, minTransactionFeePerByte);
    if (result < 0) {
      // 赠送交易默认按照最大交易体付手续费
      const minFee = this.jsbiHelper
        .multiplyCeilFraction(feePerByte.denominator, minTransactionFeePerByte)
        .toString();
      throw new ArgumentIllegalException(ERROR_LIST.TRANSACTION_FEE_NOT_ENOUGH, {
        errorId: NewTransactionRefuseReason.TRANSACTION_FEE_NOT_ENOUGH,
        minFee: minFee.toString(),
        target: "body",
      });
    }
  }

  abstract init(body: BFChainCore.TxBodyJSON, giftAsset: BFChainCore.GetTransactionAssetJSON<T>): T;
}
