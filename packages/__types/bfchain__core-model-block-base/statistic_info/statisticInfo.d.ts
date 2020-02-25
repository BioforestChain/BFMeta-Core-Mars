import { Message } from "@bfchain/protobuf";
import { NumberKeyMap } from "@bfchain/core-model-common";
import { AssetStatisticModel } from "./asset.statistic";
export declare class StatisticInfoModel extends Message<StatisticInfoModel> implements BFChainCore.JSONToModelType<BFChainCore.StatisticInfoJSON> {
    static INC: number;
    totalFee: string;
    totalAsset: string;
    totalChainAsset: string;
    totalAccount: number;
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
