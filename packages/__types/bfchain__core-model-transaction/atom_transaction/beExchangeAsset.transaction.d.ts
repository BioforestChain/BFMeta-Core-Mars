import { Transaction } from "@bfchain/core-model-transaction-base";
import { BeExchangeAssetAssetModel } from "@bfchain/core-model-transaction-asset";
export declare class BeExchangeAssetTransaction extends Transaction<BFChainCore.BeExchangeAssetAssetJSON> implements BFChainCore.BeExchangeAssetTransactionJSON {
    toJSON: () => BFChainCore.BeExchangeAssetTransactionJSON;
    recipientId: string;
    asset: BeExchangeAssetAssetModel;
}
