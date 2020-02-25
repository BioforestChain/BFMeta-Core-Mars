import { Message } from "@bfchain/protobuf";
import { DAppModel } from "./dapp";
export declare class DAppPurchasingModel extends Message<DAppPurchasingModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.DAppPurchasingJSON> {
    static INC: number;
    dappPossessor: string;
    dappAsset: DAppModel;
    toJSON(): {
        dappPossessor: string;
        dappAsset: BFChainCore.DAppJSON;
    };
}
export declare class DAppPurchasingAssetModel extends Message<DAppPurchasingAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.DAppPurchasingAssetJSON> {
    dappPurchasing: DAppPurchasingModel;
    toJSON(): {
        dappPurchasing: {
            dappPossessor: string;
            dappAsset: BFChainCore.DAppJSON;
        };
    };
}
