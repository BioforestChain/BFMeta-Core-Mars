import { Message } from "@bfchain/protobuf";
export declare class TrustAssetModel extends Message<TrustAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.TrustAssetJSON> {
    static INC: number;
    trustees: string[];
    numberOfSignFor: number;
    sourceChainName: string;
    sourceChainMagic: string;
    assetType: string;
    amount: string;
    toJSON(): BFChainCore.TrustAssetJSON;
}
export declare class TrustAssetAssetModel extends Message<TrustAssetAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.TrustAssetAssetJSON> {
    trustAsset: TrustAssetModel;
    toJSON(): {
        trustAsset: BFChainCore.TrustAssetJSON;
    };
}
