import { Message } from "@bfchain/protobuf";
import { NumberKeyMap } from "@bfchain/core-model-common";
import { AssetStatisticModel } from "./asset.statistic";
/**
 * 区块资产统计信息
 *
 */
export declare class StatisticInfoModel extends Message<StatisticInfoModel> implements BFChainCore.JSONToModelType<BFChainCore.StatisticInfoJSON> {
    static INC: number;
    /**总手续费 */
    totalFee: string;
    /**总资产数量 */
    totalAsset: string;
    /**总链资产数量 */
    totalChainAsset: string;
    /**涉及的总账户数量 */
    totalAccount: number;
    /**资产信息 */
    assetStatisticHashMap: {
        [index: number]: AssetStatisticModel;
    };
    private _assetStatisticMap?;
    get assetStatisticMap(): NumberKeyMap<AssetStatisticModel>;
    toJSON(): {
        totalFee: string;
        totalAsset: string;
        totalChainAsset: string;
        totalAccount: number;
        assetStatisticHashMap: {
            [x: number]: AssetStatisticModel;
        };
    };
    getBytes(): Uint8Array;
}
//# sourceMappingURL=statisticInfo.d.ts.map