import { Message } from "@bfchain/protobuf";
export declare class IssueAssetModel extends Message<IssueAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.IssueAssetJSON> {
    sourceChainName: string;
    sourceChainMagic: string;
    assetType: string;
    expectedIssuedAssets: string;
    genesisAddress: string;
    toJSON(): {
        sourceChainName: string;
        sourceChainMagic: string;
        assetType: string;
        expectedIssuedAssets: string;
        genesisAddress: string;
    };
}
export declare class IssueAssetAssetModel extends Message<IssueAssetAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.IssueAssetAssetJSON> {
    issueAsset: IssueAssetModel;
    toJSON(): {
        issueAsset: {
            sourceChainName: string;
            sourceChainMagic: string;
            assetType: string;
            expectedIssuedAssets: string;
            genesisAddress: string;
        };
    };
}
