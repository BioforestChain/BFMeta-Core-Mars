import { Message } from "@bfchain/protobuf";
/**
 * trustAsset 交易 asset 模型
 *
 */
export declare class TrustAssetModel extends Message<TrustAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.TrustAssetJSON> {
    static INC: number;
    /**托管人地址 */
    trustees: string[];
    /**n 个账户签名，资产才能签收成功 */
    numberOfSignFor: number;
    /**要托管的资产所属链名 */
    sourceChainName: string;
    /**要托管的资产的所属链网络标识符 */
    sourceChainMagic: string;
    /**要托管的资产 */
    assetType: string;
    /**要托管的资产数量 */
    amount: string;
    toJSON(): BFChainCore.TrustAssetJSON;
}
/**
 * trustAsset 交易 asset 外层模型
 *
 */
export declare class TrustAssetAssetModel extends Message<TrustAssetAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.TrustAssetAssetJSON> {
    trustAsset: TrustAssetModel;
    toJSON(): {
        trustAsset: BFChainCore.TrustAssetJSON;
    };
}
//# sourceMappingURL=trustAsset.d.ts.map