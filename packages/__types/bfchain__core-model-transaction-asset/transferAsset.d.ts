import { Message } from "@bfchain/protobuf";
export declare class TransferAssetModel extends Message<TransferAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.TransferAssetJSON> {
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
export declare class TransferAssetAssetModel extends Message<TransferAssetAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.TransferAssetAssetJSON> {
    transferAsset: TransferAssetModel;
    toJSON(): {
        transferAsset: {
            sourceChainName: string;
            sourceChainMagic: string;
            assetType: string;
            amount: string;
        };
    };
}
