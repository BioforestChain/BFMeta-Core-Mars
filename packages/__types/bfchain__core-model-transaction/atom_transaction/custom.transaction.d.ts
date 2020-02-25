import { Transaction } from "@bfchain/core-model-transaction-base";
import { CustomAssetModel } from "@bfchain/core-model-transaction-asset";
export declare class CustomTransaction extends Transaction<BFChainCore.CustomAssetJSON> {
    asset: CustomAssetModel;
}
