import { Transaction } from "@bfchain/core-model-transaction-base";
import { SetLnsManagerAssetModel } from "@bfchain/core-model-transaction-asset";
export declare class SetLnsManagerTransaction extends Transaction<BFChainCore.SetLnsManagerAssetJSON> implements BFChainCore.SetLnsManagerTransactionJSON {
    toJSON: () => BFChainCore.SetLnsManagerTransactionJSON;
    recipientId: string;
    asset: SetLnsManagerAssetModel;
}
