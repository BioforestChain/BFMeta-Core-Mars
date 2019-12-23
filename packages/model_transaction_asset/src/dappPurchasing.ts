import { Message, Field, Type } from "@bfchain/protobuf";
import { DAppModel } from "./dapp";

/**
 * dappPurchasing 交易 asset 模型
 *
 */
@Type.d("DAppPurchasingModel")
export class DAppPurchasingModel extends Message<DAppPurchasingModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.DAppPurchasingJSON> {
  static INC = 1;
  /**dapp 的拥有者地址 */
  @Field.d(DAppPurchasingModel.INC++, "string")
  dappPossessor!: string;
  /**要购买的 dapp 数据 */
  @Field.d(DAppPurchasingModel.INC++, DAppModel)
  dappAsset!: DAppModel;
  toJSON() {
    return {
      dappPossessor: this.dappPossessor,
      dappAsset: this.dappAsset.toJSON(),
    };
  }
}

/**
 * dappPurchasing 交易 asset 外层模型
 *
 */
@Type.d("DAppPurchasingAssetModel")
export class DAppPurchasingAssetModel extends Message<DAppPurchasingAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.DAppPurchasingAssetJSON> {
  @Field.d(1, DAppPurchasingModel)
  dappPurchasing!: DAppPurchasingModel;
  toJSON() {
    return {
      dappPurchasing: this.dappPurchasing.toJSON(),
    };
  }
}
