import { Message } from "@bfchain/protobuf";
import { DAppModel } from "./dapp";
/**
 * dappPurchasing 交易 asset 模型
 *
 */
export declare class DAppPurchasingModel extends Message<DAppPurchasingModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.DAppPurchasingJSON> {
    static INC: number;
    /**dapp 的拥有者地址 */
    dappPossessor: string;
    /**要购买的 dapp 数据 */
    dappAsset: DAppModel;
    toJSON(): {
        dappPossessor: string;
        dappAsset: BFChainCore.DAppJSON;
    };
}
/**
 * dappPurchasing 交易 asset 外层模型
 *
 */
export declare class DAppPurchasingAssetModel extends Message<DAppPurchasingAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.DAppPurchasingAssetJSON> {
    dappPurchasing: DAppPurchasingModel;
    toJSON(): {
        dappPurchasing: {
            dappPossessor: string;
            dappAsset: BFChainCore.DAppJSON;
        };
    };
}
//# sourceMappingURL=dappPurchasing.d.ts.map