import { Message } from "@bfchain/protobuf";
import { StringKeyMap } from "@bfchain/core-model-common";
import { CountAndAmountStatisticModel } from "./countAndAmount.statistic";
export declare class AssetStatisticModel extends Message<AssetStatisticModel> implements BFChainCore.JSONToModelType<BFChainCore.AssetStatisticJSON> {
    static INC: number;
    magic: string;
    assetType: string;
    index: number;
    typeStatisticHashMap: {
        [baseType: string]: CountAndAmountStatisticModel;
    };
    _typeStatisticMap?: StringKeyMap<CountAndAmountStatisticModel>;
    get typeStatisticMap(): StringKeyMap<CountAndAmountStatisticModel>;
    total: CountAndAmountStatisticModel;
    toJSON(): {
        magic: string;
        assetType: string;
        index: number;
        typeStatisticHashMap: {
            [baseType: string]: CountAndAmountStatisticModel;
        };
        total: {
            changeAmount: string;
            changeCount: number;
            moveAmount: string;
            transactionCount: number;
        };
    };
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<AssetStatisticModel>): T;
}
//# sourceMappingURL=asset.statistic.d.ts.map