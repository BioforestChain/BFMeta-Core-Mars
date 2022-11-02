import { Message, Field, Type, MapField } from "@bfchain/protobuf";
import { StringKeyMap } from "@bfchain/core-model-common";
import { cacheBytesGetter } from "@bfchain/core-model-cacher";
import { AssetTypeAssetStatisticModel } from "./asset.statistic";
import { assetStatisticformat } from "./assetStatisticformat";

/**
 * 区块资产统计信息
 *
 */
@Type.d("StatisticInfoModel")
export class StatisticInfoModel
  extends Message<StatisticInfoModel>
  implements BFChainCore.JSONToModelType<BFChainCore.StatisticInfoJSON>
{
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
  @MapField.d(StatisticInfoModel.INC++, "string", AssetTypeAssetStatisticModel)
  magicAssetTypeTypeStatisticHashMap!: { [assetType: string]: AssetTypeAssetStatisticModel };
  _magicAssetTypeTypeStatisticMap?: StringKeyMap<AssetTypeAssetStatisticModel>;
  get magicAssetTypeTypeStatisticMap() {
    return (
      this._magicAssetTypeTypeStatisticMap ||
      (this._magicAssetTypeTypeStatisticMap = new StringKeyMap<AssetTypeAssetStatisticModel>(
        this.magicAssetTypeTypeStatisticHashMap,
      ))
    );
  }

  toJSON() {
    return {
      totalFee: this.totalFee,
      totalAsset: this.totalAsset,
      totalChainAsset: this.totalChainAsset,
      totalAccount: this.totalAccount,
      magicAssetTypeTypeStatisticHashMap: this.magicAssetTypeTypeStatisticMap.toJSON(),
    };
  }
  @cacheBytesGetter
  getBytes() {
    return super.getBytes();
  }

  format() {
    assetStatisticformat(
      this.magicAssetTypeTypeStatisticHashMap,
      this.magicAssetTypeTypeStatisticMap,
      (argv) => argv.format(),
    );
    return this;
  }
}
