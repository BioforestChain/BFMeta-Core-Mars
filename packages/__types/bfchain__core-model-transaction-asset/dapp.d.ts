import { Message } from "@bfchain/protobuf";
import { DAPP_TYPE } from "@bfchain/core-model-constants";
export declare class DAppPurchaseAssetModel extends Message<DAppPurchaseAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.DAppPurchaseAssetJSON> {
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
export declare class DAppModel extends Message<DAppModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.DAppJSON> {
    static INC: number;
    sourceChainName: string;
    sourceChainMagic: string;
    dappid: string;
    type: DAPP_TYPE;
    purchaseAsset?: DAppPurchaseAssetModel;
    toJSON(): BFChainCore.DAppJSON;
}
export declare class DAppAssetModel extends Message<DAppAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.DAppAssetJSON> {
    dapp: DAppModel;
    toJSON(): {
        dapp: BFChainCore.DAppJSON;
    };
}
