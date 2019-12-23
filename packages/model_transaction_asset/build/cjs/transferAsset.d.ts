import { Message } from "@bfchain/protobuf";
/**
 * transferAsset 交易 asset 模型
 *
 */
export declare class TransferAssetModel extends Message<TransferAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.TransferAssetJSON> {
    /**欲转账的数字资产所属链名 */
    sourceChainName: string;
    /**欲转账的数字资产所属链网络标识符 */
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
/**
 * transferAsset 交易 asset 外层模型
 *
 */
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
//# sourceMappingURL=transferAsset.d.ts.map