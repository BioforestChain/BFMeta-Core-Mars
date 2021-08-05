import { Message, Field, Type } from "@bfchain/protobuf";
import { DAppModel } from "./dapp";

/**
 * dappPurchasing 交易 asset 模型
 *
 */
@Type.d("DAppPurchasingModel")
export class DAppPurchasingModel
  extends Message<DAppPurchasingModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.DAppPurchasingJSON>
{
  static INC = 1;
  /**要购买的 dapp 数据 */
  @Field.d(DAppPurchasingModel.INC++, DAppModel)
  dappAsset!: DAppModel;
  toJSON() {
    return {
      dappAsset: this.dappAsset.toJSON(),
    };
  }
}

/**
 * dappPurchasing 交易 asset 外层模型
 *
 */
@Type.d("DAppPurchasingAssetModel")
export class DAppPurchasingAssetModel
  extends Message<DAppPurchasingAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.DAppPurchasingAssetJSON>
{
  @Field.d(1, DAppPurchasingModel)
  dappPurchasing!: DAppPurchasingModel;
  toJSON() {
    return {
      dappPurchasing: this.dappPurchasing.toJSON(),
    };
  }
}
