import { Message } from "@bfchain/protobuf";
import { DAPP_TYPE } from "@bfchain/core-model-constants";
export declare class DAppPurchaseAssetModel extends Message<DAppPurchaseAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.DAppPurchaseAssetJSON> {
    /**购买用的资产所属链名 */
    sourceChainName: string;
    /**购买用的资产所属链网络标识符 */
    sourceChainMagic: string;
    /**购买用的资产所属链网络标识符 */
    assetType: string;
    /**购买用的资产所属链网络标识符 */
    amount: string;
    toJSON(): {
        sourceChainName: string;
        sourceChainMagic: string;
        assetType: string;
        amount: string;
    };
}
/**
 * dapp 交易 asset 模型
 *
 */
export declare class DAppModel extends Message<DAppModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.DAppJSON> {
    static INC: number;
    /**dapp 的所属链名 */
    sourceChainName: string;
    /**dapp 的所属链网络标识符 */
    sourceChainMagic: string;
    /**dapp 的 id */
    dappid: string;
    /**dapp 的类型 */
    type: DAPP_TYPE;
    /**指定购买资产和数量 */
    purchaseAsset?: DAppPurchaseAssetModel;
    toJSON(): BFChainCore.DAppJSON;
}
/**
 * dapp 交易 asset 外层模型
 *
 */
export declare class DAppAssetModel extends Message<DAppAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.DAppAssetJSON> {
    dapp: DAppModel;
    toJSON(): {
        dapp: BFChainCore.DAppJSON;
    };
}
//# sourceMappingURL=dapp.d.ts.map