import { Message, Field, Type } from "@bfchain/protobuf";

/**
 * trustAsset 交易 asset 模型
 *
 */
@Type.d("TrustAssetModel")
export class TrustAssetModel
  extends Message<TrustAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.TrustAssetJSON>
{
  static INC = 1;
  /**托管人地址 */
  @Field.d(TrustAssetModel.INC++, "string", "repeated")
  trustees!: string[];
  /**n 个账户签名，资产才能签收成功 */
  @Field.d(TrustAssetModel.INC++, "uint32")
  numberOfSignFor!: number;
  /**要托管的资产所属链名 */
  @Field.d(TrustAssetModel.INC++, "string")
  sourceChainName!: string;
  /**要托管的资产的所属链网络标识符 */
  @Field.d(TrustAssetModel.INC++, "string")
  sourceChainMagic!: string;
  /**要托管的资产 */
  @Field.d(TrustAssetModel.INC++, "string")
  assetType!: string;
  /**要托管的资产数量 */
  @Field.d(TrustAssetModel.INC++, "string")
  amount!: string;
  toJSON() {
    const res: BFChainCore.TrustAssetJSON = {
      trustees: this.trustees,
      numberOfSignFor: this.numberOfSignFor,
      sourceChainName: this.sourceChainName,
      sourceChainMagic: this.sourceChainMagic,
      assetType: this.assetType,
      amount: this.amount,
    };
    return res;
  }
}

/**
 * trustAsset 交易 asset 外层模型
 *
 */
@Type.d("TrustAssetAssetModel")
export class TrustAssetAssetModel
  extends Message<TrustAssetAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.TrustAssetAssetJSON>
{
  @Field.d(1, TrustAssetModel)
  trustAsset!: TrustAssetModel;
  toJSON() {
    return {
      trustAsset: this.trustAsset.toJSON(),
    };
  }
}
