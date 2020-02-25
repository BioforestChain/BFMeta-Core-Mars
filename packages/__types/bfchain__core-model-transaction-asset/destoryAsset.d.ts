import { Message } from "@bfchain/protobuf";
export declare class DestoryAssetModel extends Message<DestoryAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.DestoryAssetJSON> {
    sourceChainName: string;
    sourceChainMagic: string;
    assetType: string;
    amount: string;
    toJSON(): {
        sourceChainName: string;
        sourceChainMagic: string;
        assetType: string;
        amount: string;
    };
}
export declare class DestoryAssetAssetModel extends Message<DestoryAssetAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.DestoryAssetAssetJSON> {
    destoryAsset: DestoryAssetModel;
    toJSON(): {
        destoryAsset: {
            sourceChainName: string;
            sourceChainMagic: string;
            assetType: string;
            amount: string;
        };
    };
}
