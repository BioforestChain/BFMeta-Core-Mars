import { Message, Field, Type, MapField } from "@bfchain/protobuf";
import { NumberKeyMap } from "@bfchain/core-model-common";
import { cacheBytesGetter } from "@bfchain/core-model-cacher";
import { AssetStatisticModel } from "./asset.statistic";
import { AssetPrealnumModel } from "./assetPrealnum.statistic";

/**
 * 区块资产统计信息
 *
 */
@Type.d("StatisticInfoModel")
export class StatisticInfoModel extends Message<StatisticInfoModel>
  implements BFChainCore.JSONToModelType<BFChainCore.StatisticInfoJSON> {
  static INC = 1;
  /**总手续费 */
  @Field.d(StatisticInfoModel.INC++, "string", "required", "0")
  totalFee!: string;
  /**总资产数量 */
  @Field.d(StatisticInfoModel.INC++, "string", "required", "0")
  totalAsset!: string;
  /**总链资产数量 */
  @Field.d(StatisticInfoModel.INC++, "string", "required", "0")
  totalChainAsset!: string;
  /**涉及的总账户数量 */
  @Field.d(StatisticInfoModel.INC++, "uint32", "required", 0)
  totalAccount!: number;
  /**资产信息 */
  @MapField.d(StatisticInfoModel.INC++, "uint32", AssetStatisticModel)
  assetStatisticHashMap!: { [index: number]: AssetStatisticModel };
  private _assetStatisticMap?: NumberKeyMap<AssetStatisticModel>;
  public get assetStatisticMap() {
    return (
      this._assetStatisticMap ||
      (this._assetStatisticMap = new NumberKeyMap<AssetStatisticModel>(this.assetStatisticHashMap))
    );
  }
  /**涉及的资产权益变动信息 */
  @Field.d(StatisticInfoModel.INC++, AssetPrealnumModel, "repeated", [])
  assetPrealnums!: AssetPrealnumModel[];

  toJSON() {
    return {
      totalFee: this.totalFee,
      totalAsset: this.totalAsset,
      totalChainAsset: this.totalChainAsset,
      totalAccount: this.totalAccount,
      assetStatisticHashMap: this.assetStatisticMap.toJSON(),
      assetPrealnums: this.assetPrealnums.map((assetPrealnum) => assetPrealnum.toJSON()),
    };
  }
  @cacheBytesGetter
  getBytes() {
    return super.getBytes();
  }
}
