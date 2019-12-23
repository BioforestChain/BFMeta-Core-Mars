import { Message } from "@bfchain/protobuf";
/**
 * issueAsset 交易 asset 模型
 *
 */
export declare class IssueAssetModel extends Message<IssueAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.IssueAssetJSON> {
    /**发行的资产所属的链名 */
    sourceChainName: string;
    /**发行的资产所属的链网络标识符 */
    sourceChainMagic: string;
    /**发行的数字资产的缩写 */
    assetType: string;
    /**计划发行的数字资产数量 */
    expectedIssuedAssets: string;
    /**发行的数字资产的创世账户地址 */
    genesisAddress: string;
    toJSON(): {
        sourceChainName: string;
        sourceChainMagic: string;
        assetType: string;
        expectedIssuedAssets: string;
        genesisAddress: string;
    };
}
/**
 * issueAsset 交易 asset 外层模型
 *
 */
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
//# sourceMappingURL=issueAsset.d.ts.map