import { Message, Field, Type } from "@bfchain/protobuf";
import { DAPP_TYPE } from "@bfchain/core-model-constants";

@Type.d("DAppPurchaseAssetModel")
export class DAppPurchaseAssetModel extends Message<DAppPurchaseAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.DAppPurchaseAssetJSON> {
  /**购买用的资产所属链名 */
  @Field.d(1, "string")
  sourceChainName!: string;
  /**购买用的资产所属链网络标识符 */
  @Field.d(2, "string")
  sourceChainMagic!: string;
  /**购买用的资产所属链网络标识符 */
  @Field.d(3, "string")
  assetType!: string;
  /**购买用的资产所属链网络标识符 */
  @Field.d(4, "string")
  amount!: string;
  toJSON() {
    return {
      sourceChainName: this.sourceChainName,
      sourceChainMagic: this.sourceChainMagic,
      assetType: this.assetType,
      amount: this.amount,
    };
  }
}

/**
 * dapp 交易 asset 模型
 *
 */
@Type.d("DAppModel")
export class DAppModel extends Message<DAppModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.DAppJSON> {
  static INC = 1;
  /**dapp 的所属链名 */
  @Field.d(DAppModel.INC++, "string")
  sourceChainName!: string;
  /**dapp 的所属链网络标识符 */
  @Field.d(DAppModel.INC++, "string")
  sourceChainMagic!: string;
  /**dapp 的 id */
  @Field.d(DAppModel.INC++, "string")
  dappid!: string;
  /**dapp 的类型 */
  @Field.d(DAppModel.INC++, DAPP_TYPE)
  type!: DAPP_TYPE;
  /**指定购买资产和数量 */
  @Field.d(DAppModel.INC++, DAppPurchaseAssetModel, "optional")
  purchaseAsset?: DAppPurchaseAssetModel;
  toJSON() {
    const res: BFChainCore.DAppJSON = {
      sourceChainName: this.sourceChainName,
      sourceChainMagic: this.sourceChainMagic,
      dappid: this.dappid,
      type: this.type,
    };
    this.purchaseAsset && (res.purchaseAsset = this.purchaseAsset.toJSON());

    return res;
  }
}

/**
 * dapp 交易 asset 外层模型
 *
 */
@Type.d("DAppAssetModel")
export class DAppAssetModel extends Message<DAppAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.DAppAssetJSON> {
  @Field.d(1, DAppModel)
  dapp!: DAppModel;
  toJSON() {
    return {
      dapp: this.dapp.toJSON(),
    };
  }
}
