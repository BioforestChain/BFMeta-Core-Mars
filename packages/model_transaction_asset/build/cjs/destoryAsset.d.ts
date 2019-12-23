import { Message } from "@bfchain/protobuf";
/**
 * destoryAsset 交易 asset 模型
 *
 */
export declare class DestoryAssetModel extends Message<DestoryAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.DestoryAssetJSON> {
    /**欲销毁的数字资产来源链名 */
    sourceChainName: string;
    /**欲销毁的数字资产来源链网络标识符 */
    sourceChainMagic: string;
    /**欲销毁的数字资产名 */
    assetType: string;
    /**欲销毁的数字资产数量 */
    amount: string;
    toJSON(): {
        sourceChainName: string;
        sourceChainMagic: string;
        assetType: string;
        amount: string;
    };
}
/**
 * destoryAsset 交易 asset 外层模型
 *
 */
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
//# sourceMappingURL=destoryAsset.d.ts.map